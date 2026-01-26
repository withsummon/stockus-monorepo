import { pgTable, serial, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { courses, courseSessions } from './courses.js'

export const cohortStatusEnum = pgEnum('cohort_status', ['upcoming', 'open', 'closed', 'completed'])

export const cohorts = pgTable('cohorts', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  enrollmentOpenDate: timestamp('enrollment_open_date', { mode: 'date' }).notNull(),
  enrollmentCloseDate: timestamp('enrollment_close_date', { mode: 'date' }).notNull(),
  status: cohortStatusEnum('status').default('upcoming').notNull(),
  maxParticipants: integer('max_participants'),
  price: integer('price'), // Price in IDR for workshop payment (null = included in subscription)
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const cohortSessions = pgTable('cohort_sessions', {
  id: serial('id').primaryKey(),
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  courseSessionId: integer('course_session_id').references(() => courseSessions.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  scheduledAt: timestamp('scheduled_at', { mode: 'date' }).notNull(),
  zoomLink: varchar('zoom_link', { length: 500 }),
  recordingUrl: varchar('recording_url', { length: 500 }),
  sessionOrder: integer('session_order').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// Relations
export const cohortsRelations = relations(cohorts, ({ one, many }) => ({
  course: one(courses, {
    fields: [cohorts.courseId],
    references: [courses.id],
  }),
  sessions: many(cohortSessions),
}))

export const cohortSessionsRelations = relations(cohortSessions, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortSessions.cohortId],
    references: [cohorts.id],
  }),
  courseSession: one(courseSessions, {
    fields: [cohortSessions.courseSessionId],
    references: [courseSessions.id],
  }),
}))
