#!/bin/bash

# Script 4: Stop MySQL Docker Container

set -euo pipefail

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}

echo "🛑 Stopping MySQL Docker container..."

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker CLI not found."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker does not appear to be running."
  exit 1
fi

if ! docker ps -a --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "ℹ️  Container '$MYSQL_CONTAINER_NAME' does not exist. Nothing to stop."
  exit 0
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "ℹ️  Container '$MYSQL_CONTAINER_NAME' is already stopped."
  exit 0
fi

docker stop "$MYSQL_CONTAINER_NAME" >/dev/null

echo "✅ MySQL container stopped."
