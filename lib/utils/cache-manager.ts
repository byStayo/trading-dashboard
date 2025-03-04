import Redis, { Cluster, RedisOptions } from 'ioredis'
import { EventEmitter } from 'events'
import { logger } from './logger'
import { metrics } from './metrics'

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  tags?: string[] // Tags for cache invalidation
}

interface CacheEntry<T> {
  value: T
  expiry: number
  tags: string[]
}

type CacheNamespace = 'MARKET_DATA' | 'AUTH' | 'CONFIG'

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 60 * 1000, // 1 minute
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
  METRICS_INTERVAL: 60 * 1000, // 1 minute for metrics collection
  MAX_CLUSTER_RETRIES: 5,
  CLUSTER_RETRY_DELAY: 2000,
}

export class CacheManager extends EventEmitter {
  private static instance: CacheManager
  private redis: Redis | Cluster
  private cleanupInterval: NodeJS.Timeout | null = null
  private metricsInterval: NodeJS.Timeout | null = null

  private constructor() {
    super()
    this.initializeRedis()
    this.startCleanupInterval()
    this.setupMetricsCollection()
    this.setupErrorHandling()
  }

  private initializeRedis() {
    const redisConfig: RedisOptions = {
      retryStrategy: (times) => {
        if (times > CACHE_CONFIG.MAX_CLUSTER_RETRIES) {
          return null // Stop retrying
        }
        return Math.min(times * CACHE_CONFIG.CLUSTER_RETRY_DELAY, 5000)
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    }

    if (process.env.REDIS_CLUSTER_ENABLED === 'true') {
      const nodes = process.env.REDIS_CLUSTER_NODES?.split(',') || []
      this.redis = new Cluster(nodes.map(node => ({ host: node, port: 6379 })), {
        ...redisConfig,
        scaleReads: 'slave',
        clusterRetryStrategy: redisConfig.retryStrategy,
      })
    } else {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      this.redis = new Redis(redisUrl, redisConfig)
    }
  }

  private setupErrorHandling() {
    this.redis.on('error', (error) => {
      logger.error('Redis error:', error)
      this.emit('error', error)
    })

    this.redis.on('connect', () => {
      logger.info('Connected to Redis')
      this.emit('connect')
    })

    this.redis.on('ready', () => {
      logger.info('Redis is ready')
      this.emit('ready')
    })

    this.redis.on('close', () => {
      logger.warn('Redis connection closed')
      this.emit('close')
    })
  }

  private setupMetricsCollection() {
    // Register cache metrics
    metrics.register({
      name: 'cache_hits',
      help: 'Cache hit count',
      type: 'counter',
      labels: ['namespace'],
    })

    metrics.register({
      name: 'cache_misses',
      help: 'Cache miss count',
      type: 'counter',
      labels: ['namespace'],
    })

    metrics.register({
      name: 'cache_operations',
      help: 'Cache operation count',
      type: 'counter',
      labels: ['namespace', 'operation'],
    })

    this.metricsInterval = setInterval(async () => {
      try {
        // Report Redis info metrics if available
        const info = await this.redis.info()
        const memory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0', 10)
        
        metrics.record('redis_memory_usage', memory)
      } catch (error) {
        logger.error('Error collecting Redis metrics:', error)
      }
    }, CACHE_CONFIG.METRICS_INTERVAL)
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private startCleanupInterval() {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, CACHE_CONFIG.CLEANUP_INTERVAL)
  }

  private async cleanup() {
    try {
      // Find and remove expired keys - Redis takes care of TTL automatically, 
      // but we can do some housekeeping for any custom tags or tracking
      logger.debug('Running cache cleanup')
    } catch (error) {
      logger.error('Error during cache cleanup:', error)
    }
  }

  private getRedisKey(namespace: CacheNamespace, key: string): string {
    return `${namespace}:${key}`
  }

  public async get<T>(key: string, namespace: CacheNamespace): Promise<T | null> {
    try {
      const redisKey = this.getRedisKey(namespace, key)
      const data = await this.redis.get(redisKey)
      
      if (!data) {
        metrics.record('cache_misses', 1, { namespace })
        return null
      }
      
      const entry = JSON.parse(data) as CacheEntry<T>
      
      // Check if manually expired (Redis handles TTL expiry automatically)
      if (entry.expiry && entry.expiry < Date.now()) {
        await this.invalidate(key, namespace)
        metrics.record('cache_misses', 1, { namespace })
        return null
      }
      
      metrics.record('cache_hits', 1, { namespace })
      return entry.value
    } catch (error) {
      logger.error('Error getting cache entry:', error)
      return null
    }
  }

  public async set<T>(
    key: string,
    value: T,
    namespace: CacheNamespace,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const redisKey = this.getRedisKey(namespace, key)
      const ttl = options.ttl || CACHE_CONFIG.DEFAULT_TTL
      
      const entry: CacheEntry<T> = {
        value,
        expiry: ttl ? Date.now() + ttl : 0,
        tags: options.tags || []
      }
      
      // Save the entry with the specified TTL
      await this.redis.set(
        redisKey, 
        JSON.stringify(entry),
        'PX', // Milliseconds expiry
        ttl
      )
      
      // Store tags for future invalidation if provided
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${namespace}:${tag}`, redisKey)
        }
      }
      
      metrics.record('cache_operations', 1, { namespace, operation: 'set' })
    } catch (error) {
      logger.error('Error setting cache entry:', error)
    }
  }

  public async invalidate(key: string, namespace: CacheNamespace): Promise<void> {
    try {
      const redisKey = this.getRedisKey(namespace, key)
      
      // Get the entry first to check for tags
      const data = await this.redis.get(redisKey)
      if (data) {
        try {
          const entry = JSON.parse(data) as CacheEntry<any>
          
          // Remove tag references if any
          if (entry.tags && entry.tags.length > 0) {
            for (const tag of entry.tags) {
              await this.redis.srem(`tag:${namespace}:${tag}`, redisKey)
            }
          }
        } catch (error) {
          // Parsing error, continue with deletion
          logger.warn('Error parsing cache entry during invalidation:', error)
        }
      }
      
      // Delete the key
      await this.redis.del(redisKey)
      metrics.record('cache_operations', 1, { namespace, operation: 'invalidate' })
    } catch (error) {
      logger.error('Error invalidating cache entry:', error)
    }
  }

  public async invalidateByTag(tag: string, namespace: CacheNamespace): Promise<void> {
    try {
      const tagKey = `tag:${namespace}:${tag}`
      
      // Get all keys with this tag
      const keys = await this.redis.smembers(tagKey)
      
      if (keys.length > 0) {
        // Delete all keys
        await this.redis.del(...keys)
        
        // Clean up the tag set
        await this.redis.del(tagKey)
      }
      
      metrics.record('cache_operations', 1, { namespace, operation: 'invalidate_by_tag' })
    } catch (error) {
      logger.error('Error invalidating cache by tag:', error)
    }
  }

  public async invalidateNamespace(namespace: CacheNamespace): Promise<void> {
    try {
      // Use Redis scan to find all keys in the namespace
      let cursor = '0'
      const pattern = `${namespace}:*`
      
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        )
        
        cursor = nextCursor
        
        // Delete the found keys in batches
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } while (cursor !== '0')
      
      // Also clean up any tag sets for this namespace
      cursor = '0'
      const tagPattern = `tag:${namespace}:*`
      
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          tagPattern,
          'COUNT',
          100
        )
        
        cursor = nextCursor
        
        // Delete the found tag sets
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } while (cursor !== '0')
      
      metrics.record('cache_operations', 1, { namespace, operation: 'invalidate_namespace' })
    } catch (error) {
      logger.error('Error invalidating namespace:', error)
    }
  }

  public async getKeyTTL(key: string, namespace: CacheNamespace): Promise<number> {
    try {
      const redisKey = this.getRedisKey(namespace, key)
      const ttl = await this.redis.pttl(redisKey) // Get TTL in milliseconds
      
      return ttl > 0 ? ttl : 0
    } catch (error) {
      logger.error('Error getting key TTL:', error)
      return 0
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Ping Redis to check connection
      await this.redis.ping()
      
      // Try to set and get a test value
      const testKey = '_health_check'
      const testNamespace: CacheNamespace = 'CONFIG'
      const testValue = `test-${Date.now()}`
      
      await this.set(testKey, testValue, testNamespace, { ttl: 1000 })
      const retrievedValue = await this.get<string>(testKey, testNamespace)
      
      // Clean up
      await this.invalidate(testKey, testNamespace)
      
      return retrievedValue === testValue
    } catch (error) {
      logger.error('Cache health check failed:', error)
      return false
    }
  }

  public async destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = null
    }
    
    // Close Redis connection
    await this.redis.quit()
    logger.info('Redis connection closed')
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance(); 