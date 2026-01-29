import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { JWT_SECRET, AUTH_COOKIE_NAME } from './session'
import type { SessionPayload, User } from '@/types/auth'

// Cache verification result for request lifecycle
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
})

// Require auth - redirects to login if not authenticated
export const requireAuth = cache(async () => {
  const session = await verifySession()
  if (!session) {
    redirect('/login')
  }
  return session
})

// Require member tier - redirects to pricing if free user
export const requireMember = cache(async () => {
  const session = await requireAuth()
  if (session.tier !== 'member') {
    redirect('/pricing')
  }
  return session
})

// Get full user info from backend
export const getUser = cache(async (): Promise<User | null> => {
  const session = await verifySession()
  if (!session) {
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/auth/me`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.user
  } catch {
    return null
  }
})
