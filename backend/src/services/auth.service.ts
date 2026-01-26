import argon2 from 'argon2'
import { sign } from 'hono/jwt'
import { env } from '../config/env.js'
import { generateToken, hashToken, daysFromNow } from './token.service.js'

// Argon2id configuration per OWASP 2026 recommendations
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 25600,  // ~25MB RAM
  timeCost: 3,        // 3 iterations
  parallelism: 1,     // Single thread
}

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_CONFIG)
}

/**
 * Verify a password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

/**
 * JWT payload structure
 * Extends Hono's JWTPayload with index signature for compatibility
 */
export interface JwtPayload {
  [key: string]: unknown  // Required for Hono JWTPayload compatibility
  sub: number       // User ID
  tier: string      // User tier
  exp: number       // Expiration timestamp
  iat: number       // Issued at timestamp
}

/**
 * Generate JWT access token (short-lived, 15 min default)
 */
export async function generateAccessToken(
  userId: number,
  tier: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: userId,
    tier,
    iat: now,
    exp: now + env.JWT_ACCESS_EXPIRES_MINUTES * 60,
  }

  return sign(payload, env.JWT_SECRET)
}

/**
 * Generate refresh token (random string, stored hashed in DB)
 * Returns both raw token (for cookie) and hash (for DB storage)
 */
export function generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
  const token = generateToken(32)
  const hash = hashToken(token)
  const expiresAt = daysFromNow(env.JWT_REFRESH_EXPIRES_DAYS)

  return { token, hash, expiresAt }
}

/**
 * User tiers for access control
 */
export type UserTier = 'anonymous' | 'free' | 'member'

export const TIER_LEVELS: Record<UserTier, number> = {
  anonymous: 0,
  free: 1,
  member: 2,
}
