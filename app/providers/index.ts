import * as cleaningProvider from './CleaningProvider.server'

export { cleaningProvider }

export const dataProvider = {
  cleaning: cleaningProvider
} as const
