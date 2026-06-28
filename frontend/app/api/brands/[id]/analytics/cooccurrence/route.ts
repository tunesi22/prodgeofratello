import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockCooccurrence, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/brands/:id/analytics/cooccurrence — competitor concept
 *  comparison for the Boost page. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json(mockCooccurrence)
}
