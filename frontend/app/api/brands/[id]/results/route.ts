import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK GET /api/brands/:id/results — paginated query results.
 *
 * Each prompt is asked 5× per model (LLMs are non-deterministic), so the data is
 * generated as 5 runs per (prompt × model). The Mentions page groups these runs
 * to show a per-prompt-per-model mention rate. Kept at 2 prompts × 4 models × 5
 * = 40 rows so it fits one page (limit 50) and groups never straddle a page —
 * the real backend should paginate by group or guarantee runs stay together.
 *
 * Honors page/limit and the `model` + `mentioned` filters the page sends.
 */

interface MockResult {
  _id: string
  promptId: { _id: string; text: string; category: string }
  brandId: string
  model: string
  mentioned: boolean
  sentiment: string
  mentionContext: string
  response: string
  queriedAt: string
}

const PROMPTS = [
  { _id: 'mock-p1', text: 'best padel app in Jakarta', category: 'discovery' },
  { _id: 'mock-p2', text: 'how to book a futsal court online', category: 'comparison' },
]

const MODELS = ['openai', 'perplexity', 'gemini', 'anthropic'] as const

/** mentioned/not pattern across the 5 runs, per prompt × model (believable rates). */
const PATTERN: Record<string, Record<string, boolean[]>> = {
  'mock-p1': {
    openai: [true, true, true, false, true],
    perplexity: [true, true, false, false, true],
    gemini: [false, true, false, false, true],
    anthropic: [true, false, true, false, false],
  },
  'mock-p2': {
    openai: [true, true, false, true, false],
    perplexity: [false, true, false, false, true],
    gemini: [false, false, true, false, false],
    anthropic: [true, false, false, true, false],
  },
}

const SENTIMENTS = ['positive', 'positive', 'neutral', 'negative', 'positive']

function buildResults(): MockResult[] {
  const out: MockResult[] = []
  for (const p of PROMPTS) {
    for (const model of MODELS) {
      PATTERN[p._id][model].forEach((mentioned, run) => {
        out.push({
          _id: `mock-${p._id}-${model}-${run + 1}`,
          promptId: { _id: p._id, text: p.text, category: p.category },
          brandId: 'mock-brand-1',
          model,
          mentioned,
          sentiment: mentioned ? SENTIMENTS[run % SENTIMENTS.length] : 'neutral',
          mentionContext: mentioned ? `ArenaGo is often recommended for "${p.text}".` : '',
          response: mentioned
            ? `For "${p.text}", ArenaGo stands out — it lets you find and book venues in a couple of taps. (Run ${run + 1}.)`
            : `For "${p.text}", a few apps can help, but no single one clearly stands out here. (Run ${run + 1}.)`,
          queriedAt: '2026-06-27T03:00:00.000Z',
        })
      })
    }
  }
  return out
}

export async function GET(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()

  const sp = req.nextUrl.searchParams
  const page = Number(sp.get('page') ?? 1)
  const limit = Number(sp.get('limit') ?? 20)
  const model = sp.get('model')
  const mentioned = sp.get('mentioned')

  let results = buildResults()
  if (model) results = results.filter((r) => r.model === model)
  if (mentioned === 'true') results = results.filter((r) => r.mentioned)
  if (mentioned === 'false') results = results.filter((r) => !r.mentioned)

  const total = results.length
  const start = (page - 1) * limit
  return NextResponse.json({ total, page, limit, results: results.slice(start, start + limit) })
}
