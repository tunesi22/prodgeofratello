import { NextRequest, NextResponse } from 'next/server'

/**
 * MOCK website-analysis endpoint for the "New project" stepper.
 *
 * Returns fabricated crawl results so the flow works end-to-end without a real
 * backend. The REAL version (actually fetch the page, parse it, run LLM
 * industry + competitor detection, behind BullMQ) is the BE friend's job, see
 * `catatan backend.md` for the contract this mock matches.
 *
 * When the real Express route exists at POST /api/brands/analyze, DELETE this
 * file so /api/* falls through to the backend (next.config.ts rewrite).
 *
 * Contract:
 *   POST /api/brands/analyze
 *   body: { website: string, brandName?: string }
 *   200:  { crawlable, brandName, industry, competitors[], summary, source }
 */

interface MockCompetitor {
  name: string
  domain: string
  includeSubdomains: boolean
}

interface AnalyzeResult {
  crawlable: boolean
  brandName: string
  industry: string
  competitors: MockCompetitor[]
  summary: string
  /** Marks this payload as fabricated — real backend should omit or set 'live'. */
  source: 'mock'
}

/** Keyword buckets → a believable (industry, competitors) guess. Mock only. */
const BUCKETS: { match: RegExp; industry: string; competitors: MockCompetitor[] }[] = [
  {
    match: /sport|arena|padel|futsal|gym|fit|olahraga/i,
    industry: 'Sports & Recreation',
    competitors: [
      { name: 'Ayo Indonesia', domain: 'ayo.co.id', includeSubdomains: true },
      { name: 'SportArea', domain: 'sportarea.co.id', includeSubdomains: false },
      { name: 'GoFutsal', domain: 'gofutsal.id', includeSubdomains: false },
    ],
  },
  {
    match: /bakery|cake|kue|food|resto|kopi|coffee|snack|cafe/i,
    industry: 'Bakery',
    competitors: [
      { name: 'Holland Bakery', domain: 'hollandbakery.co.id', includeSubdomains: true },
      { name: 'Kopi Kenangan', domain: 'kopikenangan.com', includeSubdomains: false },
      { name: 'Janji Jiwa', domain: 'kopijanjijiwa.com', includeSubdomains: false },
    ],
  },
  {
    match: /shop|store|mart|retail|toko|belanja/i,
    industry: 'Retail',
    competitors: [
      { name: 'Tokopedia', domain: 'tokopedia.com', includeSubdomains: true },
      { name: 'Shopee', domain: 'shopee.co.id', includeSubdomains: false },
      { name: 'Bukalapak', domain: 'bukalapak.com', includeSubdomains: false },
    ],
  },
  {
    match: /pay|bank|finance|wallet|duit|fintech|invest/i,
    industry: 'Finance',
    competitors: [
      { name: 'GoPay', domain: 'gopay.co.id', includeSubdomains: true },
      { name: 'OVO', domain: 'ovo.id', includeSubdomains: false },
      { name: 'DANA', domain: 'dana.id', includeSubdomains: false },
    ],
  },
  {
    match: /app|tech|soft|cloud|data|lab|saas|digital|ai/i,
    industry: 'Software',
    competitors: [
      { name: 'Mekari', domain: 'mekari.com', includeSubdomains: true },
      { name: 'Qontak', domain: 'qontak.com', includeSubdomains: false },
      { name: 'Moka', domain: 'mokapos.com', includeSubdomains: false },
    ],
  },
]

/** Default guess when nothing matches — reads plausibly for an Indonesian site. */
const DEFAULT_BUCKET = {
  industry: 'Software',
  competitors: [
    { name: 'Tokopedia', domain: 'tokopedia.com', includeSubdomains: true },
    { name: 'Gojek', domain: 'gojek.com', includeSubdomains: false },
    { name: 'Traveloka', domain: 'traveloka.com', includeSubdomains: false },
  ] as MockCompetitor[],
}

/** Prepend https:// when the user typed a bare domain, so new URL() can parse. */
function normalizeWebsite(value: string): string {
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** Title-case a second-level domain into a brand-ish name. arenago → Arenago. */
function brandFromHost(host: string): string {
  const sld = host.replace(/^www\./, '').split('.')[0] ?? host
  return sld.charAt(0).toUpperCase() + sld.slice(1)
}

/** Domains we pretend our crawler cannot read, so the failure path is demoable. */
function isUncrawlable(host: string): boolean {
  return /localhost|127\.0\.0\.1|notcrawlable|example\.(com|org|net)/i.test(host)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let website = ''
  let brandHint = ''
  try {
    const body = await req.json()
    website = typeof body.website === 'string' ? body.website : ''
    brandHint = typeof body.brandName === 'string' ? body.brandName : ''
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (website.trim() === '') {
    return NextResponse.json({ error: 'website is required' }, { status: 400 })
  }

  // Simulate the latency of a real fetch + parse + LLM round-trip.
  await new Promise((r) => setTimeout(r, 1100))

  let host = ''
  try {
    host = new URL(normalizeWebsite(website)).hostname
  } catch {
    // Unparseable URL → treat as uncrawlable but still let the user proceed.
    const result: AnalyzeResult = {
      crawlable: false,
      brandName: brandHint.trim(),
      industry: '',
      competitors: [],
      summary: 'We could not read this address. Please fill in the details below.',
      source: 'mock',
    }
    return NextResponse.json(result)
  }

  if (isUncrawlable(host)) {
    const result: AnalyzeResult = {
      crawlable: false,
      brandName: brandHint.trim() || brandFromHost(host),
      industry: '',
      competitors: [],
      summary: `We could not reach ${host}. Fill in the details manually below.`,
      source: 'mock',
    }
    return NextResponse.json(result)
  }

  const haystack = `${host} ${brandHint}`
  const bucket = BUCKETS.find((b) => b.match.test(haystack)) ?? DEFAULT_BUCKET

  const result: AnalyzeResult = {
    crawlable: true,
    brandName: brandHint.trim() || brandFromHost(host),
    industry: bucket.industry,
    competitors: bucket.competitors,
    summary: `We read ${host} and pre-filled the details below.`,
    source: 'mock',
  }
  return NextResponse.json(result)
}
