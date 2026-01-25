# Technology Stack

**Project:** StockUs - Investment Education Membership Platform
**Researched:** 2026-01-25
**Overall Confidence:** MEDIUM-HIGH

---

## Executive Summary

StockUs requires a membership platform stack supporting cohort-based courses, research reports, templates, and subscription payments for Indonesian investors. The recommended stack leverages PayloadCMS 3.0 as a headless backend with Next.js 15 frontend, PostgreSQL for structured subscription data, and Midtrans for Indonesian payment processing. Critical decision: use VdoCipher instead of basic file storage for video DRM protection.

---

## Recommended Stack

### Core Framework & CMS

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **PayloadCMS** | 3.x (latest: 3.38.0) | Headless CMS & Backend API | Purpose-built for membership sites with built-in auth, RBAC, and TypeScript-first architecture. Version 3.0 integrates directly into Next.js with powerful jobs queue for scheduled content delivery |
| **Next.js** | 15.x (15.2.3+) | Frontend Framework | Required for PayloadCMS 3.0 integration. App Router with React Server Components provides optimal performance for course content delivery. Supports SSR, SSG, and ISR for SEO |
| **React** | 19 | UI Library | Ships with Next.js 15. Server Components enable efficient data fetching from PayloadCMS without client-side overhead |
| **TypeScript** | 5.x | Type Safety | PayloadCMS is TypeScript-first. All schemas, API responses, and rich text nodes are fully typed |

**Confidence:** HIGH - Official PayloadCMS 3.0 requires Next.js 15+ and is designed specifically for this integration pattern.

**Sources:**
- [PayloadCMS 3.0 Official Announcement](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [Next.js 15 Release](https://nextjs.org/blog/next-15)
- [PayloadCMS Latest Releases](https://github.com/payloadcms/payload/releases)

---

### Database

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **PostgreSQL** | 14+ | Primary Database | Recommended for membership platforms with structured subscription data, user roles, and payment records. PostgreSQL's relational constraints enforce data integrity at database level. Better for reporting/analytics on member engagement |

**Why PostgreSQL over MongoDB:**

PayloadCMS supports both, but for StockUs specifically:

✅ **Choose PostgreSQL because:**
- Subscription data is structured and relational (users → subscriptions → payments → courses)
- Strong referential integrity for payment records (critical for financial compliance)
- Better for complex queries: "Which members accessed research reports in the last 30 days?"
- Existing PostgreSQL expertise reduces operational overhead
- Drizzle ORM provides type-safe database queries

❌ **MongoDB would work IF:**
- Schema was highly dynamic with unpredictable nested structures
- Heavy use of Payload's block/array fields requiring document-based storage
- You needed extreme flexibility in content structure

**Configuration Notes:**
- PayloadCMS uses Drizzle ORM for PostgreSQL adapter
- Supports automatic schema migrations in development
- Production requires explicit migration management (see PITFALLS.md)

**Confidence:** HIGH - Official documentation clearly delineates use cases. StockUs requirements align with PostgreSQL strengths.

**Sources:**
- [PayloadCMS Database Documentation](https://payloadcms.com/docs/database/overview)
- [PayloadCMS 2.0 PostgreSQL Announcement](https://payloadcms.com/posts/blog/payload-2-0)

---

### Payment Processing

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Midtrans** | Latest (via `midtrans-client` npm) | Payment Gateway | The dominant Indonesian payment gateway with comprehensive local payment methods (GoPay, OVO, Dana, ShopeePay, bank transfers). Official Node.js SDK available |

**Midtrans Capabilities:**
- **Recurring Payments:** ✅ Subscription/membership billing with customizable intervals
- **One-Click Payments:** ✅ Securely saves card details (excluding CVV) for returning customers
- **Payment Methods:** 25+ options including cards, e-wallets, bank transfers, retail outlets
- **Integration:** REST API + official Node.js SDK (`midtrans-client`)

**Implementation Pattern:**
```javascript
// Install
npm install midtrans-client

// Configure
const midtransClient = require('midtrans-client');
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});
```

**Architecture Integration:**
- PayloadCMS webhook handler receives Midtrans payment notifications
- Update user subscription status in PayloadCMS Users collection
- Trigger access control changes via PayloadCMS hooks

**Pricing:** Free setup, transaction fees only (no monthly/implementation fees)

**Confidence:** HIGH - Official SDK, well-documented for subscription use cases.

**Sources:**
- [Midtrans Subscription Features](https://midtrans.com/features/recurring-payment)
- [Midtrans Node.js SDK](https://github.com/Midtrans/midtrans-nodejs-client)
- [Midtrans Documentation](https://docs.midtrans.com/)

---

### Authentication & Authorization

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **PayloadCMS Auth** | Built-in | User Authentication | PayloadCMS provides JWT-based auth with HTTP-only cookies. No external auth service needed |
| **PayloadCMS Access Control** | Built-in | Role-Based Permissions | Field-level and document-level RBAC for membership tiers (free, premium, enterprise) |

**Authentication Flow for Separate Frontend:**

1. **Login:** Frontend calls PayloadCMS `/api/users/login`
2. **Token Storage:** PayloadCMS sets HTTP-only cookie (refresh token) + returns short-lived JWT (5-15 min)
3. **Frontend Storage:** Store JWT in memory (not localStorage - security risk)
4. **API Requests:** Include `credentials: 'include'` in fetch to send cookies
5. **Token Refresh:** Call `/api/users/refresh-token` when JWT expires (using HTTP-only cookie)

**IMPORTANT:** PayloadCMS hashes JWT secret using SHA-256 truncated to 32 characters. If validating tokens externally, replicate this hashing.

**Access Control Example:**
```typescript
// Collection config with role-based access
{
  slug: 'research-reports',
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      // Premium and enterprise members only
      return ['premium', 'enterprise'].includes(user.tier);
    }
  }
}
```

**Confidence:** HIGH - Well-documented pattern for headless architecture.

**Sources:**
- [PayloadCMS Authentication Overview](https://payloadcms.com/docs/authentication/overview)
- [PayloadCMS JWT Strategy](https://payloadcms.com/docs/authentication/jwt)
- [PayloadCMS Access Control Guide](https://payloadcms.com/docs/access-control/overview)
- [Setting up Auth and RBAC in Next.js + Payload](https://payloadcms.com/posts/guides/setting-up-auth-and-role-based-access-control-in-nextjs-payload)

---

### File Storage & Video Hosting

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **VdoCipher** | Latest | Video Hosting with DRM | CRITICAL: Course videos require DRM protection. VdoCipher provides Google Widevine + Apple FairPlay DRM preventing unauthorized downloads. Optimized for e-learning with India/SEA infrastructure |
| **Cloudflare R2** | Latest | Static Files (PDFs, templates) | 99% cheaper than AWS S3 for high-bandwidth use (zero egress fees). Perfect for downloadable templates and research reports |
| **PayloadCMS Upload Fields** | Built-in | File Management | Manages uploads with access control, integrates with storage adapters |

**Storage Architecture:**

```
Course Videos → VdoCipher (DRM-protected streaming)
  ├─ API integration via VdoCipher SDK
  ├─ Secure embedding in Next.js course pages
  └─ Dynamic watermarking with student info

PDFs/Templates → Cloudflare R2 (object storage)
  ├─ PayloadCMS storage adapter: @payloadcms/storage-*
  ├─ Signed URLs for access-controlled downloads
  └─ Cost: ~$15/month for 10TB bandwidth vs $891 on S3

Course Thumbnails/Images → Cloudflare R2
  └─ Served via Cloudflare CDN (zero egress fees)
```

**Why VdoCipher over Cloudflare Stream:**

❌ **Cloudflare Stream does NOT support DRM** - Videos can be trivially downloaded using browser dev tools. Unacceptable for paid course content.

✅ **VdoCipher provides:**
- Google Widevine + Apple FairPlay DRM (prevents downloads)
- Dynamic watermarking (user email/ID overlaid on video)
- Geo-restrictions and IP blocking
- HLS encryption at rest and in transit
- Purpose-built for e-learning platforms

**VdoCipher Pricing (2025):**
- Starter: $145/year (includes DRM, watermarking, secure embedding)
- Value: $429/year
- Express: $699/year
- Free trial available for testing

**Why Cloudflare R2 over AWS S3:**
- Cost savings: 98-99% cheaper for bandwidth-heavy use
- Zero egress fees (critical for downloadable templates)
- S3-compatible API (easy migration if needed)
- 20-40% faster than S3 in benchmarks

**PayloadCMS Integration:**
```bash
# Install storage adapter
npm install @payloadcms/storage-s3 # R2 uses S3-compatible API

# Configure in payload.config.ts
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  plugins: [
    s3Storage({
      collections: {
        'media': true, // PDFs, images
        'templates': true,
      },
      bucket: process.env.R2_BUCKET,
      config: {
        endpoint: process.env.R2_ENDPOINT, // R2 endpoint
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY,
          secretAccessKey: process.env.R2_SECRET_KEY,
        },
        region: 'auto',
      },
    }),
  ],
})
```

**Confidence:**
- VdoCipher: HIGH - Industry standard for e-learning DRM
- Cloudflare R2: MEDIUM-HIGH - Newer but mature, significant cost benefits, S3-compatible reduces lock-in

**Sources:**
- [VdoCipher Pricing](https://www.vdocipher.com/site/pricing/)
- [VdoCipher for Online Courses](https://www.vdocipher.com/blog/2019/08/video-hosting-platform-online-courses/)
- [Cloudflare R2 vs AWS S3 Comparison](https://www.digitalapplied.com/blog/cloudflare-r2-vs-aws-s3-comparison)
- [PayloadCMS Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)
- [Cloudflare Stream DRM Limitations](https://community.cloudflare.com/t/cloudflare-stream-drm/163718)

---

### Frontend Data Fetching

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **TanStack Query** | v5.x (latest: 5.90.19) | Client-Side State Management | Industry standard for async state management. Handles caching, background updates, and stale data for PayloadCMS REST API calls from client components |
| **Next.js Server Components** | Built-in | Server-Side Data Fetching | Use PayloadCMS Local API directly in server components (bypasses network, goes straight to database) for initial page loads |

**Data Fetching Strategy:**

```typescript
// Server Component (app/courses/[slug]/page.tsx)
import { getPayload } from 'payload'

export default async function CoursePage({ params }) {
  const payload = await getPayload({ config })
  const course = await payload.findByID({
    collection: 'courses',
    id: params.slug,
  })
  // Server-rendered, SEO-friendly, zero client JS
  return <CourseContent course={course} />
}

// Client Component (interactive features)
'use client'
import { useQuery } from '@tanstack/react-query'

export function CourseProgress({ courseId }) {
  const { data } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/progress/${courseId}`, {
        credentials: 'include', // Send auth cookies
      })
      return res.json()
    },
  })
  return <ProgressBar progress={data?.percent} />
}
```

**When to Use Each:**
- **Server Components + Local API:** Course listings, research reports, static content (SEO-critical)
- **TanStack Query:** User progress, interactive dashboards, real-time updates (client-side)

**Confidence:** HIGH - Recommended pattern in PayloadCMS + Next.js documentation.

**Sources:**
- [TanStack Query Official Docs](https://tanstack.com/query/latest)
- [PayloadCMS Guide: Learn Advanced Next.js with Payload](https://payloadcms.com/posts/guides/learn-advanced-nextjs-with-payload-rendering-cms-data-in-react)
- [PayloadCMS: The Ultimate Guide To Using Next.js with Payload](https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload)

---

### Rich Text / Course Content Editor

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Lexical** | Built-in with PayloadCMS | Rich Text Editor | PayloadCMS 3.0's default editor (Meta's Lexical). Fully extensible, supports custom blocks, inline components, and embedded media. 100% type-safe serialized format |

**Key Features:**
- Custom blocks for course content (video embeds, code snippets, quizzes)
- Inline components (tooltips, glossary terms)
- Saved as structured JSON (easily convertible to HTML/JSX)
- Full TypeScript types for every node

**Usage:**
```bash
npm install @payloadcms/richtext-lexical

# payload.config.ts
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default buildConfig({
  editor: lexicalEditor({}),
})
```

**Frontend Rendering:**
```typescript
import { RichText } from '@payloadcms/richtext-lexical/react'

<RichText data={course.content} />
```

**Note:** Previous SlateJS editor deprecated, will be removed in v4.0.

**Confidence:** HIGH - Official default, production-stable as of v3.0.

**Sources:**
- [PayloadCMS Rich Text Overview](https://payloadcms.com/docs/rich-text/overview)
- [How to Render Rich Text from Payload in Next.js](https://payloadcms.com/posts/guides/how-to-render-rich-text-from-payload-in-a-nextjs-frontend)

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sharp` | Latest | Image Processing | Required for PayloadCMS image uploads (resize, optimize) |
| `graphql` | Latest | GraphQL Support | Optional - only if using GraphQL API instead of REST |
| `zod` | Latest | Validation | Form validation in frontend (Midtrans payment forms, user inputs) |
| `date-fns` | Latest | Date Utilities | Course schedules, subscription renewal dates, cohort timelines |
| `framer-motion` | Latest | Animations | Optional - UI polish for course navigation, progress indicators |

---

### DevOps & Infrastructure

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Docker** | Latest | Containerization | Required for consistent deployment across environments. PayloadCMS + Next.js runs in standalone mode |
| **Node.js** | 22 LTS | Runtime | Latest LTS (until 2027). Node 20 also supported but 22 recommended for new projects in 2025 |
| **pnpm** | Latest | Package Manager | Faster than npm, efficient monorepo support if adding admin panel as separate app |

**Deployment Architecture:**

```
Separate Deployments:
├─ Backend + Admin Panel (PayloadCMS + Next.js)
│  ├─ Route: /api/* (REST API)
│  ├─ Route: /admin/* (Admin Panel)
│  └─ Deploy: Docker container (VPS, Kubernetes, or Vercel)
│
└─ Frontend (Next.js)
   ├─ Fetches from Backend API
   ├─ Deploy: Vercel, Cloudflare Pages, or Docker
   └─ Public-facing member site
```

**Docker Configuration:**
```dockerfile
# Dockerfile for PayloadCMS Backend
FROM node:22-alpine
WORKDIR /app

# Next.js standalone output
ENV NEXT_OUTPUT=standalone

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Run migrations on startup (production)
CMD ["sh", "-c", "pnpm payload migrate && pnpm start"]
```

**Environment Variables Required:**
```env
# PayloadCMS
PAYLOAD_SECRET=<random-32-char-string>
DATABASE_URL=postgresql://user:pass@host:5432/stockus
PAYLOAD_PUBLIC_SERVER_URL=https://api.stockus.com

# Midtrans
MIDTRANS_SERVER_KEY=<server-key>
MIDTRANS_CLIENT_KEY=<client-key>
MIDTRANS_IS_PRODUCTION=true

# Cloudflare R2
R2_BUCKET=stockus-media
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<key>
R2_SECRET_KEY=<secret>

# VdoCipher
VDOCIPHER_API_KEY=<api-key>

# Next.js
NEXT_PUBLIC_API_URL=https://api.stockus.com
```

**Confidence:** HIGH - Standard deployment pattern well-documented.

**Sources:**
- [PayloadCMS Production Deployment](https://payloadcms.com/docs/production/deployment)
- [Next.js Docker Deployment Guide](https://codeparrot.ai/blogs/deploy-nextjs-app-with-docker-complete-guide-for-2025)
- [Node.js LTS Schedule](https://nodejs.org/en/about/previous-releases)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **CMS** | PayloadCMS | Strapi, Directus, Sanity | PayloadCMS has superior TypeScript support, built-in auth/RBAC, and true Next.js integration. Strapi/Directus use separate UI panels (not Next.js native) |
| **Database** | PostgreSQL | MongoDB | Membership/subscription data is relational. PostgreSQL better for payment record integrity and analytics |
| **Frontend** | Next.js 15 | Remix, Vite+React | PayloadCMS 3.0 requires Next.js. Remix lacks equivalent CMS integration. Vite requires separate backend setup |
| **Video Hosting** | VdoCipher | Cloudflare Stream, Vimeo, Mux | Cloudflare Stream lacks DRM. Vimeo overpriced for courses. Mux DRM costs more than VdoCipher. VdoCipher purpose-built for e-learning |
| **File Storage** | Cloudflare R2 | AWS S3, Vercel Blob | S3 costs 98% more (egress fees). Vercel Blob more expensive than R2. R2 is S3-compatible (low migration risk) |
| **Payments** | Midtrans | Stripe, Xendit | Midtrans is dominant in Indonesia with best local payment method coverage. Stripe has limited Indonesian support. Xendit viable alternative but Midtrans has larger market share |
| **State Management** | TanStack Query | SWR, Redux Toolkit | TanStack Query is industry standard for server state. SWR less feature-rich. Redux overkill for server data |

---

## Installation

### Backend (PayloadCMS + Next.js)
```bash
# Initialize project
pnpm create payload-app@latest backend
cd backend

# Install dependencies
pnpm install payload @payloadcms/next @payloadcms/richtext-lexical sharp graphql
pnpm install @payloadcms/storage-s3 # For R2 integration
pnpm install midtrans-client
pnpm install -D typescript @types/node

# Database adapter
pnpm install @payloadcms/db-postgres
```

### Frontend (Next.js)
```bash
# Create Next.js app
pnpm create next-app@latest frontend
cd frontend

# Install dependencies
pnpm install @tanstack/react-query zod date-fns
pnpm install -D typescript @types/react
```

---

## Configuration Checklist

- [ ] PayloadCMS config with PostgreSQL adapter
- [ ] Lexical rich text editor configured
- [ ] User collection with role-based access (free, premium, enterprise)
- [ ] Courses, Reports, Templates collections with appropriate access control
- [ ] Midtrans webhook endpoint for payment notifications
- [ ] Cloudflare R2 storage adapter for PDFs/templates
- [ ] VdoCipher API integration for video uploads
- [ ] Next.js frontend configured with TanStack Query
- [ ] Authentication flow using PayloadCMS JWT + HTTP-only cookies
- [ ] Docker setup with database migrations on startup
- [ ] Environment variables for all services (Payload, Midtrans, R2, VdoCipher)

---

## What NOT to Use

### ❌ Cloudflare Stream
**Why:** No DRM support. Course videos would be trivially downloadable, violating the value proposition of paid courses.

### ❌ MongoDB (for this project)
**Why:** Subscription/payment data is relational. PostgreSQL provides better integrity guarantees and query capabilities for membership analytics.

### ❌ Client-Side Only Auth (localStorage JWT)
**Why:** Security risk. Use PayloadCMS HTTP-only cookies + short-lived in-memory JWTs.

### ❌ Node.js 18 or Earlier
**Why:** Node 18 LTS ends April 2025. Node 22 LTS is current and supported until 2027.

### ❌ SlateJS Rich Text Editor
**Why:** Deprecated in PayloadCMS. Will be removed in v4.0. Use Lexical.

### ❌ Separate Auth Service (Auth0, Clerk)
**Why:** PayloadCMS has built-in auth. Adding external auth creates complexity without benefits for this use case.

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| **PayloadCMS + Next.js** | HIGH | Official integration, well-documented, production-proven |
| **PostgreSQL** | HIGH | Clear use case alignment, official support, standard for membership platforms |
| **Midtrans** | HIGH | Dominant Indonesian payment gateway, official SDK, recurring payment support |
| **VdoCipher** | MEDIUM-HIGH | Industry standard for e-learning DRM, but less ecosystem integration than generic video platforms. Requires API integration effort |
| **Cloudflare R2** | MEDIUM-HIGH | Newer than S3 but mature enough for production. S3-compatible API reduces lock-in risk |
| **TanStack Query** | HIGH | Industry standard, well-maintained, extensive documentation |
| **Deployment Architecture** | MEDIUM | Standard patterns but separate frontend/backend requires careful CORS, auth cookie configuration |

---

## Open Questions & Validation Needed

1. **VdoCipher Performance in Indonesia:** While VdoCipher has Asia infrastructure, test actual streaming performance for Indonesian users. Latency to India data centers could impact UX.

2. **Midtrans Subscription Limits:** Verify which payment methods support recurring billing (some may only support one-time). Contact Midtrans support for Indonesia-specific capabilities.

3. **PayloadCMS Separate Deployment:** While technically possible to deploy backend/frontend separately, most examples show monorepo. May need custom CORS/cookie configuration. Test auth flow thoroughly.

4. **Database Scaling:** PostgreSQL chosen for data integrity, but if user base scales beyond 100k members, evaluate read replicas or caching strategy (Redis).

---

## Sources

All sources embedded inline throughout document. Key resources:

- [PayloadCMS Official Documentation](https://payloadcms.com/docs)
- [Next.js Official Documentation](https://nextjs.org/docs)
- [Midtrans Official Documentation](https://docs.midtrans.com/)
- [VdoCipher Documentation](https://www.vdocipher.com/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
