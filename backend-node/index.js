import express from 'express';
import cors from 'cors';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import { db } from './src/db/index.js';
import { tickets } from './src/db/schema.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/tickets', async (req, res) => {
  try {
    const { customerName, ticketText } = req.body;

    // Just insert the raw ticket. 
    // The database schema will automatically set the status to 'Pending'
    const insertedTicket = await db.insert(tickets).values({
      customerName: customerName,
      ticketText: ticketText
    }).returning();

    console.log(`New Ticket #${insertedTicket[0].id} saved as Pending!`);

    res.status(201).json({
      message: "Ticket saved successfully!",
      ticket: insertedTicket[0]
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to save ticket" });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: "Invalid Ticket ID format" });
    }

    const result = await db.select().from(tickets).where(eq(tickets.id, ticketId));

    if (result.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});