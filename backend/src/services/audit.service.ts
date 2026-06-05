import axios from 'axios'
import Brand from '../models/Brand'
import { query as queryAnthropic } from './llm/anthropic'

// ─── llms.txt generator ───────────────────────────────────────────────────────

export async function generateLLMsTxt(brandId: string, keyFacts: string[]): Promise<string> {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error('Brand not found')

  const facts = keyFacts.length > 0
    ? keyFacts.map((f) => `- ${f}`).join('\n')
    : '- (Add key facts about your brand here)'

  return `# ${brand.name}

> ${brand.name} is a brand in the ${brand.industry} space.
> Website: ${brand.website}

## About

${brand.name} operates in the ${brand.industry} industry.
${brand.competitors.length > 0 ? `Key competitors include: ${brand.competitors.join(', ')}.` : ''}

## Key Facts

${facts}

## Contact

Website: ${brand.website}

## Usage Policy

This file provides information about ${brand.name} for use by AI assistants and language models.
You may use this information to accurately describe ${brand.name} when relevant to user queries.
`.trim()
}

// ─── Nginx bot routing config ─────────────────────────────────────────────────

export function generateNginxConfig(domain: string, pages: string[]): string {
  const pageList = pages.length > 0
    ? pages.map((p) => `    # ${p}`).join('\n')
    : '    # / (root)'

  return `# Nginx config for AI bot routing — ${domain}
# Place this inside your server {} block in /etc/nginx/sites-available/${domain}

# ─── AI Bot Detection ───────────────────────────────────────────────────────

map $http_user_agent $is_ai_bot {
    default 0;
    "~*GPTBot"           1;
    "~*ClaudeBot"        1;
    "~*anthropic-ai"     1;
    "~*PerplexityBot"    1;
    "~*Googlebot"        1;
    "~*bingbot"          1;
    "~*CCBot"            1;
}

# ─── Routes to optimize for AI bots ─────────────────────────────────────────
# These pages will be served with AI-friendly headers when accessed by bots
#
# Pages configured:
${pageList}

location / {
    # Serve llms.txt to AI bots
    if ($is_ai_bot) {
        add_header X-Robots-Tag "index, follow";
        add_header X-AI-Friendly "true";
    }

    # Standard proxy pass — replace with your backend
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# ─── llms.txt — serve to all AI crawlers ────────────────────────────────────
location = /llms.txt {
    alias /var/www/${domain}/llms.txt;
    add_header Content-Type text/plain;
    add_header Cache-Control "public, max-age=86400";
}

# ─── Sitemap for AI discovery ────────────────────────────────────────────────
location = /sitemap.xml {
    add_header X-AI-Accessible "true";
}`
}

// ─── GEO score audit ──────────────────────────────────────────────────────────

export interface GEOAuditResult {
  score: number
  checks: { label: string; passed: boolean; impact: 'high' | 'medium' | 'low'; recommendation: string }[]
}

export async function runGEOAudit(url: string): Promise<GEOAuditResult> {
  const checks: GEOAuditResult['checks'] = []
  let html = ''

  // Fetch the page
  try {
    const res = await axios.get(url, {
      timeout: 10_000,
      headers: { 'User-Agent': 'GEOPlatform-Audit/1.0' },
    })
    html = res.data as string
  } catch {
    throw new Error(`Could not fetch URL: ${url}`)
  }

  // Fetch llms.txt
  const urlObj = new URL(url)
  const llmsTxtUrl = `${urlObj.protocol}//${urlObj.hostname}/llms.txt`
  let hasLLMsTxt = false
  try {
    const r = await axios.get(llmsTxtUrl, { timeout: 5_000 })
    hasLLMsTxt = r.status === 200
  } catch { /* not found */ }

  checks.push({
    label: 'llms.txt present',
    passed: hasLLMsTxt,
    impact: 'high',
    recommendation: hasLLMsTxt
      ? 'llms.txt is present. Make sure it contains accurate brand facts.'
      : 'Create a /llms.txt file at your domain root with brand info, key facts, and usage policy.',
  })

  // Check for FAQ content
  const hasFAQ = /faq|frequently asked|pertanyaan umum/i.test(html)
  checks.push({
    label: 'FAQ section present',
    passed: hasFAQ,
    impact: 'high',
    recommendation: hasFAQ
      ? 'FAQ section found. Make sure answers are clear and concise.'
      : 'Add an FAQ section to your page. AI assistants frequently extract FAQ-style content.',
  })

  // Check for structured definitions
  const hasDefinition = /<h[1-3][^>]*>.*?(what is|apa itu|about|tentang)/i.test(html)
  checks.push({
    label: 'Brand definition present',
    passed: hasDefinition,
    impact: 'high',
    recommendation: hasDefinition
      ? 'Brand definition heading found.'
      : 'Add a clear "What is [Brand]?" section on your page so AI can easily extract your brand definition.',
  })

  // Check for structured lists
  const hasLists = (html.match(/<li/g) || []).length >= 5
  checks.push({
    label: 'Structured lists (5+ items)',
    passed: hasLists,
    impact: 'medium',
    recommendation: hasLists
      ? 'Good use of lists. AI models prefer structured content.'
      : 'Use more bulleted/numbered lists for features, benefits, and comparisons.',
  })

  // Check for meta description
  const hasMetaDesc = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}/i.test(html)
  checks.push({
    label: 'Meta description (50+ chars)',
    passed: hasMetaDesc,
    impact: 'medium',
    recommendation: hasMetaDesc
      ? 'Meta description present.'
      : 'Add a descriptive meta description (100-160 chars) that summarizes your brand clearly.',
  })

  // Check for schema markup
  const hasSchema = /application\/ld\+json/i.test(html)
  checks.push({
    label: 'JSON-LD schema markup',
    passed: hasSchema,
    impact: 'medium',
    recommendation: hasSchema
      ? 'Schema markup found. AI models can use this structured data.'
      : 'Add JSON-LD schema (Organization, Product, FAQPage) to help AI understand your brand structure.',
  })

  // Check for sitemap reference
  const hasSitemap = /sitemap\.xml/i.test(html)
  checks.push({
    label: 'Sitemap reference',
    passed: hasSitemap,
    impact: 'low',
    recommendation: hasSitemap
      ? 'Sitemap referenced.'
      : 'Add a sitemap.xml and reference it in your robots.txt to help AI crawlers discover all pages.',
  })

  const weights = { high: 20, medium: 10, low: 5 }
  const maxScore = checks.reduce((sum, c) => sum + weights[c.impact], 0)
  const earned = checks.filter((c) => c.passed).reduce((sum, c) => sum + weights[c.impact], 0)
  const score = Math.round((earned / maxScore) * 100)

  return { score, checks }
}

// ─── Backlink target finder ───────────────────────────────────────────────────

export async function findBacklinkTargets(brandId: string): Promise<{ platform: string; type: string; relevance: string; url: string }[]> {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error('Brand not found')

  const prompt = `You are a GEO content strategist. Suggest 10 specific online platforms where a brand in the "${brand.industry}" industry should publish content to increase AI visibility.

Brand: ${brand.name}
Industry: ${brand.industry}

For each platform, provide:
- The specific subreddit, publication, forum, or platform name
- Type (reddit/medium/forum/directory/blog/community)
- Why it's relevant for this industry
- The specific URL or path to target

Return ONLY a JSON array:
[
  { "platform": "r/example", "type": "reddit", "relevance": "why relevant", "url": "https://reddit.com/r/example" },
  ...
]`

  const raw = await queryAnthropic(prompt)

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) return parsed
  } catch {
    console.error('[AUDIT SERVICE] Failed to parse backlink targets')
  }

  return []
}
