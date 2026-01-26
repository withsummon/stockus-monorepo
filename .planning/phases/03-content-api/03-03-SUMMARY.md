---
phase: 03
plan: 03
subsystem: content-management
status: complete
completed: 2026-01-26
duration: 1m 41s

tags: [hono, drizzle, courses, sessions, tier-auth, crud]

dependency-graph:
  requires:
    - "03-01 (course schema definitions)"
    - "03-02 (slug utilities)"
    - "02-03 (tier-based auth middleware)"
  provides:
    - "Course CRUD API endpoints"
    - "Session management within courses"
    - "Tier-based access control for courses"
  affects:
    - "03-04 (research report routes will follow same pattern)"
    - "03-06 (cohort routes will reference courses)"

tech-stack:
  added: []
  patterns:
    - "Tier-based content access control"
    - "Soft delete pattern for content"
    - "Admin-only write operations"
    - "ID or slug lookup for GET endpoints"
    - "Nested resource CRUD (sessions within courses)"

files:
  created:
    - path: "backend/src/routes/courses.ts"
      purpose: "Course and session CRUD endpoints"
      exports: ["courseRoutes"]
  modified:
    - path: "backend/src/routes/index.ts"
      change: "Mounted course routes at /courses"

commits:
  - hash: "69739d3"
    message: "feat(03-03): implement course CRUD endpoints"
    type: "feat"
  - hash: "ed1050d"
    message: "feat(03-03): mount course routes at /courses"
    type: "feat"

decisions:
  - id: "03-03-01"
    decision: "ID or slug lookup for GET /:idOrSlug endpoint"
    rationale: "Provides flexibility - admins can use IDs, public URLs can use friendly slugs"
    impact: "Single endpoint handles both access patterns with regex check for numeric IDs"
    alternatives: ["Separate /by-id/:id and /by-slug/:slug endpoints"]

  - id: "03-03-02"
    decision: "Filter accessible courses in list endpoint vs return 403"
    rationale: "Better UX - users can see all courses with isAccessible flag rather than hiding member content"
    impact: "Frontend can show locked courses with upgrade CTA instead of hiding them"
    alternatives: ["Filter out inaccessible courses entirely", "Separate public/member list endpoints"]

  - id: "03-03-03"
    decision: "Hard delete for sessions, soft delete for courses"
    rationale: "Sessions cascade from courses (ON DELETE CASCADE), so soft delete not needed. Courses preserved for audit trail."
    impact: "Deleting session is permanent, deleting course sets deletedAt and status='archived'"
    alternatives: ["Soft delete sessions too", "Hard delete courses"]
---

# Phase 03 Plan 03: Course CRUD API Summary

Full CRUD endpoints for courses with nested session management and tier-based access control using requireTier middleware from Phase 2.

## What Was Built

### 1. Course Routes (backend/src/routes/courses.ts)

Implemented 8 endpoints covering full course and session lifecycle:

**Course Endpoints:**
- `GET /courses` - List all published courses with tier-based accessibility flags
- `GET /courses/:idOrSlug` - Get single course by ID or slug with tier access control
- `POST /courses` - Create course with auto-generated unique slug (admin only)
- `PATCH /courses/:id` - Update course, regenerate slug if title changes (admin only)
- `DELETE /courses/:id` - Soft delete course, set deletedAt and status='archived' (admin only)

**Session Endpoints:**
- `POST /courses/:courseId/sessions` - Add session to course (admin only)
- `PATCH /courses/:courseId/sessions/:sessionId` - Update session (admin only)
- `DELETE /courses/:courseId/sessions/:sessionId` - Hard delete session (admin only)

### 2. Route Mounting

Updated `backend/src/routes/index.ts` to mount course routes at `/courses` path.

### 3. Access Control

**Authentication:**
- All endpoints require authentication via `authMiddleware`
- Write operations (POST/PATCH/DELETE) require admin via `requireAdmin()`

**Authorization:**
- Course list shows all courses but marks inaccessible ones for non-members
- Course detail returns 403 if course is not free preview and user is not member tier
- Leverages existing `requireTier` middleware from Phase 2

### 4. Data Validation

Zod schemas for all input validation:
- `createCourseSchema` - title (3-255 chars), description, content, thumbnailUrl, isFreePreview
- `updateCourseSchema` - partial version for PATCH
- `createSessionSchema` - title, description, sessionOrder, durationMinutes
- `updateSessionSchema` - partial version for PATCH

## Deviations from Plan

None - plan executed exactly as written. The plan's guidance on using existing `requireTier` middleware was followed correctly.

## Decisions Made

**1. ID or slug lookup for GET endpoint (Decision 03-03-01)**
- Single endpoint handles both numeric IDs and slugs via regex check
- Pattern: `/^\d+$/.test(idOrSlug)` determines lookup method
- Benefit: Simpler API surface, flexible access patterns

**2. List endpoint filtering strategy (Decision 03-03-02)**
- Return all courses with `isAccessible` flag instead of filtering by tier
- Free users see member courses marked as locked
- Frontend can show upgrade CTAs on inaccessible content
- Alternative: Could filter entirely, but reduces discoverability

**3. Hard delete for sessions (Decision 03-03-03)**
- Sessions use hard delete (permanent removal from database)
- Courses use soft delete (deletedAt timestamp)
- Rationale: Sessions cascade from course deletion, soft delete adds complexity without audit benefit
- Course soft delete preserves history and allows undelete

## Testing Verification

**Compilation Check:**
- ✓ `npx tsc --noEmit` - No TypeScript errors
- ✓ All imports resolved correctly
- ✓ Auth middleware types properly inferred

**Endpoint Count Verification:**
- ✓ 8 endpoint definitions (3 course CRUD, 2 course read, 3 session CRUD)
- ✓ 15 middleware applications (authMiddleware + requireAdmin combinations)
- ✓ Routes mounted in index.ts at `/courses`

**Manual Testing Needed:**
- [ ] Create course as admin
- [ ] Update course title, verify slug regeneration
- [ ] Soft delete course, verify deletedAt and status change
- [ ] Add/update/delete sessions within course
- [ ] Access course as free user, verify 403 on non-preview content
- [ ] Access course as member, verify full access

## Key Code Patterns

**1. ID or Slug Lookup Pattern:**
```typescript
const isNumeric = /^\d+$/.test(idOrSlug)
if (isNumeric) {
  course = await db.query.courses.findFirst({
    where: and(eq(courses.id, parseInt(idOrSlug)), isNull(courses.deletedAt))
  })
} else {
  course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, idOrSlug), isNull(courses.deletedAt))
  })
}
```

**2. Tier-Based Filtering Pattern:**
```typescript
const accessibleCourses = courseList.map(course => ({
  ...course,
  isAccessible: course.isFreePreview || userTier === 'member',
}))
```

**3. Soft Delete Pattern:**
```typescript
await db.update(courses)
  .set({
    deletedAt: new Date(),
    status: 'archived',
  })
  .where(eq(courses.id, id))
```

**4. Slug Regeneration on Title Change:**
```typescript
let slug = existingCourse.slug
if (body.title && body.title !== existingCourse.title) {
  const baseSlug = generateSlug(body.title)
  slug = await createUniqueSlug(baseSlug, 'courses')
}
```

## Integration Points

**Upstream Dependencies:**
- `backend/src/middleware/auth.ts` - authMiddleware, requireAdmin, requireTier, AuthEnv
- `backend/src/utils/slug.ts` - generateSlug, createUniqueSlug
- `backend/src/db/schema/courses.ts` - courses, courseSessions tables
- Phase 02-03 TIER_LEVELS for access control comparison

**Downstream Impact:**
- Pattern established for other content routes (research, templates)
- Tier access control reusable for all content types
- ID or slug pattern applicable to research reports

## Next Phase Readiness

**Ready for:**
- Phase 03-04: Research report routes (can follow same pattern)
- Phase 03-06: Cohort routes (will reference courses)
- Phase 05: Video content upload (session.videoUrl field already exists)

**No blockers identified.**

## Metrics

**Execution:**
- Duration: 1 minute 41 seconds
- Tasks completed: 2/2
- Commits: 2
- Files created: 1
- Files modified: 1

**Code:**
- Lines added: ~320 (304 in courses.ts, 4 in index.ts, rest TypeScript overhead)
- Endpoints: 8
- Middleware applications: 15
- Zod schemas: 4

---

*Summary completed: 2026-01-26*
*Phase: 3/9 (Content API)*
*Plan: 3/5 in current phase*
