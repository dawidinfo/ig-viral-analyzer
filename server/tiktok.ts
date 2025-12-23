import { callDataApi } from "./_core/dataApi";
import { getDb } from "./db";
import { tiktokCache } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * TikTok API Service
 * Provides TikTok profile and video analysis functionality
 */

// Cache duration: 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000;

export interface TikTokProfile {
  id: string;
  uniqueId: string;
  nickname: string;
  signature: string;
  avatarUrl: string;
  verified: boolean;
  privateAccount: boolean;
  secUid: string;
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
  diggCount: number;
}

export interface TikTokVideo {
  id: string;
  description: string;
  createTime: number;
  duration: number;
  coverUrl: string;
  playUrl: string;
  stats: {
    playCount: number;
    diggCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
  };
  music?: {
    id: string;
    title: string;
    authorName: string;
  };
  hashtags: string[];
}

export interface TikTokAnalysis {
  profile: TikTokProfile;
  videos: TikTokVideo[];
  analytics: {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    engagementRate: number;
    viralScore: number;
    bestPerformingVideo: TikTokVideo | null;
    worstPerformingVideo: TikTokVideo | null;
    topHashtags: { tag: string; count: number }[];
    postingFrequency: string;
  };
}

/**
 * Fetch TikTok user profile
 */
export async function fetchTikTokProfile(username: string): Promise<TikTokProfile | null> {
  const cleanUsername = username.replace("@", "").toLowerCase().trim();
  
  try {
    const result = await callDataApi("Tiktok/get_user_info", {
      query: { uniqueId: cleanUsername }
    }) as any;

    if (!result || !result.userInfo) {
      console.error("[TikTok] User not found:", cleanUsername);
      return null;
    }

    const user = result.userInfo.user || {};
    const stats = result.userInfo.stats || {};

    return {
      id: user.id || "",
      uniqueId: user.uniqueId || cleanUsername,
      nickname: user.nickname || "",
      signature: user.signature || "",
      avatarUrl: user.avatarMedium || user.avatarThumb || "",
      verified: user.verified || false,
      privateAccount: user.privateAccount || false,
      secUid: user.secUid || "",
      followerCount: stats.followerCount || 0,
      followingCount: stats.followingCount || 0,
      heartCount: stats.heartCount || 0,
      videoCount: stats.videoCount || 0,
      diggCount: stats.diggCount || 0,
    };
  } catch (error) {
    console.error("[TikTok] Error fetching profile:", error);
    return null;
  }
}

/**
 * Fetch TikTok user's popular videos
 */
export async function fetchTikTokVideos(secUid: string, count: number = 20): Promise<TikTokVideo[]> {
  try {
    const result = await callDataApi("Tiktok/get_user_popular_posts", {
      query: { 
        secUid: secUid,
        count: String(Math.min(count, 35)),
        cursor: "0"
      }
    }) as any;

    if (!result || !result.data || !result.data.itemList) {
      console.error("[TikTok] No videos found");
      return [];
    }

    return result.data.itemList.map((item: any) => ({
      id: item.id || "",
      description: item.desc || "",
      createTime: item.createTime || 0,
      duration: item.video?.duration || 0,
      coverUrl: item.video?.cover || item.video?.dynamicCover || "",
      playUrl: item.video?.playAddr || "",
      stats: {
        playCount: item.stats?.playCount || 0,
        diggCount: item.stats?.diggCount || 0,
        commentCount: item.stats?.commentCount || 0,
        shareCount: item.stats?.shareCount || 0,
        collectCount: item.stats?.collectCount || 0,
      },
      music: item.music ? {
        id: item.music.id || "",
        title: item.music.title || "",
        authorName: item.music.authorName || "",
      } : undefined,
      hashtags: extractHashtags(item.desc || ""),
    }));
  } catch (error) {
    console.error("[TikTok] Error fetching videos:", error);
    return [];
  }
}

/**
 * Extract hashtags from description
 */
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u00C0-\u024F]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
}

/**
 * Calculate analytics from videos
 */
function calculateAnalytics(profile: TikTokProfile, videos: TikTokVideo[]): TikTokAnalysis["analytics"] {
  if (videos.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      engagementRate: 0,
      viralScore: 0,
      bestPerformingVideo: null,
      worstPerformingVideo: null,
      topHashtags: [],
      postingFrequency: "Unbekannt",
    };
  }

  // Calculate averages
  const totalViews = videos.reduce((sum, v) => sum + v.stats.playCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.stats.diggCount, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.stats.commentCount, 0);
  const totalShares = videos.reduce((sum, v) => sum + v.stats.shareCount, 0);

  const avgViews = Math.round(totalViews / videos.length);
  const avgLikes = Math.round(totalLikes / videos.length);
  const avgComments = Math.round(totalComments / videos.length);
  const avgShares = Math.round(totalShares / videos.length);

  // Calculate engagement rate
  const engagementRate = profile.followerCount > 0
    ? ((avgLikes + avgComments + avgShares) / profile.followerCount) * 100
    : 0;

  // Calculate viral score (0-100)
  const viewsToFollowerRatio = profile.followerCount > 0 
    ? avgViews / profile.followerCount 
    : 0;
  const viralScore = Math.min(100, Math.round(
    (viewsToFollowerRatio * 30) + 
    (engagementRate * 5) + 
    (Math.log10(avgViews + 1) * 5)
  ));

  // Find best and worst performing videos
  const sortedByViews = [...videos].sort((a, b) => b.stats.playCount - a.stats.playCount);
  const bestPerformingVideo = sortedByViews[0] || null;
  const worstPerformingVideo = sortedByViews[sortedByViews.length - 1] || null;

  // Calculate top hashtags
  const hashtagCounts: Record<string, number> = {};
  videos.forEach(video => {
    video.hashtags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Calculate posting frequency
  let postingFrequency = "Unbekannt";
  if (videos.length >= 2) {
    const timestamps = videos.map(v => v.createTime).sort((a, b) => b - a);
    const daysBetween = (timestamps[0] - timestamps[timestamps.length - 1]) / (60 * 60 * 24);
    const postsPerDay = videos.length / Math.max(daysBetween, 1);
    
    if (postsPerDay >= 3) postingFrequency = "Sehr aktiv (3+ pro Tag)";
    else if (postsPerDay >= 1) postingFrequency = "Aktiv (1-3 pro Tag)";
    else if (postsPerDay >= 0.5) postingFrequency = "Regelmäßig (3-7 pro Woche)";
    else if (postsPerDay >= 0.14) postingFrequency = "Gelegentlich (1-2 pro Woche)";
    else postingFrequency = "Selten (weniger als 1 pro Woche)";
  }

  return {
    avgViews,
    avgLikes,
    avgComments,
    avgShares,
    engagementRate: Math.round(engagementRate * 100) / 100,
    viralScore,
    bestPerformingVideo,
    worstPerformingVideo,
    topHashtags,
    postingFrequency,
  };
}

/**
 * Get cached TikTok analysis
 */
async function getCachedAnalysis(username: string): Promise<TikTokAnalysis | null> {
  const cleanUsername = username.replace("@", "").toLowerCase().trim();
  
  try {
    const db = await getDb();
    if (!db) return null;
    
    const cached = await db
      .select()
      .from(tiktokCache)
      .where(eq(tiktokCache.username, cleanUsername))
      .limit(1);
    
    if (cached.length > 0 && cached[0].expiresAt > new Date()) {
      console.log(`[TikTok Cache] Hit for @${cleanUsername}`);
      return cached[0].analysisData as TikTokAnalysis;
    }
    
    console.log(`[TikTok Cache] Miss for @${cleanUsername}`);
    return null;
  } catch (error) {
    console.error("[TikTok Cache] Error reading cache:", error);
    return null;
  }
}

/**
 * Set cached TikTok analysis
 */
async function setCachedAnalysis(username: string, analysis: TikTokAnalysis): Promise<void> {
  const cleanUsername = username.replace("@", "").toLowerCase().trim();
  const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);
  
  try {
    const db = await getDb();
    if (!db) return;
    
    // Check if entry exists
    const existing = await db
      .select()
      .from(tiktokCache)
      .where(eq(tiktokCache.username, cleanUsername))
      .limit(1);
    
    if (existing.length > 0) {
      await db
        .update(tiktokCache)
        .set({
          analysisData: analysis,
          expiresAt,
        })
        .where(eq(tiktokCache.username, cleanUsername));
    } else {
      await db.insert(tiktokCache).values({
        username: cleanUsername,
        analysisData: analysis,
        expiresAt,
      });
    }
    
    console.log(`[TikTok Cache] Stored for @${cleanUsername}`);
  } catch (error) {
    console.error("[TikTok Cache] Error storing cache:", error);
  }
}

/**
 * Analyze TikTok account
 */
export async function analyzeTikTokAccount(username: string): Promise<TikTokAnalysis> {
  // Check cache first
  const cached = await getCachedAnalysis(username);
  if (cached) {
    return cached;
  }

  // Fetch profile
  const profile = await fetchTikTokProfile(username);
  if (!profile) {
    throw new Error(`TikTok Profil @${username} nicht gefunden`);
  }

  // Fetch videos using secUid
  const videos = await fetchTikTokVideos(profile.secUid, 30);

  // Calculate analytics
  const analytics = calculateAnalytics(profile, videos);

  const analysis: TikTokAnalysis = {
    profile,
    videos,
    analytics,
  };

  // Store in cache
  await setCachedAnalysis(username, analysis);

  return analysis;
}

/**
 * Search TikTok videos by keyword
 */
export async function searchTikTokVideos(keyword: string, cursor?: number): Promise<{
  videos: TikTokVideo[];
  hasMore: boolean;
  nextCursor?: number;
}> {
  try {
    const queryParams: any = { keyword };
    if (cursor) queryParams.cursor = cursor;

    const result = await callDataApi("Tiktok/search_tiktok_video_general", {
      query: queryParams
    }) as any;

    if (!result || !result.data) {
      return { videos: [], hasMore: false };
    }

    const videos = (result.data || []).map((item: any) => ({
      id: item.aweme_id || item.id || "",
      description: item.desc || "",
      createTime: item.create_time || 0,
      duration: item.video?.duration || 0,
      coverUrl: item.video?.cover?.url_list?.[0] || "",
      playUrl: item.video?.play_addr?.url_list?.[0] || "",
      stats: {
        playCount: item.statistics?.play_count || 0,
        diggCount: item.statistics?.digg_count || 0,
        commentCount: item.statistics?.comment_count || 0,
        shareCount: item.statistics?.share_count || 0,
        collectCount: item.statistics?.collect_count || 0,
      },
      hashtags: extractHashtags(item.desc || ""),
    }));

    return {
      videos,
      hasMore: result.has_more || false,
      nextCursor: result.cursor,
    };
  } catch (error) {
    console.error("[TikTok] Error searching videos:", error);
    return { videos: [], hasMore: false };
  }
}
