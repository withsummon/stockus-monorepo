import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/db/schema/users.ts',
    './src/db/schema/tokens.ts',
    './src/db/schema/sessions.ts',
    './src/db/schema/admins.ts',
    './src/db/schema/courses.ts',
    './src/db/schema/research.ts',
    './src/db/schema/templates.ts',
    './src/db/schema/images.ts',
    './src/db/schema/cohorts.ts',
    './src/db/schema/payments.ts',
    './src/db/schema/subscriptions.ts',
    './src/db/schema/promo-codes.ts',
    './src/db/schema/referrals.ts',
    './src/db/schema/videos.ts',
    './src/db/schema/watchlist.ts',
    './src/db/schema/portfolio.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
