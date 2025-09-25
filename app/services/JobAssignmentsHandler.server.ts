import { addMinutes, isBefore } from 'date-fns'
import { dataProvider } from '~/providers'

export type ScheduleAssignmentPayload = {
  jobId: number
  cleanerId: number
  scheduledStartISO: string
  notes?: string | null
}

export async function getAssignmentViewModel() {
  const [assignments, cleaners, jobs] = await Promise.all([
    dataProvider.assignments.listWithRelations(),
    dataProvider.cleaners.list(),
    dataProvider.jobs.list()
  ])

  return { assignments, cleaners, jobs }
}

export async function scheduleAssignment(payload: ScheduleAssignmentPayload) {
  const { scheduledStartISO, jobId, cleanerId } = payload
  const scheduledStart = new Date(scheduledStartISO)

  if (Number.isNaN(scheduledStart.getTime())) {
    throw new Error('Please provide a valid assignment date and time.')
  }

  if (isBefore(scheduledStart, new Date())) {
    throw new Error('Assignments cannot be scheduled in the past.')
  }

  const [job, cleaner] = await Promise.all([
    dataProvider.jobs.getById(jobId),
    dataProvider.cleaners.getById(cleanerId)
  ])

  if (!job) {
    throw new Error('Selected job was not found.')
  }

  if (!cleaner) {
    throw new Error('Selected cleaner was not found.')
  }

  const existing = await dataProvider.assignments.findCleanerAssignmentsAround(cleanerId, scheduledStart, 30)
  if (existing.length > 0) {
    throw new Error('This cleaner already has an assignment near that time.')
  }

  try {
    const record = await dataProvider.assignments.create({
      jobId,
      cleanerId,
      scheduledStart,
      notes: payload.notes ?? null
    })

    const withRelations = {
      record,
      job,
      cleaner,
      scheduledEnd: addMinutes(record.scheduledStart, job.durationMinutes)
    }

    return withRelations
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String((error as { code?: unknown }).code)
      if (code === 'ER_DUP_ENTRY') {
        throw new Error('This cleaner is already booked at that exact time.')
      }
    }

    throw error
  }
}
