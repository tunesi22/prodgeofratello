export const LLM_MODELS = ['openai', 'gemini', 'perplexity', 'anthropic'] as const
export type LLMModel = (typeof LLM_MODELS)[number]

export const SENTIMENT_VALUES = ['positive', 'neutral', 'negative'] as const
export type Sentiment = (typeof SENTIMENT_VALUES)[number]

export const ARTICLE_FORMATS = ['markdown', 'html'] as const
export type ArticleFormat = (typeof ARTICLE_FORMATS)[number]

export const ARTICLE_STATUSES = ['draft', 'ready'] as const
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number]

export const PLAN_TIERS = ['starter', 'pro', 'agency'] as const
export type PlanTier = (typeof PLAN_TIERS)[number]

// Plan tiers — see CLAUDE.md "Pricing tiers". Display name: `starter` = "Basic".
// The `starter` key is kept (no rename) to avoid a breaking DB/enum/payment migration.
// `models` = how many LLM providers the plan may use (Basic = 1, i.e. Gemini only).
export const PLAN_LIMITS: Record<PlanTier, { prompts: number | null; models: number; articlesPerMonth: number | null }> = {
  starter: { prompts: 25, models: 1, articlesPerMonth: 5 },    // "Basic" — Gemini only
  pro: { prompts: 100, models: 4, articlesPerMonth: 30 },
  agency: { prompts: 300, models: 4, articlesPerMonth: 100 },
}

// Which LLM providers each plan is allowed to query. `models` count above must match
// this list's length per tier — kept separate so the scan worker has an explicit,
// unambiguous set instead of slicing LLM_MODELS by count (order-dependent, fragile).
export const PLAN_MODELS: Record<PlanTier, readonly LLMModel[]> = {
  starter: ['gemini'],
  pro: LLM_MODELS,
  agency: LLM_MODELS,
}

export const QUERY_REPEAT_COUNT = 5
export const MAX_CONCURRENT_JOBS = 3
