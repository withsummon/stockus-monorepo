import { Hono } from 'hono'
import crypto from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { payments, subscriptions, users } from '../db/schema/index.js'
import { env } from '../config/env.js'
import { applyPromoCode } from '../services/promo.service.js'
import { recordReferralReward, generateReferralCode } from '../services/referral.service.js'
import { sendPaymentReceiptEmail } from '../services/email.service.js'

const webhookRoutes = new Hono()

/**
 * Verify Midtrans webhook signature
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): boolean {
  const signatureString = `${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`
  const computedSignature = crypto
    .createHash('sha512')
    .update(signatureString)
    .digest('hex')

  return computedSignature === receivedSignature
}

/**
 * Check if payment status indicates success
 * settlement = bank transfer, virtual account settled
 * capture + fraud_status=accept = credit card captured and accepted
 */
function isPaymentSuccess(transactionStatus: string, fraudStatus?: string): boolean {
  if (transactionStatus === 'settlement') {
    return true
  }
  if (transactionStatus === 'capture' && fraudStatus === 'accept') {
    return true
  }
  return false
}

/**
 * Check if payment status indicates failure/cancellation
 */
function isPaymentFailed(transactionStatus: string): boolean {
  return ['deny', 'cancel', 'expire'].includes(transactionStatus)
}

/**
 * POST /webhooks/midtrans
 * Handle Midtrans payment notification
 *
 * CRITICAL: This endpoint must be idempotent
 * Midtrans may send multiple notifications for the same transaction
 */
webhookRoutes.post('/midtrans', async (c) => {
  const notification = await c.req.json()

  console.log('Midtrans webhook received:', {
    order_id: notification.order_id,
    transaction_status: notification.transaction_status,
    status_code: notification.status_code,
  })

  // 1. Verify signature
  const isValidSignature = verifyMidtransSignature(
    notification.order_id,
    notification.status_code,
    notification.gross_amount,
    notification.signature_key
  )

  if (!isValidSignature) {
    console.error('Invalid webhook signature for order:', notification.order_id)
    return c.json({ error: 'Invalid signature' }, 401)
  }

  const orderId = notification.order_id
  const transactionId = notification.transaction_id
  const transactionStatus = notification.transaction_status
  const fraudStatus = notification.fraud_status

  // 2. Find the payment record
  const payment = await db.query.payments.findFirst({
    where: eq(payments.midtransOrderId, orderId),
  })

  if (!payment) {
    console.error('Payment record not found for order:', orderId)
    return c.json({ error: 'Payment not found' }, 404)
  }

  // Get userId from the payment record
  const userId = payment.userId

  // 3. Idempotency check - if transaction_id already recorded, skip processing
  if (payment.midtransTransactionId === transactionId) {
    console.log('Webhook already processed:', transactionId)
    return c.json({ status: 'ok' }) // Return 200 to stop Midtrans retries
  }

  // 4. Map Midtrans status to our status enum
  let newStatus: 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'refund' = 'pending'
  if (transactionStatus === 'settlement') newStatus = 'settlement'
  else if (transactionStatus === 'capture') newStatus = 'capture'
  else if (transactionStatus === 'deny') newStatus = 'deny'
  else if (transactionStatus === 'cancel') newStatus = 'cancel'
  else if (transactionStatus === 'expire') newStatus = 'expire'
  else if (transactionStatus === 'refund') newStatus = 'refund'

  // 5. Process payment in transaction
  await db.transaction(async (tx) => {
    // Update payment record with Midtrans response
    await tx.update(payments)
      .set({
        midtransTransactionId: transactionId,
        status: newStatus,
        paymentMethod: notification.payment_type,
        rawResponse: JSON.stringify(notification),
        updatedAt: new Date(),
        paidAt: isPaymentSuccess(transactionStatus, fraudStatus) ? new Date() : null,
      })
      .where(eq(payments.id, payment.id))

    // 6. Handle successful payment
    if (isPaymentSuccess(transactionStatus, fraudStatus)) {
      // Get user for email
      const user = await tx.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (payment.type === 'subscription') {
        // Update user tier to member
        await tx.update(users)
          .set({
            tier: 'member',
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))

        // Create subscription record
        const startDate = new Date()
        const endDate = new Date()
        endDate.setFullYear(endDate.getFullYear() + 1) // 1 year subscription

        await tx.insert(subscriptions).values({
          userId,
          paymentId: payment.id,
          status: 'active',
          startDate,
          endDate,
        })

        // Generate referral code for new member
        await generateReferralCode(userId)
      }

      // Apply promo code usage if used
      if (payment.promoCodeId) {
        await applyPromoCode(payment.promoCodeId)
      }

      // Record referral reward if referral code was used
      if (payment.referralId) {
        await recordReferralReward(payment.referralId, userId, payment.id)
      }

      // Send receipt email (non-blocking)
      if (user) {
        const itemName = payment.type === 'subscription'
          ? 'StockUs Annual Membership'
          : `Workshop #${payment.workshopId}`

        sendPaymentReceiptEmail(
          user.email,
          user.name,
          orderId,
          payment.amount,
          itemName
        ).catch(err => {
          console.error('Failed to send receipt email:', err)
        })
      }
    }

    // 7. Handle payment failure/denial - revert tier if needed
    if (isPaymentFailed(transactionStatus)) {
      // Note: This handles the rare settlement->deny case
      // If user was upgraded, downgrade them

      // Check if this was a subscription that upgraded the user
      const existingSubscription = await tx.query.subscriptions.findFirst({
        where: eq(subscriptions.paymentId, payment.id),
      })

      if (existingSubscription) {
        // Mark subscription as cancelled
        await tx.update(subscriptions)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, existingSubscription.id))

        // Check if user has any other active subscriptions
        const otherActiveSubscription = await tx.query.subscriptions.findFirst({
          where: and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, 'active')
          ),
        })

        // Only downgrade if no other active subscription
        if (!otherActiveSubscription) {
          await tx.update(users)
            .set({
              tier: 'free',
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
        }
      }
    }
  })

  console.log('Webhook processed successfully:', orderId, transactionStatus)

  // Always return 200 to acknowledge receipt
  return c.json({ status: 'ok' })
})

/**
 * GET /webhooks/midtrans/test
 * Test endpoint to verify webhook URL is accessible
 * Remove in production
 */
webhookRoutes.get('/midtrans/test', (c) => {
  return c.json({
    message: 'Midtrans webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
  })
})

export { webhookRoutes }
