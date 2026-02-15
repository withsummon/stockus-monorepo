import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/index.js'
import { researchReports } from '../db/schema/index.js'
import { authMiddleware, optionalAuthMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'
import { generateSlug, createUniqueSlug } from '../utils/slug.js'
import { eq, desc, isNull, and } from 'drizzle-orm'

const research = new Hono<AuthEnv>()

// Validation schemas
const createReportSchema = z.object({
  title: z.string().min(3).max(255),
  summary: z.string().optional(),
  content: z.string().optional(), // HTML content
  publishedAt: z.string().datetime().optional(), // ISO date string
  isFreePreview: z.boolean().default(false),
  stockSymbol: z.string().max(20).optional(),
  stockName: z.string().max(255).optional(),
  analystRating: z.string().max(50).optional(),
  targetPrice: z.number().int().positive().optional(),
  fileUrl: z.string().url().max(512).optional(), // URL to downloadable file
})

const updateReportSchema = createReportSchema.partial()

/**
 * GET /research
 * List all published research reports
 * Auth required
 */
research.get('/', optionalAuthMiddleware, async (c) => {
  const userTier = c.get('userTier')

  // Query published, non-deleted reports
  const allReports = await db.query.researchReports.findMany({
    where: and(
      isNull(researchReports.deletedAt),
      eq(researchReports.status, 'published')
    ),
    orderBy: [desc(researchReports.publishedAt)],
  })

  const isMember = userTier === 'member'

  // For non-members: first report is unlocked, rest are restricted
  let unlockedCount = 0
  const reports = allReports.map(report => {
    const isUnlocked = isMember || report.isFreePreview || unlockedCount === 0
    if (!isMember && !report.isFreePreview && unlockedCount === 0) {
      unlockedCount++
    }

    if (!isUnlocked) {
      return {
        id: report.id,
        title: report.title,
        slug: report.slug,
        summary: report.summary,
        publishedAt: report.publishedAt,
        status: report.status,
        isFreePreview: report.isFreePreview,
        stockSymbol: report.stockSymbol,
        stockName: report.stockName,
        content: undefined,
        restricted: true,
      }
    }
    return {
      ...report,
      restricted: false,
    }
  })

  return c.json({ reports })
})

/**
 * GET /research/:idOrSlug
 * Get single research report by ID or slug
 * Auth required, tier-gated for members-only content
 */
research.get('/:idOrSlug', authMiddleware, async (c) => {
  const idOrSlug = c.req.param('idOrSlug')
  const userTier = c.get('userTier')

  // Check if param is ULID (26 chars) or string (slug)
  const isUlid = /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(idOrSlug)

  let report
  if (isUlid) {
    report = await db.query.researchReports.findFirst({
      where: and(
        eq(researchReports.id, idOrSlug),
        isNull(researchReports.deletedAt)
      ),
    })
  } else {
    report = await db.query.researchReports.findFirst({
      where: and(
        eq(researchReports.slug, idOrSlug),
        isNull(researchReports.deletedAt)
      ),
    })
  }

  if (!report) {
    return c.json({ error: 'Report not found' }, 404)
  }

  // Check tier access for members-only content
  if (!report.isFreePreview && userTier !== 'member') {
    return c.json({
      error: 'Insufficient permissions',
      message: 'This report is available to members only',
    }, 403)
  }

  return c.json({ report })
})

/**
 * POST /research
 * Create new research report
 * Admin only
 */
research.post('/', authMiddleware, requireAdmin(), zValidator('json', createReportSchema), async (c) => {
  const data = c.req.valid('json')

  // Generate unique slug from title
  const baseSlug = generateSlug(data.title)
  const slug = await createUniqueSlug(baseSlug, 'researchReports')

  // Parse publishedAt or use current date
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date()

  // Insert report
  const [report] = await db.insert(researchReports).values({
    title: data.title,
    slug,
    summary: data.summary || '',
    content: data.content || '',
    publishedAt,
    status: 'published',
    isFreePreview: data.isFreePreview,
    stockSymbol: data.stockSymbol,
    stockName: data.stockName,
    analystRating: data.analystRating,
    targetPrice: data.targetPrice,
    fileUrl: data.fileUrl,
  }).returning()

  return c.json({ report }, 201)
})

/**
 * PATCH /research/:id
 * Update existing research report
 * Admin only
 */
research.patch('/:id', authMiddleware, requireAdmin(), zValidator('json', updateReportSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')

  // Check if report exists
  const existing = await db.query.researchReports.findFirst({
    where: and(
      eq(researchReports.id, id),
      isNull(researchReports.deletedAt)
    ),
  })

  if (!existing) {
    return c.json({ error: 'Report not found' }, 404)
  }

  // If title changed, regenerate slug
  let slug = existing.slug
  if (data.title && data.title !== existing.title) {
    const baseSlug = generateSlug(data.title)
    slug = await createUniqueSlug(baseSlug, 'researchReports')
  }

  // Parse publishedAt if provided
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : undefined

  // Update report
  const [report] = await db.update(researchReports)
    .set({
      ...data,
      slug,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(researchReports.id, id))
    .returning()

  return c.json({ report })
})

/**
 * DELETE /research/:id
 * Soft delete research report
 * Admin only
 */
research.delete('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  // Check if report exists
  const existing = await db.query.researchReports.findFirst({
    where: and(
      eq(researchReports.id, id),
      isNull(researchReports.deletedAt)
    ),
  })

  if (!existing) {
    return c.json({ error: 'Report not found' }, 404)
  }

  // Soft delete by setting deletedAt and status
  await db.update(researchReports)
    .set({
      deletedAt: new Date(),
      status: 'archived',
    })
    .where(eq(researchReports.id, id))

  return c.json({ message: 'Report deleted' })
})

export const researchRoutes = research
