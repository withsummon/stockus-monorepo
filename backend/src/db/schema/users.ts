import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'

export const users = pgTable('users', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  tier: varchar('tier', { length: 20 }).default('free').notNull(), // 'anonymous' | 'free' | 'member'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
