import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  userId: varchar('user_id', { length: 26 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hash
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
