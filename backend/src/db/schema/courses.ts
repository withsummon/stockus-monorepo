import { pgTable, varchar, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { ulid } from 'ulid'

export const contentStatusEnum = pgEnum('content_status', ['published', 'archived'])

export const courses = pgTable('courses', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  content: text('content').notNull(), // HTML content
  status: contentStatusEnum('status').default('published').notNull(),
  isFreePreview: boolean('is_free_preview').default(false).notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const courseSessions = pgTable('course_sessions', {
  id: varchar('id', { length: 26 }).primaryKey().$defaultFn(() => ulid()),
  courseId: varchar('course_id', { length: 26 }).notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  sessionOrder: integer('session_order').notNull(),
  durationMinutes: integer('duration_minutes'),
  videoUrl: varchar('video_url', { length: 500 }), // For Phase 5
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
  sessions: many(courseSessions),
}))

export const courseSessionsRelations = relations(courseSessions, ({ one }) => ({
  course: one(courses, {
    fields: [courseSessions.courseId],
    references: [courses.id],
  }),
}))
