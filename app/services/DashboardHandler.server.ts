import { compareAsc, isAfter } from 'date-fns'
import { dataProvider } from '~/providers'

export async function getDashboardSummary() {
  const [assignments, cleaners, jobs] = await Promise.all([
    dataProvider.assignments.listWithRelations(),
    dataProvider.cleaners.list(),
    dataProvider.jobs.list()
  ])

  const now = new Date()
  const upcoming = assignments
    .filter((assignment) => isAfter(assignment.scheduledStart, now))
    .sort((a, b) => compareAsc(a.scheduledStart, b.scheduledStart))
    .slice(0, 5)

  return {
    stats: {
      totalCleaners: cleaners.length,
      totalJobs: jobs.length,
      scheduledAssignments: assignments.length
    },
    upcomingAssignments: upcoming
  }
}
