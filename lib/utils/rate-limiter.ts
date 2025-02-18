import { RateLimiter } from 'limiter';

// Global rate limiters
const globalLimiter = new RateLimiter({
  tokensPerInterval: 300, // Increased from 100 to 300 to handle more concurrent requests
  interval: 'minute'
});

// Per-IP rate limiters
const ipLimiters = new Map<string, RateLimiter>();

// Per-endpoint rate limiters
const endpointLimiters = new Map<string, RateLimiter>();

export interface RateLimitConfig {
  tokensPerInterval: number;
  interval: 'second' | 'minute' | 'hour';
  maxWaitMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

export class RateLimitManager {
  private static instance: RateLimitManager;
  private constructor() {}

  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }

  async checkRateLimit(
    ip: string,
    endpoint: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    // Get or create IP limiter
    let ipLimiter = ipLimiters.get(ip);
    if (!ipLimiter) {
      ipLimiter = new RateLimiter({
        tokensPerInterval: config.tokensPerInterval,
        interval: config.interval
      });
      ipLimiters.set(ip, ipLimiter);
    }

    // Get or create endpoint limiter
    let endpointLimiter = endpointLimiters.get(endpoint);
    if (!endpointLimiter) {
      endpointLimiter = new RateLimiter({
        tokensPerInterval: config.tokensPerInterval * 5, // Endpoint limit is more lenient
        interval: config.interval
      });
      endpointLimiters.set(endpoint, endpointLimiter);
    }

    try {
      // Check all limiters
      await Promise.all([
        globalLimiter.removeTokens(1),
        ipLimiter.removeTokens(1),
        endpointLimiter.removeTokens(1)
      ]);

      return { success: true };
    } catch (error) {
      // Calculate retry after based on the most restrictive limiter
      const retryAfter = Math.max(
        await globalLimiter.getTokensRemaining(),
        await ipLimiter.getTokensRemaining(),
        await endpointLimiter.getTokensRemaining()
      );

      return {
        success: false,
        retryAfter: Math.ceil(retryAfter * 1000) // Convert to milliseconds
      };
    }
  }

  // Clean up old IP limiters periodically
  cleanupOldLimiters() {
    const now = Date.now();
    for (const [ip, limiter] of ipLimiters.entries()) {
      if (now - limiter.getTokensRemaining() > 24 * 60 * 60 * 1000) { // 24 hours
        ipLimiters.delete(ip);
      }
    }
  }
}

// Export singleton instance
export const rateLimitManager = RateLimitManager.getInstance();

interface RateLimiterConfig {
  tokensPerInterval: number;
  interval: number;
  burstSize?: number;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly tokensPerInterval: number;
  private readonly interval: number;
  private readonly maxTokens: number;

  constructor(config: RateLimiterConfig) {
    this.tokensPerInterval = config.tokensPerInterval;
    this.interval = config.interval;
    this.maxTokens = config.burstSize || config.tokensPerInterval;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  private refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.interval) * this.tokensPerInterval;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  public async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    // Calculate time until next token
    const timeUntilNextToken = this.interval - ((Date.now() - this.lastRefill) % this.interval);
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.refillTokens();
        this.tokens--;
        resolve();
      }, timeUntilNextToken);
    });
  }

  public getTokenCount(): number {
    this.refillTokens();
    return this.tokens;
  }

  public hasToken(): boolean {
    this.refillTokens();
    return this.tokens > 0;
  }
} 