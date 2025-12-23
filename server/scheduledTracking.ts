import { getDb } from "./db";
import { savedAnalyses, followerSnapshots } from "../drizzle/schema";
import { eq, sql, and, isNotNull } from "drizzle-orm";
import { fetchInstagramProfile } from "./instagram";
import { fetchTikTokProfile } from "./tiktok";
import { fetchYouTubeChannel } from "./youtube";

/**
 * Scheduled Tracking Service
 * Automatically creates follower snapshots for all saved accounts
 */

interface TrackingResult {
  success: boolean;
  username: string;
  platform: string;
  followerCount?: number;
  error?: string;
}

/**
 * Get all unique saved accounts that need tracking
 */
export async function getSavedAccountsForTracking(): Promise<{ platform: string; username: string }[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    // Get unique platform/username combinations from saved analyses
    const accounts = await db
      .selectDistinct({
        platform: savedAnalyses.platform,
        username: savedAnalyses.username,
      })
      .from(savedAnalyses)
      .where(isNotNull(savedAnalyses.username));

    console.log(`[ScheduledTracking] Found ${accounts.length} unique accounts to track`);
    return accounts;
  } catch (error) {
    console.error("[ScheduledTracking] Error getting saved accounts:", error);
    return [];
  }
}

/**
 * Fetch current follower count for a single account
 */
async function fetchFollowerCount(platform: string, username: string): Promise<number | null> {
  try {
    switch (platform) {
      case "instagram": {
        const profile = await fetchInstagramProfile(username);
        return profile?.followerCount || null;
      }
      case "tiktok": {
        const profile = await fetchTikTokProfile(username);
        return profile?.followerCount || null;
      }
      case "youtube": {
        const channel = await fetchYouTubeChannel(username);
        return channel?.subscriberCount || null;
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`[ScheduledTracking] Error fetching ${platform}/${username}:`, error);
    return null;
  }
}

/**
 * Store a follower snapshot in the database
 */
async function storeSnapshot(
  platform: string,
  username: string,
  followerCount: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    await db.insert(followerSnapshots).values({
      platform: platform as "instagram" | "tiktok" | "youtube",
      username: username.toLowerCase(),
      followerCount,
      snapshotDate: today,
      isRealData: 1,
    });

    return true;
  } catch (error) {
    console.error(`[ScheduledTracking] Error storing snapshot for ${platform}/${username}:`, error);
    return false;
  }
}

/**
 * Track a single account
 */
async function trackAccount(platform: string, username: string): Promise<TrackingResult> {
  const followerCount = await fetchFollowerCount(platform, username);
  
  if (followerCount === null) {
    return {
      success: false,
      username,
      platform,
      error: "Could not fetch follower count",
    };
  }

  const stored = await storeSnapshot(platform, username, followerCount);
  
  return {
    success: stored,
    username,
    platform,
    followerCount,
    error: stored ? undefined : "Could not store snapshot",
  };
}

/**
 * Run the scheduled tracking job for all saved accounts
 * This should be called by a cron job daily
 */
export async function runScheduledTracking(): Promise<{
  totalAccounts: number;
  successful: number;
  failed: number;
  results: TrackingResult[];
}> {
  console.log("[ScheduledTracking] Starting scheduled tracking job...");
  const startTime = Date.now();
  
  const accounts = await getSavedAccountsForTracking();
  const results: TrackingResult[] = [];
  let successful = 0;
  let failed = 0;

  // Process accounts with rate limiting (1 request per 2 seconds)
  for (const account of accounts) {
    const result = await trackAccount(account.platform, account.username);
    results.push(result);
    
    if (result.success) {
      successful++;
      console.log(`[ScheduledTracking] ✓ ${account.platform}/${account.username}: ${result.followerCount} followers`);
    } else {
      failed++;
      console.log(`[ScheduledTracking] ✗ ${account.platform}/${account.username}: ${result.error}`);
    }

    // Rate limiting: wait 2 seconds between requests to avoid API limits
    if (accounts.indexOf(account) < accounts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[ScheduledTracking] Completed in ${duration}s: ${successful}/${accounts.length} successful`);

  return {
    totalAccounts: accounts.length,
    successful,
    failed,
    results,
  };
}

/**
 * Get tracking statistics
 */
export async function getTrackingStats(): Promise<{
  totalSnapshots: number;
  uniqueAccounts: number;
  lastTrackingRun: Date | null;
  snapshotsToday: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        totalSnapshots: 0,
        uniqueAccounts: 0,
        lastTrackingRun: null,
        snapshotsToday: 0,
      };
    }

    // Total snapshots
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(followerSnapshots);
    
    // Unique accounts
    const uniqueResult = await db
      .selectDistinct({ username: followerSnapshots.username, platform: followerSnapshots.platform })
      .from(followerSnapshots);

    // Last tracking run (most recent snapshot)
    const lastRunResult = await db
      .select({ createdAt: followerSnapshots.createdAt })
      .from(followerSnapshots)
      .orderBy(sql`${followerSnapshots.createdAt} DESC`)
      .limit(1);

    // Snapshots today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(followerSnapshots)
      .where(sql`DATE(${followerSnapshots.createdAt}) = CURDATE()`);

    return {
      totalSnapshots: Number(totalResult[0]?.count || 0),
      uniqueAccounts: uniqueResult.length,
      lastTrackingRun: lastRunResult[0]?.createdAt || null,
      snapshotsToday: Number(todayResult[0]?.count || 0),
    };
  } catch (error) {
    console.error("[ScheduledTracking] Error getting stats:", error);
    return {
      totalSnapshots: 0,
      uniqueAccounts: 0,
      lastTrackingRun: null,
      snapshotsToday: 0,
    };
  }
}


/**
 * Get top growing accounts with growth data
 */
export async function getTopGrowingAccounts(options: {
  platform?: string;
  days?: number;
  limit?: number;
}): Promise<{
  username: string;
  platform: string;
  startFollowers: number;
  currentFollowers: number;
  growth: number;
  growthPercent: number;
  sparklineData: number[];
}[]> {
  const { platform, days = 30, limit = 10 } = options;
  
  try {
    const db = await getDb();
    if (!db) return [];

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get all unique accounts with snapshots in the date range
    let query = db
      .selectDistinct({
        username: followerSnapshots.username,
        platform: followerSnapshots.platform,
      })
      .from(followerSnapshots)
      .where(sql`${followerSnapshots.snapshotDate} >= ${startDateStr}`);

    const accounts = await query;

    // Calculate growth for each account
    const accountsWithGrowth = await Promise.all(
      accounts
        .filter(acc => !platform || acc.platform === platform)
        .map(async (account) => {
          // Get all snapshots for this account in date range
          const snapshots = await db
            .select({
              followerCount: followerSnapshots.followerCount,
              snapshotDate: followerSnapshots.snapshotDate,
            })
            .from(followerSnapshots)
            .where(
              and(
                eq(followerSnapshots.username, account.username),
                eq(followerSnapshots.platform, account.platform as "instagram" | "tiktok" | "youtube"),
                sql`${followerSnapshots.snapshotDate} >= ${startDateStr}`
              )
            )
            .orderBy(sql`${followerSnapshots.snapshotDate} ASC`);

          if (snapshots.length < 2) {
            return null;
          }

          const startFollowers = snapshots[0].followerCount;
          const currentFollowers = snapshots[snapshots.length - 1].followerCount;
          const growth = currentFollowers - startFollowers;
          const growthPercent = startFollowers > 0 ? (growth / startFollowers) * 100 : 0;

          // Create sparkline data (last 7-10 data points)
          const sparklineData = snapshots
            .slice(-10)
            .map(s => s.followerCount);

          return {
            username: account.username,
            platform: account.platform,
            startFollowers,
            currentFollowers,
            growth,
            growthPercent,
            sparklineData,
          };
        })
    );

    // Filter out nulls and sort by growth percent (descending)
    return accountsWithGrowth
      .filter((acc): acc is NonNullable<typeof acc> => acc !== null)
      .sort((a, b) => b.growthPercent - a.growthPercent)
      .slice(0, limit);
  } catch (error) {
    console.error("[ScheduledTracking] Error getting top growing accounts:", error);
    return [];
  }
}

/**
 * Get accounts with declining followers
 */
export async function getDecliningAccounts(options: {
  days?: number;
  limit?: number;
}): Promise<{
  username: string;
  platform: string;
  startFollowers: number;
  currentFollowers: number;
  decline: number;
  declinePercent: number;
}[]> {
  const { days = 30, limit = 5 } = options;
  
  try {
    const db = await getDb();
    if (!db) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get all unique accounts
    const accounts = await db
      .selectDistinct({
        username: followerSnapshots.username,
        platform: followerSnapshots.platform,
      })
      .from(followerSnapshots)
      .where(sql`${followerSnapshots.snapshotDate} >= ${startDateStr}`);

    // Calculate decline for each account
    const accountsWithDecline = await Promise.all(
      accounts.map(async (account) => {
        const snapshots = await db
          .select({
            followerCount: followerSnapshots.followerCount,
          })
          .from(followerSnapshots)
          .where(
            and(
              eq(followerSnapshots.username, account.username),
              eq(followerSnapshots.platform, account.platform as "instagram" | "tiktok" | "youtube"),
              sql`${followerSnapshots.snapshotDate} >= ${startDateStr}`
            )
          )
          .orderBy(sql`${followerSnapshots.snapshotDate} ASC`);

        if (snapshots.length < 2) {
          return null;
        }

        const startFollowers = snapshots[0].followerCount;
        const currentFollowers = snapshots[snapshots.length - 1].followerCount;
        const decline = startFollowers - currentFollowers;
        const declinePercent = startFollowers > 0 ? (decline / startFollowers) * 100 : 0;

        // Only return if actually declining
        if (decline <= 0) return null;

        return {
          username: account.username,
          platform: account.platform,
          startFollowers,
          currentFollowers,
          decline,
          declinePercent,
        };
      })
    );

    return accountsWithDecline
      .filter((acc): acc is NonNullable<typeof acc> => acc !== null)
      .sort((a, b) => b.declinePercent - a.declinePercent)
      .slice(0, limit);
  } catch (error) {
    console.error("[ScheduledTracking] Error getting declining accounts:", error);
    return [];
  }
}

/**
 * Get platform distribution of tracked accounts
 */
export async function getPlatformDistribution(): Promise<{
  platform: string;
  count: number;
  percentage: number;
}[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const distribution = await db
      .select({
        platform: followerSnapshots.platform,
        count: sql<number>`COUNT(DISTINCT ${followerSnapshots.username})`,
      })
      .from(followerSnapshots)
      .groupBy(followerSnapshots.platform);

    const total = distribution.reduce((sum, d) => sum + Number(d.count), 0);

    return distribution.map(d => ({
      platform: d.platform,
      count: Number(d.count),
      percentage: total > 0 ? (Number(d.count) / total) * 100 : 0,
    }));
  } catch (error) {
    console.error("[ScheduledTracking] Error getting platform distribution:", error);
    return [];
  }
}

/**
 * Get detailed history for a specific account
 */
export async function getAccountHistory(
  platform: string,
  username: string,
  days: number = 90
): Promise<{
  date: string;
  followerCount: number;
}[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const history = await db
      .select({
        date: followerSnapshots.snapshotDate,
        followerCount: followerSnapshots.followerCount,
      })
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.username, username.toLowerCase()),
          eq(followerSnapshots.platform, platform as "instagram" | "tiktok" | "youtube"),
          sql`${followerSnapshots.snapshotDate} >= ${startDateStr}`
        )
      )
      .orderBy(sql`${followerSnapshots.snapshotDate} ASC`);

    return history;
  } catch (error) {
    console.error("[ScheduledTracking] Error getting account history:", error);
    return [];
  }
}
