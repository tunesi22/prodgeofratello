interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000 } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err

      const isRateLimit = err?.response?.status === 429
      const isServerError = err?.response?.status >= 500
      const isTimeout = err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT'

      if (!isRateLimit && !isServerError && !isTimeout) {
        throw err
      }

      if (attempt === maxRetries) break

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      const jitter = Math.random() * 500
      console.log(`[RETRY] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay + jitter)}ms...`)
      await sleep(delay + jitter)
    }
  }

  throw lastError!
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
