import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/index.js'
import { courses, courseSessions } from '../db/schema/index.js'
import { authMiddleware, requireAdmin, requireTier, AuthEnv } from '../middleware/auth.js'
import { generateSlug, createUniqueSlug } from '../utils/slug.js'
import { eq, desc, isNull, and, asc } from 'drizzle-orm'

const createCourseSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  content: z.string().optional(), // HTML content
  thumbnailUrl: z.string().url().optional().nullable(),
  isFreePreview: z.boolean().default(false),
})

const updateCourseSchema = createCourseSchema.partial()

const createSessionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sessionOrder: z.number().int().positive(),
  durationMinutes: z.number().int().positive().optional(),
})

const updateSessionSchema = createSessionSchema.partial()

const courseRoutes = new Hono<AuthEnv>()

// GET / - List courses (auth required)
courseRoutes.get('/', authMiddleware, async (c) => {
  const userTier = c.get('userTier')

  const courseList = await db.query.courses.findMany({
    where: and(
      isNull(courses.deletedAt),
      eq(courses.status, 'published')
    ),
    with: {
      sessions: {
        orderBy: asc(courseSessions.sessionOrder),
      },
    },
    orderBy: desc(courses.createdAt),
  })

  // For non-member users, filter to only free preview courses
  // Or mark which courses are accessible
  const accessibleCourses = courseList.map(course => ({
    ...course,
    isAccessible: course.isFreePreview || userTier === 'member',
  }))

  return c.json({ courses: accessibleCourses })
})

// GET /:idOrSlug - Get single course (auth required, tier-gated)
courseRoutes.get('/:idOrSlug', authMiddleware, async (c) => {
  const idOrSlug = c.req.param('idOrSlug')
  const userTier = c.get('userTier')

  // Check if param is numeric (id) or slug
  const isNumeric = /^\d+$/.test(idOrSlug)

  let course
  if (isNumeric) {
    course = await db.query.courses.findFirst({
      where: and(
        eq(courses.id, parseInt(idOrSlug)),
        isNull(courses.deletedAt)
      ),
      with: {
        sessions: {
          orderBy: asc(courseSessions.sessionOrder),
        },
      },
    })
  } else {
    course = await db.query.courses.findFirst({
      where: and(
        eq(courses.slug, idOrSlug),
        isNull(courses.deletedAt)
      ),
      with: {
        sessions: {
          orderBy: asc(courseSessions.sessionOrder),
        },
      },
    })
  }

  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }

  // Check tier access for non-preview content
  if (!course.isFreePreview && userTier !== 'member') {
    return c.json({
      error: 'Insufficient permissions',
      message: 'This course is only available to members',
      required: 'member',
      current: userTier,
    }, 403)
  }

  return c.json({ course })
})

// POST / - Create course (admin only)
courseRoutes.post(
  '/',
  authMiddleware,
  requireAdmin(),
  zValidator('json', createCourseSchema),
  async (c) => {
    const body = c.req.valid('json')

    // Generate unique slug from title
    const baseSlug = generateSlug(body.title)
    const slug = await createUniqueSlug(baseSlug, 'courses')

    const [course] = await db.insert(courses).values({
      title: body.title,
      slug,
      description: body.description || '',
      content: body.content || '',
      thumbnailUrl: body.thumbnailUrl,
      isFreePreview: body.isFreePreview,
      status: 'published',
    }).returning()

    return c.json({ course }, 201)
  }
)

// PATCH /:id - Update course (admin only)
courseRoutes.patch(
  '/:id',
  authMiddleware,
  requireAdmin(),
  zValidator('json', updateCourseSchema),
  async (c) => {
    const id = parseInt(c.req.param('id'))
    const body = c.req.valid('json')

    // Check if course exists
    const existingCourse = await db.query.courses.findFirst({
      where: and(
        eq(courses.id, id),
        isNull(courses.deletedAt)
      ),
    })

    if (!existingCourse) {
      return c.json({ error: 'Course not found' }, 404)
    }

    // If title changed, regenerate slug
    let slug = existingCourse.slug
    if (body.title && body.title !== existingCourse.title) {
      const baseSlug = generateSlug(body.title)
      slug = await createUniqueSlug(baseSlug, 'courses')
    }

    const [course] = await db.update(courses)
      .set({
        ...body,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning()

    return c.json({ course })
  }
)

// DELETE /:id - Soft delete course (admin only)
courseRoutes.delete(
  '/:id',
  authMiddleware,
  requireAdmin(),
  async (c) => {
    const id = parseInt(c.req.param('id'))

    // Check if course exists
    const existingCourse = await db.query.courses.findFirst({
      where: and(
        eq(courses.id, id),
        isNull(courses.deletedAt)
      ),
    })

    if (!existingCourse) {
      return c.json({ error: 'Course not found' }, 404)
    }

    await db.update(courses)
      .set({
        deletedAt: new Date(),
        status: 'archived',
      })
      .where(eq(courses.id, id))

    return c.json({ message: 'Course deleted' })
  }
)

// POST /:courseId/sessions - Add session (admin only)
courseRoutes.post(
  '/:courseId/sessions',
  authMiddleware,
  requireAdmin(),
  zValidator('json', createSessionSchema),
  async (c) => {
    const courseId = parseInt(c.req.param('courseId'))
    const body = c.req.valid('json')

    // Check if course exists
    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.id, courseId),
        isNull(courses.deletedAt)
      ),
    })

    if (!course) {
      return c.json({ error: 'Course not found' }, 404)
    }

    const [session] = await db.insert(courseSessions).values({
      courseId,
      title: body.title,
      description: body.description,
      sessionOrder: body.sessionOrder,
      durationMinutes: body.durationMinutes,
    }).returning()

    return c.json({ session }, 201)
  }
)

// PATCH /:courseId/sessions/:sessionId - Update session (admin only)
courseRoutes.patch(
  '/:courseId/sessions/:sessionId',
  authMiddleware,
  requireAdmin(),
  zValidator('json', updateSessionSchema),
  async (c) => {
    const courseId = parseInt(c.req.param('courseId'))
    const sessionId = parseInt(c.req.param('sessionId'))
    const body = c.req.valid('json')

    // Check if session exists and belongs to the course
    const existingSession = await db.query.courseSessions.findFirst({
      where: and(
        eq(courseSessions.id, sessionId),
        eq(courseSessions.courseId, courseId)
      ),
    })

    if (!existingSession) {
      return c.json({ error: 'Session not found' }, 404)
    }

    const [session] = await db.update(courseSessions)
      .set(body)
      .where(eq(courseSessions.id, sessionId))
      .returning()

    return c.json({ session })
  }
)

// DELETE /:courseId/sessions/:sessionId - Delete session (admin only)
courseRoutes.delete(
  '/:courseId/sessions/:sessionId',
  authMiddleware,
  requireAdmin(),
  async (c) => {
    const courseId = parseInt(c.req.param('courseId'))
    const sessionId = parseInt(c.req.param('sessionId'))

    // Check if session exists and belongs to the course
    const existingSession = await db.query.courseSessions.findFirst({
      where: and(
        eq(courseSessions.id, sessionId),
        eq(courseSessions.courseId, courseId)
      ),
    })

    if (!existingSession) {
      return c.json({ error: 'Session not found' }, 404)
    }

    await db.delete(courseSessions)
      .where(eq(courseSessions.id, sessionId))

    return c.json({ message: 'Session deleted' })
  }
)

export { courseRoutes }
