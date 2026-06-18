import axios from 'axios'
import { withRetry } from '../../utils/retry'
import { rateLimiters } from '../../utils/rate-limiter'

const BASE_URL = 'https://api.perplexity.ai/chat/completions'
const MODEL = 'sonar'

export async function query(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error('[PERPLEXITY] PERPLEXITY_API_KEY is not set')

  await rateLimiters.perplexity.throttle()

  return withRetry(async () => {
    const res = await axios.post(
      BASE_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
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
    if (!content) throw new Error('[PERPLEXITY] Empty response')
    return content as string
  })
}
