import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockScans, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET/POST /api/brands/:id/scans — scan history and "Run Scan". GET returns
 *  one recently-completed scan so the Overview "Scan History" shows a finished
 *  run (never a stuck "running" row). The live in-progress banner is simulated
 *  client-side by ScanProgressProvider. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ scans: mockScans })
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ message: 'Mock scan enqueued (no-op).', jobsEnqueued: 0 })
}
