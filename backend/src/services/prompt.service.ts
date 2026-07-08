import Prompt from '../models/Prompt'
import { query as queryAnthropic } from './llm/anthropic'

interface GeneratePromptsInput {
  brandId: string
  brandName: string
  industry: string
  competitors?: string[]
  count: number
}

interface GeneratedPrompt {
  text: string
  category: string
}

export async function generatePromptPool(input: GeneratePromptsInput): Promise<void> {
  const { brandId, brandName, industry, competitors = [], count } = input

  const competitorLine =
    competitors.length > 0
      ? `Competitor brands in this space: ${competitors.join(', ')}.`
      : ''

  const systemPrompt = `You are an expert in Generative Engine Optimization (GEO).
Generate exactly ${count} search queries that real users would type into AI assistants (ChatGPT, Gemini, Claude, Perplexity) when looking for products or services in the ${industry} industry.

Brand to track: ${brandName}
Industry: ${industry}
${competitorLine}

Rules:
- Write queries as real users would ask them — natural language, conversational
- Cover different intents: discovery, comparison, recommendation, best-of lists, specific use cases
- Do NOT mention ${brandName} in the queries — we want to see if the AI mentions it organically
- Group queries into 5 categories: discovery, comparison, recommendation, use-case, best-of
- Return ONLY a JSON array, no explanation, no markdown code blocks

Format:
[
  { "text": "query text here", "category": "discovery" },
  ...
]`

  console.log(`[PROMPT SERVICE] Generating prompts for brand: ${brandName}`)

  const { content: raw } = await queryAnthropic(systemPrompt)
  const prompts = parsePrompts(raw)

  if (prompts.length === 0) {
    throw new Error('[PROMPT SERVICE] Failed to parse any prompts from LLM response')
  }

  const docs = prompts.map((p) => ({
    brandId,
    text: p.text,
    category: p.category,
    isActive: true,
  }))

  await Prompt.insertMany(docs)

  console.log(`[PROMPT SERVICE] Saved ${docs.length} prompts for brandId: ${brandId}`)
}

function parsePrompts(raw: string): GeneratedPrompt[] {
  try {
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is GeneratedPrompt =>
        typeof item?.text === 'string' &&
        item.text.length > 0 &&
        typeof item?.category === 'string'
    )
  } catch {
    console.error('[PROMPT SERVICE] Failed to parse JSON response:', raw.slice(0, 200))
    return []
  }
}

export async function getPromptsByBrand(brandId: string) {
  return Prompt.find({ brandId, isActive: true }).sort({ createdAt: -1 })
}

export async function deletePromptsByBrand(brandId: string): Promise<void> {
  await Prompt.deleteMany({ brandId })
}
