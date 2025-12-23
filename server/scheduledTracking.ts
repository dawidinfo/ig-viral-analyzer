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
