import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const runMigrations = async () => {
  const migrationClient = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  })

  const db = drizzle({ client: migrationClient })

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations complete')

  await migrationClient.end()
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
