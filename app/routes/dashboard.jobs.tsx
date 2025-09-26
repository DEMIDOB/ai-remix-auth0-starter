import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { type ReactNode, useEffect, useState } from 'react'
import { handleCleaningDashboardMutation, loadJobs } from '~/services/cleaningDashboard.server'
import type { MutationResult } from '~/services/cleaningDashboard.server'
import type { Job } from '~/types/cleaning'
import { useDashboardContext } from './dashboard'

export const loader = async (_args: LoaderFunctionArgs) => {
  const { jobs } = await loadJobs()
  return json({ jobs })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const result = await handleCleaningDashboardMutation(formData)
  return json(result, { status: result.ok ? 200 : 400 })
}

export default function JobsRoute() {
  const { jobs } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>() as MutationResult | undefined
  const { meta } = useDashboardContext()
  const navigation = useNavigation()
  const [editingJobId, setEditingJobId] = useState<number | null>(null)

  const isSubmitting = navigation.state === 'submitting'
  const message = actionData?.area === 'jobs' ? actionData : null

  useEffect(() => {
    if (actionData?.ok && actionData.area === 'jobs') {
      setEditingJobId(null)
    }
  }, [actionData])

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">Jobs</h2>
        <p className="text-sm text-slate-500">Keep an eye on scheduled work and client details.</p>
      </header>

      {message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${message.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-rose-300 bg-rose-50 text-rose-700'}`}
        >
          {message.message}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Add New</h3>
        <JobForm statuses={meta.jobStatuses} disabled={isSubmitting} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Current</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                statuses={meta.jobStatuses}
                editing={editingJobId === job.id}
                onEdit={() => setEditingJobId(job.id)}
                onCancel={() => setEditingJobId(null)}
                disableActions={isSubmitting}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

type JobFormProps = {
  statuses: readonly string[]
  disabled?: boolean
}

function JobForm({ statuses, disabled }: JobFormProps) {
  return (
    <Form method="post" className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="intent" value="create-job" />
      <FormField label="Title" required>
        <input name="title" type="text" className="form-input" placeholder="Job title" required disabled={disabled} />
      </FormField>
      <FormField label="Client">
        <input name="clientName" type="text" className="form-input" placeholder="Client name" disabled={disabled} />
      </FormField>
      <FormField label="Location">
        <input name="location" type="text" className="form-input" placeholder="Address" disabled={disabled} />
      </FormField>
      <FormField label="Rate">
        <input name="rate" type="number" step="0.01" className="form-input" placeholder="150" disabled={disabled} />
      </FormField>
      <FormField label="Status">
        <select name="status" className="form-input" defaultValue={statuses[0]} disabled={disabled}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Description" fullWidth>
        <textarea name="description" className="form-input" rows={3} placeholder="Optional description" disabled={disabled} />
      </FormField>
      <div>
        <button type="submit" className="btn-primary" disabled={disabled}>
          Add Job
        </button>
      </div>
    </Form>
  )
}

type JobCardProps = {
  job: Job
  statuses: readonly string[]
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  disableActions?: boolean
}

function JobCard({ job, statuses, editing, onEdit, onCancel, disableActions }: JobCardProps) {
  if (editing) {
    return (
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-slate-900">Edit {job.title}</h4>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={disableActions}>
            Cancel
          </button>
        </div>
        <Form method="post" className="grid gap-3">
          <input type="hidden" name="intent" value="update-job" />
          <input type="hidden" name="id" value={job.id} />
          <input name="title" className="form-input" defaultValue={job.title} required disabled={disableActions} />
          <input name="clientName" className="form-input" defaultValue={job.clientName ?? ''} disabled={disableActions} />
          <input name="location" className="form-input" defaultValue={job.location ?? ''} disabled={disableActions} />
          <input name="rate" className="form-input" type="number" step="0.01" defaultValue={job.rate ?? ''} disabled={disableActions} />
          <select name="status" className="form-input" defaultValue={job.status} disabled={disableActions}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            className="form-input"
            rows={3}
            defaultValue={job.description ?? ''}
            disabled={disableActions}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={disableActions}>
              Save Changes
            </button>
          </div>
        </Form>
        <Form method="post" className="flex justify-end">
          <input type="hidden" name="intent" value="delete-job" />
          <input type="hidden" name="id" value={job.id} />
          <button
            type="submit"
            className="btn-danger"
            disabled={disableActions}
            onClick={(event) => {
              if (!confirm('Remove this job? Assignments linked to it will be removed.')) {
                event.preventDefault()
              }
            }}
          >
            Delete
          </button>
        </Form>
      </div>
    )
  }

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{job.title}</h4>
          <p className="text-sm text-slate-500 capitalize">{job.status}</p>
        </div>
        <button className="btn-secondary" type="button" onClick={onEdit} disabled={disableActions}>
          Edit
        </button>
      </div>
      <div className="space-y-1 text-sm text-slate-600">
        {job.clientName && <p>Client: {job.clientName}</p>}
        {job.location && <p>Location: {job.location}</p>}
        {job.rate !== null && <p>Rate: ${job.rate.toFixed(2)}</p>}
        {job.description && <p className="text-slate-500">{job.description}</p>}
      </div>
    </div>
  )
}

type FormFieldProps = {
  label: string
  required?: boolean
  fullWidth?: boolean
  children: ReactNode
}

function FormField({ label, required, fullWidth, children }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 text-sm text-slate-600 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <span className="font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-500 ml-1">*</span> : null}
      </span>
      {children}
    </div>
  )
}
