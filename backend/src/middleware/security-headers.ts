import { Context, Next } from 'hono'
import { env } from '../config/env.js'

/**
 * Security headers middleware
 * Adds important security headers to all responses
 */
export async function securityHeaders(c: Context, next: Next) {
  await next()

  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY')

  // XSS Protection (legacy browsers)
  c.header('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (formerly Feature-Policy)
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // Content Security Policy
  // Adjust based on your frontend requirements
  if (env.NODE_ENV === 'production') {
    c.header(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",  // Allow inline styles for emails
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    )
  }

  // Strict Transport Security (HTTPS only)
  if (env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}
