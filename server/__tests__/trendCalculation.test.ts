import { describe, it, expect } from 'vitest';

describe('Trend Calculation', () => {
  // Helper function to calculate linear regression (same logic as in FollowerGrowthChart)
  function calculateTrend(dataPoints: { followers: number }[]) {
    if (dataPoints.length < 2) return { slope: 0, intercept: 0, average: 0 };
    
    const n = dataPoints.length;
    
    // Calculate average
    const avgFollowers = dataPoints.reduce((sum, p) => sum + p.followers, 0) / n;
    
    // Linear regression for trend line
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    dataPoints.forEach((p, i) => {
      sumX += i;
      sumY += p.followers;
      sumXY += i * p.followers;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept, average: avgFollowers };
  }

  it('should calculate positive trend for growing followers', () => {
    const dataPoints = [
      { followers: 1000 },
      { followers: 1100 },
      { followers: 1200 },
      { followers: 1300 },
      { followers: 1400 },
    ];
    
    const trend = calculateTrend(dataPoints);
    
    expect(trend.slope).toBeGreaterThan(0);
    expect(trend.average).toBe(1200);
  });

  it('should calculate negative trend for declining followers', () => {
    const dataPoints = [
      { followers: 72000 },
      { followers: 71900 },
      { followers: 71800 },
      { followers: 71700 },
      { followers: 71600 },
    ];
    
    const trend = calculateTrend(dataPoints);
    
    expect(trend.slope).toBeLessThan(0);
    expect(trend.average).toBe(71800);
  });

  it('should calculate zero trend for stable followers', () => {
    const dataPoints = [
      { followers: 5000 },
      { followers: 5000 },
      { followers: 5000 },
      { followers: 5000 },
    ];
    
    const trend = calculateTrend(dataPoints);
    
    expect(trend.slope).toBe(0);
    expect(trend.average).toBe(5000);
  });

  it('should handle single data point', () => {
    const dataPoints = [{ followers: 1000 }];
    
    const trend = calculateTrend(dataPoints);
    
    expect(trend.slope).toBe(0);
    expect(trend.intercept).toBe(0);
    expect(trend.average).toBe(0);
  });

  it('should handle empty data', () => {
    const dataPoints: { followers: number }[] = [];
    
    const trend = calculateTrend(dataPoints);
    
    expect(trend.slope).toBe(0);
    expect(trend.intercept).toBe(0);
    expect(trend.average).toBe(0);
  });

  it('should calculate correct trend line values', () => {
    const dataPoints = [
      { followers: 1000 },
      { followers: 1100 },
      { followers: 1200 },
    ];
    
    const trend = calculateTrend(dataPoints);
    
    // Slope should be 100 (gaining 100 followers per day)
    expect(trend.slope).toBe(100);
    
    // Trend line at index 0 should be close to 1000
    const trendAtStart = trend.slope * 0 + trend.intercept;
    expect(trendAtStart).toBeCloseTo(1000, 0);
    
    // Trend line at index 2 should be close to 1200
    const trendAtEnd = trend.slope * 2 + trend.intercept;
    expect(trendAtEnd).toBeCloseTo(1200, 0);
  });
});
