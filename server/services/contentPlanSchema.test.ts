import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the schema transformation for avgEngagement and followerCount
describe('Content Plan Schema Validation', () => {
  // Recreate the schema transformation logic
  const avgEngagementSchema = z.union([z.number(), z.string()]).optional().transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val);
  const followerCountSchema = z.union([z.number(), z.string()]).optional().transform(val => typeof val === 'string' ? parseInt(val) || 0 : val);

  describe('avgEngagement transformation', () => {
    it('should accept number values', () => {
      const result = avgEngagementSchema.parse(5.5);
      expect(result).toBe(5.5);
    });

    it('should convert string to number', () => {
      const result = avgEngagementSchema.parse("3.14");
      expect(result).toBe(3.14);
    });

    it('should handle string with percentage sign', () => {
      const result = avgEngagementSchema.parse("0.55%");
      expect(result).toBe(0.55);
    });

    it('should return 0 for invalid string', () => {
      const result = avgEngagementSchema.parse("invalid");
      expect(result).toBe(0);
    });

    it('should handle undefined', () => {
      const result = avgEngagementSchema.parse(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('followerCount transformation', () => {
    it('should accept number values', () => {
      const result = followerCountSchema.parse(71844);
      expect(result).toBe(71844);
    });

    it('should convert string to integer', () => {
      const result = followerCountSchema.parse("71844");
      expect(result).toBe(71844);
    });

    it('should truncate decimal strings', () => {
      const result = followerCountSchema.parse("71844.5");
      expect(result).toBe(71844);
    });

    it('should return 0 for invalid string', () => {
      const result = followerCountSchema.parse("invalid");
      expect(result).toBe(0);
    });

    it('should handle undefined', () => {
      const result = followerCountSchema.parse(undefined);
      expect(result).toBeUndefined();
    });
  });
});
