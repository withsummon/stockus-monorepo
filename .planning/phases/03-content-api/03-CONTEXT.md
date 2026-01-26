# Phase 3: Content API - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

CRUD endpoints for all content types: courses (with sessions), research reports, templates, and cohorts. Admin-only creation/editing, tier-based read access. File uploads for templates and images.

</domain>

<decisions>
## Implementation Decisions

### Content structure
- Courses contain sessions — Claude decides relationship pattern (nested vs flat)
- Research reports: title, rich text body, publication date, category, tags
- Templates: standalone files with title, description, file attachment (not grouped or tied to courses)
- Cohorts: independent from courses — have their own sessions with dates and Zoom links

### Access control
- Write access (create/edit/delete): Admin only
- Read access: Login required even to browse content listings
- Tier gating: Admin marks specific content as "free preview" vs "members-only"
- Admin role: Separate admin table (not a boolean flag on users)

### Publishing workflow
- No draft states — save = immediately live (simpler for v1)
- Soft delete — deleted content kept in DB, can be restored

### File handling
- Storage: Cloudflare R2 (consistent with video storage in Phase 5)
- Template file types: PDF (.pdf), Excel (.xlsx, .xls), Word (.docx, .doc)
- Images: auto-resize large images, generate thumbnails
- Max file size: 10 MB

### Claude's Discretion
- Course/session relationship pattern (nested response vs separate endpoints)
- Image resize dimensions and thumbnail sizes
- Exact category/tag implementation for research reports
- R2 bucket structure and file naming conventions

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard REST API patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-content-api*
*Context gathered: 2026-01-26*
