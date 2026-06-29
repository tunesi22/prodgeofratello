import QueryResult from '../models/QueryResult'
import Brand from '../models/Brand'
import { query as queryAnthropic } from './llm/anthropic'

export interface ConceptScore {
  concept: string
  count: number
  score: number
}

export interface SemanticProximityResult {
  brandId: string
  totalMentions: number
  concepts: ConceptScore[]
  gaps: ConceptScore[]
  computedAt: Date
}

export interface CooccurrenceResult {
  brandId: string
  topConcepts: ConceptScore[]
  competitorComparison: { competitor: string; concepts: string[] }[]
}

// ─── Semantic Proximity ───────────────────────────────────────────────────────

export async function getSemanticProximity(brandId: string): Promise<SemanticProximityResult> {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error('Brand not found')

  const mentions = await QueryResult.find({
    brandId,
    mentioned: true,
    mentionContext: { $exists: true, $ne: '' },
  })
    .select('mentionContext')
    .lean()

  if (mentions.length === 0) {
    return { brandId, totalMentions: 0, concepts: [], gaps: [], computedAt: new Date() }
  }

  const contexts = mentions.map((m: any) => m.mentionContext).filter(Boolean)
  const conceptCounts: Record<string, number> = {}

  // Batch 30 contexts per Claude call
  const batchSize = 30
  for (let i = 0; i < contexts.length; i += batchSize) {
    const batch = contexts.slice(i, i + batchSize)
    const prompt = `Extract semantic concepts from these brand mention snippets.

Brand: ${brand.name} | Industry: ${brand.industry}

Snippets:
${batch.map((c: string, idx: number) => `[${idx + 1}] ${c}`).join('\n')}

Rules:
- Extract meaningful concepts, attributes, topics, and entities that appear alongside the brand
- Be specific: "free trial" not "free", "real-time tracking" not "tracking"
- Max 5 concepts per snippet, deduplicate similar ones
- Exclude the brand name itself

Return ONLY a flat JSON array of strings:
["concept1", "concept2", ...]`

    try {
      const raw = await queryAnthropic(prompt)
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed: string[] = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        for (const c of parsed) {
          const key = c.toLowerCase().trim()
          if (key.length > 2) conceptCounts[key] = (conceptCounts[key] || 0) + 1
        }
      }
    } catch {
      console.error('[SEMANTIC SERVICE] Failed to parse concepts batch', i)
    }
  }

  const totalMentions = mentions.length
  const concepts: ConceptScore[] = Object.entries(conceptCounts)
    .map(([concept, count]) => ({ concept, count, score: Math.round((count / totalMentions) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Gap concepts — what SHOULD be near brand but isn't
  let gaps: ConceptScore[] = []
  if (concepts.length > 0) {
    const gapPrompt = `Brand: ${brand.name} (${brand.industry} industry)

Current top concepts associated with this brand by AI assistants:
${concepts.slice(0, 10).map((c) => c.concept).join(', ')}

List 8 important concepts/attributes that a strong brand in "${brand.industry}" SHOULD be associated with for high AI visibility, but are NOT in the list above.

Return ONLY a JSON array:
["concept1", "concept2", ...]`

    try {
      const raw = await queryAnthropic(gapPrompt)
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed: string[] = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        gaps = parsed.map((g: string) => ({ concept: g.toLowerCase().trim(), count: 0, score: 0 }))
      }
    } catch {
      console.error('[SEMANTIC SERVICE] Failed to parse gap concepts')
    }
  }

  console.log(`[SEMANTIC SERVICE] ${brand.name}: ${concepts.length} concepts, ${gaps.length} gaps from ${totalMentions} mentions`)
  return { brandId, totalMentions, concepts, gaps, computedAt: new Date() }
}

// ─── Co-occurrence ────────────────────────────────────────────────────────────

export async function getCooccurrence(brandId: string): Promise<CooccurrenceResult> {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error('Brand not found')

  const proximity = await getSemanticProximity(brandId)
  const competitorComparison: { competitor: string; concepts: string[] }[] = []

  for (const comp of brand.competitors.slice(0, 3)) {
    const competitor = comp.name
    const compMentions = await QueryResult.find({
      brandId,
      mentionContext: { $regex: competitor, $options: 'i' },
    })
      .select('mentionContext')
      .lean()

    if (compMentions.length === 0) {
      competitorComparison.push({ competitor, concepts: [] })
      continue
    }

    const contexts = compMentions.map((m: any) => m.mentionContext).filter(Boolean).slice(0, 20)
    const prompt = `Extract the top 6 most distinctive concepts associated with "${competitor}" from these AI-generated texts:

${contexts.map((c: string, i: number) => `[${i + 1}] ${c}`).join('\n')}

Return ONLY a JSON array of concept strings:
["concept1", ...]`

    try {
      const raw = await queryAnthropic(prompt)
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed: string[] = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        competitorComparison.push({ competitor, concepts: parsed.slice(0, 6) })
      }
    } catch {
      competitorComparison.push({ competitor, concepts: [] })
    }
  }

  return {
    brandId,
    topConcepts: proximity.concepts.slice(0, 15),
    competitorComparison,
  }
}
