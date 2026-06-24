import axios from 'axios'
import { withRetry } from '../../utils/retry'
import { rateLimiters } from '../../utils/rate-limiter'

const BASE_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

export async function query(prompt: string, maxTokens = 1024): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('[ANTHROPIC] ANTHROPIC_API_KEY is not set')

  await rateLimiters.anthropic.throttle()

  return withRetry(async () => {
    const res = await axios.post(
      BASE_URL,
      {
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      }
    )

    const content = res.data?.content?.[0]?.text
    if (!content) throw new Error('[ANTHROPIC] Empty response')
    return content as string
  })
}
