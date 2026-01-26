import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { eq, and, gt } from 'drizzle-orm'

import { db } from '../db/index.js'
import { users } from '../db/schema/users.js'
import { sessions } from '../db/schema/sessions.js'
import { tokens } from '../db/schema/tokens.js'
import { env } from '../config/env.js'
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
} from '../services/auth.service.js'
import { hashToken, hoursFromNow, generateToken } from '../services/token.service.js'
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/email.service.js'
import { authMiddleware, AuthEnv } from '../middleware/auth.js'

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'Strict' as const,
  path: '/',
}

export const auth = new Hono<AuthEnv>()

/**
 * POST /auth/signup
 * Create new user account, send verification email
 */
auth.post('/signup', zValidator('json', signupSchema), async (c) => {
  const { email, password, name } = c.req.valid('json')

  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  })

  if (existingUser) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const [user] = await db.insert(users).values({
    email: email.toLowerCase(),
    name,
    passwordHash,
    isVerified: false,
    tier: 'free',
  }).returning({ id: users.id, email: users.email, name: users.name })

  // Generate verification token
  const verificationToken = generateToken()
  const tokenHash = hashToken(verificationToken)

  await db.insert(tokens).values({
    userId: user.id,
    type: 'email_verification',
    tokenHash,
    expiresAt: hoursFromNow(24), // 24 hour expiry
  })

  // Send verification email (don't block on failure)
  sendVerificationEmail(user.email, verificationToken, user.name).catch(err => {
    console.error('Failed to send verification email:', err)
  })

  return c.json({
    message: 'Account created. Please check your email to verify.',
    user: { id: user.id, email: user.email, name: user.name }
  }, 201)
})

/**
 * POST /auth/login
 * Authenticate user, issue JWT tokens in cookies
 */
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  })

  if (!user || !user.passwordHash) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  // Check email verification
  if (!user.isVerified) {
    return c.json({ error: 'Please verify your email before logging in' }, 403)
  }

  // Generate tokens
  const accessToken = await generateAccessToken(user.id, user.tier)
  const { token: refreshToken, hash: refreshHash, expiresAt } = generateRefreshToken()

  // Store refresh token in database
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt,
  })

  // Set cookies
  setCookie(c, 'access_token', accessToken, {
    ...COOKIE_CONFIG,
    maxAge: env.JWT_ACCESS_EXPIRES_MINUTES * 60,
  })

  setCookie(c, 'refresh_token', refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60,
    path: '/auth/refresh', // Limit refresh token scope
  })

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
    }
  })
})

/**
 * POST /auth/logout
 * Clear tokens and invalidate session
 */
auth.post('/logout', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const refreshToken = getCookie(c, 'refresh_token')

  // Delete session from database if refresh token present
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await db.delete(sessions).where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.tokenHash, tokenHash)
      )
    )
  }

  // Clear cookies
  deleteCookie(c, 'access_token', { path: '/' })
  deleteCookie(c, 'refresh_token', { path: '/auth/refresh' })

  return c.json({ message: 'Logged out successfully' })
})

/**
 * POST /auth/refresh
 * Rotate refresh token and issue new access token
 */
auth.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token')

  if (!refreshToken) {
    return c.json({ error: 'Refresh token required' }, 401)
  }

  const tokenHash = hashToken(refreshToken)

  // Find and validate session
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.tokenHash, tokenHash),
      gt(sessions.expiresAt, new Date())
    ),
  })

  if (!session) {
    // Clear potentially invalid cookies
    deleteCookie(c, 'access_token', { path: '/' })
    deleteCookie(c, 'refresh_token', { path: '/auth/refresh' })
    return c.json({ error: 'Invalid or expired refresh token' }, 401)
  }

  // Get user for new token
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 401)
  }

  // Delete old session (rotation)
  await db.delete(sessions).where(eq(sessions.id, session.id))

  // Generate new tokens
  const newAccessToken = await generateAccessToken(user.id, user.tier)
  const { token: newRefreshToken, hash: newRefreshHash, expiresAt } = generateRefreshToken()

  // Store new refresh token
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: newRefreshHash,
    expiresAt,
  })

  // Set new cookies
  setCookie(c, 'access_token', newAccessToken, {
    ...COOKIE_CONFIG,
    maxAge: env.JWT_ACCESS_EXPIRES_MINUTES * 60,
  })

  setCookie(c, 'refresh_token', newRefreshToken, {
    ...COOKIE_CONFIG,
    maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60,
    path: '/auth/refresh',
  })

  return c.json({ message: 'Tokens refreshed' })
})

/**
 * GET /auth/me
 * Get current user info (requires auth)
 */
auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      tier: true,
      isVerified: true,
      createdAt: true,
    }
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user })
})

/**
 * GET /auth/verify-email
 * Verify email using token from email link
 */
auth.get('/verify-email', async (c) => {
  const token = c.req.query('token')

  if (!token) {
    return c.json({ error: 'Verification token required' }, 400)
  }

  const tokenHash = hashToken(token)

  // Find valid token
  const tokenRecord = await db.query.tokens.findFirst({
    where: and(
      eq(tokens.tokenHash, tokenHash),
      eq(tokens.type, 'email_verification'),
      gt(tokens.expiresAt, new Date())
    ),
  })

  if (!tokenRecord) {
    return c.json({ error: 'Invalid or expired verification token' }, 400)
  }

  // Update user and delete token in transaction
  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ isVerified: true })
      .where(eq(users.id, tokenRecord.userId))

    await tx.delete(tokens).where(eq(tokens.id, tokenRecord.id))
  })

  return c.json({ message: 'Email verified successfully. You can now log in.' })
})

/**
 * POST /auth/resend-verification
 * Resend verification email for unverified user
 */
auth.post('/resend-verification', zValidator('json', z.object({
  email: z.string().email(),
})), async (c) => {
  const { email } = c.req.valid('json')

  // Find unverified user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  })

  // Always return success to prevent enumeration
  if (user && !user.isVerified) {
    // Delete any existing verification tokens
    await db.delete(tokens).where(
      and(
        eq(tokens.userId, user.id),
        eq(tokens.type, 'email_verification')
      )
    )

    // Generate new token
    const verificationToken = generateToken()
    const tokenHash = hashToken(verificationToken)

    await db.insert(tokens).values({
      userId: user.id,
      type: 'email_verification',
      tokenHash,
      expiresAt: hoursFromNow(24),
    })

    sendVerificationEmail(user.email, verificationToken, user.name).catch(err => {
      console.error('Failed to send verification email:', err)
    })
  }

  return c.json({ message: 'If your account exists and is unverified, a new verification email has been sent.' })
})

/**
 * POST /auth/forgot-password
 * Send password reset email
 */
auth.post('/forgot-password', zValidator('json', z.object({
  email: z.string().email(),
})), async (c) => {
  const { email } = c.req.valid('json')

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  })

  // Always return success to prevent enumeration
  if (user) {
    // Delete any existing password reset tokens for this user
    await db.delete(tokens).where(
      and(
        eq(tokens.userId, user.id),
        eq(tokens.type, 'password_reset')
      )
    )

    // Generate reset token
    const resetToken = generateToken()
    const tokenHash = hashToken(resetToken)

    await db.insert(tokens).values({
      userId: user.id,
      type: 'password_reset',
      tokenHash,
      expiresAt: hoursFromNow(1), // 1 hour expiry for password reset
    })

    sendPasswordResetEmail(user.email, resetToken).catch(err => {
      console.error('Failed to send password reset email:', err)
    })
  }

  return c.json({ message: 'If an account exists with this email, a password reset link has been sent.' })
})

/**
 * POST /auth/reset-password
 * Reset password using token
 */
auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, newPassword } = c.req.valid('json')

  const tokenHash = hashToken(token)

  // Find valid token
  const tokenRecord = await db.query.tokens.findFirst({
    where: and(
      eq(tokens.tokenHash, tokenHash),
      eq(tokens.type, 'password_reset'),
      gt(tokens.expiresAt, new Date())
    ),
  })

  if (!tokenRecord) {
    return c.json({ error: 'Invalid or expired reset token' }, 400)
  }

  // Get user for email notification
  const user = await db.query.users.findFirst({
    where: eq(users.id, tokenRecord.userId),
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 400)
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword)

  // Update password, delete all tokens, invalidate all sessions
  await db.transaction(async (tx) => {
    // Update password
    await tx.update(users)
      .set({ passwordHash })
      .where(eq(users.id, tokenRecord.userId))

    // Delete ALL password reset tokens for this user
    await tx.delete(tokens).where(
      and(
        eq(tokens.userId, tokenRecord.userId),
        eq(tokens.type, 'password_reset')
      )
    )

    // Invalidate all sessions (force re-login)
    await tx.delete(sessions).where(eq(sessions.userId, tokenRecord.userId))
  })

  // Send notification email
  sendPasswordChangedEmail(user.email).catch(err => {
    console.error('Failed to send password changed email:', err)
  })

  return c.json({ message: 'Password reset successful. Please log in with your new password.' })
})
