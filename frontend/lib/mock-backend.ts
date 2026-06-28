import { NextResponse, type NextRequest } from 'next/server'

/**
 * Local-only mock of the Express backend, used so the frontend auth flow can run
 * with NO real backend on :4000. Enabled by `MOCK_AUTH=1` (see .env.local).
 *
 * Every mock Route Handler under /api guards on `mockEnabled()` first and, when
 * the flag is OFF, forwards the request to the real backend via
 * `proxyToBackend()`. That means these files are inert in production / for anyone
 * without the flag set — they reproduce the normal dev proxy-to-:4000 behavior.
 *
 * State lives in-memory and resets when the dev server restarts — that is fine
 * for a mock. Nothing here ever touches MongoDB.
 */

export const SESSION_COOKIE = 'geo_token'

export function mockEnabled(): boolean {
  return process.env.MOCK_AUTH === '1'
}

// The single seeded account. `password` and `resetToken` are mutable so the
// reset-password flow is demonstrable end-to-end within a session.
//
// Backed by globalThis: in Next dev each route file can get its own module
// instance, so a plain module-level object would NOT be shared between
// /forgot-password and /reset-password. Pinning it to globalThis makes every
// route see the same mutable state.
interface MockState {
  user: {
    _id: string
    email: string
    name: string
    plan: 'starter' | 'pro' | 'agency'
    isAdmin: boolean
    alertThreshold: number
    alertEmail: boolean
    alertWhatsApp: boolean
    createdAt: string
    updatedAt: string
  }
  password: string
  resetToken: string | null
}

const globalForMock = globalThis as unknown as { __fratelloMockState?: MockState }

export const mockState: MockState =
  globalForMock.__fratelloMockState ??
  (globalForMock.__fratelloMockState = {
    user: {
      _id: 'mock-user-1',
      email: 'dev.nineten@gmail.com',
      name: 'Dev User',
      plan: 'pro',
      isAdmin: true,
      alertThreshold: 20,
      alertEmail: true,
      alertWhatsApp: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-28T00:00:00.000Z',
    },
    password: 'dev123456',
    resetToken: null,
  })

export const mockBrands = [
  {
    _id: 'mock-brand-1',
    userId: 'mock-user-1',
    name: 'ArenaGo',
    website: 'https://arenago.id',
    industry: 'Sports Tech',
    competitors: ['Ayo Indonesia', 'Rebel Padel'],
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z',
  },
]

/** Realistic analytics payload matching the real `Analytics` shape in
 *  lib/analytics.ts, so the project Overview page renders with believable data. */
export const mockAnalytics = {
  overall: { totalQueries: 120, mentionCount: 68, mentionRate: 56.7 },
  byModel: [
    { model: 'openai', totalQueries: 30, mentionCount: 21, mentionRate: 70 },
    { model: 'perplexity', totalQueries: 30, mentionCount: 18, mentionRate: 60 },
    { model: 'gemini', totalQueries: 30, mentionCount: 15, mentionRate: 50 },
    { model: 'anthropic', totalQueries: 30, mentionCount: 14, mentionRate: 46.7 },
  ],
  bestModel: 'openai',
  worstModel: 'anthropic',
  sentiment: {
    openai: { positive: 14, neutral: 5, negative: 2 },
    perplexity: { positive: 11, neutral: 5, negative: 2 },
    gemini: { positive: 9, neutral: 4, negative: 2 },
    anthropic: { positive: 8, neutral: 4, negative: 2 },
  },
  trends: [
    { label: 'W21', mentionRate: 41, total: 120, mentioned: 49, week: 21, year: 2026 },
    { label: 'W22', mentionRate: 46, total: 120, mentioned: 55, week: 22, year: 2026 },
    { label: 'W23', mentionRate: 52, total: 120, mentioned: 62, week: 23, year: 2026 },
    { label: 'W24', mentionRate: 49, total: 120, mentioned: 59, week: 24, year: 2026 },
    { label: 'W25', mentionRate: 56.7, total: 120, mentioned: 68, week: 25, year: 2026 },
  ],
  gaps: [
    { promptId: 'mock-p1', text: 'best padel app in Jakarta', category: 'discovery', mentionRate: 20, total: 20 },
    { promptId: 'mock-p2', text: 'how to book a futsal court online', category: 'comparison', mentionRate: 35, total: 20 },
    { promptId: 'mock-p3', text: 'cheapest sports venue booking Indonesia', category: 'recommendation', mentionRate: 40, total: 20 },
  ],
  shareOfVoice: [
    { brandId: 'mock-brand-1', name: 'ArenaGo', mentionCount: 68, mentionRate: 56.7, shareOfVoice: 44 },
    { brandId: 'mock-c1', name: 'Ayo Indonesia', mentionCount: 52, mentionRate: 43.3, shareOfVoice: 34 },
    { brandId: 'mock-c2', name: 'Rebel Padel', mentionCount: 34, mentionRate: 28.3, shareOfVoice: 22 },
  ],
  // Per-brand weekly mention-rate trends powering the Competitor Comparison
  // chart + next-period projection. Aligned to the same weeks as `trends`.
  competitorTrends: [
    {
      brandId: 'mock-brand-1', name: 'ArenaGo', isMain: true,
      points: [
        { label: 'W21', week: 21, year: 2026, mentionRate: 41 },
        { label: 'W22', week: 22, year: 2026, mentionRate: 46 },
        { label: 'W23', week: 23, year: 2026, mentionRate: 52 },
        { label: 'W24', week: 24, year: 2026, mentionRate: 49 },
        { label: 'W25', week: 25, year: 2026, mentionRate: 57 },
      ],
    },
    {
      brandId: 'mock-c1', name: 'Ayo Indonesia', isMain: false,
      points: [
        { label: 'W21', week: 21, year: 2026, mentionRate: 39 },
        { label: 'W22', week: 22, year: 2026, mentionRate: 41 },
        { label: 'W23', week: 23, year: 2026, mentionRate: 44 },
        { label: 'W24', week: 24, year: 2026, mentionRate: 43 },
        { label: 'W25', week: 25, year: 2026, mentionRate: 43 },
      ],
    },
    {
      brandId: 'mock-c2', name: 'Rebel Padel', isMain: false,
      points: [
        { label: 'W21', week: 21, year: 2026, mentionRate: 30 },
        { label: 'W22', week: 22, year: 2026, mentionRate: 31 },
        { label: 'W23', week: 23, year: 2026, mentionRate: 29 },
        { label: 'W24', week: 24, year: 2026, mentionRate: 28 },
        { label: 'W25', week: 25, year: 2026, mentionRate: 28 },
      ],
    },
  ],
}

export const mockPrompts = [
  { _id: 'mock-p1', brandId: 'mock-brand-1', text: 'best padel app in Jakarta', category: 'discovery', isActive: true, createdAt: '2026-03-01T00:00:00.000Z' },
  { _id: 'mock-p2', brandId: 'mock-brand-1', text: 'how to book a futsal court online', category: 'comparison', isActive: true, createdAt: '2026-03-01T00:00:00.000Z' },
  { _id: 'mock-p3', brandId: 'mock-brand-1', text: 'cheapest sports venue booking Indonesia', category: 'recommendation', isActive: true, createdAt: '2026-03-01T00:00:00.000Z' },
]

export const mockArticles = [
  { _id: 'mock-a1', brandId: 'mock-brand-1', promptId: 'mock-p1', title: 'Why ArenaGo is the easiest way to book padel in Jakarta', content: '# Mock article\n\nThis is mock content.', format: 'markdown', status: 'ready', generatedAt: '2026-06-10T00:00:00.000Z' },
]

/** Semantic-proximity payload (Boost page + the Overview ActionQueue's concept
 *  gaps). `concepts` already stick to the brand; `gaps` are concepts the brand
 *  SHOULD own but does not yet. */
export const mockSemanticProximity = {
  brandId: 'mock-brand-1',
  totalMentions: 68,
  concepts: [
    { concept: 'padel booking', count: 24, score: 88 },
    { concept: 'jakarta venues', count: 19, score: 76 },
    { concept: 'easy to use app', count: 15, score: 64 },
    { concept: 'court availability', count: 12, score: 55 },
    { concept: 'affordable pricing', count: 9, score: 41 },
  ],
  gaps: [
    { concept: 'trusted by communities', count: 0, score: 0 },
    { concept: 'instant booking', count: 0, score: 0 },
    { concept: 'coach matching', count: 0, score: 0 },
  ],
  computedAt: '2026-06-28T03:00:00.000Z',
}

/** Co-occurrence payload (Boost page competitor comparison). */
export const mockCooccurrence = {
  brandId: 'mock-brand-1',
  topConcepts: mockSemanticProximity.concepts,
  competitorComparison: [
    { competitor: 'Ayo Indonesia', concepts: ['community events', 'multi-sport', 'loyalty rewards'] },
    { competitor: 'Rebel Padel', concepts: ['premium courts', 'coaching'] },
  ],
}

/** GEO audit payload (Overview ActionQueue audit actions). Failing checks with
 *  high/medium impact become "Fix on-page" actions. */
export const mockGeoScore = {
  score: 72,
  checks: [
    { label: 'Answers the question directly', passed: false, impact: 'high', recommendation: 'Lead with a one-sentence direct answer in the first paragraph so AI can quote it.' },
    { label: 'FAQ schema markup', passed: false, impact: 'high', recommendation: 'Add FAQPage structured data so assistants can extract clean Q&A pairs.' },
    { label: 'Author and organization signals', passed: false, impact: 'medium', recommendation: 'Add an author bio and Organization schema to strengthen entity trust.' },
    { label: 'Visible last-updated date', passed: false, impact: 'medium', recommendation: 'Show a "last updated" date so AI prefers your page as fresh.' },
    { label: 'Meta description present', passed: true, impact: 'high', recommendation: '' },
    { label: 'Mobile readable', passed: true, impact: 'low', recommendation: '' },
  ],
}

/** True when the request carries our session cookie (matches the real middleware,
 *  which only checks cookie presence). */
export function hasSession(req: NextRequest): boolean {
  return Boolean(req.cookies.get(SESSION_COOKIE)?.value)
}

export function setSession(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, 'mock-session-token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })
  return res
}

export function clearSession(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Forward to the real backend when the mock flag is off, mirroring the dev
 *  rewrite in next.config.ts. Keeps these routes harmless without MOCK_AUTH. */
export async function proxyToBackend(req: NextRequest): Promise<Response> {
  const base = process.env.BACKEND_URL || 'http://localhost:4000'
  const target = base + req.nextUrl.pathname + req.nextUrl.search
  const hasBody = !['GET', 'HEAD'].includes(req.method)
  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      'content-type': req.headers.get('content-type') || 'application/json',
      cookie: req.headers.get('cookie') || '',
    },
    body: hasBody ? await req.text() : undefined,
    redirect: 'manual',
  })
  const res = new NextResponse(await upstream.text(), { status: upstream.status })
  const ct = upstream.headers.get('content-type')
  if (ct) res.headers.set('content-type', ct)
  for (const c of upstream.headers.getSetCookie?.() ?? []) res.headers.append('set-cookie', c)
  return res
}
