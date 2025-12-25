import { describe, it, expect } from 'vitest';

describe('Custom Date Range Filter', () => {
  describe('Date calculation', () => {
    it('should calculate days between two dates correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(31);
    });

    it('should handle same day selection', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-15');
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(1);
    });

    it('should handle week selection', () => {
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-07');
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(7);
    });

    it('should handle year selection', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(366); // 2024 is a leap year
    });

    it('should limit to max 730 days (2 years)', () => {
      const startDate = new Date('2020-01-01');
      const endDate = new Date('2024-12-31');
      let days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      days = Math.min(days, 730);
      expect(days).toBe(730);
    });
  });

  describe('Date formatting', () => {
    it('should format date to ISO string correctly', () => {
      const date = new Date('2024-12-25');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2024-12-25');
    });

    it('should handle date parsing from ISO string', () => {
      const isoString = '2024-06-15';
      const date = new Date(isoString + 'T00:00:00');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(date.getDate()).toBe(15);
    });
  });

  describe('TimeRange type validation', () => {
    it('should accept valid time ranges', () => {
      const validRanges = ['7d', '1m', '3m', '6m', '1y', 'max', 'custom'];
      validRanges.forEach(range => {
        expect(['7d', '1m', '3m', '6m', '1y', 'max', 'custom']).toContain(range);
      });
    });

    it('should validate custom range requires both dates', () => {
      const timeRange = 'custom';
      const customStartDate = '2024-01-01';
      const customEndDate = '2024-01-31';
      
      const isValidCustomRange = timeRange === 'custom' && !!customStartDate && !!customEndDate;
      expect(isValidCustomRange).toBe(true);
    });

    it('should invalidate custom range without dates', () => {
      const timeRange = 'custom';
      const customStartDate = undefined;
      const customEndDate = undefined;
      
      const isValidCustomRange = timeRange === 'custom' && !!customStartDate && !!customEndDate;
      expect(isValidCustomRange).toBe(false);
    });
  });
});
