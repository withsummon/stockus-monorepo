import { eq, sql } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'
import { db } from '../db/index.js'
import { referrals, referralUsages } from '../db/schema/index.js'
import { env } from '../config/env.js'

// Alphabet without ambiguous characters (0, O, I, l)
const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8)

// Result types - using string for ULID IDs
interface ReferralResult {
  success: boolean
  referralId?: string
  code?: string
  error?: string
}

interface ReferralValidationResult {
  success: boolean
  referralId?: string
  referrerId?: string
  error?: string
}

/**
 * Generate a unique referral code for a user
 * Called when user becomes a member (after first subscription payment)
 */
export async function generateReferralCode(userId: string): Promise<ReferralResult> {
  // Check if user already has a referral code
  const existing = await db.query.referrals.findFirst({
    where: eq(referrals.userId, userId),
  })

  if (existing) {
    return {
      success: true,
      referralId: existing.id,
      code: existing.code
    }
  }

  // Generate unique code with retry logic
  let attempts = 0
  const maxAttempts = 5

  while (attempts < maxAttempts) {
    const code = generateCode()

    try {
      const [referral] = await db.insert(referrals)
        .values({
          userId,
          code,
        })
        .returning()

      return {
        success: true,
        referralId: referral.id,
        code: referral.code
      }
    } catch (err: unknown) {
      // Check for unique constraint violation (code collision)
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        attempts++
        continue
      }
      throw err
    }
  }

  return {
    success: false,
    error: 'Failed to generate unique referral code after multiple attempts'
  }
}

/**
 * Validate a referral code
 * Returns referral ID and referrer user ID if valid
 */
export async function validateReferralCode(code: string): Promise<ReferralValidationResult> {
  const normalizedCode = code.toUpperCase().trim()

  const referral = await db.query.referrals.findFirst({
    where: eq(referrals.code, normalizedCode),
  })

  if (!referral) {
    return { success: false, error: 'Invalid referral code' }
  }

  return {
    success: true,
    referralId: referral.id,
    referrerId: referral.userId
  }
}

/**
 * Record referral reward when referred user completes payment
 * Call this from webhook handler ONLY on successful settlement
 *
 * Uses transaction to ensure atomicity:
 * 1. Insert usage record
 * 2. Update referral stats
 */
export async function recordReferralReward(
  referralId: string,
  newUserId: string,
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  const rewardAmount = env.REFERRAL_REWARD_AMOUNT

  try {
    await db.transaction(async (tx) => {
      // Insert usage record
      await tx.insert(referralUsages).values({
        referralId,
        newUserId,
        paymentId,
        rewardAmount,
      })

      // Update referral stats (atomic increment)
      await tx.update(referrals)
        .set({
          totalUses: sql`${referrals.totalUses} + 1`,
          rewardsEarned: sql`${referrals.rewardsEarned} + ${rewardAmount}`,
        })
        .where(eq(referrals.id, referralId))
    })

    return { success: true }
  } catch (err) {
    console.error('Failed to record referral reward:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record referral reward'
    }
  }
}

/**
 * Get referral stats for a user
 * Used in member dashboard to show referral performance
 */
export async function getReferralStats(userId: string) {
  const referral = await db.query.referrals.findFirst({
    where: eq(referrals.userId, userId),
    with: {
      usages: {
        columns: {
          id: true,
          rewardAmount: true,
          createdAt: true,
        },
      },
    },
  })

  if (!referral) {
    return null
  }

  return {
    code: referral.code,
    totalUses: referral.totalUses,
    rewardsEarned: referral.rewardsEarned,
    recentUsages: referral.usages.slice(0, 10), // Last 10 usages
  }
}

/**
 * Get referral by code (for display purposes)
 */
export async function getReferralByCode(code: string) {
  return db.query.referrals.findFirst({
    where: eq(referrals.code, code.toUpperCase().trim()),
  })
}
