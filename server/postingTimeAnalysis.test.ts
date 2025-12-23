import { describe, it, expect } from 'vitest';
import { generatePostingTimeAnalysis, getHeatmapColor, getIntensityClass } from './postingTimeAnalysis';

describe('Posting Time Analysis Service', () => {
  describe('generatePostingTimeAnalysis', () => {
    it('should return analysis data for a username', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis).toBeDefined();
      expect(analysis.username).toBe('testuser');
      expect(analysis.isDemo).toBe(true);
    });

    it('should generate heatmap data with 7 days', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.heatmapData).toHaveLength(7);
    });

    it('should generate 24 hours for each day', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      analysis.heatmapData.forEach(daySlots => {
        expect(daySlots).toHaveLength(24);
      });
    });

    it('should have valid engagement scores (0-100)', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      analysis.heatmapData.forEach(daySlots => {
        daySlots.forEach(slot => {
          expect(slot.engagementScore).toBeGreaterThanOrEqual(0);
          expect(slot.engagementScore).toBeLessThanOrEqual(100);
        });
      });
    });

    it('should return 5 best times', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.bestTimes).toHaveLength(5);
    });

    it('should return 5 worst times', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.worstTimes).toHaveLength(5);
    });

    it('should have best times sorted by engagement score (descending)', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      for (let i = 1; i < analysis.bestTimes.length; i++) {
        expect(analysis.bestTimes[i - 1].engagementScore)
          .toBeGreaterThanOrEqual(analysis.bestTimes[i].engagementScore);
      }
    });

    it('should have worst times sorted by engagement score (ascending)', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      for (let i = 1; i < analysis.worstTimes.length; i++) {
        expect(analysis.worstTimes[i - 1].engagementScore)
          .toBeLessThanOrEqual(analysis.worstTimes[i].engagementScore);
      }
    });

    it('should include insights', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.insights).toBeDefined();
      expect(analysis.insights.length).toBeGreaterThan(0);
    });

    it('should include peak hours', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.peakHours).toBeDefined();
      expect(analysis.peakHours.length).toBe(3);
      analysis.peakHours.forEach(hour => {
        expect(hour).toBeGreaterThanOrEqual(0);
        expect(hour).toBeLessThanOrEqual(23);
      });
    });

    it('should include peak days', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.peakDays).toBeDefined();
      expect(analysis.peakDays.length).toBe(3);
    });

    it('should include audience timezone', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      expect(analysis.audienceTimezone).toBeDefined();
      expect(analysis.audienceTimezone).toContain('Europe/Berlin');
    });

    it('should generate consistent data for same username', () => {
      const analysis1 = generatePostingTimeAnalysis('testuser');
      const analysis2 = generatePostingTimeAnalysis('testuser');
      
      expect(analysis1.bestTimes[0].engagementScore)
        .toBe(analysis2.bestTimes[0].engagementScore);
    });

    it('should generate different data for different usernames', () => {
      const analysis1 = generatePostingTimeAnalysis('user1');
      const analysis2 = generatePostingTimeAnalysis('user2');
      
      // Different usernames should produce different data
      expect(analysis1.bestTimes[0].engagementScore)
        .not.toBe(analysis2.bestTimes[0].engagementScore);
    });

    it('should have valid time slot structure', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      const slot = analysis.heatmapData[0][0];
      expect(slot.hour).toBeDefined();
      expect(slot.day).toBeDefined();
      expect(slot.engagementScore).toBeDefined();
      expect(slot.postCount).toBeDefined();
      expect(slot.avgLikes).toBeDefined();
      expect(slot.avgComments).toBeDefined();
      expect(slot.avgViews).toBeDefined();
    });

    it('should have valid best time structure', () => {
      const analysis = generatePostingTimeAnalysis('testuser');
      
      const bestTime = analysis.bestTimes[0];
      expect(bestTime.day).toBeDefined();
      expect(bestTime.dayIndex).toBeDefined();
      expect(bestTime.hour).toBeDefined();
      expect(bestTime.timeRange).toBeDefined();
      expect(bestTime.engagementScore).toBeDefined();
      expect(bestTime.reason).toBeDefined();
    });
  });

  describe('getHeatmapColor', () => {
    it('should return green for high scores', () => {
      expect(getHeatmapColor(85)).toBe('bg-green-500');
      expect(getHeatmapColor(100)).toBe('bg-green-500');
    });

    it('should return light green for medium-high scores', () => {
      expect(getHeatmapColor(65)).toBe('bg-green-400');
      expect(getHeatmapColor(79)).toBe('bg-green-400');
    });

    it('should return yellow for medium scores', () => {
      expect(getHeatmapColor(45)).toBe('bg-yellow-400');
      expect(getHeatmapColor(59)).toBe('bg-yellow-400');
    });

    it('should return orange for low scores', () => {
      expect(getHeatmapColor(25)).toBe('bg-orange-400');
      expect(getHeatmapColor(39)).toBe('bg-orange-400');
    });

    it('should return red for very low scores', () => {
      expect(getHeatmapColor(10)).toBe('bg-red-400');
      expect(getHeatmapColor(0)).toBe('bg-red-400');
    });
  });

  describe('getIntensityClass', () => {
    it('should return intensity-5 for high scores', () => {
      expect(getIntensityClass(85)).toBe('intensity-5');
    });

    it('should return intensity-4 for medium-high scores', () => {
      expect(getIntensityClass(65)).toBe('intensity-4');
    });

    it('should return intensity-3 for medium scores', () => {
      expect(getIntensityClass(45)).toBe('intensity-3');
    });

    it('should return intensity-2 for low scores', () => {
      expect(getIntensityClass(25)).toBe('intensity-2');
    });

    it('should return intensity-1 for very low scores', () => {
      expect(getIntensityClass(10)).toBe('intensity-1');
    });
  });
});
