import { env } from '~/env.server'

export type UserAccess = 'admin' | 'cleaner' | 'none'

export async function getUserAccess(email: string): Promise<UserAccess> {
  const superAdminEmail = env.SUPER_ADMIN_EMAIL || 'admin@example.com'
  if (email === superAdminEmail) return 'admin'
  return 'none'
}

export async function getLandingPage(email: string): Promise<string> {
  const access = await getUserAccess(email)
  if (access === 'admin') return '/dashboard'
  return '/no-access'
}

export async function isAdmin(email: string): Promise<boolean> {
  const access = await getUserAccess(email)
  return access === 'admin'
}

export async function isUser(email: string): Promise<boolean> {
  const access = await getUserAccess(email)
  return access !== 'none'
}

export async function isCleaner(email: string): Promise<boolean> {
  const access = await getUserAccess(email)
  return access === 'cleaner'
}
