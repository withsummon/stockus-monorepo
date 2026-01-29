---
phase: 07-frontend-member-area
plan: 05
subsystem: ui
tags: [nextjs, react-player, jspdf, video, courses, certificates]

# Dependency graph
requires:
  - phase: 07-03
    provides: Member area layout with sidebar navigation
  - phase: 05-02
    provides: Video playback API with signed URLs
  - phase: 03-01
    provides: Course and session data models
provides:
  - Course listing page with tier-aware access
  - Course detail page with session navigation
  - Video player with signed URL fetching and auto-refresh
  - Course completion tracking with localStorage
  - PDF certificate generation for completed courses
affects: [admin, cohorts, learning-paths]

# Tech tracking
tech-stack:
  added: [react-player, jspdf]
  patterns:
    - "Client component wrapper for progress tracking"
    - "localStorage-based completion tracking"
    - "Tier-aware course access with pricing redirects"
    - "Dynamic react-player import to avoid SSR issues"

key-files:
  created:
    - frontend/src/app/(auth)/courses/page.tsx
    - frontend/src/app/(auth)/courses/[slug]/page.tsx
    - frontend/src/app/(auth)/courses/[slug]/[sessionId]/page.tsx
    - frontend/src/components/member/CourseCard.tsx
    - frontend/src/components/member/VideoPlayer.tsx
    - frontend/src/components/member/CourseCertificate.tsx
    - frontend/src/components/member/CoursePlayerClient.tsx
    - frontend/src/lib/course-progress.ts
  modified:
    - frontend/src/types/index.ts

key-decisions:
  - "react-player with dynamic import - Avoids SSR issues, widely used video player"
  - "localStorage for progress tracking - Client-side only, v1 approach before backend tracking"
  - "jsPDF for certificate generation - Client-side PDF generation, no server dependency"
  - "Client component wrapper pattern - CoursePlayerClient wraps VideoPlayer for completion tracking"
  - "Type assertion for dynamic ReactPlayer - Bypasses TypeScript issues with dynamic imports"

patterns-established:
  - "VideoPlayer extracts ID from videoUrl string - Supports multiple formats (/videos/123, videos/123, 123)"
  - "Auto-refresh signed URL pattern - Refresh every 50 minutes before 1-hour expiry"
  - "Tier-aware course access - Free users see locked content, redirect to pricing"
  - "Certificate only visible when course complete - CourseCertificate returns null if not complete"

# Metrics
duration: 7min
completed: 2026-01-29
---

# Phase 07 Plan 05: Course Pages with Video Playback and Certificates

**Course listing, video player with signed URL auto-refresh, localStorage progress tracking, and jsPDF certificate generation**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-29T16:40:15Z
- **Completed:** 2026-01-29T16:47:09Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Course pages with tier-aware access and pricing redirects
- VideoPlayer component with signed URL fetching and 50-minute auto-refresh
- Course completion tracking in localStorage
- PDF certificate generation with user name, course title, and completion date

## Task Commits

Each task was committed atomically:

1. **Task 1: Update types and create course components** - (components created in prior plan 07-07, types already committed)
2. **Task 2: Create course list and detail pages** - `f432524` (feat)
3. **Task 3: Add course completion tracking and certificate generation** - `0d5372e` (feat)

_Note: CourseCard and VideoPlayer components were already created in plan 07-07, matching this plan's specification._

## Files Created/Modified
- `frontend/src/app/(auth)/courses/page.tsx` - Course list with tier filtering
- `frontend/src/app/(auth)/courses/[slug]/page.tsx` - Course detail with sessions list and certificate button
- `frontend/src/app/(auth)/courses/[slug]/[sessionId]/page.tsx` - Video player page with navigation
- `frontend/src/components/member/CourseCard.tsx` - Course card with lock/preview badges (created in 07-07)
- `frontend/src/components/member/VideoPlayer.tsx` - Video player with signed URL fetching (created in 07-07)
- `frontend/src/components/member/CourseCertificate.tsx` - PDF certificate generator
- `frontend/src/components/member/CoursePlayerClient.tsx` - Client wrapper for completion tracking
- `frontend/src/lib/course-progress.ts` - localStorage progress tracking utilities
- `frontend/src/types/index.ts` - Added CourseSession, CourseWithSessions, ResearchReportDetail, Template

## Decisions Made

**VideoPlayer URL validation before ID extraction**
- Validates videoUrl format first, shows error for invalid formats
- Supports multiple formats: /videos/123, videos/123, 123
- Prevents runtime errors from malformed URLs

**Dynamic import with type assertion for ReactPlayer**
- `const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any`
- Bypasses TypeScript issues with dynamically imported component types
- Works correctly at runtime while satisfying TypeScript compiler

**Client component wrapper pattern for progress tracking**
- CoursePlayerClient wraps VideoPlayer to call markSessionComplete
- Keeps VideoPlayer reusable, progress logic separate
- Allows server component player page to pass course context

**localStorage for v1 completion tracking**
- Simple client-side tracking without backend changes
- Stores per-course completed session IDs and completion timestamp
- Sufficient for single-device usage, backend tracking is v2 enhancement

**Certificate visible only when complete**
- CourseCertificate returns null if course not complete
- Button appears automatically after last session completed
- No manual refresh needed, React re-renders on navigation

## Deviations from Plan

None - plan executed exactly as written. CourseCard and VideoPlayer components were already created in plan 07-07 with the same specification, so Task 1 component creation was effectively complete.

## Issues Encountered

**TypeScript errors with react-player dynamic import**
- **Issue:** Dynamic import caused type mismatch errors for ReactPlayer props
- **Solution:** Added `as any` type assertion to dynamic import
- **Verification:** TypeScript compiles without errors, component works correctly

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Course pages complete with:
- Video playback via signed URLs from backend
- Tier-aware access control
- Progress tracking and certificates

Ready for:
- Admin course management (create/edit courses and sessions)
- Backend progress tracking (replace localStorage)
- Learning path organization
- Quiz/assessment integration

No blockers.

---
*Phase: 07-frontend-member-area*
*Completed: 2026-01-29*
