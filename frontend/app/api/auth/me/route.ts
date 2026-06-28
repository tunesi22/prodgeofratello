import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockState, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/auth/me — the projects page reads the user (email + plan) here. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json(mockState.user)
}
