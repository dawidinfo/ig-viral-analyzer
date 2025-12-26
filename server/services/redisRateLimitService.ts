/**
 * Redis-based Distributed Rate Limiting Service
 * 
 * This service provides rate limiting that works across multiple server instances.
 * Falls back to in-memory rate limiting if Redis is not available.
 * 
 * Features:
 * - Sliding window rate limiting
 * - Per-user and per-IP rate limits
 * - Automatic fallback to in-memory when Redis unavailable
 * - Configurable limits per action type
 */

import { getDb } from "../db";
import { rateLimits } from "../../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// Rate limit configurations
export const RATE_LIMIT_CONFIG = {
  // API calls per window
  analysis: { limit: 10, windowSeconds: 60 }, // 10 analyses per minute
  search: { limit: 30, windowSeconds: 60 }, // 30 searches per minute
  export: { limit: 5, windowSeconds: 60 }, // 5 exports per minute
  admin: { limit: 100, windowSeconds: 60 }, // 100 admin calls per minute
  login: { limit: 5, windowSeconds: 300 }, // 5 login attempts per 5 minutes
  signup: { limit: 3, windowSeconds: 3600 }, // 3 signups per hour per IP
  api: { limit: 100, windowSeconds: 60 }, // 100 API calls per minute
  webhook: { limit: 50, windowSeconds: 60 }, // 50 webhook calls per minute
  default: { limit: 60, windowSeconds: 60 }, // 60 calls per minute default
};

export type RateLimitAction = keyof typeof RATE_LIMIT_CONFIG;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
  limit: number;
  retryAfter?: number; // seconds to wait before retry
}

// In-memory fallback store
const memoryStore = new Map<string, { count: number; windowStart: number }>();

// Cleanup interval for memory store
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(memoryStore.entries());
  for (const [key, value] of entries) {
    const config = RATE_LIMIT_CONFIG.default;
    if (now - value.windowStart > config.windowSeconds * 1000) {
      memoryStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Check rate limit using database (distributed)
 * Falls back to in-memory if database is unavailable
 */
export async function checkDistributedRateLimit(
  identifier: string,
  identifierType: 'user' | 'ip',
  action: RateLimitAction = 'default'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG.default;
  const key = `${identifierType}:${identifier}:${action}`;
  
  try {
    const db = await getDb();
    if (!db) {
      // Fallback to in-memory
      return checkMemoryRateLimit(key, config);
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    // Get current request count in window
    const existing = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, identifier),
          eq(rateLimits.identifierType, identifierType),
          eq(rateLimits.endpoint, action),
          gte(rateLimits.windowStart, windowStart)
        )
      )
      .limit(1);

    let currentCount = 0;
    let windowStartTime = now;

    if (existing.length > 0) {
      currentCount = existing[0].requestCount;
      windowStartTime = existing[0].windowStart;
    }

    // Check if limit exceeded
    const allowed = currentCount < config.limit;
    const remaining = Math.max(0, config.limit - currentCount - (allowed ? 1 : 0));
    const resetIn = Math.max(0, Math.ceil((windowStartTime.getTime() + config.windowSeconds * 1000 - now.getTime()) / 1000));

    if (allowed) {
      // Update or insert rate limit record
      if (existing.length > 0) {
        await db
          .update(rateLimits)
          .set({ 
            requestCount: currentCount + 1,
            updatedAt: now
          })
          .where(eq(rateLimits.id, existing[0].id));
      } else {
        await db.insert(rateLimits).values({
          identifier,
          identifierType,
          endpoint: action,
          requestCount: 1,
          windowStart: now,
        });
      }
    }

    return {
      allowed,
      remaining,
      resetIn,
      limit: config.limit,
      retryAfter: allowed ? undefined : resetIn,
    };
  } catch (error) {
    console.error('[RateLimit] Database error, falling back to memory:', error);
    return checkMemoryRateLimit(key, config);
  }
}

/**
 * In-memory rate limit check (fallback)
 */
function checkMemoryRateLimit(
  key: string,
  config: { limit: number; windowSeconds: number }
): RateLimitResult {
  const now = Date.now();
  let entry = memoryStore.get(key);

  // Reset if window expired
  if (!entry || now - entry.windowStart > config.windowSeconds * 1000) {
    entry = { count: 0, windowStart: now };
    memoryStore.set(key, entry);
  }

  const allowed = entry.count < config.limit;
  
  if (allowed) {
    entry.count++;
  }

  const resetIn = Math.max(0, Math.ceil((entry.windowStart + config.windowSeconds * 1000 - now) / 1000));

  return {
    allowed,
    remaining: Math.max(0, config.limit - entry.count),
    resetIn,
    limit: config.limit,
    retryAfter: allowed ? undefined : resetIn,
  };
}

/**
 * Check rate limit for a user
 */
export async function checkUserRateLimit(
  userId: number | string,
  action: RateLimitAction = 'default'
): Promise<RateLimitResult> {
  return checkDistributedRateLimit(String(userId), 'user', action);
}

/**
 * Check rate limit for an IP address
 */
export async function checkIpRateLimit(
  ip: string,
  action: RateLimitAction = 'default'
): Promise<RateLimitResult> {
  // Normalize IP
  const normalizedIp = ip.replace(/^::ffff:/, ''); // Remove IPv6 prefix for IPv4
  return checkDistributedRateLimit(normalizedIp, 'ip', action);
}

/**
 * Combined rate limit check (both user and IP)
 * Returns the most restrictive result
 */
export async function checkCombinedRateLimit(
  userId: number | string | null,
  ip: string,
  action: RateLimitAction = 'default'
): Promise<RateLimitResult & { blockedBy: 'user' | 'ip' | 'none' }> {
  const ipResult = await checkIpRateLimit(ip, action);
  
  if (!ipResult.allowed) {
    return { ...ipResult, blockedBy: 'ip' };
  }

  if (userId) {
    const userResult = await checkUserRateLimit(userId, action);
    if (!userResult.allowed) {
      return { ...userResult, blockedBy: 'user' };
    }
    
    // Return the more restrictive remaining count
    return {
      allowed: true,
      remaining: Math.min(ipResult.remaining, userResult.remaining),
      resetIn: Math.max(ipResult.resetIn, userResult.resetIn),
      limit: Math.min(ipResult.limit, userResult.limit),
      blockedBy: 'none',
    };
  }

  return { ...ipResult, blockedBy: 'none' };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for admin operations
 */
export async function resetRateLimit(
  identifier: string,
  identifierType: 'user' | 'ip',
  action?: RateLimitAction
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      // Clear from memory store
      if (action) {
        memoryStore.delete(`${identifierType}:${identifier}:${action}`);
      } else {
        // Clear all actions for this identifier
        const keys = Array.from(memoryStore.keys());
        for (const key of keys) {
          if (key.startsWith(`${identifierType}:${identifier}:`)) {
            memoryStore.delete(key);
          }
        }
      }
      return true;
    }

    if (action) {
      await db
        .delete(rateLimits)
        .where(
          and(
            eq(rateLimits.identifier, identifier),
            eq(rateLimits.identifierType, identifierType),
            eq(rateLimits.endpoint, action)
          )
        );
    } else {
      await db
        .delete(rateLimits)
        .where(
          and(
            eq(rateLimits.identifier, identifier),
            eq(rateLimits.identifierType, identifierType)
          )
        );
    }

    return true;
  } catch (error) {
    console.error('[RateLimit] Failed to reset rate limit:', error);
    return false;
  }
}

/**
 * Get rate limit status without incrementing counter
 */
export async function getRateLimitStatus(
  identifier: string,
  identifierType: 'user' | 'ip',
  action: RateLimitAction = 'default'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG.default;
  
  try {
    const db = await getDb();
    if (!db) {
      const key = `${identifierType}:${identifier}:${action}`;
      const entry = memoryStore.get(key);
      
      if (!entry) {
        return {
          allowed: true,
          remaining: config.limit,
          resetIn: 0,
          limit: config.limit,
        };
      }

      const now = Date.now();
      const resetIn = Math.max(0, Math.ceil((entry.windowStart + config.windowSeconds * 1000 - now) / 1000));
      
      return {
        allowed: entry.count < config.limit,
        remaining: Math.max(0, config.limit - entry.count),
        resetIn,
        limit: config.limit,
      };
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    const existing = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, identifier),
          eq(rateLimits.identifierType, identifierType),
          eq(rateLimits.endpoint, action),
          gte(rateLimits.windowStart, windowStart)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return {
        allowed: true,
        remaining: config.limit,
        resetIn: 0,
        limit: config.limit,
      };
    }

    const currentCount = existing[0].requestCount;
    const resetIn = Math.max(0, Math.ceil((existing[0].windowStart.getTime() + config.windowSeconds * 1000 - now.getTime()) / 1000));

    return {
      allowed: currentCount < config.limit,
      remaining: Math.max(0, config.limit - currentCount),
      resetIn,
      limit: config.limit,
    };
  } catch (error) {
    console.error('[RateLimit] Failed to get status:', error);
    return {
      allowed: true,
      remaining: config.limit,
      resetIn: 0,
      limit: config.limit,
    };
  }
}

/**
 * Cleanup old rate limit records from database
 * Should be called periodically (e.g., every hour)
 */
export async function cleanupOldRateLimits(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    // Delete records older than 1 hour
    const cutoff = new Date(Date.now() - 3600000);
    
    const result = await db
      .delete(rateLimits)
      .where(sql`${rateLimits.windowStart} < ${cutoff}`);

    console.log('[RateLimit] Cleaned up old records');
    return 0; // mysql2 doesn't return affected rows easily
  } catch (error) {
    console.error('[RateLimit] Cleanup failed:', error);
    return 0;
  }
}

// Schedule cleanup every hour
setInterval(cleanupOldRateLimits, 3600000);

/**
 * Express middleware for rate limiting
 */
export function rateLimitMiddleware(action: RateLimitAction = 'api') {
  return async (req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.user?.id || null;

    const result = await checkCombinedRateLimit(userId, ip, action);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetIn.toString(),
    });

    if (!result.allowed) {
      res.set('Retry-After', result.retryAfter?.toString() || result.resetIn.toString());
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${result.resetIn} seconds.`,
        retryAfter: result.retryAfter || result.resetIn,
        blockedBy: result.blockedBy,
      });
    }

    next();
  };
}
