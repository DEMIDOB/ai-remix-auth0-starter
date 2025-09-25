#!/usr/bin/env node

// Simple migration runner for MySQL using mysql2/promise.

const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'remix_app',
  multipleStatements: true
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(191) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function loadMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return []
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort()
    .map((file) => ({
      id: path.basename(file, '.sql'),
      file,
      sql: fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    }))
}

async function runMigrations() {
  const migrations = loadMigrations()
  if (migrations.length === 0) {
    console.log('No migrations found in', MIGRATIONS_DIR)
    return
  }

  const connection = await mysql.createConnection(config)

  try {
    console.log('🔄 Running migrations against %s:%d/%s', config.host, config.port, config.database)
    await ensureMigrationsTable(connection)

    const [rows] = await connection.query('SELECT id FROM migrations')
    const applied = new Set(rows.map((row) => row.id))

    for (const migration of migrations) {
      if (applied.has(migration.id)) {
        console.log('⏭️  Skipping already applied migration %s', migration.id)
        continue
      }

      console.log('⬆️  Applying migration %s (%s)', migration.id, migration.file)
      await connection.query('START TRANSACTION')
      try {
        await connection.query(migration.sql)
        await connection.query('INSERT INTO migrations (id) VALUES (?)', [migration.id])
        await connection.query('COMMIT')
        console.log('✅ Migration %s applied', migration.id)
      } catch (migrationError) {
        await connection.query('ROLLBACK')
        console.error('❌ Failed to apply migration %s', migration.id)
        throw migrationError
      }
    }

    console.log('🎉 All migrations are up to date.')
  } finally {
    await connection.end()
  }
}

async function listMigrations() {
  const migrations = loadMigrations()
  if (migrations.length === 0) {
    console.log('No migrations found.')
    return
  }

  console.log('Available migrations:')
  for (const migration of migrations) {
    console.log('-', migration.id)
  }
}

async function main() {
  const command = process.argv[2] || 'up'
  try {
    if (command === 'up') {
      await runMigrations()
    } else if (command === 'list') {
      await listMigrations()
    } else {
      console.error(`Unknown command: ${command}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('Migration runner failed:', error)
    process.exit(1)
  }
}

main()
