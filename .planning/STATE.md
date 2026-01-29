# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-01-26)

**Core value:** Indonesian investors can learn structured approaches to global equity investing through cohort-based courses, research, templates, and a professional community.
**Current focus:** Phase 8 - Admin Dashboard (Phase 7 complete)

## Current Position

Phase: 8 of 9 (Admin Dashboard)
Plan: 6 of 9 in current phase
Status: In progress
Last activity: 2026-01-30 — Completed 08-05-PLAN.md (Research Management)

Progress: [█████████░] 96%

## Performance Metrics

**Velocity:**
- Total plans completed: 40
- Average duration: 2.3 min
- Total execution time: 1.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-backend-foundation | 2 | 6 min | 3 min |
| 02-authentication-system | 5 | 10 min | 2 min |
| 03-content-api | 6 | 11.5 min | 1.9 min |
| 04-payment-integration | 6 | 11 min | 1.8 min |
| 05-video-storage | 2 | 5 min | 2.5 min |
| 06-frontend-public-pages | 4 | 13.7 min | 3.4 min |
| 07-frontend-member-area | 9 | 26.4 min | 2.9 min |
| 08-admin-dashboard | 6 | 24.4 min | 4.1 min |

**Recent Trend:**
- Last completed: 08-05 (5.0 min)
- Previous: 08-07 (5.3 min)
- Trend: Phase 8 progressing, research management with optional stock analysis complete

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Hono for backend API - Lightweight, TypeScript-native, fast
- Next.js for frontend - SSR/SSG, React ecosystem
- PostgreSQL + Drizzle ORM - Type-safe queries, good migrations
- Docker Compose for deployment - Multi-service orchestration
- Midtrans for payments - Required for Indonesian payment methods

**From 01-01:**
- ESM over CommonJS - Modern standard, better Hono compatibility (01-01)
- Connection pool limits - 20 max connections, 30s idle timeout (01-01)
- Fail-fast validation - Environment validated at startup with Zod (01-01)

**From 01-02:**
- Modular route mounting with app.route() - Preserves TypeScript inference (01-02)
- Split health endpoints - /health (liveness) and /health/ready (readiness) for production patterns (01-02)
- Explicit schema files in drizzle.config.ts - Avoids ESM/CJS conflicts with barrel imports (01-02)

**From 02-01:**
- tsx runner for drizzle-kit - Resolves ESM/CJS conflict for migration generation (02-01)

**From 02-02:**
- Result objects over exceptions - Email service returns { success, messageId?, error? } instead of throwing (02-02)
- Node.js crypto only for tokens - No external deps for token generation/hashing (02-02)
- Timing-safe comparison - crypto.timingSafeEqual prevents timing attacks (02-02)

**From 02-03:**
- Argon2id with OWASP 2026 config - 25MB RAM, 3 iterations, 1 thread for password hashing (02-03)
- Explicit HS256 in JWT verify - Prevents algorithm confusion attacks (02-03)
- Numeric tier levels - TIER_LEVELS for easy comparison in authorization (02-03)

**From 02-04:**
- Email lowercase normalization - Prevents duplicate accounts with different case (02-04)
- Refresh token path scope - Limits cookie to /auth/refresh for reduced XSS exposure (02-04)
- Non-blocking email sends - Failures logged but don't block response (02-04)
- CORS credentials exact origin - No wildcards when credentials enabled (02-04)

**From 02-05:**
- GET for verify-email - Easy email link clicks without form submission (02-05)
- 1-hour password reset expiry - Shorter than 24h verification for security (02-05)
- Session invalidation on password reset - All sessions deleted, force re-login (02-05)
- Generic enumeration responses - forgot-password and resend-verification always return success (02-05)

**From 03-01:**
- Admin middleware pattern - requireAdmin() middleware queries admins table separate from tier authorization (03-01)
- Timestamp mode date - All timestamp columns use { mode: 'date' } for consistent TypeScript Date objects (03-01)
- Soft delete pattern - deletedAt nullable timestamp preserves content history (03-01)

**From 03-02:**
- Slug uniqueness via database queries - createUniqueSlug queries database to prevent race conditions (03-02)
- UUID filenames for uploads - saveFile uses UUIDs to prevent path traversal and collisions (03-02)
- Validation returns result objects - validateFile returns { valid, error? } consistent with 02-02 pattern (03-02)

**From 03-04:**
- Tier filtering in list endpoint - List endpoint returns all reports but marks restricted items, allowing discovery (03-04)
- ID or slug lookup pattern - Single endpoint accepts numeric IDs or slugs for flexibility (03-04)

**From 03-05:**
- Files remain on disk after soft delete - Physical cleanup is v2 concern, simplifies v1 while preserving audit trail (03-05)
- Template downloads tier-gated - Free users only access isFreePreview templates, members access all (03-05)
- Image routes admin-only - All image endpoints require admin auth, not publicly accessible (03-05)

**From 04-01:**
- generatedAlwaysAsIdentity for primary keys - Modern PostgreSQL pattern prevents accidental explicit ID inserts (04-01)
- Cohorts serve as workshops - No separate workshops table, cohorts with price are purchasable (04-01)
- Raw webhook response stored - Full Midtrans JSON stored for debugging/audit (04-01)

**From 04-02:**
- Snap token-based integration - Frontend-initiated payment with Midtrans modal (04-02)
- Order ID format sub-{userId}-{timestamp}-{nanoid} - Unique IDs with embedded user context for webhook processing (04-02)
- Custom fields for metadata - custom_field1/2 carry promo/referral IDs through webhook lifecycle (04-02)

**From 04-03:**
- Promo code uppercase normalization - Case-insensitive matching with consistent storage (04-03)
- Referral collision retry - Up to 5 retries on nanoid collision for graceful handling (04-03)
- Atomic counter increments - SQL template literals prevent race conditions (04-03)
- Transaction for referral rewards - Ensures consistency between usage record and stats (04-03)

**From 04-04:**
- Subscription price constant in routes - IDR 2,500,000 hardcoded for v1 simplicity (04-04)
- Pending record before token - Payment record created before Snap token return for audit trail (04-04)
- Own referral code rejection at route level - Prevents self-referral in payment flow (04-04)

**From 04-05:**
- Idempotency via midtrans_transaction_id - Prevents duplicate webhook processing (04-05)
- Settlement or capture+accept triggers success - Covers bank transfer and card payments (04-05)
- Non-blocking email with catch handler - Failures logged but don't break webhook response (04-05)
- Tier revert on payment failure - Handles rare settlement->deny edge case (04-05)

**From 04-06:**
- Auto-generate on access pattern - Referral codes created on first access for legacy members (04-06)
- Self-referral prevention - Validation endpoint checks ownership and rejects own codes (04-06)

**From 05-01:**
- R2 region 'auto' - Cloudflare handles region routing automatically (05-01)
- 15-min upload URL expiry - Balance between security and UX (05-01)
- 1-hour playback URL expiry - Reasonable session length (05-01)
- AWS SDK v3 pattern - S3Client + Commands + getSignedUrl for presigned URLs (05-01)

**From 05-02:**
- Inline video types in routes - Routes define their own validation for isolation, centralized constants available for future use (05-02)
- Member tier for playback - Any member can access any video, course-level access control is v2 (05-02)
- Session linking pattern - confirm-upload updates courseSessions.videoUrl for automatic video discovery (05-02)

**From 06-01:**
- Next.js 15 with App Router - Server Components by default, improved performance, nested layouts (06-01)
- shadcn/ui over pre-built library - Copy-paste components into codebase, full customization, no runtime overhead (06-01)
- Inter font over Geist - Widely used, good readability, professional appearance (06-01)
- Indonesian locale (id_ID) - Target audience is Indonesian investors (06-01)
- Sticky header with backdrop blur - Always accessible navigation, modern aesthetic (06-01)

**From 06-03:**
- Person JSON-LD for team members - Used @graph array for multiple Person entities, improves SEO (06-03)
- Two-tier community model - Free (public Discord) vs Premium (members-only channels) (06-03)
- Avatar placeholder pattern - Initials in colored circles, easy to replace with real photos later (06-03)

**From 06-04:**
- Product JSON-LD with aggregate rating - Rich search results for pricing page (06-04)
- 5-minute cache revalidation - Balances research page freshness and performance (06-04)
- Empty state handling for API failures - Graceful degradation during build when backend unavailable (06-04)

**From 07-01:**
- jose for JWT verification - Next.js Edge-compatible, ESM-native, officially recommended for Next.js middleware (07-01)
- Data Access Layer pattern - React cache() wrapper ensures single verification per request lifecycle (07-01)
- Defense-in-depth auth - Middleware for optimistic redirects, DAL for secure data access (07-01)
- Cookie forwarding pattern - Server-side manually constructs Cookie header, client-side uses credentials: 'include' (07-01)

**From 07-02:**
- Suspense boundary for useSearchParams - LoginForm uses useSearchParams() which requires Suspense in Next.js 15 (07-02)
- credentials: include pattern - All auth fetch calls include credentials for httpOnly cookies (07-02)
- Success state in SignupForm - Shows email verification message after signup, prevents duplicate submissions (07-02)
- Indonesian locale for auth forms - Masuk/Daftar text consistent with target audience (07-02)

**From 07-03:**
- Route group pattern for member pages - (auth) route group keeps URLs clean without prefix (07-03)
- Layout-level authentication - Single auth verification in layout.tsx protects all pages in group (07-03)
- Client Sidebar for active state - usePathname requires client component, user data passed from layout (07-03)

**From 07-04:**
- Time-based greeting pattern - Dashboard shows Selamat pagi/siang/malam based on hour for personalization (07-04)
- Tier-aware component design - Components accept tier prop and adjust content (DashboardStats, QuickActions) (07-04)
- Upgrade prompt placement - QuickActions shows upgrade card for free users, links to /pricing (07-04)

**From 07-07:**
- axios for download progress - Built-in onDownloadProgress callback simplifies progress tracking vs fetch API (07-07)
- localStorage for download history - v1 client-side only tracking, sufficient for personal tracking without backend complexity (07-07)
- Filename extraction pattern - Safely extracts from URL path, falls back to Content-Disposition header, then template title with default extension (07-07)
- 50-download history limit - Prevents localStorage bloat while maintaining useful recent context (07-07)

**From 07-09:**
- Indonesian locale for dates - Used 'id-ID' for date formatting consistent with target audience (07-09)
- Avatar placeholder pattern - Display first letter of user name in colored circle for consistent visual identity (07-09)
- Tier-aware badge - Default variant for member tier, secondary for free tier (07-09)
- Password reset flow - Link to /forgot-password instead of inline form for simplicity (07-09)

**From 07-06:**
- Stock info fields nullable - Not all research reports require stock analysis, ResearchDetailCard handles gracefully by returning null (07-06)
- 403 locked state UI - Free users see locked state inline instead of redirect, better UX with upgrade CTA (07-06)
- Tier filtering client-side - Fetch all reports, filter by tier client-side, show accessible and locked separately for discovery (07-06)
- Stock rating badge colors - buy=default, hold=secondary, sell=destructive for consistent visual hierarchy (07-06)

**From 07-05:**
- react-player with dynamic import - Avoids SSR issues, widely used video player (07-05)
- localStorage for progress tracking - Client-side only, v1 approach before backend tracking (07-05)
- jsPDF for certificate generation - Client-side PDF generation, no server dependency (07-05)
- Client component wrapper pattern - CoursePlayerClient wraps VideoPlayer for completion tracking (07-05)
- Type assertion for dynamic ReactPlayer - Bypasses TypeScript issues with dynamic imports (07-05)

**From 08-01:**
- Admin auth check via endpoint probe - checkIsAdmin calls /admin/metrics to verify access instead of duplicating admin table query (08-01)
- Admin badge destructive color - Uses destructive/10 background for visual distinction from member badge (08-01)
- Admin route protection at layout level - requireAdmin in layout.tsx protects all admin pages, redirects non-admins to /dashboard (08-01)

**From 08-02:**
- TanStack Table for data tables - Headless library, full UI control, widely used, TypeScript-native (08-02)
- React Hook Form + Zod for forms - Matches backend validation, excellent TypeScript support, performant (08-02)
- Client-side table operations - V1 simplicity, admin content volume manageable, instant UX (08-02)
- Generic DataTable component - DataTable<TData, TValue> with ColumnDef for reusability across all admin tables (08-02)

**From 08-06:**
- FormData for file uploads - Browser sets multipart/form-data with boundary automatically, no manual Content-Type header (08-06)
- File metadata edit only - File cannot be changed after upload, must delete and re-upload (08-06)
- Client-side file validation - Type and size checked before upload for better UX (08-06)
- formatFileSize helper - Human-readable file sizes (KB/MB) for templates and uploads (08-06)

**From 08-08:**
- Backend nested user object structure - Admin orders endpoint transforms flat userName/userEmail to nested user object for consistent structure (08-08)
- Status badge color mapping - settlement/capture=default, pending=secondary, deny/cancel/expire=destructive, refund=outline for visual status recognition (08-08)
- IDR currency formatting - Intl.NumberFormat('id-ID') with currency: 'IDR' for Indonesian Rupiah display (08-08)
- Filter reset pattern - setPage(1) when status filter changes to avoid pagination edge cases (08-08)

**From 08-05:**
- Optional stock fields pattern - All stock analysis fields nullable, empty string to null conversion on submit (08-05)
- Rating badge color mapping - buy=default, hold=secondary, sell=destructive for consistent visual hierarchy in admin tables (08-05)
- Two-section form layout - Basic Info + Stock Analysis (optional) in separate Card components for visual clarity (08-05)
- String input for targetPrice - Use string type in form, convert to number on submit to avoid complex Zod coercion types (08-05)


**From 08-07:**
- Tier change automatically manages subscription lifecycle - Changing to member creates 1-year subscription, changing to free cancels active subscription (08-07)
- Admin-granted subscriptions have 1-year duration - Manual tier upgrade creates subscription with endDate set 1 year from now (08-07)
- Payment history limited to 20 entries - User detail endpoint returns 20 most recent payments for performance and UI clarity (08-07)
### Pending Todos

None yet.

### Blockers/Concerns

**From research:**
- Midtrans recurring payment method support: Not all Indonesian payment methods support subscriptions, may need invoice-based renewal
- Video DRM alternative: Using Cloudflare R2 with signed URLs instead of VdoCipher (simpler, accepts download risk)

**From 01-01:**
- PostgreSQL database needs local setup before next phase (database not yet configured)

## Session Continuity

Last session: 2026-01-30 (plan execution)
Stopped at: Completed 08-07-PLAN.md (User Management)
Resume file: None

---
*Last updated: 2026-01-30*
