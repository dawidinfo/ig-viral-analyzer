/**
 * Caching Service
 * 
 * Provides in-memory caching with TTL support for API responses.
 * This reduces database load and improves response times.
 * 
 * For production scale, this can be upgraded to use Redis.
 * 
 * Features:
 * - TTL-based cache expiration
 * - Cache invalidation
 * - Memory usage limits
 * - Cache statistics
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry<any>>();

// Cache statistics
let stats: CacheStats = {
  hits: 0,
  misses: 0,
  entries: 0,
  memoryUsage: 0,
};

// Default TTL values (in milliseconds)
export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
};

// Maximum cache size (in entries)
const MAX_CACHE_SIZE = 10000;

/**
 * Get a value from cache
 */
export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    stats.misses++;
    return null;
  }
  
  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    stats.misses++;
    stats.entries = cache.size;
    return null;
  }
  
  entry.hits++;
  stats.hits++;
  return entry.data as T;
}

/**
 * Set a value in cache
 */
export function cacheSet<T>(key: string, data: T, ttlMs: number = CACHE_TTL.MEDIUM): void {
  // Evict oldest entries if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    evictOldestEntries(Math.floor(MAX_CACHE_SIZE * 0.1)); // Evict 10%
  }
  
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
    hits: 0,
  });
  
  stats.entries = cache.size;
}

/**
 * Delete a value from cache
 */
export function cacheDelete(key: string): boolean {
  const deleted = cache.delete(key);
  stats.entries = cache.size;
  return deleted;
}

/**
 * Delete all entries matching a pattern
 */
export function cacheDeletePattern(pattern: string): number {
  let deleted = 0;
  const regex = new RegExp(pattern);
  
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
      deleted++;
    }
  }
  
  stats.entries = cache.size;
  return deleted;
}

/**
 * Clear all cache entries
 */
export function cacheClear(): void {
  cache.clear();
  stats.entries = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return { ...stats };
}

/**
 * Get or set cache with callback
 * If key exists and is not expired, returns cached value
 * Otherwise, calls the callback, caches the result, and returns it
 */
export async function cacheGetOrSet<T>(
  key: string,
  callback: () => Promise<T>,
  ttlMs: number = CACHE_TTL.MEDIUM
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  const data = await callback();
  cacheSet(key, data, ttlMs);
  return data;
}

/**
 * Evict oldest entries from cache
 */
function evictOldestEntries(count: number): void {
  const entries = Array.from(cache.entries())
    .sort((a, b) => a[1].createdAt - b[1].createdAt)
    .slice(0, count);
  
  for (const [key] of entries) {
    cache.delete(key);
  }
  
  console.log(`[Cache] Evicted ${entries.length} oldest entries`);
}

/**
 * Clean up expired entries
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;
  
  const entries = Array.from(cache.entries());
  for (const [key, entry] of entries) {
    if (now > entry.expiresAt) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  stats.entries = cache.size;
  return cleaned;
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const cleaned = cleanupExpiredEntries();
  if (cleaned > 0) {
    console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);

// ============================================
// Cache Key Generators
// ============================================

export const CACHE_KEYS = {
  // User-related
  user: (userId: number) => `user:${userId}`,
  userCredits: (userId: number) => `user:${userId}:credits`,
  userPlan: (userId: number) => `user:${userId}:plan`,
  
  // Instagram analysis
  instagramProfile: (username: string) => `ig:profile:${username.toLowerCase()}`,
  instagramPosts: (username: string) => `ig:posts:${username.toLowerCase()}`,
  instagramAnalysis: (username: string) => `ig:analysis:${username.toLowerCase()}`,
  
  // Admin
  adminStats: () => `admin:stats`,
  adminUsers: (page: number, limit: number) => `admin:users:${page}:${limit}`,
  
  // Plans and pricing
  plans: () => `plans:all`,
  planById: (planId: string) => `plans:${planId}`,
  
  // Rate limits
  rateLimit: (identifier: string, action: string) => `ratelimit:${identifier}:${action}`,
};

// ============================================
// Cached Query Helpers
// ============================================

/**
 * Cache wrapper for database queries
 * Helps prevent N+1 queries by caching related data
 */
export async function cachedQuery<T>(
  key: string,
  query: () => Promise<T>,
  ttlMs: number = CACHE_TTL.MEDIUM
): Promise<T> {
  return cacheGetOrSet(key, query, ttlMs);
}

/**
 * Batch cache lookup
 * Returns cached values and list of missing keys
 */
export function cacheBatchGet<T>(keys: string[]): {
  found: Map<string, T>;
  missing: string[];
} {
  const found = new Map<string, T>();
  const missing: string[] = [];
  
  for (const key of keys) {
    const value = cacheGet<T>(key);
    if (value !== null) {
      found.set(key, value);
    } else {
      missing.push(key);
    }
  }
  
  return { found, missing };
}

/**
 * Batch cache set
 */
export function cacheBatchSet<T>(
  entries: Map<string, T>,
  ttlMs: number = CACHE_TTL.MEDIUM
): void {
  const entriesArray = Array.from(entries.entries());
  for (const [key, value] of entriesArray) {
    cacheSet(key, value, ttlMs);
  }
}

// ============================================
// Invalidation Helpers
// ============================================

/**
 * Invalidate all cache entries for a user
 */
export function invalidateUserCache(userId: number): void {
  cacheDeletePattern(`^user:${userId}`);
}

/**
 * Invalidate all cache entries for an Instagram username
 */
export function invalidateInstagramCache(username: string): void {
  cacheDeletePattern(`^ig:.*:${username.toLowerCase()}`);
}

/**
 * Invalidate admin cache
 */
export function invalidateAdminCache(): void {
  cacheDeletePattern(`^admin:`);
}

console.log('[Cache] Service initialized');
