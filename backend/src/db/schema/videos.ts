import { pgTable, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { ulid } from 'ulid'
import { courseSessions } from './courses.js'
import { users } from './users.js'

/**
 * Video metadata table
 * Stores information about uploaded videos and links to R2 storage
 */
export const videos = pgTable('videos', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  r2Key: varchar('r2_key', { length: 500 }).notNull().unique(), // R2 object key
  contentType: varchar('content_type', { length: 100 }).notNull(), // e.g., 'video/mp4'
  sizeBytes: integer('size_bytes').notNull(),
  durationSeconds: integer('duration_seconds'), // Optional video length
  sessionId: varchar('session_id', { length: 26 }).references(() => courseSessions.id, { onDelete: 'set null' }), // Link to course session
  uploadedBy: varchar('uploaded_by', { length: 26 }).notNull().references(() => users.id),
  deletedAt: timestamp('deleted_at', { mode: 'date' }), // Soft delete pattern
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

/**
 * Video relations
 * - session: Optional link to course session
 * - uploader: User who uploaded the video (admin)
 */
export const videosRelations = relations(videos, ({ one }) => ({
  session: one(courseSessions, {
    fields: [videos.sessionId],
    references: [courseSessions.id],
  }),
  uploader: one(users, {
    fields: [videos.uploadedBy],
    references: [users.id],
  }),
}))
