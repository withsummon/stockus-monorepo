---
phase: 04-payment-integration
plan: 03
subsystem: payment
tags: [promo-codes, referral-system, discounts, rewards]

dependency-graph:
  requires:
    - 04-01 (promo_codes and referrals schema tables)
    - 04-02 (payment service for integration context)
  provides:
    - Promo code validation and application service
    - Referral code generation and reward tracking service
  affects:
    - 04-04 (payment routes will use these services)
    - 04-05 (webhook handler calls applyPromoCode and recordReferralReward)

tech-stack:
  added: []
  patterns:
    - Result object pattern for service responses
    - Atomic SQL increment for counters
    - Database transactions for multi-table operations
    - Nanoid with custom alphabet for code generation

file-tracking:
  key-files:
    created:
      - backend/src/services/promo.service.ts
      - backend/src/services/referral.service.ts
    modified: []

decisions:
  - id: promo-uppercase-normalize
    choice: Normalize promo codes to uppercase with trim
    rationale: Case-insensitive matching, consistent storage

  - id: referral-collision-retry
    choice: Retry up to 5 times on unique constraint violation
    rationale: Handle rare nanoid collisions gracefully

  - id: atomic-counter-increments
    choice: Use SQL template literals for atomic increments
    rationale: Prevents race conditions in concurrent applications

  - id: transaction-for-referral-reward
    choice: Wrap referralUsages insert + referrals update in transaction
    rationale: Ensures consistency between usage record and stats

metrics:
  duration: 3 min 6 sec
  completed: 2026-01-26
---

# Phase 04 Plan 03: Promo and Referral Services Summary

**One-liner:** Promo code validation with atomic usage tracking, referral code generation with transactional reward recording

## What Was Built

### Promo Code Service (102 lines)

Located at `backend/src/services/promo.service.ts`:

| Function | Purpose |
|----------|---------|
| `validatePromoCode(code)` | Validates code checking active, expiry, usage limits |
| `applyPromoCode(promoCodeId)` | Atomically increments usage counter |
| `calculateDiscountedAmount(amount, percent)` | Computes discounted price |
| `getPromoCode(id)` | Retrieves promo code by ID |

Validation logic checks:
- Code exists and is active
- Not expired (expiresAt null or > now)
- Within valid period (validFrom null or <= now)
- Under usage limit (maxUses null or currentUses < maxUses)

### Referral Service (182 lines)

Located at `backend/src/services/referral.service.ts`:

| Function | Purpose |
|----------|---------|
| `generateReferralCode(userId)` | Creates unique 8-char code for member |
| `validateReferralCode(code)` | Returns referral and referrer IDs |
| `recordReferralReward(referralId, newUserId, paymentId)` | Records usage and updates stats atomically |
| `getReferralStats(userId)` | Dashboard stats with recent usages |
| `getReferralByCode(code)` | Lookup by code for display |

Code generation:
- Uses nanoid with custom alphabet (no ambiguous chars: 0, O, I, l)
- 8 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Retries up to 5 times on collision (unique constraint)

## Key Implementation Details

### Atomic Operations

```typescript
// Promo code usage increment
currentUses: sql`${promoCodes.currentUses} + 1`

// Referral stats update
totalUses: sql`${referrals.totalUses} + 1`,
rewardsEarned: sql`${referrals.rewardsEarned} + ${rewardAmount}`
```

### Transaction for Referral Reward

```typescript
await db.transaction(async (tx) => {
  await tx.insert(referralUsages).values({ ... })
  await tx.update(referrals).set({ ... }).where(...)
})
```

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| bf96f41 | feat(04-03): create promo code validation and application service |
| 039e348 | feat(04-03): create referral code generation and reward tracking service |

## Verification Results

- [x] TypeScript compilation passes
- [x] Promo service exports: validatePromoCode, applyPromoCode, calculateDiscountedAmount, getPromoCode
- [x] Referral service exports: generateReferralCode, validateReferralCode, recordReferralReward, getReferralStats, getReferralByCode
- [x] Both services use SQL atomic increments
- [x] recordReferralReward uses transaction

## Next Phase Readiness

Ready for 04-04 (payment routes):
- Services ready to be imported in route handlers
- Validation functions return result objects for easy error handling
- Apply functions called after webhook confirms settlement
