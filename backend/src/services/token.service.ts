import crypto from 'crypto'

/**
 * Generate a cryptographically secure random token
 * @param bytes Number of random bytes (default 32 = 64 hex chars)
 */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Hash a token using SHA-256 for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Verify a token against a stored hash using timing-safe comparison
 */
export function verifyTokenHash(token: string, storedHash: string): boolean {
  const computedHash = hashToken(token)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    )
  } catch {
    // Lengths don't match
    return false
  }
}

/**
 * Create a Date object N minutes from now
 */
export function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

/**
 * Create a Date object N days from now
 */
export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

/**
 * Create a Date object N hours from now
 */
export function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
