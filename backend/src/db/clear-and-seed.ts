import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function clearAndSeed() {
  console.log('Clearing existing data...')

  // Clear in reverse dependency order
  await db.execute(sql`DELETE FROM referral_usages`)
  await db.execute(sql`DELETE FROM referrals`)
  await db.execute(sql`DELETE FROM cohort_sessions`)
  await db.execute(sql`DELETE FROM cohorts`)
  await db.execute(sql`DELETE FROM payments`)
  await db.execute(sql`DELETE FROM subscriptions`)
  await db.execute(sql`DELETE FROM promo_codes`)
  await db.execute(sql`DELETE FROM videos`)
  await db.execute(sql`DELETE FROM course_sessions`)
  await db.execute(sql`DELETE FROM courses`)
  await db.execute(sql`DELETE FROM research_reports`)
  await db.execute(sql`DELETE FROM templates`)
  await db.execute(sql`DELETE FROM images`)
  await db.execute(sql`DELETE FROM watchlist_stocks`)
  await db.execute(sql`DELETE FROM portfolio_holdings`)
  await db.execute(sql`DELETE FROM tokens`)
  await db.execute(sql`DELETE FROM sessions`)
  await db.execute(sql`DELETE FROM admins`)
  await db.execute(sql`DELETE FROM users`)

  console.log('All data cleared. Run db:seed to re-seed.')
  process.exit(0)
}

clearAndSeed().catch((err) => {
  console.error('Clear failed:', err)
  process.exit(1)
})
