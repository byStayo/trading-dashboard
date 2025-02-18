import Redis, { Cluster, RedisOptions } from 'ioredis';
import { z } from 'zod';
import { EventEmitter } from 'events';
import { logger } from './logger';
import { metrics } from './metrics';

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 60 * 1000, // 1 minute
  MARKET_DATA_TTL: 5 * 1000, // 5 seconds for market data
  COMPANY_INFO_TTL: 24 * 60 * 60 * 1000, // 24 hours for company info
  BATCH_SIZE: 100,
  MAX_KEYS_TO_SCAN: 1000,
  CLUSTER_RETRY_DELAY: 2000,
  MAX_CLUSTER_RETRIES: 5,
  METRICS_INTERVAL: 60 * 1000, // 1 minute
};

// Cache key patterns
export const CACHE_KEYS = {
  MARKET_DATA: 'market:data:',
  COMPANY_INFO: 'company:info:',
  AGGREGATE_DATA: 'aggregate:data:',
  SNAPSHOT_DATA: 'snapshot:data:',
  TECHNICAL_DATA: 'technical:data:',
  NEWS: 'news:data:',
  METRICS: 'metrics:',
} as const;

// Cache entry schema for validation
const CacheEntrySchema = z.object({
  data: z.unknown(),
  timestamp: z.number(),
  ttl: z.number(),
  source: z.enum(['websocket', 'rest', 'cache']),
  version: z.string(),
  metadata: z.object({
    priority: z.number().min(0).max(10),
    tags: z.array(z.string()),
    compressionEnabled: z.boolean(),
  }).optional(),
});

type CacheEntry = z.infer<typeof CacheEntrySchema>;

interface CacheOptions {
  ttl?: number;
  source?: CacheEntry['source'];
  tags?: string[];
  priority?: number;
  compressionEnabled?: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  latency: number[];
  size: number;
  memory: number;
  operations: {
    set: number;
    get: number;
    delete: number;
  };
}

class CacheManager extends EventEmitter {
  private static instance: CacheManager;
  private redis!: Redis | Cluster;
  private version: string;
  private metrics: CacheMetrics;
  private metricsInterval: NodeJS.Timeout | null = null;
  private warmupInProgress: boolean;

  private constructor() {
    super();
    this.initializeRedis();
    this.version = process.env.CACHE_VERSION || '1.0.0';
    this.metrics = this.initializeMetrics();
    this.warmupInProgress = false;
    this.setupMetricsCollection();
    this.setupErrorHandling();
  }

  private initializeMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      latency: [],
      size: 0,
      memory: 0,
      operations: {
        set: 0,
        get: 0,
        delete: 0,
      },
    };
  }

  private initializeRedis() {
    const redisConfig: RedisOptions = {
      retryStrategy: (times) => {
        if (times > CACHE_CONFIG.MAX_CLUSTER_RETRIES) {
          return null; // Stop retrying
        }
        return Math.min(times * CACHE_CONFIG.CLUSTER_RETRY_DELAY, 5000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    };

    if (process.env.REDIS_CLUSTER_ENABLED === 'true') {
      const nodes = process.env.REDIS_CLUSTER_NODES?.split(',') || [];
      this.redis = new Cluster(nodes.map(node => ({ host: node, port: 6379 })), {
        ...redisConfig,
        scaleReads: 'slave',
        clusterRetryStrategy: redisConfig.retryStrategy,
      });
    } else {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl, redisConfig);
    }
  }

  private setupMetricsCollection() {
    this.metricsInterval = setInterval(async () => {
      try {
        const info = await this.redis.info();
        const memory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0', 10);
        
        this.metrics.memory = memory;
        await this.saveMetrics();
        
        // Reset latency array after calculating percentiles
        this.metrics.latency = [];
        
        // Emit metrics event for monitoring
        this.emit('metrics', this.getMetricsSummary());
      } catch (error) {
        logger.error('Error collecting cache metrics:', error);
      }
    }, CACHE_CONFIG.METRICS_INTERVAL);
  }

  private async saveMetrics() {
    const timestamp = Date.now();
    const metricsKey = `${CACHE_KEYS.METRICS}${timestamp}`;
    
    await this.redis.set(metricsKey, JSON.stringify(this.metrics), 'EX', 86400); // Store for 24 hours
  }

  private getMetricsSummary() {
    const latencyPercentiles = this.calculatePercentiles(this.metrics.latency);
    return {
      ...this.metrics,
      latencyPercentiles,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses),
      timestamp: Date.now(),
    };
  }

  private calculatePercentiles(values: number[]) {
    if (values.length === 0) return { p50: 0, p90: 0, p99: 0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  private setupErrorHandling() {
    this.redis.on('error', (error) => {
      logger.error('Redis error:', error);
      this.emit('error', error);
    });

    this.redis.on('connect', () => {
      logger.info('Connected to Redis');
      this.emit('connect');
    });

    this.redis.on('ready', () => {
      logger.info('Redis is ready');
      this.emit('ready');
    });

    this.redis.on('close', () => {
      logger.warn('Redis connection closed');
      this.emit('close');
    });
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private generateKey(key: string, prefix: keyof typeof CACHE_KEYS): string {
    return `${CACHE_KEYS[prefix]}${key}:v${this.version}`;
  }

  async set(
    key: string,
    data: unknown,
    prefix: keyof typeof CACHE_KEYS,
    options: CacheOptions = {}
  ): Promise<void> {
    const startTime = Date.now();
    const fullKey = this.generateKey(key, prefix);
    
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: options.ttl || CACHE_CONFIG.DEFAULT_TTL,
        source: options.source || 'cache',
        version: this.version,
        metadata: {
          priority: options.priority || 5,
          tags: options.tags || [],
          compressionEnabled: options.compressionEnabled || false,
        },
      };

      let valueToStore = JSON.stringify(entry);
      
      if (options.compressionEnabled) {
        // Implement compression if needed
        // valueToStore = await compress(valueToStore);
      }

      await this.redis.set(
        fullKey,
        valueToStore,
        'PX',
        entry.ttl
      );

      if (options.tags?.length) {
        await Promise.all([
          this.redis.sadd(`tags:${fullKey}`, ...options.tags),
          ...options.tags.map(tag =>
            this.redis.sadd(`tag:${tag}`, fullKey)
          ),
        ]);
      }

      // Update metrics
      this.metrics.operations.set++;
      this.metrics.latency.push(Date.now() - startTime);
      
    } catch (error) {
      logger.error('Cache set error:', error);
      this.emit('error', error);
      throw new Error('Failed to set cache entry');
    }
  }

  async get<T>(key: string, prefix: keyof typeof CACHE_KEYS): Promise<T | null> {
    const startTime = Date.now();
    const fullKey = this.generateKey(key, prefix);

    try {
      const rawData = await this.redis.get(fullKey);
      if (!rawData) {
        this.metrics.misses++;
        return null;
      }

      let parsedData = rawData;
      // if (isCompressed(rawData)) {
      //   parsedData = await decompress(rawData);
      // }

      const entry = CacheEntrySchema.parse(JSON.parse(parsedData));
      
      // Check if data is stale based on TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.redis.del(fullKey);
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      this.metrics.latency.push(Date.now() - startTime);
      
      return entry.data as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      this.emit('error', error);
      return null;
    }
  }

  async warmUp(entries: Array<{ key: string; data: unknown; prefix: keyof typeof CACHE_KEYS; options?: CacheOptions }>) {
    if (this.warmupInProgress) {
      logger.warn('Cache warmup already in progress');
      return;
    }

    this.warmupInProgress = true;
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    try {
      // Sort entries by priority
      const sortedEntries = entries.sort((a, b) => 
        (b.options?.priority || 5) - (a.options?.priority || 5)
      );

      // Process in batches to avoid overwhelming Redis
      for (let i = 0; i < sortedEntries.length; i += CACHE_CONFIG.BATCH_SIZE) {
        const batch = sortedEntries.slice(i, i + CACHE_CONFIG.BATCH_SIZE);
        
        await Promise.all(
          batch.map(async ({ key, data, prefix, options }) => {
            try {
              await this.set(key, data, prefix, options);
              successCount++;
            } catch (error) {
              errorCount++;
              logger.error(`Error warming up cache for key ${key}:`, error);
            }
          })
        );

        // Small delay between batches
        if (i + CACHE_CONFIG.BATCH_SIZE < sortedEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally {
      this.warmupInProgress = false;
      const duration = Date.now() - startTime;
      
      logger.info(`Cache warmup completed in ${duration}ms. Success: ${successCount}, Errors: ${errorCount}`);
      this.emit('warmupComplete', { duration, successCount, errorCount });
    }
  }

  async invalidate(key: string, prefix: keyof typeof CACHE_KEYS): Promise<void> {
    const fullKey = this.generateKey(key, prefix);

    try {
      const startTime = Date.now();
      
      // Get tags associated with the key
      const tags = await this.redis.smembers(`tags:${fullKey}`);
      
      // Remove key from all tag sets
      await Promise.all([
        this.redis.del(fullKey),
        this.redis.del(`tags:${fullKey}`),
        ...tags.map(tag => this.redis.srem(`tag:${tag}`, fullKey)),
      ]);

      this.metrics.operations.delete++;
      this.metrics.latency.push(Date.now() - startTime);
      
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      this.emit('error', error);
      throw new Error('Failed to invalidate cache entry');
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.redis instanceof Cluster) {
        // For cluster, we need to clear each node
        const nodes = this.redis.nodes('master');
        await Promise.all(nodes.map(node => node.flushdb()));
      } else {
        await this.redis.flushdb();
      }
      
      this.metrics = this.initializeMetrics();
      this.emit('clear');
      
    } catch (error) {
      logger.error('Cache clear error:', error);
      this.emit('error', error);
      throw new Error('Failed to clear cache');
    }
  }

  async disconnect(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    await this.redis.quit();
    this.emit('disconnect');
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      logger.error('Error getting TTL:', error);
      return 0;
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      // Get all keys associated with the tag
      const keys = await this.redis.smembers(`tag:${tag}`);
      
      if (keys.length > 0) {
        // Remove all keys and their tag associations
        await Promise.all([
          this.redis.del(...keys),
          ...keys.map(key => this.redis.del(`tags:${key}`)),
          this.redis.del(`tag:${tag}`),
        ]);
      }
    } catch (error) {
      logger.error('Tag invalidation error:', error);
      throw new Error('Failed to invalidate by tag');
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance(); 