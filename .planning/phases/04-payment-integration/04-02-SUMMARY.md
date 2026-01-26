---
phase: 04-payment-integration
plan: 02
subsystem: payment
tags: [midtrans, snap, payment-gateway]

dependency-graph:
  requires: [01-01, 02-02]
  provides: [payment-service, snap-token-generation]
  affects: [04-03, 04-04, 04-05]

tech-stack:
  added: [midtrans-client, nanoid]
  patterns: [result-objects, order-id-parsing]

key-files:
  created:
    - backend/src/services/payment.service.ts
    - backend/src/types/midtrans-client.d.ts
  modified:
    - backend/src/config/env.ts
    - backend/.env.example
    - backend/package.json

decisions:
  - id: midtrans-snap
    choice: "Snap token-based integration"
    reason: "Frontend-initiated payment with Midtrans modal"
  - id: order-id-format
    choice: "sub-{userId}-{timestamp}-{nanoid} format"
    reason: "Unique IDs with embedded user context for webhook processing"
  - id: custom-fields
    choice: "custom_field1/2 for promo/referral IDs"
    reason: "Midtrans custom fields carry metadata through webhook lifecycle"

metrics:
  duration: 1 min 54 sec
  completed: 2026-01-26
---

# Phase 04 Plan 02: Midtrans Payment Service Summary

**One-liner:** Midtrans Snap integration with token generation for subscriptions and workshops using result-object pattern

## What Was Built

### 1. Environment Configuration
Extended `backend/src/config/env.ts` with Midtrans API key validation:
- MIDTRANS_SERVER_KEY: Required, min 10 chars
- MIDTRANS_CLIENT_KEY: Required, min 10 chars
- MIDTRANS_IS_PRODUCTION: Boolean default false
- REFERRAL_REWARD_AMOUNT: Number default 50000 (IDR)

### 2. Payment Service
Created `backend/src/services/payment.service.ts` (182 lines) with:
- **createSubscriptionPayment()**: Generates Snap token for annual membership
- **createWorkshopPayment()**: Generates Snap token for workshop purchases
- **checkTransactionStatus()**: Queries Midtrans API for payment status
- **extractUserIdFromOrderId()**: Parses user ID from order format
- **extractWorkshopIdFromOrderId()**: Parses workshop ID from order format

### 3. TypeScript Types
Created `backend/src/types/midtrans-client.d.ts` with:
- Snap client configuration types
- Transaction parameter interfaces
- Response type definitions

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Order ID format | `sub-{userId}-{timestamp}-{nanoid}` | Unique, traceable, parseable by webhook |
| Metadata storage | custom_field1/2 | Midtrans carries promo/referral IDs through payment |
| Error handling | Result objects | Consistent with email.service.ts pattern |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added TypeScript type declarations for midtrans-client**
- **Found during:** Task 2
- **Issue:** midtrans-client package has no @types package, causing TS7016 error
- **Fix:** Created custom type declaration file at `backend/src/types/midtrans-client.d.ts`
- **Files created:** backend/src/types/midtrans-client.d.ts
- **Commit:** cf5b95d

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 28859b8 | feat | Extend environment config for Midtrans |
| cf5b95d | feat | Add Midtrans payment service |

## Files Changed

```
backend/src/config/env.ts        (modified - added Midtrans env vars)
backend/.env.example             (modified - documented payment env vars)
backend/package.json             (modified - added midtrans-client, nanoid)
backend/src/services/payment.service.ts    (created - 182 lines)
backend/src/types/midtrans-client.d.ts     (created - 61 lines)
```

## Verification Results

- [x] TypeScript compilation passes
- [x] midtrans-client and nanoid in package.json dependencies
- [x] Service exports all required functions
- [x] Environment validates all Midtrans keys
- [x] Key link pattern `midtransClient.Snap` present

## Next Phase Readiness

**Ready for 04-03:** Payment service provides token generation that payment routes will consume.

**Integration notes:**
- Payment routes will call `createSubscriptionPayment()` and `createWorkshopPayment()`
- Webhook handler will use `extractUserIdFromOrderId()` to identify users
- Frontend will use returned `token` with Snap.js to display payment UI
