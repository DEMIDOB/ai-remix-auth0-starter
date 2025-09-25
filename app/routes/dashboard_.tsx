import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { NavBar } from '~/components/NavBar'
import { fetchTestRows, countTestRows } from '~/db/testTable.server'
import { requireAuth } from '~/services/auth.server'
import { getUserAccess } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAuth(request)
  if (!user.email) {
    throw new Error('User email is missing')
  }
  const access = await getUserAccess(user.email)
  if (access !== 'admin') return redirect('/no-access')

  try {
    const [sampleRows, totalRows] = await Promise.all([fetchTestRows(2), countTestRows()])

    return json({
      user,
      access,
      dbStatus: {
        connected: true as const,
        rowsRead: sampleRows.length,
        totalRows,
        sampleRows,
        error: null as string | null
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'

    return json({
      user,
      access,
      dbStatus: {
        connected: false as const,
        rowsRead: 0,
        totalRows: 0,
        sampleRows: [] as Awaited<ReturnType<typeof fetchTestRows>>,
        error: message
      }
    })
  }
}

export default function DashboardPage() {
  const { user, access, dbStatus } = useLoaderData<typeof loader>()

  const welcomeMessage = dbStatus.connected
    ? `Welcome - database connected, ${dbStatus.rowsRead} records read.`
    : 'Welcome - database connection failed.'

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar user={user} title="Today View" access={access} />

      <div className="grid grid-cols-1 gap-4 p-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">{welcomeMessage}</h2>

          {dbStatus.connected ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Showing {dbStatus.rowsRead} of {dbStatus.totalRows} total rows from <code>test_table</code>.
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {dbStatus.sampleRows.map((row) => (
                  <li key={row.id}>
                    <span className="font-medium">{row.name}</span> — {row.description ?? 'No description'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-red-600">{dbStatus.error ?? 'Check that MySQL is running and accessible.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
