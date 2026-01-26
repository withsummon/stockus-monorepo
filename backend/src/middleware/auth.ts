import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { env } from '../config/env.js'
import { JwtPayload, UserTier, TIER_LEVELS } from '../services/auth.service.js'

/**
 * Context variables set by auth middleware
 */
export interface AuthVariables {
  userId: number
  userTier: UserTier
  jwtPayload: JwtPayload
}

/**
 * Required authentication middleware
 * Returns 401 if no valid token present
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'access_token')

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    // Explicitly specify HS256 algorithm to prevent algorithm confusion attacks
    const payload = await verify(token, env.JWT_SECRET, 'HS256') as JwtPayload

    // Set context variables for downstream handlers
    c.set('userId', payload.sub)
    c.set('userTier', payload.tier as UserTier)
    c.set('jwtPayload', payload)

    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

/**
 * Optional authentication middleware
 * Sets user context if token present, continues without if not
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'access_token')

  if (token) {
    try {
      // Explicitly specify HS256 algorithm to prevent algorithm confusion attacks
      const payload = await verify(token, env.JWT_SECRET, 'HS256') as JwtPayload
      c.set('userId', payload.sub)
      c.set('userTier', payload.tier as UserTier)
      c.set('jwtPayload', payload)
    } catch {
      // Token invalid but optional, continue without auth
      c.set('userTier', 'anonymous' as UserTier)
    }
  } else {
    c.set('userTier', 'anonymous' as UserTier)
  }

  await next()
}

/**
 * Tier-based authorization middleware factory
 * Use after authMiddleware to require minimum tier level
 */
export function requireTier(minTier: UserTier) {
  return async (c: Context, next: Next) => {
    const userTier = c.get('userTier') as UserTier

    if (!userTier || TIER_LEVELS[userTier] < TIER_LEVELS[minTier]) {
      return c.json({
        error: 'Insufficient permissions',
        required: minTier,
        current: userTier || 'anonymous'
      }, 403)
    }

    await next()
  }
}

/**
 * Helper type for Hono app with auth variables
 */
export type AuthEnv = {
  Variables: AuthVariables
}
