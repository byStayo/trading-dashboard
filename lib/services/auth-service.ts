import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CacheManager } from '../utils/cache-manager';
import { User } from '../types/user';

/**
 * Authentication Service
 * 
 * Environment variables:
 * - JWT_SECRET: Secret key for signing JWT tokens (required)
 * - JWT_EXPIRY: Token expiry time in zeit/ms format (default: '24h')
 *   Examples: '24h', '1d', '60m', '3600s'
 *   
 * Note: Setting a short expiry time (less than 1 hour) may cause frequent 
 * re-authentication and disrupt user experience. Use the refresh token flow 
 * for maintaining longer sessions with short-lived tokens.
 */

// Schema for JWT payload
export const JWTPayloadSchema = z.object({
  jti: z.string(),
  iat: z.number(),
  exp: z.number(),
  sub: z.string(),
  email: z.string(),
  role: z.enum(['user', 'admin'])
});

export type JWTData = z.infer<typeof JWTPayloadSchema>;

// Configuration
const AUTH_CONFIG = {
  // Use environment variable or default to 24h to maintain backward compatibility
  // This allows configuration without code changes and prevents breaking existing workflows
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
  API_KEY_PREFIX: 'pk_'
};

export class AuthService {
  private static instance: AuthService;
  private cacheManager: CacheManager;
  private jwtSecret: Uint8Array;

  private constructor() {
    this.cacheManager = CacheManager.getInstance();
    this.jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');
    
    // Log the JWT expiry time during initialization to make configuration issues more visible
    logger.info(`JWT token expiry time configured as: ${AUTH_CONFIG.JWT_EXPIRY}`);
    
    // Check if the expiry time is too short (less than 1 hour)
    if (AUTH_CONFIG.JWT_EXPIRY.includes('m') && parseInt(AUTH_CONFIG.JWT_EXPIRY) < 60) {
      logger.warn(`Warning: Short JWT expiry time (${AUTH_CONFIG.JWT_EXPIRY}) may cause frequent re-authentication`);
    }
    
    this.setupMetrics();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'auth_login_attempts',
      help: 'Number of login attempts',
      type: 'counter',
      labels: ['status']
    });

    metrics.register({
      name: 'auth_active_sessions',
      help: 'Number of active sessions',
      type: 'gauge'
    });
  }

  async createToken(user: User): Promise<{ token: string; refreshToken: string }> {
    try {
      const jti = nanoid();
      const iat = Math.floor(Date.now() / 1000);

      // Create access token
      const token = await new SignJWT({
        sub: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(jti)
        .setIssuedAt(iat)
        .setExpirationTime(AUTH_CONFIG.JWT_EXPIRY)
        .sign(this.jwtSecret);

      // Create refresh token
      const refreshToken = nanoid(64);

      // Store refresh token in cache
      await this.cacheManager.set(
        `refresh:${refreshToken}`,
        {
          userId: user.id,
          jti,
          createdAt: Date.now(),
        },
        'MARKET_DATA',
        {
          ttl: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY,
          tags: ['auth', `user:${user.id}`],
        }
      );

      // Update active sessions count
      const activeSessions = await this.getActiveSessions(user.id);
      metrics.record('auth_active_sessions', activeSessions.length);

      return { token, refreshToken };
    } catch (error) {
      logger.error('Error creating token:', error);
      metrics.record('auth_login_attempts', 1, { status: 'error' });
      throw new Error('Failed to create authentication token');
    }
  }

  async verifyToken(token: string): Promise<JWTData> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret);
      const validatedPayload = JWTPayloadSchema.parse(payload);

      metrics.record('auth_token_validations', 1, { status: 'success' });
      return validatedPayload;
    } catch (error) {
      logger.error('Error verifying token:', error);
      metrics.record('auth_token_validations', 1, { status: 'error' });
      throw new Error('Invalid authentication token');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Get refresh token data from cache
      const tokenData = await this.cacheManager.get<{
        userId: string;
        jti: string;
        createdAt: number;
      }>(`refresh:${refreshToken}`, 'MARKET_DATA');

      if (!tokenData) {
        throw new Error('Invalid refresh token');
      }

      // Get user data
      const user = await this.getUserById(tokenData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Invalidate old refresh token
      await this.cacheManager.invalidate(`refresh:${refreshToken}`, 'MARKET_DATA');

      // Create new tokens
      return this.createToken(user);
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  async revokeToken(userId: string, jti?: string) {
    try {
      if (jti) {
        // Revoke specific token
        await this.cacheManager.invalidate(`token:${jti}`, 'MARKET_DATA');
      } else {
        // Revoke all user's tokens
        await this.cacheManager.invalidateByTag(`user:${userId}`, 'MARKET_DATA');
      }

      // Update active sessions count
      const activeSessions = await this.getActiveSessions(userId);
      metrics.record('auth_active_sessions', activeSessions.length);
    } catch (error) {
      logger.error('Error revoking token:', error);
      throw new Error('Failed to revoke token');
    }
  }

  async generateApiKey(userId: string): Promise<string> {
    const apiKey = `${AUTH_CONFIG.API_KEY_PREFIX}${nanoid(32)}`;
    
    try {
      await this.cacheManager.set(
        `apikey:${apiKey}`,
        { userId },
        'MARKET_DATA',
        {
          ttl: 0, // No expiry
          tags: ['auth', `user:${userId}`],
        }
      );

      return apiKey;
    } catch (error) {
      logger.error('Error generating API key:', error);
      throw new Error('Failed to generate API key');
    }
  }

  async validateApiKey(apiKey: string): Promise<User | null> {
    try {
      const keyData = await this.cacheManager.get<{ userId: string }>(
        `apikey:${apiKey}`,
        'MARKET_DATA'
      );

      if (!keyData) {
        return null;
      }

      return this.getUserById(keyData.userId);
    } catch (error) {
      logger.error('Error validating API key:', error);
      return null;
    }
  }

  async revokeApiKey(apiKey: string) {
    try {
      await this.cacheManager.invalidate(`apikey:${apiKey}`, 'MARKET_DATA');
    } catch (error) {
      logger.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  private async getActiveSessions(userId: string): Promise<string[]> {
    try {
      const sessions = await this.cacheManager.get<string[]>(
        `sessions:${userId}`,
        'MARKET_DATA'
      );
      return sessions || [];
    } catch (error) {
      logger.error('Error getting active sessions:', error);
      return [];
    }
  }

  private async getUserById(userId: string): Promise<User | null> {
    // This would typically query a database
    // For now, return a mock user
    return {
      id: userId,
      email: 'user@example.com',
      role: 'user',
      permissions: [],
    };
  }
}

export const authService = AuthService.getInstance(); 