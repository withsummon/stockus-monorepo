import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/index.js'
import { watchlistStocks } from '../db/schema/index.js'
import { authMiddleware, optionalAuthMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'
import { eq, isNull, asc } from 'drizzle-orm'

const watchlist = new Hono<AuthEnv>()

const createWatchlistSchema = z.object({
  stockSymbol: z.string().min(1).max(20),
  stockName: z.string().min(1).max(255),
  logoUrl: z.string().url().max(512).optional(),
  category: z.enum(['swing', 'short_term', 'long_term']),
  entryPrice: z.number().int().optional(),
  targetPrice: z.number().int().optional(),
  stopLoss: z.number().int().optional(),
  currentPrice: z.number().int().optional(),
  analystRating: z.string().max(50).optional(),
  notes: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

const updateWatchlistSchema = createWatchlistSchema.partial()

/**
 * GET /watchlist
 * List all watchlist stocks - public with optional auth
 * Non-members see only first item unlocked, rest are restricted
 */
watchlist.get('/', optionalAuthMiddleware, async (c) => {
  const userTier = c.get('userTier')

  const stocks = await db.query.watchlistStocks.findMany({
    where: isNull(watchlistStocks.deletedAt),
    orderBy: [asc(watchlistStocks.sortOrder)],
  })

  const isMember = userTier === 'member'

  const result = stocks.map((stock, index) => {
    if (!isMember && index > 0) {
      return {
        id: stock.id,
        stockSymbol: '****',
        stockName: '****',
        logoUrl: null,
        category: stock.category,
        entryPrice: null,
        targetPrice: null,
        stopLoss: null,
        currentPrice: null,
        analystRating: null,
        notes: null,
        sortOrder: stock.sortOrder,
        restricted: true,
        createdAt: stock.createdAt,
      }
    }
    return { ...stock, restricted: false }
  })

  return c.json({ stocks: result })
})

/**
 * POST /watchlist
 * Add stock to watchlist - Admin only
 */
watchlist.post('/', authMiddleware, requireAdmin(), zValidator('json', createWatchlistSchema), async (c) => {
  const data = c.req.valid('json')

  const [stock] = await db.insert(watchlistStocks).values({
    stockSymbol: data.stockSymbol,
    stockName: data.stockName,
    logoUrl: data.logoUrl,
    category: data.category,
    entryPrice: data.entryPrice,
    targetPrice: data.targetPrice,
    stopLoss: data.stopLoss,
    currentPrice: data.currentPrice,
    analystRating: data.analystRating,
    notes: data.notes,
    sortOrder: data.sortOrder,
  }).returning()

  return c.json({ stock }, 201)
})

/**
 * PATCH /watchlist/:id
 * Update watchlist stock - Admin only
 */
watchlist.patch('/:id', authMiddleware, requireAdmin(), zValidator('json', updateWatchlistSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')

  const existing = await db.query.watchlistStocks.findFirst({
    where: eq(watchlistStocks.id, id),
  })

  if (!existing) {
    return c.json({ error: 'Stock not found' }, 404)
  }

  const [stock] = await db.update(watchlistStocks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(watchlistStocks.id, id))
    .returning()

  return c.json({ stock })
})

/**
 * DELETE /watchlist/:id
 * Soft delete watchlist stock - Admin only
 */
watchlist.delete('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  const existing = await db.query.watchlistStocks.findFirst({
    where: eq(watchlistStocks.id, id),
  })

  if (!existing) {
    return c.json({ error: 'Stock not found' }, 404)
  }

  await db.update(watchlistStocks)
    .set({ deletedAt: new Date() })
    .where(eq(watchlistStocks.id, id))

  return c.json({ message: 'Stock removed from watchlist' })
})

export const watchlistRoutes = watchlist
