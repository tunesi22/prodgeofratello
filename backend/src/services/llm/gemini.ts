import axios from 'axios'
import { withRetry } from '../../utils/retry'
import { rateLimiters } from '../../utils/rate-limiter'

const MODEL = 'gemini-2.5-flash'

export async function query(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('[GEMINI] GEMINI_API_KEY is not set')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  await rateLimiters.gemini.throttle()

  return withRetry(async () => {
    const res = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30_000,
      }
    )

    const content = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('[GEMINI] Empty response')
    return content as string
  })
}
