import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockSemanticProximity, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/brands/:id/analytics/semantic-proximity. Drives the Boost page
 *  AND the Overview ActionQueue's concept gaps. A short delay is intentional so
 *  the "Analyzing brand mentions..." state is actually visible (the copy promises
 *  30–60s) instead of flashing — making the action feel like real work. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  await new Promise((resolve) => setTimeout(resolve, 900))
  return NextResponse.json(mockSemanticProximity)
}
