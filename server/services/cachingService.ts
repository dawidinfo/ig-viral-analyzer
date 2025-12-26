/**
 * Caching Service - OPTIMIERT FÜR BLITZSCHNELLE DATEN
 * 
 * Strategie: In-Memory First (0ms Latenz)
 * - L1: In-Memory Cache (sofort, 0ms)
 * - L2: Redis nur als Backup bei Server-Neustart (optional, async)
 * - L3: Datenbank als letzter Fallback
 * 
 * Features:
 * - Aggressive TTLs für längere Speicherung
 * - Keine doppelten Cache-Anfragen
 * - LRU-Eviction bei Speicherlimit
 * - Cache-Warming für häufig angefragte Daten
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
  lastAccess: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
  hitRate: number;
}

// In-memory cache store - PRIMÄRER CACHE
const cache = new Map<string, CacheEntry<any>>();

// Hot cache für sehr häufig angefragte Daten (noch schneller)
const hotCache = new Map<string, any>();
const HOT_CACHE_THRESHOLD = 5; // Nach 5 Hits -> Hot Cache

// Cache statistics
let stats = {
  hits: 0,
  misses: 0,
  entries: 0,
  memoryUsage: 0,
};

// AGGRESSIVE TTL values (in milliseconds) - LÄNGER FÜR SCHNELLERE ANTWORTEN
export const CACHE_TTL = {
  INSTANT: 30 * 1000, // 30 Sekunden für sehr dynamische Daten
  SHORT: 2 * 60 * 1000, // 2 Minuten (war 1 Minute)
  MEDIUM: 15 * 60 * 1000, // 15 Minuten (war 5 Minuten)
  LONG: 60 * 60 * 1000, // 1 Stunde (war 30 Minuten)
  HOUR: 2 * 60 * 60 * 1000, // 2 Stunden (war 1 Stunde)
  DAY: 24 * 60 * 60 * 1000, // 24 Stunden
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 Tage für sehr stabile Daten
};

// Instagram-spezifische TTLs - Profile ändern sich nicht oft
export const INSTAGRAM_CACHE_TTL = {
  PROFILE: 60 * 60 * 1000, // 1 Stunde für Profile
  POSTS: 30 * 60 * 1000, // 30 Minuten für Posts
  REELS: 30 * 60 * 1000, // 30 Minuten für Reels
  ANALYSIS: 2 * 60 * 60 * 1000, // 2 Stunden für vollständige Analysen
  FOLLOWER_HISTORY: 4 * 60 * 60 * 1000, // 4 Stunden für Follower-Historie
};

// Maximum cache size (in entries)
const MAX_CACHE_SIZE = 50000; // Erhöht von 10000
const MAX_HOT_CACHE_SIZE = 1000;

/**
 * Get a value from cache - BLITZSCHNELL
 * Prüft zuerst Hot Cache, dann normalen Cache
 */
export function cacheGet<T>(key: string): T | null {
  // 1. Hot Cache prüfen (absolut schnellste Option)
  const hotValue = hotCache.get(key);
  if (hotValue !== undefined) {
    stats.hits++;
    return hotValue as T;
  }
  
  // 2. Normaler Cache
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
  
  // Update access stats
  entry.hits++;
  entry.lastAccess = Date.now();
  stats.hits++;
  
  // Promote to hot cache if frequently accessed
  if (entry.hits >= HOT_CACHE_THRESHOLD && hotCache.size < MAX_HOT_CACHE_SIZE) {
    hotCache.set(key, entry.data);
  }
  
  return entry.data as T;
}

/**
 * Set a value in cache
 */
export function cacheSet<T>(key: string, data: T, ttlMs: number = CACHE_TTL.MEDIUM): void {
  // Evict if cache is full (LRU-based)
  if (cache.size >= MAX_CACHE_SIZE) {
    evictLRUEntries(Math.floor(MAX_CACHE_SIZE * 0.1)); // Evict 10%
  }
  
  const now = Date.now();
  cache.set(key, {
    data,
    expiresAt: now + ttlMs,
    createdAt: now,
    hits: 0,
    lastAccess: now,
  });
  
  stats.entries = cache.size;
}

/**
 * Delete a value from cache
 */
export function cacheDelete(key: string): boolean {
  hotCache.delete(key);
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
  
  // Clear from hot cache
  const hotKeys = Array.from(hotCache.keys());
  for (const key of hotKeys) {
    if (regex.test(key)) {
      hotCache.delete(key);
    }
  }
  
  // Clear from main cache
  const cacheKeys = Array.from(cache.keys());
  for (const key of cacheKeys) {
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
  hotCache.clear();
  cache.clear();
  stats.entries = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  const total = stats.hits + stats.misses;
  return {
    ...stats,
    hitRate: total > 0 ? Math.round((stats.hits / total) * 100) : 0,
  };
}

/**
 * Get or set cache with callback - OPTIMIERT
 * Keine doppelten Anfragen durch Locking
 */
const pendingRequests = new Map<string, Promise<any>>();

export async function cacheGetOrSet<T>(
  key: string,
  callback: () => Promise<T>,
  ttlMs: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // 1. Check cache first (instant)
  const cached = cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // 2. Check if request is already pending (prevent duplicate API calls)
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }
  
  // 3. Make the request and cache it
  const promise = callback().then(data => {
    cacheSet(key, data, ttlMs);
    pendingRequests.delete(key);
    return data;
  }).catch(error => {
    pendingRequests.delete(key);
    throw error;
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Evict least recently used entries from cache
 */
function evictLRUEntries(count: number): void {
  const entries = Array.from(cache.entries())
    .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
    .slice(0, count);
  
  for (const [key] of entries) {
    hotCache.delete(key);
    cache.delete(key);
  }
  
  console.log(`[Cache] Evicted ${entries.length} LRU entries`);
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
      hotCache.delete(key);
      cache.delete(key);
      cleaned++;
    }
  }
  
  stats.entries = cache.size;
  return cleaned;
}

// Cleanup expired entries every 10 minutes (less frequent)
setInterval(() => {
  const cleaned = cleanupExpiredEntries();
  if (cleaned > 0) {
    console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
  }
}, 10 * 60 * 1000);

// ============================================
// Cache Key Generators
// ============================================

export const CACHE_KEYS = {
  // User-related
  user: (userId: number) => `user:${userId}`,
  userCredits: (userId: number) => `user:${userId}:credits`,
  userPlan: (userId: number) => `user:${userId}:plan`,
  
  // Instagram analysis - mit Version für Cache-Busting
  instagramProfile: (username: string) => `ig:profile:${username.toLowerCase()}`,
  instagramPosts: (username: string) => `ig:posts:${username.toLowerCase()}`,
  instagramReels: (username: string) => `ig:reels:${username.toLowerCase()}`,
  instagramAnalysis: (username: string) => `ig:analysis:${username.toLowerCase()}`,
  instagramFollowerHistory: (username: string) => `ig:followers:${username.toLowerCase()}`,
  
  // Admin
  adminStats: () => `admin:stats`,
  adminUsers: (page: number, limit: number) => `admin:users:${page}:${limit}`,
  
  // Plans and pricing
  plans: () => `plans:all`,
  planById: (planId: string) => `plans:${planId}`,
  
  // Rate limits
  rateLimit: (identifier: string, action: string) => `ratelimit:${identifier}:${action}`,
  
  // API Health
  apiHealth: () => `api:health`,
};

// ============================================
// Cached Query Helpers
// ============================================

/**
 * Cache wrapper for database queries
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

// ============================================
// Cache Warming - Proaktives Laden
// ============================================

/**
 * Warm cache for popular usernames
 * Call this on server start or periodically
 */
export async function warmCache(
  usernames: string[],
  fetchFunction: (username: string) => Promise<any>
): Promise<void> {
  console.log(`[Cache] Warming cache for ${usernames.length} usernames...`);
  
  for (const username of usernames) {
    const key = CACHE_KEYS.instagramAnalysis(username);
    if (!cacheGet(key)) {
      try {
        const data = await fetchFunction(username);
        cacheSet(key, data, INSTAGRAM_CACHE_TTL.ANALYSIS);
      } catch (error) {
        // Ignore errors during warming
      }
    }
  }
  
  console.log(`[Cache] Cache warming complete`);
}

/**
 * Preload Instagram data into cache
 */
export function preloadInstagramData(
  username: string,
  profile: any,
  posts: any,
  reels: any
): void {
  const cleanUsername = username.toLowerCase();
  
  if (profile) {
    cacheSet(CACHE_KEYS.instagramProfile(cleanUsername), profile, INSTAGRAM_CACHE_TTL.PROFILE);
  }
  if (posts) {
    cacheSet(CACHE_KEYS.instagramPosts(cleanUsername), posts, INSTAGRAM_CACHE_TTL.POSTS);
  }
  if (reels) {
    cacheSet(CACHE_KEYS.instagramReels(cleanUsername), reels, INSTAGRAM_CACHE_TTL.REELS);
  }
}

console.log('[Cache] Service initialized - OPTIMIERT FÜR BLITZSCHNELLE DATEN');
console.log(`[Cache] Max entries: ${MAX_CACHE_SIZE}, Hot cache: ${MAX_HOT_CACHE_SIZE}`);
