import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const admins = pgTable('admins', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  userId: varchar('user_id', { length: 26 }).notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})
