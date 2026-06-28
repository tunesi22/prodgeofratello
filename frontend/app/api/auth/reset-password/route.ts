import { NextResponse, type NextRequest } from 'next/server'
import { mockEnabled, mockState, proxyToBackend } from '@/lib/mock-backend'

/**
 * MOCK POST /api/auth/reset-password. Accepts the token issued by the mock
 * forgot-password route, updates the in-memory password, and burns the token
 * (single use), matching the real endpoint's behavior. See mock-backend.ts.
 */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)

  const { token, password } = await req.json().catch(() => ({}) as Record<string, string>)
  if (!token || !password) {
    return NextResponse.json({ error: 'Token dan password baru wajib diisi.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 })
  }
  if (!mockState.resetToken || token !== mockState.resetToken) {
    return NextResponse.json({ error: 'Tautan reset tidak valid atau sudah kedaluwarsa.' }, { status: 400 })
  }

  mockState.password = password
  mockState.resetToken = null
  return NextResponse.json({ ok: true })
}
