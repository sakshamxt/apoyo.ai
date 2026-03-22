import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';

const vector = customType({
  dataType(config) {
    return `vector(${config.dimensions})`;
  },
});

export const tickets = pgTable('tickets', {
    id: serial('id').primaryKey(),
    customerName: varchar('customer_name', { length: 100 }).notNull(),
    ticketText: text('ticket_text').notNull(),
    status: varchar('status', { length: 50 }).default('Pending'),
    aiCategory: varchar('ai_category', { length: 100 }),
    aiSentiment: varchar('ai_sentiment', { length: 50 }),
    aiReply: text('ai_reply'),
    createdAt: timestamp('created_at').defaultNow(),
});


export const companyDocuments = pgTable('company_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at').defaultNow()
});