import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { NavBar } from '~/components/NavBar'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }
  const access = await getUserAccess(user.email)
  if (access !== 'admin') return redirect('/no-access')
  return json({ user, access })
}

export default function DashboardPage() {
  const { user, access } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar user={user} title="Today View" access={access} />

      <div className="grid grid-cols-1 gap-4 p-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Welcome</h2>
        </div>
      </div>
    </div>
  )
}
