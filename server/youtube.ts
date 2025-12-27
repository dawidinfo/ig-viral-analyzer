import { callDataApi } from "./_core/dataApi";
import { getDb } from "./db";
import { youtubeCache } from "../drizzle/schema";
import { storeFollowerSnapshot } from "./followerHistory";
import { eq } from "drizzle-orm";

/**
 * YouTube API Service
 * Provides YouTube channel and video analysis functionality
 * Uses Manus Data API for real data with demo fallback
 */

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface YouTubeChannel {
  channelId: string;
  title: string;
  customUrl: string;
  handle: string;
  description: string;
  country: string;
  joinedDate: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  subscriberText: string;
  videoCount: number;
  viewCount: number;
  badges: string[];
  keywords: string[];
  links: { title: string; url: string }[];
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedTime: string;
  duration: number;
  durationText: string;
  thumbnailUrl: string;
  viewCount: number;
  viewCountText: string;
  likeCount: number;
  commentCount: number;
  isLive: boolean;
  isShort: boolean;
  badges: string[];
}

export interface YouTubeAnalysis {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  shorts: YouTubeVideo[];
  analytics: {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    viralScore: number;
    bestPerformingVideo: YouTubeVideo | null;
    worstPerformingVideo: YouTubeVideo | null;
    topKeywords: string[];
    uploadFrequency: string;
    shortsPerformance: {
      avgViews: number;
      count: number;
    };
  };
}

/**
 * Fetch YouTube channel details
 */
export async function fetchYouTubeChannel(channelIdOrUrl: string): Promise<YouTubeChannel | null> {
  try {
    const result = await callDataApi("Youtube/get_channel_details", {
      query: { 
        id: channelIdOrUrl,
        hl: "de"
      }
    }) as any;

    if (!result || !result.channelId) {
      console.error("[YouTube] Channel not found:", channelIdOrUrl);
      return null;
    }

    const stats = result.stats || {};
    const avatars = result.avatar || [];
    const banners = result.banner || [];

    return {
      channelId: result.channelId || "",
      title: result.title || "",
      customUrl: result.customUrl || "",
      handle: result.handle || "",
      description: result.description || "",
      country: result.country || "",
      joinedDate: result.joinedDate || "",
      avatarUrl: avatars[avatars.length - 1]?.url || avatars[0]?.url || "",
      bannerUrl: banners[0]?.url || "",
      subscriberCount: stats.subscribers || 0,
      subscriberText: stats.subscribersText || "",
      videoCount: stats.videos || 0,
      viewCount: stats.views || 0,
      badges: result.badges || [],
      keywords: result.keywords || [],
      links: (result.links || []).map((link: any) => ({
        title: link.title || "",
        url: link.url || "",
      })),
    };
  } catch (error) {
    console.error("[YouTube] Error fetching channel:", error);
    return null;
  }
}

/**
 * Fetch YouTube channel videos
 */
export async function fetchYouTubeVideos(
  channelId: string, 
  filterType: "videos_latest" | "shorts_latest" | "streams_latest" = "videos_latest",
  count: number = 20
): Promise<YouTubeVideo[]> {
  try {
    const result = await callDataApi("Youtube/get_channel_videos", {
      query: { 
        id: channelId,
        filter: filterType,
        hl: "de",
        gl: "DE"
      }
    }) as any;

    if (!result || !result.contents) {
      console.error("[YouTube] No videos found");
      return [];
    }

    return result.contents
      .filter((item: any) => item.type === "video")
      .slice(0, count)
      .map((item: any) => {
        const video = item.video || {};
        const stats = video.stats || {};
        const thumbnails = video.thumbnails || [];

        return {
          videoId: video.videoId || "",
          title: video.title || "",
          description: video.descriptionSnippet || "",
          publishedTime: video.publishedTimeText || "",
          duration: video.lengthSeconds || 0,
          durationText: video.lengthText || "",
          thumbnailUrl: thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || "",
          viewCount: stats.views || 0,
          viewCountText: video.viewCountText || "",
          likeCount: stats.likes || 0,
          commentCount: stats.comments || 0,
          isLive: video.isLiveNow || false,
          isShort: filterType === "shorts_latest",
          badges: video.badges || [],
        };
      });
  } catch (error) {
    console.error("[YouTube] Error fetching videos:", error);
    return [];
  }
}

/**
 * Calculate analytics from channel and videos
 */
function calculateAnalytics(
  channel: YouTubeChannel, 
  videos: YouTubeVideo[],
  shorts: YouTubeVideo[]
): YouTubeAnalysis["analytics"] {
  if (videos.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      engagementRate: 0,
      viralScore: 0,
      bestPerformingVideo: null,
      worstPerformingVideo: null,
      topKeywords: [],
      uploadFrequency: "Unbekannt",
      shortsPerformance: { avgViews: 0, count: 0 },
    };
  }

  // Calculate averages for regular videos
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);

  const avgViews = Math.round(totalViews / videos.length);
  const avgLikes = Math.round(totalLikes / videos.length);
  const avgComments = Math.round(totalComments / videos.length);

  // Calculate engagement rate
  const engagementRate = channel.subscriberCount > 0
    ? ((avgLikes + avgComments) / channel.subscriberCount) * 100
    : 0;

  // Calculate viral score (0-100)
  const viewsToSubRatio = channel.subscriberCount > 0 
    ? avgViews / channel.subscriberCount 
    : 0;
  const viralScore = Math.min(100, Math.round(
    (viewsToSubRatio * 25) + 
    (engagementRate * 8) + 
    (Math.log10(avgViews + 1) * 4) +
    (channel.badges.includes("Verified") ? 10 : 0)
  ));

  // Find best and worst performing videos
  const sortedByViews = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const bestPerformingVideo = sortedByViews[0] || null;
  const worstPerformingVideo = sortedByViews[sortedByViews.length - 1] || null;

  // Calculate shorts performance
  const shortsAvgViews = shorts.length > 0
    ? Math.round(shorts.reduce((sum, s) => sum + s.viewCount, 0) / shorts.length)
    : 0;

  // Determine upload frequency
  let uploadFrequency = "Unbekannt";
  if (channel.videoCount > 0) {
    // Rough estimate based on video count and channel age
    if (channel.videoCount >= 1000) uploadFrequency = "Sehr aktiv (täglich)";
    else if (channel.videoCount >= 500) uploadFrequency = "Aktiv (mehrmals pro Woche)";
    else if (channel.videoCount >= 100) uploadFrequency = "Regelmäßig (wöchentlich)";
    else if (channel.videoCount >= 50) uploadFrequency = "Gelegentlich (monatlich)";
    else uploadFrequency = "Selten";
  }

  return {
    avgViews,
    avgLikes,
    avgComments,
    engagementRate: Math.round(engagementRate * 100) / 100,
    viralScore,
    bestPerformingVideo,
    worstPerformingVideo,
    topKeywords: channel.keywords.slice(0, 10),
    uploadFrequency,
    shortsPerformance: {
      avgViews: shortsAvgViews,
      count: shorts.length,
    },
  };
}

/**
 * Get cached YouTube analysis
 */
async function getCachedAnalysis(channelId: string): Promise<YouTubeAnalysis | null> {
  const cleanId = channelId.toLowerCase().trim();
  
  try {
    const db = await getDb();
    if (!db) return null;
    
    const cached = await db
      .select()
      .from(youtubeCache)
      .where(eq(youtubeCache.channelId, cleanId))
      .limit(1);
    
    if (cached.length > 0 && cached[0].expiresAt > new Date()) {
      console.log(`[YouTube Cache] Hit for ${cleanId}`);
      return cached[0].analysisData as YouTubeAnalysis;
    }
    
    console.log(`[YouTube Cache] Miss for ${cleanId}`);
    return null;
  } catch (error) {
    console.error("[YouTube Cache] Error reading cache:", error);
    return null;
  }
}

/**
 * Set cached YouTube analysis
 */
async function setCachedAnalysis(channelId: string, analysis: YouTubeAnalysis): Promise<void> {
  const cleanId = channelId.toLowerCase().trim();
  const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);
  
  try {
    const db = await getDb();
    if (!db) return;
    
    // Check if entry exists
    const existing = await db
      .select()
      .from(youtubeCache)
      .where(eq(youtubeCache.channelId, cleanId))
      .limit(1);
    
    if (existing.length > 0) {
      await db
        .update(youtubeCache)
        .set({
          analysisData: analysis,
          expiresAt,
        })
        .where(eq(youtubeCache.channelId, cleanId));
    } else {
      await db.insert(youtubeCache).values({
        channelId: cleanId,
        analysisData: analysis,
        expiresAt,
      });
    }
    
    console.log(`[YouTube Cache] Stored for ${cleanId}`);
  } catch (error) {
    console.error("[YouTube Cache] Error storing cache:", error);
  }
}

/**
 * Generate demo YouTube channel based on identifier
 */
function generateDemoYouTubeChannel(identifier: string): YouTubeChannel {
  const cleanId = identifier.replace("@", "").toLowerCase().trim();
  const seed = cleanId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number = 0) => {
    const val = ((seed + offset) % 100) / 100;
    return Math.floor(min + val * (max - min));
  };

  const isLargeChannel = cleanId.length < 10;
  const subMultiplier = isLargeChannel ? 1000000 : 100000;
  const subscriberCount = random(1, 50, 1) * subMultiplier;

  return {
    channelId: `demo_${seed}`,
    title: cleanId.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    customUrl: `@${cleanId}`,
    handle: `@${cleanId}`,
    description: `Willkommen auf meinem Kanal! 🌟\n🎬 Videos über Content Creation & Social Media\n🔔 Abonniere für mehr Content`,
    country: "DE",
    joinedDate: "2020",
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanId)}&size=200&background=FF0000&color=fff&bold=true`,
    bannerUrl: `https://picsum.photos/seed/${cleanId}banner/2560/1440`,
    subscriberCount,
    subscriberText: subscriberCount >= 1000000 ? `${(subscriberCount / 1000000).toFixed(1)}M` : `${Math.round(subscriberCount / 1000)}K`,
    videoCount: random(50, 500, 2),
    viewCount: subscriberCount * random(50, 200, 3),
    badges: isLargeChannel ? ["Verified"] : [],
    keywords: ["content", "creator", "youtube", "viral", "tutorial"],
    links: [{ title: "Instagram", url: `https://instagram.com/${cleanId}` }],
  };
}

/**
 * Generate demo YouTube videos based on channel
 */
function generateDemoYouTubeVideos(channel: YouTubeChannel, count: number, isShort: boolean = false): YouTubeVideo[] {
  const seed = channel.channelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number = 0) => {
    const val = ((seed + offset) % 100) / 100;
    return Math.floor(min + val * (max - min));
  };

  const avgViews = Math.round(channel.subscriberCount * 0.1);

  const titles = isShort ? [
    "Wait for it... 🔥 #shorts",
    "POV: When it hits different #shorts",
    "This hack changed everything #shorts",
    "You won't believe this! #shorts",
  ] : [
    "Das MUSST du wissen! (Komplette Anleitung)",
    "Ich habe 30 Tage lang getestet...",
    "Die Wahrheit über Social Media Erfolg",
    "So verdienst du online Geld (Ehrlich)",
    "Meine Top 10 Tipps für Anfänger",
  ];

  return Array.from({ length: count }, (_, i) => ({
    videoId: `demo_video_${isShort ? 'short_' : ''}${i}_${seed}`,
    title: titles[i % titles.length],
    description: "In diesem Video zeige ich dir...",
    publishedTime: `vor ${random(1, 30, 10 + i)} Tagen`,
    duration: isShort ? random(15, 60, 20 + i) : random(300, 1200, 20 + i),
    durationText: isShort ? `0:${random(15, 59, 20 + i)}` : `${random(5, 20, 20 + i)}:${random(10, 59, 30 + i).toString().padStart(2, '0')}`,
    thumbnailUrl: `https://picsum.photos/seed/${channel.channelId}${i}/1280/720`,
    viewCount: random(avgViews * 0.3, avgViews * 2, 40 + i),
    viewCountText: "",
    likeCount: random(avgViews * 0.03, avgViews * 0.1, 50 + i),
    commentCount: random(avgViews * 0.005, avgViews * 0.02, 60 + i),
    isLive: false,
    isShort,
    badges: [],
  }));
}

/**
 * Analyze YouTube channel with retry logic and demo fallback
 */
export async function analyzeYouTubeChannel(channelIdOrUrl: string): Promise<YouTubeAnalysis & { isDemo?: boolean }> {
  const cleanId = channelIdOrUrl.toLowerCase().trim();
  
  // Check cache first
  const cached = await getCachedAnalysis(cleanId);
  if (cached) {
    console.log(`[YouTube] Using cached data for ${cleanId}`);
    return cached;
  }

  // Try to fetch real data with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[YouTube] API attempt ${attempt}/${MAX_RETRIES} for ${cleanId}`);
      
      // Fetch channel
      const channel = await fetchYouTubeChannel(channelIdOrUrl);
      if (!channel) {
        throw new Error(`Channel not found`);
      }

      // Fetch videos and shorts
      const [videos, shorts] = await Promise.all([
        fetchYouTubeVideos(channel.channelId, "videos_latest", 20),
        fetchYouTubeVideos(channel.channelId, "shorts_latest", 10),
      ]);

      console.log(`[YouTube] API success: ${videos.length} videos, ${shorts.length} shorts`);

      // Calculate analytics
      const analytics = calculateAnalytics(channel, videos, shorts);

      const analysis: YouTubeAnalysis & { isDemo?: boolean } = {
        channel,
        videos,
        shorts,
        analytics,
        isDemo: false,
      };

      // Store follower snapshot for tracking history
      storeFollowerSnapshot('youtube', channel.handle || channel.customUrl || cleanId, {
        followerCount: channel.subscriberCount,
        postCount: channel.videoCount,
        totalViews: channel.viewCount,
        engagementRate: analytics.engagementRate,
      }, true).catch(err => console.error('[YouTube] Failed to store snapshot:', err.message));

      // Store in cache
      await setCachedAnalysis(cleanId, analysis);

      return analysis;
    } catch (error: any) {
      console.error(`[YouTube] API attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[YouTube] Retrying in ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }

  // All API attempts failed - use demo data
  console.log(`[YouTube] All API attempts failed, using demo data for ${cleanId}`);
  
  const demoChannel = generateDemoYouTubeChannel(cleanId);
  const demoVideos = generateDemoYouTubeVideos(demoChannel, 15, false);
  const demoShorts = generateDemoYouTubeVideos(demoChannel, 8, true);
  const analytics = calculateAnalytics(demoChannel, demoVideos, demoShorts);

  return {
    channel: demoChannel,
    videos: demoVideos,
    shorts: demoShorts,
    analytics,
    isDemo: true,
  };
}

/**
 * Search YouTube videos
 */
export async function searchYouTubeVideos(query: string, cursor?: string): Promise<{
  videos: YouTubeVideo[];
  channels: YouTubeChannel[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  try {
    const queryParams: any = { 
      q: query,
      hl: "de",
      gl: "DE"
    };
    if (cursor) queryParams.cursor = cursor;

    const result = await callDataApi("Youtube/search", {
      query: queryParams
    }) as any;

    if (!result || !result.contents) {
      return { videos: [], channels: [], hasMore: false };
    }

    const videos: YouTubeVideo[] = [];
    const channels: YouTubeChannel[] = [];

    for (const item of result.contents) {
      if (item.type === "video") {
        const video = item.video || {};
        videos.push({
          videoId: video.videoId || "",
          title: video.title || "",
          description: video.descriptionSnippet || "",
          publishedTime: video.publishedTimeText || "",
          duration: 0,
          durationText: video.lengthText || "",
          thumbnailUrl: video.thumbnails?.[0]?.url || "",
          viewCount: 0,
          viewCountText: video.viewCountText || "",
          likeCount: 0,
          commentCount: 0,
          isLive: video.isLiveNow || false,
          isShort: false,
          badges: video.badges || [],
        });
      } else if (item.type === "channel") {
        const ch = item.channel || {};
        channels.push({
          channelId: ch.channelId || "",
          title: ch.title || "",
          customUrl: "",
          handle: ch.handle || "",
          description: ch.descriptionSnippet || "",
          country: "",
          joinedDate: "",
          avatarUrl: ch.avatar?.[0]?.url || "",
          bannerUrl: "",
          subscriberCount: 0,
          subscriberText: ch.subscriberCountText || "",
          videoCount: 0,
          viewCount: 0,
          badges: ch.badges || [],
          keywords: [],
          links: [],
        });
      }
    }

    return {
      videos,
      channels,
      hasMore: !!result.cursorNext,
      nextCursor: result.cursorNext,
    };
  } catch (error) {
    console.error("[YouTube] Error searching:", error);
    return { videos: [], channels: [], hasMore: false };
  }
}
