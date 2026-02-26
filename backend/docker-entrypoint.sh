#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
node dist/db/migrate.js || { echo "Migration failed!"; exit 1; }
echo "Migrations complete."

# Check if database has been seeded by looking for any users
NEEDS_SEED=$(node -e "
const { db } = require('./dist/db/index.js');
const { users } = require('./dist/db/schema/index.js');
db.select().from(users).limit(1).then(rows => {
  console.log(rows.length === 0 ? 'yes' : 'no');
  process.exit(0);
}).catch(() => {
  console.log('yes');
  process.exit(0);
});
" 2>/dev/null || echo "yes")

if [ "$NEEDS_SEED" = "yes" ]; then
  echo "No data found — running seed..."
  node dist/db/seed.js
  echo "Seed complete."
else
  echo "Database already seeded, skipping."
fi

# Start the application
exec node dist/index.js
