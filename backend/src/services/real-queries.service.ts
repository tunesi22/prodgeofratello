import { query as queryAnthropic } from './llm/anthropic'

interface RealQuery {
  text: string
  source: 'google' | 'reddit'
  category: string
}

function categorize(text: string): string {
  const t = text.toLowerCase()
  if (/\bvs\b|compare|banding|lebih baik|atau mana/.test(t)) return 'comparison'
  if (/best|terbaik|rekomen|bagus|worth|top\b|pilihan/.test(t)) return 'recommendation'
  if (/cara|how to|how do|gimana|bagaimana|langkah|tutorial/.test(t)) return 'use-case'
  if (/apa itu|what is|pengertian|definisi|artinya|mengenal/.test(t)) return 'discovery'
  if (/review|rating|worth it|jujur|honest|kualitas/.test(t)) return 'best-of'
  return 'discovery'
}

async function fetchGoogleAutocomplete(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?q=${encodeURIComponent(query)}&client=firefox&hl=id&gl=id`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GEOBot/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    const data = await res.json() as [string, string[]]
    return data[1] || []
  } catch {
    return []
  }
}

async function fetchRedditQuestions(query: string): Promise<string[]> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&type=link&limit=25&t=year`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GEOPlatform/1.0 (research tool; contact@nineten-studios.com)' },
      signal: AbortSignal.timeout(6000),
    })
    const data = await res.json() as any
    const posts: any[] = data?.data?.children || []
    return posts
      .map((p) => p.data.title as string)
      .filter((t) =>
        t.includes('?') ||
        /^(how|what|which|why|where|when|apa|gimana|bagaimana|dimana|kenapa|kapan|siapa|boleh|bisa|apakah)/i.test(t)
      )
  } catch {
    return []
  }
}

async function fetchGoogleRelated(query: string): Promise<string[]> {
  // Google autocomplete with different suffixes to get more variations
  const suffixes = [' how', ' what', ' why', ' review', ' vs', '?']
  const results = await Promise.all(
    suffixes.map((s) => fetchGoogleAutocomplete(query + s))
  )
  return results.flat()
}

async function filterByRelevance(
  queries: RealQuery[],
  brandName: string,
  industry: string
): Promise<RealQuery[]> {
  if (queries.length === 0) return []

  const BATCH = 30
  const relevantIndices: number[] = []

  for (let i = 0; i < queries.length; i += BATCH) {
    const batch = queries.slice(i, i + BATCH)
    const numbered = batch.map((q, j) => `${j}: "${q.text}"`).join('\n')

    const prompt = `Brand: ${brandName}
Industry: ${industry}

Below are ${batch.length} search queries collected from the internet.
Return ONLY the indices of queries that are genuinely relevant — meaning someone asking this would plausibly be interested in brands like ${brandName} or direct competitors in the same industry.

Discard:
- Queries about unrelated industries or products
- Queries mentioning specific brands from a completely different sector
- Spam or nonsensical queries

Queries:
${numbered}

Return ONLY a valid JSON array of relevant indices, nothing else. Example: [0, 2, 5]`

    try {
      const raw = await queryAnthropic(prompt)
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const match = cleaned.match(/\[[\d,\s]*\]/)
      if (!match) continue
      const indices: number[] = JSON.parse(match[0])
      for (const idx of indices) {
        if (typeof idx === 'number' && idx >= 0 && idx < batch.length) {
          relevantIndices.push(i + idx)
        }
      }
    } catch (err) {
      console.error('[REAL QUERIES] Filter batch failed, keeping all:', err)
      // fallback: keep entire batch if Claude fails
      for (let j = i; j < i + batch.length; j++) relevantIndices.push(j)
    }
  }

  console.log(`[REAL QUERIES] Relevance filter: ${queries.length} → ${relevantIndices.length} kept`)
  return relevantIndices.map((i) => queries[i])
}

async function generateSmartSeeds(brandName: string, industry: string): Promise<string[]> {
  const prompt = `Brand: ${brandName}
Industry: ${industry}

Generate 12 short search seed phrases (2–5 words each) that real users would type into Google when looking for products, services, or recommendations in this brand's specific niche.

Rules:
- Focus on PRODUCT CATEGORIES and USE CASES, not the brand name itself
- Think about what problems/needs the brand solves
- Mix Indonesian and English phrases
- Do NOT include the brand name in the seeds
- Be specific to the industry, not generic "best brand" or "cara branding"

Return ONLY a JSON array of strings. Example: ["shampo rambut rontok", "best shampoo indonesia", "sabun mandi bagus"]`

  try {
    const raw = await queryAnthropic(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = cleaned.match(/\[[\s\S]*?\]/)
    if (!match) throw new Error('no array found')
    const seeds: string[] = JSON.parse(match[0])
    console.log(`[REAL QUERIES] Claude seeds: ${seeds.join(', ')}`)
    return seeds.filter((s) => typeof s === 'string' && s.length > 3)
  } catch (err) {
    console.error('[REAL QUERIES] Seed generation failed, using fallback:', err)
    const industryShort = industry.split(' ').slice(0, 3).join(' ')
    return [
      `best ${industryShort}`,
      `${industryShort} terbaik`,
      `rekomendasi ${industryShort}`,
      `${industryShort} review`,
      `${industryShort} indonesia`,
    ]
  }
}

export async function discoverRealQueries(
  brandName: string,
  industry: string
): Promise<RealQuery[]> {
  console.log(`[REAL QUERIES] Generating smart seeds for: ${brandName} / ${industry}`)

  // Step 1: Claude generates contextual seeds based on brand profile
  const smartSeeds = await generateSmartSeeds(brandName, industry)

  // Step 2: Each seed → Google Autocomplete variations
  const googleSeeds = [
    ...smartSeeds,
    `${brandName} vs`,
    `${brandName} review`,
    `${brandName} bagus ga`,
  ]

  // Step 3: Reddit — use smart seeds + brand name in English
  const redditSeeds = [
    brandName,
    ...smartSeeds.slice(0, 3),
    `${brandName} worth it`,
    `${brandName} recommendation`,
  ]

  const [googleBatch, googleRelated, redditResults] = await Promise.all([
    Promise.all(googleSeeds.map(fetchGoogleAutocomplete)).then((r) => r.flat()),
    fetchGoogleRelated(smartSeeds[0] || brandName),
    Promise.all(redditSeeds.map(fetchRedditQuestions)).then((r) => r.flat()),
  ])

  const allGoogle = [...new Set([...googleBatch, ...googleRelated])]

  const seen = new Set<string>()
  const queries: RealQuery[] = []

  // Reddit first — higher quality organic questions
  for (const text of redditResults) {
    const key = text.toLowerCase().trim()
    if (!seen.has(key) && text.length > 15 && text.length < 300) {
      seen.add(key)
      queries.push({ text, source: 'reddit', category: categorize(text) })
    }
  }

  // Google autocomplete
  for (const text of allGoogle) {
    const key = text.toLowerCase().trim()
    if (!seen.has(key) && text.length > 10 && text.length < 200) {
      seen.add(key)
      queries.push({ text, source: 'google', category: categorize(text) })
    }
  }

  const raw = queries.slice(0, 100)
  console.log(`[REAL QUERIES] Raw: ${raw.length}, running Claude relevance filter...`)

  const filtered = await filterByRelevance(raw, brandName, industry)
  return filtered
}
