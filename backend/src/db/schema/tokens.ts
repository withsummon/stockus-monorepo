import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const tokens = pgTable('tokens', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  userId: varchar('user_id', { length: 26 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'email_verification' | 'password_reset'
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hash
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
