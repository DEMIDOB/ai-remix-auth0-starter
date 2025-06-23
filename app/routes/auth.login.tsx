import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { authenticator, sessionStorage } from '~/services/auth.server'
import { getLandingPage } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')
  if (user) return redirect('/dashboard')
  return null
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const user = await authenticator.authenticate('auth0', request)
    const session = await sessionStorage.getSession(request.headers.get('Cookie'))
    session.set('user', user)

    if (!user.email) throw new Error('User email is missing')
    const url = await getLandingPage(user.email)

    return redirect(url, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session)
      }
    })
  } catch (error) {
    if (error instanceof Response) throw error
    console.error('Authentication error:', error)
    throw error
  }
}
export default function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-[#2C3E50] text-white py-12 text-center">
        <h1 className="text-4xl font-bold">Sample Application</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-5">Welcome</h2>
          <div className="space-y-3">
            <Form method="post" className="space-y-3">
              <button
                type="submit"
                className="w-full bg-[#2C3E50] hover:bg-[#1F2D3A] text-white py-4 rounded-md text-base"
                name="action"
                value="login"
              >
                Login / Sign Up
              </button>
            </Form>
          </div>
        </div>
      </main>
    </div>
  )
}
