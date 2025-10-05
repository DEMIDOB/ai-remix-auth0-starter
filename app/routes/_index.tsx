// app/routes/_index.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { NavBar } from '~/components/NavBar'
import { requireAuth } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  return json({ user })
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <section className="card space-y-4">
          <header className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900">You’re signed in</h2>
            <p className="text-sm text-slate-600">
              This starter keeps only the Auth0 authentication flow so you can extend it with your own features.
            </p>
          </header>

          <p className="text-sm text-slate-600">
            Start by editing <code>app/routes/_index.tsx</code> or add new routes to build out your application.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">User Details</h3>
            <dl className="space-y-1 text-sm text-slate-700">
              <div>
                <dt className="font-medium text-slate-500">Name</dt>
                <dd>{user.name ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Email</dt>
                <dd>{user.email ?? 'Not provided'}</dd>
              </div>
            </dl>
          </div>

          <div className="card space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next Steps</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
              <li>Add protected routes with <code>requireAuth</code> to gate content.</li>
              <li>Store extra profile data in your session or database.</li>
              <li>Customize the layout in <code>app/components/NavBar.tsx</code>.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
