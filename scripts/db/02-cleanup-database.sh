#!/bin/bash

# Script 2: Cleanup MySQL Database - DANGEROUS OPERATION
# Stops the container and removes the persisted data directory.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATA_DIR="$ROOT_DIR/.data/mysql"
MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}

cat <<'WARN'
⚠️  DANGER: DATABASE CLEANUP OPERATION
======================================
This will PERMANENTLY delete your local MySQL data directory and container.
Type YES in uppercase to continue or anything else to abort.
WARN

read -r -p "Are you absolutely sure? Type 'YES' to continue: " confirmation

if [ "$confirmation" != "YES" ]; then
  echo "🚫 Operation cancelled."
  exit 0
fi

echo "🛑 Stopping MySQL container (if running)..."
if docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  docker stop "$MYSQL_CONTAINER_NAME" >/dev/null
fi

echo "🗑️  Removing MySQL container (if it exists)..."
if docker ps -a --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  docker rm "$MYSQL_CONTAINER_NAME" >/dev/null
fi

if [ -d "$DATA_DIR" ]; then
  echo "🧹 Deleting data directory: $DATA_DIR"
  rm -rf "$DATA_DIR"
else
  echo "ℹ️  Data directory $DATA_DIR not found (already removed)."
fi

echo "✅ Cleanup completed. Run ./scripts/db/01-setup-mysql.sh to re-create the database."
