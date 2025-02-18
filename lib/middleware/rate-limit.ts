import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '../utils/cache-manager';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
};

export async function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
) {
  const ip = req.ip || 'unknown';
  const key = `ratelimit:${ip}`;

  try {
    // Get current count from Redis
    const currentCount = await cacheManager.get<number>(key, 'MARKET_DATA');
    
    if (currentCount === null) {
      // First request in window
      await cacheManager.set(key, 1, 'MARKET_DATA', {
        ttl: config.windowMs,
      });
      return NextResponse.next();
    }

    if (currentCount >= config.max) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: config.windowMs / 1000,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': (config.windowMs / 1000).toString(),
          },
        }
      );
    }

    // Increment counter
    await cacheManager.set(key, currentCount + 1, 'MARKET_DATA', {
      ttl: config.windowMs,
    });

    return NextResponse.next();
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request to proceed
    return NextResponse.next();
  }
} 