import { pgTable, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { ulid } from 'ulid'
import { users } from './users.js'

export const templates = pgTable('templates', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull().unique(), // UUID-based
  filepath: varchar('filepath', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  isFreePreview: boolean('is_free_preview').default(false).notNull(),
  uploadedBy: varchar('uploaded_by', { length: 26 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})
