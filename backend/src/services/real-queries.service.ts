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

export async function discoverRealQueries(
  brandName: string,
  industry: string
): Promise<RealQuery[]> {
  const industryShort = industry.split(' ').slice(0, 4).join(' ')

  const googleSeeds = [
    brandName,
    `best ${industryShort}`,
    `${industryShort} terbaik`,
    `rekomendasi ${industryShort}`,
    `aplikasi ${industryShort}`,
    `${industryShort} vs`,
    `cara ${industryShort}`,
    `${industryShort} review`,
    `${industryShort} indonesia`,
    `${brandName} vs`,
    `${brandName} review`,
    `${brandName} bagaimana`,
  ]

  const redditSeeds = [
    brandName,
    `${industryShort} indonesia`,
    industryShort,
    `${brandName} ${industryShort}`,
  ]

  console.log(`[REAL QUERIES] Fetching for: ${brandName} / ${industryShort}`)

  const [googleBatch, googleRelated, redditResults] = await Promise.all([
    Promise.all(googleSeeds.map(fetchGoogleAutocomplete)).then((r) => r.flat()),
    fetchGoogleRelated(industryShort),
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

  console.log(`[REAL QUERIES] Found ${queries.length} unique queries`)
  return queries.slice(0, 80)
}
