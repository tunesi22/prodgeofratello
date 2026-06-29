import { NextResponse, type NextRequest } from 'next/server'
import { mockEnabled, mockState, proxyToBackend, setSession } from '@/lib/mock-backend'

/**
 * MOCK POST /api/auth/login. Validates against the single seeded mock account
 * and sets the `geo_token` cookie. Inert unless MOCK_AUTH=1 — otherwise it
 * proxies to the real backend, so the real /api/auth/login keeps working.
 */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)

  const { email, password } = await req.json().catch(() => ({}) as Record<string, string>)
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 })
  }

  const matches =
    String(email).toLowerCase().trim() === mockState.user.email && password === mockState.password
  if (!matches) {
    return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 })
  }

  return setSession(NextResponse.json({ ok: true }))
}
