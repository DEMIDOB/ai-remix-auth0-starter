#!/bin/bash

# Script 6: Create test_table with sample data

set -euo pipefail

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-remix-mysql}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root}
MYSQL_DATABASE=${MYSQL_DATABASE:-remix_app}

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker CLI not found."
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER_NAME"; then
  echo "❌ MySQL container '$MYSQL_CONTAINER_NAME' is not running."
  echo "👉 Start it with: ./scripts/db/03-start-mysql.sh"
  exit 1
fi

echo "📝 Creating test_table and inserting sample data..."

docker exec -i "$MYSQL_CONTAINER_NAME" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" <<'SQL'
CREATE TABLE IF NOT EXISTS test_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DELETE FROM test_table;

INSERT INTO test_table (name, description) VALUES
  ('Sample Item 1', 'This is the first test record in our database'),
  ('Sample Item 2', 'This is the second test record with some data'),
  ('Sample Item 3', 'This is the third test record for demonstration');

SELECT 'Test table created successfully!' AS status;
SELECT COUNT(*) AS record_count FROM test_table;
SQL

COUNT=$(docker exec "$MYSQL_CONTAINER_NAME" mysql -N -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM test_table;")

echo "✅ test_table ready with $COUNT rows."
echo "🔍 Verify manually with: docker exec -it $MYSQL_CONTAINER_NAME mysql -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE -e 'SELECT * FROM test_table;'"
