import { pgTable, integer, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund'
])

export const paymentTypeEnum = pgEnum('payment_type', [
  'subscription', 'workshop'
])

export const payments = pgTable('payments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),

  // Midtrans identifiers (unique for idempotency)
  midtransOrderId: varchar('midtrans_order_id', { length: 100 }).notNull().unique(),
  midtransTransactionId: varchar('midtrans_transaction_id', { length: 100 }).unique(),

  // Payment details
  type: paymentTypeEnum('type').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  amount: integer('amount').notNull(), // In IDR (smallest unit)

  // Optional references (workshopId references cohorts.id - cohorts serve as "workshops")
  workshopId: integer('workshop_id'), // If type = 'workshop' (references cohorts.id)
  promoCodeId: integer('promo_code_id'), // If promo applied
  referralId: integer('referral_id'), // If referral code used

  // Midtrans response data
  paymentMethod: varchar('payment_method', { length: 50 }),
  rawResponse: text('raw_response'), // JSON string of full webhook data

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  paidAt: timestamp('paid_at', { mode: 'date' }),
})
