# Architecture Patterns: PayloadCMS Membership Site with Separate Frontend

**Project:** StockUs - Investment Education Membership Site
**Researched:** 2026-01-25
**Confidence:** MEDIUM

## Executive Summary

PayloadCMS 3.0 is now Next.js-native, designed to install directly into Next.js apps. However, it **can still be used as a separate headless backend** for React frontends through REST/GraphQL APIs. For StockUs, the recommended architecture uses **three separate deployables**: PayloadCMS Backend (with built-in Admin Panel), React Frontend, and a Database. Authentication flows via JWT tokens with HTTP-only cookies or Authorization headers.

**Key findings:**
- PayloadCMS 3.0 requires Next.js but can be deployed as a standalone backend service
- Built-in Admin Panel is production-ready; custom admin is unnecessary overhead
- REST API is recommended over GraphQL for simpler implementation (GraphQL has known performance issues as of 2025)
- Midtrans webhook integration follows standard patterns via PayloadCMS hooks
- CORS and CSRF configuration required for cross-domain authentication

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         React Frontend (Separate Deployment)            │   │
│  │  - Vite/CRA + React Router                              │   │
│  │  - Member portal, course viewer, content pages          │   │
│  │  - JWT token storage (localStorage + httpOnly cookies)  │   │
│  │  - Protected routes based on membership tier            │   │
│  │  Domain: app.stockus.id                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ HTTPS + CORS                       │
│                              │ Authorization: Bearer <JWT>        │
│                              │ credentials: 'include'             │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                        API LAYER                                 │
├──────────────────────────────┼───────────────────────────────────┤
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    PayloadCMS Backend (Next.js + Payload 3.0)            │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │         Admin Panel (/admin)                       │  │   │
│  │  │  - Built-in PayloadCMS UI                          │  │   │
│  │  │  - Content management, user management             │  │   │
│  │  │  - Access control configuration                    │  │   │
│  │  │  Domain: admin.stockus.id                          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │         REST API (/api)                            │  │   │
│  │  │  - /api/users (auth, profile)                      │  │   │
│  │  │  - /api/memberships (subscription status)          │  │   │
│  │  │  - /api/courses (course listing, enrollment)       │  │   │
│  │  │  - /api/cohorts (cohort details, sessions)         │  │   │
│  │  │  - /api/research (gated research content)          │  │   │
│  │  │  - /api/orders (payment orders)                    │  │   │
│  │  │  - Custom endpoints for business logic             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │         Webhook Handlers                           │  │   │
│  │  │  - POST /api/webhooks/midtrans                     │  │   │
│  │  │    (payment notifications)                         │  │   │
│  │  │  - Signature verification                          │  │   │
│  │  │  - Order status updates via hooks                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │         Collections & Business Logic               │  │   │
│  │  │  - Authentication (JWT generation)                 │  │   │
│  │  │  - Access Control (field & collection level)       │  │   │
│  │  │  - Hooks (afterChange, beforeValidate)             │  │   │
│  │  │  - Custom validation                               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  Deployment: Docker container / VPS / Vercel             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ Database queries                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                        DATA LAYER                                │
├──────────────────────────────┼───────────────────────────────────┤
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                              │   │
│  │  - users, memberships, courses, cohorts                  │   │
│  │  - orders, research_posts, templates                     │   │
│  │  - *_rels tables (for relationships)                     │   │
│  │  - payload_preferences, payload_migrations               │   │
│  │                                                           │   │
│  │  Deployment: Managed PostgreSQL (RDS/Supabase/Railway)   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐      ┌──────────────────────────┐  │
│  │   Midtrans Payment      │      │   Email Service          │  │
│  │   - Payment processing  │      │   - Transactional emails │  │
│  │   - Webhook callbacks   │      │   - Course notifications │  │
│  └─────────────────────────┘      └──────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Exposed Interfaces | Communicates With |
|-----------|---------------|-------------------|-------------------|
| **React Frontend** | - Render UI<br>- Handle user interactions<br>- Manage client-side routing<br>- Store JWT tokens<br>- Conditional rendering based on auth/membership | - HTTPS endpoints<br>- Static assets | - PayloadCMS REST API<br>- Browser localStorage |
| **PayloadCMS Backend** | - Data persistence<br>- Business logic<br>- Authentication & authorization<br>- API provisioning<br>- Webhook handling<br>- Admin UI | - REST API endpoints<br>- Admin panel UI<br>- Webhook endpoints | - PostgreSQL database<br>- Midtrans API<br>- Email service |
| **Admin Panel** | - Content management<br>- User management<br>- Configuration<br>- Analytics dashboard | - Web UI (/admin route) | - PayloadCMS backend (same process)<br>- Database |
| **PostgreSQL** | - Persistent storage<br>- Relational data integrity<br>- Query optimization | - Database connection (TCP) | - PayloadCMS backend only |
| **Midtrans** | - Payment processing<br>- Transaction management<br>- Payment notifications | - REST API<br>- Webhook callbacks | - PayloadCMS webhook endpoint |

## Answer to Research Questions

### 1. How to structure PayloadCMS as pure headless API (no frontend)?

**Answer:** While PayloadCMS 3.0 is Next.js-native, it can still function as a separate headless backend.

**Implementation:**
- Deploy PayloadCMS as a standalone Next.js application
- The Admin Panel is accessible at `/admin` route (built-in)
- REST API automatically available at `/api/{collection-name}`
- Configure CORS to allow requests from React frontend domain
- Configure CSRF whitelist for cookie-based authentication

**Configuration (payload.config.ts):**
```typescript
export default buildConfig({
  serverURL: 'https://api.stockus.id',
  cors: [
    'https://app.stockus.id',
    'http://localhost:5173', // dev
  ],
  csrf: [
    'https://app.stockus.id',
    'http://localhost:5173',
  ],
  admin: {
    // Built-in admin panel configuration
    user: 'users', // which collection for admin auth
  },
  // Collections defined here
})
```

**Key considerations:**
- PayloadCMS 3.0 requires a database connection **during build time**, which affects containerization strategies
- If deploying with Docker/Kubernetes, ensure database is accessible during build
- For serverless (Vercel), cold starts may occur on lightly-used sites

**Sources:**
- [PayloadCMS Headless Documentation](https://payloadcms.com/use-cases/headless-cms)
- [Payload 3.0 Next.js Integration](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [Using Payload Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs)

### 2. PayloadCMS collections design for: Users, Memberships, Courses, Cohorts, Sessions, Research, Templates, Orders

**Recommended Collection Schema:**

#### **Users** (built-in auth collection)
```typescript
{
  slug: 'users',
  auth: true, // Enables authentication
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'member', 'free'] },
    {
      name: 'membership',
      type: 'relationship',
      relationTo: 'memberships',
      hasMany: false, // One active membership
    },
    { name: 'enrolledCourses', type: 'relationship', relationTo: 'courses', hasMany: true },
  ],
  access: {
    // Field-level and collection-level access control
    read: () => true, // Public read for basic info
    update: ({ req: { user } }) => user?.role === 'admin' || user?.id,
  },
}
```

#### **Memberships**
```typescript
{
  slug: 'memberships',
  fields: [
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: ['free', 'basic', 'premium', 'enterprise'],
    },
    { name: 'price', type: 'number', required: true },
    { name: 'duration', type: 'number', required: true }, // days
    { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
    {
      name: 'allowedCourses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
    },
    {
      name: 'allowedResearch',
      type: 'select',
      options: ['none', 'basic', 'all'],
    },
    { name: 'status', type: 'select', options: ['active', 'expired', 'cancelled'] },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
  ],
}
```

#### **Courses**
```typescript
{
  slug: 'courses',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'richText' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'instructor', type: 'text' },
    {
      name: 'requiredMembershipTier',
      type: 'select',
      options: ['free', 'basic', 'premium', 'enterprise'],
    },
    {
      name: 'cohorts',
      type: 'relationship',
      relationTo: 'cohorts',
      hasMany: true,
    },
    { name: 'isPublished', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number' }, // for sorting
  ],
  access: {
    read: ({ req: { user } }) => {
      // Public can see published courses, but not content
      // Members can see based on their tier
      return true; // Implement custom logic
    },
  },
}
```

#### **Cohorts**
```typescript
{
  slug: 'cohorts',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    { name: 'maxParticipants', type: 'number' },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'sessions',
      type: 'relationship',
      relationTo: 'sessions',
      hasMany: true,
    },
    { name: 'status', type: 'select', options: ['upcoming', 'active', 'completed'] },
  ],
}
```

#### **Sessions**
```typescript
{
  slug: 'sessions',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'cohort',
      type: 'relationship',
      relationTo: 'cohorts',
      required: true,
    },
    { name: 'sessionNumber', type: 'number', required: true },
    { name: 'description', type: 'richText' },
    { name: 'scheduledDate', type: 'date', required: true },
    { name: 'duration', type: 'number' }, // minutes
    { name: 'meetingLink', type: 'text' },
    { name: 'recordingUrl', type: 'text' },
    {
      name: 'materials',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    { name: 'isCompleted', type: 'checkbox', defaultValue: false },
  ],
  access: {
    read: ({ req: { user } }) => {
      // Only cohort participants can access
      // Implement via access control function
    },
  },
}
```

#### **Research** (for investment research posts)
```typescript
{
  slug: 'research',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText', required: true },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    {
      name: 'accessLevel',
      type: 'select',
      required: true,
      options: ['free', 'basic', 'premium', 'enterprise'],
    },
    { name: 'publishedDate', type: 'date' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'isPremium', type: 'checkbox', defaultValue: false },
  ],
  access: {
    read: ({ req: { user } }) => {
      // Custom logic: check user's membership tier vs accessLevel
    },
  },
}
```

#### **Templates** (for email or document templates)
```typescript
{
  slug: 'templates',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['email', 'document', 'report'] },
    { name: 'content', type: 'richText' },
    { name: 'variables', type: 'array', fields: [{ name: 'variable', type: 'text' }] },
    {
      name: 'accessLevel',
      type: 'select',
      options: ['free', 'basic', 'premium', 'enterprise'],
    },
  ],
}
```

#### **Orders**
```typescript
{
  slug: 'orders',
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'membership',
      type: 'relationship',
      relationTo: 'memberships',
      required: true,
    },
    { name: 'amount', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'IDR' },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: ['pending', 'paid', 'failed', 'expired', 'cancelled'],
      defaultValue: 'pending',
    },
    { name: 'midtransOrderId', type: 'text' },
    { name: 'midtransTransactionId', type: 'text' },
    { name: 'paymentMethod', type: 'text' },
    { name: 'paidAt', type: 'date' },
    { name: 'expiresAt', type: 'date' },
    { name: 'metadata', type: 'json' }, // Store webhook data
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation }) => {
        // When order status changes to 'paid', activate membership
        if (doc.status === 'paid' && previousDoc?.status !== 'paid') {
          // Update user's membership
          // Send confirmation email
        }
      },
    ],
  },
}
```

**Relationship Patterns:**
- **One-to-One:** User → Membership (hasMany: false)
- **One-to-Many:** Course → Cohorts, Cohort → Sessions
- **Many-to-Many:** Users ↔ Courses (enrolledCourses), Cohort ↔ Users (participants)
- **Polymorphic:** Not needed for StockUs, but PayloadCMS supports via `relationTo: ['collection1', 'collection2']`

**Database Tables Created:**
- PayloadCMS automatically creates junction tables (e.g., `cohorts_rels`) for many-to-many relationships when using PostgreSQL

**Sources:**
- [PayloadCMS Collection Configs](https://payloadcms.com/docs/configuration/collections)
- [PayloadCMS Relationship Fields](https://payloadcms.com/docs/fields/relationship)
- [Understanding Relationships in Payload CMS](https://www.wisp.blog/blog/understanding-relationships-in-payload-cms)

### 3. How does authentication flow between PayloadCMS backend and separate React frontend?

**Authentication Flow:**

```
┌─────────────┐                                    ┌──────────────────┐
│   React     │                                    │   PayloadCMS     │
│  Frontend   │                                    │     Backend      │
└──────┬──────┘                                    └────────┬─────────┘
       │                                                    │
       │  1. POST /api/users/login                         │
       │     { email, password }                           │
       │───────────────────────────────────────────────────>│
       │                                                    │
       │                                          2. Validate credentials
       │                                             Generate JWT
       │                                             Set HTTP-only cookie
       │                                                    │
       │  3. Response: { token, user, exp }                │
       │     Set-Cookie: payload-token=<jwt>; HttpOnly     │
       │<───────────────────────────────────────────────────│
       │                                                    │
4. Store token in localStorage                             │
   AND rely on HTTP-only cookie                            │
       │                                                    │
       │  5. Subsequent requests:                          │
       │     Authorization: Bearer <token>                 │
       │     credentials: 'include' (sends cookie)         │
       │───────────────────────────────────────────────────>│
       │                                                    │
       │                                          6. Verify JWT
       │                                             Check access control
       │                                                    │
       │  7. Response: { data }                            │
       │<───────────────────────────────────────────────────│
       │                                                    │
       │  8. Token Refresh (before expiry)                 │
       │     POST /api/users/refresh-token                 │
       │     credentials: 'include'                        │
       │───────────────────────────────────────────────────>│
       │                                                    │
       │                                          9. Renew JWT
       │                                             Update HTTP-only cookie
       │                                                    │
       │  10. Response: { token, user, exp }               │
       │      Set-Cookie: payload-token=<new-jwt>          │
       │<───────────────────────────────────────────────────│
       │                                                    │
```

**Two Authentication Methods Supported:**

#### Method A: HTTP-Only Cookies (Recommended for Security)
```javascript
// Frontend: Login
const login = async (email, password) => {
  const response = await fetch('https://api.stockus.id/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // CRITICAL: sends/receives cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  // Cookie is automatically stored by browser
  return data; // { user, token, exp }
};

// Frontend: Subsequent authenticated requests
const fetchCourses = async () => {
  const response = await fetch('https://api.stockus.id/api/courses', {
    credentials: 'include', // Sends HTTP-only cookie
  });
  return response.json();
};
```

#### Method B: Authorization Header
```javascript
// Frontend: Login
const login = async (email, password) => {
  const response = await fetch('https://api.stockus.id/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  localStorage.setItem('token', data.token); // Store manually
  return data;
};

// Frontend: Subsequent authenticated requests
const fetchCourses = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.stockus.id/api/courses', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

**Hybrid Approach (Recommended for StockUs):**
- Use HTTP-only cookies for primary authentication (more secure against XSS)
- Also store token in localStorage for easier access control checks on frontend
- Always send `credentials: 'include'` with requests

**Token Refresh Strategy:**
```javascript
// Check token expiry before requests
const isTokenExpired = (exp) => {
  return Date.now() >= exp * 1000;
};

const refreshToken = async () => {
  const response = await fetch('https://api.stockus.id/api/users/refresh-token', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// Axios interceptor example
axios.interceptors.request.use(async (config) => {
  const exp = localStorage.getItem('tokenExp');
  if (isTokenExpired(exp)) {
    await refreshToken();
  }
  return config;
});
```

**CORS Configuration (Backend):**
```typescript
// payload.config.ts
export default buildConfig({
  serverURL: 'https://api.stockus.id',
  cors: [
    'https://app.stockus.id',
    'http://localhost:5173',
  ],
  csrf: [
    'https://app.stockus.id',
    'http://localhost:5173',
  ],
});
```

**Important Security Notes:**
- NEVER store sensitive tokens in localStorage in high-security apps (vulnerable to XSS)
- HTTP-only cookies cannot be accessed by JavaScript (more secure)
- For StockUs, hybrid approach balances security and developer experience
- Always use HTTPS in production
- Verify webhook signatures from Midtrans to prevent fraud

**Sources:**
- [PayloadCMS Authentication Overview](https://payloadcms.com/docs/authentication/overview)
- [PayloadCMS JWT Strategy](https://payloadcms.com/docs/authentication/jwt)
- [Authentication with Payload CMS and Next.js](https://dev.to/aaronksaunders/authentication-with-payload-cms-and-nextjs-client-vs-server-approaches-c5a)

### 4. Where does the Admin Panel fit? (Use PayloadCMS built-in admin vs custom?)

**Recommendation: Use PayloadCMS Built-in Admin Panel**

**Rationale:**
1. **Production-ready:** The built-in admin is feature-complete and battle-tested
2. **Zero additional development:** Comes free with PayloadCMS installation
3. **Automatic updates:** Collection changes auto-reflect in admin UI
4. **Customizable:** Supports custom components, views, and branding
5. **Same deployment:** Runs on the same Next.js server as the API (route: `/admin`)

**Architecture Placement:**

```
PayloadCMS Backend Deployment
├── /api/*                    → REST API endpoints
├── /admin                    → Built-in Admin Panel (separate domain/subdomain)
└── /api/webhooks/*           → Webhook handlers
```

**Deployment Strategy:**

**Option A: Separate Subdomain (Recommended)**
- Admin Panel: `https://admin.stockus.id` → PayloadCMS `/admin` route
- API: `https://api.stockus.id` → PayloadCMS `/api` routes
- Frontend: `https://app.stockus.id` → React app

This is achieved via reverse proxy or DNS routing, but all served from the same PayloadCMS deployment.

**Option B: Same Domain, Different Paths**
- Admin: `https://api.stockus.id/admin`
- API: `https://api.stockus.id/api`
- Frontend: `https://app.stockus.id`

**Configuration:**

```typescript
// payload.config.ts
export default buildConfig({
  admin: {
    user: 'users', // Which collection for admin authentication
    meta: {
      titleSuffix: '- StockUs Admin',
      favicon: '/assets/favicon.ico',
      ogImage: '/assets/og-image.jpg',
    },
    components: {
      // Optional: Add custom components
      // Nav: CustomNav,
    },
    // Customize admin UI
    disable: false, // Set to true to disable admin panel entirely
  },
  collections: [
    // Your collections
  ],
});
```

**Access Control for Admin:**

Only users with `role: 'admin'` should access the Admin Panel. Implement in the Users collection:

```typescript
{
  slug: 'users',
  auth: true,
  access: {
    admin: ({ req: { user } }) => {
      return user?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: ['admin', 'member', 'free'],
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
```

**When to Build a Custom Admin:**
- Never for StockUs (unnecessary overhead)
- Only consider if you need:
  - Completely different UI framework (non-React)
  - Highly specialized workflows the built-in UI can't support
  - Mobile app for admin tasks

**Sources:**
- [PayloadCMS Admin Panel Documentation](https://payloadcms.com/docs/admin/overview)
- [Custom Admin Panels with Payload CMS](https://focusreactive.com/payload-cms-admin-panel/)

### 5. API design - REST vs GraphQL from PayloadCMS?

**Recommendation: Use REST API**

**Comparison Matrix:**

| Criterion | REST | GraphQL | Winner |
|-----------|------|---------|--------|
| **Performance** | Fast, no overhead | Known performance issues (as of 2025) - fetches unrequired data | REST |
| **Simplicity** | Standard HTTP endpoints | Requires GraphQL client library | REST |
| **Type Safety** | Via TypeScript types | Built-in schema validation | Tie |
| **Overfetching** | May fetch extra fields | Can request specific fields (in theory) | GraphQL* |
| **Payload Support** | First-class, well-tested | Secondary, known bugs with polymorphic relations | REST |
| **Learning Curve** | Lower (standard fetch/axios) | Higher (GraphQL concepts) | REST |
| **Caching** | Standard HTTP caching | More complex | REST |
| **Real-world Payload Usage** | PayloadCMS.com uses REST | - | REST |

*Note: GraphQL advantage for overfetching is negated by Payload's known issue where it "internally does the full data call with all unrequired data and then only 're-formats' the data" (Issue #10948, 2025).

**REST API Structure for StockUs:**

```
Base URL: https://api.stockus.id/api

Authentication:
POST   /api/users/login              # Login
POST   /api/users/logout             # Logout
POST   /api/users/refresh-token      # Refresh JWT
GET    /api/users/me                 # Get current user

Users:
GET    /api/users/:id                # Get user profile
PATCH  /api/users/:id                # Update profile

Memberships:
GET    /api/memberships              # List membership tiers
GET    /api/memberships/:id          # Get membership details
POST   /api/memberships              # Create membership (admin)

Courses:
GET    /api/courses                  # List all courses
GET    /api/courses/:id              # Get course details
GET    /api/courses/slug/:slug       # Get course by slug

Cohorts:
GET    /api/cohorts                  # List cohorts
GET    /api/cohorts/:id              # Get cohort details
POST   /api/cohorts/:id/enroll       # Enroll user (custom endpoint)

Sessions:
GET    /api/sessions                 # List sessions
GET    /api/sessions/:id             # Get session details
GET    /api/cohorts/:id/sessions     # Sessions for a cohort (via query)

Research:
GET    /api/research                 # List research posts (filtered by access)
GET    /api/research/:id             # Get research post (access controlled)

Templates:
GET    /api/templates                # List templates (access controlled)
GET    /api/templates/:id            # Get template

Orders:
GET    /api/orders                   # List user's orders
GET    /api/orders/:id               # Get order details
POST   /api/orders                   # Create order
```

**Query Parameters (Built-in):**
```
GET /api/courses?where[requiredMembershipTier][equals]=premium
GET /api/courses?depth=2                    # Include nested relationships
GET /api/research?sort=-publishedDate       # Sort by date descending
GET /api/courses?limit=10&page=2            # Pagination
```

**Custom Endpoints for Business Logic:**

PayloadCMS allows custom endpoints for complex operations:

```typescript
// payload.config.ts
export default buildConfig({
  endpoints: [
    {
      path: '/enroll-cohort',
      method: 'post',
      handler: async (req, res) => {
        const { cohortId } = req.body;
        const user = req.user;

        // Check user's membership tier
        // Check cohort capacity
        // Add user to cohort participants
        // Send confirmation email

        res.status(200).json({ success: true });
      },
    },
  ],
});
```

**When to Use GraphQL:**
- You have complex, deeply nested data requirements
- You need precise control over field selection
- After Payload fixes the performance issues (monitor GitHub issues)

**Sources:**
- [PayloadCMS GraphQL Overview](https://payloadcms.com/docs/graphql/overview)
- [Payload vs Directus vs Strapi - GraphQL Performance](https://payloadcms.com/posts/blog/performance-benchmarks)
- [GraphQL Performance Issue #10948](https://github.com/payloadcms/payload/issues/10948)

### 6. Webhook patterns for payment confirmations (Midtrans → PayloadCMS)

**Webhook Flow:**

```
┌─────────────┐                  ┌──────────────┐                  ┌──────────────────┐
│   User      │                  │   Midtrans   │                  │   PayloadCMS     │
│  (React)    │                  │   Gateway    │                  │     Backend      │
└──────┬──────┘                  └──────┬───────┘                  └────────┬─────────┘
       │                                │                                   │
       │  1. Create Order               │                                   │
       │────────────────────────────────────────────────────────────────────>│
       │                                │                          2. Generate order
       │                                │                             orderId, amount
       │  3. Return orderId             │                                   │
       │<────────────────────────────────────────────────────────────────────│
       │                                │                                   │
       │  4. Redirect to Midtrans       │                                   │
       │  payment page with orderId     │                                   │
       │───────────────────────────────>│                                   │
       │                                │                                   │
       │  5. User completes payment     │                                   │
       │───────────────────────────────>│                                   │
       │                                │                                   │
       │                                │  6. HTTP POST Notification        │
       │                                │   /api/webhooks/midtrans          │
       │                                │   { order_id, transaction_status, │
       │                                │     signature_key, ... }          │
       │                                │──────────────────────────────────>│
       │                                │                                   │
       │                                │                          7. Verify signature
       │                                │                             Update order status
       │                                │                             Trigger afterChange hook
       │                                │                                   │
       │                                │  8. Response 200 OK               │
       │                                │<──────────────────────────────────│
       │                                │                                   │
       │                                │                          9. Activate membership
       │                                │                             Send confirmation email
       │                                │                                   │
       │  10. Redirect back to app      │                                   │
       │<───────────────────────────────│                                   │
       │                                │                                   │
       │  11. GET /api/orders/:id       │                                   │
       │  (check updated status)        │                                   │
       │────────────────────────────────────────────────────────────────────>│
       │                                │                                   │
       │  12. Return { status: 'paid' } │                                   │
       │<────────────────────────────────────────────────────────────────────│
       │                                │                                   │
```

**Implementation:**

#### Step 1: Create Webhook Endpoint

```typescript
// payload.config.ts
import crypto from 'crypto';

export default buildConfig({
  endpoints: [
    {
      path: '/webhooks/midtrans',
      method: 'post',
      handler: async (req, res) => {
        try {
          const notification = req.body;

          // 1. Verify signature
          const serverKey = process.env.MIDTRANS_SERVER_KEY;
          const signatureString = `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`;
          const expectedSignature = crypto.createHash('sha512').update(signatureString).digest('hex');

          if (notification.signature_key !== expectedSignature) {
            return res.status(403).json({ error: 'Invalid signature' });
          }

          // 2. Map Midtrans status to order status
          let orderStatus = 'pending';
          if (['capture', 'settlement'].includes(notification.transaction_status)) {
            orderStatus = 'paid';
          } else if (['cancel', 'deny', 'expire'].includes(notification.transaction_status)) {
            orderStatus = notification.transaction_status === 'cancel' ? 'cancelled' : 'failed';
          }

          // 3. Update order in database
          const { payload } = req;
          const orders = await payload.find({
            collection: 'orders',
            where: {
              orderNumber: { equals: notification.order_id },
            },
          });

          if (orders.docs.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
          }

          const order = orders.docs[0];

          // 4. Update order (triggers afterChange hook)
          await payload.update({
            collection: 'orders',
            id: order.id,
            data: {
              status: orderStatus,
              midtransTransactionId: notification.transaction_id,
              paymentMethod: notification.payment_type,
              paidAt: orderStatus === 'paid' ? new Date() : order.paidAt,
              metadata: notification, // Store full webhook data
            },
          });

          res.status(200).json({ message: 'Webhook processed' });
        } catch (error) {
          console.error('Webhook error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },
    },
  ],
});
```

#### Step 2: afterChange Hook on Orders Collection

```typescript
// collections/Orders.ts
export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [
    // ... fields from earlier
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Only proceed if status changed to 'paid'
        if (doc.status === 'paid' && previousDoc?.status !== 'paid') {
          const { payload } = req;

          // 1. Activate user's membership
          const membership = await payload.findByID({
            collection: 'memberships',
            id: doc.membership,
          });

          await payload.update({
            collection: 'memberships',
            id: doc.membership,
            data: {
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + membership.duration * 24 * 60 * 60 * 1000),
            },
          });

          // 2. Update user's membership reference
          await payload.update({
            collection: 'users',
            id: doc.user,
            data: {
              membership: doc.membership,
            },
          });

          // 3. Send confirmation email
          // await sendEmail({
          //   to: user.email,
          //   subject: 'Payment Confirmed - StockUs',
          //   template: 'payment-confirmation',
          //   data: { order: doc, membership },
          // });

          // 4. Log the event
          console.log(`Order ${doc.orderNumber} paid. Membership activated.`);
        }

        // Handle failed/cancelled payments
        if (['failed', 'cancelled', 'expired'].includes(doc.status) && previousDoc?.status === 'pending') {
          // Send notification email
          // Log the event
        }
      },
    ],
  },
};
```

#### Step 3: Midtrans Configuration

```typescript
// lib/midtrans.ts
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createTransaction = async (order) => {
  const parameter = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: order.amount,
    },
    customer_details: {
      email: order.userEmail,
      first_name: order.userName,
    },
    callbacks: {
      finish: `https://app.stockus.id/payment/success?order_id=${order.orderNumber}`,
      error: `https://app.stockus.id/payment/error`,
      pending: `https://app.stockus.id/payment/pending`,
    },
  };

  const transaction = await snap.createTransaction(parameter);
  return transaction;
};
```

#### Step 4: Configure Webhook URL in Midtrans Dashboard

- Login to Midtrans Merchant Portal
- Go to Settings → Configuration
- Set **Payment Notification URL**: `https://api.stockus.id/api/webhooks/midtrans`

**Security Best Practices:**
1. **Always verify signature** - Never trust webhook data without verification
2. **Use HTTPS** - Webhooks must be over HTTPS in production
3. **Idempotency** - Handle duplicate webhook calls gracefully (Midtrans may retry)
4. **Logging** - Log all webhook calls for debugging
5. **Error handling** - Return 200 OK even if processing fails (to prevent retries)

**Development Testing:**
- Use [Ngrok](https://ngrok.com/) or [Expose](https://expose.dev/) to create a public URL for localhost
- Register the ngrok URL in Midtrans Sandbox: `https://abc123.ngrok.io/api/webhooks/midtrans`

**Sources:**
- [Midtrans Node.js Client GitHub](https://github.com/Midtrans/midtrans-nodejs-client)
- [Midtrans Backend Integration](https://docs.midtrans.com/reference/backend-integration)
- [PayloadCMS Collection Hooks](https://payloadcms.com/docs/hooks/collections)
- [RN Payments Powerhouse: Integrating Midtrans with Webhook Security](https://medium.com/@rafizimraanarjunawijaya/rn-payments-powerhouse-integrating-midtrans-xendit-or-stripe-with-webhook-security-the-321f5b266906)

### 7. Component/data flow for member-only content

**Content Gating Architecture:**

```
┌────────────────────────────────────────────────────────────────┐
│                    React Frontend Component                     │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  App.tsx - Route Protection                              │  │
│  │                                                           │  │
│  │  <Route path="/courses/:id" element={                    │  │
│  │    <ProtectedRoute requiredTier="premium">               │  │
│  │      <CoursePage />                                       │  │
│  │    </ProtectedRoute>                                      │  │
│  │  } />                                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ProtectedRoute.tsx - Client-Side Check                  │  │
│  │                                                           │  │
│  │  const user = useAuth(); // from context                 │  │
│  │  const hasAccess = checkAccess(                          │  │
│  │    user.membership.tier,                                 │  │
│  │    requiredTier                                           │  │
│  │  );                                                       │  │
│  │                                                           │  │
│  │  if (!user) return <Navigate to="/login" />;             │  │
│  │  if (!hasAccess) return <UpgradePrompt />;               │  │
│  │  return children;                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CoursePage.tsx - Server-Side Verification               │  │
│  │                                                           │  │
│  │  useEffect(() => {                                        │  │
│  │    fetchCourse(courseId); // API call                    │  │
│  │  }, [courseId]);                                          │  │
│  │                                                           │  │
│  │  // If user doesn't have access, API returns 403         │  │
│  │  // Handle error and show upgrade prompt                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
                             │
                             │ GET /api/courses/:id
                             │ Authorization: Bearer <token>
                             │ credentials: 'include'
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   PayloadCMS Backend                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Collections Access Control                              │  │
│  │                                                           │  │
│  │  courses: {                                               │  │
│  │    access: {                                              │  │
│  │      read: ({ req: { user } }) => {                       │  │
│  │        // 1. Public: Can list courses                    │  │
│  │        // 2. Members: Can read based on tier             │  │
│  │        return checkMembershipAccess(user, doc);           │  │
│  │      }                                                     │  │
│  │    }                                                       │  │
│  │  }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Field-Level Access Control                              │  │
│  │                                                           │  │
│  │  {                                                         │  │
│  │    name: 'premiumContent',                                │  │
│  │    type: 'richText',                                      │  │
│  │    access: {                                              │  │
│  │      read: ({ req: { user } }) => {                       │  │
│  │        return user?.membership?.tier === 'premium';       │  │
│  │      }                                                     │  │
│  │    }                                                       │  │
│  │  }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

#### Backend: Collection-Level Access Control

```typescript
// collections/Courses.ts
import { CollectionConfig } from 'payload/types';

const tierHierarchy = {
  free: 0,
  basic: 1,
  premium: 2,
  enterprise: 3,
};

export const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    // Anyone can list courses
    read: ({ req: { user }, id }) => {
      // If just listing (no specific ID), allow all
      if (!id) return true;

      // For specific course access, check membership
      // This is executed as a query filter
      if (!user) {
        // Non-authenticated users can only see free courses
        return {
          requiredMembershipTier: { equals: 'free' },
        };
      }

      // Authenticated users: check their tier
      const userTier = user.membership?.tier || 'free';
      const userLevel = tierHierarchy[userTier];

      // Return courses where required tier <= user's tier
      return {
        or: [
          { requiredMembershipTier: { equals: 'free' } },
          userLevel >= 1 && { requiredMembershipTier: { equals: 'basic' } },
          userLevel >= 2 && { requiredMembershipTier: { equals: 'premium' } },
          userLevel >= 3 && { requiredMembershipTier: { equals: 'enterprise' } },
        ].filter(Boolean),
      };
    },
  },
  fields: [
    // ... other fields
    {
      name: 'requiredMembershipTier',
      type: 'select',
      required: true,
      options: ['free', 'basic', 'premium', 'enterprise'],
    },
  ],
};
```

#### Backend: Field-Level Access Control (for partial content)

```typescript
// collections/Research.ts
export const Research: CollectionConfig = {
  slug: 'research',
  access: {
    read: () => true, // Allow reading the document
  },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'excerpt', type: 'textarea' }, // Always visible
    {
      name: 'fullContent',
      type: 'richText',
      access: {
        read: ({ req: { user }, doc }) => {
          if (!user) return false;

          const userTier = user.membership?.tier || 'free';
          const userLevel = tierHierarchy[userTier];
          const requiredLevel = tierHierarchy[doc.accessLevel];

          return userLevel >= requiredLevel;
        },
      },
    },
    {
      name: 'accessLevel',
      type: 'select',
      required: true,
      options: ['free', 'basic', 'premium', 'enterprise'],
    },
  ],
};
```

#### Frontend: Auth Context

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  membership: {
    tier: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'expired' | 'cancelled';
    endDate: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasAccess: (requiredTier: string) => boolean;
}

const AuthContext = createContext<AuthContextType>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('https://api.stockus.id/api/users/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('https://api.stockus.id/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('tokenExp', data.exp);
  };

  const logout = async () => {
    await fetch('https://api.stockus.id/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExp');
  };

  const hasAccess = (requiredTier: string) => {
    if (!user || user.membership.status !== 'active') return false;

    const tierHierarchy = {
      free: 0,
      basic: 1,
      premium: 2,
      enterprise: 3,
    };

    return tierHierarchy[user.membership.tier] >= tierHierarchy[requiredTier];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### Frontend: Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: 'free' | 'basic' | 'premium' | 'enterprise';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredTier = 'free',
  redirectTo = '/login',
}) => {
  const { user, loading, hasAccess } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!hasAccess(requiredTier)) {
    return <Navigate to="/upgrade" state={{ requiredTier }} replace />;
  }

  return <>{children}</>;
};
```

#### Frontend: Conditional Content Rendering

```typescript
// pages/ResearchPost.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ResearchPost: React.FC = () => {
  const { id } = useParams();
  const { user, hasAccess } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://api.stockus.id/api/research/${id}`, {
          credentials: 'include',
        });
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  const canAccessFullContent = hasAccess(post.accessLevel);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>

      {canAccessFullContent ? (
        <div dangerouslySetInnerHTML={{ __html: post.fullContent }} />
      ) : (
        <div>
          <p>This content is only available for {post.accessLevel} members.</p>
          <a href="/upgrade">Upgrade your membership</a>
        </div>
      )}
    </div>
  );
};
```

**Data Flow Summary:**

1. **Frontend checks** (client-side): Fast UX, but not secure (can be bypassed)
2. **Backend enforces** (server-side): Secure, authoritative source of truth
3. **Field-level access**: Allows showing teasers while hiding premium content
4. **Collection-level access**: Prevents unauthorized API access entirely

**Best Practices:**
- Always verify access on the backend (frontend checks are for UX only)
- Use field-level access for partial content (e.g., research excerpt vs full article)
- Use collection-level access for complete content restrictions
- Return 403 Forbidden for unauthorized access (not 404)
- Log access control failures for security monitoring

**Sources:**
- [PayloadCMS Access Control Overview](https://payloadcms.com/docs/access-control/overview)
- [PayloadCMS Field-Level Access Control](https://payloadcms.com/access-control)
- [Setting up Auth and Role-Based Access Control in Next.js + Payload](https://payloadcms.com/posts/guides/setting-up-auth-and-role-based-access-control-in-nextjs-payload)

## Data Flow Patterns

### 1. User Registration & First Payment

```
User → Frontend → Backend → Database
                 ↓
                Midtrans (payment)
                 ↓
       Webhook → Backend → Activate Membership
```

**Steps:**
1. User fills registration form + selects membership tier
2. Frontend: POST /api/users (create account)
3. Frontend: POST /api/orders (create order with membership)
4. Backend: Generates order, returns Midtrans payment URL
5. User redirected to Midtrans, completes payment
6. Midtrans: Sends webhook to Backend
7. Backend: Verifies signature, updates order status
8. Backend: Triggers `afterChange` hook → activates membership
9. Backend: Sends confirmation email
10. User redirected back to app, now has active membership

### 2. Accessing Gated Content

```
User → Frontend (checks tier) → Backend (enforces access) → Database
       ↓                              ↓
    Show UI                      Return data (filtered)
```

**Steps:**
1. User navigates to course page
2. Frontend: `ProtectedRoute` checks user's membership tier (UX)
3. Frontend: GET /api/courses/:id (with credentials)
4. Backend: Verifies JWT, checks membership tier in access control
5. Backend: Returns course data (or 403 if unauthorized)
6. Frontend: Renders course content or upgrade prompt

### 3. Cohort Enrollment

```
User → Frontend → Backend → Check Capacity → Update Database
                            ↓
                         Send Email
```

**Steps:**
1. User clicks "Enroll in Cohort"
2. Frontend: POST /api/cohorts/:id/enroll (custom endpoint)
3. Backend: Checks user's membership tier, cohort capacity
4. Backend: Adds user to cohort participants (relationship)
5. Backend: Sends enrollment confirmation email
6. Backend: Returns success
7. Frontend: Shows confirmation, redirects to cohort page

### 4. Content Creation (Admin)

```
Admin → Admin Panel → Backend → Database
                        ↓
                   Webhooks (optional, for static site rebuild)
```

**Steps:**
1. Admin logs into Admin Panel (https://admin.stockus.id)
2. Admin creates/edits content (course, research post, etc.)
3. Admin clicks "Save" or "Publish"
4. Backend: Validates data, applies hooks
5. Backend: Saves to database
6. Backend: (Optional) Triggers webhook for frontend rebuild

## Build Order & Dependencies

### Phase 1: Backend Foundation (Week 1-2)

**Goal:** PayloadCMS backend with basic collections and auth

1. **Setup PayloadCMS project**
   - Initialize Next.js + PayloadCMS 3.0
   - Configure PostgreSQL connection
   - Setup environment variables

2. **Define core collections**
   - Users (with auth enabled)
   - Memberships
   - Orders
   - Create TypeScript types (auto-generated by Payload)

3. **Configure authentication**
   - JWT strategy
   - CORS for frontend domain
   - CSRF protection

4. **Deploy backend**
   - Docker container or VPS
   - Setup database (managed PostgreSQL)
   - Test Admin Panel access

**Deliverables:**
- Working Admin Panel at https://admin.stockus.id
- REST API endpoints for users, memberships, orders
- Database schema created

**Blockers for next phase:**
- None (frontend can mock API responses in parallel)

### Phase 2: Payment Integration (Week 2-3)

**Goal:** Midtrans payment flow with webhooks

**Depends on:** Phase 1 (Orders collection must exist)

1. **Setup Midtrans**
   - Create Midtrans account
   - Get sandbox credentials
   - Install `midtrans-client` npm package

2. **Create payment endpoints**
   - POST /api/orders/create-payment (custom endpoint)
   - POST /api/webhooks/midtrans

3. **Implement webhook handler**
   - Signature verification
   - Order status updates
   - afterChange hook for membership activation

4. **Test payment flow**
   - Use Midtrans sandbox
   - Test webhook with ngrok (local dev)
   - Verify membership activation

**Deliverables:**
- Working payment flow (sandbox)
- Webhook handler processing Midtrans notifications
- Membership auto-activation on successful payment

**Blockers for next phase:**
- None (frontend can start in parallel)

### Phase 3: Content Collections (Week 3-4)

**Goal:** Course and research content infrastructure

**Depends on:** Phase 1 (Users/Memberships for access control)

1. **Define content collections**
   - Courses
   - Cohorts
   - Sessions
   - Research
   - Templates

2. **Configure relationships**
   - Course → Cohorts (one-to-many)
   - Cohort → Sessions (one-to-many)
   - Cohort ↔ Users (many-to-many, participants)

3. **Implement access control**
   - Collection-level (read access by tier)
   - Field-level (premium content gating)

4. **Add sample content**
   - Create test courses, cohorts
   - Verify access control works

**Deliverables:**
- Content collections with proper access control
- Sample content for testing
- REST API endpoints for all content types

**Blockers for next phase:**
- Frontend needs these APIs to display content

### Phase 4: Frontend Foundation (Week 3-5)

**Goal:** React app with auth and routing

**Depends on:** Phase 1 (API endpoints for auth)

1. **Setup React project**
   - Vite + React + TypeScript
   - React Router for routing
   - Tailwind CSS (or preferred styling)

2. **Implement authentication**
   - AuthContext for global auth state
   - Login/logout pages
   - Token storage (localStorage + cookies)

3. **Create protected routes**
   - ProtectedRoute component
   - Tier-based access checks

4. **Build core pages**
   - Homepage
   - Login/Register
   - Dashboard (members)
   - Course listing
   - Course detail (gated)

**Deliverables:**
- React app deployed at https://app.stockus.id
- Working authentication flow
- Protected routes based on membership tier

**Blockers for next phase:**
- Phase 3 must be complete (content APIs)

### Phase 5: Content Display & Enrollment (Week 5-6)

**Goal:** Display courses, research, cohorts; enable enrollment

**Depends on:** Phase 3 (content collections), Phase 4 (frontend foundation)

1. **Build content pages**
   - Course listing with tier badges
   - Course detail with gated content
   - Research listing and detail
   - Cohort detail with enrollment

2. **Implement enrollment flow**
   - Enroll button with capacity checks
   - Confirmation UI
   - Enrolled cohorts list

3. **Add content gating UI**
   - Teasers for premium content
   - Upgrade prompts for unauthorized users

**Deliverables:**
- Complete member portal
- Working course/cohort enrollment
- Gated content with upgrade prompts

**Blockers for next phase:**
- Phase 2 must be complete (payment flow)

### Phase 6: Payment & Checkout (Week 6-7)

**Goal:** Complete payment flow from frontend

**Depends on:** Phase 2 (payment backend), Phase 4 (frontend)

1. **Build checkout flow**
   - Membership selection page
   - Order summary
   - Midtrans integration (redirect to payment page)

2. **Handle payment callbacks**
   - Success/error/pending pages
   - Order status polling
   - Membership activation confirmation

3. **Add payment history**
   - User's order list
   - Order detail page

**Deliverables:**
- Complete end-to-end payment flow
- Payment history for users

**Blockers for next phase:**
- None (testing can begin)

### Phase 7: Testing & Production (Week 7-8)

**Goal:** E2E testing, production deployment

**Depends on:** All previous phases

1. **Testing**
   - Test all user flows (registration, payment, enrollment)
   - Test access control (try bypassing membership checks)
   - Test webhook handling (simulate Midtrans notifications)

2. **Production setup**
   - Switch Midtrans to production credentials
   - Configure production domains
   - Setup SSL certificates
   - Database backups

3. **Monitoring**
   - Setup error tracking (Sentry)
   - Setup analytics
   - Setup uptime monitoring

**Deliverables:**
- Production-ready application
- Tested payment flow with real transactions
- Monitoring in place

## Architecture Patterns to Follow

### Pattern 1: Separation of Concerns

**What:** Keep PayloadCMS backend purely for data and business logic; keep React frontend purely for presentation.

**Why:** Easier to scale, test, and maintain. Allows swapping frontends (web, mobile) without backend changes.

**Implementation:**
- Backend: No UI logic (except Admin Panel)
- Frontend: No direct database access
- Communication only via REST API

### Pattern 2: Defense in Depth for Access Control

**What:** Check access on both frontend (UX) and backend (security).

**Why:** Frontend checks can be bypassed; backend must be authoritative.

**Implementation:**
```typescript
// Frontend (UX check)
if (!hasAccess('premium')) {
  return <UpgradePrompt />;
}

// Backend (security enforcement)
access: {
  read: ({ req: { user } }) => {
    return user?.membership?.tier === 'premium';
  },
}
```

### Pattern 3: Event-Driven Architecture with Hooks

**What:** Use PayloadCMS hooks to trigger side effects (emails, membership activation).

**Why:** Keeps business logic centralized; ensures consistency.

**Implementation:**
```typescript
hooks: {
  afterChange: [
    async ({ doc, previousDoc }) => {
      if (doc.status === 'paid' && previousDoc?.status !== 'paid') {
        await activateMembership(doc);
        await sendEmail(doc);
      }
    },
  ],
}
```

### Pattern 4: Idempotent Webhook Handling

**What:** Handle duplicate webhook calls gracefully (Midtrans may retry).

**Why:** Prevents double-charging, double-activation.

**Implementation:**
```typescript
// Check if order already processed
if (order.status === 'paid') {
  return res.status(200).json({ message: 'Already processed' });
}
```

### Pattern 5: Hierarchical Membership Tiers

**What:** Use numeric hierarchy for tier comparisons.

**Why:** Simplifies access control logic.

**Implementation:**
```typescript
const tierHierarchy = { free: 0, basic: 1, premium: 2, enterprise: 3 };
const hasAccess = tierHierarchy[user.tier] >= tierHierarchy[required.tier];
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Building a Custom Admin Panel

**Why bad:** Massive development overhead for minimal benefit; PayloadCMS Admin Panel is production-ready.

**Instead:** Use built-in Admin Panel; customize with components if needed.

### Anti-Pattern 2: Trusting Frontend Access Checks

**Why bad:** Attackers can bypass frontend checks via direct API calls.

**Instead:** Always enforce access control on the backend.

### Anti-Pattern 3: Storing Sensitive Data in localStorage

**Why bad:** Vulnerable to XSS attacks.

**Instead:** Use HTTP-only cookies for tokens; localStorage only for non-sensitive data.

### Anti-Pattern 4: Ignoring Webhook Signature Verification

**Why bad:** Attackers can forge payment confirmations.

**Instead:** Always verify Midtrans signature before processing webhooks.

### Anti-Pattern 5: Using GraphQL Without Understanding Performance

**Why bad:** PayloadCMS GraphQL has known performance issues (as of 2025).

**Instead:** Use REST API unless you have specific GraphQL requirements.

### Anti-Pattern 6: Hardcoding Membership Tiers in Multiple Places

**Why bad:** Changes require updates in many files.

**Instead:** Define tier hierarchy in a shared config file.

## Deployment Architecture

### Recommended Setup (3 Separate Deployables)

```
┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  React Frontend  │  │ PayloadCMS       │  │ PostgreSQL ││
│  │  (Static/SPA)    │  │ Backend          │  │ Database   ││
│  │                  │  │ (Next.js)        │  │            ││
│  │  Vite build      │  │                  │  │ Managed    ││
│  │  output          │  │ /api (REST)      │  │ Service    ││
│  │                  │  │ /admin (UI)      │  │            ││
│  │                  │  │ /webhooks        │  │            ││
│  │                  │  │                  │  │            ││
│  │ app.stockus.id   │  │ api.stockus.id   │  │ Private IP ││
│  │                  │  │ admin.stockus.id │  │            ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
│         │                       │                    │       │
│    Netlify/Vercel          VPS/Railway         RDS/Supabase │
│     (CDN + SSL)          (Docker Container)    (Managed DB) │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Options

| Component | Option 1 (Budget) | Option 2 (Scalable) | Option 3 (Enterprise) |
|-----------|------------------|---------------------|----------------------|
| **Frontend** | Netlify Free Tier | Vercel Pro | AWS CloudFront + S3 |
| **Backend** | Railway ($5-20/mo) | VPS (DigitalOcean $20/mo) | AWS ECS/Fargate |
| **Database** | Railway PostgreSQL | Supabase ($25/mo) | AWS RDS |
| **Total Cost** | ~$10/mo | ~$50/mo | ~$200+/mo |

### Environment Variables

**Backend (.env):**
```bash
# Database
DATABASE_URI=postgresql://user:pass@host:5432/stockus

# Payload
PAYLOAD_SECRET=your-super-secret-key-change-this
PAYLOAD_PUBLIC_SERVER_URL=https://api.stockus.id

# CORS
CORS_ORIGINS=https://app.stockus.id,http://localhost:5173

# Midtrans
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false # true in production

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.stockus.id
VITE_ADMIN_URL=https://admin.stockus.id
```

## Confidence Assessment & Gaps

### Confidence by Area

| Area | Confidence | Reasoning |
|------|-----------|-----------|
| **PayloadCMS as Headless API** | HIGH | Official docs confirm it can be used headless despite Next.js-native architecture |
| **Collection Design** | HIGH | Payload's relationship and access control features are well-documented |
| **Authentication Flow** | HIGH | JWT authentication is a core Payload feature with clear documentation |
| **Admin Panel** | HIGH | Built-in admin is production-ready and well-supported |
| **REST vs GraphQL** | MEDIUM | Recent performance issues with GraphQL noted in GitHub discussions |
| **Midtrans Webhooks** | MEDIUM | Midtrans docs are clear, but PayloadCMS-specific integration is custom |
| **Content Gating** | HIGH | Access control is a core Payload strength |
| **Deployment** | MEDIUM | PayloadCMS 3.0 requires database at build time, which complicates containerization |

### Known Gaps & Risks

1. **PayloadCMS 3.0 Build-Time Database Requirement**
   - **Gap:** Need to verify how this works in Docker/Kubernetes production
   - **Risk:** May complicate CI/CD pipeline
   - **Mitigation:** Test deployment early; consider managed platforms (Vercel, Railway)

2. **GraphQL Performance Issues**
   - **Gap:** As of 2025, GraphQL has known issues with overfetching
   - **Risk:** If REST proves insufficient, GraphQL migration may be problematic
   - **Mitigation:** Use REST; monitor GitHub for GraphQL fixes

3. **Midtrans-Specific Integration**
   - **Gap:** No official Midtrans plugin for PayloadCMS (unlike Stripe)
   - **Risk:** Custom integration requires thorough testing
   - **Mitigation:** Follow Midtrans Node.js client patterns; test extensively in sandbox

4. **Membership Expiration Handling**
   - **Gap:** No built-in recurring billing or auto-renewal in this architecture
   - **Risk:** Manual renewal process may frustrate users
   - **Mitigation:** Build custom cron job to check expiring memberships; send reminder emails

5. **Scale Considerations**
   - **Gap:** Cold starts with serverless deployments
   - **Risk:** Lightly-used admin panel may have slow initial loads
   - **Mitigation:** Consider always-on VPS for backend instead of serverless

## Sources

### PayloadCMS Architecture & Deployment
- [PayloadCMS Headless CMS](https://payloadcms.com/use-cases/headless-cms)
- [Payload 3.0 Next.js Integration](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [PayloadCMS GitHub](https://github.com/payloadcms/payload)
- [Using Payload Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs)
- [PayloadCMS Production Deployment](https://payloadcms.com/docs/production/deployment)
- [How to Run Payload CMS in Docker](https://sliplane.io/blog/how-to-run-payload-cms-in-docker)

### Authentication & Access Control
- [PayloadCMS Authentication Overview](https://payloadcms.com/docs/authentication/overview)
- [PayloadCMS JWT Strategy](https://payloadcms.com/docs/authentication/jwt)
- [PayloadCMS Access Control](https://payloadcms.com/docs/access-control/overview)
- [Setting up Auth and Role-Based Access Control in Next.js + Payload](https://payloadcms.com/posts/guides/setting-up-auth-and-role-based-access-control-in-nextjs-payload)
- [Access Control in Payload CMS - Quick Reference](https://dev.to/aaronksaunders/access-control-in-payload-cms-cheat-sheet-4fn)

### Collections & Relationships
- [PayloadCMS Collection Configs](https://payloadcms.com/docs/configuration/collections)
- [PayloadCMS Relationship Fields](https://payloadcms.com/docs/fields/relationship)
- [Understanding Relationships in Payload CMS](https://www.wisp.blog/blog/understanding-relationships-in-payload-cms)

### API Design
- [PayloadCMS GraphQL Overview](https://payloadcms.com/docs/graphql/overview)
- [Payload vs Directus vs Strapi - Performance Benchmarks](https://payloadcms.com/posts/blog/performance-benchmarks)
- [GraphQL Performance Issue #10948](https://github.com/payloadcms/payload/issues/10948)

### Webhooks & Hooks
- [PayloadCMS Collection Hooks](https://payloadcms.com/docs/hooks/collections)
- [PayloadCMS Field Hooks](https://payloadcms.com/docs/hooks/fields)

### Payment Integration
- [Midtrans Node.js Client GitHub](https://github.com/Midtrans/midtrans-nodejs-client)
- [Midtrans Backend Integration](https://docs.midtrans.com/reference/backend-integration)
- [PayloadCMS Stripe Plugin](https://payloadcms.com/docs/plugins/stripe)
- [RN Payments Powerhouse: Integrating Midtrans with Webhook Security](https://medium.com/@rafizimraanarjunawijaya/rn-payments-powerhouse-integrating-midtrans-xendit-or-stripe-with-webhook-security-the-321f5b266906)

### CORS & Cross-Domain
- [PayloadCMS CORS Configuration Discussion](https://github.com/payloadcms/payload/discussions/2554)

### General Architecture Patterns
- [Frontend & Backend Separation: Architectural Patterns](https://medium.com/@patel.sunny293/frontend-backend-separation-monolithic-service-oriented-microservice-architectures-f40b94a6b3bd)
- [Backends for Frontends Pattern - Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [CMS for React 2026](https://naturaily.com/blog/best-headless-cms-react)

---

**Research complete. Ready for roadmap creation.**
