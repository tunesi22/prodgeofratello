import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { langFromPathname, delocalizePath } from '@/lib/marketing/locale'
import { renderHomeMarkdown, renderAboutMarkdown, renderBlogListMarkdown, renderBlogPostMarkdown } from '@/lib/marketing/markdown'

const PUBLIC = [
  '/',
  '/about',
  '/blog',
  '/en',
  '/en/about',
  '/en/blog',
  '/sign-in',
  '/forgot-password',
  '/reset-password',
  '/fratello',
  '/api/auth',
  '/api/waitlist',
  '/api/demo',
  '/sitemap.xml',
  '/robots.txt',
]

// Exact match, or a real sub-path of a public prefix — NOT a bare startsWith,
// which would make the '/' entry swallow every path on the site (the bug this
// replaces: the geo_token check below never ran because '/' matched everything).
function isPublic(pathname: string): boolean {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

// Markdown content negotiation (Cloudflare "Markdown for Agents" / RFC-style
// Accept negotiation): AI agents that send `Accept: text/markdown` get a
// clean Markdown rendering of marketing/blog pages instead of the full HTML
// document. Only covers the public content surface — app/dashboard routes
// have no equivalent markdown rendering and fall through to normal HTML.
function resolveMarkdown(pathname: string): string | null {
  const lang = langFromPathname(pathname)
  const logical = delocalizePath(pathname)

  if (logical === '/') return renderHomeMarkdown(lang)
  if (logical === '/about') return renderAboutMarkdown(lang)
  if (logical === '/blog') return renderBlogListMarkdown(lang)
  if (logical.startsWith('/blog/')) return renderBlogPostMarkdown(lang, logical.slice('/blog/'.length))
  return null
}

function wantsMarkdown(req: NextRequest): boolean {
  return (req.headers.get('accept') || '').includes('text/markdown')
}

function markdownResponse(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(Math.ceil(body.length / 4)),
    },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost'
  const proto = req.headers.get('x-forwarded-proto') || 'https'

  // Sign-up is closed — we onboard users from our own list. Permanently
  // redirect any /sign-up request to /sign-in so the route is never reachable.
  if (pathname === '/sign-up' || pathname.startsWith('/sign-up/')) {
    return NextResponse.redirect(new URL('/sign-in', `${proto}://${host}`), 308)
  }

  if (req.method === 'GET' && wantsMarkdown(req)) {
    const markdown = resolveMarkdown(pathname)
    if (markdown) return markdownResponse(markdown)
  }

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  if (!req.cookies.get('geo_token')) {
    return NextResponse.redirect(new URL('/sign-in', `${proto}://${host}`))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
