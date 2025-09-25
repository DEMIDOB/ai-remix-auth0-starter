import { dataProvider } from '~/providers'

export async function getJobsViewModel() {
  const jobs = await dataProvider.jobs.list()
  return { jobs }
}
