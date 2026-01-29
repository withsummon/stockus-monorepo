import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { contentStatusEnum } from './courses.js'

export const researchReports = pgTable('research_reports', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: text('summary').notNull(),
  content: text('content').notNull(), // HTML content
  publishedAt: timestamp('published_at', { mode: 'date' }).defaultNow().notNull(),
  status: contentStatusEnum('status').default('published').notNull(),
  isFreePreview: boolean('is_free_preview').default(false).notNull(),
  // Stock analysis fields
  stockSymbol: varchar('stock_symbol', { length: 20 }),
  stockName: varchar('stock_name', { length: 255 }),
  analystRating: varchar('analyst_rating', { length: 50 }),
  targetPrice: integer('target_price'),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
