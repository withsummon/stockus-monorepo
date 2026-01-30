import midtransClient from 'midtrans-client'
import { nanoid } from 'nanoid'
import { env } from '../config/env.js'

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION,
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
})

// Result types following existing pattern (from email.service.ts)
interface PaymentResult {
  success: boolean
  token?: string
  redirectUrl?: string
  orderId?: string
  error?: string
}

interface PaymentParams {
  userId: string // ULID
  userEmail: string
  userName: string
  amount: number // In IDR
  promoCodeId?: string // ULID
  referralId?: string // ULID
}

/**
 * Generate unique order ID
 * Midtrans max order_id length is 50 characters
 * Format: SUB-{nanoid(16)} for subscriptions (20 chars)
 *         WS-{nanoid(16)} for workshops (19 chars)
 * We store the actual userId/workshopId in the payment record, not in the order_id
 */
function generateOrderId(prefix: string): string {
  return `${prefix}-${nanoid(16)}`
}

/**
 * Create Midtrans Snap transaction for annual subscription
 * Returns token for frontend Snap.js integration
 */
export async function createSubscriptionPayment(
  params: PaymentParams
): Promise<PaymentResult> {
  const { userEmail, userName, amount, promoCodeId, referralId } = params

  const orderId = generateOrderId('SUB')

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: userName,
        email: userEmail,
      },
      item_details: [{
        id: 'annual-subscription',
        price: amount,
        quantity: 1,
        name: 'StockUs Annual Membership',
      }],
      // Callback URLs for redirect mode
      callbacks: {
        finish: `${env.FRONTEND_URL}/checkout/success`,
        unfinish: `${env.FRONTEND_URL}/checkout/pending`,
        error: `${env.FRONTEND_URL}/checkout?error=payment_failed`,
      },
      // Store metadata for webhook processing (optional, for reference)
      custom_field1: promoCodeId || '',
      custom_field2: referralId || '',
    }

    const transaction = await snap.createTransaction(parameter)

    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    }
  } catch (err) {
    console.error('Midtrans subscription payment error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create payment'
    }
  }
}

/**
 * Create Midtrans Snap transaction for workshop purchase
 */
export async function createWorkshopPayment(
  params: PaymentParams & { workshopId: string; workshopName: string }
): Promise<PaymentResult> {
  const { userEmail, userName, amount, workshopId, workshopName, promoCodeId, referralId } = params

  const orderId = generateOrderId('WS')

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: userName,
        email: userEmail,
      },
      item_details: [{
        id: `workshop-${workshopId.substring(0, 10)}`, // Truncate for item_id length limits
        price: amount,
        quantity: 1,
        name: workshopName.substring(0, 50), // Midtrans item name limit
      }],
      // Callback URLs for redirect mode
      callbacks: {
        finish: `${env.FRONTEND_URL}/checkout/success`,
        unfinish: `${env.FRONTEND_URL}/checkout/pending`,
        error: `${env.FRONTEND_URL}/checkout?error=payment_failed`,
      },
      // Store metadata for webhook processing (optional, for reference)
      custom_field1: promoCodeId || '',
      custom_field2: referralId || '',
    }

    const transaction = await snap.createTransaction(parameter)

    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    }
  } catch (err) {
    console.error('Midtrans workshop payment error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create payment'
    }
  }
}

/**
 * Check transaction status via Midtrans API
 * Use as fallback when webhook doesn't arrive
 */
export async function checkTransactionStatus(orderId: string): Promise<PaymentResult & { status?: string }> {
  try {
    const response = await snap.transaction.status(orderId)

    return {
      success: true,
      orderId,
      status: response.transaction_status,
    }
  } catch (err) {
    console.error('Midtrans status check error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to check status'
    }
  }
}
