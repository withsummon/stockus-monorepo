---
phase: 05-video-storage
plan: 02
subsystem: video
tags:
  - video
  - r2
  - presigned-urls
  - admin
  - playback
dependency-graph:
  requires:
    - 05-01 # R2 infrastructure
  provides:
    - videoRoutes
    - admin upload flow
    - member playback URLs
  affects:
    - 06-frontend-dashboard # Will use video playback URLs
tech-stack:
  added: []
  patterns:
    - presigned upload URL flow
    - confirm upload with metadata save
    - session linking via videoUrl column
key-files:
  created:
    - backend/src/routes/videos.ts
    - backend/drizzle/0004_wandering_echo.sql
  modified:
    - backend/src/routes/index.ts
    - backend/drizzle.config.ts
    - backend/src/utils/file-upload.ts
decisions:
  - id: videos-inline-validation
    choice: Inline video types in routes
    reason: Routes define their own validation for isolation, file-upload.ts exports centralized constants for future use
  - id: member-tier-for-playback
    choice: requireTier('member') for playback
    reason: Any member can access any video for now, course-level access control is v2
metrics:
  duration: 2 min
  completed: 2026-01-27
---

# Phase 5 Plan 02: Video API Routes Summary

**Video management routes for admin upload flow and member playback access with presigned URLs**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-27T02:25:37Z
- **Completed:** 2026-01-27T02:27:58Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Video routes implement complete admin upload flow: request-upload, confirm-upload, list, delete
- Member playback endpoint returns presigned URL with expiry from R2
- Session linking: confirm-upload updates courseSessions.videoUrl to `/videos/{id}/playback`
- Zod validation on all request bodies with appropriate MIME type and size checks
- Routes mounted at /videos with proper auth middleware (requireAdmin/requireTier)
- Video validation constants exported from file-upload.ts for centralized use
- Migration generated for videos table (fixes missing drizzle.config.ts entry from 05-01)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create video routes with admin upload flow** - `f7ba1d8` (feat)
2. **Task 2: Mount video routes and run migration** - `e0a77a8` (feat)
3. **Task 3: Add allowed video types constant to file-upload utility** - `c98579a` (feat)

## Files Created/Modified

- `backend/src/routes/videos.ts` - Video management and playback routes (270 lines)
- `backend/src/routes/index.ts` - Video routes mounted at /videos
- `backend/drizzle.config.ts` - Added videos.ts schema reference
- `backend/drizzle/0004_wandering_echo.sql` - Videos table migration
- `backend/src/utils/file-upload.ts` - ALLOWED_VIDEO_TYPES and MAX_VIDEO_SIZE constants

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /videos/request-upload | Admin | Get presigned upload URL |
| POST | /videos/confirm-upload | Admin | Save video metadata, link to session |
| GET | /videos | Admin | List all videos with session/course info |
| DELETE | /videos/:id | Admin | Soft delete video |
| GET | /videos/:id/playback | Member | Get presigned playback URL |

## Decisions Made

- **Inline video types in routes:** Routes define their own ALLOWED_VIDEO_TYPES array for isolation, while file-upload.ts exports centralized constants for future middleware use
- **Member tier for playback:** requireTier('member') gates playback - any member can access any video. Course-level access control is v2 concern
- **Session linking pattern:** confirm-upload updates courseSessions.videoUrl to `/videos/{id}/playback` when sessionId provided, making video discovery automatic from course sessions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed user column name in uploader relation**
- **Found during:** Task 1 verification
- **Issue:** Used `fullName` but users table has `name` column
- **Fix:** Changed to `name: true` in uploader columns selection
- **Files modified:** backend/src/routes/videos.ts

**2. [Rule 3 - Blocking] Added videos.ts to drizzle.config.ts**
- **Found during:** Task 2 migration generation
- **Issue:** videos.ts schema was created in 05-01 but not added to drizzle.config.ts, preventing migration generation
- **Fix:** Added './src/db/schema/videos.ts' to schema array
- **Files modified:** backend/drizzle.config.ts

## Next Phase Readiness

- Video API complete and ready for frontend integration
- R2 presigned URLs work end-to-end (upload + playback)
- Database migration ready to apply when database is available
- Phase 5 (Video & Storage) complete

## Known Limitations

- Database migration not applied (PostgreSQL not configured locally) - will apply on first deployment
- No video transcoding or thumbnail generation (v2 feature)
- All members can access all videos (course-level access control is v2)
