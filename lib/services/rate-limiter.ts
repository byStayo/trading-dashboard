import { cacheManager } from '../utils/cache-manager';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration?: number;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
  blocked?: boolean;
  blockExpiry?: number;
}

const RATE_LIMIT_DEFAULTS = {
  API: {
    points: 100,
    duration: 60, // 1 minute
    blockDuration: 300, // 5 minutes
  },
  WEBSOCKET: {
    points: 1000,
    duration: 60,
    blockDuration: 300,
  },
};

class RateLimiterService {
  private static instance: RateLimiterService;

  private constructor() {
    this.setupMetrics();
  }

  public static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'rate_limit_requests',
      help: 'Number of rate-limited requests',
      type: 'counter',
      labels: ['status', 'type'],
    });

    metrics.register({
      name: 'rate_limit_blocks',
      help: 'Number of rate limit blocks',
      type: 'counter',
      labels: ['type'],
    });
  }

  private generateKeys(identifier: string, type: 'API' | 'WEBSOCKET') {
    const prefix = `ratelimit:${type.toLowerCase()}`;
    return {
      points: `${prefix}:${identifier}:points`,
      block: `${prefix}:${identifier}:block`,
    };
  }

  async consume(
    identifier: string,
    type: 'API' | 'WEBSOCKET' = 'API',
    config: RateLimitConfig = RATE_LIMIT_DEFAULTS[type]
  ): Promise<RateLimitInfo> {
    const keys = this.generateKeys(identifier, type);
    const now = Math.floor(Date.now() / 1000);

    try {
      // Check if blocked
      const blocked = await cacheManager.get<boolean>(keys.block, 'MARKET_DATA');
      if (blocked) {
        const blockExpiry = await this.getKeyTTL(keys.block);
        metrics.record('rate_limit_requests', 1, { status: 'blocked', type });
        return {
          remaining: 0,
          reset: now + blockExpiry,
          total: config.points,
          blocked: true,
          blockExpiry: blockExpiry,
        };
      }

      // Get current points
      const pointsData = await cacheManager.get<{
        points: number;
        expires: number;
      }>(keys.points, 'MARKET_DATA');

      if (!pointsData) {
        // First request
        await cacheManager.set(
          keys.points,
          { points: config.points - 1, expires: now + config.duration },
          'MARKET_DATA',
          { ttl: config.duration * 1000 }
        );

        metrics.record('rate_limit_requests', 1, { status: 'allowed', type });
        return {
          remaining: config.points - 1,
          reset: now + config.duration,
          total: config.points,
        };
      }

      // Check if expired
      if (now >= pointsData.expires) {
        await cacheManager.set(
          keys.points,
          { points: config.points - 1, expires: now + config.duration },
          'MARKET_DATA',
          { ttl: config.duration * 1000 }
        );

        metrics.record('rate_limit_requests', 1, { status: 'allowed', type });
        return {
          remaining: config.points - 1,
          reset: now + config.duration,
          total: config.points,
        };
      }

      // Check remaining points
      if (pointsData.points <= 0) {
        // Block if configured
        if (config.blockDuration) {
          await cacheManager.set(
            keys.block,
            true,
            'MARKET_DATA',
            { ttl: config.blockDuration * 1000 }
          );
          metrics.record('rate_limit_blocks', 1, { type });
        }

        metrics.record('rate_limit_requests', 1, { status: 'exceeded', type });
        return {
          remaining: 0,
          reset: pointsData.expires,
          total: config.points,
          blocked: true,
          blockExpiry: config.blockDuration,
        };
      }

      // Consume point
      await cacheManager.set(
        keys.points,
        { points: pointsData.points - 1, expires: pointsData.expires },
        'MARKET_DATA',
        { ttl: (pointsData.expires - now) * 1000 }
      );

      metrics.record('rate_limit_requests', 1, { status: 'allowed', type });
      return {
        remaining: pointsData.points - 1,
        reset: pointsData.expires,
        total: config.points,
      };
    } catch (error) {
      logger.error('Rate limit error:', error);
      // On error, allow the request
      return {
        remaining: 1,
        reset: now + config.duration,
        total: config.points,
      };
    }
  }

  async reset(identifier: string, type: 'API' | 'WEBSOCKET' = 'API'): Promise<void> {
    const keys = this.generateKeys(identifier, type);
    try {
      await Promise.all([
        cacheManager.invalidate(keys.points, 'MARKET_DATA'),
        cacheManager.invalidate(keys.block, 'MARKET_DATA'),
      ]);
    } catch (error) {
      logger.error('Error resetting rate limit:', error);
    }
  }

  async getLimit(
    identifier: string,
    type: 'API' | 'WEBSOCKET' = 'API'
  ): Promise<RateLimitInfo | null> {
    const keys = this.generateKeys(identifier, type);
    const config = RATE_LIMIT_DEFAULTS[type];
    const now = Math.floor(Date.now() / 1000);

    try {
      const [pointsData, blocked] = await Promise.all([
        cacheManager.get<{
          points: number;
          expires: number;
        }>(keys.points, 'MARKET_DATA'),
        cacheManager.get<boolean>(keys.block, 'MARKET_DATA'),
      ]);

      if (blocked) {
        const blockExpiry = await this.getKeyTTL(keys.block);
        return {
          remaining: 0,
          reset: now + blockExpiry,
          total: config.points,
          blocked: true,
          blockExpiry,
        };
      }

      if (!pointsData) {
        return {
          remaining: config.points,
          reset: now + config.duration,
          total: config.points,
        };
      }

      return {
        remaining: pointsData.points,
        reset: pointsData.expires,
        total: config.points,
      };
    } catch (error) {
      logger.error('Error getting rate limit:', error);
      return null;
    }
  }

  private async getKeyTTL(key: string): Promise<number> {
    try {
      const ttl = await cacheManager.getTTL(key);
      return Math.max(0, ttl);
    } catch (error) {
      logger.error('Error getting TTL:', error);
      return 0;
    }
  }
}

export const rateLimiterService = RateLimiterService.getInstance(); 