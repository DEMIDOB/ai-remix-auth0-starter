import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { authenticator, sessionStorage } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Handle the callback from Auth0
    const user = await authenticator.authenticate('auth0', request)

    // Store user in session
    const session = await sessionStorage.getSession(request.headers.get('Cookie'))
    session.set('user', user)
    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session)
      }
    })
  } catch (error) {
    // Handle authentication failures
    console.error('Auth callback error:', error)
    return redirect('/auth/login')
  }
}
