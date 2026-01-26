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
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables immediately (fail fast)
export const env = envSchema.parse(process.env);
