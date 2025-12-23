import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
}));

// Mock the API services
vi.mock('./instagram', () => ({
  fetchInstagramProfile: vi.fn(() => Promise.resolve({ followerCount: 10000 })),
}));

vi.mock('./tiktok', () => ({
  fetchTikTokProfile: vi.fn(() => Promise.resolve({ followerCount: 50000 })),
}));

vi.mock('./youtube', () => ({
  fetchYouTubeChannel: vi.fn(() => Promise.resolve({ subscriberCount: 100000 })),
}));

import { getSavedAccountsForTracking, runScheduledTracking, getTrackingStats } from './scheduledTracking';

describe('Scheduled Tracking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSavedAccountsForTracking', () => {
    it('should return empty array when database is not available', async () => {
      const accounts = await getSavedAccountsForTracking();
      expect(accounts).toEqual([]);
    });
  });

  describe('runScheduledTracking', () => {
    it('should return tracking results with zero accounts when no accounts to track', async () => {
      const result = await runScheduledTracking();
      
      expect(result).toHaveProperty('totalAccounts');
      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('results');
      expect(result.totalAccounts).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  describe('getTrackingStats', () => {
    it('should return default stats when database is not available', async () => {
      const stats = await getTrackingStats();
      
      expect(stats).toEqual({
        totalSnapshots: 0,
        uniqueAccounts: 0,
        lastTrackingRun: null,
        snapshotsToday: 0,
      });
    });
  });

  describe('Tracking Result Structure', () => {
    it('should have correct structure for tracking results', async () => {
      const result = await runScheduledTracking();
      
      expect(typeof result.totalAccounts).toBe('number');
      expect(typeof result.successful).toBe('number');
      expect(typeof result.failed).toBe('number');
      expect(Array.isArray(result.results)).toBe(true);
    });
  });

  describe('Stats Structure', () => {
    it('should have correct structure for tracking stats', async () => {
      const stats = await getTrackingStats();
      
      expect(typeof stats.totalSnapshots).toBe('number');
      expect(typeof stats.uniqueAccounts).toBe('number');
      expect(typeof stats.snapshotsToday).toBe('number');
      expect(stats.lastTrackingRun === null || stats.lastTrackingRun instanceof Date).toBe(true);
    });
  });
});
