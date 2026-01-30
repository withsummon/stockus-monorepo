import { Hono } from 'hono'
import { eq, count, sum, and, gte, sql, desc } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/index.js'
import { users, payments, subscriptions } from '../db/schema/index.js'
import { authMiddleware, requireAdmin } from '../middleware/auth.js'

export const adminRoutes = new Hono()

// All admin routes require authentication + admin check
adminRoutes.use('*', authMiddleware, requireAdmin())

/**
 * GET /admin/metrics
 * Returns dashboard KPIs for admin overview
 */
adminRoutes.get('/metrics', async (c) => {
  try {
    // Total members (users with tier='member')
    const memberCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tier, 'member'))
    const totalMembers = memberCount[0]?.count || 0

    // Total revenue (sum of capture + settlement payments)
    const revenueResult = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        sql`${payments.status} IN ('capture', 'settlement')`
      )
    const totalRevenue = Number(revenueResult[0]?.total || 0)

    // Active subscriptions
    const activeSubsCount = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'))
    const activeSubscriptions = activeSubsCount[0]?.count || 0

    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentOrdersCount = await db
      .select({ count: count() })
      .from(payments)
      .where(gte(payments.createdAt, thirtyDaysAgo))
    const recentOrders = recentOrdersCount[0]?.count || 0

    return c.json({
      metrics: {
        totalMembers,
        totalRevenue,
        activeSubscriptions,
        recentOrders,
      },
    })
  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    return c.json({ error: 'Failed to fetch metrics' }, 500)
  }
})

/**
 * GET /admin/users
 * Returns paginated user list with search capability
 */
adminRoutes.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = parseInt(c.req.query('limit') || '20', 10)
    const search = c.req.query('search')?.trim()
    const offset = (page - 1) * limit

    // Build where clause for search
    let whereClause = undefined
    if (search) {
      whereClause = sql`(
        LOWER(${users.email}) LIKE LOWER(${`%${search}%`}) OR
        LOWER(${users.name}) LIKE LOWER(${`%${search}%`})
      )`
    }

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause)
    const total = totalCount[0]?.count || 0

    // Get users with subscription status
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        tier: users.tier,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        subscriptionStatus: subscriptions.status,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(whereClause)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(limit)
      .offset(offset)

    return c.json({
      users: userList,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

/**
 * GET /admin/orders
 * Returns paginated payment history with user info
 */
adminRoutes.get('/orders', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = parseInt(c.req.query('limit') || '20', 10)
    const statusFilter = c.req.query('status')?.trim()
    const offset = (page - 1) * limit

    // Build where clause for status filter
    let whereClause = undefined
    if (statusFilter) {
      whereClause = eq(payments.status, statusFilter as any)
    }

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(payments)
      .where(whereClause)
    const total = totalCount[0]?.count || 0

    // Get payments with user info
    const orderList = await db
      .select({
        id: payments.id,
        midtransOrderId: payments.midtransOrderId,
        type: payments.type,
        status: payments.status,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        createdAt: payments.createdAt,
        paidAt: payments.paidAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .where(whereClause)
      .orderBy(sql`${payments.createdAt} DESC`)
      .limit(limit)
      .offset(offset)

    // Transform to nested user object structure
    const orders = orderList.map(order => ({
      id: order.id,
      midtransOrderId: order.midtransOrderId,
      type: order.type,
      status: order.status,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      user: {
        name: order.userName,
        email: order.userEmail,
      },
    }))

    return c.json({
      orders,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

/**
 * GET /admin/users/:id
 * Get user details with subscription and payment history
 */
adminRoutes.get('/users/:id', async (c) => {
  const userId = c.req.param('id')

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  // Get active subscription if exists
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ),
  })

  // Get payment history
  const userPayments = await db.query.payments.findMany({
    where: eq(payments.userId, userId),
    orderBy: desc(payments.createdAt),
    limit: 20,
  })

  // Remove sensitive fields
  const { passwordHash, ...safeUser } = user

  return c.json({
    user: safeUser,
    subscription,
    payments: userPayments,
  })
})

/**
 * PATCH /admin/users/:id
 * Update user tier
 */
adminRoutes.patch('/users/:id', zValidator('json', z.object({
  tier: z.enum(['free', 'member']).optional(),
  name: z.string().min(1).max(255).optional(),
})), async (c) => {
  const userId = c.req.param('id')
  const body = c.req.valid('json')

  // Check user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  // Update user
  const [updatedUser] = await db.update(users)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  // If tier changed to 'member' and no active subscription, create one
  // If tier changed to 'free', cancel any active subscription
  if (body.tier === 'member') {
    const existingSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      ),
    })

    if (!existingSub) {
      // Create manual subscription (admin grant)
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1) // 1 year

      await db.insert(subscriptions).values({
        userId,
        status: 'active',
        startDate,
        endDate,
      })
    }
  } else if (body.tier === 'free') {
    // Cancel active subscription
    await db.update(subscriptions)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      ))
  }

  const { passwordHash, ...safeUser } = updatedUser

  return c.json({ user: safeUser })
})
