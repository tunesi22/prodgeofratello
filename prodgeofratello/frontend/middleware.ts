import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC = ['/', '/sign-in', '/fratello', '/api/auth', '/api/waitlist', '/sitemap.xml', '/robots.txt']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (!req.cookies.get('geo_token')) {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost'
    const proto = req.headers.get('x-forwarded-proto') || 'https'
    return NextResponse.redirect(new URL('/sign-in', `${proto}://${host}`))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
