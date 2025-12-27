/**
 * Offline Cache Hook
 * Speichert die letzten 5 Analysen im localStorage für Offline-Zugriff
 */

const CACHE_KEY = 'reelspy_offline_analyses';
const MAX_CACHED_ANALYSES = 5;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Stunden

interface CachedAnalysis {
  username: string;
  data: any;
  timestamp: number;
}

interface OfflineCache {
  analyses: CachedAnalysis[];
  version: number;
}

/**
 * Get cached analyses from localStorage
 */
export function getOfflineCache(): OfflineCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return { analyses: [], version: 1 };
    }
    
    const parsed = JSON.parse(cached) as OfflineCache;
    
    // Filter out expired entries
    const now = Date.now();
    const validAnalyses = parsed.analyses.filter(
      (a) => now - a.timestamp < CACHE_DURATION_MS
    );
    
    // If we filtered out any, update the cache
    if (validAnalyses.length !== parsed.analyses.length) {
      const updated = { ...parsed, analyses: validAnalyses };
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    }
    
    return parsed;
  } catch (error) {
    console.error('[OfflineCache] Error reading cache:', error);
    return { analyses: [], version: 1 };
  }
}

/**
 * Get a specific analysis from offline cache
 */
export function getOfflineAnalysis(username: string): any | null {
  const cleanUsername = username.replace('@', '').toLowerCase().trim();
  const cache = getOfflineCache();
  
  const cached = cache.analyses.find(
    (a) => a.username.toLowerCase() === cleanUsername
  );
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`[OfflineCache] Hit for @${cleanUsername}`);
    return cached.data;
  }
  
  console.log(`[OfflineCache] Miss for @${cleanUsername}`);
  return null;
}

/**
 * Save an analysis to offline cache
 * Keeps only the most recent 5 analyses
 */
export function saveToOfflineCache(username: string, data: any): void {
  try {
    const cleanUsername = username.replace('@', '').toLowerCase().trim();
    const cache = getOfflineCache();
    
    // Remove existing entry for this username if present
    const filteredAnalyses = cache.analyses.filter(
      (a) => a.username.toLowerCase() !== cleanUsername
    );
    
    // Add new entry at the beginning
    const newEntry: CachedAnalysis = {
      username: cleanUsername,
      data,
      timestamp: Date.now(),
    };
    
    const updatedAnalyses = [newEntry, ...filteredAnalyses].slice(0, MAX_CACHED_ANALYSES);
    
    const updatedCache: OfflineCache = {
      analyses: updatedAnalyses,
      version: cache.version,
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
    console.log(`[OfflineCache] Saved @${cleanUsername} (${updatedAnalyses.length}/${MAX_CACHED_ANALYSES} cached)`);
  } catch (error) {
    console.error('[OfflineCache] Error saving to cache:', error);
  }
}

/**
 * Clear all offline cache
 */
export function clearOfflineCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('[OfflineCache] Cache cleared');
  } catch (error) {
    console.error('[OfflineCache] Error clearing cache:', error);
  }
}

/**
 * Get list of cached usernames
 */
export function getCachedUsernames(): string[] {
  const cache = getOfflineCache();
  return cache.analyses.map((a) => a.username);
}

/**
 * Check if we're offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * React hook for offline cache
 */
export function useOfflineCache(username: string | null) {
  const cleanUsername = username?.replace('@', '').toLowerCase().trim() || '';
  
  // Try to get from offline cache
  const offlineData = cleanUsername ? getOfflineAnalysis(cleanUsername) : null;
  
  // Save to cache when data is available
  const saveToCache = (data: any) => {
    if (cleanUsername && data) {
      saveToOfflineCache(cleanUsername, data);
    }
  };
  
  return {
    offlineData,
    saveToCache,
    isOffline: isOffline(),
    cachedUsernames: getCachedUsernames(),
  };
}
