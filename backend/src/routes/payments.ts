import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/index.js'
import { payments, users, cohorts } from '../db/schema/index.js'
import { authMiddleware, AuthEnv } from '../middleware/auth.js'
import { createSubscriptionPayment, createWorkshopPayment } from '../services/payment.service.js'
import { validatePromoCode, calculateDiscountedAmount } from '../services/promo.service.js'
import { validateReferralCode } from '../services/referral.service.js'
import { eq } from 'drizzle-orm'

// Pricing constants (in IDR)
const SUBSCRIPTION_PRICE = 2500000 // IDR 2,500,000 annual subscription

const initiateSubscriptionSchema = z.object({
  promoCode: z.string().optional(),
  referralCode: z.string().optional(),
})

const initiateWorkshopSchema = z.object({
  cohortId: z.string().length(26), // ULID - Workshop = cohort with price
  promoCode: z.string().optional(),
  referralCode: z.string().optional(),
})

const validatePromoSchema = z.object({
  code: z.string().min(1),
})

const paymentRoutes = new Hono<AuthEnv>()

/**
 * POST /payments/subscription
 * Initiate subscription payment
 * Returns Midtrans Snap token for frontend
 */
paymentRoutes.post(
  '/subscription',
  authMiddleware,
  zValidator('json', initiateSubscriptionSchema),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Check if user already has active subscription
    if (user.tier === 'member') {
      return c.json({
        error: 'Already subscribed',
        message: 'You already have an active subscription'
      }, 400)
    }

    // Calculate final amount with discounts
    let finalAmount = SUBSCRIPTION_PRICE
    let promoCodeId: string | undefined
    let referralId: string | undefined

    // Validate and apply promo code
    if (body.promoCode) {
      const promoResult = await validatePromoCode(body.promoCode)
      if (!promoResult.success) {
        return c.json({ error: promoResult.error }, 400)
      }
      promoCodeId = promoResult.promoCodeId
      finalAmount = calculateDiscountedAmount(finalAmount, promoResult.discountPercent!)
    }

    // Validate referral code
    if (body.referralCode) {
      const referralResult = await validateReferralCode(body.referralCode)
      if (!referralResult.success) {
        return c.json({ error: referralResult.error }, 400)
      }
      // Cannot use own referral code
      if (referralResult.referrerId === userId) {
        return c.json({ error: 'Cannot use your own referral code' }, 400)
      }
      referralId = referralResult.referralId
    }

    // Create Midtrans Snap transaction
    const paymentResult = await createSubscriptionPayment({
      userId,
      userEmail: user.email,
      userName: user.name,
      amount: finalAmount,
      promoCodeId,
      referralId,
    })

    if (!paymentResult.success) {
      return c.json({ error: paymentResult.error }, 500)
    }

    // Create pending payment record
    await db.insert(payments).values({
      userId,
      midtransOrderId: paymentResult.orderId!,
      type: 'subscription',
      status: 'pending',
      amount: finalAmount,
      promoCodeId,
      referralId,
    })

    return c.json({
      token: paymentResult.token,
      redirectUrl: paymentResult.redirectUrl,
      orderId: paymentResult.orderId,
      amount: finalAmount,
      originalAmount: SUBSCRIPTION_PRICE,
      discount: SUBSCRIPTION_PRICE - finalAmount,
    })
  }
)

/**
 * POST /payments/workshop
 * Initiate workshop payment (workshop = cohort with price)
 * Returns Midtrans Snap token for frontend
 */
paymentRoutes.post(
  '/workshop',
  authMiddleware,
  zValidator('json', initiateWorkshopSchema),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Fetch cohort (workshop) from database
    // Note: In Stockus, cohorts with a price field serve as "workshops"
    const cohort = await db.query.cohorts.findFirst({
      where: eq(cohorts.id, body.cohortId),
      with: {
        course: true,
      },
    })

    if (!cohort) {
      return c.json({ error: 'Workshop not found' }, 404)
    }

    if (!cohort.price) {
      return c.json({
        error: 'This cohort is not a paid workshop',
        message: 'Cohorts without a price are part of the subscription'
      }, 400)
    }

    if (cohort.status !== 'open') {
      return c.json({ error: 'Workshop enrollment is not open' }, 400)
    }

    const workshopPrice = cohort.price
    const workshopName = cohort.name || `${cohort.course.title} - Cohort`

    let finalAmount = workshopPrice
    let promoCodeId: string | undefined
    let referralId: string | undefined

    // Validate and apply promo code
    if (body.promoCode) {
      const promoResult = await validatePromoCode(body.promoCode)
      if (!promoResult.success) {
        return c.json({ error: promoResult.error }, 400)
      }
      promoCodeId = promoResult.promoCodeId
      finalAmount = calculateDiscountedAmount(finalAmount, promoResult.discountPercent!)
    }

    // Validate referral code
    if (body.referralCode) {
      const referralResult = await validateReferralCode(body.referralCode)
      if (!referralResult.success) {
        return c.json({ error: referralResult.error }, 400)
      }
      if (referralResult.referrerId === userId) {
        return c.json({ error: 'Cannot use your own referral code' }, 400)
      }
      referralId = referralResult.referralId
    }

    // Create Midtrans Snap transaction
    const paymentResult = await createWorkshopPayment({
      userId,
      userEmail: user.email,
      userName: user.name,
      amount: finalAmount,
      workshopId: body.cohortId, // cohortId is stored as workshopId
      workshopName,
      promoCodeId,
      referralId,
    })

    if (!paymentResult.success) {
      return c.json({ error: paymentResult.error }, 500)
    }

    // Create pending payment record
    // Note: workshopId references cohorts.id (cohorts serve as workshops)
    await db.insert(payments).values({
      userId,
      midtransOrderId: paymentResult.orderId!,
      type: 'workshop',
      status: 'pending',
      amount: finalAmount,
      workshopId: body.cohortId,
      promoCodeId,
      referralId,
    })

    return c.json({
      token: paymentResult.token,
      redirectUrl: paymentResult.redirectUrl,
      orderId: paymentResult.orderId,
      amount: finalAmount,
      originalAmount: workshopPrice,
      discount: workshopPrice - finalAmount,
    })
  }
)

/**
 * POST /payments/validate-promo
 * Validate promo code without initiating payment
 * Returns discount percentage if valid
 */
paymentRoutes.post(
  '/validate-promo',
  authMiddleware,
  zValidator('json', validatePromoSchema),
  async (c) => {
    const body = c.req.valid('json')

    const result = await validatePromoCode(body.code)

    if (!result.success) {
      return c.json({ valid: false, error: result.error }, 400)
    }

    return c.json({
      valid: true,
      discountPercent: result.discountPercent,
    })
  }
)

/**
 * GET /payments/history
 * Get user's payment history
 */
paymentRoutes.get(
  '/history',
  authMiddleware,
  async (c) => {
    const userId = c.get('userId')

    const userPayments = await db.query.payments.findMany({
      where: eq(payments.userId, userId),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    })

    return c.json({ payments: userPayments })
  }
)

export { paymentRoutes }
