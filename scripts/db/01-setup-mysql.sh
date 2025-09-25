#!/bin/bash

# Script 1: Setup MySQL Docker Container
# Pull MySQL 8, create persistent volume, initialize database, ensure root/root credentials, confirm connectivity.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATA_DIR="$ROOT_DIR/.data/mysql"
mkdir -p "$DATA_DIR"

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root}
MYSQL_DATABASE=${MYSQL_DATABASE:-remix_app}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_IMAGE=${MYSQL_IMAGE:-mysql:8}

printf "\n🚀 Setting up MySQL Docker container '%s'...\n" "$MYSQL_CONTAINER_NAME"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker CLI not found. Please install Docker Desktop and try again."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker does not appear to be running. Please start Docker Desktop and retry."
  exit 1
fi

if ! docker image inspect "$MYSQL_IMAGE" >/dev/null 2>&1; then
  echo "⬇️  Pulling Docker image $MYSQL_IMAGE..."
  docker pull "$MYSQL_IMAGE"
fi

if docker ps -a --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "ℹ️  Found existing container '$MYSQL_CONTAINER_NAME'."
  if ! docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
    echo "▶️  Starting existing MySQL container..."
    docker start "$MYSQL_CONTAINER_NAME" >/dev/null
  else
    echo "✅ MySQL container already running."
  fi
else
  echo "🐳 Creating new MySQL container with persistent data in $DATA_DIR..."
  docker run -d \
    --name "$MYSQL_CONTAINER_NAME" \
    --restart unless-stopped \
    -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
    -e MYSQL_DATABASE="$MYSQL_DATABASE" \
    -p "$MYSQL_PORT":3306 \
    -v "$DATA_DIR":/var/lib/mysql \
    "$MYSQL_IMAGE" >/dev/null
fi

echo "⏳ Waiting for MySQL to become ready..."
for attempt in $(seq 1 60); do
  if docker exec "$MYSQL_CONTAINER_NAME" mysql \
    -uroot \
    -p"$MYSQL_ROOT_PASSWORD" \
    -e "SELECT 1" >/dev/null 2>&1; then
    break
  fi
  if [ "$attempt" -eq 60 ]; then
    echo "❌ MySQL did not become ready in time."
    exit 1
  fi
  sleep 2
done

echo "✅ MySQL responded to a simple query."

echo "⚙️  Ensuring database '$MYSQL_DATABASE' and root/root credentials exist..."
docker exec "$MYSQL_CONTAINER_NAME" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';
FLUSH PRIVILEGES;
SQL

echo "🔌 Testing external connectivity using mysql client inside the container..."
if docker exec "$MYSQL_CONTAINER_NAME" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 'connected' as status;" >/dev/null; then
  echo "✅ Connection test succeeded."
else
  echo "❌ Connection test failed even though the server responded earlier."
  exit 1
fi

echo
cat <<INFO
✅ MySQL Docker setup completed successfully!

📋 Connection Details
  Container : $MYSQL_CONTAINER_NAME
  Host      : 127.0.0.1
  Port      : $MYSQL_PORT
  Database  : $MYSQL_DATABASE
  Username  : root
  Password  : $MYSQL_ROOT_PASSWORD
  Data dir  : $DATA_DIR

🔗 Connection string: mysql://root:${MYSQL_ROOT_PASSWORD}@127.0.0.1:${MYSQL_PORT}/${MYSQL_DATABASE}

To connect manually from your host machine:
  docker exec -it $MYSQL_CONTAINER_NAME mysql -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE
INFO
