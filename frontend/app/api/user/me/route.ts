import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockState, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/user/me — the current user, used by the Sidebar / AppShell. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json(mockState.user)
}
