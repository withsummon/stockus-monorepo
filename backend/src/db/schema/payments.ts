import { pgTable, varchar, timestamp, text, integer, pgEnum } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund'
])

export const paymentTypeEnum = pgEnum('payment_type', [
  'subscription', 'workshop'
])

export const payments = pgTable('payments', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  userId: varchar('user_id', { length: 26 }).notNull().references(() => users.id),

  // Midtrans identifiers (unique for idempotency)
  midtransOrderId: varchar('midtrans_order_id', { length: 100 }).notNull().unique(),
  midtransTransactionId: varchar('midtrans_transaction_id', { length: 100 }).unique(),

  // Payment details
  type: paymentTypeEnum('type').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  amount: integer('amount').notNull(), // In IDR (smallest unit)

  // Optional references (workshopId references cohorts.id - cohorts serve as "workshops")
  workshopId: varchar('workshop_id', { length: 26 }), // If type = 'workshop' (references cohorts.id)
  promoCodeId: varchar('promo_code_id', { length: 26 }), // If promo applied
  referralId: varchar('referral_id', { length: 26 }), // If referral code used

  // Midtrans response data
  paymentMethod: varchar('payment_method', { length: 50 }),
  rawResponse: text('raw_response'), // JSON string of full webhook data

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  paidAt: timestamp('paid_at', { mode: 'date' }),
})
