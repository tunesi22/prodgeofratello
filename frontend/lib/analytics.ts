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

/** One time-series point for a brand in the competitor comparison. */
export interface CompetitorPoint {
  label: string
  mentionRate: number
  week?: number
  year?: number
}

/** A brand's mention-rate trend, used to compare against competitors over time. */
export interface CompetitorSeries {
  brandId: string
  name: string
  /** The brand being viewed (its own project) vs. a competitor project. */
  isMain: boolean
  points: CompetitorPoint[]
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
  /** Per-brand mention-rate trends (this brand + competitor projects). Optional
   *  so older payloads without it still type-check; the UI falls back gracefully. */
  competitorTrends?: CompetitorSeries[]
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

/**
 * Round to at most `decimals` places, killing floating-point noise from rate
 * arithmetic (e.g. 56.7 - 49 = 7.7000000000000003 → 7.7). Returns a number so
 * callers keep formatting control (tabular-nums, signs, etc.).
 */
export function round2(n: number, decimals = 2): number {
  const f = 10 ** decimals
  // + 0 normalizes -0 to 0 so a rounded-to-zero delta never renders as "-0".
  return Math.round(n * f) / f + 0
}

/** Display string with at most 2 decimals, trailing zeros stripped (7.70 → "7.7"). */
export function formatNum(n: number, decimals = 2): string {
  return String(round2(n, decimals))
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
  const value = round2(current - previous)
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
  return round2(Math.max(...rates) - Math.min(...rates))
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

// ─── Competitor comparison + next-period projection ───────────────────────────

/**
 * Least-squares slope of `ys` plotted against evenly spaced x = 0..n-1.
 * Returns 0 for fewer than two points (no trend to fit).
 */
export function trendSlope(ys: number[]): number {
  const n = ys.length
  if (n < 2) return 0
  const xMean = (n - 1) / 2
  const yMean = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (ys[i] - yMean)
    den += (i - xMean) ** 2
  }
  return den === 0 ? 0 : num / den
}

export interface ProjectedSeries extends CompetitorSeries {
  /** Last known mention rate (the most recent real point). */
  current: number
  /** Forecast mention rate for the next period, clamped to 0..100. */
  projected: number
  /** projected − current (percentage points), rounded to 2 decimals. */
  delta: number
  direction: Direction
}

/**
 * Forecast each brand's NEXT mention rate by fitting a line to its recent points
 * (last `window` weeks) and extrapolating one step, clamped to 0..100. This is
 * the dashed "where each brand is heading" projection on the comparison chart —
 * an estimate from the trend, not a guarantee. Brands with no data are dropped;
 * the main brand is sorted first so it reads as the hero line.
 */
export function projectCompetitorTrends(
  series: CompetitorSeries[],
  window = 4,
): ProjectedSeries[] {
  return [...series]
    .filter((s) => s.points.length > 0)
    .sort((a, b) => Number(b.isMain) - Number(a.isMain))
    .map((s) => {
      const current = s.points[s.points.length - 1].mentionRate
      let projected = current
      if (s.points.length >= 2) {
        const recent = s.points.slice(-window).map((p) => p.mentionRate)
        const raw = recent[recent.length - 1] + trendSlope(recent)
        projected = Math.max(0, Math.min(100, Math.round(raw)))
      }
      const delta = round2(projected - current)
      const direction: Direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
      return { ...s, current, projected, delta, direction }
    })
}
