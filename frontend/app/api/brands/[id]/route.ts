import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockBrands, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET/DELETE /api/brands/:id — single project (used by the project
 *  Overview page) and project deletion from the projects list. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  const { id } = await ctx.params
  return NextResponse.json({ ...mockBrands[0], _id: id })
}

export async function DELETE(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()
  return NextResponse.json({ ok: true })
}
