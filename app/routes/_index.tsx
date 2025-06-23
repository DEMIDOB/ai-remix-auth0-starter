// app/routes/_index.tsx
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireAuth } from '~/services/auth.server'
import { getLandingPage } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }

  const url = await getLandingPage(user.email)
  return redirect(url)
}

export default function Index() {
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  )
}
