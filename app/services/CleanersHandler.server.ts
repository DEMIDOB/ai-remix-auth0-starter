import { dataProvider } from '~/providers'

export async function getCleanersViewModel() {
  const cleaners = await dataProvider.cleaners.list()
  return { cleaners }
}
