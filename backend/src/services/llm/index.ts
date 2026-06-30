import type { LLMModel } from '../../../../shared/constants'
import { query as queryOpenAI } from './openai'
import { query as queryGemini } from './gemini'
import { query as queryPerplexity } from './perplexity'
import { query as queryAnthropic } from './anthropic'
import type { LLMResult } from './perplexity'

export type { LLMResult }

export async function queryModel(model: LLMModel, prompt: string): Promise<LLMResult> {
  switch (model) {
    case 'openai':
      return queryOpenAI(prompt)
    case 'gemini':
      return queryGemini(prompt)
    case 'perplexity':
      return queryPerplexity(prompt)
    case 'anthropic':
      return queryAnthropic(prompt)
    default:
      throw new Error(`[LLM] Unknown model: ${model}`)
  }
}
