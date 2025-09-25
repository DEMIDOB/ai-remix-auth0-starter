import type { RowDataPacket } from 'mysql2/promise'
import { getPool } from '~/db/pool.server'

export type JobRecord = {
  id: number
  title: string
  description: string | null
  location: string | null
  durationMinutes: number
  createdAt: Date
  updatedAt: Date
}

function mapJobRow(row: RowDataPacket): JobRecord {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: row.description === null ? null : String(row.description),
    location: row.location === null ? null : String(row.location),
    durationMinutes: Number(row.duration_minutes),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export async function listJobs(): Promise<JobRecord[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, description, location, duration_minutes, created_at, updated_at
     FROM jobs
     ORDER BY created_at DESC`
  )

  return rows.map(mapJobRow)
}

export async function getJobById(id: number): Promise<JobRecord | null> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, description, location, duration_minutes, created_at, updated_at
     FROM jobs
     WHERE id = ?
     LIMIT 1`,
    [id]
  )

  if (rows.length === 0) return null
  return mapJobRow(rows[0])
}

export const jobsProvider = {
  list: listJobs,
  getById: getJobById
}
