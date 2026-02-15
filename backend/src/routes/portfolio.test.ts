import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../db/index.js', () => ({
  db: {
    query: {
      portfolioHoldings: {
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
import { portfolioRoutes } from './portfolio.js'

const app = new Hono()
app.route('/portfolio', portfolioRoutes)

describe('GET /portfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all holdings unrestricted for members', async () => {
    const mockHoldings = [
      { id: '1', stockSymbol: 'BBCA', stockName: 'Bank Central Asia', avgBuyPrice: '8500', currentPrice: '9200', totalShares: 100, allocationPercent: '50', sortOrder: 0, createdAt: new Date() },
      { id: '2', stockSymbol: 'TLKM', stockName: 'Telkom', avgBuyPrice: '3500', currentPrice: '3800', totalShares: 200, allocationPercent: '50', sortOrder: 1, createdAt: new Date() },
    ]
    vi.mocked(db.query.portfolioHoldings.findMany).mockResolvedValue(mockHoldings as any)

    const res = await app.request('/portfolio', {
      headers: { 'X-Test-Tier': 'member' },
    })
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.holdings).toHaveLength(2)
    expect(data.holdings[0].restricted).toBe(false)
    expect(data.holdings[1].restricted).toBe(false)
    expect(data.holdings[0].stockSymbol).toBe('BBCA')
  })

  it('returns first holding unlocked, rest restricted for anonymous', async () => {
    const mockHoldings = [
      { id: '1', stockSymbol: 'BBCA', stockName: 'Bank Central Asia', avgBuyPrice: '8500', currentPrice: '9200', totalShares: 100, allocationPercent: '50', sortOrder: 0, createdAt: new Date() },
      { id: '2', stockSymbol: 'TLKM', stockName: 'Telkom', avgBuyPrice: '3500', currentPrice: '3800', totalShares: 200, allocationPercent: '50', sortOrder: 1, createdAt: new Date() },
    ]
    vi.mocked(db.query.portfolioHoldings.findMany).mockResolvedValue(mockHoldings as any)

    const res = await app.request('/portfolio')
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.holdings).toHaveLength(2)
    expect(data.holdings[0].restricted).toBe(false)
    expect(data.holdings[0].avgBuyPrice).toBe('8500')
    expect(data.holdings[1].restricted).toBe(true)
    expect(data.holdings[1].avgBuyPrice).toBeNull()
    expect(data.holdings[1].stockSymbol).toBe('****')
    expect(data.holdings[1].allocationPercent).toBe('50')
  })

  it('returns empty array when no holdings exist', async () => {
    vi.mocked(db.query.portfolioHoldings.findMany).mockResolvedValue([])

    const res = await app.request('/portfolio')
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.holdings).toHaveLength(0)
  })
})
