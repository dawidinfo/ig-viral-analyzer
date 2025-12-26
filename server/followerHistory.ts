/**
 * Follower History Service
 * Tracks and retrieves historical follower growth data
 * Uses Instagram Statistics API for real data, with demo fallback
 */

import { getDb } from "./db";
import { followerSnapshots } from "../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getHistoricalFollowerData, isInstagramStatisticsApiConfigured } from "./services/instagramStatisticsApi";

export interface FollowerDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  followers: number;
  change: number; // Daily change
  changePercent: number;
}

export interface FollowerHistoryData {
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  currentFollowers: number;
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' | 'max' | 'custom';
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
  realDataPoints: number; // How many data points are from real tracking
}

// Time range configurations
const TIME_RANGES = {
  '7d': { days: 7, label: '7 Tage' },
  '1m': { days: 30, label: '1 Monat' },
  '3m': { days: 90, label: '3 Monate' },
  '6m': { days: 180, label: '6 Monate' },
  '1y': { days: 365, label: '1 Jahr' },
  'max': { days: 730, label: 'Max (2 Jahre)' },
  'custom': { days: 30, label: 'Benutzerdefiniert' }
};

/**
 * Store a follower snapshot in the database
 */
export async function storeFollowerSnapshot(
  platform: 'instagram' | 'tiktok' | 'youtube',
  username: string,
  data: {
    followerCount: number;
    followingCount?: number;
    postCount?: number;
    totalLikes?: number;
    totalViews?: number;
    engagementRate?: number;
  },
  isRealData: boolean = true
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[FollowerHistory] Database not available');
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  
  try {
    // Check if we already have a snapshot for today
    const existing = await db
      .select()
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.platform, platform),
          eq(followerSnapshots.username, cleanUsername),
          eq(followerSnapshots.snapshotDate, today)
        )
      )
      .limit(1);
    
    if (existing.length === 0) {
      // Insert new snapshot
      await db.insert(followerSnapshots).values({
        platform,
        username: cleanUsername,
        followerCount: data.followerCount,
        followingCount: data.followingCount || null,
        postCount: data.postCount || null,
        totalLikes: data.totalLikes || null,
        totalViews: data.totalViews || null,
        engagementRate: data.engagementRate?.toString() || null,
        snapshotDate: today,
        isRealData: isRealData ? 1 : 0,
      });
      console.log(`[FollowerHistory] Stored snapshot for @${cleanUsername} on ${platform}: ${data.followerCount} followers`);
    } else {
      console.log(`[FollowerHistory] Snapshot already exists for @${cleanUsername} today`);
    }
  } catch (error) {
    console.error(`[FollowerHistory] Error storing snapshot:`, error);
  }
}

/**
 * Get stored follower snapshots from database
 */
async function getStoredSnapshots(
  platform: 'instagram' | 'tiktok' | 'youtube',
  username: string,
  days: number
): Promise<Array<{ date: string; followers: number; isReal: boolean }>> {
  const db = await getDb();
  if (!db) {
    console.error('[FollowerHistory] Database not available');
    return [];
  }
  
  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  try {
    const snapshots = await db
      .select({
        snapshotDate: followerSnapshots.snapshotDate,
        followerCount: followerSnapshots.followerCount,
        isRealData: followerSnapshots.isRealData,
      })
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.platform, platform),
          eq(followerSnapshots.username, cleanUsername),
          gte(followerSnapshots.snapshotDate, startDateStr)
        )
      )
      .orderBy(desc(followerSnapshots.snapshotDate));
    
    return snapshots.map(s => ({
      date: s.snapshotDate,
      followers: s.followerCount,
      isReal: s.isRealData === 1
    }));
  } catch (error) {
    console.error(`[FollowerHistory] Error fetching snapshots:`, error);
    return [];
  }
}

/**
 * Generate demo follower history data based on username
 * Uses deterministic random based on username for consistency
 */
function generateDemoFollowerHistory(
  username: string,
  currentFollowers: number,
  days: number,
  existingSnapshots: Array<{ date: string; followers: number; isReal: boolean }> = []
): FollowerDataPoint[] {
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
  
  // Create a map of existing real data
  const realDataMap = new Map<string, number>();
  existingSnapshots.forEach(s => {
    if (s.isReal) {
      realDataMap.set(s.date, s.followers);
    }
  });
  
  // Generate data points going backwards from today
  const dataPoints: FollowerDataPoint[] = [];
  let followers = currentFollowers;
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Use real data if available
    if (realDataMap.has(dateStr)) {
      followers = realDataMap.get(dateStr)!;
    }
    
    // Calculate daily change with some randomness
    const randomFactor = (seededRandom(i) - 0.5) * 2;
    const seasonalFactor = Math.sin((i / 30) * Math.PI) * 0.5 + 1;
    const trendFactor = 1 + (i / days) * 0.2;
    
    let dailyGrowthRate = baseGrowthRate * seasonalFactor * trendFactor;
    dailyGrowthRate += randomFactor * 0.002;
    
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
      date: dateStr,
      followers: followers,
      change: i === 0 ? 0 : change,
      changePercent: i === 0 ? 0 : parseFloat(changePercent.toFixed(3))
    });
    
    // Go back in time (subtract the growth to get previous day's count)
    if (i < days - 1 && !realDataMap.has(dateStr)) {
      followers = Math.max(100, followers - change);
    }
  }
  
  return dataPoints;
}

/**
 * Calculate summary statistics from data points
 */
function calculateSummary(dataPoints: FollowerDataPoint[]): FollowerHistoryData['summary'] {
  const changes = dataPoints.slice(1).map(d => d.change);
  
  if (changes.length === 0) {
    return {
      totalGrowth: 0,
      totalGrowthPercent: 0,
      avgDailyGrowth: 0,
      bestDay: { date: '', growth: 0 },
      worstDay: { date: '', growth: 0 },
      trend: 'stable'
    };
  }
  
  const totalGrowth = changes.reduce((sum, c) => sum + c, 0);
  const totalGrowthPercent = dataPoints[0].followers > 0 
    ? (totalGrowth / dataPoints[0].followers) * 100 
    : 0;
  const avgDailyGrowth = totalGrowth / changes.length;
  
  const maxChange = Math.max(...changes);
  const minChange = Math.min(...changes);
  const bestDayIndex = changes.indexOf(maxChange);
  const worstDayIndex = changes.indexOf(minChange);
  
  let trend: 'rising' | 'stable' | 'declining';
  if (totalGrowthPercent > 5) trend = 'rising';
  else if (totalGrowthPercent < -2) trend = 'declining';
  else trend = 'stable';
  
  return {
    totalGrowth,
    totalGrowthPercent: parseFloat(totalGrowthPercent.toFixed(2)),
    avgDailyGrowth: Math.round(avgDailyGrowth),
    bestDay: {
      date: dataPoints[bestDayIndex + 1]?.date || dataPoints[1]?.date || '',
      growth: maxChange
    },
    worstDay: {
      date: dataPoints[worstDayIndex + 1]?.date || dataPoints[1]?.date || '',
      growth: minChange
    },
    trend
  };
}

/**
 * Get follower history for a username
 * Uses Instagram Statistics API for real data, falls back to demo data
 */
export async function getFollowerHistory(
  username: string,
  currentFollowers: number,
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' | 'max' | 'custom' = '1m',
  platform: 'instagram' | 'tiktok' | 'youtube' = 'instagram',
  customStartDate?: string, // ISO date string (YYYY-MM-DD)
  customEndDate?: string // ISO date string (YYYY-MM-DD)
): Promise<FollowerHistoryData> {
  let days: number;
  
  if (timeRange === 'custom' && customStartDate && customEndDate) {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    // Limit to max 2 years
    days = Math.min(days, 730);
  } else {
    const config = TIME_RANGES[timeRange];
    days = config.days;
  }
  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  
  // Try to get real historical data from Instagram Statistics API (Instagram only)
  if (platform === 'instagram' && isInstagramStatisticsApiConfigured()) {
    console.log(`[FollowerHistory] Attempting to fetch real data from Instagram Statistics API for @${cleanUsername}`);
    
    try {
      const realData = await getHistoricalFollowerData(cleanUsername, days);
      
      if (realData && realData.dataPoints.length > 0) {
        console.log(`[FollowerHistory] Got ${realData.dataPoints.length} real data points from API for @${cleanUsername}`);
        
        // Store the data points in our database for caching
        for (const point of realData.dataPoints) {
          await storeFollowerSnapshot(platform, cleanUsername, {
            followerCount: point.followers,
          }, true);
        }
        
        return {
          username: cleanUsername,
          platform,
          currentFollowers: realData.dataPoints[realData.dataPoints.length - 1]?.followers || currentFollowers,
          timeRange,
          dataPoints: realData.dataPoints,
          summary: {
            totalGrowth: realData.summary.totalGrowth,
            totalGrowthPercent: realData.summary.totalGrowthPercent,
            avgDailyGrowth: realData.summary.avgDailyGrowth,
            bestDay: findBestDay(realData.dataPoints),
            worstDay: findWorstDay(realData.dataPoints),
            trend: realData.summary.trend,
          },
          isDemo: false,
          realDataPoints: realData.dataPoints.length,
        };
      }
    } catch (error) {
      console.error(`[FollowerHistory] Error fetching from Instagram Statistics API:`, error);
    }
  }
  
  // Get stored snapshots from our own database (no demo data fallback)
  const storedSnapshots = await getStoredSnapshots(platform, cleanUsername, days);
  const realDataPoints = storedSnapshots.filter(s => s.isReal).length;
  
  console.log(`[FollowerHistory] Found ${realDataPoints} stored data points for @${cleanUsername} (${platform})`);
  
  // If we have real data points, use them
  if (realDataPoints >= 2) {
    // Convert stored snapshots to data points
    const sortedSnapshots = storedSnapshots
      .filter(s => s.isReal)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const dataPoints: FollowerDataPoint[] = sortedSnapshots.map((s, index) => {
      const prevFollowers = index > 0 ? sortedSnapshots[index - 1].followers : s.followers;
      const change = s.followers - prevFollowers;
      const changePercent = prevFollowers > 0 ? (change / prevFollowers) * 100 : 0;
      
      return {
        date: s.date,
        followers: s.followers,
        change: index === 0 ? 0 : change,
        changePercent: index === 0 ? 0 : parseFloat(changePercent.toFixed(3))
      };
    });
    
    const summary = calculateSummary(dataPoints);
    
    return {
      username: cleanUsername,
      platform,
      currentFollowers,
      timeRange,
      dataPoints,
      summary,
      isDemo: false,
      realDataPoints
    };
  }
  
  // No real data available - return empty data with flag
  // Store current snapshot for future tracking
  await storeFollowerSnapshot(platform, cleanUsername, {
    followerCount: currentFollowers,
  }, true);
  
  console.log(`[FollowerHistory] No historical data for @${cleanUsername}, started tracking today`);
  
  // Return minimal data indicating tracking just started
  const today = new Date().toISOString().split('T')[0];
  return {
    username: cleanUsername,
    platform,
    currentFollowers,
    timeRange,
    dataPoints: [{
      date: today,
      followers: currentFollowers,
      change: 0,
      changePercent: 0
    }],
    summary: {
      totalGrowth: 0,
      totalGrowthPercent: 0,
      avgDailyGrowth: 0,
      bestDay: { date: today, growth: 0 },
      worstDay: { date: today, growth: 0 },
      trend: 'stable'
    },
    isDemo: false, // Not demo - just no data yet
    realDataPoints: 1 // We just stored today's snapshot
  };
}

/**
 * Find the best day (highest growth) from data points
 */
function findBestDay(dataPoints: FollowerDataPoint[]): { date: string; growth: number } {
  if (dataPoints.length === 0) return { date: '', growth: 0 };
  const best = dataPoints.reduce((max, p) => p.change > max.change ? p : max, dataPoints[0]);
  return { date: best.date, growth: best.change };
}

/**
 * Find the worst day (lowest growth) from data points
 */
function findWorstDay(dataPoints: FollowerDataPoint[]): { date: string; growth: number } {
  if (dataPoints.length === 0) return { date: '', growth: 0 };
  const worst = dataPoints.reduce((min, p) => p.change < min.change ? p : min, dataPoints[0]);
  return { date: worst.date, growth: worst.change };
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

/**
 * Get total tracked accounts count
 */
export async function getTrackedAccountsCount(): Promise<{ instagram: number; tiktok: number; youtube: number; total: number }> {
  const db = await getDb();
  if (!db) {
    return { instagram: 0, tiktok: 0, youtube: 0, total: 0 };
  }
  
  try {
    const results = await db
      .select({
        platform: followerSnapshots.platform,
        username: followerSnapshots.username,
      })
      .from(followerSnapshots)
      .groupBy(followerSnapshots.platform, followerSnapshots.username);
    
    const counts = { instagram: 0, tiktok: 0, youtube: 0, total: 0 };
    results.forEach(r => {
      if (r.platform === 'instagram') counts.instagram++;
      else if (r.platform === 'tiktok') counts.tiktok++;
      else if (r.platform === 'youtube') counts.youtube++;
      counts.total++;
    });
    
    return counts;
  } catch (error) {
    console.error(`[FollowerHistory] Error getting tracked accounts count:`, error);
    return { instagram: 0, tiktok: 0, youtube: 0, total: 0 };
  }
}
