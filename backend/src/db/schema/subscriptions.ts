import { pgTable, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'expired', 'cancelled'
])

export const subscriptions = pgTable('subscriptions', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  userId: varchar('user_id', { length: 26 }).notNull().references(() => users.id),

  status: subscriptionStatusEnum('status').notNull().default('active'),

  // Payment reference
  paymentId: varchar('payment_id', { length: 26 }), // Links to original payment

  // Subscription period
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})
