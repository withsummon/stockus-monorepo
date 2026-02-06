import 'server-only'

// Fail fast if JWT_SECRET is not set - this is a critical security requirement
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set')
}

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export const AUTH_COOKIE_NAME = 'access_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'
