/**
 * Shared analytics types + pure helpers, used by both the Overview report card
 * and the Agents Insights page so the two stay consistent. All derived purely
 * from the existing GET /brands/{id}/analytics payload (no backend changes).
 */

export interface ModelRate {
  model: string
  totalQueries: number
  mentionCount: number
  mentionRate: number
}

export interface SentimentCounts {
  positive: number
  neutral: number
  negative: number
}

export interface TrendPoint {
  label: string
  mentionRate: number
  total: number
  mentioned: number
  week?: number
  year?: number
}

export interface GapRow {
  promptId: string
  text: string
  category: string
  mentionRate: number
  total: number
}

export interface ShareRow {
  brandId: string
  name: string
  mentionCount: number
  mentionRate: number
  shareOfVoice: number
}

export interface Analytics {
  overall: { totalQueries: number; mentionCount: number; mentionRate: number }
  byModel: ModelRate[]
  bestModel: string | null
  worstModel: string | null
  sentiment: Record<string, SentimentCounts>
  trends: TrendPoint[]
  gaps: GapRow[]
  shareOfVoice: ShareRow[]
}

export const MODEL_LABELS: Record<string, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  anthropic: 'Claude',
}

export function modelLabel(model: string | null): string {
  if (model == null) return '-'
  return MODEL_LABELS[model] ?? model
}

export type Direction = 'up' | 'down' | 'flat'

export interface Delta {
  /** current - previous (percentage points); null when <2 trend points. */
  value: number | null
  direction: Direction
  current: number | null
  previous: number | null
}

/** Week-over-week change in mention rate from the last two trend points. */
export function weekOverWeekDelta(trends: TrendPoint[]): Delta {
  if (trends.length < 2) {
    return { value: null, direction: 'flat', current: trends[0]?.mentionRate ?? null, previous: null }
  }
  const current = trends[trends.length - 1].mentionRate
  const previous = trends[trends.length - 2].mentionRate
  const value = current - previous
  return {
    value,
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'flat',
    current,
    previous,
  }
}

/** Sum sentiment counts across every model into one aggregate. */
export function aggregateSentiment(sentiment: Record<string, SentimentCounts>): SentimentCounts & { total: number } {
  const agg = Object.values(sentiment).reduce(
    (acc, s) => {
      acc.positive += s.positive
      acc.neutral += s.neutral
      acc.negative += s.negative
      return acc
    },
    { positive: 0, neutral: 0, negative: 0 },
  )
  return { ...agg, total: agg.positive + agg.neutral + agg.negative }
}

export interface ModelSentiment {
  model: string
  label: string
  total: number
  positivePct: number
  neutralPct: number
  negativePct: number
}

/** Per-model sentiment as percentages (for the sentiment breakdown table). */
export function sentimentByModel(sentiment: Record<string, SentimentCounts>): ModelSentiment[] {
  return Object.entries(sentiment).map(([model, s]) => {
    const total = s.positive + s.neutral + s.negative
    const pct = (n: number): number => (total > 0 ? Math.round((n / total) * 100) : 0)
    return {
      model,
      label: modelLabel(model),
      total,
      positivePct: pct(s.positive),
      neutralPct: pct(s.neutral),
      negativePct: pct(s.negative),
    }
  })
}

/** Spread between the best and worst model mention rates (percentage points). */
export function modelGap(byModel: ModelRate[]): number | null {
  if (byModel.length < 2) return null
  const rates = byModel.map((m) => m.mentionRate)
  return Math.max(...rates) - Math.min(...rates)
}

export function rateForModel(byModel: ModelRate[], model: string | null): number | null {
  const row = byModel.find((m) => m.model === model)
  return row != null ? row.mentionRate : null
}

/** DS chip type for a mention rate: >=60 good, >=30 mid, else weak. */
export function rateChipType(rate: number): 'success' | 'warning' | 'error' {
  if (rate >= 60) return 'success'
  if (rate >= 30) return 'warning'
  return 'error'
}

/** Top N opportunities (lowest-mention prompts) for the Overview report card. */
export function topOpportunities(gaps: GapRow[], n = 3): GapRow[] {
  return [...gaps].sort((a, b) => a.mentionRate - b.mentionRate).slice(0, n)
}
