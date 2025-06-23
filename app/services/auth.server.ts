// app/services/auth.server.ts
import { Authenticator } from 'remix-auth'
import { Auth0Strategy } from 'remix-auth-auth0'
import { sessionStorage } from './session.server'
import { redirect } from '@remix-run/node'

export { sessionStorage }

// Define the shape for the user data you'll store in session
interface User {
  id: string
  name?: string
  email?: string
  // Add other fields as needed
}

// Create authenticator instance (no parameters)
export const authenticator = new Authenticator<User>()

const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'

const auth0Strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    redirectURI: `${baseUrl}/auth/callback`,
    scopes: ['openid', 'profile', 'email']
  },
  async ({ tokens, request }) => {
    // Get user info from Auth0 using the access token
    const userInfoResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`
      }
    })

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Auth0')
    }

    const userInfo = await userInfoResponse.json()

    // Map Auth0 user info to your User interface
    return {
      id: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email
    }
  }
)

// Register the strategy
authenticator.use(auth0Strategy, 'auth0')

// Helper function to require authentication
export async function requireAuth(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')

  if (!user) {
    throw redirect('/auth/login')
  }

  return user as User
}
