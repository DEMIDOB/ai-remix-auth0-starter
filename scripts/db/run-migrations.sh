#!/bin/bash

# Helper to run database migrations via Node script.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}

if ! docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "❌ MySQL container '$MYSQL_CONTAINER_NAME' is not running. Start it before migrating."
  echo "👉 Try: ./scripts/db/03-start-mysql.sh"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies (mysql2 must be available)..."
  npm install
fi

node app/db/migrate.js "$@"
