import { pgTable, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'

export const watchlistCategoryEnum = pgEnum('watchlist_category', ['swing', 'short_term', 'long_term'])

export const watchlistStocks = pgTable('watchlist_stocks', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  stockSymbol: varchar('stock_symbol', { length: 20 }).notNull(),
  stockName: varchar('stock_name', { length: 255 }).notNull(),
  logoUrl: varchar('logo_url', { length: 512 }),
  category: watchlistCategoryEnum('category').notNull(),
  entryPrice: integer('entry_price'), // in cents/smallest unit
  targetPrice: integer('target_price'),
  stopLoss: integer('stop_loss'),
  currentPrice: integer('current_price'),
  analystRating: varchar('analyst_rating', { length: 50 }),
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0).notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
