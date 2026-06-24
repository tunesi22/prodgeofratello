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

export const PLAN_LIMITS: Record<PlanTier, { prompts: number | null; models: number; articlesPerMonth: number | null }> = {
  starter: { prompts: 25, models: 3, articlesPerMonth: 4 },
  pro: { prompts: 100, models: 4, articlesPerMonth: 8 },
  agency: { prompts: null, models: 4, articlesPerMonth: null },
}

export const QUERY_REPEAT_COUNT = 5
export const MAX_CONCURRENT_JOBS = 3
