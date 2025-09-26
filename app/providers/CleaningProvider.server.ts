import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { getPool } from '~/db/pool.server'
import type {
  Assignment,
  AssignmentInput,
  Cleaner,
  CleanerInput,
  Job,
  JobInput
} from '~/types/cleaning'

function mapCleaner(row: RowDataPacket): Cleaner {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: row.email === null ? null : String(row.email),
    phone: row.phone === null ? null : String(row.phone),
    status: row.status as Cleaner['status'],
    notes: row.notes === null ? null : String(row.notes),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }
}

function mapJob(row: RowDataPacket): Job {
  return {
    id: Number(row.id),
    title: String(row.title),
    clientName: row.clientName === null ? null : String(row.clientName),
    location: row.location === null ? null : String(row.location),
    description: row.description === null ? null : String(row.description),
    rate: row.rate === null ? null : Number(row.rate),
    status: row.status as Job['status'],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }
}

function mapAssignment(row: RowDataPacket): Assignment {
  return {
    id: Number(row.id),
    jobId: Number(row.jobId),
    cleanerId: Number(row.cleanerId),
    jobTitle: String(row.jobTitle),
    cleanerName: String(row.cleanerName),
    serviceDate: String(row.serviceDate),
    status: row.status as Assignment['status'],
    notes: row.notes === null ? null : String(row.notes),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }
}

export async function listCleaners(): Promise<Cleaner[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, email, phone, status, notes, created_at AS createdAt, updated_at AS updatedAt
     FROM cleaners
     ORDER BY name ASC`
  )
  return rows.map(mapCleaner)
}

export async function createCleaner(input: CleanerInput): Promise<Cleaner> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO cleaners (name, email, phone, status, notes)
     VALUES (?, ?, ?, ?, ?)`
  , [input.name, input.email ?? null, input.phone ?? null, input.status, input.notes ?? null])

  return findCleanerById(result.insertId)
}

export async function updateCleaner(id: number, input: CleanerInput): Promise<Cleaner> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE cleaners
     SET name = ?, email = ?, phone = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  , [input.name, input.email ?? null, input.phone ?? null, input.status, input.notes ?? null, id])

  if (result.affectedRows === 0) {
    throw new Error('Cleaner not found')
  }

  return findCleanerById(id)
}

export async function deleteCleaner(id: number): Promise<void> {
  const pool = getPool()
  await pool.query(`DELETE FROM cleaners WHERE id = ?`, [id])
}

export async function findCleanerById(id: number): Promise<Cleaner> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, email, phone, status, notes, created_at AS createdAt, updated_at AS updatedAt
     FROM cleaners
     WHERE id = ?`
  , [id])

  if (rows.length === 0) {
    throw new Error('Cleaner not found')
  }

  return mapCleaner(rows[0])
}

export async function listJobs(): Promise<Job[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, client_name AS clientName, location, description, rate, status,
            created_at AS createdAt, updated_at AS updatedAt
     FROM jobs
     ORDER BY created_at DESC`
  )
  return rows.map(mapJob)
}

export async function createJob(input: JobInput): Promise<Job> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO jobs (title, client_name, location, description, rate, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  , [input.title, input.clientName ?? null, input.location ?? null, input.description ?? null, input.rate ?? null, input.status])

  return findJobById(result.insertId)
}

export async function updateJob(id: number, input: JobInput): Promise<Job> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE jobs
     SET title = ?, client_name = ?, location = ?, description = ?, rate = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  , [input.title, input.clientName ?? null, input.location ?? null, input.description ?? null, input.rate ?? null, input.status, id])

  if (result.affectedRows === 0) {
    throw new Error('Job not found')
  }

  return findJobById(id)
}

export async function deleteJob(id: number): Promise<void> {
  const pool = getPool()
  await pool.query(`DELETE FROM jobs WHERE id = ?`, [id])
}

export async function findJobById(id: number): Promise<Job> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, client_name AS clientName, location, description, rate, status,
            created_at AS createdAt, updated_at AS updatedAt
     FROM jobs
     WHERE id = ?`
  , [id])

  if (rows.length === 0) {
    throw new Error('Job not found')
  }

  return mapJob(rows[0])
}

export async function listAssignments(): Promise<Assignment[]> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.id,
            a.job_id AS jobId,
            a.cleaner_id AS cleanerId,
            j.title AS jobTitle,
            c.name AS cleanerName,
            DATE_FORMAT(a.service_date, '%Y-%m-%d') AS serviceDate,
            a.status,
            a.notes,
            a.created_at AS createdAt,
            a.updated_at AS updatedAt
     FROM assignments a
     JOIN jobs j ON j.id = a.job_id
     JOIN cleaners c ON c.id = a.cleaner_id
     ORDER BY a.service_date DESC, j.title ASC`
  )
  return rows.map(mapAssignment)
}

export async function createAssignment(input: AssignmentInput): Promise<Assignment> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO assignments (job_id, cleaner_id, service_date, status, notes)
     VALUES (?, ?, ?, ?, ?)`
  , [input.jobId, input.cleanerId, input.serviceDate, input.status, input.notes ?? null])

  return findAssignmentById(result.insertId)
}

export async function updateAssignment(id: number, input: AssignmentInput): Promise<Assignment> {
  const pool = getPool()
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE assignments
     SET job_id = ?, cleaner_id = ?, service_date = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  , [input.jobId, input.cleanerId, input.serviceDate, input.status, input.notes ?? null, id])

  if (result.affectedRows === 0) {
    throw new Error('Assignment not found')
  }

  return findAssignmentById(id)
}

export async function deleteAssignment(id: number): Promise<void> {
  const pool = getPool()
  await pool.query(`DELETE FROM assignments WHERE id = ?`, [id])
}

export async function findAssignmentById(id: number): Promise<Assignment> {
  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.id,
            a.job_id AS jobId,
            a.cleaner_id AS cleanerId,
            j.title AS jobTitle,
            c.name AS cleanerName,
            DATE_FORMAT(a.service_date, '%Y-%m-%d') AS serviceDate,
            a.status,
            a.notes,
            a.created_at AS createdAt,
            a.updated_at AS updatedAt
     FROM assignments a
     JOIN jobs j ON j.id = a.job_id
     JOIN cleaners c ON c.id = a.cleaner_id
     WHERE a.id = ?`
  , [id])

  if (rows.length === 0) {
    throw new Error('Assignment not found')
  }

  return mapAssignment(rows[0])
}

export async function getCleaningDashboardData() {
  const [cleaners, jobs, assignments] = await Promise.all([
    listCleaners(),
    listJobs(),
    listAssignments()
  ])

  return { cleaners, jobs, assignments }
}
