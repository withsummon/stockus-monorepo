import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Fail fast if JWT_SECRET is not set - this is a critical security requirement
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/courses',
  '/downloads',
  '/cohorts',
  '/profile',
]

// Routes that authenticated users shouldn't access
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  const pathname = req.nextUrl.pathname

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  )
  const isAuthRoute = AUTH_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // Verify token if present
  let isValidToken = false
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] })
      isValidToken = true
    } catch {
      // Token invalid or expired
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, etc
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
}
