import { randomUUID } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { mockEnabled, mockState, proxyToBackend } from '@/lib/mock-backend'

/**
 * MOCK POST /api/auth/forgot-password. Mirrors the real endpoint's anti-
 * enumeration behavior (always generic 200), but since there is no email
 * provider in mock mode it instead logs the reset link to the server console
 * and returns it as `devResetUrl` so the flow is testable without email.
 */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)

  const { email } = await req.json().catch(() => ({}) as Record<string, string>)
  const generic = { ok: true, message: 'If an account exists for that email, a reset link is on its way.' }
  if (!email) {
    return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 })
  }

  if (String(email).toLowerCase().trim() === mockState.user.email) {
    const token = randomUUID()
    mockState.resetToken = token
    const devResetUrl = `/reset-password?token=${token}`
    console.log(`[MOCK] Password reset link for ${mockState.user.email}: ${devResetUrl}`)
    return NextResponse.json({ ...generic, devResetUrl })
  }

  return NextResponse.json(generic)
}
