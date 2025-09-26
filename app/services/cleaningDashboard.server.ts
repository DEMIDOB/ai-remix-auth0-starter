import type { AssignmentStatus, CleanerStatus, JobStatus } from '~/types/cleaning'
import { cleaningProvider } from '~/providers'

type MutationArea = 'cleaners' | 'jobs' | 'assignments'

export type MutationResult = {
  ok: boolean
  area: MutationArea
  message: string
}

export const CLEANER_STATUSES: CleanerStatus[] = ['active', 'inactive']
export const JOB_STATUSES: JobStatus[] = ['open', 'scheduled', 'completed', 'cancelled']
export const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['scheduled', 'completed', 'cancelled']

export function getCleaningMeta() {
  return {
    cleanerStatuses: CLEANER_STATUSES,
    jobStatuses: JOB_STATUSES,
    assignmentStatuses: ASSIGNMENT_STATUSES
  } as const
}

export async function loadCleaningDashboard() {
  const data = await cleaningProvider.getCleaningDashboardData()
  return {
    ...data,
    meta: getCleaningMeta()
  }
}

export async function loadCleaners() {
  const cleaners = await cleaningProvider.listCleaners()
  return { cleaners, meta: getCleaningMeta() }
}

export async function loadJobs() {
  const jobs = await cleaningProvider.listJobs()
  return { jobs, meta: getCleaningMeta() }
}

export async function loadAssignments() {
  const [assignments, cleaners, jobs] = await Promise.all([
    cleaningProvider.listAssignments(),
    cleaningProvider.listCleaners(),
    cleaningProvider.listJobs()
  ])
  return { assignments, cleaners, jobs, meta: getCleaningMeta() }
}

export async function handleCleaningDashboardMutation(formData: FormData): Promise<MutationResult> {
  const intent = String(formData.get('intent') ?? '')

  try {
    switch (intent) {
      case 'create-cleaner':
        await cleaningProvider.createCleaner(parseCleanerInput(formData))
        return { ok: true, area: 'cleaners', message: 'Cleaner added successfully.' }
      case 'update-cleaner':
        await cleaningProvider.updateCleaner(parseId(formData), parseCleanerInput(formData))
        return { ok: true, area: 'cleaners', message: 'Cleaner updated successfully.' }
      case 'delete-cleaner':
        await cleaningProvider.deleteCleaner(parseId(formData))
        return { ok: true, area: 'cleaners', message: 'Cleaner removed.' }
      case 'create-job':
        await cleaningProvider.createJob(parseJobInput(formData))
        return { ok: true, area: 'jobs', message: 'Job added successfully.' }
      case 'update-job':
        await cleaningProvider.updateJob(parseId(formData), parseJobInput(formData))
        return { ok: true, area: 'jobs', message: 'Job updated successfully.' }
      case 'delete-job':
        await cleaningProvider.deleteJob(parseId(formData))
        return { ok: true, area: 'jobs', message: 'Job removed.' }
      case 'create-assignment':
        await cleaningProvider.createAssignment(parseAssignmentInput(formData))
        return { ok: true, area: 'assignments', message: 'Assignment added successfully.' }
      case 'update-assignment':
        await cleaningProvider.updateAssignment(parseId(formData), parseAssignmentInput(formData))
        return { ok: true, area: 'assignments', message: 'Assignment updated successfully.' }
      case 'delete-assignment':
        await cleaningProvider.deleteAssignment(parseId(formData))
        return { ok: true, area: 'assignments', message: 'Assignment removed.' }
      default:
        return { ok: false, area: 'cleaners', message: 'Unknown action.' }
    }
  } catch (error) {
    const area = resolveArea(intent)
    const message = formatErrorMessage(error)
    return { ok: false, area, message }
  }
}

function parseId(formData: FormData): number {
  const raw = formData.get('id')
  const value = Number(raw)
  if (!raw || Number.isNaN(value)) {
    throw new Error('Missing or invalid identifier')
  }
  return value
}

function parseCleanerInput(formData: FormData) {
  const name = requiredString(formData.get('name'), 'Cleaner name is required')
  const status = (formData.get('status') as CleanerStatus | null) ?? 'active'
  return {
    name,
    email: optionalString(formData.get('email')),
    phone: optionalString(formData.get('phone')),
    status,
    notes: optionalString(formData.get('notes'))
  }
}

function parseJobInput(formData: FormData) {
  const title = requiredString(formData.get('title'), 'Job title is required')
  const status = (formData.get('status') as JobStatus | null) ?? 'open'
  const rate = optionalNumber(formData.get('rate'))
  return {
    title,
    clientName: optionalString(formData.get('clientName')),
    location: optionalString(formData.get('location')),
    description: optionalString(formData.get('description')),
    rate,
    status
  }
}

function parseAssignmentInput(formData: FormData) {
  const jobId = Number(formData.get('jobId'))
  const cleanerId = Number(formData.get('cleanerId'))
  const serviceDate = requiredString(formData.get('serviceDate'), 'Service date is required')
  const status = (formData.get('status') as AssignmentStatus | null) ?? 'scheduled'

  if (Number.isNaN(jobId) || jobId <= 0) {
    throw new Error('Valid job is required')
  }

  if (Number.isNaN(cleanerId) || cleanerId <= 0) {
    throw new Error('Valid cleaner is required')
  }

  return {
    jobId,
    cleanerId,
    serviceDate,
    status,
    notes: optionalString(formData.get('notes'))
  }
}

function optionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function requiredString(value: FormDataEntryValue | null, message: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(message)
  }
  return value.trim()
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  const parsed = Number(trimmed)
  if (Number.isNaN(parsed)) {
    throw new Error('Rate must be a number')
  }
  return parsed
}

function resolveArea(intent: string): MutationArea {
  if (intent.includes('job')) return 'jobs'
  if (intent.includes('assignment')) return 'assignments'
  return 'cleaners'
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected error occurred.'
}
