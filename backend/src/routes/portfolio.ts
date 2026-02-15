import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/index.js'
import { portfolioHoldings } from '../db/schema/index.js'
import { authMiddleware, optionalAuthMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'
import { eq, isNull, asc } from 'drizzle-orm'

const portfolio = new Hono<AuthEnv>()

const createHoldingSchema = z.object({
  stockSymbol: z.string().min(1).max(20),
  stockName: z.string().min(1).max(255),
  logoUrl: z.string().url().max(512).optional(),
  avgBuyPrice: z.string(), // numeric as string
  currentPrice: z.string(),
  totalShares: z.number().int().positive(),
  allocationPercent: z.string(),
  sortOrder: z.number().int().default(0),
})

const updateHoldingSchema = createHoldingSchema.partial()

/**
 * GET /portfolio
 * List all portfolio holdings - public with optional auth
 * Non-members see only first item unlocked, rest are restricted
 */
portfolio.get('/', optionalAuthMiddleware, async (c) => {
  const userTier = c.get('userTier')

  const holdings = await db.query.portfolioHoldings.findMany({
    where: isNull(portfolioHoldings.deletedAt),
    orderBy: [asc(portfolioHoldings.sortOrder)],
  })

  const isMember = userTier === 'member'

  const result = holdings.map((holding, index) => {
    if (!isMember && index > 0) {
      return {
        id: holding.id,
        stockSymbol: '****',
        stockName: '****',
        logoUrl: null,
        avgBuyPrice: null,
        currentPrice: null,
        totalShares: null,
        allocationPercent: holding.allocationPercent,
        sortOrder: holding.sortOrder,
        restricted: true,
        createdAt: holding.createdAt,
      }
    }
    return { ...holding, restricted: false }
  })

  return c.json({ holdings: result })
})

/**
 * POST /portfolio
 * Add holding - Admin only
 */
portfolio.post('/', authMiddleware, requireAdmin(), zValidator('json', createHoldingSchema), async (c) => {
  const data = c.req.valid('json')

  const [holding] = await db.insert(portfolioHoldings).values({
    stockSymbol: data.stockSymbol,
    stockName: data.stockName,
    logoUrl: data.logoUrl,
    avgBuyPrice: data.avgBuyPrice,
    currentPrice: data.currentPrice,
    totalShares: data.totalShares,
    allocationPercent: data.allocationPercent,
    sortOrder: data.sortOrder,
  }).returning()

  return c.json({ holding }, 201)
})

/**
 * PATCH /portfolio/:id
 * Update holding - Admin only
 */
portfolio.patch('/:id', authMiddleware, requireAdmin(), zValidator('json', updateHoldingSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')

  const existing = await db.query.portfolioHoldings.findFirst({
    where: eq(portfolioHoldings.id, id),
  })

  if (!existing) {
    return c.json({ error: 'Holding not found' }, 404)
  }

  const [holding] = await db.update(portfolioHoldings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(portfolioHoldings.id, id))
    .returning()

  return c.json({ holding })
})

/**
 * DELETE /portfolio/:id
 * Soft delete holding - Admin only
 */
portfolio.delete('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  const existing = await db.query.portfolioHoldings.findFirst({
    where: eq(portfolioHoldings.id, id),
  })

  if (!existing) {
    return c.json({ error: 'Holding not found' }, 404)
  }

  await db.update(portfolioHoldings)
    .set({ deletedAt: new Date() })
    .where(eq(portfolioHoldings.id, id))

  return c.json({ message: 'Holding removed' })
})

export const portfolioRoutes = portfolio
