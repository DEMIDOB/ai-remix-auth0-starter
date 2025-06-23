import { createCookieSessionStorage } from '@remix-run/node'

const sessionSecret = process.env.SESSION_SECRET || '8f2d7e6c22d948f9bb0123a4ab56f0eecff34e98c1bfa1a2b76a1fd91f3ac8a4'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
})

export const { getSession, commitSession, destroySession } = sessionStorage
