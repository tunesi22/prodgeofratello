import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK POST /api/brands/:id/scan — the Overview "Run Scan" action. Returns a
 *  believable `jobsEnqueued` (active prompts × models × 5 runs) so the global
 *  scan banner has a real total to count toward; the banner simulates progress
 *  client-side since the mock does no actual work. */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  // 3 mock prompts × 4 models × 5 runs each.
  const jobsEnqueued = 3 * 4 * 5
  return NextResponse.json({ message: 'Mock scan enqueued.', jobsEnqueued })
}
