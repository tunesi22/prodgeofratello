class RateLimiter {
  private requestTimes: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async throttle(): Promise<void> {
    const now = Date.now()

    this.requestTimes = this.requestTimes.filter((t) => now - t < this.windowMs)

    if (this.requestTimes.length >= this.maxRequests) {
      const oldest = this.requestTimes[0]
      const waitMs = this.windowMs - (now - oldest) + 100
      await new Promise((resolve) => setTimeout(resolve, waitMs))
      this.requestTimes = this.requestTimes.filter((t) => Date.now() - t < this.windowMs)
    }

    this.requestTimes.push(Date.now())
  }
}

// Per-provider rate limiters (requests per minute)
export const rateLimiters = {
  openai: new RateLimiter(60, 60_000),
  gemini: new RateLimiter(30, 60_000),
  perplexity: new RateLimiter(30, 60_000),
  anthropic: new RateLimiter(50, 60_000),
}
