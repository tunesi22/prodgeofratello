import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockArticles, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/brands/:id/articles — generated articles list. Consumers read
 *  `articles.length`. Article generation/export sub-routes are not mocked. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ articles: mockArticles })
}
