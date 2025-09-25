import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { format } from 'date-fns'
import { NavBar } from '~/components/NavBar'
import { scheduleAssignment, getAssignmentViewModel } from '~/services/JobAssignmentsHandler.server'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }

  const access = await getUserAccess(user.email)
  if (access !== 'admin') return redirect('/no-access')

  const { assignments, cleaners, jobs } = await getAssignmentViewModel()
  const url = new URL(request.url)
  const flash = url.searchParams.get('success')

  return json({ user, access, assignments, cleaners, jobs, flashMessage: flash })
}

type ActionData = {
  error?: string
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData()
  const jobId = Number(formData.get('jobId'))
  const cleanerId = Number(formData.get('cleanerId'))
  const scheduledDate = formData.get('scheduledDate')?.toString()
  const scheduledTime = formData.get('scheduledTime')?.toString()
  const notes = formData.get('notes')?.toString() ?? null

  if (!jobId || Number.isNaN(jobId)) {
    return json<ActionData>({ error: 'Select a job to assign.' }, { status: 400 })
  }

  if (!cleanerId || Number.isNaN(cleanerId)) {
    return json<ActionData>({ error: 'Pick a cleaner for the assignment.' }, { status: 400 })
  }

  if (!scheduledDate || !scheduledTime) {
    return json<ActionData>({ error: 'Select both a date and start time.' }, { status: 400 })
  }

  const isoString = `${scheduledDate}T${scheduledTime}`

  try {
    const result = await scheduleAssignment({
      jobId,
      cleanerId,
      scheduledStartISO: isoString,
      notes
    })

    const message = `${result.cleaner.name} scheduled for ${result.job.title} on ${format(
      result.record.scheduledStart,
      'MMMM d, yyyy h:mm a'
    )}`

    const params = new URLSearchParams({ success: message })
    return redirect(`/assignments?${params.toString()}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to schedule assignment.'
    return json<ActionData>({ error: message }, { status: 400 })
  }
}

export default function AssignmentsPage() {
  const { user, access, assignments, cleaners, jobs, flashMessage } = useLoaderData<typeof loader>()
  const actionData = useActionData<ActionData>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar user={user} title="Schedule Assignments" access={access} />

      <main className="max-w-6xl mx-auto py-8 px-6 space-y-6">
        <section className="bg-white shadow rounded-lg p-6">
          <header className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Assign a Job</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a job, choose a cleaner, and set the start date and time.
            </p>
          </header>

          {flashMessage && (
            <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {flashMessage}
            </div>
          )}

          {actionData?.error && (
            <div className="mb-4 rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="grid gap-4 md:grid-cols-4 md:items-end">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              Job
              <select
                name="jobId"
                className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                required
              >
                <option value="">Select job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} • {job.durationMinutes} mins
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-600">
              Cleaner
              <select
                name="cleanerId"
                className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                required
              >
                <option value="">Select cleaner</option>
                {cleaners.map((cleaner) => (
                  <option key={cleaner.id} value={cleaner.id}>
                    {cleaner.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-600">
              Date
              <input
                type="date"
                name="scheduledDate"
                className="mt-1 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-600">
              Start Time
              <input
                type="time"
                name="scheduledTime"
                className="mt-1 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                required
              />
            </label>

            <label className="md:col-span-4 flex flex-col text-sm font-medium text-slate-600">
              Notes
              <textarea
                name="notes"
                rows={2}
                className="mt-1 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
                placeholder="Optional instructions for the cleaner"
              />
            </label>

            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling…' : 'Schedule Assignment'}
              </button>
            </div>
          </Form>
        </section>

        <section className="bg-white shadow rounded-lg">
          <header className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Upcoming Assignments</h2>
            <p className="text-sm text-slate-500 mt-1">Track who is going where and when.</p>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    When
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Cleaner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Job
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {assignments.map((assignment) => {
                  const start = new Date(assignment.scheduledStart)
                  const whenLabel = format(start, 'MMM d, yyyy • h:mm a')
                  const statusBadgeClasses =
                    assignment.status === 'scheduled'
                      ? 'bg-indigo-100 text-indigo-700'
                      : assignment.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'

                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-600">{whenLabel}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-800">{assignment.cleanerName}</div>
                        <div className="text-xs text-slate-400">{assignment.cleanerEmail ?? 'No email on file'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-800">{assignment.jobTitle}</div>
                        <div className="text-xs text-slate-400">{assignment.jobLocation ?? 'Location TBD'}</div>
                        <div className="text-xs text-slate-400">{assignment.jobDurationMinutes} mins</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {assignment.notes ?? <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  )
                })}

                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                      No assignments scheduled yet. Use the form above to get started.
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
