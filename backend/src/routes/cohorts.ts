import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, isNull, desc } from 'drizzle-orm'

import { db } from '../db/index.js'
import { cohorts, cohortSessions } from '../db/schema/index.js'
import { authMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'

// Validation schemas
const createCohortSchema = z.object({
  courseId: z.string().length(26), // ULID
  name: z.string().min(1).max(255),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  enrollmentOpenDate: z.string().datetime(),
  enrollmentCloseDate: z.string().datetime(),
  maxParticipants: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(), // IDR for workshops
})

const updateCohortSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  enrollmentOpenDate: z.string().datetime().optional(),
  enrollmentCloseDate: z.string().datetime().optional(),
  status: z.enum(['upcoming', 'open', 'closed', 'completed']).optional(),
  maxParticipants: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(),
})

const createSessionSchema = z.object({
  courseSessionId: z.string().length(26).optional(), // ULID
  title: z.string().min(1).max(255),
  scheduledAt: z.string().datetime(),
  zoomLink: z.string().url().max(500).optional(),
  sessionOrder: z.number().int().positive(),
})

const updateSessionSchema = z.object({
  courseSessionId: z.string().length(26).optional(), // ULID
  title: z.string().min(1).max(255).optional(),
  scheduledAt: z.string().datetime().optional(),
  zoomLink: z.string().url().max(500).optional(),
  recordingUrl: z.string().url().max(500).optional(),
  sessionOrder: z.number().int().positive().optional(),
})

const cohorts_router = new Hono<AuthEnv>()

/**
 * GET /cohorts
 * List all active cohorts (auth required)
 */
cohorts_router.get('/', authMiddleware, async (c) => {
  const cohortsList = await db.query.cohorts.findMany({
    where: isNull(cohorts.deletedAt),
    orderBy: [desc(cohorts.createdAt)],
    with: {
      course: {
        columns: {
          id: true,
          title: true,
          slug: true,
        }
      }
    }
  })

  return c.json({ cohorts: cohortsList })
})

/**
 * GET /cohorts/:id
 * Get cohort details with sessions (auth required)
 */
cohorts_router.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  const cohort = await db.query.cohorts.findFirst({
    where: and(
      eq(cohorts.id, id),
      isNull(cohorts.deletedAt)
    ),
    with: {
      course: {
        columns: {
          id: true,
          title: true,
          slug: true,
          description: true,
        }
      },
      sessions: {
        orderBy: (sessions, { asc }) => [asc(sessions.sessionOrder)]
      }
    }
  })

  if (!cohort) {
    return c.json({ error: 'Cohort not found' }, 404)
  }

  return c.json({ cohort })
})

/**
 * POST /cohorts
 * Create new cohort (admin only)
 */
cohorts_router.post('/', authMiddleware, requireAdmin(), zValidator('json', createCohortSchema), async (c) => {
  const data = c.req.valid('json')

  // Convert ISO strings to Date objects
  const cohortData = {
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    enrollmentOpenDate: new Date(data.enrollmentOpenDate),
    enrollmentCloseDate: new Date(data.enrollmentCloseDate),
  }

  // Verify course exists
  const course = await db.query.courses.findFirst({
    where: eq(cohorts.courseId, data.courseId),
  })

  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }

  // Create cohort
  const [cohort] = await db.insert(cohorts).values(cohortData).returning()

  return c.json({ cohort }, 201)
})

/**
 * PATCH /cohorts/:id
 * Update cohort (admin only)
 */
cohorts_router.patch('/:id', authMiddleware, requireAdmin(), zValidator('json', updateCohortSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')

  // Check cohort exists and not deleted
  const existing = await db.query.cohorts.findFirst({
    where: and(
      eq(cohorts.id, id),
      isNull(cohorts.deletedAt)
    ),
  })

  if (!existing) {
    return c.json({ error: 'Cohort not found' }, 404)
  }

  // Convert ISO strings to Date objects if present
  const updateData: any = { ...data }
  if (data.startDate) updateData.startDate = new Date(data.startDate)
  if (data.endDate) updateData.endDate = new Date(data.endDate)
  if (data.enrollmentOpenDate) updateData.enrollmentOpenDate = new Date(data.enrollmentOpenDate)
  if (data.enrollmentCloseDate) updateData.enrollmentCloseDate = new Date(data.enrollmentCloseDate)

  updateData.updatedAt = new Date()

  // Update cohort
  const [cohort] = await db.update(cohorts)
    .set(updateData)
    .where(eq(cohorts.id, id))
    .returning()

  return c.json({ cohort })
})

/**
 * DELETE /cohorts/:id
 * Soft delete cohort (admin only)
 */
cohorts_router.delete('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  // Check cohort exists and not already deleted
  const existing = await db.query.cohorts.findFirst({
    where: and(
      eq(cohorts.id, id),
      isNull(cohorts.deletedAt)
    ),
  })

  if (!existing) {
    return c.json({ error: 'Cohort not found' }, 404)
  }

  // Soft delete
  await db.update(cohorts)
    .set({ deletedAt: new Date() })
    .where(eq(cohorts.id, id))

  return c.json({ message: 'Cohort deleted successfully' })
})

/**
 * POST /cohorts/:cohortId/sessions
 * Add session to cohort (admin only)
 */
cohorts_router.post('/:cohortId/sessions', authMiddleware, requireAdmin(), zValidator('json', createSessionSchema), async (c) => {
  const cohortId = c.req.param('cohortId')
  const data = c.req.valid('json')

  // Verify cohort exists and not deleted
  const cohort = await db.query.cohorts.findFirst({
    where: and(
      eq(cohorts.id, cohortId),
      isNull(cohorts.deletedAt)
    ),
  })

  if (!cohort) {
    return c.json({ error: 'Cohort not found' }, 404)
  }

  // Convert ISO string to Date object
  const sessionData = {
    ...data,
    cohortId,
    scheduledAt: new Date(data.scheduledAt),
  }

  // Create session
  const [session] = await db.insert(cohortSessions).values(sessionData).returning()

  return c.json({ session }, 201)
})

/**
 * PATCH /cohorts/:cohortId/sessions/:sessionId
 * Update cohort session (admin only)
 */
cohorts_router.patch('/:cohortId/sessions/:sessionId', authMiddleware, requireAdmin(), zValidator('json', updateSessionSchema), async (c) => {
  const cohortId = c.req.param('cohortId')
  const sessionId = c.req.param('sessionId')
  const data = c.req.valid('json')

  // Verify session exists and belongs to cohort
  const existing = await db.query.cohortSessions.findFirst({
    where: and(
      eq(cohortSessions.id, sessionId),
      eq(cohortSessions.cohortId, cohortId)
    ),
  })

  if (!existing) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Convert ISO string to Date if present
  const updateData: any = { ...data }
  if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt)

  // Update session
  const [session] = await db.update(cohortSessions)
    .set(updateData)
    .where(eq(cohortSessions.id, sessionId))
    .returning()

  return c.json({ session })
})

/**
 * DELETE /cohorts/:cohortId/sessions/:sessionId
 * Delete cohort session (admin only)
 */
cohorts_router.delete('/:cohortId/sessions/:sessionId', authMiddleware, requireAdmin(), async (c) => {
  const cohortId = c.req.param('cohortId')
  const sessionId = c.req.param('sessionId')

  // Verify session exists and belongs to cohort
  const existing = await db.query.cohortSessions.findFirst({
    where: and(
      eq(cohortSessions.id, sessionId),
      eq(cohortSessions.cohortId, cohortId)
    ),
  })

  if (!existing) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Hard delete session
  await db.delete(cohortSessions).where(eq(cohortSessions.id, sessionId))

  return c.json({ message: 'Session deleted successfully' })
})

export const cohortRoutes = cohorts_router
