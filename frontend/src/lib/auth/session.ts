import 'server-only'

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development'
)

export const AUTH_COOKIE_NAME = 'access_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'
