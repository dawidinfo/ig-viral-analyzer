/**
 * Instagram Scraper API by JoTucker
 * RapidAPI: https://rapidapi.com/JoTucker/api/instagram-scraper2
 * 
 * Endpoints:
 * - /user_info?user_name=xxx - Get profile data (returns data.user structure)
 * - /medias?user_id=xxx&batch_size=30 - Get posts (requires user_id)
 * - /user_reels?user_id=xxx - Get reels (requires user_id)
 */

import axios from "axios";

const RAPIDAPI_HOST = "instagram-scraper2.p.rapidapi.com";

function getApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }
  return key;
}

export interface JoTuckerProfile {
  username: string;
  full_name: string;
  biography: string;
  profile_pic_url: string;
  profile_pic_url_hd?: string;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_verified: boolean;
  is_private: boolean;
  is_business_account?: boolean;
  external_url?: string;
  category?: string;
  user_id: string;
}

export interface JoTuckerMedia {
  id: string;
  shortcode: string;
  caption?: string;
  like_count: number;
  comment_count: number;
  view_count?: number;
  play_count?: number;
  is_video: boolean;
  taken_at: number;
  display_url: string;
  video_url?: string;
  thumbnail_src?: string;
}

export interface JoTuckerReel {
  id: string;
  shortcode: string;
  caption?: string;
  like_count: number;
  comment_count: number;
  play_count: number;
  view_count?: number;
  taken_at: number;
  display_url: string;
  video_url: string;
  video_duration?: number;
}

/**
 * Get user profile info
 * Response format: { data: { user: { ... } } }
 */
export async function getUserInfo(username: string): Promise<JoTuckerProfile | null> {
  try {
    console.log(`[JoTucker] Fetching profile for @${username}`);
    
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/user_info`,
      {
        params: { user_name: username },
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": getApiKey(),
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    
    if (!data || !data.data || !data.data.user) {
      console.error("[JoTucker] Failed to fetch profile: Invalid response structure");
      return null;
    }

    const user = data.data.user;
    
    console.log(`[JoTucker] Profile fetched successfully for @${username} (id: ${user.id})`);
    
    // Extract follower/following counts from edge_followed_by/edge_follow structure
    const followerCount = user.edge_followed_by?.count || user.follower_count || 0;
    const followingCount = user.edge_follow?.count || user.following_count || 0;
    const mediaCount = user.edge_owner_to_timeline_media?.count || user.media_count || 0;
    
    return {
      username: user.username || username,
      full_name: user.full_name || "",
      biography: user.biography || "",
      profile_pic_url: user.profile_pic_url || "",
      profile_pic_url_hd: user.profile_pic_url_hd,
      follower_count: followerCount,
      following_count: followingCount,
      media_count: mediaCount,
      is_verified: user.is_verified || false,
      is_private: user.is_private || false,
      is_business_account: user.is_business_account || false,
      external_url: user.external_url || user.bio_links?.[0]?.url,
      category: user.category_name || user.overall_category_name,
      user_id: String(user.id || user.pk || ""),
    };
  } catch (error: any) {
    console.error(`[JoTucker] Error fetching profile:`, error.message);
    if (error.response?.status === 429) {
      console.error("[JoTucker] Rate limit exceeded");
    }
    if (error.response?.status === 404) {
      console.error("[JoTucker] Endpoint not found - check API subscription");
    }
    return null;
  }
}

/**
 * Get user medias (posts) - requires user_id
 */
export async function getMedias(userId: string, batchSize: number = 12): Promise<JoTuckerMedia[]> {
  if (!userId) {
    console.error("[JoTucker] Cannot fetch medias without user_id");
    return [];
  }
  
  try {
    console.log(`[JoTucker] Fetching posts for user_id=${userId}`);
    
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/medias`,
      {
        params: { 
          user_id: userId,
          batch_size: batchSize.toString()
        },
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": getApiKey(),
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    
    if (!data) {
      console.error("[JoTucker] Failed to fetch posts: Empty response");
      return [];
    }

    // Handle different response structures
    let medias: any[] = [];
    if (data.data?.user?.edge_owner_to_timeline_media?.edges) {
      medias = data.data.user.edge_owner_to_timeline_media.edges.map((e: any) => e.node);
    } else if (data.data?.medias) {
      medias = data.data.medias;
    } else if (data.collector) {
      medias = data.collector;
    } else if (Array.isArray(data.data)) {
      medias = data.data;
    } else if (Array.isArray(data)) {
      medias = data;
    }
    
    if (!Array.isArray(medias)) {
      console.error("[JoTucker] Unexpected medias format");
      return [];
    }

    console.log(`[JoTucker] Fetched ${medias.length} posts`);
    
    return medias.slice(0, batchSize).map((media: any) => ({
      id: String(media.id || media.pk),
      shortcode: media.shortcode || media.code,
      caption: media.edge_media_to_caption?.edges?.[0]?.node?.text || media.caption?.text || media.caption || "",
      like_count: media.edge_liked_by?.count || media.like_count || 0,
      comment_count: media.edge_media_to_comment?.count || media.comment_count || 0,
      view_count: media.video_view_count || media.view_count,
      play_count: media.video_play_count || media.play_count,
      is_video: media.is_video || media.__typename === "GraphVideo" || false,
      taken_at: media.taken_at_timestamp || media.taken_at || Math.floor(Date.now() / 1000),
      display_url: media.display_url || media.thumbnail_src || media.image_versions2?.candidates?.[0]?.url || "",
      video_url: media.video_url,
      thumbnail_src: media.thumbnail_src || media.display_url,
    }));
  } catch (error: any) {
    console.error(`[JoTucker] Error fetching posts:`, error.message);
    return [];
  }
}

/**
 * Get user reels - requires user_id
 */
export async function getUserReels(userId: string, count: number = 12): Promise<JoTuckerReel[]> {
  if (!userId) {
    console.error("[JoTucker] Cannot fetch reels without user_id");
    return [];
  }
  
  try {
    console.log(`[JoTucker] Fetching reels for user_id=${userId}`);
    
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/user_reels`,
      {
        params: { 
          user_id: userId,
        },
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": getApiKey(),
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    
    if (!data) {
      console.error("[JoTucker] Failed to fetch reels: Empty response");
      return [];
    }

    // Handle different response structures
    let reels: any[] = [];
    if (data.data?.items) {
      reels = data.data.items;
    } else if (data.items) {
      reels = data.items;
    } else if (data.data?.reels) {
      reels = data.data.reels;
    } else if (data.collector) {
      reels = data.collector;
    } else if (Array.isArray(data.data)) {
      reels = data.data;
    } else if (Array.isArray(data)) {
      reels = data;
    }
    
    if (!Array.isArray(reels)) {
      console.error("[JoTucker] Unexpected reels format");
      return [];
    }

    console.log(`[JoTucker] Fetched ${reels.length} reels`);
    
    return reels.slice(0, count).map((reel: any) => ({
      id: String(reel.id || reel.pk || reel.media?.id),
      shortcode: reel.code || reel.shortcode || reel.media?.code,
      caption: reel.caption?.text || reel.edge_media_to_caption?.edges?.[0]?.node?.text || reel.caption || "",
      like_count: reel.like_count || reel.edge_liked_by?.count || reel.media?.like_count || 0,
      comment_count: reel.comment_count || reel.edge_media_to_comment?.count || reel.media?.comment_count || 0,
      play_count: reel.play_count || reel.video_play_count || reel.media?.play_count || reel.view_count || 0,
      view_count: reel.view_count || reel.video_view_count || reel.media?.view_count,
      taken_at: reel.taken_at || reel.taken_at_timestamp || reel.media?.taken_at || Math.floor(Date.now() / 1000),
      display_url: reel.image_versions2?.candidates?.[0]?.url || reel.display_url || reel.thumbnail_src || reel.media?.image_versions2?.candidates?.[0]?.url || "",
      video_url: reel.video_url || reel.video_versions?.[0]?.url || reel.media?.video_url || "",
      video_duration: reel.video_duration || reel.media?.video_duration,
    }));
  } catch (error: any) {
    console.error(`[JoTucker] Error fetching reels:`, error.message);
    return [];
  }
}

/**
 * Analyze Instagram profile with all data
 * First fetches profile to get user_id, then fetches posts and reels in parallel
 */
export async function analyzeInstagramProfile(username: string): Promise<{
  profile: JoTuckerProfile | null;
  posts: JoTuckerMedia[];
  reels: JoTuckerReel[];
}> {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // First, get profile to obtain user_id
  const profile = await getUserInfo(cleanUsername);
  
  if (!profile || !profile.user_id) {
    console.log(`[JoTucker] Could not get user_id for @${cleanUsername}`);
    return { profile, posts: [], reels: [] };
  }
  
  console.log(`[JoTucker] Got user_id=${profile.user_id} for @${cleanUsername}`);
  
  // Fetch posts and reels in parallel using user_id
  const [posts, reels] = await Promise.all([
    getMedias(profile.user_id, 12),
    getUserReels(profile.user_id, 12),
  ]);

  return { profile, posts, reels };
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    // Try to fetch a known public profile
    const profile = await getUserInfo("instagram");
    return profile !== null && !!profile.user_id;
  } catch {
    return false;
  }
}

export default {
  getUserInfo,
  getMedias,
  getUserReels,
  analyzeInstagramProfile,
  checkApiHealth,
};
