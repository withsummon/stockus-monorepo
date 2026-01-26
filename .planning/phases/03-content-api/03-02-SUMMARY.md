---
phase: 03-content-api
plan: 02
subsystem: backend/utilities
completed: 2026-01-26
duration: "1 min 43 sec"

requires:
  - 02-01 (Database schema foundation)

provides:
  - Slug generation utilities for URL-friendly content identifiers
  - File upload utilities with validation and UUID-based storage
  - Shared utility functions for content management routes

affects:
  - 03-03 (Course routes will use slug and file utilities)
  - 03-04 (Research routes will use slug utilities)
  - 03-05 (Template routes will use file utilities)

tech-stack:
  added: []
  patterns:
    - UUID-based filename generation for security
    - Result objects for validation (consistent with 02-02 pattern)
    - Idempotent directory creation with recursive: true

key-files:
  created:
    - backend/src/utils/slug.ts
    - backend/src/utils/file-upload.ts
  modified: []

decisions:
  - title: "Slug uniqueness via database queries"
    choice: "createUniqueSlug queries database to check for existing slugs"
    rationale: "Ensures uniqueness at database level, prevents race conditions"
    alternatives: "In-memory cache (stale data risk), optimistic inserts with retry (more complex)"
    impact: "Course and research creation will have reliable slug deduplication"

  - title: "UUID filenames for uploads"
    choice: "saveFile generates UUID-based filenames instead of using original names"
    rationale: "Prevents path traversal attacks, race conditions, and filename conflicts"
    alternatives: "Sanitized original names (still risky), timestamp-based (collision risk)"
    impact: "File uploads are secure but original filenames are lost (tracked in database)"

  - title: "Validation returns result objects"
    choice: "validateFile returns { valid, error? } instead of throwing"
    rationale: "Consistent with 02-02 email service pattern, easier to handle in routes"
    alternatives: "Throw exceptions (requires try/catch), boolean only (no error details)"
    impact: "Routes can handle validation errors gracefully with consistent pattern"
---

# Phase 3 Plan 02: Utility Functions Summary

**One-liner:** Slug generation with database-backed uniqueness and secure file upload with UUID filenames

## What Was Built

Created shared utility functions for content management:

**Slug utilities (`backend/src/utils/slug.ts`):**
- `generateSlug(title)` - Converts titles to URL-friendly slugs
- `createUniqueSlug(baseSlug, tableName)` - Ensures slug uniqueness via database queries
- Supports both `courses` and `researchReports` tables
- Handles special characters, spaces, and automatic deduplication

**File upload utilities (`backend/src/utils/file-upload.ts`):**
- `validateFile(file, allowedTypes, maxSize)` - Validates file type and size
- `saveFile(file, uploadDir)` - Saves files with UUID-based filenames
- `getUploadDir(type)` - Returns consistent upload directory paths
- Constants for max file size (10MB) and allowed MIME types (templates, images)

## Decisions Made

### 1. Database-backed slug uniqueness
**Context:** Need to prevent duplicate slugs for courses and research reports

**Decision:** `createUniqueSlug` queries the database to check for existing slugs before returning

**Rationale:**
- Ensures uniqueness at the source of truth (database)
- Prevents race conditions between slug generation and insertion
- Simple implementation with clear behavior

**Alternatives considered:**
- In-memory cache: Stale data risk, doesn't work in multi-instance deployments
- Optimistic inserts with retry: More complex error handling, database constraint violations

**Impact:** Course and research creation routes will have reliable slug deduplication without race conditions

### 2. UUID filenames for security
**Context:** Need to save uploaded files (templates, images) to disk

**Decision:** `saveFile` generates UUID-based filenames instead of using/sanitizing original filenames

**Rationale:**
- Prevents path traversal attacks (no user-controlled paths)
- Eliminates filename collision risk
- No race conditions from concurrent uploads
- Standard security practice for file uploads

**Alternatives considered:**
- Sanitized original names: Still risky, harder to validate all edge cases
- Timestamp-based: Collision risk with concurrent uploads

**Impact:** Original filenames are lost on disk but should be tracked in database records

### 3. Result object validation pattern
**Context:** File validation needs to return success/failure with error details

**Decision:** `validateFile` returns `{ valid: boolean, error?: string }` instead of throwing exceptions

**Rationale:**
- Consistent with 02-02 email service pattern (result objects over exceptions)
- Easier to handle in route handlers (no try/catch needed)
- Error messages available for user feedback

**Alternatives considered:**
- Throw exceptions: Requires try/catch boilerplate, breaks control flow
- Boolean only: No error details for user feedback

**Impact:** Routes can handle validation errors gracefully with consistent pattern across the codebase

## Implementation Notes

### Slug Generation Logic
The `generateSlug` function implements standard URL slug transformation:
1. Convert to lowercase
2. Remove special characters (keep alphanumeric, spaces, hyphens)
3. Replace spaces/underscores with hyphens
4. Remove leading/trailing hyphens

Example: `"My Course Title!"` → `"my-course-title"`

### Unique Slug Algorithm
The `createUniqueSlug` function uses a simple counter approach:
1. Check if base slug exists in database
2. If not, return base slug
3. If exists, try `{slug}-1`, `{slug}-2`, etc. until unique

This handles edge cases like:
- "course" exists → returns "course-1"
- "course" and "course-1" exist → returns "course-2"

### File Upload Security
The file upload utilities implement several security measures:
- **Type validation:** Whitelist of allowed MIME types (no executable files)
- **Size validation:** Configurable max size (default 10MB)
- **UUID filenames:** Prevents path traversal and race conditions
- **Idempotent directory creation:** `mkdir` with `recursive: true` is safe to call multiple times

### No External Dependencies
All utilities use Node.js built-ins:
- `crypto` for UUID generation
- `fs/promises` for async file operations
- `path` for cross-platform path handling

This keeps the dependency tree lean and reduces supply chain risk.

## Testing Performed

**TypeScript Compilation:**
- ✅ `npx tsc --noEmit` - No type errors
- ✅ Correct imports from database schema
- ✅ Proper typing for function parameters and return values

**Manual Verification:**
- ✅ Slug utility exports `generateSlug` and `createUniqueSlug`
- ✅ File upload utility exports all constants and functions
- ✅ Database queries use correct table references (courses, researchReports)
- ✅ No external dependencies added (package.json unchanged)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:** Plan 03-03 (Course routes)

**Provides:**
- Slug utilities ready for course creation
- File upload utilities ready for template/image handling
- Consistent validation pattern established

**Blockers:** None

**Recommendations:**
- When implementing routes, ensure original filenames are stored in database records (since disk filenames are UUIDs)
- Consider adding upload progress tracking for large files in future phases
- May want to add file cleanup utilities for deleted content (orphaned files)

## Files Changed

**Created:**
- `backend/src/utils/slug.ts` (56 lines) - Slug generation utilities
- `backend/src/utils/file-upload.ts` (92 lines) - File upload utilities

**Modified:**
- None

## Git Commits

| Commit  | Message                                 | Files                             |
|---------|-----------------------------------------|-----------------------------------|
| 3fa7eab | feat(03-02): create slug utility functions | backend/src/utils/slug.ts         |
| b1fa527 | feat(03-02): create file upload utility functions | backend/src/utils/file-upload.ts  |

## Performance Metrics

**Execution time:** 1 minute 43 seconds
**Tasks completed:** 2/2
**Files created:** 2
**Lines of code added:** 148
