import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/auth-service';
import { rateLimiterService } from '../services/rate-limiter';
import { rbacService } from '../services/rbac-service';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

interface AuthOptions {
  required?: boolean;
  permissions?: string[];
}

export async function authMiddleware(
  req: NextRequest,
  options: AuthOptions = { required: true }
) {
  const startTime = Date.now();
  const identifier = req.ip || 'unknown';

  try {
    // Check rate limit first
    const rateLimitResult = await rateLimiterService.consume(identifier, 'API');
    if (rateLimitResult.blocked) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.blockExpiry,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.blockExpiry?.toString() || '300',
          },
        }
      );
    }

    // Add rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': rateLimitResult.total.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.reset.toString(),
    });

    // Check for API key first
    const apiKey = req.headers.get('x-api-key');
    if (apiKey) {
      const user = await authService.validateApiKey(apiKey);
      if (user) {
        // Check permissions if required
        if (options.permissions?.length) {
          const hasAllPermissions = await Promise.all(
            options.permissions.map(permission =>
              rbacService.hasPermission(user.id, permission)
            )
          );

          if (!hasAllPermissions.every(Boolean)) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403, headers }
            );
          }
        }

        // Add user to request
        (req as any).user = user;
        return NextResponse.next({ headers });
      }
    }

    // Check for JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      if (!options.required) {
        return NextResponse.next({ headers });
      }
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await authService.verifyToken(token);
      
      // Check permissions if required
      if (options.permissions?.length) {
        const hasAllPermissions = await Promise.all(
          options.permissions.map(permission =>
            rbacService.hasPermission(payload.sub, permission)
          )
        );

        if (!hasAllPermissions.every(Boolean)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403, headers }
          );
        }
      }

      // Add user to request
      (req as any).user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return NextResponse.next({ headers });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers }
      );
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    metrics.record('auth_middleware_errors', 1);

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  } finally {
    // Record metrics
    const duration = Date.now() - startTime;
    metrics.record('auth_middleware_duration', duration);
  }
}

// Helper to extract user from request
export function getUser(req: NextRequest) {
  return (req as any).user;
}

// Helper to check permissions
export async function checkPermissions(
  req: NextRequest,
  permissions: string[]
): Promise<boolean> {
  const user = getUser(req);
  if (!user) return false;

  try {
    const results = await Promise.all(
      permissions.map(permission =>
        rbacService.hasPermission(user.id, permission)
      )
    );

    return results.every(Boolean);
  } catch (error) {
    logger.error('Permission check error:', error);
    return false;
  }
} 