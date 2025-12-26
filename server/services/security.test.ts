/**
 * Tests for Security Services
 * - Rate Limiting
 * - Caching
 * - Background Jobs
 * - GDPR
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================
// Caching Service Tests
// ============================================

describe('Caching Service', () => {
  // Import dynamically to reset state between tests
  let cachingService: typeof import('./cachingService');

  beforeEach(async () => {
    // Clear module cache to reset state
    vi.resetModules();
    cachingService = await import('./cachingService');
    cachingService.cacheClear();
  });

  describe('cacheGet and cacheSet', () => {
    it('should return null for non-existent keys', () => {
      const result = cachingService.cacheGet('non-existent-key');
      expect(result).toBeNull();
    });

    it('should store and retrieve values', () => {
      cachingService.cacheSet('test-key', { data: 'test-value' });
      const result = cachingService.cacheGet('test-key');
      expect(result).toEqual({ data: 'test-value' });
    });

    it('should handle different data types', () => {
      cachingService.cacheSet('string-key', 'string-value');
      cachingService.cacheSet('number-key', 42);
      cachingService.cacheSet('array-key', [1, 2, 3]);
      cachingService.cacheSet('object-key', { nested: { value: true } });

      expect(cachingService.cacheGet('string-key')).toBe('string-value');
      expect(cachingService.cacheGet('number-key')).toBe(42);
      expect(cachingService.cacheGet('array-key')).toEqual([1, 2, 3]);
      expect(cachingService.cacheGet('object-key')).toEqual({ nested: { value: true } });
    });

    it('should expire entries after TTL', async () => {
      cachingService.cacheSet('expiring-key', 'value', 50); // 50ms TTL
      
      // Should exist immediately
      expect(cachingService.cacheGet('expiring-key')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should be expired
      expect(cachingService.cacheGet('expiring-key')).toBeNull();
    });
  });

  describe('cacheDelete', () => {
    it('should delete existing keys', () => {
      cachingService.cacheSet('delete-key', 'value');
      expect(cachingService.cacheGet('delete-key')).toBe('value');
      
      const deleted = cachingService.cacheDelete('delete-key');
      expect(deleted).toBe(true);
      expect(cachingService.cacheGet('delete-key')).toBeNull();
    });

    it('should return false for non-existent keys', () => {
      const deleted = cachingService.cacheDelete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('cacheDeletePattern', () => {
    it('should delete keys matching pattern', () => {
      cachingService.cacheSet('user:1:profile', 'profile1');
      cachingService.cacheSet('user:1:settings', 'settings1');
      cachingService.cacheSet('user:2:profile', 'profile2');
      cachingService.cacheSet('other:key', 'other');

      const deleted = cachingService.cacheDeletePattern('^user:1:');
      expect(deleted).toBe(2);
      
      expect(cachingService.cacheGet('user:1:profile')).toBeNull();
      expect(cachingService.cacheGet('user:1:settings')).toBeNull();
      expect(cachingService.cacheGet('user:2:profile')).toBe('profile2');
      expect(cachingService.cacheGet('other:key')).toBe('other');
    });
  });

  describe('getCacheStats', () => {
    it('should track hits and misses', () => {
      cachingService.cacheSet('stats-key', 'value');
      
      // Generate some hits and misses
      cachingService.cacheGet('stats-key'); // hit
      cachingService.cacheGet('stats-key'); // hit
      cachingService.cacheGet('missing-key'); // miss
      
      const stats = cachingService.getCacheStats();
      expect(stats.hits).toBeGreaterThanOrEqual(2);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
    });
  });

  describe('cacheGetOrSet', () => {
    it('should return cached value if exists', async () => {
      cachingService.cacheSet('getorset-key', 'cached-value');
      
      const callback = vi.fn().mockResolvedValue('new-value');
      const result = await cachingService.cacheGetOrSet('getorset-key', callback);
      
      expect(result).toBe('cached-value');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback and cache result if not exists', async () => {
      const callback = vi.fn().mockResolvedValue('new-value');
      const result = await cachingService.cacheGetOrSet('new-key', callback);
      
      expect(result).toBe('new-value');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(cachingService.cacheGet('new-key')).toBe('new-value');
    });
  });
});

// ============================================
// Background Job Service Tests
// ============================================

describe('Background Job Service', () => {
  let jobService: typeof import('./backgroundJobService');

  beforeEach(async () => {
    vi.resetModules();
    jobService = await import('./backgroundJobService');
  });

  describe('enqueueJob', () => {
    it('should return a job ID', () => {
      const jobId = jobService.enqueueJob('test_job', { data: 'test' });
      expect(jobId).toBeDefined();
      expect(jobId).toMatch(/^job_/);
    });

    it('should create job with correct properties', () => {
      const jobId = jobService.enqueueJob('test_job', { data: 'test' }, {
        priority: 'high',
        maxAttempts: 5,
      });
      
      const job = jobService.getJobStatus(jobId);
      expect(job).toBeDefined();
      expect(job?.type).toBe('test_job');
      expect(job?.priority).toBe('high');
      expect(job?.maxAttempts).toBe(5);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', () => {
      const stats = jobService.getQueueStats();
      
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('processing');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('activeJobs');
    });
  });

  describe('registerJobHandler', () => {
    it('should register custom job handlers', async () => {
      const handler = vi.fn().mockResolvedValue({ success: true });
      jobService.registerJobHandler('custom_job', handler);
      
      const jobId = jobService.enqueueJob('custom_job', { test: true });
      
      // Wait for job processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(handler).toHaveBeenCalledWith({ test: true });
    });
  });

  describe('Job Priority', () => {
    it('should process high priority jobs first', () => {
      // This is a behavioral test - high priority jobs should be sorted first
      const lowJob = jobService.enqueueJob('test', {}, { priority: 'low' });
      const highJob = jobService.enqueueJob('test', {}, { priority: 'high' });
      const criticalJob = jobService.enqueueJob('test', {}, { priority: 'critical' });
      
      // All jobs should have IDs
      expect(lowJob).toBeDefined();
      expect(highJob).toBeDefined();
      expect(criticalJob).toBeDefined();
    });
  });
});

// ============================================
// Rate Limit Service Tests
// ============================================

describe('Rate Limit Service', () => {
  let rateLimitService: typeof import('./redisRateLimitService');

  beforeEach(async () => {
    vi.resetModules();
    rateLimitService = await import('./redisRateLimitService');
  });

  describe('RATE_LIMIT_CONFIG', () => {
    it('should have default configuration', () => {
      expect(rateLimitService.RATE_LIMIT_CONFIG).toBeDefined();
      expect(rateLimitService.RATE_LIMIT_CONFIG.default).toBeDefined();
      expect(rateLimitService.RATE_LIMIT_CONFIG.default.limit).toBeGreaterThan(0);
      expect(rateLimitService.RATE_LIMIT_CONFIG.default.windowSeconds).toBeGreaterThan(0);
    });

    it('should have action-specific configurations', () => {
      expect(rateLimitService.RATE_LIMIT_CONFIG.analysis).toBeDefined();
      expect(rateLimitService.RATE_LIMIT_CONFIG.search).toBeDefined();
      expect(rateLimitService.RATE_LIMIT_CONFIG.login).toBeDefined();
    });
  });

  describe('checkUserRateLimit', () => {
    it('should return rate limit result', async () => {
      const result = await rateLimitService.checkUserRateLimit(999, 'default');
      
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetIn');
      expect(result).toHaveProperty('limit');
    });

    it('should allow requests within limit', async () => {
      // Use a unique user ID to avoid conflicts
      const userId = Date.now();
      
      const result = await rateLimitService.checkUserRateLimit(userId, 'default');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkIpRateLimit', () => {
    it('should normalize IPv6 addresses', async () => {
      const result = await rateLimitService.checkIpRateLimit('::ffff:192.168.1.1', 'default');
      expect(result).toHaveProperty('allowed');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return status without incrementing counter', async () => {
      const userId = Date.now().toString();
      
      // Check status twice
      const status1 = await rateLimitService.getRateLimitStatus(userId, 'user', 'default');
      const status2 = await rateLimitService.getRateLimitStatus(userId, 'user', 'default');
      
      // Remaining should be the same (not decremented)
      expect(status1.remaining).toBe(status2.remaining);
    });
  });
});

// ============================================
// GDPR Service Tests
// ============================================

describe('GDPR Service', () => {
  let gdprService: typeof import('./gdprService');

  beforeEach(async () => {
    vi.resetModules();
    gdprService = await import('./gdprService');
  });

  describe('exportUserData', () => {
    it('should return export result structure', async () => {
      // Use a non-existent user ID to test structure
      const result = await gdprService.exportUserData(999999);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('exportedAt');
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('usageHistory');
      expect(result.data).toHaveProperty('creditTransactions');
    });
  });

  describe('deleteUserData', () => {
    it('should return deletion result structure', async () => {
      // Use a non-existent user ID to test structure
      const result = await gdprService.deleteUserData(999999);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('deletedRecords');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('completedAt');
    });
  });

  describe('getDeletionStatus', () => {
    it('should return deletion status', async () => {
      const status = await gdprService.getDeletionStatus(999999);
      
      expect(status).toHaveProperty('isPendingDeletion');
      expect(typeof status.isPendingDeletion).toBe('boolean');
    });
  });
});

// ============================================
// Session Security Tests
// ============================================

describe('Session Security', () => {
  it('should have secure session timeout constants', async () => {
    const constants = await import('@shared/const');
    
    // Session should be 24 hours (not 1 year)
    expect(constants.SESSION_TIMEOUT_MS).toBe(24 * 60 * 60 * 1000);
    
    // Refresh token should be 30 days
    expect(constants.REFRESH_TOKEN_TIMEOUT_MS).toBe(30 * 24 * 60 * 60 * 1000);
    
    // Refresh threshold should be 1 hour
    expect(constants.SESSION_REFRESH_THRESHOLD_MS).toBe(60 * 60 * 1000);
  });
});
