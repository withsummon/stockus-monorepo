---
phase: 03-content-api
plan: 04
subsystem: backend/content
completed: 2026-01-26
duration: "1 min 33 sec"

requires:
  - 03-01 (Research report schema)
  - 03-02 (Slug utilities)

provides:
  - Research report CRUD API endpoints
  - Tier-based access control for research content
  - Publication date support for reports
  - Soft delete functionality

affects:
  - 03-05 (Template routes will follow same CRUD patterns)
  - 04-frontend (Frontend will consume research API)
  - 05-payments (Member tier unlocks research access)

tech-stack:
  added: []
  patterns:
    - Tier-based content filtering in list endpoints
    - ID-or-slug flexible lookup pattern
    - Admin-only write operations with requireAdmin middleware
    - Soft delete with status change (archived)

key-files:
  created:
    - backend/src/routes/research.ts
  modified:
    - backend/src/routes/index.ts

decisions:
  - title: "Tier filtering in list endpoint"
    choice: "List endpoint returns all reports but hides content for restricted items"
    rationale: "Allows users to see what content exists without exposing protected content"
    alternatives: "Filter out entirely (users can't discover), separate endpoints (more complex)"
    impact: "Frontend can show 'members-only' badges on restricted research reports"

  - title: "ID or slug lookup pattern"
    choice: "GET /:idOrSlug accepts numeric IDs or string slugs"
    rationale: "Flexible API for different frontend use cases (admin by ID, public by slug)"
    alternatives: "Separate endpoints (more routes), slug-only (harder for admin), ID-only (worse UX)"
    impact: "Single endpoint handles both admin tools and SEO-friendly URLs"
---

# Phase 3 Plan 04: Research Routes Summary

**One-liner:** Complete research report CRUD API with tier-based access control and publication date support

## What Was Built

Implemented full research report management API with 5 endpoints:

**Research routes (`backend/src/routes/research.ts`):**

1. **GET /research** - List all published reports
   - Auth required
   - Returns all reports, but hides content for tier-restricted items
   - Ordered by publication date (newest first)
   - Non-members see `restricted: true` flag on members-only reports

2. **GET /research/:idOrSlug** - Get single report
   - Auth required
   - Accepts numeric ID or slug
   - 403 if user tier insufficient for members-only content
   - Full content returned for authorized users

3. **POST /research** - Create report
   - Admin only (authMiddleware + requireAdmin)
   - Generates unique slug from title
   - Supports custom publication date or defaults to now
   - Returns created report with 201 status

4. **PATCH /research/:id** - Update report
   - Admin only (authMiddleware + requireAdmin)
   - Regenerates slug if title changed
   - Updates publication date if provided
   - Sets updatedAt timestamp

5. **DELETE /research/:id** - Soft delete report
   - Admin only (authMiddleware + requireAdmin)
   - Sets deletedAt timestamp and status='archived'
   - Does not physically remove data

**Route mounting:**
- Imported and mounted at `/research` path in `routes/index.ts`

## Decisions Made

### 1. Tier filtering in list endpoint
**Context:** Non-members shouldn't access premium research content, but need to discover what exists

**Decision:** List endpoint returns all reports but marks restricted items and hides their content

**Rationale:**
- Allows discovery of premium content (marketing benefit)
- Prevents actual access to protected content
- Single endpoint for all users (simpler frontend)
- Frontend can show "members-only" badges

**Alternatives considered:**
- Filter out entirely: Users can't see what they're missing (worse conversion)
- Separate public/member endpoints: More complex, duplicates query logic

**Impact:** Frontend can build "upgrade to access" flows around restricted research

### 2. ID or slug lookup pattern
**Context:** Admin tools need numeric IDs for reliability, public URLs need slugs for SEO

**Decision:** Single `GET /:idOrSlug` endpoint that detects parameter type with regex

**Rationale:**
- Flexible for different use cases (admin panel vs public site)
- Single endpoint = less code, less testing surface
- Regex detection is reliable (/^\d+$/)
- Consistent with RESTful practices

**Alternatives considered:**
- Separate /research/by-slug/:slug and /research/:id: More routes, more boilerplate
- Slug-only: Admin tools harder to build (slug can change)
- ID-only: Poor SEO, worse user experience

**Impact:** Admin can reference reports by stable ID, public URLs are SEO-friendly

## Implementation Notes

### Authentication & Authorization
All endpoints require authentication (`authMiddleware`). Write operations (POST, PATCH, DELETE) additionally require admin access via `requireAdmin()` middleware.

### Tier-Based Access Control
The tier gating logic works as follows:
- Free preview reports (`isFreePreview: true`) - accessible to all authenticated users
- Members-only reports (`isFreePreview: false`) - require `userTier === 'member'`
- List endpoint marks restricted items but doesn't hide them
- Get endpoint returns 403 for insufficient tier

### Publication Date Handling
- Admin can set custom publication date via `publishedAt` ISO string
- If not provided, defaults to current date
- List endpoint orders by `publishedAt DESC` (newest first)
- Supports scheduling by setting future dates (query filter not implemented yet)

### Slug Management
- Slugs auto-generated from title using `generateSlug()`
- Uniqueness ensured via `createUniqueSlug()` database queries
- If title changes on update, slug regenerates
- Database prevents duplicate slugs with unique constraint

### Soft Delete Pattern
Soft delete implementation:
- Sets `deletedAt` timestamp (preserves data)
- Changes status to 'archived' (semantic state)
- All queries filter `WHERE deletedAt IS NULL`
- Allows potential undelete in future

## Testing Performed

**TypeScript Compilation:**
- ✅ `npx tsc --noEmit` - No type errors
- ✅ Correct imports from schema, middleware, utilities
- ✅ Proper typing for Hono app with AuthEnv

**Code Review:**
- ✅ All 5 endpoints implemented (GET list, GET single, POST, PATCH, DELETE)
- ✅ Auth middleware on all routes
- ✅ Admin middleware on write operations
- ✅ Tier access control on GET single
- ✅ publishedAt parsing and handling
- ✅ Soft delete with deletedAt + status change
- ✅ Routes mounted in index.ts

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:** Plan 03-05 (Template routes)

**Provides:**
- Research API ready for frontend consumption
- Admin can manage research content
- Members can access premium research
- Publication scheduling infrastructure in place

**Blockers:** None

**Recommendations:**
- Consider adding pagination to list endpoint for large research libraries
- May want to add search/filter by date range or category in future
- Could implement scheduled publishing (query filter for `publishedAt <= now()`)
- Consider adding view count tracking for analytics

## Files Changed

**Created:**
- `backend/src/routes/research.ts` (207 lines) - Research CRUD endpoints

**Modified:**
- `backend/src/routes/index.ts` (2 lines) - Mounted research routes

## Git Commits

| Commit  | Message                                                  | Files                        |
|---------|----------------------------------------------------------|------------------------------|
| b40dc35 | feat(03-04): create research routes with CRUD operations | backend/src/routes/research.ts |
| 24db1aa | feat(03-04): mount research routes                       | backend/src/routes/index.ts  |

## Performance Metrics

**Execution time:** 1 minute 33 seconds
**Tasks completed:** 2/2
**Files created:** 1
**Files modified:** 1
**Lines of code added:** 209
