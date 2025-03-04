import { NextResponse } from 'next/server';
import { cacheManager } from '@/lib/utils/cache-manager';
import { metrics } from '@/lib/utils/metrics';
import { logger } from '@/lib/utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  services: {
    redis: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      uptime: number;
    };
  };
  metrics: {
    requests: number;
    errors: number;
    latency: number;
  };
}

export async function GET() {
  const startTime = Date.now();
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: Date.now(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      redis: {
        status: 'healthy',
        latency: 0,
      },
      api: {
        status: 'healthy',
        uptime: process.uptime(),
      },
    },
    metrics: {
      requests: 0,
      errors: 0,
      latency: 0,
    },
  };

  try {
    // Check Redis connection
    const redisStart = Date.now();
    const redisHealth = await cacheManager.healthCheck();
    status.services.redis.latency = Date.now() - redisStart;
    
    if (!redisHealth) {
      status.services.redis.status = 'unhealthy';
      status.status = 'degraded';
    }

    // Get metrics
    const metricsData = await metrics.getAll();
    status.metrics = {
      requests: Object.entries(metricsData).reduce((sum, [name, values]) => {
        if (name.includes('request') && values.length > 0) {
          return sum + values[values.length - 1].value;
        }
        return sum;
      }, 0),
      errors: Object.entries(metricsData).reduce((sum, [name, values]) => {
        if (name.includes('error') && values.length > 0) {
          return sum + values[values.length - 1].value;
        }
        return sum;
      }, 0),
      latency: Object.entries(metricsData).reduce((sum, [name, values]) => {
        if (name.includes('duration') && values.length > 0) {
          return sum + values[values.length - 1].value;
        }
        return sum;
      }, 0),
    };

    // Calculate overall status
    if (status.services.redis.status === 'unhealthy') {
      status.status = 'unhealthy';
    } else if (status.services.redis.status === 'degraded') {
      status.status = 'degraded';
    }

    // Log health check
    logger.info('Health check completed', {
      status: status.status,
      duration: Date.now() - startTime,
    });

    // Return appropriate status code
    const statusCode = status.status === 'healthy' ? 200 : 
                      status.status === 'degraded' ? 200 : 503;

    return NextResponse.json(status, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    status.status = 'unhealthy';
    status.services.api.status = 'unhealthy';

    return NextResponse.json(status, { status: 503 });
  }
} 