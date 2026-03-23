import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No GEMINI_API_KEY found in .env file")
client = genai.Client(api_key=api_key)

# Configure Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("Supabase credentials missing in .env file")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

# Data Models
class TicketRequest(BaseModel):
    ticket_text: str

class DocumentRequest(BaseModel):
    title: str
    content: str

# ---------------------------------------------------------
# ENDPOINT 1: Upload a Company Policy (The Memory Builder)
# ---------------------------------------------------------
@app.post("/upload-document")
async def upload_document(doc: DocumentRequest):
    try:
        # 1. Ask Gemini to turn the text into 768 numbers (Embeddings)
        result = client.models.embed_content(
            model='gemini-embedding-001',
            contents=doc.content,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        embedding_data = result.embeddings[0].values

        # 2. Save the text AND the numbers to Supabase
        supabase.table("company_documents").insert({
            "title": doc.title,
            "content": doc.content,
            "embedding": embedding_data
        }).execute()

        return {"message": f"Successfully memorized document: {doc.title}"}
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document")

# ---------------------------------------------------------
# ENDPOINT 2: Analyze Ticket with RAG (The Smart Brain)
# ---------------------------------------------------------
@app.post("/analyze-ticket")
async def analyze_ticket(request: TicketRequest):
    try:
        # 1. Turn the angry customer ticket into numbers
        embed_result = client.models.embed_content(
            model='gemini-embedding-001',
            contents=request.ticket_text,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        query_embedding = embed_result.embeddings[0].values

        # 2. Search Supabase for the most relevant company policy
        search_response = supabase.rpc("match_documents", {
            "query_embedding": query_embedding,
            "match_threshold": 0.4, # 0.4 means "fairly similar"
            "match_count": 1        # Only grab the best 1 matching document
        }).execute()

        # 3. Build the Context for the AI
        context_string = ""
        if search_response.data and len(search_response.data) > 0:
            matched_doc = search_response.data[0]
            context_string = f"COMPANY POLICY TO FOLLOW - {matched_doc['title']}: {matched_doc['content']}"
        else:
            context_string = "No specific company policy found. Provide a polite, general apology and say an agent will look into it."

        # 4. The RAG Prompt (Notice how we inject the context!)
        prompt = f"""
        You are an expert customer support AI. 
        
        {context_string}
        
        Analyze the following support ticket:
        "{request.ticket_text}"
        
        Respond with ONLY JSON containing these exact three keys:
        - "category": (Classify as: Billing, Technical, Account, or General)
        - "sentiment": (Classify as: Positive, Neutral, Frustrated, or Angry)
        - "reply": (Draft a polite 2-sentence response based STRICTLY on the COMPANY POLICY provided above.)
        """

        # 5. Ask Gemini for the final answer
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        return json.loads(response.text)

    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process ticket with AI")