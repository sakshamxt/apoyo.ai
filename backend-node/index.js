import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { db } from './src/db/index.js';
import { tickets } from './src/db/schema.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/tickets', async (req, res) => {
  try {
    const { customerName, ticketText } = req.body;

    const insertedTicket = await db.insert(tickets).values({
      customerName: customerName,
      ticketText: ticketText
    }).returning();

    const ticketId = insertedTicket[0].id;

    console.log(`Ticket #${ticketId} saved. Sending to AI for analysis...`);

    const aiResponse = await fetch('http://127.0.0.1:8000/analyze-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_text: ticketText })
    });

    if (!aiResponse.ok) {
        throw new Error("AI Microservice failed to respond properly");
    }

    const aiData = await aiResponse.json();
    console.log("AI Analysis received:", aiData);

    const updatedTicket = await db.update(tickets)
      .set({
        status: 'Processed',
        aiCategory: aiData.category,
        aiSentiment: aiData.sentiment,
        aiReply: aiData.reply
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    res.status(201).json({
      message: "Ticket saved and analyzed successfully!",
      ticket: updatedTicket[0]
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to process ticket system" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});