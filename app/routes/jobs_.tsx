import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { NavBar } from '~/components/NavBar'
import { getJobsViewModel } from '~/services/JobsHandler.server'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }

  const access = await getUserAccess(user.email)
  if (access !== 'admin') return redirect('/no-access')

  const { jobs } = await getJobsViewModel()

  return json({ user, access, jobs })
}

export default function JobsPage() {
  const { user, access, jobs } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar user={user} title="Available Jobs" access={access} />

      <main className="max-w-5xl mx-auto py-8 px-6">
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <header className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Job Catalog</h2>
            <p className="text-sm text-slate-500 mt-1">
              Review open jobs and keep track of duration and locations.
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Job
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      <div>{job.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{job.location ?? 'Location TBD'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {job.description ? job.description : <span className="text-slate-400">No description provided</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{job.durationMinutes} mins</td>
                  </tr>
                ))}

                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400">
                      No jobs found. Add new jobs to begin scheduling work.
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
