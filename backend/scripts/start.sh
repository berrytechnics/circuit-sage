#!/bin/sh
set -e

echo "Starting application..."

# Run database migrations
echo "Running database migrations..."
if yarn migrate:prod; then
  echo "✓ Migrations completed successfully"
else
  echo "⚠ Migration failed, but continuing (migrations may already be applied)"
  echo "⚠ If this is a new deployment, migrations should be run via deploy script"
fi

# Start the server
echo "Starting server..."
exec yarn start

