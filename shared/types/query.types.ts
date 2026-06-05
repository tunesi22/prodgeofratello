import type { LLMModel, Sentiment } from '../constants'

export interface IQueryResult {
  _id: string
  promptId: string
  brandId: string
  model: LLMModel
  response: string
  mentioned: boolean
  sentiment: Sentiment
  mentionContext: string
  queriedAt: Date
}

export interface MentionRateResult {
  model: LLMModel
  mentionRate: number
  totalQueries: number
  mentionCount: number
}
