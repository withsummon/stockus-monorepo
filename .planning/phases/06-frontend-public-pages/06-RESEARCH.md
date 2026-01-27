# Phase 6: Frontend - Public Pages - Research

**Researched:** 2026-01-27
**Domain:** Next.js App Router, Public Landing Pages, SEO, Mobile Responsiveness
**Confidence:** HIGH

## Summary

This phase builds the Next.js frontend for all public-facing pages of StockUs, an Indonesian investment education platform. The frontend will consume the existing Hono backend API (at localhost:3000 during development) that provides courses, research, cohorts, and authentication endpoints.

The research focused on Next.js App Router patterns for public pages, SEO optimization with structured data, mobile-first responsive design, and integration patterns for fetching data from an external API. The standard approach uses Next.js 15 with App Router, Tailwind CSS for styling, and shadcn/ui for component primitives.

**Primary recommendation:** Use Next.js 15 App Router with Server Components for initial page loads (SEO-critical), Tailwind CSS for styling, shadcn/ui for components, and the built-in Metadata API for SEO. Keep pages statically generated where possible, with revalidation for dynamic content.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Frontend framework | App Router with Server Components, built-in SEO support, SSR/SSG |
| React | 19.x | UI library | Ships with Next.js 15, Server Components support |
| TypeScript | 5.x | Type safety | Required for type-safe API integration |
| Tailwind CSS | 3.4+ | Styling | Mobile-first utilities, rapid development, small bundle |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | latest | UI components | Button, Card, Dialog, Form components (copy-paste, fully customizable) |
| lucide-react | latest | Icons | SVG icons, tree-shakeable, pairs with shadcn/ui |
| clsx + tailwind-merge | latest | Class utilities | Conditional classes in component variants |
| next-themes | latest | Dark mode | If dark mode needed (optional for v1) |

### SEO & Structured Data
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Built-in Metadata API | Next.js 15 | SEO meta tags | All pages (title, description, OpenGraph, Twitter) |
| JSON-LD (native) | - | Structured data | Homepage (Organization), Pricing (Product), About (Person) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Chakra UI | Chakra is heavier (runtime), shadcn is copy-paste (zero deps) |
| shadcn/ui | Material UI | MUI is larger bundle, more opinionated design system |
| Tailwind CSS | CSS Modules | Tailwind faster for responsive design, better DX for this project |
| Built-in fetch | TanStack Query | Not needed for public pages (no client-side state), use for member area later |

**Installation:**
```bash
# Create Next.js app (if not exists)
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir

# Initialize shadcn/ui
cd frontend
npx shadcn@latest init

# Add commonly used components
npx shadcn@latest add button card accordion badge separator
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, providers)
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── about/
│   │   │   └── page.tsx        # About Us (/about)
│   │   ├── community/
│   │   │   └── page.tsx        # Community (/community)
│   │   ├── pricing/
│   │   │   └── page.tsx        # Pricing (/pricing)
│   │   ├── research/
│   │   │   └── page.tsx        # Research preview (/research)
│   │   ├── courses/
│   │   │   └── page.tsx        # Course listing (/courses)
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Footer, Navigation
│   │   ├── sections/           # Page sections (Hero, FAQ, Testimonials)
│   │   └── shared/             # Reusable components (CourseCard, etc.)
│   ├── lib/
│   │   ├── api.ts              # API client for Hono backend
│   │   ├── utils.ts            # Utility functions (cn helper)
│   │   └── constants.ts        # Site metadata, pricing info
│   └── types/
│       └── index.ts            # TypeScript interfaces for API responses
├── public/
│   ├── images/                 # Static images (team photos, logos)
│   └── og/                     # OpenGraph images
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

### Pattern 1: Server Components for Data Fetching
**What:** Fetch data directly in Server Components using async/await
**When to use:** All public pages that need API data (courses list, research preview)
**Example:**
```typescript
// src/app/courses/page.tsx
// Source: https://nextjs.org/docs/app/getting-started/fetching-data

interface Course {
  id: number
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isFreePreview: boolean
}

async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${process.env.API_URL}/courses`, {
    // Public page can use ISR for caching
    next: { revalidate: 3600 }, // Revalidate every hour
  })

  if (!res.ok) {
    throw new Error('Failed to fetch courses')
  }

  const data = await res.json()
  return data.courses
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <main>
      <h1>Our Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  )
}
```

### Pattern 2: Parallel Data Fetching
**What:** Use Promise.all for multiple independent API calls
**When to use:** Landing page with multiple data sources (courses, testimonials, cohorts)
**Example:**
```typescript
// src/app/page.tsx (Landing)
// Source: https://nextjs.org/docs/app/building-your-application/data-fetching/patterns

async function getLandingPageData() {
  // Fetch all data in parallel - no waterfall
  const [courses, cohorts] = await Promise.all([
    fetch(`${process.env.API_URL}/courses`, { next: { revalidate: 3600 } })
      .then(res => res.json()),
    fetch(`${process.env.API_URL}/cohorts`, { next: { revalidate: 3600 } })
      .then(res => res.json()),
  ])

  return { courses: courses.courses, cohorts: cohorts.cohorts }
}

export default async function HomePage() {
  const { courses, cohorts } = await getLandingPageData()

  return (
    <>
      <HeroSection />
      <CoursesShowcase courses={courses} />
      <UpcomingCohorts cohorts={cohorts} />
      <TestimonialsSection />
      <FAQSection />
    </>
  )
}
```

### Pattern 3: Metadata API for SEO
**What:** Use Next.js built-in Metadata API for page-level SEO
**When to use:** Every page
**Example:**
```typescript
// src/app/layout.tsx (Root metadata)
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata

import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://stockus.id'),
  title: {
    default: 'StockUs - Investment Education Platform',
    template: '%s | StockUs',
  },
  description: 'Learn structured approaches to global equity investing through cohort-based courses and research.',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://stockus.id',
    siteName: 'StockUs',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'StockUs - Investment Education Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockUs - Investment Education Platform',
    description: 'Learn structured approaches to global equity investing.',
    images: ['/og/default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

### Pattern 4: JSON-LD Structured Data
**What:** Add JSON-LD for rich search results
**When to use:** Landing (Organization), Pricing (Product), About (Person)
**Example:**
```typescript
// src/app/page.tsx (Homepage JSON-LD)
// Source: https://nextjs.org/docs/app/guides/json-ld

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'StockUs',
    description: 'Investment education platform for Indonesian investors',
    url: 'https://stockus.id',
    logo: 'https://stockus.id/logo.png',
    sameAs: [
      'https://discord.gg/stockus',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Page content */}
      </main>
    </>
  )
}
```

### Pattern 5: Mobile-First Responsive Design
**What:** Use Tailwind's responsive prefixes, design mobile-first
**When to use:** All components
**Example:**
```typescript
// Mobile-first responsive pattern
// Source: Tailwind CSS documentation

// Base styles = mobile, add breakpoint prefixes for larger screens
<section className="px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-24">
  <div className="mx-auto max-w-7xl">
    <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
      Invest with Confidence
    </h1>
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Cards */}
    </div>
  </div>
</section>
```

### Anti-Patterns to Avoid
- **Using useEffect for data fetching in page components:** Use Server Components with async/await instead. This breaks streaming, delays rendering, and hurts SEO.
- **Placing 'use client' at the top of pages:** Keep pages as Server Components. Only mark interactive components as Client Components.
- **Fetching from your own API Route Handlers in Server Components:** Call data fetching functions directly, avoid the network hop.
- **Not setting revalidate for dynamic content:** Static pages won't update until redeployed without revalidation.
- **Hardcoding API URLs:** Use environment variables (API_URL) for flexibility between environments.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Button variants | Custom button component | shadcn/ui Button | Handles focus states, loading, disabled, accessibility |
| Accordion/FAQ | Custom collapse logic | shadcn/ui Accordion | Keyboard navigation, ARIA attributes built-in |
| Mobile navigation | Custom hamburger menu | shadcn/ui Sheet | Slide-out drawer with proper focus trap |
| Form inputs | Native inputs with custom styles | shadcn/ui Input/Label | Consistent styling, validation states |
| Class merging | String concatenation | clsx + tailwind-merge | Handles Tailwind class conflicts correctly |
| Image optimization | <img> tags | next/image | Automatic optimization, lazy loading, WebP/AVIF |
| Link navigation | <a> tags | next/link | Client-side navigation, prefetching |
| Responsive images | Multiple img tags | next/image sizes prop | Automatic srcset generation |

**Key insight:** shadcn/ui components are copy-paste (you own the code) but handle accessibility and edge cases. Using them saves time and ensures consistency without vendor lock-in.

## Common Pitfalls

### Pitfall 1: Forgetting to Handle API Errors
**What goes wrong:** Page crashes or shows nothing when API is unavailable
**Why it happens:** Happy path coding without error boundaries
**How to avoid:** Use try/catch in data fetching, create error.tsx for route segments
**Warning signs:** Console errors about uncaught promises, blank pages in production

### Pitfall 2: Not Setting CORS on Backend
**What goes wrong:** Frontend cannot fetch from backend API
**Why it happens:** Browser blocks cross-origin requests without proper headers
**How to avoid:** Backend already has CORS configured (verify cors config in Hono). For development, frontend at localhost:3001, backend at localhost:3000
**Warning signs:** "CORS policy" errors in browser console

### Pitfall 3: Blocking Rendering with Data Fetches
**What goes wrong:** Page loads slowly, users see nothing while data loads
**Why it happens:** All data fetched before any UI renders
**How to avoid:** Use Suspense boundaries for non-critical sections, parallel data fetching
**Warning signs:** Large Time to First Byte (TTFB), poor Core Web Vitals

### Pitfall 4: Missing Mobile Viewport Meta
**What goes wrong:** Page renders at desktop width on mobile, tiny text
**Why it happens:** Default HTML doesn't include viewport meta tag
**How to avoid:** Next.js handles this in app/layout.tsx, verify it's present
**Warning signs:** Have to pinch-zoom to read text on mobile

### Pitfall 5: Images Without Size Hints (CLS)
**What goes wrong:** Layout shifts as images load (poor CLS score)
**Why it happens:** Browser doesn't know image dimensions until loaded
**How to avoid:** Always provide width/height or use fill with aspect ratio container
**Warning signs:** Content jumping around as page loads, CLS > 0.1

### Pitfall 6: Caching Confusion (Next.js 15)
**What goes wrong:** Data doesn't update when expected, or updates when it shouldn't
**Why it happens:** Next.js 15 changed caching defaults (fetch uncached by default)
**How to avoid:** Explicitly set cache strategy: `{ cache: 'force-cache' }` or `{ next: { revalidate: N } }`
**Warning signs:** Stale data after database updates, or unnecessary API calls

## Code Examples

Verified patterns from official sources:

### API Client Setup
```typescript
// src/lib/api.ts
// Pattern: Centralized API client with error handling

const API_URL = process.env.API_URL || 'http://localhost:3000'

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const { revalidate, ...fetchOptions } = options

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    next: revalidate ? { revalidate } : undefined,
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Usage in Server Component:
// const { courses } = await fetchAPI<{ courses: Course[] }>('/courses', { revalidate: 3600 })
```

### Hero Section Component
```typescript
// src/components/sections/Hero.tsx
// Pattern: Responsive hero with CTA

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-16 md:px-6 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl xl:text-6xl">
            Investasi Global,{' '}
            <span className="text-primary">Framework Teruji</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 md:mt-6 md:text-xl">
            Pelajari pendekatan terstruktur untuk investasi saham global
            melalui kursus kohort, riset, dan komunitas profesional.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">Mulai Sekarang</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/courses">Lihat Kursus</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Course Card Component
```typescript
// src/components/shared/CourseCard.tsx
// Pattern: Reusable card with image optimization

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Course {
  id: number
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isFreePreview: boolean
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100">
              <span className="text-slate-400">No image</span>
            </div>
          )}
          {course.isFreePreview && (
            <Badge className="absolute right-2 top-2">Free Preview</Badge>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-slate-600">
            {course.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### FAQ Accordion Component
```typescript
// src/components/sections/FAQ.tsx
// Pattern: Accessible FAQ with shadcn/ui

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Apa yang termasuk dalam membership?',
    answer: 'Membership tahunan termasuk akses ke kursus 5-Day Fundamentals, seluruh research report, template investasi, dan komunitas premium.',
  },
  {
    question: 'Bagaimana format kursusnya?',
    answer: 'Kursus berbasis kohort dengan sesi live selama 5 hari. Setiap kohort memiliki jadwal tetap, dan Anda bisa bergabung dengan kohort berikutnya selama masa membership.',
  },
  // Add more FAQs
]

export function FAQSection() {
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold md:text-3xl">
          Pertanyaan yang Sering Diajukan
        </h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
```

### Pricing Page with JSON-LD
```typescript
// src/app/pricing/page.tsx
// Pattern: Static pricing with structured data

import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Membership StockUs mulai dari Rp 2.500.000/tahun. Akses penuh ke kursus, research, dan komunitas.',
}

const PRICE = 2500000
const FEATURES = [
  '5-Day Fundamentals Course',
  'Akses seluruh Research Reports',
  'Template Investasi (Excel & PDF)',
  'Komunitas Premium Discord',
  'Sertifikat Penyelesaian',
]

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'StockUs Annual Membership',
    description: 'Akses penuh ke kursus investasi, research, dan komunitas',
    offers: {
      '@type': 'Offer',
      price: PRICE,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Investasi untuk Masa Depan Anda
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Satu membership, akses lengkap ke semua resource.
          </p>

          <Card className="mx-auto mt-12 max-w-md">
            <CardHeader>
              <CardTitle>Annual Membership</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  Rp {PRICE.toLocaleString('id-ID')}
                </span>
                <span className="text-slate-600">/tahun</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" size="lg">
                Daftar Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router + getServerSideProps | App Router + async Server Components | Next.js 13 (2022) | Simpler data fetching, better streaming |
| fetch cached by default | fetch uncached by default | Next.js 15 (2024) | Must explicitly opt-in to caching |
| next-seo library for metadata | Built-in Metadata API | Next.js 13.2 | Native support, no external dependency |
| CSS-in-JS (styled-components) | Tailwind CSS | 2022-2024 trend | Zero runtime overhead, better DX |
| Component libraries (MUI, Chakra) | shadcn/ui (copy-paste) | 2023 | Full control, no dependency bloat |
| priority prop for images | preload/fetchPriority props | Next.js 16 | priority deprecated, use preload or fetchPriority |

**Deprecated/outdated:**
- `getServerSideProps`, `getStaticProps`, `getStaticPaths`: Use Server Components and `generateStaticParams`
- `next/head`: Use Metadata API in App Router
- SlateJS in PayloadCMS: Use Lexical (not relevant for this frontend)
- `priority` prop on next/image: Use `preload` or `fetchPriority="high"` in Next.js 16+

## Open Questions

Things that couldn't be fully resolved:

1. **Backend CORS Configuration**
   - What we know: Hono backend exists and should have CORS configured
   - What's unclear: Exact allowed origins configuration for frontend domain
   - Recommendation: Verify backend CORS allows frontend origin (localhost:3001 dev, production domain)

2. **Image/Asset Hosting**
   - What we know: Backend uses Cloudflare R2 for videos/templates
   - What's unclear: How static images (team photos, hero images) should be served
   - Recommendation: Store in frontend's public/ folder for static images, use R2 URLs for dynamic content from API

3. **Authentication State for Public Pages**
   - What we know: Some pages show different content based on auth (research preview)
   - What's unclear: How to check auth without making the page dynamic
   - Recommendation: Use Client Component wrapper for auth-dependent sections, keep page static

4. **API Response Types**
   - What we know: Backend has Zod schemas for validation
   - What's unclear: Whether type definitions can be shared/generated
   - Recommendation: Manually create TypeScript interfaces based on API responses, consider generating from Zod schemas in future

## Sources

### Primary (HIGH confidence)
- [Next.js Official Docs - Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data) - Server Component patterns, caching
- [Next.js Official Docs - Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - SEO configuration
- [Next.js Official Docs - Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - App Router conventions
- [Next.js Official Docs - JSON-LD](https://nextjs.org/docs/app/guides/json-ld) - Structured data implementation
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next) - Component setup

### Secondary (MEDIUM confidence)
- [Vercel Blog - Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Pitfalls and fixes
- [Builder.io - React UI Libraries 2026](https://www.builder.io/blog/react-component-libraries-2026) - Stack comparisons
- [DEV.to - Next.js 15 Project Structure](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji) - Folder organization patterns

### Tertiary (LOW confidence)
- WebSearch findings for "Next.js best practices 2026" - General patterns validated against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All recommendations from official Next.js/Vercel documentation
- Architecture: HIGH - App Router patterns well-established and documented
- Pitfalls: HIGH - Based on official Vercel blog post and documented migration issues

**Research date:** 2026-01-27
**Valid until:** 60 days (Next.js stable, patterns well-established)
