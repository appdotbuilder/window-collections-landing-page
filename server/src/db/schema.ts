import { serial, text, pgTable, timestamp, numeric, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const windowCollectionsTable = pgTable('window_collections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  main_image_url: text('main_image_url').notNull(),
  brand_name: text('brand_name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const windowsTable = pgTable('windows', {
  id: serial('id').primaryKey(),
  collection_id: integer('collection_id').notNull().references(() => windowCollectionsTable.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  main_image_url: text('main_image_url').notNull(),
  gallery_image_urls: jsonb('gallery_image_urls').notNull().default('[]'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const windowCollectionsRelations = relations(windowCollectionsTable, ({ many }) => ({
  windows: many(windowsTable),
}));

export const windowsRelations = relations(windowsTable, ({ one }) => ({
  collection: one(windowCollectionsTable, {
    fields: [windowsTable.collection_id],
    references: [windowCollectionsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type WindowCollection = typeof windowCollectionsTable.$inferSelect;
export type NewWindowCollection = typeof windowCollectionsTable.$inferInsert;
export type Window = typeof windowsTable.$inferSelect;
export type NewWindow = typeof windowsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  windowCollections: windowCollectionsTable,
  windows: windowsTable 
};