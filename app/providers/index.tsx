import { assignmentsProvider } from './AssignmentsProvider.server'
import { cleanersProvider } from './CleanersProvider.server'
import { jobsProvider } from './JobsProvider.server'

export const dataProvider = {
  cleaners: cleanersProvider,
  jobs: jobsProvider,
  assignments: assignmentsProvider
}

export * from './AssignmentsProvider.server'
export * from './CleanersProvider.server'
export * from './JobsProvider.server'
