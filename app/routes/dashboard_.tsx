import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'
import { NavBar } from '~/components/NavBar'
import { getDashboardSummary } from '~/services/DashboardHandler.server'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }

  const access = await getUserAccess(user.email)
  if (access !== 'admin') return redirect('/no-access')

  const summary = await getDashboardSummary()

  return json({ user, access, summary })
}

export default function DashboardPage() {
  const { user, access, summary } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar user={user} title="Cleaning Dashboard" access={access} />

      <main className="max-w-6xl mx-auto py-8 px-6 space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <span className="text-sm font-semibold uppercase text-slate-500">Cleaners</span>
            <p className="mt-2 text-3xl font-bold text-slate-800">{summary.stats.totalCleaners}</p>
            <p className="mt-1 text-sm text-slate-500">Team members ready for assignments.</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <span className="text-sm font-semibold uppercase text-slate-500">Jobs</span>
            <p className="mt-2 text-3xl font-bold text-slate-800">{summary.stats.totalJobs}</p>
            <p className="mt-1 text-sm text-slate-500">Open jobs awaiting scheduling.</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow sm:col-span-2 lg:col-span-1">
            <span className="text-sm font-semibold uppercase text-slate-500">Assignments</span>
            <p className="mt-2 text-3xl font-bold text-slate-800">{summary.stats.scheduledAssignments}</p>
            <p className="mt-1 text-sm text-slate-500">Scheduled jobs on the calendar.</p>
          </div>
        </section>

        <section className="bg-white shadow rounded-lg">
          <header className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Next Up</h2>
            <p className="text-sm text-slate-500 mt-1">Upcoming assignments for the cleaning team.</p>
          </header>

          <div className="divide-y divide-slate-200">
            {summary.upcomingAssignments.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No upcoming assignments. Schedule jobs to see them here.
              </div>
            )}

            {summary.upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="px-6 py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{assignment.jobTitle}</p>
                  <p className="text-xs text-slate-500">
                    {assignment.jobLocation ?? 'Location TBD'} • {assignment.jobDurationMinutes} mins
                  </p>
                </div>

                <div className="text-sm text-slate-600">
                  <p>{assignment.cleanerName}</p>
                  <p className="text-xs text-slate-400">{assignment.cleanerEmail ?? 'No email on file'}</p>
                </div>

                <div className="text-sm font-medium text-slate-700">
                  {format(new Date(assignment.scheduledStart), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
