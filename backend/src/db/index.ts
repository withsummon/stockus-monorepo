import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add pool error handler
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
  process.exit(-1);
});

// Create Drizzle instance
export const db = drizzle({ client: pool, schema });
