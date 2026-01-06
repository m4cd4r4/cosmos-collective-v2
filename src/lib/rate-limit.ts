/**
 * Rate Limiting Utility
 * Prevents API abuse using in-memory token bucket algorithm
 *
 * Usage:
 * const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 60000 })
 * const allowed = await limiter.check(userId)
 */

interface RateLimiterOptions {
  tokensPerInterval: number // Number of requests allowed
  interval: number // Time window in milliseconds
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

export class RateLimiter {
  private buckets: Map<string, TokenBucket>
  private options: RateLimiterOptions

  constructor(options: RateLimiterOptions) {
    this.buckets = new Map()
    this.options = options

    // Clean up old buckets every minute
    setInterval(() => this.cleanup(), 60000)
  }

  async check(identifier: string): Promise<boolean> {
    const now = Date.now()
    let bucket = this.buckets.get(identifier)

    if (!bucket) {
      bucket = {
        tokens: this.options.tokensPerInterval,
        lastRefill: now,
      }
      this.buckets.set(identifier, bucket)
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill
    const intervalsPassed = timePassed / this.options.interval
    const newTokens = Math.floor(intervalsPassed * this.options.tokensPerInterval)

    if (newTokens > 0) {
      bucket.tokens = Math.min(
        this.options.tokensPerInterval,
        bucket.tokens + newTokens
      )
      bucket.lastRefill = now
    }

    // Check if request is allowed
    if (bucket.tokens > 0) {
      bucket.tokens--
      return true
    }

    return false
  }

  private cleanup() {
    const now = Date.now()
    const maxAge = this.options.interval * 2

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters for common use cases
export const apiLimiter = new RateLimiter({
  tokensPerInterval: 100, // 100 requests
  interval: 60000, // per minute
})

export const imageProxyLimiter = new RateLimiter({
  tokensPerInterval: 50, // 50 image requests
  interval: 60000, // per minute
})

export const authLimiter = new RateLimiter({
  tokensPerInterval: 5, // 5 login attempts
  interval: 300000, // per 5 minutes
})

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (depending on deployment)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  // In production, you might also check authentication
  // const userId = await getUserId(request)
  // return userId || ip

  return ip
}
