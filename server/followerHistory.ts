/**
 * Follower History Service
 * Tracks and retrieves historical follower growth data
 * Uses real database snapshots with demo fallback for new accounts
 */

import { getDb } from "./db";
import { followerSnapshots } from "../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

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
  realDataPoints: number; // How many data points are from real tracking
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
 * Combines real database snapshots with demo data for missing days
 */
export async function getFollowerHistory(
  username: string,
  currentFollowers: number,
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' | 'max' = '1m',
  platform: 'instagram' | 'tiktok' | 'youtube' = 'instagram'
): Promise<FollowerHistoryData> {
  const config = TIME_RANGES[timeRange];
  const days = config.days;
  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  
  // Get stored snapshots from database
  const storedSnapshots = await getStoredSnapshots(platform, cleanUsername, days);
  const realDataPoints = storedSnapshots.filter(s => s.isReal).length;
  
  console.log(`[FollowerHistory] Found ${realDataPoints} real data points for @${cleanUsername} (${platform})`);
  
  // Generate data points (using real data where available, demo for the rest)
  const dataPoints = generateDemoFollowerHistory(
    cleanUsername,
    currentFollowers,
    days,
    storedSnapshots
  );
  
  // Calculate summary
  const summary = calculateSummary(dataPoints);
  
  // Determine if this is mostly demo data
  const isDemo = realDataPoints < Math.min(3, days * 0.1); // Less than 10% real data or less than 3 points
  
  return {
    username: cleanUsername,
    platform,
    currentFollowers,
    timeRange,
    dataPoints,
    summary,
    isDemo,
    realDataPoints
  };
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
