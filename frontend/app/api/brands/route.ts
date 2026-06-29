import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockBrands, mockEnabled, mockState, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/**
 * MOCK /api/brands. GET returns the seeded brand list (so the post-login
 * redirect lands on /brands); POST echoes back a fabricated created brand.
 * Inert unless MOCK_AUTH=1. Note: nested routes like /api/brands/:id/prompts
 * are NOT mocked here and still proxy to the backend.
 */
export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json(mockBrands)
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()

  const body = await req.json().catch(() => ({}) as Record<string, unknown>)
  const now = new Date().toISOString()
  return NextResponse.json(
    {
      _id: 'mock-brand-new',
      userId: mockState.user._id,
      name: (body.name as string) || 'New Brand',
      website: (body.website as string) || '',
      industry: (body.industry as string) || '',
      competitors: (body.competitors as unknown[]) || [],
      createdAt: now,
      updatedAt: now,
    },
    { status: 201 },
  )
}
