import axios from 'axios'
import { withRetry } from '../../utils/retry'
import { rateLimiters } from '../../utils/rate-limiter'

const BASE_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o'

import type { LLMResult } from './perplexity'

export async function query(prompt: string): Promise<LLMResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('[OPENAI] OPENAI_API_KEY is not set')

  await rateLimiters.openai.throttle()

  return withRetry(async () => {
    const res = await axios.post(
      BASE_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      }
    )

    const content = res.data?.choices?.[0]?.message?.content
    if (!content) throw new Error('[OPENAI] Empty response')
    return { content: content as string, citations: [] }
  })
}
