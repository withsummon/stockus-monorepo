import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// Mock the db module before importing routes
vi.mock('../db/index.js', () => ({
  db: {
    query: {
      watchlistStocks: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../middleware/auth.js', () => ({
  optionalAuthMiddleware: vi.fn(async (c: any, next: any) => {
    c.set('userTier', c.req.header('X-Test-Tier') || 'anonymous')
    await next()
  }),
  authMiddleware: vi.fn(async (c: any, next: any) => {
    const tier = c.req.header('X-Test-Tier')
    if (!tier || tier === 'anonymous') {
      return c.json({ error: 'Auth required' }, 401)
    }
    c.set('userId', 'test-user-id')
    c.set('userTier', tier)
    await next()
  }),
  requireAdmin: () => vi.fn(async (_c: any, next: any) => { await next() }),
}))

import { db } from '../db/index.js'
import { watchlistRoutes } from './watchlist.js'

const app = new Hono()
app.route('/watchlist', watchlistRoutes)

describe('GET /watchlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all stocks unrestricted for members', async () => {
    const mockStocks = [
      { id: '1', stockSymbol: 'BBCA', stockName: 'Bank Central Asia', category: 'swing', sortOrder: 0, createdAt: new Date() },
      { id: '2', stockSymbol: 'TLKM', stockName: 'Telkom', category: 'long_term', sortOrder: 1, createdAt: new Date() },
    ]
    vi.mocked(db.query.watchlistStocks.findMany).mockResolvedValue(mockStocks as any)

    const res = await app.request('/watchlist', {
      headers: { 'X-Test-Tier': 'member' },
    })
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.stocks).toHaveLength(2)
    expect(data.stocks[0].restricted).toBe(false)
    expect(data.stocks[1].restricted).toBe(false)
    expect(data.stocks[0].stockSymbol).toBe('BBCA')
    expect(data.stocks[1].stockSymbol).toBe('TLKM')
  })

  it('returns first stock unlocked, rest restricted for anonymous users', async () => {
    const mockStocks = [
      { id: '1', stockSymbol: 'BBCA', stockName: 'Bank Central Asia', category: 'swing', sortOrder: 0, createdAt: new Date() },
      { id: '2', stockSymbol: 'TLKM', stockName: 'Telkom', category: 'long_term', sortOrder: 1, createdAt: new Date() },
      { id: '3', stockSymbol: 'ASII', stockName: 'Astra International', category: 'swing', sortOrder: 2, createdAt: new Date() },
    ]
    vi.mocked(db.query.watchlistStocks.findMany).mockResolvedValue(mockStocks as any)

    const res = await app.request('/watchlist')
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.stocks).toHaveLength(3)
    // First stock should be unrestricted
    expect(data.stocks[0].restricted).toBe(false)
    expect(data.stocks[0].stockSymbol).toBe('BBCA')
    // Rest should be restricted with masked data
    expect(data.stocks[1].restricted).toBe(true)
    expect(data.stocks[1].stockSymbol).toBe('****')
    expect(data.stocks[2].restricted).toBe(true)
    expect(data.stocks[2].stockSymbol).toBe('****')
  })

  it('returns empty array when no stocks exist', async () => {
    vi.mocked(db.query.watchlistStocks.findMany).mockResolvedValue([])

    const res = await app.request('/watchlist')
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.stocks).toHaveLength(0)
  })
})
