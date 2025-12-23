/**
 * Follower History Service
 * Generates and manages historical follower growth data
 * Similar to NotJustAnalytics.com
 */

export interface FollowerDataPoint {
  date: string; // ISO date string
  followers: number;
  change: number; // Daily change
  changePercent: number;
}

export interface FollowerHistoryData {
  username: string;
  currentFollowers: number;
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' | 'max';
  dataPoints: FollowerDataPoint[];
  summary: {
    totalGrowth: number;
    totalGrowthPercent: number;
    avgDailyGrowth: number;
    bestDay: { date: string; growth: number };
    worstDay: { date: string; growth: number };
    trend: 'rising' | 'stable' | 'declining';
  };
  isDemo: boolean;
}

// Time range configurations
const TIME_RANGES = {
  '7d': { days: 7, label: '7 Tage' },
  '1m': { days: 30, label: '1 Monat' },
  '3m': { days: 90, label: '3 Monate' },
  '6m': { days: 180, label: '6 Monate' },
  '1y': { days: 365, label: '1 Jahr' },
  'max': { days: 730, label: 'Max (2 Jahre)' }
};

/**
 * Generate realistic follower history data based on username
 * Uses deterministic random based on username for consistency
 */
function generateDemoFollowerHistory(
  username: string,
  currentFollowers: number,
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' | 'max'
): FollowerHistoryData {
  const config = TIME_RANGES[timeRange];
  const days = config.days;
  
  // Seed random based on username for consistent results
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };
  
  // Determine account growth pattern based on username
  const isHighGrowth = seed % 3 === 0;
  const isStable = seed % 3 === 1;
  const baseGrowthRate = isHighGrowth ? 0.003 : isStable ? 0.001 : 0.0015;
  
  // Generate data points going backwards from today
  const dataPoints: FollowerDataPoint[] = [];
  let followers = currentFollowers;
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Calculate daily change with some randomness
    const randomFactor = (seededRandom(i) - 0.5) * 2; // -1 to 1
    const seasonalFactor = Math.sin((i / 30) * Math.PI) * 0.5 + 1; // Seasonal variation
    const trendFactor = 1 + (i / days) * 0.2; // Slight upward trend over time
    
    let dailyGrowthRate = baseGrowthRate * seasonalFactor * trendFactor;
    dailyGrowthRate += randomFactor * 0.002; // Add randomness
    
    // Occasional viral spikes
    if (seededRandom(i * 7) > 0.95) {
      dailyGrowthRate *= 3 + seededRandom(i * 11) * 5;
    }
    
    // Occasional dips
    if (seededRandom(i * 13) > 0.97) {
      dailyGrowthRate = -Math.abs(dailyGrowthRate) * 0.5;
    }
    
    const change = Math.round(followers * dailyGrowthRate);
    const changePercent = (change / followers) * 100;
    
    dataPoints.unshift({
      date: date.toISOString().split('T')[0],
      followers: followers,
      change: i === 0 ? 0 : change,
      changePercent: i === 0 ? 0 : parseFloat(changePercent.toFixed(3))
    });
    
    // Go back in time (subtract the growth to get previous day's count)
    if (i < days - 1) {
      followers = Math.max(100, followers - change);
    }
  }
  
  // Calculate summary statistics
  const changes = dataPoints.slice(1).map(d => d.change);
  const totalGrowth = changes.reduce((sum, c) => sum + c, 0);
  const totalGrowthPercent = (totalGrowth / dataPoints[0].followers) * 100;
  const avgDailyGrowth = totalGrowth / changes.length;
  
  const bestDayIndex = changes.indexOf(Math.max(...changes));
  const worstDayIndex = changes.indexOf(Math.min(...changes));
  
  let trend: 'rising' | 'stable' | 'declining';
  if (totalGrowthPercent > 5) trend = 'rising';
  else if (totalGrowthPercent < -2) trend = 'declining';
  else trend = 'stable';
  
  return {
    username,
    currentFollowers,
    timeRange,
    dataPoints,
    summary: {
      totalGrowth,
      totalGrowthPercent: parseFloat(totalGrowthPercent.toFixed(2)),
      avgDailyGrowth: Math.round(avgDailyGrowth),
      bestDay: {
        date: dataPoints[bestDayIndex + 1]?.date || dataPoints[1]?.date || '',
        growth: Math.max(...changes)
      },
      worstDay: {
        date: dataPoints[worstDayIndex + 1]?.date || dataPoints[1]?.date || '',
        growth: Math.min(...changes)
      },
      trend
    },
    isDemo: true
  };
}

/**
 * Get follower history for a username
 */
export async function getFollowerHistory(
  username: string,
  currentFollowers: number,
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' | 'max' = '1m'
): Promise<FollowerHistoryData> {
  // For now, always use demo data
  // In production, this would fetch from a database or external API
  return generateDemoFollowerHistory(username, currentFollowers, timeRange);
}

/**
 * Get available time ranges
 */
export function getTimeRanges() {
  return Object.entries(TIME_RANGES).map(([key, value]) => ({
    value: key as keyof typeof TIME_RANGES,
    label: value.label,
    days: value.days
  }));
}
