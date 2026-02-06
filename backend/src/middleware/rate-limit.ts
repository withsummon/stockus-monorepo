import { Context, Next } from 'hono'

/**
 * Simple in-memory rate limiter
 * For production with multiple instances, use Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyGenerator?: (c: Context) => string  // Custom key generator
  skipSuccessfulRequests?: boolean       // Don't count successful requests
  message?: string      // Custom error message
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    message = 'Too many requests, please try again later',
  } = config

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c)
    const now = Date.now()

    let entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      }
      rateLimitStore.set(key, entry)
    } else {
      entry.count++
    }

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count)
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000)

    c.header('X-RateLimit-Limit', String(maxRequests))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Reset', String(resetSeconds))

    if (entry.count > maxRequests) {
      c.header('Retry-After', String(resetSeconds))
      return c.json({ error: message }, 429)
    }

    await next()
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Strict rate limit for authentication endpoints (5 requests per minute)
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again in a minute',
})

// Rate limit for login specifically (10 requests per 15 minutes)
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 10,
  message: 'Too many login attempts, please try again later',
})

// Rate limit for signup (3 requests per hour)
export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 3,
  message: 'Too many signup attempts, please try again later',
})

// Rate limit for password reset requests (3 per hour)
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 3,
  message: 'Too many password reset requests, please try again later',
})

// Rate limit for payment endpoints (10 per minute)
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10,
  message: 'Too many payment requests, please try again later',
})

// General API rate limit (100 requests per minute)
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,
  message: 'Too many requests, please slow down',
})
