import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { cacheManager } from '../utils/cache-manager';

// Schema for permissions
const PermissionSchema = z.object({
  name: z.string(),
  description: z.string(),
  resource: z.string(),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage']),
});

// Schema for roles
const RoleSchema = z.object({
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
  inherits: z.array(z.string()).optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;

// Default permissions
const DEFAULT_PERMISSIONS: Permission[] = [
  {
    name: 'read:market-data',
    description: 'Read market data',
    resource: 'market-data',
    action: 'read',
  },
  {
    name: 'read:company-info',
    description: 'Read company information',
    resource: 'company-info',
    action: 'read',
  },
  {
    name: 'read:news',
    description: 'Read news',
    resource: 'news',
    action: 'read',
  },
  {
    name: 'manage:users',
    description: 'Manage users',
    resource: 'users',
    action: 'manage',
  },
];

// Default roles
const DEFAULT_ROLES: Role[] = [
  {
    name: 'user',
    description: 'Basic user role',
    permissions: ['read:market-data', 'read:company-info', 'read:news'],
  },
  {
    name: 'admin',
    description: 'Administrator role',
    permissions: ['read:market-data', 'read:company-info', 'read:news', 'manage:users'],
  },
];

class RBACService {
  private static instance: RBACService;
  private permissions: Map<string, Permission>;
  private roles: Map<string, Role>;

  private constructor() {
    this.permissions = new Map();
    this.roles = new Map();
    this.initialize();
    this.setupMetrics();
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'rbac_permission_checks',
      help: 'Number of permission checks',
      type: 'counter',
      labels: ['status', 'permission'],
    });

    metrics.register({
      name: 'rbac_role_assignments',
      help: 'Number of role assignments',
      type: 'counter',
      labels: ['role'],
    });
  }

  private async initialize() {
    try {
      // Initialize permissions
      for (const permission of DEFAULT_PERMISSIONS) {
        await this.addPermission(permission);
      }

      // Initialize roles
      for (const role of DEFAULT_ROLES) {
        await this.addRole(role);
      }
    } catch (error) {
      logger.error('Error initializing RBAC:', error);
    }
  }

  async addPermission(permission: Permission): Promise<void> {
    try {
      // Validate permission
      const validatedPermission = PermissionSchema.parse(permission);

      // Store in memory
      this.permissions.set(permission.name, validatedPermission);

      // Store in cache
      await cacheManager.set(
        `permission:${permission.name}`,
        validatedPermission,
        'MARKET_DATA',
        {
          ttl: 0, // No expiry
          tags: ['rbac', 'permission'],
        }
      );
    } catch (error) {
      logger.error('Error adding permission:', error);
      throw new Error('Failed to add permission');
    }
  }

  async addRole(role: Role): Promise<void> {
    try {
      // Validate role
      const validatedRole = RoleSchema.parse(role);

      // Validate permissions exist
      for (const permission of role.permissions) {
        if (!this.permissions.has(permission)) {
          throw new Error(`Permission ${permission} does not exist`);
        }
      }

      // Store in memory
      this.roles.set(role.name, validatedRole);

      // Store in cache
      await cacheManager.set(
        `role:${role.name}`,
        validatedRole,
        'MARKET_DATA',
        {
          ttl: 0, // No expiry
          tags: ['rbac', 'role'],
        }
      );

      metrics.record('rbac_role_assignments', 1, { role: role.name });
    } catch (error) {
      logger.error('Error adding role:', error);
      throw new Error('Failed to add role');
    }
  }

  async hasPermission(
    userId: string,
    permissionName: string,
    context: Record<string, unknown> = {}
  ): Promise<boolean> {
    try {
      // Get user's roles from cache
      const userRoles = await cacheManager.get<string[]>(
        `user:${userId}:roles`,
        'MARKET_DATA'
      );

      if (!userRoles || userRoles.length === 0) {
        metrics.record('rbac_permission_checks', 1, {
          status: 'denied',
          permission: permissionName,
        });
        return false;
      }

      // Check each role
      for (const roleName of userRoles) {
        const role = this.roles.get(roleName);
        if (!role) continue;

        // Check direct permissions
        if (role.permissions.includes(permissionName)) {
          metrics.record('rbac_permission_checks', 1, {
            status: 'allowed',
            permission: permissionName,
          });
          return true;
        }

        // Check inherited permissions
        if (role.inherits) {
          for (const inheritedRole of role.inherits) {
            const parentRole = this.roles.get(inheritedRole);
            if (parentRole?.permissions.includes(permissionName)) {
              metrics.record('rbac_permission_checks', 1, {
                status: 'allowed',
                permission: permissionName,
              });
              return true;
            }
          }
        }
      }

      metrics.record('rbac_permission_checks', 1, {
        status: 'denied',
        permission: permissionName,
      });
      return false;
    } catch (error) {
      logger.error('Error checking permission:', error);
      metrics.record('rbac_permission_checks', 1, {
        status: 'error',
        permission: permissionName,
      });
      return false;
    }
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    try {
      // Validate role exists
      if (!this.roles.has(roleName)) {
        throw new Error(`Role ${roleName} does not exist`);
      }

      // Get current roles
      const currentRoles = await cacheManager.get<string[]>(
        `user:${userId}:roles`,
        'MARKET_DATA'
      ) || [];

      // Add new role if not already assigned
      if (!currentRoles.includes(roleName)) {
        currentRoles.push(roleName);

        // Update cache
        await cacheManager.set(
          `user:${userId}:roles`,
          currentRoles,
          'MARKET_DATA',
          {
            ttl: 0, // No expiry
            tags: ['rbac', `user:${userId}`],
          }
        );

        metrics.record('rbac_role_assignments', 1, { role: roleName });
      }
    } catch (error) {
      logger.error('Error assigning role:', error);
      throw new Error('Failed to assign role');
    }
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    try {
      // Get current roles
      const currentRoles = await cacheManager.get<string[]>(
        `user:${userId}:roles`,
        'MARKET_DATA'
      ) || [];

      // Remove role
      const updatedRoles = currentRoles.filter(role => role !== roleName);

      // Update cache
      await cacheManager.set(
        `user:${userId}:roles`,
        updatedRoles,
        'MARKET_DATA',
        {
          ttl: 0, // No expiry
          tags: ['rbac', `user:${userId}`],
        }
      );
    } catch (error) {
      logger.error('Error removing role:', error);
      throw new Error('Failed to remove role');
    }
  }

  async getRoles(userId: string): Promise<string[]> {
    try {
      return await cacheManager.get<string[]>(
        `user:${userId}:roles`,
        'MARKET_DATA'
      ) || [];
    } catch (error) {
      logger.error('Error getting roles:', error);
      return [];
    }
  }

  getPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  getRoleDefinitions(): Role[] {
    return Array.from(this.roles.values());
  }
}

export const rbacService = RBACService.getInstance(); 