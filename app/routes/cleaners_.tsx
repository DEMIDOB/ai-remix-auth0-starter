import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { NavBar } from '~/components/NavBar'
import { getCleanersViewModel } from '~/services/CleanersHandler.server'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }

  const access = await getUserAccess(user.email)
  if (access !== 'admin') return redirect('/no-access')

  const { cleaners } = await getCleanersViewModel()

  return json({ user, access, cleaners })
}

export default function CleanersPage() {
  const { user, access, cleaners } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar user={user} title="Available Cleaners" access={access} />

      <main className="max-w-5xl mx-auto py-8 px-6">
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <header className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Team Roster</h2>
            <p className="text-sm text-slate-500 mt-1">
              These cleaners are ready to be scheduled for upcoming jobs.
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Hourly Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {cleaners.map((cleaner) => (
                  <tr key={cleaner.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{cleaner.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{cleaner.email ?? '—'}</div>
                      <div className="text-xs text-slate-400">{cleaner.phone ?? 'No phone on file'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cleaner.hourlyRate ? `$${cleaner.hourlyRate.toFixed(2)}/hr` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cleaner.notes ? (
                        <span>{cleaner.notes}</span>
                      ) : (
                        <span className="text-slate-400">No special notes</span>
                      )}
                    </td>
                  </tr>
                ))}

                {cleaners.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                      No cleaners found. Add cleaners to start scheduling jobs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
