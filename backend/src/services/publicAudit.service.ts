import axios from 'axios'
import * as cheerio from 'cheerio'
import { query as queryGemini } from './llm/gemini'
import { withRetry } from '../utils/retry'

export interface AuditCheck {
  key: string
  impact: 'high' | 'medium' | 'low'
  weight: number
  passed: boolean
}

export interface PublicAuditResult {
  domain: string
  brandName: string
  score: number
  band: 'low' | 'mid' | 'high'
  checks: AuditCheck[]
}

const USER_AGENT = 'Mozilla/5.0 (compatible; GEO-Platform-Audit/1.0; +https://hifratello.com)'

export function normalizeDomain(website: string): string | null {
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

async function fetchText(url: string, timeout = 6_000): Promise<string | null> {
  try {
    const res = await axios.get(url, {
      timeout,
      headers: { 'User-Agent': USER_AGENT },
      maxContentLength: 500_000,
      validateStatus: (s) => s === 200,
    })
    return typeof res.data === 'string' ? res.data : null
  } catch {
    return null
  }
}

async function checkAICrawlers(origin: string): Promise<boolean> {
  const robotsTxt = await fetchText(`${origin}/robots.txt`, 5_000)
  if (robotsTxt == null) return true // missing robots.txt = allowed by default
  const txt = robotsTxt.toLowerCase()
  const bots = ['gptbot', 'claudebot', 'perplexitybot', 'google-extended', '*']
  return !bots.some((b) => {
    const seg = txt.split('user-agent:').find((s) => s.trimStart().startsWith(b))
    return seg != null && /disallow:\s*\/\s*(\n|$)/.test(seg)
  })
}

async function checkLLMsTxt(origin: string): Promise<boolean> {
  const txt = await fetchText(`${origin}/llms.txt`, 5_000)
  return txt != null
}

function checkJsonLdType($: cheerio.CheerioAPI, typeName: string): boolean {
  let found = false
  $('script[type="application/ld+json"]').each((_, el) => {
    if (found) return
    try {
      const parsed = JSON.parse($(el).contents().text())
      const nodes = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed]
      for (const node of nodes) {
        const t = node?.['@type']
        const types = Array.isArray(t) ? t : [t]
        if (types.some((x) => String(x).toLowerCase() === typeName.toLowerCase())) {
          found = true
          break
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  })
  return found
}

function checkDirectAnswer($: cheerio.CheerioAPI): boolean {
  const firstParagraphs = $('p')
    .slice(0, 3)
    .map((_, el) => $(el).text().trim())
    .get()
    .join(' ')
  return /\b(is a|is an|adalah|merupakan)\b/i.test(firstParagraphs.slice(0, 400))
}

function checkFreshDates($: cheerio.CheerioAPI, html: string): boolean {
  if ($('meta[property="article:modified_time"]').length > 0) return true
  if ($('time[datetime]').length > 0) return true
  const recentYear = new Date().getFullYear()
  const pattern = new RegExp(`\\b(${recentYear}|${recentYear - 1})\\b`)
  return /update|diperbarui|last modified|terakhir diubah/i.test(html) && pattern.test(html)
}

function checkEntityConsistency($: cheerio.CheerioAPI, brandName: string): boolean {
  const needle = brandName.toLowerCase()
  if (needle.length < 2) return false
  const title = $('title').text().toLowerCase()
  const h1 = $('h1').first().text().toLowerCase()
  return title.includes(needle) && h1.includes(needle)
}

async function checkAIRecognition(domain: string, title: string, metaDesc: string): Promise<boolean> {
  const prompt = `Domain: ${domain}
Page title: "${title}"
Meta description: "${metaDesc}"

Based on your own training knowledge — not just guessing from the domain name or the text above — do you have genuine prior knowledge of this specific company or brand? Reply with ONLY one word: YES or NO.`

  try {
    const { content } = await withRetry(() => queryGemini(prompt), { maxRetries: 1 })
    return /^\s*yes/i.test(content.trim())
  } catch (err: any) {
    console.error('[PUBLIC AUDIT] Gemini recognition check failed:', err.message)
    return false
  }
}

export async function runPublicAudit(website: string): Promise<PublicAuditResult> {
  const domain = normalizeDomain(website)
  if (domain == null) throw new Error('invalid-website')

  const origin = `https://${domain}`
  const brandNameFallback = brandNameFromDomain(domain)

  const html = await fetchText(origin, 8_000)
  const crawlable = html != null && html.trim().length > 200

  const checks: AuditCheck[] = []
  let detectedBrandName = brandNameFallback
  let title = ''
  let metaDesc = ''

  if (crawlable && html != null) {
    const $ = cheerio.load(html)
    title = $('title').text().trim()
    metaDesc = $('meta[name="description"]').attr('content')?.trim() || ''
    const ogSiteName = $('meta[property="og:site_name"]').attr('content')?.trim()
    detectedBrandName = ogSiteName || title.split(/[|\-–]/)[0].trim() || brandNameFallback

    const h1Count = ($('h1').length)
    const hasH2 = $('h2').length > 0
    const words = $('body').clone().find('script,style,nav,footer,header').remove().end().text().trim()

    const [aiCrawlersOk, llmsTxtOk] = await Promise.all([checkAICrawlers(origin), checkLLMsTxt(origin)])

    checks.push(
      { key: 'crawlable', impact: 'high', weight: 13, passed: words.length > 200 },
      { key: 'direct-answers', impact: 'high', weight: 13, passed: checkDirectAnswer($) },
      { key: 'ai-crawlers', impact: 'high', weight: 13, passed: aiCrawlersOk },
      { key: 'faq-schema', impact: 'medium', weight: 8, passed: checkJsonLdType($, 'FAQPage') },
      { key: 'org-schema', impact: 'medium', weight: 8, passed: checkJsonLdType($, 'Organization') },
      { key: 'llms-txt', impact: 'medium', weight: 8, passed: llmsTxtOk },
      { key: 'headings', impact: 'medium', weight: 8, passed: h1Count === 1 && hasH2 },
      { key: 'fresh-dates', impact: 'medium', weight: 6, passed: checkFreshDates($, html) },
      { key: 'meta-description', impact: 'low', weight: 5, passed: metaDesc.length >= 50 },
      { key: 'entity', impact: 'low', weight: 5, passed: checkEntityConsistency($, detectedBrandName) }
    )
  } else {
    // Page could not be fetched/rendered — everything that depends on HTML fails,
    // but still check robots.txt / llms.txt (independent of the homepage fetch).
    const [aiCrawlersOk, llmsTxtOk] = await Promise.all([checkAICrawlers(origin), checkLLMsTxt(origin)])
    checks.push(
      { key: 'crawlable', impact: 'high', weight: 13, passed: false },
      { key: 'direct-answers', impact: 'high', weight: 13, passed: false },
      { key: 'ai-crawlers', impact: 'high', weight: 13, passed: aiCrawlersOk },
      { key: 'faq-schema', impact: 'medium', weight: 8, passed: false },
      { key: 'org-schema', impact: 'medium', weight: 8, passed: false },
      { key: 'llms-txt', impact: 'medium', weight: 8, passed: llmsTxtOk },
      { key: 'headings', impact: 'medium', weight: 8, passed: false },
      { key: 'fresh-dates', impact: 'medium', weight: 6, passed: false },
      { key: 'meta-description', impact: 'low', weight: 5, passed: false },
      { key: 'entity', impact: 'low', weight: 5, passed: false }
    )
  }

  const aiRecognized = await checkAIRecognition(domain, title, metaDesc)
  checks.push({ key: 'ai-recognition', impact: 'high', weight: 13, passed: aiRecognized })

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0)
  const band: PublicAuditResult['band'] = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low'

  return { domain, brandName: detectedBrandName, score, band, checks }
}
