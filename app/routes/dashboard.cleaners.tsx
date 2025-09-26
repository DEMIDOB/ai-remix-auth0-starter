import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { type ReactNode, useEffect, useState } from 'react'
import { handleCleaningDashboardMutation, loadCleaners } from '~/services/cleaningDashboard.server'
import type { MutationResult } from '~/services/cleaningDashboard.server'
import type { Cleaner } from '~/types/cleaning'
import { useDashboardContext } from './dashboard'

export const loader = async (_args: LoaderFunctionArgs) => {
  const { cleaners } = await loadCleaners()
  return json({ cleaners })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const result = await handleCleaningDashboardMutation(formData)
  return json(result, { status: result.ok ? 200 : 400 })
}

export default function CleanersRoute() {
  const { cleaners } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>() as MutationResult | undefined
  const { meta } = useDashboardContext()
  const navigation = useNavigation()
  const [editingCleanerId, setEditingCleanerId] = useState<number | null>(null)

  const isSubmitting = navigation.state === 'submitting'
  const message = actionData?.area === 'cleaners' ? actionData : null

  useEffect(() => {
    if (actionData?.ok && actionData.area === 'cleaners') {
      setEditingCleanerId(null)
    }
  }, [actionData])

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">Cleaners</h2>
        <p className="text-sm text-slate-500">Manage your cleaning team. Track contact details and availability.</p>
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
        <CleanerForm statuses={meta.cleanerStatuses} disabled={isSubmitting} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Current</h3>
        {cleaners.length === 0 ? (
          <p className="text-sm text-slate-500">No cleaners yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cleaners.map((cleaner) => (
              <CleanerCard
                key={cleaner.id}
                cleaner={cleaner}
                statuses={meta.cleanerStatuses}
                editing={editingCleanerId === cleaner.id}
                onEdit={() => setEditingCleanerId(cleaner.id)}
                onCancel={() => setEditingCleanerId(null)}
                disableActions={isSubmitting}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

type CleanerFormProps = {
  statuses: readonly string[]
  disabled?: boolean
}

function CleanerForm({ statuses, disabled }: CleanerFormProps) {
  return (
    <Form method="post" className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="intent" value="create-cleaner" />
      <FormField label="Name" required>
        <input
          name="name"
          type="text"
          className="form-input"
          placeholder="Full name"
          required
          disabled={disabled}
        />
      </FormField>
      <FormField label="Email">
        <input name="email" type="email" className="form-input" placeholder="name@example.com" disabled={disabled} />
      </FormField>
      <FormField label="Phone">
        <input name="phone" type="text" className="form-input" placeholder="555-0100" disabled={disabled} />
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
      <FormField label="Notes" fullWidth>
        <textarea name="notes" className="form-input" rows={3} placeholder="Optional notes" disabled={disabled} />
      </FormField>
      <div>
        <button type="submit" className="btn-primary" disabled={disabled}>
          Add Cleaner
        </button>
      </div>
    </Form>
  )
}

type CleanerCardProps = {
  cleaner: Cleaner
  statuses: readonly string[]
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  disableActions?: boolean
}

function CleanerCard({ cleaner, statuses, editing, onEdit, onCancel, disableActions }: CleanerCardProps) {
  if (editing) {
    return (
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-slate-900">Edit {cleaner.name}</h4>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={disableActions}>
            Cancel
          </button>
        </div>
        <Form method="post" className="grid gap-3">
          <input type="hidden" name="intent" value="update-cleaner" />
          <input type="hidden" name="id" value={cleaner.id} />
          <input name="name" className="form-input" defaultValue={cleaner.name} required disabled={disableActions} />
          <input name="email" className="form-input" defaultValue={cleaner.email ?? ''} disabled={disableActions} />
          <input name="phone" className="form-input" defaultValue={cleaner.phone ?? ''} disabled={disableActions} />
          <select name="status" className="form-input" defaultValue={cleaner.status} disabled={disableActions}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            className="form-input"
            rows={3}
            defaultValue={cleaner.notes ?? ''}
            disabled={disableActions}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={disableActions}>
              Save Changes
            </button>
          </div>
        </Form>
        <Form method="post" className="flex justify-end">
          <input type="hidden" name="intent" value="delete-cleaner" />
          <input type="hidden" name="id" value={cleaner.id} />
          <button
            type="submit"
            className="btn-danger"
            disabled={disableActions}
            onClick={(event) => {
              if (!confirm('Remove this cleaner? This also removes related assignments.')) {
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
          <h4 className="text-lg font-semibold text-slate-900">{cleaner.name}</h4>
          <p className="text-sm text-slate-500 capitalize">{cleaner.status}</p>
        </div>
        <button className="btn-secondary" type="button" onClick={onEdit} disabled={disableActions}>
          Edit
        </button>
      </div>
      <div className="space-y-1 text-sm text-slate-600">
        {cleaner.email && <p>Email: {cleaner.email}</p>}
        {cleaner.phone && <p>Phone: {cleaner.phone}</p>}
        {cleaner.notes && <p className="text-slate-500">{cleaner.notes}</p>}
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
