import type { RowDataPacket } from 'mysql2/promise'
import { getPool } from '~/db/pool.server'

export type CleanerRecord = {
  id: number
  name: string
  email: string | null
  phone: string | null
  hourlyRate: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

function mapCleanerRow(row: RowDataPacket): CleanerRecord {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: row.email === null ? null : String(row.email),
    phone: row.phone === null ? null : String(row.phone),
    hourlyRate: row.hourly_rate === null ? null : Number(row.hourly_rate),
    notes: row.notes === null ? null : String(row.notes),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export async function listCleaners(): Promise<CleanerRecord[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, email, phone, hourly_rate, notes, created_at, updated_at
     FROM cleaners
     ORDER BY name ASC`
  )

  return rows.map(mapCleanerRow)
}

export async function getCleanerById(id: number): Promise<CleanerRecord | null> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, email, phone, hourly_rate, notes, created_at, updated_at
     FROM cleaners
     WHERE id = ?
     LIMIT 1`,
    [id]
  )

  if (rows.length === 0) return null
  return mapCleanerRow(rows[0])
}

export const cleanersProvider = {
  list: listCleaners,
  getById: getCleanerById
}
