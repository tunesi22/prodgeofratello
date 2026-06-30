import { type NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/mock-backend'

export async function GET(req: NextRequest): Promise<Response> {
  return proxyToBackend(req)
}
