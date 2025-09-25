import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { getPool } from '~/db/pool.server'

export type AssignmentStatus = 'scheduled' | 'completed' | 'cancelled'

export type AssignmentRecord = {
  id: number
  jobId: number
  cleanerId: number
  scheduledStart: Date
  status: AssignmentStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type AssignmentWithDetails = AssignmentRecord & {
  cleanerName: string
  cleanerEmail: string | null
  jobTitle: string
  jobLocation: string | null
  jobDurationMinutes: number
}

function mapAssignmentRow(row: RowDataPacket): AssignmentRecord {
  return {
    id: Number(row.id),
    jobId: Number(row.job_id),
    cleanerId: Number(row.cleaner_id),
    scheduledStart: new Date(row.scheduled_start),
    status: row.status as AssignmentStatus,
    notes: row.notes === null ? null : String(row.notes),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export async function listAssignmentsWithRelations(): Promise<AssignmentWithDetails[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       a.id,
       a.job_id,
       a.cleaner_id,
       a.scheduled_start,
       a.status,
       a.notes,
       a.created_at,
       a.updated_at,
       c.name AS cleaner_name,
       c.email AS cleaner_email,
       j.title AS job_title,
       j.location AS job_location,
       j.duration_minutes AS job_duration_minutes
     FROM job_assignments AS a
     INNER JOIN cleaners AS c ON c.id = a.cleaner_id
     INNER JOIN jobs AS j ON j.id = a.job_id
     ORDER BY a.scheduled_start ASC`
  )

  return rows.map((row) => ({
    ...mapAssignmentRow(row),
    cleanerName: String(row.cleaner_name),
    cleanerEmail: row.cleaner_email === null ? null : String(row.cleaner_email),
    jobTitle: String(row.job_title),
    jobLocation: row.job_location === null ? null : String(row.job_location),
    jobDurationMinutes: Number(row.job_duration_minutes)
  }))
}

export type CreateAssignmentInput = {
  jobId: number
  cleanerId: number
  scheduledStart: Date
  notes?: string | null
}

export async function createAssignment(input: CreateAssignmentInput): Promise<AssignmentRecord> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO job_assignments (job_id, cleaner_id, scheduled_start, status, notes)
     VALUES (?, ?, ?, 'scheduled', ?)` ,
    [input.jobId, input.cleanerId, input.scheduledStart, input.notes ?? null]
  )

  const insertedId = Number(result.insertId)
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, job_id, cleaner_id, scheduled_start, status, notes, created_at, updated_at
     FROM job_assignments
     WHERE id = ?
     LIMIT 1`,
    [insertedId]
  )

  if (rows.length === 0) {
    throw new Error('Failed to load assignment after insert')
  }

  return mapAssignmentRow(rows[0])
}

export async function findCleanerAssignmentsAround(
  cleanerId: number,
  start: Date,
  windowMinutes: number
): Promise<AssignmentRecord[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, job_id, cleaner_id, scheduled_start, status, notes, created_at, updated_at
     FROM job_assignments
     WHERE cleaner_id = ?
       AND scheduled_start BETWEEN DATE_SUB(?, INTERVAL ? MINUTE)
                              AND DATE_ADD(?, INTERVAL ? MINUTE)
     ORDER BY scheduled_start ASC`,
    [cleanerId, start, windowMinutes, start, windowMinutes]
  )

  return rows.map(mapAssignmentRow)
}

export const assignmentsProvider = {
  listWithRelations: listAssignmentsWithRelations,
  create: createAssignment,
  findCleanerAssignmentsAround
}
