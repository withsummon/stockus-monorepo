import { pgTable, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const promoCodes = pgTable('promo_codes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  // Code details
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g., "NEWYEAR2026"
  description: varchar('description', { length: 255 }),

  // Discount configuration
  discountPercent: integer('discount_percent').notNull(), // 0-100

  // Usage limits
  maxUses: integer('max_uses'), // null = unlimited
  currentUses: integer('current_uses').notNull().default(0),

  // Validity period
  validFrom: timestamp('valid_from', { mode: 'date' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }),

  // Status
  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
