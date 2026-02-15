import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../db/index.js', () => ({
  db: {
    query: {
      researchReports: {
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

vi.mock('../utils/slug.js', () => ({
  generateSlug: (title: string) => title.toLowerCase().replace(/\s+/g, '-'),
  createUniqueSlug: async (slug: string) => slug,
}))

import { db } from '../db/index.js'
import { researchRoutes } from './research.js'

const app = new Hono()
app.route('/research', researchRoutes)

describe('GET /research (public access)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all reports unrestricted for members', async () => {
    const mockReports = [
      { id: '1', title: 'Report A', slug: 'report-a', summary: 'Summary A', content: '<p>Content</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'BBCA', stockName: 'Bank Central Asia' },
      { id: '2', title: 'Report B', slug: 'report-b', summary: 'Summary B', content: '<p>Content B</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'TLKM', stockName: 'Telkom' },
    ]
    vi.mocked(db.query.researchReports.findMany).mockResolvedValue(mockReports as any)

    const res = await app.request('/research', {
      headers: { 'X-Test-Tier': 'member' },
    })
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.reports).toHaveLength(2)
    expect(data.reports[0].restricted).toBe(false)
    expect(data.reports[1].restricted).toBe(false)
  })

  it('unlocks first report for anonymous users, restricts rest', async () => {
    const mockReports = [
      { id: '1', title: 'Report A', slug: 'report-a', summary: 'Summary A', content: '<p>Content</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'BBCA', stockName: 'Bank Central Asia' },
      { id: '2', title: 'Report B', slug: 'report-b', summary: 'Summary B', content: '<p>Content B</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'TLKM', stockName: 'Telkom' },
      { id: '3', title: 'Report C', slug: 'report-c', summary: 'Summary C', content: '<p>Content C</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'ASII', stockName: 'Astra' },
    ]
    vi.mocked(db.query.researchReports.findMany).mockResolvedValue(mockReports as any)

    const res = await app.request('/research')
    const data: any = await res.json()

    expect(res.status).toBe(200)
    expect(data.reports).toHaveLength(3)
    // First report unlocked
    expect(data.reports[0].restricted).toBe(false)
    expect(data.reports[0].content).toBeDefined()
    // Rest restricted
    expect(data.reports[1].restricted).toBe(true)
    expect(data.reports[1].content).toBeUndefined()
    expect(data.reports[2].restricted).toBe(true)
  })

  it('always unlocks free preview reports', async () => {
    const mockReports = [
      { id: '1', title: 'Free Report', slug: 'free-report', summary: 'Summary', content: '<p>Free</p>', isFreePreview: true, publishedAt: new Date(), status: 'published', stockSymbol: 'BBCA', stockName: 'BCA' },
      { id: '2', title: 'Report A', slug: 'report-a', summary: 'Summary A', content: '<p>Content</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'TLKM', stockName: 'Telkom' },
      { id: '3', title: 'Report B', slug: 'report-b', summary: 'Summary B', content: '<p>Content B</p>', isFreePreview: false, publishedAt: new Date(), status: 'published', stockSymbol: 'ASII', stockName: 'Astra' },
    ]
    vi.mocked(db.query.researchReports.findMany).mockResolvedValue(mockReports as any)

    const res = await app.request('/research')
    const data: any = await res.json()

    expect(res.status).toBe(200)
    // Free preview always unlocked
    expect(data.reports[0].restricted).toBe(false)
    // First non-free report also unlocked (first unlocked slot)
    expect(data.reports[1].restricted).toBe(false)
    // Rest restricted
    expect(data.reports[2].restricted).toBe(true)
  })

  it('allows access without authentication (optionalAuth)', async () => {
    vi.mocked(db.query.researchReports.findMany).mockResolvedValue([])

    const res = await app.request('/research')
    expect(res.status).toBe(200)
  })
})
