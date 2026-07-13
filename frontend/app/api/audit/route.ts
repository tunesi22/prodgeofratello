import { NextResponse, type NextRequest } from 'next/server'

/**
 * MOCK public GEO-audit endpoint for the marketing /audit page.
 *
 * Like /api/brands/analyze, this mock SHADOWS the future backend route: results
 * are fabricated but deterministic per domain (same site, same score), so the
 * page demos believably. The REAL version (actually fetch the page, parse HTML,
 * check schema/robots/llms.txt, behind BullMQ) is the BE friend's job; see
 * `catatan backend.md` for the contract. When the Express route exists, DELETE
 * this file so /api/audit falls through to the backend.
 *
 * Contract:
 *   POST /api/audit
 *   body: { website: string }
 *   200:  { domain, brandName, score }
 *
 * LEAD-GEN GATE: the public /audit page reveals the headline GEO `score` (and
 * the 3D store visualizes it), but the per-check pass/fail list — the actual
 * "what to fix / what is good" recommendations — is the paid payoff and is
 * deliberately NOT sent to the browser. So the score is public, while the fix
 * list cannot be recovered from the DOM or the network response; a visitor has
 * to contact us to unlock it. The checks are still computed server-side (below)
 * for when the full report is delivered through sales, not rendered client-side.
 */

type Impact = 'high' | 'medium' | 'low'

interface CheckDef {
  key: string
  impact: Impact
  /** Contribution to the 0-100 score when passed. Sums to 100. */
  weight: number
  /** How often this passes in the wild (0-100), drives the fabricated result. */
  passRate: number
}

const CHECKS: CheckDef[] = [
  { key: 'crawlable', impact: 'high', weight: 16, passRate: 75 },
  { key: 'direct-answers', impact: 'high', weight: 16, passRate: 35 },
  { key: 'ai-crawlers', impact: 'high', weight: 16, passRate: 55 },
  { key: 'faq-schema', impact: 'medium', weight: 9, passRate: 30 },
  { key: 'org-schema', impact: 'medium', weight: 9, passRate: 45 },
  { key: 'llms-txt', impact: 'medium', weight: 9, passRate: 12 },
  { key: 'headings', impact: 'medium', weight: 9, passRate: 60 },
  { key: 'fresh-dates', impact: 'medium', weight: 6, passRate: 40 },
  { key: 'meta-description', impact: 'low', weight: 5, passRate: 80 },
  { key: 'entity', impact: 'low', weight: 5, passRate: 65 },
]

/** Small deterministic string hash (FNV-1a), so a domain always audits the same. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function normalizeDomain(website: string): string | null {
  const raw = website.trim().toLowerCase()
  if (raw === '' || /\s/.test(raw)) return null
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    const host = url.hostname.replace(/^www\./, '')
    if (!host.includes('.') || host.length < 4) return null
    return host
  } catch {
    return null
  }
}

function brandNameFromDomain(domain: string): string {
  const label = domain.split('.')[0]
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { website?: string }
  const domain = typeof body.website === 'string' ? normalizeDomain(body.website) : null
  if (domain == null) {
    return NextResponse.json({ error: 'invalid-website' }, { status: 400 })
  }

  // A believable "we are actually checking your site" pause; the page adds its
  // own analyzing steps on top of this.
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const checks = CHECKS.map((c) => ({
    key: c.key,
    impact: c.impact,
    passed: hash(`${domain}:${c.key}`) % 100 < c.passRate,
  }))
  const score = checks.reduce((sum, c, i) => sum + (c.passed ? CHECKS[i].weight : 0), 0)

  // The score is revealed; `checks` (the fix list) stay here and never reach
  // the public client (see the gate note above).
  return NextResponse.json({
    domain,
    brandName: brandNameFromDomain(domain),
    score,
  })
}
