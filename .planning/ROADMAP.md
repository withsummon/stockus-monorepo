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
- [ ] **Phase 2: Authentication System** - User registration, login, JWT sessions, email verification, password reset
- [ ] **Phase 3: Content API** - Courses, research reports, templates, cohorts CRUD endpoints
- [ ] **Phase 4: Payment Integration** - Midtrans subscriptions, workshops, promo codes, referral system
- [ ] **Phase 5: Video & Storage** - Cloudflare R2 integration, signed URLs for video access
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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

### Phase 5: Video & Storage
**Goal**: Secure video storage with member-only access via signed URLs
**Depends on**: Phase 4 (video access gated by subscription)
**Requirements**: VID-01, VID-02, VID-03, VID-04
**Success Criteria** (what must be TRUE):
  1. Videos upload to Cloudflare R2
  2. Signed URLs generated for authenticated members only
  3. URLs expire after configurable time
  4. Video metadata stored in database
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

### Phase 8: Admin Dashboard
**Goal**: Admin interface for content and user management
**Depends on**: Phase 3 (needs content API), Phase 4 (needs payment data)
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05
**Success Criteria** (what must be TRUE):
  1. Admin can manage courses, reports, templates
  2. Admin can view/edit users and subscriptions
  3. Admin can view orders and payment history
  4. Dashboard shows key metrics
**Plans**: TBD

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
| 1. Backend Foundation | ✓ Complete | 2026-01-26 |
| 2. Authentication System | Not started | - |
| 3. Content API | Not started | - |
| 4. Payment Integration | Not started | - |
| 5. Video & Storage | Not started | - |
| 6. Frontend - Public Pages | Not started | - |
| 7. Frontend - Member Area | Not started | - |
| 8. Admin Dashboard | Not started | - |
| 9. Docker & Deployment | Not started | - |

---
*Roadmap created: 2025-01-25*
*Last updated: 2026-01-26 — Phase 1 complete (verified)*
