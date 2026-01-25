# Research Summary: StockUs Investment Education Platform

**Domain:** Investment Education Membership Platform
**Researched:** 2026-01-25
**Overall Confidence:** MEDIUM-HIGH

---

## Executive Summary

StockUs is an investment education membership platform targeting Indonesian investors with cohort-based courses, research reports, downloadable templates, and subscription payments. The research reveals a mature stack centered on PayloadCMS 3.0 as a TypeScript-first headless CMS with Next.js 15, providing built-in authentication, role-based access control, and powerful content management capabilities.

**Critical Finding:** Standard file storage is insufficient for course videos. Video content requires DRM protection to prevent unauthorized downloads and redistribution. VdoCipher emerges as the recommended solution with Google Widevine + Apple FairPlay DRM, purpose-built for e-learning platforms. This is non-negotiable for a paid course business model.

**Architectural Insight:** PayloadCMS 3.0 represents a paradigm shift - it installs directly into Next.js applications rather than running as a separate service. This enables using the Local API in server components (bypassing network calls) while maintaining the option for separate deployment of backend/frontend if needed. The platform's built-in authentication eliminates the need for external auth services like Auth0 or Clerk.

**Indonesian Market Fit:** Midtrans dominates the Indonesian payment gateway market with 25+ local payment methods (GoPay, OVO, Dana, ShopeePay) and official recurring payment support via Node.js SDK. This is essential for subscription-based revenue.

---

## Key Findings

**Stack:** PayloadCMS 3.0 + Next.js 15 + PostgreSQL + Midtrans + VdoCipher DRM + Cloudflare R2

**Architecture:** Headless CMS with separate backend (PayloadCMS API + Admin) and frontend (Next.js member site). Server Components for SEO-critical content, TanStack Query for client-side interactivity.

**Critical Pitfall:** Using basic file storage (S3, R2) for course videos enables trivial downloads. 98% cost savings from R2 vs S3 is irrelevant if course content is pirated. Must use DRM-capable platform like VdoCipher.

---

## Implications for Roadmap

Based on research, the following phase structure is recommended:

### Phase 1: Foundation & Authentication (Weeks 1-2)
**Focus:** PayloadCMS backend setup, database schema, user authentication

**Addresses:**
- PayloadCMS 3.0 installation with PostgreSQL adapter
- User collection with membership tiers (free, premium, enterprise)
- JWT authentication with HTTP-only cookies
- Role-based access control foundation
- Basic Next.js frontend shell

**Rationale:** Authentication and access control are foundational. PayloadCMS provides built-in auth, but configuring roles and permissions correctly upfront prevents refactoring later. This phase establishes the security model for the entire platform.

**Avoids Pitfall:** Starting with complex content types before auth is configured leads to retroactive access control, often missing edge cases.

---

### Phase 2: Content Management & CMS Configuration (Weeks 3-4)
**Focus:** Collections for courses, reports, templates; Lexical rich text setup

**Addresses:**
- Courses collection (metadata, pricing, cohort scheduling)
- Research Reports collection (publication dates, premium access)
- Templates collection (downloadable PDFs, Excel files)
- Lexical rich text editor with custom blocks for course content
- Cloudflare R2 integration for static files (PDFs, templates)

**Rationale:** Content structure must be established before implementing payment flows. Lexical is PayloadCMS 3.0's default editor and requires configuration for custom course content blocks (video embeds, code snippets).

**Avoids Pitfall:** Deferring storage decisions leads to inconsistent file handling. Configuring R2 early prevents later migration pain.

---

### Phase 3: Payment Integration (Midtrans) (Week 5)
**Focus:** Subscription payment flow, webhook handling, access control updates

**Addresses:**
- Midtrans SDK integration (Snap API for subscriptions)
- Webhook endpoint for payment notifications
- Subscription status updates in PayloadCMS Users collection
- Payment history collection for record-keeping
- Trial period logic (if applicable)

**Rationale:** Payment processing is complex and requires separate focus. Midtrans webhooks must reliably update user subscription status to grant/revoke access. This is a critical integration point requiring thorough testing.

**Likely Needs Deeper Research:** Midtrans recurring payment support varies by payment method. Phase-specific research needed to identify which Indonesian payment methods support subscriptions vs one-time only.

---

### Phase 4: Video Infrastructure (VdoCipher DRM) (Week 6)
**Focus:** DRM video hosting, upload workflow, secure embedding

**Addresses:**
- VdoCipher account setup and API integration
- Video upload workflow (admin panel to VdoCipher)
- Secure video embedding in course pages
- Dynamic watermarking with member email/ID
- Video access control tied to membership status

**Rationale:** Video DRM is specialized and requires dedicated implementation effort. VdoCipher API must be integrated into PayloadCMS admin panel for video upload workflow. This is separate from Cloudflare R2 (used for PDFs/images).

**Avoids Pitfall:** Attempting to implement DRM late in development when content is already stored in basic S3/R2 leads to re-upload of all videos and migration complexity.

**Likely Needs Deeper Research:** VdoCipher upload API workflow, webhook handling for encoding status, optimal video quality settings for Indonesian bandwidth.

---

### Phase 5: Member Dashboard & Frontend (Weeks 7-8)
**Focus:** Member-facing Next.js frontend, course navigation, progress tracking

**Addresses:**
- Course catalog with filtering/search
- Individual course pages with video player
- Member dashboard (enrolled courses, progress, downloads)
- Research reports library with download links
- Template downloads with usage tracking

**Rationale:** Frontend development can proceed once backend APIs and content structure are stable. Server Components fetch course data from PayloadCMS Local API for SEO. TanStack Query handles client-side interactivity (progress tracking, favorites).

**Avoids Pitfall:** Building frontend before backend APIs are finalized leads to constant refactoring. Waiting until Phase 5 ensures stable data contracts.

---

### Phase 6: Admin Panel Customization (Week 9)
**Focus:** PayloadCMS admin panel UX for content managers

**Addresses:**
- Custom admin components for cohort scheduling
- Video upload interface (VdoCipher integration)
- Member management dashboard (subscription status, activity)
- Analytics widgets (course completion, popular content)

**Rationale:** PayloadCMS admin is functional out-of-box but benefits from customization for non-technical content managers. This includes simplified video uploads and member insights.

**Standard Patterns:** PayloadCMS admin customization is well-documented. Unlikely to need deep research.

---

### Phase 7: Deployment & DevOps (Week 10)
**Focus:** Docker containerization, CI/CD, monitoring

**Addresses:**
- Docker setup for PayloadCMS backend + admin
- Separate Next.js frontend deployment
- Database migration workflow for production
- Environment variable management
- Health checks and monitoring

**Rationale:** Deployment is final phase once application is feature-complete. Separate backend/frontend deployments require careful CORS and auth cookie configuration.

**Avoids Pitfall:** Database migrations in PayloadCMS require explicit management in production (unlike auto-migration in dev). Overlooking this causes deployment failures.

**Likely Needs Deeper Research:** PayloadCMS separate deployment patterns (most examples show monorepo). CORS configuration for cross-origin auth cookies.

---

## Phase Ordering Rationale

1. **Auth First:** Access control is architectural. Must be established before content creation.
2. **Content Before Payment:** Can't sell courses that don't exist. Define content structure before implementing subscription logic.
3. **Payment Before Video DRM:** Subscription status determines video access. Payment flow must work before integrating complex DRM.
4. **DRM Before Frontend:** Frontend displays content. Video infrastructure must be stable before building course pages.
5. **Admin Last:** Content managers can tolerate rough admin UX initially. Polish after core features work.
6. **Deployment Final:** Can't deploy incomplete features. Wait until application is functional.

**Dependencies:**
- Phase 2 (Content) depends on Phase 1 (Auth) - access control requires user roles
- Phase 3 (Payment) depends on Phase 1 (Auth) - payment status updates user accounts
- Phase 4 (Video) depends on Phase 3 (Payment) - video access gated by subscription
- Phase 5 (Frontend) depends on Phases 2-4 - displays content, videos, requires auth
- Phase 6 (Admin) depends on Phases 2-4 - manages content, videos
- Phase 7 (Deployment) depends on all - can't deploy incomplete app

---

## Research Flags for Phases

| Phase | Research Needs | Confidence |
|-------|----------------|------------|
| Phase 1 (Auth) | Standard patterns, well-documented | HIGH - Unlikely to need research |
| Phase 2 (Content) | Standard patterns, Lexical documented | HIGH - Unlikely to need research |
| Phase 3 (Payment) | **Midtrans recurring payment method support** | MEDIUM - Needs validation with Midtrans support for Indonesian payment method capabilities |
| Phase 4 (Video DRM) | **VdoCipher upload workflow, webhook handling** | MEDIUM - Needs phase-specific research on API integration patterns |
| Phase 5 (Frontend) | Standard Next.js patterns | HIGH - Unlikely to need research |
| Phase 6 (Admin) | PayloadCMS customization documented | MEDIUM-HIGH - Unlikely to need research |
| Phase 7 (Deployment) | **Separate deployment architecture, CORS config** | MEDIUM - Needs phase-specific research on PayloadCMS separate frontend deployment |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack (PayloadCMS + Next.js)** | HIGH | Official integration, production-proven, extensive documentation |
| **Database (PostgreSQL)** | HIGH | Clear use case alignment, standard for membership platforms |
| **Payment (Midtrans)** | MEDIUM-HIGH | Official SDK exists, recurring payments supported, but Indonesian payment method specifics need validation |
| **Video (VdoCipher)** | MEDIUM | Industry standard for DRM, but less ecosystem integration. Requires custom API integration |
| **Storage (Cloudflare R2)** | MEDIUM-HIGH | Mature platform, S3-compatible reduces risk, but newer than S3 |
| **Architecture (Separate Deployments)** | MEDIUM | Technically supported but most examples show monorepo. CORS/auth cookies need careful configuration |

---

## Gaps to Address

### Immediate Validation Needed (Before Phase 1)

1. **VdoCipher Performance in Indonesia:**
   - **Gap:** VdoCipher uses AWS/Google Cloud infrastructure but primary docs don't specify Indonesia edge locations
   - **Impact:** Video streaming latency could affect UX
   - **Action:** Test VdoCipher streaming speed from Indonesia before committing

2. **Midtrans Recurring Payment Support by Method:**
   - **Gap:** Midtrans supports recurring payments, but documentation doesn't clearly specify which of the 25 payment methods (GoPay, OVO, Dana, bank transfer, cards) support subscriptions vs one-time only
   - **Impact:** May need to limit subscription payment methods, affecting conversion rates
   - **Action:** Contact Midtrans support for official list of recurring-capable payment methods

### Phase-Specific Research Needed

3. **PayloadCMS Separate Deployment CORS Configuration (Phase 7):**
   - **Gap:** Most PayloadCMS + Next.js examples show monorepo deployment. Separate backend/frontend requires custom CORS and auth cookie configuration
   - **Impact:** Auth cookies may not work cross-origin without proper SameSite/Domain settings
   - **Action:** Research during Phase 7 deployment planning

4. **VdoCipher Upload API Workflow (Phase 4):**
   - **Gap:** Integration between PayloadCMS admin panel and VdoCipher video upload API not documented
   - **Impact:** Unclear how admin users upload videos (direct to VdoCipher vs staged upload)
   - **Action:** Research VdoCipher API during Phase 4 sprint planning

### Non-Critical Optimizations (Post-MVP)

5. **Database Read Replicas for Scaling:**
   - **Gap:** PostgreSQL recommended but no guidance on scaling beyond 100k users
   - **Impact:** Potential performance issues at scale
   - **Action:** Defer until user base approaches 50k members

6. **CDN Configuration for Global Performance:**
   - **Gap:** Cloudflare R2 has built-in CDN but optimization for Indonesia-specific use case not researched
   - **Impact:** Potential latency for non-Indonesian users (if platform expands regionally)
   - **Action:** Defer until regional expansion is planned

---

## Key Recommendations

### Do This
1. **Commit to VdoCipher Early:** Video DRM is non-negotiable. Configure in Phase 4, don't defer.
2. **Use PostgreSQL:** Membership/subscription data is relational. Don't fall into MongoDB flexibility trap.
3. **Validate Midtrans Payment Methods:** Before Phase 3, get official list of recurring-capable payment methods from Midtrans support.
4. **Test VdoCipher Indonesia Performance:** Sign up for trial, test streaming speed from Indonesian IPs.
5. **Configure RBAC from Day 1:** PayloadCMS access control is powerful but requires upfront design. Don't retrofit later.

### Don't Do This
1. **Don't Use Cloudflare Stream:** No DRM = course piracy. Spend the extra money on VdoCipher.
2. **Don't Skip Database Migrations in Production:** PayloadCMS auto-migrates in dev but not production. Missing this breaks deployments.
3. **Don't Store JWTs in localStorage:** Security risk. Use PayloadCMS HTTP-only cookies + in-memory tokens.
4. **Don't Use Node.js 18:** LTS ends April 2025. Use Node 22 for new projects.
5. **Don't Implement Custom Auth:** PayloadCMS has it built-in. Auth0/Clerk add complexity without benefit.

---

## Ready for Roadmap Creation

Research is comprehensive enough to structure a 10-week roadmap with 7 major phases. Key technology decisions are made with HIGH or MEDIUM-HIGH confidence. Remaining gaps are specific integration details that require phase-specific research (Midtrans payment methods, VdoCipher API, separate deployment CORS).

**Next Steps:**
1. Validate VdoCipher Indonesia performance (test trial account)
2. Contact Midtrans support for recurring payment method list
3. Create detailed roadmap with sprint breakdown based on phase structure above
4. Assign effort estimates to each phase based on team size and experience

---

## Sources

Comprehensive sources provided in STACK.md. Key references:

- [PayloadCMS Official Documentation](https://payloadcms.com/docs)
- [PayloadCMS 3.0 Release Announcement](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [VdoCipher Pricing & Features](https://www.vdocipher.com/site/pricing/)
- [Cloudflare R2 vs AWS S3 Comparison](https://www.digitalapplied.com/blog/cloudflare-r2-vs-aws-s3-comparison)
- [PayloadCMS Authentication Guide](https://payloadcms.com/docs/authentication/overview)
- [PayloadCMS Access Control Guide](https://payloadcms.com/docs/access-control/overview)
