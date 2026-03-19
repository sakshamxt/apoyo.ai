import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const tickets = pgTable('tickets', {
    id: serial('id').primaryKey(),
    customerName: varchar('customer_name', { length: 100 }).notNull(),
    ticketText: text('ticket_text').notNull(),
    status: varchar('status', { length: 50 }).default('Unprocessed'),
    aiCategory: varchar('ai_category', { length: 100 }),
    aiSentiment: varchar('ai_sentiment', { length: 50 }),
    aiReply: text('ai_reply'),
    createdAt: timestamp('created_at').defaultNow(),
});