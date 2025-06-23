// app/routes/no-access.tsx
import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'
import { NavBar } from '~/components/NavBar'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }
  const access = await getUserAccess(user.email)
  return json({ user })
}

export default function NoAccessPage() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <>
      <NavBar user={user} access="none" />
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-lg">You do not have access to this application.</p>
      </div>
    </>
  )
}
