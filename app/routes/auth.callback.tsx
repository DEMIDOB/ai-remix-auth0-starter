import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { authenticator, sessionStorage } from '~/services/auth.server'
import { getLandingPage } from '~/utils/authAccess'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Handle the callback from Auth0
    const user = await authenticator.authenticate('auth0', request)

    // Store user in session
    const session = await sessionStorage.getSession(request.headers.get('Cookie'))
    session.set('user', user)
    if (!user.email) {
      throw new Error('User email is missing')
    }
    const url = await getLandingPage(user.email)
    return redirect(url, {
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
