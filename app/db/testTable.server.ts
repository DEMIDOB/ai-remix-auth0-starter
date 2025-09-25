import type { RowDataPacket } from 'mysql2/promise'
import { getPool } from './pool.server'

export type TestTableRow = {
  id: number
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export async function fetchTestRows(limit = 2): Promise<TestTableRow[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, description, created_at AS createdAt, updated_at AS updatedAt
     FROM test_table
     ORDER BY id ASC
     LIMIT ?`,
    [limit]
  )

  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    description: row.description === null ? null : String(row.description),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }))
}

export async function countTestRows(): Promise<number> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM test_table`)
  const first = rows[0] as RowDataPacket & { total?: number }
  return first?.total ? Number(first.total) : 0
}
