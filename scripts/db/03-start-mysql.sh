#!/bin/bash

# Script 3: Start MySQL Docker Container

set -euo pipefail

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root}
MYSQL_DATABASE=${MYSQL_DATABASE:-remix_app}
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "🚀 Starting MySQL Docker container..."

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker CLI not found."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker does not appear to be running."
  exit 1
fi

if ! docker ps -a --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "❌ Container '$MYSQL_CONTAINER_NAME' does not exist. Run ./scripts/db/01-setup-mysql.sh first."
  exit 1
fi

if docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "✅ MySQL container is already running."
else
  docker start "$MYSQL_CONTAINER_NAME" >/dev/null
  echo "▶️  MySQL container started."
fi

echo "⏳ Verifying MySQL is responding..."
for attempt in $(seq 1 30); do
  if docker exec "$MYSQL_CONTAINER_NAME" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1" >/dev/null 2>&1; then
    echo "✅ MySQL is accepting connections on port $MYSQL_PORT."
    exit 0
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "❌ MySQL container started but is not responding to queries."
    exit 1
  fi
  sleep 2
done
