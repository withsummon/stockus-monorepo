import { pgTable, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'expired', 'cancelled'
])

export const subscriptions = pgTable('subscriptions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),

  status: subscriptionStatusEnum('status').notNull().default('active'),

  // Payment reference
  paymentId: integer('payment_id'), // Links to original payment

  // Subscription period
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
