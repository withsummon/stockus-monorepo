import { pgTable, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const images = pgTable('images', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull().unique(), // UUID-based
  filepath: varchar('filepath', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  alt: text('alt'),
  description: text('description'),
  uploadedBy: varchar('uploaded_by', { length: 26 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})
