import { pgTable, varchar, timestamp, integer, numeric } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'

export const portfolioHoldings = pgTable('portfolio_holdings', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  stockSymbol: varchar('stock_symbol', { length: 20 }).notNull(),
  stockName: varchar('stock_name', { length: 255 }).notNull(),
  logoUrl: varchar('logo_url', { length: 512 }),
  avgBuyPrice: numeric('avg_buy_price', { precision: 12, scale: 2 }).notNull(),
  currentPrice: numeric('current_price', { precision: 12, scale: 2 }).notNull(),
  totalShares: integer('total_shares').notNull(),
  allocationPercent: numeric('allocation_percent', { precision: 5, scale: 2 }).notNull(), // e.g. 50.00
  sortOrder: integer('sort_order').default(0).notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
