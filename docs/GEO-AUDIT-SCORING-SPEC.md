# GEO Score Audit - proposed new scoring parameters

Handoff spec for the backend dev. Goal: make the GEO Score Audit richer and more
accurate by adding more checks that influence the score.

Owner file: `backend/src/services/audit.service.ts` → `runGEOAudit(url)`.
Frontend already renders whatever `checks[]` the endpoint returns (label, passed,
impact, recommendation) - no frontend change is needed for new checks to appear.

## Current state

`runGEOAudit` fetches the page HTML (and `/{host}/llms.txt`) and pushes 7 checks:

1. `llms.txt present` - high
2. `FAQ section present` - high
3. `Brand definition present` - high
4. `Structured lists (5+ items)` - medium
5. `Meta description (50+ chars)` - medium
6. `JSON-LD schema markup` - medium
7. `Sitemap reference` - low

Scoring (unchanged - recomputes automatically as checks are added):

```ts
const weights = { high: 20, medium: 10, low: 5 }
const maxScore = checks.reduce((sum, c) => sum + weights[c.impact], 0)
const earned = checks.filter((c) => c.passed).reduce((sum, c) => sum + weights[c.impact], 0)
const score = Math.round((earned / maxScore) * 100)
```

So each `checks.push(...)` you add just raises `maxScore` and contributes its
weight when passed. No formula change required.

## New checks to add

Each row: detection (against the already-fetched `html`, the `url`, or one extra
fetch), impact/weight, and the pass / fail recommendation copy (English, matching
the existing tone).

| # | label | impact | how to detect |
|---|-------|--------|---------------|
| 8 | `robots.txt allows AI crawlers` | high | extra fetch `${proto}//${host}/robots.txt`; fail if it blocks any of GPTBot / ClaudeBot / PerplexityBot / Google-Extended (or `*`) from `/`. Missing robots.txt = allowed = pass. |
| 9 | `Descriptive title tag` | high | `<title>` exists and its text is 30-60 chars. |
| 10 | `Single H1 + heading structure` | medium | exactly one `<h1>` and at least one `<h2>`. |
| 11 | `OpenGraph tags` | medium | `og:title`, `og:description`, and `og:image` meta tags all present. |
| 12 | `Image alt-text coverage` | medium | of all `<img>`, ≥80% have a non-empty `alt`. No images = pass. |
| 13 | `Substantial content` | medium | visible text (tags stripped) has ≥300 words. |
| 14 | `Question-style headings` | medium | at least one heading (h1-h3) phrased as a question (contains `?` or starts with what/how/why/when/where). |
| 15 | `Canonical URL` | low | `<link rel="canonical" ...>` present. |
| 16 | `HTTPS` | low | `url` starts with `https://`. |

This takes the audit from 7 → 16 checks (maxScore 95 → ~155), so the score
reflects far more of what actually drives AI visibility.

## Detection sketches (drop into `runGEOAudit`)

```ts
// 8. robots.txt allows AI crawlers (one extra fetch, like llms.txt)
const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`
let aiAllowed = true // missing robots.txt = allowed
try {
  const r = await axios.get(robotsUrl, { timeout: 5_000 })
  const txt = String(r.data).toLowerCase()
  const bots = ['gptbot', 'claudebot', 'perplexitybot', 'google-extended', '*']
  // crude block: a bot's user-agent block contains "disallow: /"
  aiAllowed = !bots.some((b) => {
    const seg = txt.split('user-agent:').find((s) => s.trimStart().startsWith(b))
    return seg != null && /disallow:\s*\/\s*(\n|$)/.test(seg)
  })
} catch { /* no robots.txt -> allowed */ }
checks.push({
  label: 'robots.txt allows AI crawlers',
  passed: aiAllowed,
  impact: 'high',
  recommendation: aiAllowed
    ? 'AI crawlers are not blocked. Keep GPTBot, ClaudeBot, PerplexityBot, and Google-Extended allowed.'
    : 'Your robots.txt blocks AI crawlers. Allow GPTBot, ClaudeBot, PerplexityBot, and Google-Extended so AI can read your pages.',
})

// 9. Descriptive title tag (30-60 chars)
const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
const titleLen = titleMatch ? titleMatch[1].trim().length : 0
const hasTitle = titleLen >= 30 && titleLen <= 60
checks.push({
  label: 'Descriptive title tag',
  passed: hasTitle,
  impact: 'high',
  recommendation: hasTitle
    ? 'Title tag is a good length.'
    : 'Use a clear <title> of about 30-60 characters that names your brand and what the page is about.',
})

// 10. Single H1 + heading structure
const h1Count = (html.match(/<h1[\s>]/gi) || []).length
const hasH2 = /<h2[\s>]/i.test(html)
const goodHeadings = h1Count === 1 && hasH2
checks.push({
  label: 'Single H1 + heading structure',
  passed: goodHeadings,
  impact: 'medium',
  recommendation: goodHeadings
    ? 'Clear heading hierarchy found.'
    : 'Use exactly one <h1> and supporting <h2> headings so AI can follow the page structure.',
})

// 11. OpenGraph tags
const hasOg =
  /property=["']og:title["']/i.test(html) &&
  /property=["']og:description["']/i.test(html) &&
  /property=["']og:image["']/i.test(html)
checks.push({
  label: 'OpenGraph tags',
  passed: hasOg,
  impact: 'medium',
  recommendation: hasOg
    ? 'OpenGraph tags present.'
    : 'Add og:title, og:description, and og:image so AI and social platforms get a clean summary.',
})

// 12. Image alt-text coverage (>= 80%)
const imgs = html.match(/<img\b[^>]*>/gi) || []
const withAlt = imgs.filter((t) => /\balt=["'][^"']+["']/i.test(t)).length
const altOk = imgs.length === 0 || withAlt / imgs.length >= 0.8
checks.push({
  label: 'Image alt-text coverage',
  passed: altOk,
  impact: 'medium',
  recommendation: altOk
    ? 'Most images have alt text.'
    : 'Add descriptive alt text to your images so AI understands the visuals.',
})

// 13. Substantial content (>= 300 words)
const wordCount = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .split(/\s+/)
  .filter(Boolean).length
const enoughContent = wordCount >= 300
checks.push({
  label: 'Substantial content',
  passed: enoughContent,
  impact: 'medium',
  recommendation: enoughContent
    ? 'Page has enough text for AI to summarize.'
    : 'Add more substantive copy (aim for 300+ words). Thin pages are rarely cited by AI.',
})

// 14. Question-style headings
const headings = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || []
const hasQuestion = headings.some((h) => {
  const text = h.replace(/<[^>]+>/g, '').trim().toLowerCase()
  return text.includes('?') || /^(what|how|why|when|where)\b/.test(text)
})
checks.push({
  label: 'Question-style headings',
  passed: hasQuestion,
  impact: 'medium',
  recommendation: hasQuestion
    ? 'Question-style headings found.'
    : 'Phrase some headings as the questions users ask (e.g. "How does X work?"). AI extracts Q&A content well.',
})

// 15. Canonical URL
const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html)
checks.push({
  label: 'Canonical URL',
  passed: hasCanonical,
  impact: 'low',
  recommendation: hasCanonical
    ? 'Canonical URL set.'
    : 'Add a <link rel="canonical"> so AI knows the primary version of the page.',
})

// 16. HTTPS
const isHttps = url.toLowerCase().startsWith('https://')
checks.push({
  label: 'HTTPS',
  passed: isHttps,
  impact: 'low',
  recommendation: isHttps
    ? 'Served over HTTPS.'
    : 'Serve the site over HTTPS. Insecure pages are deprioritized everywhere.',
})
```

## Notes

- These are HTML-heuristic checks, same approach as the existing 7 (good enough for
  a directional score; not a full crawler).
- Only one new network call (`robots.txt`); everything else reuses the fetched `html`.
- If you'd rather weight some differently (e.g. `robots.txt allows AI crawlers` as
  its own tier), the `weights` map is the single place to change.
- The frontend hero on `/brands/[id]/tools` renders all checks automatically - no
  coordination needed beyond shipping the new `checks.push(...)` entries.
