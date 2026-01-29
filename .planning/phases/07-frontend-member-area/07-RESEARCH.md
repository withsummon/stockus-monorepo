# Phase 7: Frontend - Member Area - Research

**Researched:** 2026-01-29
**Domain:** Next.js 15 App Router authenticated frontend with video streaming
**Confidence:** HIGH

## Summary

Phase 7 builds the authenticated member area with dashboard, course player, research library, template downloads, cohort enrollment, and profile management. The implementation uses Next.js 15 App Router's native authentication patterns with Server Components by default, requiring a Data Access Layer (DAL) for secure authorization checks. The existing backend provides JWT-based authentication with httpOnly cookies (access_token, refresh_token) that must be forwarded to the backend API.

The architecture follows defense-in-depth: middleware for optimistic redirects, DAL functions for secure data access, and server-side session verification for all protected operations. Video playback uses signed URLs from Cloudflare R2 with HTML5 video or react-player. Progress tracking, downloads, and cohort enrollment are all server-rendered by default with client components only for interactive UI elements.

**Primary recommendation:** Implement DAL pattern for all authenticated data fetching, use Server Components by default with Client Components only for interactive elements (video controls, download buttons), and leverage existing shadcn/ui components (Progress, Badge) for consistent UI.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15+ | App Router framework | Already chosen (06-01), Server Components by default, streaming SSR |
| React | 19+ | UI library | Required by Next.js 15, Server Actions support |
| shadcn/ui | Latest | UI components | Already chosen (06-01), Progress/Badge available |
| Jose | Latest | JWT verification | Official Next.js auth guide uses it for stateless sessions |
| cookies-next | Latest | Client-side cookie access | Safe client-side cookie operations with SSR support |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-player | 3.x | Video playback | HLS/signed URL playback, works with Next.js dynamic import |
| axios | 1.x | File downloads with progress | onDownloadProgress for tracking template downloads |
| jsPDF | 2.x | PDF generation | Certificate generation after course completion |
| lucide-react | Latest | Icons | Already in use (06-01), consistent icon library |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-player | Video.js with React wrapper | More control but requires manual lifecycle management, heavier |
| Jose | NextAuth.js | Existing backend uses custom JWT, NextAuth overkill for simple verification |
| axios for download | Fetch API | Works but manual progress tracking implementation |
| jsPDF | react-pdf-renderer | react-pdf works but jsPDF simpler for certificate use case |

**Installation:**
```bash
cd frontend
npm install jose cookies-next axios jspdf
npm install react-player # dynamic import only
```

## Architecture Patterns

### Recommended Project Structure

```
frontend/src/
├── app/
│   ├── (auth)/             # Route group for authenticated pages
│   │   ├── layout.tsx      # Member layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Dashboard overview (Server Component)
│   │   ├── courses/
│   │   │   ├── page.tsx    # Course list
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # Course detail
│   │   │       └── [session]/     # Course player
│   │   │           └── page.tsx
│   │   ├── research/
│   │   │   ├── page.tsx    # Research library
│   │   │   └── [slug]/page.tsx
│   │   ├── downloads/
│   │   │   └── page.tsx    # Download history & templates
│   │   ├── cohorts/
│   │   │   └── page.tsx    # Cohort enrollment & schedule
│   │   └── profile/
│   │       └── page.tsx    # Profile management
│   ├── login/
│   │   └── page.tsx
│   └── middleware.ts       # Auth redirects
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          # Client Component
│   │   └── LogoutButton.tsx       # Client Component
│   ├── member/
│   │   ├── Sidebar.tsx            # Server Component
│   │   ├── DashboardStats.tsx     # Server Component
│   │   ├── CourseProgress.tsx     # Server Component
│   │   ├── VideoPlayer.tsx        # Client Component (react-player)
│   │   ├── DownloadButton.tsx     # Client Component (progress)
│   │   └── EmptyState.tsx         # Server Component
│   └── ui/
│       └── progress.tsx           # shadcn component (install)
├── lib/
│   ├── auth/
│   │   ├── dal.ts                 # Data Access Layer (Server only)
│   │   ├── session.ts             # Session helpers (Server only)
│   │   └── client-auth.ts         # Client-side auth state
│   ├── api-client.ts              # Enhanced API client with auth
│   └── downloads.ts               # Download helpers
└── types/
    └── member.ts                  # Member-specific types
```

### Pattern 1: Data Access Layer (DAL) for Authentication

**What:** Centralized functions that verify session and fetch user data, called from Server Components

**When to use:** Every authenticated data fetch, any route that requires user context

**Example:**
```typescript
// lib/auth/dal.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

interface SessionPayload {
  sub: number // userId
  tier: 'free' | 'member'
  exp: number
}

// Cache verification result for request lifecycle
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    return null
  }
})

// Protected data fetching
export const requireAuth = cache(async () => {
  const session = await verifySession()
  if (!session) {
    redirect('/login')
  }
  return session
})

// Get user with automatic redirect
export const getUser = cache(async () => {
  const session = await requireAuth()

  const res = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: {
      Cookie: `access_token=${(await cookies()).get('access_token')?.value}`,
    },
  })

  if (!res.ok) {
    redirect('/login')
  }

  return res.json()
})
```

**Usage in Server Component:**
```typescript
// app/(auth)/dashboard/page.tsx
import { requireAuth, getUser } from '@/lib/auth/dal'

export default async function DashboardPage() {
  const session = await requireAuth()
  const user = await getUser()

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Tier: {session.tier}</p>
    </div>
  )
}
```

### Pattern 2: Middleware for Optimistic Route Protection

**What:** Fast edge-level redirect before page renders

**When to use:** Protecting entire route groups from unauthenticated access

**Example:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value

  // Protect /dashboard/* routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/courses') ||
      req.nextUrl.pathname.startsWith('/research') ||
      req.nextUrl.pathname.startsWith('/downloads') ||
      req.nextUrl.pathname.startsWith('/cohorts') ||
      req.nextUrl.pathname.startsWith('/profile')) {

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] })
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Redirect authenticated users away from login
  if (req.nextUrl.pathname === '/login' && token) {
    try {
      await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] })
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch {
      // Invalid token, continue to login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
```

### Pattern 3: Enhanced API Client with Cookie Forwarding

**What:** Wrap existing fetchAPI to forward authentication cookies to backend

**When to use:** All API calls from Server Components that need authentication

**Example:**
```typescript
// lib/api-client.ts
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:3000'

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const { revalidate, ...fetchOptions } = options

  // Forward authentication cookies to backend
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value

  const cookieHeader = [
    accessToken ? `access_token=${accessToken}` : '',
    refreshToken ? `refresh_token=${refreshToken}` : '',
  ].filter(Boolean).join('; ')

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Client-side API calls (from Client Components)
export async function clientFetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send cookies automatically
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
```

### Pattern 4: Video Player with Signed URLs

**What:** Client Component that fetches playback URL and initializes react-player

**When to use:** Course session video playback

**Example:**
```typescript
// components/member/VideoPlayer.tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { clientFetchAPI } from '@/lib/api-client'

// Dynamic import to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface VideoPlayerProps {
  videoId: number
  sessionId: number
  onProgress?: (progress: number) => void
}

export function VideoPlayer({ videoId, sessionId, onProgress }: VideoPlayerProps) {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlaybackUrl() {
      try {
        const data = await clientFetchAPI<{ playbackUrl: string }>(
          `/videos/${videoId}/playback`
        )
        setPlaybackUrl(data.playbackUrl)
      } catch (err) {
        setError('Failed to load video')
      }
    }

    fetchPlaybackUrl()
  }, [videoId])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!playbackUrl) {
    return <div>Loading video...</div>
  }

  return (
    <ReactPlayer
      url={playbackUrl}
      controls
      width="100%"
      height="100%"
      onProgress={({ played }) => onProgress?.(played * 100)}
    />
  )
}
```

### Pattern 5: File Download with Progress

**What:** Client Component that tracks download progress with axios

**When to use:** Template downloads with visual feedback

**Example:**
```typescript
// components/member/DownloadButton.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Download } from 'lucide-react'

interface DownloadButtonProps {
  templateId: number
  filename: string
}

export function DownloadButton({ templateId, filename }: DownloadButtonProps) {
  const [progress, setProgress] = useState(0)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    setProgress(0)

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/templates/${templateId}/download`,
        {
          responseType: 'blob',
          withCredentials: true,
          onDownloadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            setProgress(percent)
          },
        }
      )

      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {downloading ? `Downloading ${progress}%` : 'Download'}
      </Button>
      {downloading && <Progress value={progress} />}
    </div>
  )
}
```

### Pattern 6: Empty State for First-Time Users

**What:** Server Component that shows helpful onboarding when no content exists

**When to use:** Dashboard, course list, download history when user has no data

**Example:**
```typescript
// components/member/EmptyState.tsx
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        {icon || <BookOpen className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}

// Usage
<EmptyState
  title="Belum ada kursus yang diikuti"
  description="Mulai perjalanan belajar Anda dengan mendaftar kursus pertama."
  actionLabel="Lihat Kursus"
  actionHref="/courses"
/>
```

### Pattern 7: Dashboard Sidebar Layout

**What:** Nested layout with persistent sidebar navigation

**When to use:** All authenticated pages

**Example:**
```typescript
// app/(auth)/layout.tsx
import { Sidebar } from '@/components/member/Sidebar'
import { requireAuth } from '@/lib/auth/dal'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify auth at layout level
  await requireAuth()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Don't use React Context for auth state in Server Components** - Context only works in Client Components, use DAL pattern instead
- **Don't rely on middleware alone for authorization** - Middleware is optimistic, always verify in DAL/Server Component
- **Don't fetch data in Client Components by default** - Use Server Components for initial data, Client only for interactivity
- **Don't store session data in localStorage** - httpOnly cookies are more secure, already provided by backend
- **Don't manually implement cookie refresh logic** - Backend handles refresh token rotation, frontend just forwards cookies

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video player controls | Custom HTML5 video UI | react-player | Handles HLS, quality selection, playback speed, cross-browser issues |
| File download progress | Manual Fetch with ReadableStream | axios with onDownloadProgress | Built-in progress tracking, simpler API |
| PDF certificate generation | HTML to PDF conversion | jsPDF | Direct PDF generation, better typography control |
| Session verification | Manual JWT decode/verify | jose library | Official recommendation, handles edge cases |
| Client-side cookies | Manual document.cookie parsing | cookies-next | SSR-safe, prevents hydration mismatches |

**Key insight:** Authentication is complex enough without adding custom implementations. Use battle-tested libraries for video, downloads, PDFs, and JWT handling. Focus implementation effort on business logic (course progress, cohort management) rather than infrastructure.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with Client-Side Auth

**What goes wrong:** Using cookies or localStorage in Client Components during render causes content mismatch between server and client

**Why it happens:** Server doesn't have access to client-side storage during SSR

**How to avoid:**
- Use DAL pattern in Server Components for auth state
- If Client Component needs auth, fetch in useEffect after hydration
- Use cookies-next with useEffect wrapper

**Warning signs:** Console errors about hydration mismatch, flash of wrong content

**Example:**
```typescript
// ❌ BAD - Causes hydration mismatch
'use client'
export function UserGreeting() {
  const user = getCookie('user') // Runs during SSR
  return <p>Hello {user?.name}</p>
}

// ✅ GOOD - Server Component with DAL
export async function UserGreeting() {
  const user = await getUser() // DAL function
  return <p>Hello {user.name}</p>
}

// ✅ GOOD - Client Component with useEffect
'use client'
export function UserGreeting() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    clientFetchAPI('/auth/me').then(setUser)
  }, [])

  if (!user) return <p>Loading...</p>
  return <p>Hello {user.name}</p>
}
```

### Pitfall 2: Video Player SSR Issues

**What goes wrong:** react-player or video.js breaks during server-side rendering

**Why it happens:** Video libraries rely on browser APIs (window, document) not available in Node.js

**How to avoid:**
- Use Next.js dynamic import with `{ ssr: false }`
- Wrap player in Client Component
- Show loading state until client-side hydration

**Warning signs:** "window is not defined" errors, blank video area

**Example:**
```typescript
// ✅ Correct dynamic import
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

'use client'
export function VideoPlayer({ url }: { url: string }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="aspect-video bg-muted animate-pulse" />
  }

  return <ReactPlayer url={url} controls />
}
```

### Pitfall 3: Expired Video URLs Not Refreshing

**What goes wrong:** Signed video URLs expire (1 hour) but player keeps using stale URL

**Why it happens:** URL fetched once in useEffect, not refreshed before expiry

**How to avoid:**
- Store expiry time with URL
- Implement refresh logic before playback URL expires
- Show error state with retry button

**Warning signs:** Video plays initially but fails after 1 hour, 403/404 errors in network tab

**Example:**
```typescript
'use client'
export function VideoPlayer({ videoId }: { videoId: number }) {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number>(0)

  const fetchPlaybackUrl = async () => {
    const data = await clientFetchAPI<{ playbackUrl: string }>(
      `/videos/${videoId}/playback`
    )
    setPlaybackUrl(data.playbackUrl)
    setExpiresAt(Date.now() + 50 * 60 * 1000) // Refresh 10min before expiry
  }

  useEffect(() => {
    fetchPlaybackUrl()

    // Refresh URL before expiry
    const refreshInterval = setInterval(() => {
      if (Date.now() > expiresAt) {
        fetchPlaybackUrl()
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [videoId, expiresAt])

  // ... rest of component
}
```

### Pitfall 4: Missing Tier Check in Frontend

**What goes wrong:** Free users can access member-only content by typing URL directly

**Why it happens:** Relying on middleware cookie check without verifying tier level

**How to avoid:**
- Backend already enforces tier checks (requireTier middleware)
- Frontend should also check and show appropriate UI
- Use DAL to fetch session with tier, verify in Server Component

**Warning signs:** Free users seeing 403 errors instead of upgrade prompts

**Example:**
```typescript
// app/(auth)/courses/[slug]/page.tsx
import { requireAuth } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const session = await requireAuth()

  try {
    const { course } = await fetchAPI<{ course: Course }>(`/courses/${params.slug}`)
    return <CourseContent course={course} />
  } catch (error) {
    // Backend returns 403 for insufficient permissions
    if (error.message.includes('403')) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Konten Premium</h2>
          <p className="mb-6">Kursus ini hanya tersedia untuk member.</p>
          <Button asChild>
            <Link href="/pricing">Upgrade ke Member</Link>
          </Button>
        </div>
      )
    }
    throw error
  }
}
```

### Pitfall 5: Empty State Without Actionable Next Steps

**What goes wrong:** New users see empty dashboard and don't know what to do

**Why it happens:** Only showing "No courses enrolled" without guidance

**How to avoid:**
- Always include action-focused empty states
- Two parts instruction, one part personality
- Provide clear next step (button to browse courses)

**Warning signs:** High bounce rates on dashboard, users not exploring features

**Example:**
```typescript
// ❌ BAD - Information only
<div>No courses enrolled yet.</div>

// ✅ GOOD - Action-focused with personality
<EmptyState
  icon={<GraduationCap className="h-12 w-12" />}
  title="Selamat datang! Mulai belajar hari ini"
  description="Anda belum mendaftar kursus. Jelajahi kursus kami dan mulai perjalanan investasi Anda."
  actionLabel="Lihat Semua Kursus"
  actionHref="/courses"
/>
```

## Code Examples

Verified patterns from official sources:

### Server Component Data Fetching with Auth

```typescript
// app/(auth)/dashboard/page.tsx
import { requireAuth } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client'
import { CourseProgress } from '@/components/member/CourseProgress'

export default async function DashboardPage() {
  const session = await requireAuth()

  // Fetch user's enrolled courses
  const { courses } = await fetchAPI<{ courses: Course[] }>('/courses', {
    revalidate: 60, // Cache for 1 minute
  })

  const enrolledCourses = courses.filter(c => c.isAccessible)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {enrolledCourses.length === 0 ? (
        <EmptyState
          title="Belum ada kursus"
          description="Mulai perjalanan belajar Anda."
          actionLabel="Lihat Kursus"
          actionHref="/courses"
        />
      ) : (
        <div className="grid gap-6">
          {enrolledCourses.map(course => (
            <CourseProgress key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Client Component Login Form with Server Action

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important: allows cookies
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      // Cookies are set automatically by browser
      router.push('/dashboard')
      router.refresh() // Refresh Server Components
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Loading...' : 'Login'}
      </Button>
    </form>
  )
}
```

### Progress Tracking Component

```typescript
// components/member/CourseProgress.tsx
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface CourseProgressProps {
  course: {
    id: number
    title: string
    slug: string
    sessions: Array<{
      id: number
      title: string
      completed?: boolean
    }>
  }
}

export function CourseProgress({ course }: CourseProgressProps) {
  const completedSessions = course.sessions.filter(s => s.completed).length
  const totalSessions = course.sessions.length
  const progress = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{course.title}</CardTitle>
            {progress === 100 ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Selesai
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Berlangsung
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedSessions} dari {totalSessions} sesi</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router + getServerSideProps | App Router + Server Components | Next.js 13+ (stable in 15) | Native async components, better streaming, automatic request deduplication |
| Client-side auth with useEffect | DAL pattern with server verification | 2025-2026 best practice | Defense-in-depth security, prevents prop drilling |
| Context providers for auth | Server Component data fetching | Next.js 13+ | Context doesn't work in Server Components, simpler data flow |
| useContext for global state | Server Component props | Next.js 13+ | Less client-side JavaScript, better performance |
| Custom cookie parsing | cookies-next library | 2024-2025 | SSR-safe, prevents hydration issues |
| hls.js manual integration | react-player | 2023+ | Simpler API, handles multiple formats, maintained |

**Deprecated/outdated:**
- **NextAuth with Pages Router patterns**: NextAuth v5 supports App Router but existing backend uses custom JWT, no need for full auth solution
- **Client-side JWT decoding with jwt-decode**: Security risk, use server-side verification only
- **localStorage for session**: Vulnerable to XSS, httpOnly cookies are standard
- **getServerSideProps**: Replaced by async Server Components in App Router

## Open Questions

Things that couldn't be fully resolved:

1. **Course progress tracking database schema**
   - What we know: Backend has courses and courseSessions tables, cohorts with enrollment
   - What's unclear: No explicit userProgress or courseEnrollments table found in schema
   - Recommendation: Phase 7 may need to create progress tracking tables, or derive progress from video watch history. Check with backend team or plan to add schema migration.

2. **Certificate generation trigger**
   - What we know: MEMB-04 requires completion certificates
   - What's unclear: Backend API endpoint for certificate generation not documented
   - Recommendation: Frontend can generate certificate PDF client-side with jsPDF using user/course data, or Phase 7 should add backend endpoint for certificate data.

3. **Cohort enrollment payment flow**
   - What we know: COHO-04 requires cohort enrollment, cohorts have price field
   - What's unclear: Whether cohort enrollment uses same Midtrans payment flow as subscriptions
   - Recommendation: Likely reuses existing payment flow (04-04 pattern), but confirm enrollment creates payment record or is subscription-included.

4. **Download history tracking**
   - What we know: MEMB-03 requires download history view
   - What's unclear: Backend doesn't have explicit downloadHistory table in schema
   - Recommendation: May need to add tracking table or derive from logs. For v1, can skip history and just show available templates.

## Sources

### Primary (HIGH confidence)

- [Next.js Official Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - DAL pattern, middleware setup, session management
- [Next.js Dashboard Tutorial - Layouts and Pages](https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages) - Sidebar layout, nested routes, partial rendering
- [shadcn/ui Progress Component](https://ui.shadcn.com/docs/components/progress) - Installation, usage, API reference
- Existing codebase (backend/src/middleware/auth.ts, backend/src/routes/auth.ts) - JWT structure, cookie names, authentication flow

### Secondary (MEDIUM confidence)

- [Complete Authentication Guide for Next.js App Router in 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router) - Server/Client Component patterns
- [Best React Video Player Libraries of 2026](https://blog.croct.com/post/best-react-video-libraries) - react-player recommendation
- [HLS Streaming with Video.js + React](https://imagekit.io/blog/videojs-hls-adaptive-streaming-react/) - Video.js integration patterns
- [React File Download with Progress Bar](https://lukman.hashnode.dev/react-file-download-with-progress-bar) - Axios download progress implementation
- [Certificate PDF Generator in 4 Steps: jsPDF + React](https://medium.com/@yinong.li97/4-steps-to-generate-certificate-jspdf-react-6fa85f2aab0) - Certificate generation pattern
- [Empty State UX Examples and Design Rules](https://www.eleken.co/blog-posts/empty-state-ux) - Empty state best practices
- [Onboarding UX Patterns - Empty States](https://www.useronboard.com/onboarding-ux-patterns/empty-states/) - Action-focused empty states

### Tertiary (LOW confidence)

- WebSearch results for Next.js 15 authentication patterns - Multiple community articles, cross-verified with official docs
- WebSearch results for LMS progress tracking UI - General patterns, not specific library recommendations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js 15 official patterns, shadcn/ui already in use, Jose recommended by Next.js docs
- Architecture: HIGH - DAL pattern is official Next.js recommendation, middleware patterns from docs, react-player is established
- Pitfalls: MEDIUM/HIGH - Hydration issues are well-documented, video SSR issues confirmed in community, backend tier enforcement verified in code

**Research date:** 2026-01-29
**Valid until:** ~60 days (Next.js 15 stable, no breaking changes expected soon)
