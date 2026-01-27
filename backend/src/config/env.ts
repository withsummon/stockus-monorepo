import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string()
    .default('3001')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 65535) {
        throw new Error(`PORT must be a number between 1 and 65535, got: ${val}`);
      }
      return num;
    }),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_MINUTES: z.string().default('15').transform(Number),
  JWT_REFRESH_EXPIRES_DAYS: z.string().default('7').transform(Number),

  // Email (Resend)
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().email(),

  // URLs
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),

  // Midtrans Payment Gateway
  MIDTRANS_SERVER_KEY: z.string().min(10, 'MIDTRANS_SERVER_KEY is required'),
  MIDTRANS_CLIENT_KEY: z.string().min(10, 'MIDTRANS_CLIENT_KEY is required'),
  MIDTRANS_IS_PRODUCTION: z.string().default('false').transform((val) => val === 'true'),

  // Referral System
  REFERRAL_REWARD_AMOUNT: z.string().default('50000').transform(Number), // IDR 50,000 default

  // Cloudflare R2 Storage
  CLOUDFLARE_ACCOUNT_ID: z.string().min(10, 'CLOUDFLARE_ACCOUNT_ID is required'),
  R2_ACCESS_KEY_ID: z.string().min(10, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(10, 'R2_SECRET_ACCESS_KEY is required'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
  VIDEO_UPLOAD_URL_EXPIRY: z.string().default('900').transform(Number), // 15 minutes
  VIDEO_PLAYBACK_URL_EXPIRY: z.string().default('3600').transform(Number), // 1 hour
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables immediately (fail fast)
export const env = envSchema.parse(process.env);
