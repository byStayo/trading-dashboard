import { CacheManager } from '../utils/cache-manager';
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
  warning?: string;
}

interface RateLimitKeys {
  points: string;
  block: string;
}

const RATE_LIMIT_DEFAULTS = {
  API: {
    points: 20,
    duration: 60,
    blockDuration: 300,
  },
  WEBSOCKET: {
    points: 30,
    duration: 60,
    blockDuration: 600,
  },
};

// Add WebSocket connection pooling
const WS_CONNECTION_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  INITIAL_BACKOFF: 1000, // 1 second
  MAX_BACKOFF: 30000, // 30 seconds
  BACKOFF_MULTIPLIER: 2,
};

export class RateLimiter {
  private static instance: RateLimiter;
  private cacheManager: CacheManager;
  private wsConnectionAttempts: Map<string, number> = new Map();
  private wsLastAttemptTime: Map<string, number> = new Map();

  private constructor() {
    this.cacheManager = CacheManager.getInstance();
    this.setupMetrics();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
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

    metrics.register({
      name: 'ws_connection_attempts',
      help: 'Number of WebSocket connection attempts',
      type: 'counter',
      labels: ['status'],
    });
  }

  private generateKeys(identifier: string, type: 'API' | 'WEBSOCKET'): RateLimitKeys {
    return {
      points: `ratelimit:${type}:${identifier}:points`,
      block: `ratelimit:${type}:${identifier}:block`,
    };
  }

  async canConnect(identifier: string): Promise<{ allowed: boolean; backoff?: number }> {
    const attempts = this.wsConnectionAttempts.get(identifier) || 0;
    const lastAttempt = this.wsLastAttemptTime.get(identifier) || 0;
    const now = Date.now();

    if (attempts >= WS_CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      const backoff = Math.min(
        WS_CONNECTION_CONFIG.INITIAL_BACKOFF * Math.pow(WS_CONNECTION_CONFIG.BACKOFF_MULTIPLIER, attempts),
        WS_CONNECTION_CONFIG.MAX_BACKOFF
      );

      if (now - lastAttempt < backoff) {
        return { allowed: false, backoff: backoff - (now - lastAttempt) };
      }
    }

    this.wsConnectionAttempts.set(identifier, attempts + 1);
    this.wsLastAttemptTime.set(identifier, now);
    
    metrics.record('ws_connection_attempts', 1, { status: attempts === 0 ? 'initial' : 'retry' });
    
    return { allowed: true };
  }

  resetConnectionAttempts(identifier: string) {
    this.wsConnectionAttempts.delete(identifier);
    this.wsLastAttemptTime.delete(identifier);
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
      const blocked = await this.cacheManager.get<boolean>(keys.block, 'MARKET_DATA');
      if (blocked) {
        const blockExpiry = await this.cacheManager.getKeyTTL(keys.block, 'MARKET_DATA');
        metrics.record('rate_limit_requests', 1, { status: 'blocked', type });
        return {
          remaining: 0,
          reset: now + blockExpiry,
          total: config.points,
          blocked: true,
          blockExpiry,
        };
      }

      // Get current points
      const pointsData = await this.cacheManager.get<{
        points: number;
        expires: number;
      }>(keys.points, 'MARKET_DATA');

      if (!pointsData) {
        // First request
        await this.cacheManager.set(
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
        await this.cacheManager.set(
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
          await this.cacheManager.set(
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
      await this.cacheManager.set(
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
        this.cacheManager.invalidate(keys.points, 'MARKET_DATA'),
        this.cacheManager.invalidate(keys.block, 'MARKET_DATA'),
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
        this.cacheManager.get<{
          points: number;
          expires: number;
        }>(keys.points, 'MARKET_DATA'),
        this.cacheManager.get<boolean>(keys.block, 'MARKET_DATA'),
      ]);

      if (blocked) {
        const blockExpiry = await this.cacheManager.getKeyTTL(keys.block, 'MARKET_DATA');
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
} 