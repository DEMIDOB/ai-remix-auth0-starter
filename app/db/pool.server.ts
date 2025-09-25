import mysql, { Pool } from 'mysql2/promise'
import { env } from '~/env.server'

type PoolConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
}

let pool: Pool | undefined

function resolveConfig(): PoolConfig {
  return {
    host: env.DB_HOST ?? '127.0.0.1',
    port: env.DB_PORT ?? 3306,
    user: env.DB_USER ?? 'root',
    password: env.DB_PASSWORD ?? 'root',
    database: env.DB_NAME ?? 'remix_app'
  }
}

export function getPool(): Pool {
  if (!pool) {
    const config = resolveConfig()
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60_000,
      queueLimit: 0
    })
  }

  return pool
}

export async function pingDatabase() {
  const connection = getPool()
  await connection.query('SELECT 1')
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}
