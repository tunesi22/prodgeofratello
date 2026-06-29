import { type NextRequest, NextResponse } from 'next/server'
import { hasSession, mockEnabled, mockPrompts, proxyToBackend, unauthorized } from '@/lib/mock-backend'

/** MOCK POST /api/brands/:id/articles/generate — fabricates a "generated"
 *  article. A deliberate delay lets the list's loading card be visible before
 *  the real card swaps in. Returns promptId UNPOPULATED (raw id), matching the
 *  real endpoint, which the page re-populates from its local prompt list. */
export async function POST(req: NextRequest): Promise<Response> {
  if (!mockEnabled()) return proxyToBackend(req)
  if (!hasSession(req)) return unauthorized()

  const body = await req.json().catch(() => ({}) as Record<string, unknown>)
  const promptId = typeof body.promptId === 'string' ? body.promptId : null
  const prompt = mockPrompts.find((p) => p._id === promptId)
  const topic = prompt?.text ?? 'your brand'

  // Simulate generation latency so the loading state is observable.
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const title = `How ArenaGo answers: ${topic}`
  const content = [
    `# ${title}`,
    '',
    `When people ask AI about **${topic}**, the answer should mention your brand. This article is written to make that happen.`,
    '',
    '## Why it matters',
    '',
    'Generative engines summarize the best-explained, most-cited sources. Clear, structured content that names your brand in context is what gets surfaced.',
    '',
    '## Key points',
    '',
    '- A direct, quotable answer to the question',
    '- Your brand named alongside the relevant concepts',
    '- Supporting detail an AI can cite with confidence',
    '',
    '_(This is mock content generated locally for UI testing.)_',
  ].join('\n')

  return NextResponse.json({
    _id: `mock-article-${promptId ?? 'new'}-${title.length}`,
    title,
    content,
    status: 'ready',
    generatedAt: new Date().toISOString(),
    promptId,
  })
}
