import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockGeoScore, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK POST /api/brands/:id/articles/tools/geo-score — on-page GEO audit. The
 *  Overview ActionQueue turns failing checks into prioritized "Fix on-page"
 *  actions; the GEO Score tool reads the same shape. */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json(mockGeoScore)
}
