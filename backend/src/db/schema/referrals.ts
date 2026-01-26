import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users.js'

export const referrals = pgTable('referrals', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id).unique(), // Each user has one code

  // The referral code (auto-generated on member signup)
  code: varchar('code', { length: 20 }).notNull().unique(),

  // Stats
  totalUses: integer('total_uses').notNull().default(0),
  rewardsEarned: integer('rewards_earned').notNull().default(0), // In IDR

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const referralUsages = pgTable('referral_usages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  referralId: integer('referral_id').notNull().references(() => referrals.id),
  newUserId: integer('new_user_id').notNull().references(() => users.id),
  paymentId: integer('payment_id'), // Links to the payment that triggered reward
  rewardAmount: integer('reward_amount').notNull(), // In IDR

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// Drizzle relations
export const referralsRelations = relations(referrals, ({ one, many }) => ({
  user: one(users, {
    fields: [referrals.userId],
    references: [users.id],
  }),
  usages: many(referralUsages),
}))

export const referralUsagesRelations = relations(referralUsages, ({ one }) => ({
  referral: one(referrals, {
    fields: [referralUsages.referralId],
    references: [referrals.id],
  }),
  newUser: one(users, {
    fields: [referralUsages.newUserId],
    references: [users.id],
  }),
}))
