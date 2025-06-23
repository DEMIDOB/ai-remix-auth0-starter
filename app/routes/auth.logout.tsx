import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { sessionStorage } from '~/services/session.server'

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!
const AUTH0_LOGOUT_URL = `https://${AUTH0_DOMAIN}/v2/logout`
const RETURN_TO = process.env.AUTH0_POST_LOGOUT_REDIRECT_URI ?? 'http://localhost:3000/auth/login' // Change this for production

// Shared function to generate the redirect
function getAuth0LogoutUrl() {
  const params = new URLSearchParams({
    returnTo: RETURN_TO,
    client_id: process.env.AUTH0_CLIENT_ID!
  })
  return `${AUTH0_LOGOUT_URL}?${params.toString()}`
}

// Handle POST logout
export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  return redirect(getAuth0LogoutUrl(), {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session)
    }
  })
}

// Handle GET logout
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  return redirect(getAuth0LogoutUrl(), {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session)
    }
  })
}
