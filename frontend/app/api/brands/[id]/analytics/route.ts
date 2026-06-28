import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockAnalytics, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/brands/:id/analytics — the headline data for the project
 *  Overview page (mention rate, by-model, sentiment, trends, gaps, share of
 *  voice). Deeper analytics sub-routes (cooccurrence, gaps, semantic-proximity)
 *  are NOT mocked and still proxy to the backend. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json(mockAnalytics)
}
