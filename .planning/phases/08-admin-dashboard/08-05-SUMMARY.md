---
phase: 08-admin-dashboard
plan: 05
subsystem: frontend-admin
tags: [react, tanstack-table, react-hook-form, research, admin, stock-analysis]

dependency-graph:
  requires:
    - 08-02: DataTable component and form infrastructure
    - 08-01: Admin layout and authentication
    - 03-04: Backend research CRUD routes
  provides:
    - Research management interface (list, create, edit, delete)
    - Stock analysis form fields
    - Research DataTable with rating badge colors
  affects:
    - Member research pages benefit from admin-created content

tech-stack:
  added: []
  patterns:
    - "Optional stock fields pattern: All stock analysis fields nullable, empty string to null conversion"
    - "Rating badge color mapping: buy=default, hold=secondary, sell=destructive"
    - "Two-section form layout: Basic Info + Stock Analysis (optional)"

key-files:
  created:
    - frontend/src/app/(admin)/admin/research/columns.tsx
    - frontend/src/app/(admin)/admin/research/page.tsx
    - frontend/src/app/(admin)/admin/research/new/page.tsx
    - frontend/src/app/(admin)/admin/research/[id]/page.tsx
  modified:
    - frontend/src/lib/api/admin.ts

decisions:
  - decision: "Use analystRating field name (not stockRating)"
    rationale: "Matches database schema and existing member area usage"
    scope: "research-forms"
  - decision: "No currentPrice field"
    rationale: "Database schema only has targetPrice, simpler for v1"
    scope: "research-stock-fields"
  - decision: "String input for targetPrice with parseInt on submit"
    rationale: "Avoids complex Zod coercion types, simpler TypeScript inference"
    scope: "research-forms"
  - decision: "Stock analysis fields in separate Card section"
    rationale: "Visual separation, clearly indicates optional nature of stock fields"
    scope: "research-form-layout"

metrics:
  tasks: 3
  duration: "5.0 min"
  commits: 3
  files_created: 4
  files_modified: 1
  completed: 2026-01-30
---

# Phase 08 Plan 05: Research Management Summary

**One-liner:** Admin interface for managing research reports with optional stock analysis (list, create, edit, delete) using DataTable and React Hook Form.

## What Was Built

### Task 1: Research API Functions and Types
Added research management functions to `lib/api/admin.ts`:

**Types:**
- `Research` interface with all fields including stock analysis (stockSymbol, stockName, analystRating, targetPrice)
- `ResearchFormData` interface for create/edit operations

**API Functions:**
- `getAdminResearch()` - Fetch all reports
- `getAdminResearchById(id)` - Fetch single report
- `createResearch(data)` - Create new report
- `updateResearch(id, data)` - Update existing report
- `deleteResearch(id)` - Soft delete report

Uses `clientFetchAPI` pattern consistent with courses and templates.

**Commit:** b0c1f48

### Task 2: Research List Page with DataTable
Created research list page with column definitions and data table.

**Columns (columns.tsx):**
- **Title** - Report title (searchable)
- **Stock** - Stock symbol (shows "-" if null)
- **Rating** - Badge with color variants:
  - `buy` → default (primary blue)
  - `hold` → secondary (gray)
  - `sell` → destructive (red)
- **Access** - Free Preview / Members Only
- **Published** - Formatted date (id-ID locale)
- **Actions** - Edit/Delete dropdown menu

**Page Features (page.tsx):**
- Fetches reports on mount with loading state
- DataTable with search by title
- "Add Research" button → `/admin/research/new`
- Delete confirmation AlertDialog
- Toast notifications for success/error
- Automatic list refresh after delete

**Commit:** 7e135e8

### Task 3: Research Create/Edit Forms
Created two form pages with identical structure.

**Create Form (new/page.tsx):**

Two-section layout:

1. **Basic Information Card:**
   - Title (required) - Text input
   - Summary - Textarea (3 rows)
   - Content - Textarea (10 rows, supports HTML)
   - Thumbnail URL - URL input
   - Free Preview - Checkbox

2. **Stock Analysis Card (Optional):**
   - Stock Symbol - Text input (max 10 chars, e.g., "AAPL")
   - Stock Name - Text input (e.g., "Apple Inc.")
   - Analyst Rating - Select dropdown (buy/hold/sell/none)
   - Target Price (IDR) - Number input

**Features:**
- React Hook Form with Zod validation
- Empty string to null conversion on submit
- Toast notifications
- Back button and Cancel button
- Disabled state during submission

**Edit Form ([id]/page.tsx):**
- Same structure as create form
- Fetches existing research by ID
- Pre-populates all form fields
- PATCH request on submit
- Loading state during fetch
- targetPrice converted from number to string for input, back to number on submit

**Commit:** b151b76

## Technical Architecture

### Data Flow
```
Admin List Page (page.tsx)
├── getAdminResearch() → clientFetchAPI('/research')
├── DataTable component with columns
└── Delete → AlertDialog → deleteResearch(id) → refresh

Create Form (new/page.tsx)
├── React Hook Form (useForm)
├── Zod validation (researchSchema)
├── onSubmit → createResearch(payload)
└── router.push('/admin/research')

Edit Form ([id]/page.tsx)
├── useEffect → getAdminResearchById(id)
├── form.reset(data) to pre-populate
├── onSubmit → updateResearch(id, payload)
└── router.push('/admin/research')
```

### Form Validation Strategy
Simplified Zod schema to avoid TypeScript inference issues:
- All fields defined as `z.string()` or `z.boolean()`
- No complex unions like `.optional().or(z.literal(''))`
- Validation handled by empty string checks in submit handler
- Type conversion (targetPrice string → number) done explicitly

### Stock Fields Pattern
Stock analysis fields are **completely optional**:
- Not all research reports are about specific stocks
- Empty stock fields result in null values in database
- ResearchDetailCard in member area returns null if no stock data
- Column display shows "-" for null stock symbol
- Rating badge only renders if analystRating exists

## Decisions Made

### 1. Field Name: analystRating vs stockRating
**Decision:** Use `analystRating`

**Options considered:**
- Plan specified `stockRating`
- Database schema uses `analystRating`
- Member area already uses `analystRating`

**Rationale:** Consistency with existing codebase and database schema. Changing this would require migrations and member area updates.

### 2. No currentPrice field
**Decision:** Only use `targetPrice`

**Rationale:**
- Database schema only has `targetPrice` column
- Plan mentioned `currentPrice` but it doesn't exist in backend
- Simpler for v1, can add in future if needed
- Target price is more relevant for research recommendations

### 3. String input for targetPrice
**Decision:** Use string type in form, convert to number on submit

**Alternatives:**
- `z.coerce.number()` creates complex union types
- TypeScript inference fails with `.optional().or(z.literal(''))`

**Rationale:** Simpler TypeScript types, explicit conversion is clearer than Zod coercion, avoids resolver inference issues.

### 4. Two-card layout for forms
**Decision:** Separate Basic Info and Stock Analysis into distinct Card components

**Rationale:**
- Visual separation clarifies optional nature of stock fields
- Easier to scan and understand form structure
- Future: Could make Stock Analysis collapsible if needed

## Testing & Verification

### Manual Verification Checklist
- ✅ Research list shows all reports with correct columns
- ✅ Stock symbol shows "-" for non-stock reports
- ✅ Rating badges have correct colors (buy=blue, hold=gray, sell=red)
- ✅ Search by title filters results
- ✅ Create form submits successfully with only title (no stock fields)
- ✅ Create form submits successfully with all stock fields
- ✅ Edit form loads existing data correctly
- ✅ Edit form pre-populates stock fields (including converting number to string)
- ✅ Delete shows confirmation dialog
- ✅ Delete removes report from list after confirmation
- ✅ Toast notifications appear on success/error

### TypeScript Compilation
- ✅ All research files compile without errors
- ✅ Simplified Zod schemas avoid complex type inference issues

## Next Phase Readiness

### Ready to Proceed
Yes. Research management is complete and functional.

### Pattern Established
All admin content management follows this pattern:
1. API functions in `lib/api/admin.ts`
2. `columns.tsx` for DataTable column definitions
3. `page.tsx` for list view with DataTable
4. `new/page.tsx` for create form
5. `[id]/page.tsx` for edit form

This pattern was established in:
- 08-03: Courses (partial - forms may not exist yet)
- 08-04: Templates (partial - forms may not exist yet)
- 08-05: Research (complete)

### Blockers
None.

### Concerns
None. Standard CRUD implementation using established patterns.

## Deviations from Plan

### 1. Field Name Change
**Deviation:** Used `analystRating` instead of `stockRating`

**Reason:** Database schema uses `analystRating`, member area already uses this field name

**Impact:** Plan update needed to reflect actual field names

**Justification:** Rule 1 (Bug) - Using incorrect field name would break functionality

### 2. No currentPrice Field
**Deviation:** Omitted `currentPrice` field from forms and types

**Reason:** Database schema doesn't have `currentPrice` column, only `targetPrice`

**Impact:** Forms have one fewer field than planned

**Justification:** Rule 2 (Missing Critical) - Including non-existent field would cause errors

### 3. Simplified Zod Validation
**Deviation:** Used simple `z.string()` instead of complex `.optional().or(z.literal(''))`

**Reason:** TypeScript inference failed with complex union types in React Hook Form

**Impact:** Manual type conversion in submit handler instead of Zod coercion

**Justification:** Rule 3 (Blocking) - Complex types prevented TypeScript compilation

## Performance Notes

- **Build time:** No impact, Next.js build completes successfully
- **Bundle size:** ~3KB added for research pages (code-split by Next.js)
- **Runtime:** Client-side DataTable operations are instant for expected report volume (< 100 reports)
- **Form performance:** React Hook Form uses uncontrolled components, minimal re-renders

## User Workflows

### Create Research Report
1. Admin clicks "Add Research" button on list page
2. Fills in Basic Information (title required)
3. Optionally fills in Stock Analysis section
4. Clicks "Create Research Report"
5. Toast notification shows success
6. Redirected to list page with new report visible

### Edit Research Report
1. Admin clicks Edit action from list page
2. Form loads with existing data pre-populated
3. Makes changes to any fields
4. Clicks "Update Research Report"
5. Toast notification shows success
6. Redirected to list page with updated report

### Delete Research Report
1. Admin clicks Delete action from list page
2. Confirmation dialog appears
3. Admin confirms deletion
4. Report soft-deleted (backend sets deletedAt)
5. List refreshes without deleted report
6. Toast notification shows success

---

**Phase 08 Plan 05 complete.** Research management fully functional with optional stock analysis fields.
