#!/bin/bash

# Helper to run database migrations via db-migrate.

set -euo pipefail

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}

if ! docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "❌ MySQL container '$MYSQL_CONTAINER_NAME' is not running. Start it before migrating."
  echo "👉 Try: ./scripts/db/03-start-mysql.sh"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies (db-migrate + driver)..."
  npm install
fi

npm run db:migrate "$@"
