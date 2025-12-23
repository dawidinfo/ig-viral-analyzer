import { describe, it, expect } from 'vitest';
import { 
  getFollowerHistory, 
  getTimeRanges, 
  storeFollowerSnapshot,
  getTrackedAccountsCount 
} from './followerHistory';

describe('Follower History Service', () => {
  describe('getTimeRanges', () => {
    it('should return all available time ranges', () => {
      const ranges = getTimeRanges();
      
      expect(ranges).toHaveLength(6);
      expect(ranges.map(r => r.value)).toEqual(['7d', '1m', '3m', '6m', '1y', 'max']);
      expect(ranges.map(r => r.label)).toEqual([
        '7 Tage',
        '1 Monat',
        '3 Monate',
        '6 Monate',
        '1 Jahr',
        'Max (2 Jahre)'
      ]);
    });

    it('should include days count for each range', () => {
      const ranges = getTimeRanges();
      
      expect(ranges.find(r => r.value === '7d')?.days).toBe(7);
      expect(ranges.find(r => r.value === '1m')?.days).toBe(30);
      expect(ranges.find(r => r.value === '3m')?.days).toBe(90);
      expect(ranges.find(r => r.value === '6m')?.days).toBe(180);
      expect(ranges.find(r => r.value === '1y')?.days).toBe(365);
      expect(ranges.find(r => r.value === 'max')?.days).toBe(730);
    });
  });

  describe('getFollowerHistory', () => {
    it('should return follower history data for a username', async () => {
      const history = await getFollowerHistory('testuser', 100000, '1m', 'instagram');
      
      expect(history).toBeDefined();
      expect(history.username).toBe('testuser');
      expect(history.currentFollowers).toBe(100000);
      expect(history.timeRange).toBe('1m');
      expect(history.platform).toBe('instagram');
      expect(history).toHaveProperty('realDataPoints');
    });

    it('should return correct number of data points for 7 days', async () => {
      const history = await getFollowerHistory('testuser', 100000, '7d');
      
      expect(history.dataPoints).toHaveLength(7);
    });

    it('should return correct number of data points for 1 month', async () => {
      const history = await getFollowerHistory('testuser', 100000, '1m');
      
      expect(history.dataPoints).toHaveLength(30);
    });

    it('should return correct number of data points for 3 months', async () => {
      const history = await getFollowerHistory('testuser', 100000, '3m');
      
      expect(history.dataPoints).toHaveLength(90);
    });

    it('should include summary statistics', async () => {
      const history = await getFollowerHistory('testuser', 100000, '1m');
      
      expect(history.summary).toBeDefined();
      expect(history.summary.totalGrowth).toBeDefined();
      expect(history.summary.totalGrowthPercent).toBeDefined();
      expect(history.summary.avgDailyGrowth).toBeDefined();
      expect(history.summary.bestDay).toBeDefined();
      expect(history.summary.worstDay).toBeDefined();
      expect(history.summary.trend).toBeDefined();
    });

    it('should have valid trend values', async () => {
      const history = await getFollowerHistory('testuser', 100000, '1m');
      
      expect(['rising', 'stable', 'declining']).toContain(history.summary.trend);
    });

    it('should generate consistent data for same username', async () => {
      const history1 = await getFollowerHistory('testuser', 100000, '1m');
      const history2 = await getFollowerHistory('testuser', 100000, '1m');
      
      // Same username should produce same data (deterministic)
      expect(history1.summary.totalGrowth).toBe(history2.summary.totalGrowth);
    });

    it('should generate different data for different usernames', async () => {
      const history1 = await getFollowerHistory('user1', 100000, '1m');
      const history2 = await getFollowerHistory('user2', 100000, '1m');
      
      // Different usernames should produce different data
      expect(history1.summary.totalGrowth).not.toBe(history2.summary.totalGrowth);
    });

    it('should have data points with required fields', async () => {
      const history = await getFollowerHistory('testuser', 100000, '7d');
      
      history.dataPoints.forEach(point => {
        expect(point.date).toBeDefined();
        expect(point.followers).toBeDefined();
        expect(point.change).toBeDefined();
        expect(point.changePercent).toBeDefined();
      });
    });

    it('should have dates in chronological order', async () => {
      const history = await getFollowerHistory('testuser', 100000, '7d');
      
      for (let i = 1; i < history.dataPoints.length; i++) {
        const prevDate = new Date(history.dataPoints[i - 1].date);
        const currDate = new Date(history.dataPoints[i].date);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });

    it('should have the current date as the last data point', async () => {
      const history = await getFollowerHistory('testuser', 100000, '7d');
      const lastPoint = history.dataPoints[history.dataPoints.length - 1];
      const today = new Date().toISOString().split('T')[0];
      
      expect(lastPoint.date).toBe(today);
    });

    it('should work with TikTok platform', async () => {
      const history = await getFollowerHistory('tiktokuser', 50000, '1m', 'tiktok');
      
      expect(history.platform).toBe('tiktok');
      expect(history.dataPoints).toHaveLength(30);
    });

    it('should work with YouTube platform', async () => {
      const history = await getFollowerHistory('@youtubechannel', 100000, '1m', 'youtube');
      
      expect(history.platform).toBe('youtube');
      expect(history.dataPoints).toHaveLength(30);
    });
  });

  describe('storeFollowerSnapshot', () => {
    it('should store Instagram snapshot without errors', async () => {
      await expect(
        storeFollowerSnapshot('instagram', 'test_snapshot_ig', {
          followerCount: 10000,
          followingCount: 500,
          postCount: 100,
          engagementRate: 3.5,
        }, true)
      ).resolves.not.toThrow();
    });

    it('should store TikTok snapshot without errors', async () => {
      await expect(
        storeFollowerSnapshot('tiktok', 'test_snapshot_tt', {
          followerCount: 50000,
          followingCount: 200,
          postCount: 150,
          totalLikes: 1000000,
        }, true)
      ).resolves.not.toThrow();
    });

    it('should store YouTube snapshot without errors', async () => {
      await expect(
        storeFollowerSnapshot('youtube', '@test_snapshot_yt', {
          followerCount: 100000,
          postCount: 200,
          totalViews: 5000000,
        }, true)
      ).resolves.not.toThrow();
    });
  });

  describe('getTrackedAccountsCount', () => {
    it('should return tracked accounts count with correct structure', async () => {
      const counts = await getTrackedAccountsCount();

      expect(counts).toHaveProperty('instagram');
      expect(counts).toHaveProperty('tiktok');
      expect(counts).toHaveProperty('youtube');
      expect(counts).toHaveProperty('total');

      expect(typeof counts.instagram).toBe('number');
      expect(typeof counts.tiktok).toBe('number');
      expect(typeof counts.youtube).toBe('number');
      expect(typeof counts.total).toBe('number');
    });
  });
});
