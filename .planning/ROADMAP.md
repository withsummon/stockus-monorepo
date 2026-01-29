# Roadmap: StockUs

## Overview

StockUs launches as a complete investment education platform for Indonesian investors. The roadmap progresses from backend API foundation through authentication, content management, payments, frontend, and finally Docker deployment. Each phase delivers a complete, verifiable capability that unblocks the next.

**Architecture:**
- Backend: Hono API server (Node.js/Bun)
- Frontend: Next.js (React)
- Database: PostgreSQL + Drizzle ORM
- Deploy: Docker Compose

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Backend Foundation** - Hono API setup with PostgreSQL, Drizzle ORM, and project structure
- [x] **Phase 2: Authentication System** - User registration, login, JWT sessions, email verification, password reset
- [x] **Phase 3: Content API** - Courses, research reports, templates, cohorts CRUD endpoints
- [x] **Phase 4: Payment Integration** - Midtrans subscriptions, workshops, promo codes, referral system
- [x] **Phase 5: Video & Storage** - Cloudflare R2 integration, signed URLs for video access
- [ ] **Phase 6: Frontend - Public Pages** - Next.js setup, landing, about, pricing, research preview pages
- [ ] **Phase 7: Frontend - Member Area** - Dashboard, course player, downloads, profile management
- [ ] **Phase 8: Admin Dashboard** - Content management UI, user management, order history
- [ ] **Phase 9: Docker & Deployment** - Docker Compose setup, production configuration, CI/CD

## Phase Details

### Phase 1: Backend Foundation
**Goal**: Hono API server running with PostgreSQL connection and base project structure
**Depends on**: Nothing (first phase)
**Requirements**: None (infrastructure)
**Success Criteria** (what must be TRUE):
  1. Hono server starts and responds to health check endpoint
  2. PostgreSQL connection established via Drizzle ORM
  3. Database migrations run successfully
  4. Project structure supports modular route organization
  5. Environment configuration loads from .env
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — Project initialization, environment config, database connection
- [x] 01-02-PLAN.md — Hono app, health routes, schema, migrations

### Phase 2: Authentication System
**Goal**: Users can register, login, verify email, and reset password with JWT sessions
**Depends on**: Phase 1 (requires API server and database)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password
  2. User receives email verification after signup
  3. User can reset forgotten password via email link
  4. JWT token issued on login, validated on protected routes
  5. System correctly distinguishes between anonymous, free, and member tiers
**Plans:** 5 plans
Plans:
- [x] 02-01-PLAN.md — Database schema (tokens, sessions, tier column)
- [x] 02-02-PLAN.md — Foundation services (env config, token service, email service)
- [x] 02-03-PLAN.md — Auth infrastructure (auth service, middleware)
- [x] 02-04-PLAN.md — Auth routes (signup, login, logout, refresh)
- [x] 02-05-PLAN.md — Verification flows (email verification, password reset)

### Phase 3: Content API
**Goal**: CRUD endpoints for all content types (courses, research, templates, cohorts)
**Depends on**: Phase 2 (requires authentication for admin routes)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, COHO-01, COHO-02, COHO-03
**Success Criteria** (what must be TRUE):
  1. API supports CRUD for courses with sessions
  2. API supports CRUD for research reports
  3. API supports file uploads for templates
  4. API supports cohort creation with schedules
  5. Content endpoints respect user tier for access control
**Plans:** 6 plans
Plans:
- [x] 03-01-PLAN.md — Database schemas (courses, research, templates, cohorts, admins) and requireAdmin middleware
- [x] 03-02-PLAN.md — Utility functions (slug generation, file upload handling)
- [x] 03-03-PLAN.md — Course CRUD routes with sessions
- [x] 03-04-PLAN.md — Research report CRUD routes
- [x] 03-05-PLAN.md — Template CRUD routes with file upload/download
- [x] 03-06-PLAN.md — Cohort CRUD routes with sessions and Zoom links

### Phase 4: Payment Integration
**Goal**: Users can purchase subscriptions and workshops via Midtrans
**Depends on**: Phase 2 (requires user accounts)
**Requirements**: PAY-01 through PAY-07, REF-01 through REF-05
**Success Criteria** (what must be TRUE):
  1. User can initiate subscription payment via Midtrans
  2. Webhook updates user tier after successful payment
  3. User can purchase one-time workshops
  4. Promo codes apply discounts at checkout
  5. Referral system tracks codes and rewards
**Plans:** 6 plans
Plans:
- [x] 04-01-PLAN.md — Payment database schemas (payments, subscriptions, promo codes, referrals)
- [x] 04-02-PLAN.md — Payment service with Midtrans Snap integration
- [x] 04-03-PLAN.md — Promo code and referral services
- [x] 04-04-PLAN.md — Payment initiation routes (subscription, workshop)
- [x] 04-05-PLAN.md — Midtrans webhook handler with signature verification
- [x] 04-06-PLAN.md — Referral routes (view stats, validate codes)

### Phase 5: Video & Storage
**Goal**: Secure video storage with member-only access via signed URLs
**Depends on**: Phase 4 (video access gated by subscription)
**Requirements**: VID-01, VID-02, VID-03, VID-04
**Success Criteria** (what must be TRUE):
  1. Videos upload to Cloudflare R2
  2. Signed URLs generated for authenticated members only
  3. URLs expire after configurable time
  4. Video metadata stored in database
**Plans:** 2 plans
Plans:
- [x] 05-01-PLAN.md — R2 client setup, environment config, videos database schema
- [x] 05-02-PLAN.md — Video routes (admin upload, member playback with presigned URLs)

### Phase 6: Frontend - Public Pages
**Goal**: Next.js frontend with all public-facing pages
**Depends on**: Phase 3 (needs content API)
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07
**Success Criteria** (what must be TRUE):
  1. Landing page with hero, courses, testimonials, FAQ
  2. About Us page with team profiles
  3. Community page showing Discord integration
  4. Pricing page with subscription options
  5. Research preview page (limited access)
  6. Mobile responsive, SEO optimized
**Plans:** 5 plans
Plans:
- [ ] 06-01-PLAN.md — Next.js project setup, shadcn/ui, Header, Footer, mobile nav
- [ ] 06-02-PLAN.md — Landing page with Hero, Courses, Community, Testimonials, FAQ
- [ ] 06-03-PLAN.md — About Us and Community pages
- [ ] 06-04-PLAN.md — Pricing and Research preview pages
- [ ] 06-05-PLAN.md — Visual verification checkpoint

### Phase 7: Frontend - Member Area
**Goal**: Authenticated member experience with dashboard and course access
**Depends on**: Phase 5 (needs video), Phase 6 (needs base frontend)
**Requirements**: MEMB-01 through MEMB-07, COHO-04, COHO-05
**Success Criteria** (what must be TRUE):
  1. Member dashboard shows enrolled courses, progress
  2. Course player with video and materials
  3. Research library with full access
  4. Template downloads
  5. Cohort enrollment and schedule view
  6. Profile management
**Plans:** 10 plans
Plans:
- [ ] 07-01-PLAN.md — Auth infrastructure (DAL, middleware, API client)
- [ ] 07-02-PLAN.md — Login and signup pages
- [ ] 07-03-PLAN.md — Member layout with sidebar
- [ ] 07-04-PLAN.md — Dashboard page with stats
- [ ] 07-05-PLAN.md — Course list, detail, and player pages
- [ ] 07-06-PLAN.md — Research library and detail pages
- [ ] 07-07-PLAN.md — Downloads page with templates
- [ ] 07-08-PLAN.md — Cohorts page with schedule
- [ ] 07-09-PLAN.md — Profile management page
- [ ] 07-10-PLAN.md — Visual verification checkpoint

### Phase 8: Admin Dashboard
**Goal**: Admin interface for content and user management
**Depends on**: Phase 3 (needs content API), Phase 4 (needs payment data)
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05
**Success Criteria** (what must be TRUE):
  1. Admin can manage courses, reports, templates
  2. Admin can view/edit users and subscriptions
  3. Admin can view orders and payment history
  4. Dashboard shows key metrics
**Plans:** 9 plans
Plans:
- [ ] 08-01-PLAN.md — Admin foundation (backend routes, layout, sidebar, auth helper)
- [ ] 08-02-PLAN.md — Data table infrastructure (TanStack Table, shadcn/ui components)
- [ ] 08-03-PLAN.md — Dashboard page with metrics cards
- [ ] 08-04-PLAN.md — Course management (list, create, edit, delete)
- [ ] 08-05-PLAN.md — Research management (list, create, edit, delete)
- [ ] 08-06-PLAN.md — Template management (list, upload, edit, delete)
- [ ] 08-07-PLAN.md — User management (list, detail, tier change)
- [ ] 08-08-PLAN.md — Order management (list, filter by status)
- [ ] 08-09-PLAN.md — Visual verification checkpoint

### Phase 9: Docker & Deployment
**Goal**: Production-ready Docker Compose deployment
**Depends on**: Phase 8 (all features complete)
**Requirements**: None (infrastructure)
**Success Criteria** (what must be TRUE):
  1. docker-compose.yml orchestrates all services
  2. Backend, frontend, PostgreSQL containers configured
  3. Environment variables managed via .env
  4. Health checks configured
  5. Nginx or Traefik for routing (optional)
  6. Production build optimizations applied
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Backend Foundation | Complete | 2026-01-26 |
| 2. Authentication System | Complete | 2026-01-26 |
| 3. Content API | Complete | 2026-01-26 |
| 4. Payment Integration | Complete | 2026-01-27 |
| 5. Video & Storage | Complete | 2026-01-27 |
| 6. Frontend - Public Pages | In Progress | - |
| 7. Frontend - Member Area | Not started | - |
| 8. Admin Dashboard | Not started | - |
| 9. Docker & Deployment | Not started | - |

---
*Roadmap created: 2025-01-25*
*Last updated: 2026-01-30 — Phase 8 planned (9 plans in 3 waves)*
