import { Request, Response, NextFunction } from 'express'

// Tiny in-memory fixed-window rate limiter.
//
// PRODUCTION NOTE: this stores counters in process memory, so it only works for
// a single instance. Behind a load balancer or with multiple workers each
// process keeps its own window, which weakens the limit. For production use a
// shared store (Redis) keyed the same way so the limit is global.

type Options = {
  windowMs: number
  max: number
  keyPrefix?: string
}

type Bucket = {
  count: number
  resetAt: number
}

export function rateLimit({ windowMs, max, keyPrefix = '' }: Options) {
  const buckets = new Map<string, Bucket>()

  // Periodically drop expired buckets so memory does not grow unbounded.
  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, windowMs)
  // Do not keep the event loop alive just for the sweeper.
  if (typeof sweep.unref === 'function') sweep.unref()

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    const key = `${keyPrefix}:${ip}`
    const now = Date.now()

    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }

    bucket.count += 1

    const remaining = Math.max(0, max - bucket.count)
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter
      })
    }

    next()
  }
}
