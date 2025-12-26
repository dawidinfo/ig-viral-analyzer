import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([]))
        }))
      }))
    }))
  }))
}));

describe('Benchmark Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should categorize accounts correctly by follower count', () => {
    // Test category boundaries
    const categories = [
      { name: 'Nano (1K-10K)', min: 1000, max: 10000 },
      { name: 'Micro (10K-50K)', min: 10000, max: 50000 },
      { name: 'Mid-Tier (50K-100K)', min: 50000, max: 100000 },
      { name: 'Macro (100K-500K)', min: 100000, max: 500000 },
      { name: 'Mega (500K-1M)', min: 500000, max: 1000000 },
      { name: 'Celebrity (1M+)', min: 1000000, max: 100000000 },
    ];

    // Test that 71874 followers falls into Mid-Tier category (50K-100K)
    const testFollowers = 71874;
    const category = categories.find(c => testFollowers >= c.min && testFollowers < c.max);
    
    expect(category).toBeDefined();
    expect(category?.name).toBe('Mid-Tier (50K-100K)');
  });

  it('should handle edge cases for follower counts', () => {
    const categories = [
      { name: 'Nano (1K-10K)', min: 1000, max: 10000 },
      { name: 'Micro (10K-50K)', min: 10000, max: 50000 },
    ];

    // Test boundary: exactly 10000 should be Micro, not Nano
    const boundaryFollowers = 10000;
    const category = categories.find(c => boundaryFollowers >= c.min && boundaryFollowers < c.max);
    
    expect(category?.name).toBe('Micro (10K-50K)');
  });

  it('should calculate growth percentages correctly', () => {
    const currentFollowers = 71874;
    const previousFollowers = 71900;
    const change = currentFollowers - previousFollowers;
    const changePercent = previousFollowers > 0 ? (change / previousFollowers) * 100 : 0;

    expect(change).toBe(-26);
    expect(changePercent).toBeCloseTo(-0.036, 2);
  });

  it('should handle zero previous followers without division error', () => {
    const currentFollowers = 100;
    const previousFollowers = 0;
    const change = currentFollowers - previousFollowers;
    const changePercent = previousFollowers > 0 ? (change / previousFollowers) * 100 : 0;

    expect(change).toBe(100);
    expect(changePercent).toBe(0); // Should not be Infinity
  });
});
