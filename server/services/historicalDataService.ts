/**
 * Historical Data Service
 * Caches Instagram/TikTok/YouTube data locally to reduce API costs
 * Stores profile snapshots, posts, and AI analysis results
 */

import { getDb } from "../db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import {
  instagramProfileHistory,
  instagramPostsHistory,
  aiAnalysisCache,
  dataCollectionQueue,
  cacheStatistics,
  followerSnapshots,
} from "../../drizzle/schema";
import crypto from "crypto";

// Cache duration in hours
const CACHE_DURATIONS = {
  profile: 24, // Profile data valid for 24 hours
  posts: 12, // Posts data valid for 12 hours
  aiAnalysis: 168, // AI analysis valid for 7 days (168 hours)
  followerSnapshot: 24, // One snapshot per day
};

// Estimated API costs in cents per call
const API_COSTS = {
  instagram_profile: 1, // ~$0.01 per profile call
  instagram_posts: 2, // ~$0.02 per posts call
  instagram_statistics: 5, // ~$0.05 per statistics call
  tiktok_profile: 1,
  tiktok_videos: 2,
  youtube_channel: 1,
  youtube_videos: 2,
};

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Generate content hash for change detection
 */
function generateContentHash(content: any): string {
  const str = JSON.stringify(content);
  return crypto.createHash("md5").update(str).digest("hex");
}

/**
 * Calculate expiration timestamp
 */
function getExpirationTime(hours: number): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

// ==================== INSTAGRAM PROFILE HISTORY ====================

/**
 * Save Instagram profile snapshot to history
 */
export async function saveInstagramProfileSnapshot(
  username: string,
  profileData: any,
  metrics: {
    followerCount: number;
    followingCount?: number;
    postCount?: number;
    engagementRate?: number;
    avgLikes?: number;
    avgComments?: number;
    avgReelViews?: number;
    viralScore?: number;
  },
  dataSource: "api" | "cache" | "manual" = "api"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const today = getTodayDate();
  const normalizedUsername = username.toLowerCase().replace("@", "").trim();

  try {
    // Check if we already have a snapshot for today
    const existingSnapshot = await db
      .select()
      .from(instagramProfileHistory)
      .where(
        and(
          eq(instagramProfileHistory.username, normalizedUsername),
          eq(instagramProfileHistory.snapshotDate, today)
        )
      )
      .limit(1);

    if (existingSnapshot.length > 0) {
      // Update existing snapshot with latest data
      await db
        .update(instagramProfileHistory)
        .set({
          followerCount: metrics.followerCount,
          followingCount: metrics.followingCount,
          postCount: metrics.postCount,
          engagementRate: metrics.engagementRate?.toString(),
          avgLikes: metrics.avgLikes,
          avgComments: metrics.avgComments,
          avgReelViews: metrics.avgReelViews,
          viralScore: metrics.viralScore,
          rawApiData: profileData,
        })
        .where(eq(instagramProfileHistory.id, existingSnapshot[0].id));
      
      console.log(`[HistoricalData] Updated profile snapshot for @${normalizedUsername}`);
      return;
    }

    // Insert new snapshot
    await db.insert(instagramProfileHistory).values({
      username: normalizedUsername,
      instagramId: profileData.id || profileData.pk || null,
      fullName: profileData.full_name || profileData.fullName || null,
      biography: profileData.biography || profileData.bio || null,
      profilePicUrl: profileData.profile_pic_url || profileData.profilePicUrl || null,
      externalUrl: profileData.external_url || profileData.externalUrl || null,
      isVerified: profileData.is_verified || profileData.isVerified ? 1 : 0,
      isBusinessAccount: profileData.is_business_account || profileData.isBusinessAccount ? 1 : 0,
      businessCategory: profileData.business_category_name || profileData.businessCategory || null,
      followerCount: metrics.followerCount,
      followingCount: metrics.followingCount || null,
      postCount: metrics.postCount || null,
      engagementRate: metrics.engagementRate?.toString() || null,
      avgLikes: metrics.avgLikes || null,
      avgComments: metrics.avgComments || null,
      avgReelViews: metrics.avgReelViews || null,
      viralScore: metrics.viralScore || null,
      rawApiData: profileData,
      snapshotDate: today,
      dataSource,
    });
    console.log(`[HistoricalData] Saved new profile snapshot for @${normalizedUsername}`);

    // Also save to follower_snapshots for growth tracking
    await saveFollowerSnapshot("instagram", normalizedUsername, {
      followerCount: metrics.followerCount,
      followingCount: metrics.followingCount,
      postCount: metrics.postCount,
      engagementRate: metrics.engagementRate,
    });

    // Update cache statistics
    await updateCacheStatistics("instagram", false);
  } catch (error) {
    console.error("[HistoricalData] Error saving profile snapshot:", error);
  }
}

/**
 * Get latest Instagram profile from history (cache)
 */
export async function getCachedInstagramProfile(
  username: string,
  maxAgeHours: number = CACHE_DURATIONS.profile
): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  const normalizedUsername = username.toLowerCase().replace("@", "").trim();
  const minDate = new Date();
  minDate.setHours(minDate.getHours() - maxAgeHours);
  const minDateStr = minDate.toISOString().split("T")[0];

  try {
    const cached = await db
      .select()
      .from(instagramProfileHistory)
      .where(
        and(
          eq(instagramProfileHistory.username, normalizedUsername),
          gte(instagramProfileHistory.snapshotDate, minDateStr)
        )
      )
      .orderBy(desc(instagramProfileHistory.createdAt))
      .limit(1);

    if (cached.length > 0) {
      console.log(`[HistoricalData] Cache HIT for profile @${normalizedUsername}`);
      await updateCacheStatistics("instagram", true);
      return {
        ...cached[0],
        fromCache: true,
        cacheAge: Math.round(
          (Date.now() - new Date(cached[0].createdAt).getTime()) / 1000 / 60
        ), // minutes
      };
    }

    console.log(`[HistoricalData] Cache MISS for profile @${normalizedUsername}`);
    return null;
  } catch (error) {
    console.error("[HistoricalData] Error getting cached profile:", error);
    return null;
  }
}

/**
 * Get historical profile data for growth charts
 */
export async function getInstagramProfileHistory(
  username: string,
  days: number = 30
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const normalizedUsername = username.toLowerCase().replace("@", "").trim();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  try {
    const history = await db
      .select()
      .from(instagramProfileHistory)
      .where(
        and(
          eq(instagramProfileHistory.username, normalizedUsername),
          gte(instagramProfileHistory.snapshotDate, fromDateStr)
        )
      )
      .orderBy(instagramProfileHistory.snapshotDate);

    return history;
  } catch (error) {
    console.error("[HistoricalData] Error getting profile history:", error);
    return [];
  }
}

// ==================== INSTAGRAM POSTS HISTORY ====================

/**
 * Save Instagram posts/reels to history
 */
export async function saveInstagramPostsSnapshot(
  username: string,
  posts: any[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const today = getTodayDate();
  const normalizedUsername = username.toLowerCase().replace("@", "").trim();

  try {
    for (const post of posts) {
      const postId = post.id || post.pk || post.code;
      if (!postId) continue;

      // Check if we already have this post for today
      const existing = await db
        .select()
        .from(instagramPostsHistory)
        .where(
          and(
            eq(instagramPostsHistory.postId, postId.toString()),
            eq(instagramPostsHistory.snapshotDate, today)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing with latest metrics
        await db
          .update(instagramPostsHistory)
          .set({
            likeCount: post.like_count || post.likeCount || 0,
            commentCount: post.comment_count || post.commentCount || 0,
            viewCount: post.view_count || post.viewCount || post.play_count || null,
            playCount: post.play_count || post.playCount || null,
            rawApiData: post,
          })
          .where(eq(instagramPostsHistory.id, existing[0].id));
        continue;
      }

      // Determine post type
      let postType: "image" | "video" | "carousel" | "reel" = "image";
      if (post.media_type === 2 || post.is_video || post.video_url) {
        postType = post.product_type === "clips" ? "reel" : "video";
      } else if (post.media_type === 8 || post.carousel_media) {
        postType = "carousel";
      }

      // Extract hashtags from caption
      const caption = post.caption?.text || post.caption || "";
      const hashtags = caption.match(/#\w+/g) || [];
      const mentions = caption.match(/@\w+/g) || [];

      await db.insert(instagramPostsHistory).values({
        username: normalizedUsername,
        postId: postId.toString(),
        postType,
        shortcode: post.code || post.shortcode || null,
        caption: caption,
        thumbnailUrl: post.thumbnail_url || post.display_url || post.image_versions2?.candidates?.[0]?.url || null,
        videoUrl: post.video_url || null,
        likeCount: post.like_count || post.likeCount || 0,
        commentCount: post.comment_count || post.commentCount || 0,
        viewCount: post.view_count || post.viewCount || post.play_count || null,
        playCount: post.play_count || post.playCount || null,
        shareCount: post.share_count || null,
        saveCount: post.save_count || null,
        videoDuration: post.video_duration || null,
        hashtags: hashtags,
        mentions: mentions,
        location: post.location?.name || null,
        audioName: post.clips_metadata?.audio_type || post.music_metadata?.music_info?.music_asset_info?.title || null,
        postedAt: post.taken_at ? new Date(post.taken_at * 1000) : null,
        snapshotDate: today,
        rawApiData: post,
      });
    }

    console.log(`[HistoricalData] Saved ${posts.length} posts for @${normalizedUsername}`);
  } catch (error) {
    console.error("[HistoricalData] Error saving posts snapshot:", error);
  }
}

/**
 * Get cached Instagram posts
 */
export async function getCachedInstagramPosts(
  username: string,
  maxAgeHours: number = CACHE_DURATIONS.posts
): Promise<any[] | null> {
  const db = await getDb();
  if (!db) return null;

  const normalizedUsername = username.toLowerCase().replace("@", "").trim();
  const minDate = new Date();
  minDate.setHours(minDate.getHours() - maxAgeHours);
  const minDateStr = minDate.toISOString().split("T")[0];

  try {
    const cached = await db
      .select()
      .from(instagramPostsHistory)
      .where(
        and(
          eq(instagramPostsHistory.username, normalizedUsername),
          gte(instagramPostsHistory.snapshotDate, minDateStr)
        )
      )
      .orderBy(desc(instagramPostsHistory.postedAt))
      .limit(50);

    if (cached.length > 0) {
      console.log(`[HistoricalData] Cache HIT for posts @${normalizedUsername} (${cached.length} posts)`);
      return cached.map((p: any) => ({
        ...p.rawApiData,
        fromCache: true,
        cachedAt: p.createdAt,
      }));
    }

    console.log(`[HistoricalData] Cache MISS for posts @${normalizedUsername}`);
    return null;
  } catch (error) {
    console.error("[HistoricalData] Error getting cached posts:", error);
    return null;
  }
}

/**
 * Get post performance history (for tracking viral growth)
 */
export async function getPostPerformanceHistory(
  postId: string,
  days: number = 7
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  try {
    const history = await db
      .select()
      .from(instagramPostsHistory)
      .where(
        and(
          eq(instagramPostsHistory.postId, postId),
          gte(instagramPostsHistory.snapshotDate, fromDateStr)
        )
      )
      .orderBy(instagramPostsHistory.snapshotDate);

    return history;
  } catch (error) {
    console.error("[HistoricalData] Error getting post history:", error);
    return [];
  }
}

// ==================== AI ANALYSIS CACHE ====================

/**
 * Save AI analysis results to cache
 */
export async function saveAiAnalysisCache(
  platform: "instagram" | "tiktok" | "youtube",
  identifier: string,
  analysisType: "profile" | "post" | "reel" | "video" | "deep",
  analysisData: {
    hapss?: any;
    aida?: any;
    hook?: any;
    copywriting?: any;
    patterns?: any;
    viralFactors?: any;
    recommendations?: any;
    full?: any;
  },
  contentHash?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const expiresAt = getExpirationTime(CACHE_DURATIONS.aiAnalysis);

  try {
    // Check for existing cache
    const existing = await db
      .select()
      .from(aiAnalysisCache)
      .where(
        and(
          eq(aiAnalysisCache.platform, platform),
          eq(aiAnalysisCache.identifier, identifier),
          eq(aiAnalysisCache.analysisType, analysisType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing cache
      await db
        .update(aiAnalysisCache)
        .set({
          contentHash: contentHash || null,
          hapssAnalysis: analysisData.hapss || null,
          aidaAnalysis: analysisData.aida || null,
          hookAnalysis: analysisData.hook || null,
          copywritingAnalysis: analysisData.copywriting || null,
          patternAnalysis: analysisData.patterns || null,
          viralFactors: analysisData.viralFactors || null,
          recommendations: analysisData.recommendations || null,
          fullAnalysisData: analysisData.full || null,
          isValid: 1,
          expiresAt,
        })
        .where(eq(aiAnalysisCache.id, existing[0].id));
      
      console.log(`[HistoricalData] Updated AI analysis cache for ${platform}:${identifier}`);
      return;
    }

    // Insert new cache entry
    await db.insert(aiAnalysisCache).values({
      platform,
      identifier,
      analysisType,
      contentHash: contentHash || null,
      hapssAnalysis: analysisData.hapss || null,
      aidaAnalysis: analysisData.aida || null,
      hookAnalysis: analysisData.hook || null,
      copywritingAnalysis: analysisData.copywriting || null,
      patternAnalysis: analysisData.patterns || null,
      viralFactors: analysisData.viralFactors || null,
      recommendations: analysisData.recommendations || null,
      fullAnalysisData: analysisData.full || null,
      isValid: 1,
      expiresAt,
    });
    console.log(`[HistoricalData] Saved AI analysis cache for ${platform}:${identifier}`);
  } catch (error) {
    console.error("[HistoricalData] Error saving AI analysis cache:", error);
  }
}

/**
 * Get cached AI analysis
 */
export async function getCachedAiAnalysis(
  platform: "instagram" | "tiktok" | "youtube",
  identifier: string,
  analysisType: "profile" | "post" | "reel" | "video" | "deep"
): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const cached = await db
      .select()
      .from(aiAnalysisCache)
      .where(
        and(
          eq(aiAnalysisCache.platform, platform),
          eq(aiAnalysisCache.identifier, identifier),
          eq(aiAnalysisCache.analysisType, analysisType),
          eq(aiAnalysisCache.isValid, 1),
          gte(aiAnalysisCache.expiresAt, new Date())
        )
      )
      .limit(1);

    if (cached.length > 0) {
      console.log(`[HistoricalData] AI analysis cache HIT for ${platform}:${identifier}`);
      return {
        ...cached[0],
        fromCache: true,
      };
    }

    console.log(`[HistoricalData] AI analysis cache MISS for ${platform}:${identifier}`);
    return null;
  } catch (error) {
    console.error("[HistoricalData] Error getting cached AI analysis:", error);
    return null;
  }
}

// ==================== FOLLOWER SNAPSHOTS ====================

/**
 * Save follower snapshot for growth tracking
 */
export async function saveFollowerSnapshot(
  platform: "instagram" | "tiktok" | "youtube",
  username: string,
  data: {
    followerCount: number;
    followingCount?: number;
    postCount?: number;
    totalLikes?: number;
    totalViews?: number;
    engagementRate?: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const today = getTodayDate();
  const normalizedUsername = username.toLowerCase().replace("@", "").trim();

  try {
    // Check if we already have a snapshot for today
    const existing = await db
      .select()
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.platform, platform),
          eq(followerSnapshots.username, normalizedUsername),
          eq(followerSnapshots.snapshotDate, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(followerSnapshots)
        .set({
          followerCount: data.followerCount,
          followingCount: data.followingCount || null,
          postCount: data.postCount || null,
          totalLikes: data.totalLikes || null,
          totalViews: data.totalViews || null,
          engagementRate: data.engagementRate?.toString() || null,
          isRealData: 1,
        })
        .where(eq(followerSnapshots.id, existing[0].id));
      return;
    }

    // Insert new snapshot
    await db.insert(followerSnapshots).values({
      platform,
      username: normalizedUsername,
      followerCount: data.followerCount,
      followingCount: data.followingCount || null,
      postCount: data.postCount || null,
      totalLikes: data.totalLikes || null,
      totalViews: data.totalViews || null,
      engagementRate: data.engagementRate?.toString() || null,
      snapshotDate: today,
      isRealData: 1,
    });

    console.log(`[HistoricalData] Saved follower snapshot for ${platform}:@${normalizedUsername}`);
  } catch (error) {
    console.error("[HistoricalData] Error saving follower snapshot:", error);
  }
}

/**
 * Get follower history for growth charts
 */
export async function getFollowerHistory(
  platform: "instagram" | "tiktok" | "youtube",
  username: string,
  days: number = 30
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const normalizedUsername = username.toLowerCase().replace("@", "").trim();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  try {
    const history = await db
      .select()
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.platform, platform),
          eq(followerSnapshots.username, normalizedUsername),
          gte(followerSnapshots.snapshotDate, fromDateStr)
        )
      )
      .orderBy(followerSnapshots.snapshotDate);

    return history;
  } catch (error) {
    console.error("[HistoricalData] Error getting follower history:", error);
    return [];
  }
}

// ==================== DATA COLLECTION QUEUE ====================

/**
 * Add profile to collection queue for automatic data collection
 */
export async function addToCollectionQueue(
  platform: "instagram" | "tiktok" | "youtube",
  identifier: string,
  frequency: "daily" | "weekly" | "monthly" = "daily"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const normalizedIdentifier = identifier.toLowerCase().replace("@", "").trim();

  try {
    // Check if already in queue
    const existing = await db
      .select()
      .from(dataCollectionQueue)
      .where(
        and(
          eq(dataCollectionQueue.platform, platform),
          eq(dataCollectionQueue.identifier, normalizedIdentifier)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Increment tracker count and update priority
      await db
        .update(dataCollectionQueue)
        .set({
          trackerCount: sql`${dataCollectionQueue.trackerCount} + 1`,
          priority: sql`${dataCollectionQueue.priority} + 1`,
          isActive: 1,
        })
        .where(eq(dataCollectionQueue.id, existing[0].id));
      return;
    }

    // Calculate next collection time
    const nextCollection = new Date();
    if (frequency === "weekly") {
      nextCollection.setDate(nextCollection.getDate() + 7);
    } else if (frequency === "monthly") {
      nextCollection.setMonth(nextCollection.getMonth() + 1);
    } else {
      nextCollection.setDate(nextCollection.getDate() + 1);
    }

    await db.insert(dataCollectionQueue).values({
      platform,
      identifier: normalizedIdentifier,
      priority: 1,
      frequency,
      nextCollectionAt: nextCollection,
      trackerCount: 1,
      isActive: 1,
    });

    console.log(`[HistoricalData] Added ${platform}:@${normalizedIdentifier} to collection queue`);
  } catch (error) {
    console.error("[HistoricalData] Error adding to collection queue:", error);
  }
}

/**
 * Get profiles due for data collection
 */
export async function getProfilesDueForCollection(
  limit: number = 50
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const profiles = await db
      .select()
      .from(dataCollectionQueue)
      .where(
        and(
          eq(dataCollectionQueue.isActive, 1),
          lte(dataCollectionQueue.nextCollectionAt, new Date())
        )
      )
      .orderBy(desc(dataCollectionQueue.priority))
      .limit(limit);

    return profiles;
  } catch (error) {
    console.error("[HistoricalData] Error getting profiles for collection:", error);
    return [];
  }
}

/**
 * Mark profile as collected and schedule next collection
 */
export async function markProfileCollected(
  id: number,
  apiCallsSaved: number = 0
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const profile = await db
      .select()
      .from(dataCollectionQueue)
      .where(eq(dataCollectionQueue.id, id))
      .limit(1);

    if (profile.length === 0) return;

    const nextCollection = new Date();
    if (profile[0].frequency === "weekly") {
      nextCollection.setDate(nextCollection.getDate() + 7);
    } else if (profile[0].frequency === "monthly") {
      nextCollection.setMonth(nextCollection.getMonth() + 1);
    } else {
      nextCollection.setDate(nextCollection.getDate() + 1);
    }

    await db
      .update(dataCollectionQueue)
      .set({
        lastCollectedAt: new Date(),
        nextCollectionAt: nextCollection,
        apiCallsSaved: sql`${dataCollectionQueue.apiCallsSaved} + ${apiCallsSaved}`,
      })
      .where(eq(dataCollectionQueue.id, id));
  } catch (error) {
    console.error("[HistoricalData] Error marking profile collected:", error);
  }
}

// ==================== CACHE STATISTICS ====================

/**
 * Update cache statistics
 */
async function updateCacheStatistics(
  platform: string,
  isHit: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const today = getTodayDate();

  try {
    const existing = await db
      .select()
      .from(cacheStatistics)
      .where(
        and(
          eq(cacheStatistics.date, today),
          eq(cacheStatistics.platform, platform)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cacheStatistics)
        .set({
          totalRequests: sql`${cacheStatistics.totalRequests} + 1`,
          cacheHits: isHit
            ? sql`${cacheStatistics.cacheHits} + 1`
            : sql`${cacheStatistics.cacheHits}`,
          cacheMisses: !isHit
            ? sql`${cacheStatistics.cacheMisses} + 1`
            : sql`${cacheStatistics.cacheMisses}`,
          costSaved: isHit
            ? sql`${cacheStatistics.costSaved} + ${API_COSTS.instagram_profile}`
            : sql`${cacheStatistics.costSaved}`,
          actualCost: !isHit
            ? sql`${cacheStatistics.actualCost} + ${API_COSTS.instagram_profile}`
            : sql`${cacheStatistics.actualCost}`,
        })
        .where(eq(cacheStatistics.id, existing[0].id));
    } else {
      await db.insert(cacheStatistics).values({
        date: today,
        platform,
        totalRequests: 1,
        cacheHits: isHit ? 1 : 0,
        cacheMisses: isHit ? 0 : 1,
        costSaved: isHit ? API_COSTS.instagram_profile : 0,
        actualCost: isHit ? 0 : API_COSTS.instagram_profile,
      });
    }
  } catch (error) {
    console.error("[HistoricalData] Error updating cache statistics:", error);
  }
}

/**
 * Get cache statistics summary
 */
export async function getCacheStatisticsSummary(
  days: number = 30
): Promise<{
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalCostSaved: number;
  totalActualCost: number;
  byPlatform: Record<string, any>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalCostSaved: 0,
      totalActualCost: 0,
      byPlatform: {},
    };
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  try {
    const stats = await db
      .select()
      .from(cacheStatistics)
      .where(gte(cacheStatistics.date, fromDateStr));

    const summary = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalCostSaved: 0,
      totalActualCost: 0,
      byPlatform: {} as Record<string, any>,
    };

    for (const stat of stats) {
      summary.totalRequests += stat.totalRequests;
      summary.cacheHits += stat.cacheHits;
      summary.cacheMisses += stat.cacheMisses;
      summary.totalCostSaved += stat.costSaved;
      summary.totalActualCost += stat.actualCost;

      if (!summary.byPlatform[stat.platform]) {
        summary.byPlatform[stat.platform] = {
          requests: 0,
          hits: 0,
          misses: 0,
          costSaved: 0,
        };
      }
      summary.byPlatform[stat.platform].requests += stat.totalRequests;
      summary.byPlatform[stat.platform].hits += stat.cacheHits;
      summary.byPlatform[stat.platform].misses += stat.cacheMisses;
      summary.byPlatform[stat.platform].costSaved += stat.costSaved;
    }

    summary.hitRate =
      summary.totalRequests > 0
        ? (summary.cacheHits / summary.totalRequests) * 100
        : 0;

    return summary;
  } catch (error) {
    console.error("[HistoricalData] Error getting cache statistics:", error);
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalCostSaved: 0,
      totalActualCost: 0,
      byPlatform: {},
    };
  }
}

/**
 * Run daily data collection for queued profiles
 * Called by cron job
 */
export async function runDailyDataCollection(): Promise<{
  collected: number;
  errors: number;
  apiCallsSaved: number;
}> {
  console.log("[HistoricalData] Starting daily data collection...");
  
  const profiles = await getProfilesDueForCollection(50);
  let collected = 0;
  let errors = 0;
  let apiCallsSaved = 0;

  for (const profile of profiles) {
    try {
      // Import the Instagram service dynamically to avoid circular deps
      const { getInstagramProfile } = await import("./instagramStatisticsApi");
      
      if (profile.platform === "instagram") {
        const result = await getInstagramProfile(profile.identifier);
        if (result) {
          // Save the snapshot
          await saveInstagramProfileSnapshot(
            profile.identifier,
            result.profile,
            {
              followerCount: result.profile.followersCount || 0,
              followingCount: result.profile.followingCount,
              postCount: result.profile.mediaCount,
            },
            "api"
          );
          collected++;
          apiCallsSaved += profile.trackerCount - 1; // Save calls for other users tracking same profile
        }
      }
      
      await markProfileCollected(profile.id, apiCallsSaved);
    } catch (error) {
      console.error(`[HistoricalData] Error collecting ${profile.platform}:${profile.identifier}:`, error);
      errors++;
    }
  }

  console.log(`[HistoricalData] Daily collection complete: ${collected} collected, ${errors} errors, ${apiCallsSaved} API calls saved`);
  
  return { collected, errors, apiCallsSaved };
}


/**
 * Get cache statistics history for charts
 */
export async function getCacheStatisticsHistory(
  days: number = 30
): Promise<{
  dates: string[];
  hits: number[];
  misses: number[];
  hitRates: number[];
  costSaved: number[];
  actualCost: number[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      dates: [],
      hits: [],
      misses: [],
      hitRates: [],
      costSaved: [],
      actualCost: [],
    };
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  try {
    const stats = await db
      .select()
      .from(cacheStatistics)
      .where(gte(cacheStatistics.date, fromDateStr))
      .orderBy(cacheStatistics.date);

    // Group by date
    const byDate = new Map<string, { hits: number; misses: number; costSaved: number; actualCost: number }>();
    
    for (const stat of stats) {
      const existing = byDate.get(stat.date) || { hits: 0, misses: 0, costSaved: 0, actualCost: 0 };
      existing.hits += stat.cacheHits;
      existing.misses += stat.cacheMisses;
      existing.costSaved += stat.costSaved;
      existing.actualCost += stat.actualCost;
      byDate.set(stat.date, existing);
    }

    const result = {
      dates: [] as string[],
      hits: [] as number[],
      misses: [] as number[],
      hitRates: [] as number[],
      costSaved: [] as number[],
      actualCost: [] as number[],
    };

    // Fill in all dates in range
    const currentDate = new Date(fromDateStr);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const data = byDate.get(dateStr) || { hits: 0, misses: 0, costSaved: 0, actualCost: 0 };
      
      result.dates.push(dateStr);
      result.hits.push(data.hits);
      result.misses.push(data.misses);
      result.hitRates.push(
        data.hits + data.misses > 0
          ? Math.round((data.hits / (data.hits + data.misses)) * 100)
          : 0
      );
      result.costSaved.push(data.costSaved);
      result.actualCost.push(data.actualCost);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error("[HistoricalData] Error getting cache history:", error);
    return {
      dates: [],
      hits: [],
      misses: [],
      hitRates: [],
      costSaved: [],
      actualCost: [],
    };
  }
}

/**
 * Check cache health and send alert if hit rate is too low
 */
export async function checkCacheHealthAndAlert(
  minHitRate: number = 50
): Promise<{
  healthy: boolean;
  currentHitRate: number;
  alertSent: boolean;
  message: string;
}> {
  const stats = await getCacheStatisticsSummary(7); // Last 7 days
  
  const healthy = stats.hitRate >= minHitRate;
  let alertSent = false;
  let message = "";

  if (!healthy && stats.totalRequests > 10) {
    // Send alert via webhook
    try {
      const { sendWebhookAlert } = await import("./webhookService");
      await sendWebhookAlert({
        type: "suspicious_activity",
        title: "⚠️ Cache Hit Rate Alert",
        message: `Die Cache-Trefferquote ist auf ${stats.hitRate.toFixed(1)}% gefallen (unter ${minHitRate}% Schwellenwert).\n\n` +
          `📊 Letzte 7 Tage:\n` +
          `• Anfragen: ${stats.totalRequests}\n` +
          `• Cache Hits: ${stats.cacheHits}\n` +
          `• Cache Misses: ${stats.cacheMisses}\n` +
          `• Gesparte Kosten: €${(stats.totalCostSaved / 100).toFixed(2)}\n` +
          `• Tatsächliche Kosten: €${(stats.totalActualCost / 100).toFixed(2)}`,
        severity: stats.hitRate < 30 ? "critical" : "warning",
      });
      alertSent = true;
      message = `Alert gesendet: Cache-Hit-Rate (${stats.hitRate.toFixed(1)}%) unter Schwellenwert (${minHitRate}%)`;
    } catch (error) {
      console.error("[HistoricalData] Error sending cache alert:", error);
      message = `Cache ungesund, aber Alert konnte nicht gesendet werden: ${error}`;
    }
  } else if (stats.totalRequests <= 10) {
    message = "Nicht genügend Daten für Bewertung (weniger als 10 Anfragen)";
  } else {
    message = `Cache ist gesund: ${stats.hitRate.toFixed(1)}% Trefferquote`;
  }

  return {
    healthy,
    currentHitRate: stats.hitRate,
    alertSent,
    message,
  };
}
