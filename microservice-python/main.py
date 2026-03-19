import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini Client with the NEW SDK
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No GEMINI_API_KEY found in .env file")

client = genai.Client(api_key=api_key)

app = FastAPI()

# 1. Define what the incoming data should look like
class TicketRequest(BaseModel):
    ticket_text: str

# 2. The AI processing endpoint
@app.post("/analyze-ticket")
async def analyze_ticket(request: TicketRequest):
    try:
        # The exact instructions we give to Gemini
        prompt = f"""
        You are an expert customer support AI. Analyze the following support ticket:
        "{request.ticket_text}"
        
        The JSON must have these exact three keys:
        - "category": (Classify as: Billing, Technical, Account, or General)
        - "sentiment": (Classify as: Positive, Neutral, Frustrated, or Angry)
        - "reply": (Draft a polite, professional 2-sentence response to the customer)
        """

        # Call the Gemini API using the new SDK syntax
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json", # This forces strict JSON!
            ),
        )
        
        # Because we forced JSON mime type, we can safely load it right away
        ai_data = json.loads(response.text)
        
        return ai_data

    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process ticket with AI")

# A simple route to check if the server is awake
@app.get("/")
def read_root():
    return {"status": "AI Microservice is running cleanly!"}