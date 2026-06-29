import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockPrompts, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET/POST /api/brands/:id/prompts. GET returns the prompt list with a
 *  `count` (consumers read either `count` or `prompts.length`). POST (seed /
 *  regenerate) just echoes the seeded prompts back. */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ count: mockPrompts.length, prompts: mockPrompts })
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ count: mockPrompts.length, prompts: mockPrompts })
}
