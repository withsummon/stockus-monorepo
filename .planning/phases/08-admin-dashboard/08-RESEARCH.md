# Phase 8: Admin Dashboard - Research

**Researched:** 2026-01-29
**Domain:** Next.js 15 Admin Panel with shadcn/ui
**Confidence:** HIGH

## Summary

Admin dashboards in 2026 follow established patterns using Next.js App Router with route groups for layout isolation, shadcn/ui components for consistent UI, TanStack Table for data tables, React Hook Form with Zod for form validation, and Recharts for metrics visualization. The existing backend provides complete CRUD API routes for all content types (courses, research, templates, cohorts, videos) with `requireAdmin()` middleware already implemented.

The standard approach is to create a separate admin section using Next.js route groups (e.g., `(admin)`) with its own layout and navigation, implementing middleware-based protection to verify admin access. Admin dashboards typically feature a sidebar navigation, data tables for content management, forms for CRUD operations, and metrics/KPI cards for key statistics.

**Primary recommendation:** Build admin panel at `/admin` using route group `(admin)` with dedicated layout, leverage existing backend CRUD routes, use shadcn/ui data tables for content lists, and add aggregation queries to backend for dashboard metrics.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Framework with App Router | App Router enables route groups for separate admin layouts, server components for data fetching |
| shadcn/ui | Latest | Component library | Copy-paste components built on Radix UI, works seamlessly with Tailwind, no abstraction lock-in |
| TanStack Table | 8.x | Data table logic | Battle-tested table state management, sorting, filtering, pagination with full TypeScript support |
| React Hook Form | 7.x | Form state management | Performant form handling with minimal re-renders, standard for complex forms |
| Zod | 3.x | Schema validation | Type-safe validation that syncs with backend (backend already uses Zod), works with React Hook Form via zodResolver |
| Recharts | 2.x | Charts for metrics | Used by shadcn/ui charts, declarative API, good for dashboard KPIs and analytics |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | 3.x | Zod + React Hook Form bridge | Required to connect Zod schemas with React Hook Form |
| lucide-react | Latest | Icons | Already used in project for sidebar icons, consistent icon set |
| date-fns | 2.x | Date formatting | Format timestamps in tables and forms |
| jose | 5.x | JWT verification | Already in project for auth, can reuse for admin verification |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | react-admin | react-admin provides full framework but abstracts too much, harder to customize |
| TanStack Table | @tanstack/react-query + custom | More control but reinventing table state management |
| Route groups | Separate Next.js app | Complete isolation but deployment complexity, shared code duplication |

**Installation:**
```bash
# shadcn/ui components (install as needed)
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add data-table
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add chart

# Core dependencies
pnpm add @tanstack/react-table
pnpm add react-hook-form @hookform/resolvers
pnpm add zod
pnpm add recharts
pnpm add date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/app/
├── (admin)/                    # Route group - separate layout
│   ├── admin/                  # /admin path
│   │   ├── page.tsx           # Dashboard overview with metrics
│   │   ├── courses/
│   │   │   ├── page.tsx       # List courses (data table)
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Create course form
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Edit course form
│   │   ├── research/          # Similar structure for research reports
│   │   ├── templates/         # Similar structure for templates
│   │   ├── videos/            # Similar structure for videos
│   │   ├── cohorts/           # Similar structure for cohorts
│   │   ├── users/             # User management
│   │   └── orders/            # Order/payment history
│   └── layout.tsx             # Admin-specific layout with sidebar
├── (auth)/                     # Existing member area
│   └── layout.tsx
└── layout.tsx                  # Root layout

frontend/src/components/
├── admin/                      # Admin-specific components
│   ├── AdminSidebar.tsx       # Navigation for admin section
│   ├── DataTable.tsx          # Reusable table wrapper
│   ├── MetricCard.tsx         # KPI display card
│   ├── ContentForm.tsx        # Generic form for content CRUD
│   └── ...
├── member/                     # Existing member components
└── ui/                         # shadcn/ui components

frontend/src/lib/
├── auth/
│   └── admin.ts               # Admin auth helpers (new)
└── api/
    └── admin.ts               # Admin API client functions (new)
```

### Pattern 1: Route Groups for Layout Isolation
**What:** Use Next.js route groups with parentheses `(admin)` to create separate layout without affecting URL structure.

**When to use:** When admin panel needs completely different layout (sidebar, header) from public/member areas.

**Example:**
```typescript
// frontend/src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/dal'
import { checkIsAdmin } from '@/lib/auth/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Verify admin access
  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    redirect('/dashboard') // Redirect non-admins to member area
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### Pattern 2: Server-Side Admin Verification
**What:** Create server-side helper that queries admins table, cache result per request lifecycle.

**When to use:** In admin layout and server actions to verify admin status.

**Example:**
```typescript
// frontend/src/lib/auth/admin.ts
import 'server-only'
import { cache } from 'react'

// Cache for request lifecycle
export const checkIsAdmin = cache(async (userId: number): Promise<boolean> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) return false

  try {
    const res = await fetch(`${process.env.API_URL}/auth/admin-check`, {
      headers: { Cookie: `access_token=${token}` },
      cache: 'no-store',
    })

    return res.ok
  } catch {
    return false
  }
})

export const requireAdmin = cache(async () => {
  const user = await getUser()
  if (!user) redirect('/login')

  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) redirect('/dashboard')

  return user
})
```

### Pattern 3: Data Tables with TanStack Table
**What:** Use shadcn/ui Table component with TanStack Table for sortable, filterable, paginated lists.

**When to use:** For any content management view (courses list, users list, orders list).

**Example:**
```typescript
// frontend/src/app/(admin)/admin/courses/columns.tsx
'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

export type Course = {
  id: number
  title: string
  status: 'published' | 'draft' | 'archived'
  isFreePreview: boolean
  createdAt: string
}

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'isFreePreview',
    header: 'Access',
    cell: ({ row }) => (
      row.getValue('isFreePreview') ? 'Free Preview' : 'Members Only'
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          {/* Edit, Delete actions */}
        </DropdownMenu>
      )
    },
  },
]
```

### Pattern 4: React Hook Form + Zod for CRUD Forms
**What:** Use React Hook Form with Zod validation for create/edit forms, matching backend validation schemas.

**When to use:** All content creation and editing forms.

**Example:**
```typescript
// frontend/src/app/(admin)/admin/courses/new/page.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Match backend validation schema
const courseSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  content: z.string().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  isFreePreview: z.boolean().default(false),
})

type CourseFormData = z.infer<typeof courseSchema>

export default function NewCoursePage() {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      isFreePreview: false,
    },
  })

  async function onSubmit(data: CourseFormData) {
    // POST to /courses with requireAdmin middleware
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    // Handle success/error
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* Other fields */}
        <Button type="submit">Create Course</Button>
      </form>
    </Form>
  )
}
```

### Pattern 5: Metrics Dashboard with KPI Cards
**What:** Display key metrics using Card components with charts from shadcn/ui + Recharts.

**When to use:** Admin dashboard overview page showing member count, revenue, enrollments.

**Example:**
```typescript
// frontend/src/app/(admin)/admin/page.tsx
import { MetricCard } from '@/components/admin/MetricCard'
import { getAdminMetrics } from '@/lib/api/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Members"
          value={metrics.totalMembers}
          change={metrics.memberGrowth}
        />
        <MetricCard
          title="Revenue (YTD)"
          value={`IDR ${metrics.revenue.toLocaleString()}`}
          change={metrics.revenueGrowth}
        />
        <MetricCard
          title="Course Enrollments"
          value={metrics.enrollments}
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart width={800} height={300} data={metrics.revenueData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" fill="#8884d8" />
          </AreaChart>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Mixing admin and member routes without route groups:** Creates layout conflicts and harder to protect
- **Client-side only admin checks:** Always verify admin status server-side in layout or page
- **Duplicating Zod schemas:** Import and reuse schemas from backend if possible, or keep frontend schemas in sync
- **Not handling soft deletes in tables:** Filter out `deletedAt IS NOT NULL` records
- **Exposing admin routes without middleware:** Backend routes already protected, frontend layout must also verify

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting/filtering/pagination | Custom table state management | TanStack Table | Handles edge cases like multi-column sort, async data, column visibility, complex filtering |
| Form validation | Manual validation checks | React Hook Form + Zod | Handles field-level validation, touched state, async validation, error messages, type safety |
| Data table UI | Custom table markup | shadcn/ui data-table | Accessible table components, pre-built with TanStack Table integration |
| Chart rendering | Canvas drawing or SVG paths | Recharts (via shadcn/ui charts) | Handles responsive sizing, tooltips, legends, accessibility, animation |
| Admin route protection | Custom redirect logic | Next.js middleware + server-side checks | Request-level protection, works with App Router, cached verification |
| Date formatting | String manipulation | date-fns | Handles locales, timezones, relative time ("2 days ago"), consistent formatting |
| Rich text editing | Textarea with markdown parser | Tiptap or Lexical | WYSIWYG editing, mention support, slash commands, collaborative editing |

**Key insight:** Admin dashboards have well-established patterns. The combination of shadcn/ui + TanStack Table + React Hook Form + Recharts handles 90% of admin UI needs without custom implementations. Backend CRUD routes already exist, frontend just needs to consume them.

## Common Pitfalls

### Pitfall 1: Not Protecting Admin Routes on Frontend
**What goes wrong:** Backend routes are protected with `requireAdmin()` middleware, but frontend admin pages don't verify admin status in layout. Non-admin users can navigate to `/admin` and see UI (even if API calls fail).

**Why it happens:** Assuming backend protection is sufficient, forgetting that Next.js pages render before API calls.

**How to avoid:**
- Verify admin status in `(admin)/layout.tsx` using server-side check
- Create `checkIsAdmin()` helper that queries backend `/auth/admin-check` endpoint
- Redirect non-admins to member dashboard
- Cache verification result with React `cache()` for request lifecycle

**Warning signs:**
- Admin pages flash before redirect
- Non-admins can see admin navigation
- API errors (403) appear after page loads

### Pitfall 2: Frontend/Backend Schema Mismatch
**What goes wrong:** Frontend Zod schema for forms differs from backend validation schema. Forms accept invalid data that backend rejects, or forms reject valid data that backend accepts.

**Why it happens:** Schemas defined separately without coordination, backend schema updated without updating frontend.

**How to avoid:**
- Define Zod schemas once in backend, export as shared package (if monorepo)
- Or, manually sync schemas and add tests that verify parity
- Use same validation rules (min/max length, regex patterns)
- Add comments linking frontend schema to backend schema file
- Test form submission against actual backend to catch mismatches

**Warning signs:**
- Form submits but backend returns 400 validation error
- Form blocks submission but same data works in API testing tool
- Type mismatches between form data and backend response

### Pitfall 3: Exposed Admin Panel URLs
**What goes wrong:** Admin panel discoverable at common paths like `/admin`, `/dashboard`, `/console` without proper security headers or rate limiting. Attackers can brute-force admin logins.

**Why it happens:** Focus on middleware protection, overlooking that admin login page is publicly discoverable.

**How to avoid:**
- Use non-obvious admin path (e.g., `/internal`, `/manage`)
- Implement rate limiting on admin login attempts
- Add IP whitelist if admin access is from known locations
- Use strong MFA for admin accounts
- Monitor failed admin login attempts
- Consider separate admin subdomain with additional security

**Warning signs:**
- Admin login page appears in search results
- High volume of failed login attempts from various IPs
- Admin pages referenced in security scanner reports

### Pitfall 4: No Audit Logging for Admin Actions
**What goes wrong:** Admins create, edit, delete content with no record of who did what when. When data is accidentally deleted or modified, impossible to trace.

**Why it happens:** Focus on functionality, audit logging seen as secondary feature.

**How to avoid:**
- Add `adminActions` table with userId, action, resourceType, resourceId, timestamp
- Log all CRUD operations in backend admin routes
- Include before/after snapshots for updates
- Add audit log viewer in admin panel
- Set retention policy for audit logs

**Warning signs:**
- Can't answer "who deleted this course?"
- No way to revert accidental changes
- Compliance requirements unmet

### Pitfall 5: Blocking UI Operations Without Optimistic Updates
**What goes wrong:** Admin actions (delete item, publish course) show loading spinner and freeze UI until server responds. Feels sluggish compared to modern apps.

**Why it happens:** Straightforward implementation: submit → wait → refresh. Optimistic updates seem complex.

**How to avoid:**
- For safe operations (toggle status, delete), update UI immediately
- Show success state optimistically
- Revert on error with toast notification
- Use TanStack Query or similar for cache invalidation
- Keep snapshot of previous state for rollback
- **BUT:** Only for idempotent operations, not financial/payment operations

**Warning signs:**
- Admin users complain panel feels "slow"
- Every action causes full page refresh
- Multi-step operations tedious (delete 10 items = 10 waits)

### Pitfall 6: Ignoring Soft Deletes in Queries
**What goes wrong:** Backend uses soft deletes (`deletedAt` field), but admin panel queries don't filter them out. Deleted content appears in lists, causing confusion.

**Why it happens:** Copy-pasting queries without checking delete strategy.

**How to avoid:**
- All admin list queries filter `WHERE deletedAt IS NULL`
- Backend routes already do this (see courses.ts line 38)
- Add "Show Deleted" toggle if admins need to see archived content
- Clearly mark deleted items with Badge if showing them

**Warning signs:**
- Previously deleted items reappear in lists
- Duplicate items (original + deleted copy with same slug)
- Counts don't match expectations

### Pitfall 7: Large Data Tables Without Pagination
**What goes wrong:** Admin loads all courses/users/orders in single query, sending megabytes of data. Page load times increase as data grows.

**Why it happens:** Starting with small dataset, pagination seems unnecessary.

**How to avoid:**
- Implement server-side pagination from start (backend already has pagination support)
- Use TanStack Table with pagination controls
- Default to 10-25 rows per page
- Add search/filter to reduce result set
- Consider virtual scrolling for large lists (react-window)

**Warning signs:**
- Admin pages slow to load
- Network tab shows large payload sizes
- Browser memory usage spikes on admin pages

## Code Examples

Verified patterns from official sources:

### Admin Sidebar Navigation
```typescript
// frontend/src/components/admin/AdminSidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Video,
  Calendar,
  Users,
  CreditCard,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/types/auth'

interface AdminSidebarProps {
  user: User
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Research', href: '/admin/research', icon: FileText },
  { name: 'Templates', href: '/admin/templates', icon: FileSpreadsheet },
  { name: 'Videos', href: '/admin/videos', icon: Video },
  { name: 'Cohorts', href: '/admin/cohorts', icon: Calendar },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Orders', href: '/admin/orders', icon: CreditCard },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-screen sticky top-0">
      {/* Admin Badge */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-sm font-medium text-destructive">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            // Exact match for dashboard, startsWith for others
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      {/* Back to Member Area */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Member Area
        </Link>
      </div>
    </aside>
  )
}
```

### Reusable Data Table Component
```typescript
// frontend/src/components/admin/DataTable.tsx
// Source: https://ui.shadcn.com/docs/components/data-table
'use client'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {/* Search Input */}
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### Metric Card Component
```typescript
// frontend/src/components/admin/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number // Percentage change (positive or negative)
  description?: string
}

export function MetricCard({ title, value, change, description }: MetricCardProps) {
  const hasPositiveChange = change && change > 0
  const hasNegativeChange = change && change < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {hasPositiveChange && (
              <>
                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">+{change}%</span>
              </>
            )}
            {hasNegativeChange && (
              <>
                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                <span className="text-red-600">{change}%</span>
              </>
            )}
            <span className="ml-1">from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### Backend: Admin Metrics Endpoint
```typescript
// backend/src/routes/admin.ts
import { Hono } from 'hono'
import { db } from '../db/index.js'
import { users, payments, subscriptions } from '../db/schema/index.js'
import { authMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'
import { eq, count, sum, gte } from 'drizzle-orm'

const adminRoutes = new Hono<AuthEnv>()

/**
 * GET /admin/metrics
 * Dashboard metrics for admin overview
 */
adminRoutes.get('/metrics', authMiddleware, requireAdmin(), async (c) => {
  // Total members (tier = 'member')
  const [memberCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.tier, 'member'))

  // Total revenue (sum of successful payments)
  const [revenueData] = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, 'capture'))

  // Active subscriptions
  const [activeSubsCount] = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'))

  // Recent orders (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [recentOrdersCount] = await db
    .select({ count: count() })
    .from(payments)
    .where(gte(payments.createdAt, thirtyDaysAgo))

  return c.json({
    metrics: {
      totalMembers: memberCount.count,
      revenue: revenueData.total || 0,
      activeSubscriptions: activeSubsCount.count,
      recentOrders: recentOrdersCount.count,
    },
  })
})

export { adminRoutes }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router with separate admin app | App Router with route groups | Next.js 13+ (2023) | Single codebase, shared components, simpler deployment |
| Custom table components | TanStack Table v8 | 2022 | Headless UI pattern, no abstraction lock-in, full control |
| Manual form validation | React Hook Form + Zod | 2021+ | Type-safe validation, shared schemas with backend |
| Chart.js | Recharts via shadcn/ui | 2024+ | Declarative API, better React integration, composable |
| Custom admin frameworks (AdminLTE, etc.) | shadcn/ui copy-paste components | 2023+ | No dependencies, full customization, no theme lock-in |
| Client-side admin checks | Server-side verification in layout | Next.js 13+ App Router | Request-level security, no client bypass |

**Deprecated/outdated:**
- **Separate admin subdomain:** Route groups provide isolation without deployment complexity
- **JSON Web Tokens in localStorage:** HttpOnly cookies standard for auth (project already uses cookies)
- **Imperative table libraries:** Headless UI (TanStack) replaced rigid component libraries
- **Custom form libraries:** React Hook Form dominates, no need for alternatives
- **AdminJS/react-admin full frameworks:** Too opinionated, shadcn/ui approach more flexible

## Open Questions

Things that couldn't be fully resolved:

1. **Should admin panel have separate authentication flow?**
   - What we know: Backend has `admins` table referencing `users.id`, middleware checks this table
   - What's unclear: Whether to require separate admin login or reuse existing user session
   - Recommendation: Reuse user session, verify admin status in `admins` table. Simpler UX, single session management.

2. **How to handle rich text editing for content (courses, research)?**
   - What we know: Backend stores `content` field as text, likely HTML
   - What's unclear: Whether to use WYSIWYG editor (Tiptap, Lexical) or markdown editor
   - Recommendation: Start with textarea for MVP, evaluate Tiptap if rich editing becomes priority. Tiptap integrates well with shadcn/ui.

3. **Should metrics be real-time or cached?**
   - What we know: Dashboard will show member count, revenue, enrollments
   - What's unclear: Acceptable staleness for metrics (real-time query vs. cached aggregates)
   - Recommendation: Cache metrics with 5-minute TTL, refresh button for latest. Balance UX and DB load.

4. **How to handle image uploads for thumbnails?**
   - What we know: Backend has `/images` route, courses/research have `thumbnailUrl` field
   - What's unclear: Upload flow (direct to S3, backend proxy), image optimization
   - Recommendation: Use backend `/images` route as proxy, backend handles S3 upload. Add image optimization (next/image for display, sharp for processing).

5. **Should admin actions send notifications?**
   - What we know: Admin can create/edit/delete content
   - What's unclear: Whether to notify affected users (e.g., course published, content updated)
   - Recommendation: Phase 2 feature. Add email notifications after core admin CRUD complete.

## Sources

### Primary (HIGH confidence)
- shadcn/ui Data Table: https://ui.shadcn.com/docs/components/data-table - Official component documentation and patterns
- shadcn/ui Charts: https://ui.shadcn.com/charts - Chart components built on Recharts
- shadcn/ui Forms: https://ui.shadcn.com/docs/forms/react-hook-form - React Hook Form + Zod integration guide
- Next.js App Router Layouts: https://nextjs.org/docs/app/getting-started/layouts-and-pages - Official routing documentation
- TanStack Table v8: https://tanstack.com/table/latest - Official table library documentation
- React Hook Form: https://react-hook-form.com/docs/useform - Official form library documentation

### Secondary (MEDIUM confidence)
- [Next.js 15 Admin Dashboard Best Practices 2026](https://nextjstemplates.com/blog/admin-dashboard-templates) - Current templates and patterns
- [React Admin Dashboard Patterns with shadcn/ui 2026](https://dev.to/tailwindadmin/best-open-source-shadcn-dashboard-templates-29fb) - Community patterns
- [Admin Panel Architecture Monorepo 2026](https://feature-sliced.design/blog/frontend-monorepo-explained) - Monorepo organization
- [Next.js Route Groups Organizing App Router](https://medium.com/@shrutishende11/next-js-route-groups-organizing-your-app-router-like-a-pro-aa58ca11f973) - Route group patterns
- [Role-Based Access Control Next.js 15](https://clerk.com/blog/nextjs-role-based-access-control) - RBAC implementation
- [Admin Dashboard Security Pitfalls 2026](https://www.aikido.dev/blog/build-secure-admin-panel) - Security best practices
- [Data Tables TanStack shadcn 2026](https://medium.com/@enayetflweb/building-interactive-data-tables-with-shadcn-ui-and-tanstack-table-f2154c2f3b85) - Table implementation guide
- [CRUD Form Validation react-hook-form Zod 2026](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/) - Form patterns

### Tertiary (LOW confidence)
- WebSearch results for optimistic updates patterns - General frontend patterns, not admin-specific
- WebSearch results for admin dashboard design trends - UI/UX guidance, not technical implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn/ui, TanStack Table, React Hook Form, Recharts are industry standard for Next.js admin panels in 2026
- Architecture: HIGH - Route groups, server-side verification, data tables are documented Next.js 15 patterns
- Pitfalls: HIGH - Based on official security guides, common mistakes documented in multiple sources

**Research date:** 2026-01-29
**Valid until:** 30 days (2026-02-28) - Admin dashboard patterns stable, but Next.js updates frequently
