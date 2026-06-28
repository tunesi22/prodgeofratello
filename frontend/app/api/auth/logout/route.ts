import { NextResponse, type NextRequest } from 'next/server'
import { clearSession, mockEnabled, proxyToBackend } from '@/lib/mock-backend'

/** MOCK POST /api/auth/logout — clears the session cookie. See mock-backend.ts. */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  return clearSession(NextResponse.json({ ok: true }))
}
