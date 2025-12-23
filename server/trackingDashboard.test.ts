import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
}));

import { 
  getTopGrowingAccounts, 
  getDecliningAccounts, 
  getPlatformDistribution,
  getAccountHistory 
} from './scheduledTracking';

describe('Tracking Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopGrowingAccounts', () => {
    it('should return empty array when database is not available', async () => {
      const accounts = await getTopGrowingAccounts({ days: 30, limit: 10 });
      expect(accounts).toEqual([]);
    });

    it('should accept platform filter parameter', async () => {
      const accounts = await getTopGrowingAccounts({ 
        platform: 'instagram', 
        days: 30, 
        limit: 10 
      });
      expect(accounts).toEqual([]);
    });

    it('should accept days parameter', async () => {
      const accounts = await getTopGrowingAccounts({ days: 7, limit: 5 });
      expect(accounts).toEqual([]);
    });
  });

  describe('getDecliningAccounts', () => {
    it('should return empty array when database is not available', async () => {
      const accounts = await getDecliningAccounts({ days: 30, limit: 5 });
      expect(accounts).toEqual([]);
    });

    it('should accept custom days and limit parameters', async () => {
      const accounts = await getDecliningAccounts({ days: 14, limit: 3 });
      expect(accounts).toEqual([]);
    });
  });

  describe('getPlatformDistribution', () => {
    it('should return empty array when database is not available', async () => {
      const distribution = await getPlatformDistribution();
      expect(distribution).toEqual([]);
    });
  });

  describe('getAccountHistory', () => {
    it('should return empty array when database is not available', async () => {
      const history = await getAccountHistory('instagram', 'testuser', 90);
      expect(history).toEqual([]);
    });

    it('should accept platform and username parameters', async () => {
      const history = await getAccountHistory('tiktok', 'anotheruser', 30);
      expect(history).toEqual([]);
    });
  });

  describe('Response Structure', () => {
    it('getTopGrowingAccounts should return array', async () => {
      const result = await getTopGrowingAccounts({});
      expect(Array.isArray(result)).toBe(true);
    });

    it('getDecliningAccounts should return array', async () => {
      const result = await getDecliningAccounts({});
      expect(Array.isArray(result)).toBe(true);
    });

    it('getPlatformDistribution should return array', async () => {
      const result = await getPlatformDistribution();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getAccountHistory should return array', async () => {
      const result = await getAccountHistory('instagram', 'test', 30);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
