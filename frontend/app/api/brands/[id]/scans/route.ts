import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET/POST /api/brands/:id/scans — scan history and "Run Scan". The mock
 *  reports no in-flight scans and a no-op enqueue so the Overview page doesn't
 *  error; it does not simulate a running scan. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ scans: [] })
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ message: 'Mock scan enqueued (no-op).', jobsEnqueued: 0 })
}
