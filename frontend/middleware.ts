import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/fratello(.*)',
  '/api/waitlist',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
      const proto = req.headers.get('x-forwarded-proto') || 'https'
      const signInUrl = new URL(`${proto}://${host}/sign-in`)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
