# Phase 4: Payment Integration - Research

**Researched:** 2026-01-26
**Domain:** Payment gateway integration, subscription billing, referral systems
**Confidence:** HIGH

## Summary

Payment integration with Midtrans for Indonesian market requires Snap API for payment UI, webhook notification handling for transaction status updates, and careful handling of subscription limitations (only credit card and GoPay support recurring). The existing codebase already uses Resend for emails, Drizzle ORM for type-safe database operations, and Zod for validation—all of which integrate cleanly with payment workflows.

**Key findings:**
- Midtrans provides official Node.js client (`midtrans-client`) with Snap API for popup/redirect payments
- Webhook signature verification using SHA512 is critical for security
- Subscription API only supports credit cards and GoPay for recurring; other Indonesian payment methods (Virtual Accounts, bank transfers) require invoice-based manual renewal
- Idempotency handling essential for webhook reliability (use unique constraints on transaction IDs)
- Referral codes best generated using PostgreSQL Feistel cipher or nanoid for collision-resistance
- Drizzle ORM transactions API supports nested transactions and explicit rollbacks for payment operations

**Primary recommendation:** Use Midtrans Snap API for payment UI, implement robust webhook handler with signature verification and idempotency, store payment/subscription records in PostgreSQL with proper ACID transactions, and build invoice-based renewal system for non-credit-card subscriptions since true recurring is limited.

## Standard Stack

The established libraries/tools for payment integration with Midtrans and Node.js:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| midtrans-client | 1.x | Official Midtrans payment API client | Official SDK, maintained by Midtrans, handles API authentication and requests |
| crypto (Node.js built-in) | N/A | SHA512 signature verification | Required for webhook security, no external deps |
| Drizzle ORM | 0.36.4 (existing) | Database transactions for payments | Type-safe, supports PostgreSQL transactions with isolation levels |
| Zod | 3.24.1 (existing) | Webhook payload validation | Already in stack, type-safe validation |
| Resend | 6.8.0 (existing) | Payment receipt emails | Already integrated for auth emails |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.x | Short unique referral code generation | Alternative to PostgreSQL-based generation if simpler approach preferred |
| @hono/zod-validator | 0.7.6 (existing) | Webhook route validation | Already in use, validates incoming webhook data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| midtrans-client | midtrans-node (unofficial) | Unofficial library, less maintained, but similar API |
| nanoid | PostgreSQL Feistel cipher | PG approach guarantees uniqueness via DB, nanoid is probabilistic but simpler |
| Snap API | Core API (VT-Direct) | Core API requires custom frontend payment UI, Snap provides hosted payment page |

**Installation:**
```bash
npm install midtrans-client nanoid
```

## Architecture Patterns

### Recommended Project Structure
```
backend/src/
├── db/schema/
│   ├── payments.ts          # Payment transaction records
│   ├── subscriptions.ts     # User subscription status
│   ├── promo-codes.ts       # Promo code definitions
│   └── referrals.ts         # Referral tracking and rewards
├── routes/
│   ├── payments.ts          # Payment initiation endpoints
│   └── webhooks.ts          # Midtrans webhook handler (separate from other routes)
├── services/
│   ├── payment.service.ts   # Midtrans API interactions
│   ├── subscription.service.ts  # Subscription logic
│   ├── promo.service.ts     # Promo code validation
│   └── referral.service.ts  # Referral tracking
└── middleware/
    └── webhook-auth.ts      # Signature verification middleware
```

### Pattern 1: Webhook Handler with Signature Verification
**What:** Verify webhook authenticity using SHA512 signature before processing
**When to use:** Every webhook endpoint receiving payment notifications
**Example:**
```typescript
// Source: https://docs.midtrans.com/docs/https-notification-webhooks
import crypto from 'crypto';

function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean {
  const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedSignature = crypto
    .createHash('sha512')
    .update(signatureString)
    .digest('hex');

  return computedSignature === receivedSignature;
}

// Middleware pattern
export async function validateWebhookSignature(c: Context, next: Next) {
  const notification = await c.req.json();
  const isValid = verifyMidtransSignature(
    notification.order_id,
    notification.status_code,
    notification.gross_amount,
    env.MIDTRANS_SERVER_KEY,
    notification.signature_key
  );

  if (!isValid) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  await next();
}
```

### Pattern 2: Idempotent Webhook Processing
**What:** Prevent duplicate webhook processing using unique constraints
**When to use:** All webhook handlers (Midtrans sends multiple notifications)
**Example:**
```typescript
// Source: https://medium.com/@sohail_saifii/handling-payment-webhooks-reliably-idempotency-retries-validation-69b762720bf5
await db.transaction(async (tx) => {
  try {
    // Insert with unique constraint on order_id + transaction_id
    await tx.insert(processedWebhooks).values({
      orderId: notification.order_id,
      transactionId: notification.transaction_id,
      processedAt: new Date(),
    });
  } catch (error) {
    // Duplicate key error (23505) means already processed
    if (error.code === '23505') {
      console.log('Webhook already processed, skipping');
      return; // Exit early, don't reprocess
    }
    throw error;
  }

  // Process payment logic here
  await updatePaymentStatus(tx, notification);
});
```

### Pattern 3: Drizzle Transaction for Payment Operations
**What:** Wrap payment updates in database transactions with isolation
**When to use:** All operations that modify payment/subscription/referral state
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/transactions
await db.transaction(
  async (tx) => {
    // Update user tier
    await tx.update(users)
      .set({ tier: 'member' })
      .where(eq(users.id, userId));

    // Record payment
    await tx.insert(payments).values({
      userId,
      amount,
      status: 'completed',
      midtransOrderId: orderId,
    });

    // Award referral reward if applicable
    if (referralCode) {
      await tx.update(referrals)
        .set({ rewardsPaid: sql`${referrals.rewardsPaid} + 1` })
        .where(eq(referrals.code, referralCode));
    }
  },
  { isolationLevel: 'read committed' }
);
```

### Pattern 4: Snap Transaction Creation
**What:** Create Midtrans Snap payment token on backend, return to frontend
**When to use:** When user initiates payment (subscription or workshop purchase)
**Example:**
```typescript
// Source: https://github.com/Midtrans/midtrans-nodejs-client
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: env.NODE_ENV === 'production',
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

const parameter = {
  transaction_details: {
    order_id: `order-${userId}-${Date.now()}`, // Must be unique
    gross_amount: finalAmount, // After promo code discount
  },
  customer_details: {
    first_name: user.name,
    email: user.email,
  },
  item_details: [{
    id: 'annual-subscription',
    price: finalAmount,
    quantity: 1,
    name: 'StockUs Annual Subscription',
  }],
};

const transaction = await snap.createTransaction(parameter);
// Return transaction.token to frontend for Snap.js
```

### Pattern 5: Result Object Pattern (Existing Codebase)
**What:** Services return `{ success: boolean, error?: string, data?: T }` instead of throwing
**When to use:** All service methods (payment, subscription, promo, referral)
**Example:**
```typescript
// Consistent with existing backend/src/services/email.service.ts pattern
interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createPayment(
  userId: number,
  amount: number,
  promoCode?: string
): Promise<PaymentResult> {
  try {
    // Validate promo code
    if (promoCode) {
      const promo = await validatePromoCode(promoCode);
      if (!promo.success) {
        return { success: false, error: promo.error };
      }
      amount = applyDiscount(amount, promo.data);
    }

    // Create Midtrans transaction
    const transaction = await snap.createTransaction({...});

    return { success: true, orderId: transaction.order_id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Payment creation failed'
    };
  }
}
```

### Pattern 6: Referral Code Generation (Collision-Resistant)
**What:** Generate unique, URL-safe referral codes using nanoid or PostgreSQL Feistel
**When to use:** When creating new user accounts (automatic referral code assignment)
**Example:**
```typescript
// Source: https://gist.github.com/heri16/98e7d39b881cf1f8a0bc9ac1ce126438
// Option A: nanoid (simpler, client-side generation)
import { customAlphabet } from 'nanoid';

const generateReferralCode = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // No ambiguous chars
  8
);

const referralCode = generateReferralCode(); // e.g., "A3K7MN2P"

// Option B: PostgreSQL Feistel cipher (guaranteed unique, DB-based)
// Create function in migration:
// CREATE FUNCTION gen_short_code(int8, bytea, integer, varchar) RETURNS text...
// Then in code:
const [result] = await db.execute(
  sql`SELECT gen_short_code(${userId}, gen_short_secret('_referral'), 8)`
);
```

### Anti-Patterns to Avoid
- **Don't skip signature verification:** Frontend callbacks can be manipulated; always verify via webhook
- **Don't process webhooks synchronously:** Use job queue or fast database insert + async processing
- **Don't assume single webhook:** Midtrans may send multiple notifications per transaction
- **Don't use SERIAL for primary keys:** Use `generatedAlwaysAsIdentity()` per modern PostgreSQL best practices
- **Don't handle settlement->deny transition:** Very rare (Permata/Mandiri/Indomaret only) but must revert user tier
- **Don't skip transaction isolation:** Payment operations need atomicity to prevent partial updates

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment UI | Custom checkout form with card inputs | Midtrans Snap API | PCI compliance, fraud detection, multi-payment-method support built-in |
| Webhook signature verification | Custom HMAC or simple hash | Node.js crypto SHA512 with official algorithm | Midtrans-specific format, security-critical, documented approach |
| Unique ID generation | Math.random() or UUID for codes | nanoid or PostgreSQL Feistel cipher | Collision resistance, URL-safe, customizable alphabet |
| Transaction status polling | setInterval checking Midtrans API | Webhook notifications + GET Status API failover | Webhooks are event-driven, polling wastes API quota |
| Email receipt templates | String concatenation HTML | Extend existing Resend service pattern | Consistency with verification/reset emails, maintainable |
| Promo code discount logic | Ad-hoc percentage calculations | Centralized validation service with expiry checks | Business rules change, needs audit trail, reusable |
| Idempotency tracking | In-memory Set or cache | PostgreSQL unique constraint on webhook IDs | Survives restarts, handles distributed systems, atomic |

**Key insight:** Payment systems have security, compliance, and reliability requirements that custom solutions rarely handle correctly. Use official SDKs, battle-tested patterns, and database guarantees wherever possible.

## Common Pitfalls

### Pitfall 1: Not Verifying Transaction Status via API
**What goes wrong:** Frontend callback shows "success" but payment actually failed/pending
**Why it happens:** User can manipulate browser/network, frontend callback is unreliable
**How to avoid:** Always use webhook notification or GET Status API to verify final status server-side
**Warning signs:** Users report "payment success" but no tier upgrade, mismatched payment records

### Pitfall 2: Subscription Expectations vs Midtrans Reality
**What goes wrong:** Assuming all Indonesian payment methods support recurring billing
**Why it happens:** Marketing materials mention "subscriptions" but technical docs show credit card/GoPay only
**How to avoid:** For annual subscriptions, treat as one-time payment; build invoice/reminder system for renewals via email
**Warning signs:** Users asking "why can't I pay via bank transfer for subscription?"

### Pitfall 3: Ignoring Webhook Retry Logic
**What goes wrong:** Webhook handler crashes, Midtrans retries, duplicate processing occurs
**Why it happens:** No idempotency checks, webhook assumed to fire once
**How to avoid:** Use unique constraint on `(order_id, transaction_id)` or dedicated `processed_webhooks` table
**Warning signs:** Double-charging users, duplicate tier upgrades, inflated referral rewards

### Pitfall 4: Settlement->Deny Reversal Window
**What goes wrong:** User upgraded to "member" tier, payment reversed 3 minutes later, tier not downgraded
**Why it happens:** Rare Midtrans edge case (Permata/Mandiri/Indomaret bank transfers) allows settlement->deny transition
**How to avoid:** Webhook handler must process `deny` status even for previously settled transactions, revert user state
**Warning signs:** Users with "member" tier but refunded/denied payments in logs

### Pitfall 5: Hardcoded Order ID Format
**What goes wrong:** Duplicate order IDs cause transaction creation failures
**Why it happens:** Using simple patterns like `user-{userId}-subscription` without timestamp/uniqueness
**How to avoid:** Include timestamp or nanoid in order ID: `order-${userId}-${Date.now()}-${nanoid(6)}`
**Warning signs:** "Order ID already exists" errors from Midtrans API

### Pitfall 6: Missing HTTPS for Webhooks
**What goes wrong:** Webhooks work in development (HTTP) but fail in production
**Why it happens:** Midtrans requires HTTPS notification URLs in production, rejects self-signed certs
**How to avoid:** Use valid SSL certificate for notification URL, test with ngrok/tunneling in development
**Warning signs:** No webhook notifications received in production, Midtrans dashboard shows delivery failures

### Pitfall 7: Promo Code Race Conditions
**What goes wrong:** Single-use promo code applied by multiple users simultaneously
**Why it happens:** Check-then-update pattern without transaction isolation
**How to avoid:** Use database transaction with `SELECT FOR UPDATE` or atomic decrement on `uses_remaining`
**Warning signs:** Promo code used more times than `max_uses` allows

### Pitfall 8: Referral Reward Timing
**What goes wrong:** Referrer receives reward before payment actually settles
**Why it happens:** Processing referral on `pending` status instead of `settlement`
**How to avoid:** Award referral rewards only on `settlement` status, handle `deny` to claw back rewards
**Warning signs:** Referral rewards paid out despite failed/refunded payments

## Code Examples

Verified patterns from official sources:

### Webhook Notification Handler
```typescript
// Source: https://docs.midtrans.com/docs/https-notification-webhooks
import { Hono } from 'hono';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { payments, users } from '../db/schema/index.js';
import { env } from '../config/env.js';

const webhooks = new Hono();

webhooks.post('/midtrans', async (c) => {
  const notification = await c.req.json();

  // 1. Verify signature
  const signatureString = `${notification.order_id}${notification.status_code}${notification.gross_amount}${env.MIDTRANS_SERVER_KEY}`;
  const computedSignature = crypto.createHash('sha512').update(signatureString).digest('hex');

  if (computedSignature !== notification.signature_key) {
    console.error('Invalid signature:', notification.order_id);
    return c.json({ error: 'Invalid signature' }, 401);
  }

  // 2. Check if already processed (idempotency)
  const existingPayment = await db.query.payments.findFirst({
    where: eq(payments.midtransTransactionId, notification.transaction_id)
  });

  if (existingPayment) {
    console.log('Webhook already processed:', notification.transaction_id);
    return c.json({ status: 'ok' }); // Return 200 to stop retries
  }

  // 3. Process based on transaction status
  const { transaction_status, fraud_status, order_id } = notification;

  await db.transaction(async (tx) => {
    // Record payment
    await tx.insert(payments).values({
      midtransOrderId: order_id,
      midtransTransactionId: notification.transaction_id,
      status: transaction_status,
      amount: notification.gross_amount,
      userId: extractUserIdFromOrderId(order_id),
    });

    // Update user tier on successful payment
    if (transaction_status === 'settlement' ||
        (transaction_status === 'capture' && fraud_status === 'accept')) {
      await tx.update(users)
        .set({ tier: 'member' })
        .where(eq(users.id, extractUserIdFromOrderId(order_id)));
    }

    // Handle denial/reversal
    if (transaction_status === 'deny' || transaction_status === 'cancel') {
      await tx.update(users)
        .set({ tier: 'free' })
        .where(eq(users.id, extractUserIdFromOrderId(order_id)));
    }
  });

  return c.json({ status: 'ok' });
});
```

### Creating Snap Payment Transaction
```typescript
// Source: https://github.com/Midtrans/midtrans-nodejs-client
import midtransClient from 'midtrans-client';
import { nanoid } from 'nanoid';

const snap = new midtransClient.Snap({
  isProduction: env.NODE_ENV === 'production',
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

async function createSubscriptionPayment(
  userId: number,
  userEmail: string,
  userName: string,
  amount: number
) {
  const orderId = `sub-${userId}-${Date.now()}-${nanoid(6)}`;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: userName,
      email: userEmail,
    },
    item_details: [{
      id: 'annual-subscription',
      price: amount,
      quantity: 1,
      name: 'StockUs Annual Membership',
    }],
  };

  const transaction = await snap.createTransaction(parameter);

  // Return token to frontend for Snap.js
  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}
```

### Promo Code Validation with Expiry
```typescript
// Source: https://schinckel.net/2021/09/09/automatically-expire-rows-in-postgres/
import { and, eq, gt, gte, or, isNull, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { promoCodes } from '../db/schema/promo-codes.js';

interface PromoValidationResult {
  success: boolean;
  discountPercent?: number;
  error?: string;
}

async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  const promo = await db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.code, code.toUpperCase()),
      or(
        isNull(promoCodes.expiresAt),
        gt(promoCodes.expiresAt, new Date())
      ),
      or(
        isNull(promoCodes.maxUses),
        gt(sql`${promoCodes.maxUses} - ${promoCodes.currentUses}`, 0)
      )
    ),
  });

  if (!promo) {
    return { success: false, error: 'Invalid or expired promo code' };
  }

  return {
    success: true,
    discountPercent: promo.discountPercent
  };
}

// Apply promo and increment usage (atomic)
async function applyPromoCode(code: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(promoCodes)
      .set({ currentUses: sql`${promoCodes.currentUses} + 1` })
      .where(eq(promoCodes.code, code));
  });
}
```

### Referral Tracking on Successful Payment
```typescript
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { referrals, users } from '../db/schema/index.js';

async function recordReferralReward(
  referralCode: string,
  newUserId: number
) {
  await db.transaction(async (tx) => {
    // Find referrer by code
    const referral = await tx.query.referrals.findFirst({
      where: eq(referrals.code, referralCode)
    });

    if (!referral) return;

    // Increment referrer's stats
    await tx.update(referrals)
      .set({
        totalUses: sql`${referrals.totalUses} + 1`,
        rewardsEarned: sql`${referrals.rewardsEarned} + ${env.REFERRAL_REWARD_AMOUNT}`
      })
      .where(eq(referrals.id, referral.id));

    // Record who used the code
    await tx.insert(referralUsages).values({
      referralId: referral.id,
      newUserId,
      rewardAmount: env.REFERRAL_REWARD_AMOUNT,
    });
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SERIAL for IDs | `generatedAlwaysAsIdentity()` | PostgreSQL 10+ (2017) | Better SQL standard compliance, avoids sequence permission issues |
| try/catch everywhere | Result object pattern | 2024-2025 TypeScript trend | Explicit error handling, type-safe, better DX |
| Manual webhook verification | Official SDK + crypto.createHash | Always available | Reduces implementation errors, follows docs exactly |
| Polling payment status | Webhook-first + GET Status failover | Midtrans best practice | Real-time updates, lower API quota usage |
| Global promo codes | User-specific referral codes | Modern referral systems | Better attribution, viral growth tracking |
| Manual email HTML | Email service libraries (Resend) | 2023+ | Deliverability, analytics, template management |

**Deprecated/outdated:**
- **Midtrans VT-Web**: Deprecated, use Snap API instead (per Midtrans docs)
- **CommonJS require()**: Project uses ESM, continue with import/export
- **Throwing errors in services**: Existing codebase uses result objects, maintain consistency

## Open Questions

Things that couldn't be fully resolved:

1. **Midtrans Subscription Renewal Automation**
   - What we know: Only credit cards and GoPay support recurring billing API
   - What's unclear: How to handle annual renewal notifications for users who paid with Virtual Account/bank transfer
   - Recommendation: Build email reminder system 30/7 days before expiry, generate new Snap payment link per renewal

2. **Referral Reward Payout Mechanism**
   - What we know: System tracks referral rewards earned
   - What's unclear: Whether rewards are account credits, discounts, or cash payouts
   - Recommendation: Defer payout implementation to future phase, track as "pending rewards" for now

3. **Promo Code vs Referral Code Interaction**
   - What we know: Both apply discounts at checkout
   - What's unclear: Can user apply both simultaneously? Which takes precedence?
   - Recommendation: Allow stacking with business rule (e.g., promo % then referral fixed amount), document in validation logic

4. **Testing Webhook Locally**
   - What we know: Midtrans sends webhooks to HTTPS URLs
   - What's unclear: Best local development approach (ngrok, localtunnel, mock endpoint?)
   - Recommendation: Use ngrok for dev testing, implement mock webhook endpoint for unit tests

## Sources

### Primary (HIGH confidence)
- [Midtrans HTTP Notification Documentation](https://docs.midtrans.com/docs/https-notification-webhooks) - Webhook structure, signature verification
- [Midtrans Snap Integration Guide](https://docs.midtrans.com/docs/snap-snap-integration-guide) - Transaction creation flow
- [Midtrans Node.js Client GitHub](https://github.com/Midtrans/midtrans-nodejs-client) - Official SDK documentation
- [Midtrans Transaction Status Cycle](https://docs.midtrans.com/docs/transaction-status-cycle) - Status definitions and transitions
- [Midtrans Testing on Sandbox](https://docs.midtrans.com/docs/testing-payment-on-sandbox) - Test credentials and simulators
- [Midtrans Create Subscription API](https://docs.midtrans.com/reference/create-subscription) - Subscription limitations
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions) - Transaction API and best practices
- [PostgreSQL Secure Short IDs Gist](https://gist.github.com/heri16/98e7d39b881cf1f8a0bc9ac1ce126438) - Feistel cipher implementation

### Secondary (MEDIUM confidence)
- [Handling Payment Webhooks Reliably (Medium)](https://medium.com/@sohail_saifii/handling-payment-webhooks-reliably-idempotency-retries-validation-69b762720bf5) - Idempotency patterns
- [Hookdeck: Webhook Idempotency Guide](https://hookdeck.com/webhooks/guides/implement-webhook-idempotency) - Best practices
- [Result Pattern in TypeScript (Medium)](https://arg-software.medium.com/functional-error-handling-in-typescript-with-the-result-pattern-5b96a5abb6d3) - Error handling patterns
- [Drizzle ORM PostgreSQL Best Practices (GitHub Gist)](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) - Modern schema patterns
- [PostgreSQL Expiration Timestamps](https://schinckel.net/2021/09/09/automatically-expire-rows-in-postgres/) - Expiry validation

### Tertiary (LOW confidence)
- [Build a Simple Referral System With Node.js](https://plainenglish.io/blog/build-a-simple-referral-system-with-nodejs-and-mysql-3164de2e7818) - Referral patterns (MySQL but applicable)
- [Developing a Recurring Billing System](https://medium.com/@pholiveiradev/developing-a-recurring-billing-system-with-node-js-499dfa0f6c0b) - Subscription concepts

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Midtrans SDK documented, existing packages verified
- Architecture: HIGH - Patterns from official docs, Drizzle ORM documentation, existing codebase consistency
- Pitfalls: MEDIUM - Mix of official warnings and community experience reports
- Subscription limitations: HIGH - Verified in official Midtrans subscription API docs
- Idempotency: HIGH - Multiple authoritative sources agree, PostgreSQL guarantees well-documented

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - payment gateway APIs stable, but monitor Midtrans changelog)

**Notes:**
- Midtrans subscription API limitation (credit card/GoPay only) confirmed in official reference docs
- Existing codebase patterns (Result objects, Resend email, Drizzle transactions) align well with payment requirements
- No Context7 data available for Midtrans (Indonesian-specific gateway), relied on official docs
- Webhook security patterns verified across multiple payment providers (Stripe, Midtrans) show consistency
