# Requirements: StockUs

**Defined:** 2025-01-25
**Core Value:** Indonesian investors can learn structured approaches to global equity investing through cohort-based courses, research, templates, and a professional community.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh (HTTP-only cookies)
- [ ] **AUTH-05**: System supports user tiers (anonymous, free, member)

### Content Management

- [ ] **CONT-01**: Admin can create/edit/publish courses with metadata (title, description, thumbnail)
- [ ] **CONT-02**: Admin can create/edit/publish research reports with publication dates
- [ ] **CONT-03**: Admin can upload downloadable templates (PDF, Excel files)
- [ ] **CONT-04**: Admin can use rich text editor for content creation
- [ ] **CONT-05**: Admin can manage media library (images)
- [ ] **CONT-06**: Content can be marked as free preview or members-only

### Payment & Subscription

- [ ] **PAY-01**: User can purchase annual subscription via Midtrans
- [ ] **PAY-02**: User can purchase one-time workshops via Midtrans
- [ ] **PAY-03**: User receives email receipt after successful payment
- [ ] **PAY-04**: User can apply promo codes for discounts
- [ ] **PAY-05**: System supports Indonesian payment methods (Virtual Account, GoPay, credit cards)
- [ ] **PAY-06**: Webhook handles Midtrans payment confirmations
- [ ] **PAY-07**: User subscription status updates automatically after payment

### Referral System

- [ ] **REF-01**: Each member has a unique referral promo code
- [ ] **REF-02**: New users can apply referral code during signup/checkout
- [ ] **REF-03**: Referrer receives reward when their code is used on successful payment
- [ ] **REF-04**: Admin can configure referral reward amount/type
- [ ] **REF-05**: Member can view their referral stats (uses, rewards earned)

### Member Experience

- [ ] **MEMB-01**: Member can view dashboard with enrolled courses, downloads, and schedule
- [ ] **MEMB-02**: Member can track course progress through sessions
- [ ] **MEMB-03**: Member can view download history
- [ ] **MEMB-04**: Member can download completion certificate after finishing course
- [ ] **MEMB-05**: Member can access research reports (full access)
- [ ] **MEMB-06**: Member can download all templates
- [ ] **MEMB-07**: Free user can access preview content only

### Cohort Management

- [ ] **COHO-01**: Admin can create cohorts with start/end dates
- [ ] **COHO-02**: Admin can manage enrollment windows (open/close)
- [ ] **COHO-03**: Admin can add sessions to cohorts with dates and Zoom links
- [ ] **COHO-04**: Member can enroll in available cohorts
- [ ] **COHO-05**: Member can view upcoming session schedule

### Video & Media

- [ ] **VID-01**: System integrates with VdoCipher for DRM-protected video hosting
- [ ] **VID-02**: Videos are accessible only to authenticated members
- [ ] **VID-03**: Videos display dynamic watermark with member email
- [ ] **VID-04**: Admin can upload and manage session recordings
- [ ] **VID-05**: Member can watch videos within course pages

### Public Pages

- [ ] **PAGE-01**: Landing page displays hero, course showcase, community features, testimonials, FAQ
- [ ] **PAGE-02**: About Us page displays team profiles (Jefta, Yosua)
- [ ] **PAGE-03**: Community page explains free Discord and premium member community
- [ ] **PAGE-04**: Pricing page displays membership offering and pricing
- [ ] **PAGE-05**: Research page shows watchlist preview (gated content for non-members)
- [ ] **PAGE-06**: All pages are mobile responsive
- [ ] **PAGE-07**: Site includes SEO meta tags and structured data

### Admin Panel

- [ ] **ADMN-01**: Admin can manage all content (courses, reports, templates, videos)
- [ ] **ADMN-02**: Admin can view and edit user accounts and subscriptions
- [ ] **ADMN-03**: Admin can view order history and payment status
- [ ] **ADMN-04**: Admin dashboard displays key metrics (members, revenue, enrollments)
- [ ] **ADMN-05**: Admin panel is separate from public frontend

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication Enhancements

- **AUTH-V2-01**: User can sign up/login with Google
- **AUTH-V2-02**: User can login via magic link (passwordless)

### Content Enhancements

- **CONT-V2-01**: Admin can schedule content for future publication
- **CONT-V2-02**: Admin can create content drafts and versions

### Payment Enhancements

- **PAY-V2-01**: System auto-renews subscriptions for supported payment methods
- **PAY-V2-02**: System handles failed payment grace periods (7 days)
- **PAY-V2-03**: User can pause subscription temporarily

### Member Enhancements

- **MEMB-V2-01**: Member can bookmark/favorite content
- **MEMB-V2-02**: Member can take notes within courses
- **MEMB-V2-03**: Member can access content offline (PWA)
- **MEMB-V2-04**: Member can view video watch analytics

### Cohort Enhancements

- **COHO-V2-01**: Admin can set cohort capacity limits
- **COHO-V2-02**: Users can join waitlist for full cohorts
- **COHO-V2-03**: System sends automated enrollment notifications

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time stock API integration | Stock data manually entered — avoids external API complexity and costs |
| Mobile app | Web-first approach, mobile responsive sufficient for v1 |
| Live video streaming built-in | Sessions happen on external platform (Zoom), not built into app |
| Automated trading signals | Educational platform only, no financial advice |
| Multi-language support | Indonesian audience, single language for v1 |
| Self-paced courses | Cohort-based model only, matches business model |
| GraphQL API | REST recommended for PayloadCMS (performance issues with GraphQL) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be populated by roadmapper) | | |

**Coverage:**
- v1 requirements: 46 total
- Mapped to phases: 0
- Unmapped: 46 (pending roadmap creation)

---
*Requirements defined: 2025-01-25*
*Last updated: 2025-01-25 after initial definition*
