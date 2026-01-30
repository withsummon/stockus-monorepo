import { and, eq, gt, or, isNull, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { promoCodes } from '../db/schema/index.js'

// Result types following existing pattern
interface PromoValidationResult {
  success: boolean
  promoCodeId?: string // ULID
  discountPercent?: number
  error?: string
}

/**
 * Validate a promo code
 * Checks: exists, active, not expired, within usage limits
 */
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  const normalizedCode = code.toUpperCase().trim()

  const promo = await db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.code, normalizedCode),
      eq(promoCodes.isActive, true),
      // Not expired: expiresAt is null OR expiresAt > now
      or(
        isNull(promoCodes.expiresAt),
        gt(promoCodes.expiresAt, new Date())
      ),
      // Not before valid period: validFrom is null OR validFrom <= now
      or(
        isNull(promoCodes.validFrom),
        sql`${promoCodes.validFrom} <= NOW()`
      ),
      // Within usage limits: maxUses is null OR currentUses < maxUses
      or(
        isNull(promoCodes.maxUses),
        sql`${promoCodes.currentUses} < ${promoCodes.maxUses}`
      )
    ),
  })

  if (!promo) {
    return { success: false, error: 'Invalid or expired promo code' }
  }

  return {
    success: true,
    promoCodeId: promo.id,
    discountPercent: promo.discountPercent
  }
}

/**
 * Apply promo code (increment usage counter)
 * Call this AFTER successful payment confirmation
 * Uses atomic increment to prevent race conditions
 */
export async function applyPromoCode(promoCodeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(promoCodes)
      .set({
        currentUses: sql`${promoCodes.currentUses} + 1`,
        updatedAt: new Date()
      })
      .where(eq(promoCodes.id, promoCodeId))

    return { success: true }
  } catch (err) {
    console.error('Failed to apply promo code:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to apply promo code'
    }
  }
}

/**
 * Calculate discounted amount
 * @param originalAmount - Original price in IDR
 * @param discountPercent - Discount percentage (0-100)
 * @returns Discounted amount (rounded to nearest integer)
 */
export function calculateDiscountedAmount(
  originalAmount: number,
  discountPercent: number
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    return originalAmount
  }
  const discount = Math.round(originalAmount * (discountPercent / 100))
  return originalAmount - discount
}

/**
 * Get promo code by ID
 * Used for displaying applied discount in UI
 */
export async function getPromoCode(id: string) {
  return db.query.promoCodes.findFirst({
    where: eq(promoCodes.id, id),
  })
}
