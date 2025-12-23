import axios, { AxiosError } from "axios";
import { callDataApi } from "./_core/dataApi";

const RAPIDAPI_HOST = "instagram-scraper-stable-api.p.rapidapi.com";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if error is retryable
function isRetryableError(error: any): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // Retry on rate limits (429), server errors (5xx), or network errors
    return status === 429 || (status && status >= 500) || !status;
  }
  return false;
}

interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isVerified: boolean;
  isBusinessAccount: boolean;
  externalUrl?: string;
}

interface InstagramPost {
  id: string;
  shortcode: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  playCount?: number;
  isVideo: boolean;
  timestamp: number;
  thumbnailUrl: string;
  videoUrl?: string;
}

interface InstagramReel {
  id: string;
  shortcode: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  playCount: number;
  viewCount: number;
  timestamp: number;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
}

export interface InstagramAnalysis {
  profile: InstagramProfile;
  posts: InstagramPost[];
  reels: InstagramReel[];
  metrics: {
    avgLikes: number;
    avgComments: number;
    avgViews: number;
    engagementRate: number;
    avgShares: number;
    avgSaves: number;
  };
  viralScore: number;
  viralFactors: {
    hook: number;
    emotion: number;
    shareability: number;
    replay: number;
    caption: number;
    hashtags: number;
  };
  isDemo: boolean;
}

function getApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }
  return key;
}

// Demo data generator based on username
function generateDemoData(username: string): InstagramAnalysis {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // Generate consistent "random" numbers based on username
  const seed = cleanUsername.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number = 0) => {
    const val = ((seed + offset) % 100) / 100;
    return Math.floor(min + val * (max - min));
  };

  // Determine account "size" based on username length and characters
  const isLargeAccount = cleanUsername.length < 8 || cleanUsername.includes("official");
  const isMediumAccount = cleanUsername.length < 12;
  
  const followerMultiplier = isLargeAccount ? 1000000 : isMediumAccount ? 100000 : 10000;
  const followerCount = random(1, 50, 1) * followerMultiplier;
  const followingCount = random(100, 2000, 2);
  const mediaCount = random(50, 2000, 3);
  
  // Generate engagement based on account size (smaller accounts have higher engagement rates)
  const baseEngagement = isLargeAccount ? 0.5 : isMediumAccount ? 2.5 : 5;
  const engagementVariance = random(50, 150, 4) / 100;
  const engagementRate = Number((baseEngagement * engagementVariance).toFixed(2));
  
  const avgLikes = Math.round(followerCount * engagementRate / 100);
  const avgComments = Math.round(avgLikes * random(2, 8, 5) / 100);
  const avgViews = Math.round(avgLikes * random(300, 800, 6) / 100);
  const avgShares = Math.round(avgLikes * random(5, 15, 7) / 100);
  const avgSaves = Math.round(avgLikes * random(8, 20, 8) / 100);

  // Generate viral factors
  const viralFactors = {
    hook: random(55, 95, 10),
    emotion: random(50, 90, 11),
    shareability: random(45, 85, 12),
    replay: random(50, 88, 13),
    caption: random(55, 92, 14),
    hashtags: random(60, 90, 15),
  };

  const viralScore = Math.round(
    viralFactors.hook * 0.25 +
    viralFactors.emotion * 0.20 +
    viralFactors.shareability * 0.20 +
    viralFactors.replay * 0.15 +
    viralFactors.caption * 0.10 +
    viralFactors.hashtags * 0.10
  );

  // Generate demo posts
  const posts: InstagramPost[] = Array.from({ length: 12 }, (_, i) => ({
    id: `demo_post_${i}_${seed}`,
    shortcode: `Demo${cleanUsername.substring(0, 4)}${i}`,
    caption: getDemoCaption(i, cleanUsername),
    likeCount: random(avgLikes * 0.5, avgLikes * 1.5, 20 + i),
    commentCount: random(avgComments * 0.5, avgComments * 1.5, 30 + i),
    viewCount: i % 3 === 0 ? random(avgViews * 0.5, avgViews * 1.5, 40 + i) : undefined,
    playCount: i % 3 === 0 ? random(avgViews * 0.5, avgViews * 1.5, 40 + i) : undefined,
    isVideo: i % 3 === 0,
    timestamp: Date.now() / 1000 - i * 86400 * random(1, 5, 50 + i),
    thumbnailUrl: `https://picsum.photos/seed/${cleanUsername}${i}/400/500`,
    videoUrl: i % 3 === 0 ? undefined : undefined,
  }));

  // Generate demo reels
  const reels: InstagramReel[] = Array.from({ length: 12 }, (_, i) => ({
    id: `demo_reel_${i}_${seed}`,
    shortcode: `DemoReel${cleanUsername.substring(0, 4)}${i}`,
    caption: getDemoReelCaption(i, cleanUsername),
    likeCount: random(avgLikes * 0.8, avgLikes * 2, 60 + i),
    commentCount: random(avgComments * 0.8, avgComments * 2, 70 + i),
    playCount: random(avgViews * 2, avgViews * 5, 80 + i),
    viewCount: random(avgViews * 2, avgViews * 5, 80 + i),
    timestamp: Date.now() / 1000 - i * 86400 * random(1, 3, 90 + i),
    thumbnailUrl: `https://picsum.photos/seed/${cleanUsername}reel${i}/400/700`,
    videoUrl: "",
    duration: random(15, 90, 100 + i),
  }));

  const profile: InstagramProfile = {
    username: cleanUsername,
    fullName: formatUsername(cleanUsername),
    biography: getDemoBio(cleanUsername),
    profilePicUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&size=200&background=8B5CF6&color=fff&bold=true`,
    followerCount,
    followingCount,
    mediaCount,
    isVerified: isLargeAccount || random(0, 100, 200) > 80,
    isBusinessAccount: random(0, 100, 201) > 40,
    externalUrl: random(0, 100, 202) > 50 ? `https://linktr.ee/${cleanUsername}` : undefined,
  };

  return {
    profile,
    posts,
    reels,
    metrics: {
      avgLikes,
      avgComments,
      avgViews,
      engagementRate,
      avgShares,
      avgSaves,
    },
    viralScore,
    viralFactors,
    isDemo: true,
  };
}

function formatUsername(username: string): string {
  return username
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDemoBio(username: string): string {
  const bios = [
    `✨ Content Creator | ${formatUsername(username)} 📸\n🌍 Sharing my journey with you\n📩 DM for collabs`,
    `🎯 ${formatUsername(username)} | Digital Creator\n💡 Tips & Inspiration daily\n🔗 Link in bio for more`,
    `👋 Hey, I'm ${formatUsername(username)}!\n📱 Social Media & Lifestyle\n💌 Business: ${username}@email.com`,
    `🚀 ${formatUsername(username)} | Entrepreneur\n📈 Building in public\n🎥 New content weekly`,
  ];
  const index = username.length % bios.length;
  return bios[index];
}

function getDemoCaption(index: number, username: string): string {
  const captions = [
    `New content alert! 🔥 What do you think?\n\n#${username} #contentcreator #viral #fyp`,
    `Living my best life ✨ Double tap if you agree!\n\n#lifestyle #motivation #${username}`,
    `This is what consistency looks like 💪\n\n#growth #success #nevergiveup`,
    `POV: You found your new favorite account 😏\n\n#trending #explore #${username}`,
    `Save this for later! 📌 You'll thank me\n\n#tips #tricks #mustsee`,
    `The algorithm brought you here for a reason 🎯\n\n#foryou #viral #trending`,
  ];
  return captions[index % captions.length];
}

function getDemoReelCaption(index: number, username: string): string {
  const captions = [
    `Wait for it... 👀🔥\n\n#reels #viral #trending #${username}`,
    `This took me 3 hours to make 😅 Worth it?\n\n#behindthescenes #creator`,
    `POV: When the content hits different 🎬\n\n#relatable #fyp #explore`,
    `Drop a 🔥 if you want more like this!\n\n#reelsinstagram #viralreels`,
    `The secret nobody talks about... 🤫\n\n#tips #secrets #mustwatch`,
    `This is your sign to start creating! ✨\n\n#motivation #justdoit`,
  ];
  return captions[index % captions.length];
}

/**
 * Fetch Instagram profile using RapidAPI with retry logic
 */
async function fetchProfileFromRapidAPI(cleanUsername: string): Promise<InstagramProfile | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Instagram] RapidAPI attempt ${attempt}/${MAX_RETRIES} for @${cleanUsername}`);
      
      const response = await axios.post(
        `https://${RAPIDAPI_HOST}/ig_get_fb_profile_v3.php`,
        new URLSearchParams({ username_or_url: cleanUsername }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": getApiKey(),
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to fetch profile");
      }

      console.log(`[Instagram] RapidAPI success for @${cleanUsername}`);
      return {
        username: data.username || cleanUsername,
        fullName: data.full_name || "",
        biography: data.biography || "",
        profilePicUrl: data.profile_pic_url_hd || data.hd_profile_pic_url_info?.url || data.profile_pic_url || "",
        followerCount: data.follower_count || 0,
        followingCount: data.following_count || 0,
        mediaCount: data.media_count || 0,
        isVerified: data.is_verified || false,
        isBusinessAccount: data.is_business || data.is_business_account || false,
        externalUrl: data.external_url || data.bio_links?.[0]?.url || undefined,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[Instagram] RapidAPI attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`[Instagram] Retrying in ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }
  
  console.error(`[Instagram] RapidAPI failed after ${MAX_RETRIES} attempts`);
  return null;
}

/**
 * Fetch Instagram profile using Manus Data API as fallback
 */
async function fetchProfileFromManusAPI(cleanUsername: string): Promise<InstagramProfile | null> {
  try {
    console.log(`[Instagram] Trying Manus Data API for @${cleanUsername}`);
    
    const result = await callDataApi("Instagram/get_user_info", {
      query: { username: cleanUsername }
    }) as any;

    if (!result || !result.user) {
      console.error("[Instagram] Manus API: User not found");
      return null;
    }

    const user = result.user;
    console.log(`[Instagram] Manus API success for @${cleanUsername}`);
    
    return {
      username: user.username || cleanUsername,
      fullName: user.full_name || "",
      biography: user.biography || "",
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
      followerCount: user.follower_count || user.edge_followed_by?.count || 0,
      followingCount: user.following_count || user.edge_follow?.count || 0,
      mediaCount: user.media_count || user.edge_owner_to_timeline_media?.count || 0,
      isVerified: user.is_verified || false,
      isBusinessAccount: user.is_business_account || user.is_professional_account || false,
      externalUrl: user.external_url || user.bio_links?.[0]?.url || undefined,
    };
  } catch (error: any) {
    console.error("[Instagram] Manus API failed:", error.message);
    return null;
  }
}

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile> {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // Try RapidAPI first with retries
  const rapidApiResult = await fetchProfileFromRapidAPI(cleanUsername);
  if (rapidApiResult) {
    return rapidApiResult;
  }
  
  // Try Manus Data API as fallback
  const manusApiResult = await fetchProfileFromManusAPI(cleanUsername);
  if (manusApiResult) {
    return manusApiResult;
  }
  
  // Both APIs failed
  throw new Error(`Failed to fetch profile for @${cleanUsername}: All API sources exhausted`);
}

/**
 * Fetch Instagram posts using RapidAPI with retry logic
 */
async function fetchPostsFromRapidAPI(cleanUsername: string, count: number): Promise<InstagramPost[] | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Instagram] Fetching posts via RapidAPI attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await axios.post(
        `https://${RAPIDAPI_HOST}/get_ig_user_posts.php`,
        new URLSearchParams({ username_or_url: cleanUsername }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": getApiKey(),
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to fetch posts");
      }

      const posts = data.posts || [];
      console.log(`[Instagram] RapidAPI returned ${posts.length} posts`);
      
      return posts.slice(0, count).map((item: any) => {
        const post = item.node || item;
        return {
          id: post.id || post.pk || "",
          shortcode: post.code || post.shortcode || "",
          caption: post.caption?.text || post.caption || "",
          likeCount: post.like_count || 0,
          commentCount: post.comment_count || 0,
          viewCount: post.view_count || post.play_count || undefined,
          playCount: post.play_count || undefined,
          isVideo: post.media_type === 2 || post.product_type === "clips" || !!post.video_versions,
          timestamp: post.taken_at || 0,
          thumbnailUrl: post.image_versions2?.candidates?.[0]?.url || post.display_uri || post.thumbnail_url || "",
          videoUrl: post.video_versions?.[0]?.url || undefined,
        };
      });
    } catch (error: any) {
      console.error(`[Instagram] Posts RapidAPI attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
  }
  return null;
}

/**
 * Fetch Instagram posts using Manus Data API as fallback
 */
async function fetchPostsFromManusAPI(cleanUsername: string, count: number): Promise<InstagramPost[] | null> {
  try {
    console.log(`[Instagram] Fetching posts via Manus API for @${cleanUsername}`);
    
    const result = await callDataApi("Instagram/get_user_posts", {
      query: { username: cleanUsername, count: String(count) }
    }) as any;

    if (!result || !result.edges) {
      // Try alternative response structure
      if (result?.data?.user?.edge_owner_to_timeline_media?.edges) {
        const edges = result.data.user.edge_owner_to_timeline_media.edges;
        return edges.slice(0, count).map((edge: any) => {
          const node = edge.node;
          return {
            id: node.id || "",
            shortcode: node.shortcode || "",
            caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
            likeCount: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
            commentCount: node.edge_media_to_comment?.count || 0,
            viewCount: node.video_view_count || undefined,
            playCount: node.video_view_count || undefined,
            isVideo: node.is_video || false,
            timestamp: node.taken_at_timestamp || 0,
            thumbnailUrl: node.display_url || node.thumbnail_src || "",
            videoUrl: node.video_url || undefined,
          };
        });
      }
      console.error("[Instagram] Manus API: No posts found");
      return null;
    }

    return result.edges.slice(0, count).map((edge: any) => {
      const node = edge.node || edge;
      return {
        id: node.id || "",
        shortcode: node.shortcode || "",
        caption: node.caption || node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
        likeCount: node.like_count || node.edge_liked_by?.count || 0,
        commentCount: node.comment_count || node.edge_media_to_comment?.count || 0,
        viewCount: node.view_count || node.video_view_count || undefined,
        playCount: node.play_count || node.video_view_count || undefined,
        isVideo: node.is_video || false,
        timestamp: node.taken_at || node.taken_at_timestamp || 0,
        thumbnailUrl: node.display_url || node.thumbnail_url || "",
        videoUrl: node.video_url || undefined,
      };
    });
  } catch (error: any) {
    console.error("[Instagram] Manus API posts failed:", error.message);
    return null;
  }
}

export async function fetchInstagramPosts(username: string, count: number = 12): Promise<InstagramPost[]> {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // Try RapidAPI first
  const rapidApiPosts = await fetchPostsFromRapidAPI(cleanUsername, count);
  if (rapidApiPosts && rapidApiPosts.length > 0) {
    return rapidApiPosts;
  }
  
  // Try Manus API as fallback
  const manusPosts = await fetchPostsFromManusAPI(cleanUsername, count);
  if (manusPosts && manusPosts.length > 0) {
    return manusPosts;
  }
  
  console.warn(`[Instagram] No posts found for @${cleanUsername} from any API`);
  return [];
}

/**
 * Fetch Instagram reels using RapidAPI with retry logic
 */
async function fetchReelsFromRapidAPI(cleanUsername: string, count: number): Promise<InstagramReel[] | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Instagram] Fetching reels via RapidAPI attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await axios.post(
        `https://${RAPIDAPI_HOST}/get_ig_user_reels.php`,
        new URLSearchParams({ username_or_url: cleanUsername }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": getApiKey(),
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to fetch reels");
      }

      const reels = data.reels || data.items || [];
      console.log(`[Instagram] RapidAPI returned ${reels.length} reels`);
      
      return reels.slice(0, count).map((item: any) => {
        const node = item.node || item;
        const media = node.media || node;
        
        return {
          id: media.id || media.pk || "",
          shortcode: media.code || media.shortcode || "",
          caption: media.caption?.text || media.caption || "",
          likeCount: media.like_count || 0,
          commentCount: media.comment_count || 0,
          playCount: media.play_count || media.view_count || 0,
          viewCount: media.view_count || media.play_count || 0,
          timestamp: media.taken_at || 0,
          thumbnailUrl: media.image_versions2?.candidates?.[0]?.url || media.display_uri || media.thumbnail_url || "",
          videoUrl: media.video_versions?.[0]?.url || "",
          duration: media.video_duration || 0,
        };
      });
    } catch (error: any) {
      console.error(`[Instagram] Reels RapidAPI attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
  }
  return null;
}

/**
 * Fetch Instagram reels using Manus Data API as fallback
 */
async function fetchReelsFromManusAPI(cleanUsername: string, count: number): Promise<InstagramReel[] | null> {
  try {
    console.log(`[Instagram] Fetching reels via Manus API for @${cleanUsername}`);
    
    const result = await callDataApi("Instagram/get_user_reels", {
      query: { username: cleanUsername, count: String(count) }
    }) as any;

    if (!result || (!result.items && !result.reels)) {
      console.error("[Instagram] Manus API: No reels found");
      return null;
    }

    const reels = result.items || result.reels || [];
    console.log(`[Instagram] Manus API returned ${reels.length} reels`);
    
    return reels.slice(0, count).map((item: any) => {
      const media = item.media || item;
      return {
        id: media.id || media.pk || "",
        shortcode: media.code || media.shortcode || "",
        caption: media.caption?.text || media.caption || "",
        likeCount: media.like_count || 0,
        commentCount: media.comment_count || 0,
        playCount: media.play_count || media.view_count || 0,
        viewCount: media.view_count || media.play_count || 0,
        timestamp: media.taken_at || media.taken_at_timestamp || 0,
        thumbnailUrl: media.image_versions2?.candidates?.[0]?.url || media.display_url || media.thumbnail_url || "",
        videoUrl: media.video_versions?.[0]?.url || media.video_url || "",
        duration: media.video_duration || 0,
      };
    });
  } catch (error: any) {
    console.error("[Instagram] Manus API reels failed:", error.message);
    return null;
  }
}

export async function fetchInstagramReels(username: string, count: number = 12): Promise<InstagramReel[]> {
  const cleanUsername = username.replace("@", "").trim().toLowerCase();
  
  // Try RapidAPI first
  const rapidApiReels = await fetchReelsFromRapidAPI(cleanUsername, count);
  if (rapidApiReels && rapidApiReels.length > 0) {
    return rapidApiReels;
  }
  
  // Try Manus API as fallback
  const manusReels = await fetchReelsFromManusAPI(cleanUsername, count);
  if (manusReels && manusReels.length > 0) {
    return manusReels;
  }
  
  console.warn(`[Instagram] No reels found for @${cleanUsername} from any API`);
  return [];
}

function calculateViralScore(
  profile: InstagramProfile,
  posts: InstagramPost[],
  reels: InstagramReel[]
): { score: number; factors: InstagramAnalysis["viralFactors"] } {
  const allMedia = [...posts, ...reels];
  
  if (allMedia.length === 0 || profile.followerCount === 0) {
    return {
      score: 50,
      factors: { hook: 50, emotion: 50, shareability: 50, replay: 50, caption: 50, hashtags: 50 }
    };
  }

  const avgLikes = allMedia.reduce((sum, m) => sum + m.likeCount, 0) / allMedia.length;
  const avgComments = allMedia.reduce((sum, m) => sum + m.commentCount, 0) / allMedia.length;
  
  const engagementRate = ((avgLikes + avgComments) / profile.followerCount) * 100;
  
  const hookScore = Math.min(100, Math.round(
    (reels.length > 0 ? 70 : 50) + 
    (engagementRate > 3 ? 20 : engagementRate > 1 ? 10 : 0) +
    (profile.isVerified ? 10 : 0)
  ));

  const emotionScore = Math.min(100, Math.round(
    50 + 
    (avgComments > 100 ? 30 : avgComments > 50 ? 20 : avgComments > 10 ? 10 : 0) +
    (engagementRate > 5 ? 20 : engagementRate > 2 ? 10 : 0)
  ));

  const shareabilityScore = Math.min(100, Math.round(
    40 + 
    (avgLikes > 1000 ? 30 : avgLikes > 500 ? 20 : avgLikes > 100 ? 10 : 0) +
    (profile.followerCount > 10000 ? 20 : profile.followerCount > 1000 ? 10 : 0) +
    (reels.length > 5 ? 10 : 0)
  ));

  const replayScore = Math.min(100, Math.round(
    50 + 
    (reels.length > 0 ? 20 : 0) +
    (reels.some(r => r.playCount > r.viewCount * 1.2) ? 20 : 0) +
    (engagementRate > 3 ? 10 : 0)
  ));

  const avgCaptionLength = allMedia.reduce((sum, m) => sum + (m.caption?.length || 0), 0) / allMedia.length;
  const captionScore = Math.min(100, Math.round(
    40 + 
    (avgCaptionLength > 100 && avgCaptionLength < 500 ? 30 : avgCaptionLength > 50 ? 20 : 10) +
    (avgComments > avgLikes * 0.05 ? 20 : avgComments > avgLikes * 0.02 ? 10 : 0) +
    (profile.biography.length > 50 ? 10 : 0)
  ));

  const hashtagScore = Math.min(100, Math.round(
    60 + 
    (profile.mediaCount > 100 ? 20 : profile.mediaCount > 50 ? 10 : 0) +
    (engagementRate > 2 ? 20 : engagementRate > 1 ? 10 : 0)
  ));

  const factors = {
    hook: hookScore,
    emotion: emotionScore,
    shareability: shareabilityScore,
    replay: replayScore,
    caption: captionScore,
    hashtags: hashtagScore,
  };

  const overallScore = Math.round(
    (hookScore * 0.25 + emotionScore * 0.20 + shareabilityScore * 0.20 + 
     replayScore * 0.15 + captionScore * 0.10 + hashtagScore * 0.10)
  );

  return { score: overallScore, factors };
}

export async function analyzeInstagramAccount(username: string): Promise<InstagramAnalysis> {
  try {
    const [profile, posts, reels] = await Promise.all([
      fetchInstagramProfile(username),
      fetchInstagramPosts(username, 12),
      fetchInstagramReels(username, 12),
    ]);

    const allMedia = [...posts, ...reels];
    
    const avgLikes = allMedia.length > 0 
      ? Math.round(allMedia.reduce((sum, m) => sum + m.likeCount, 0) / allMedia.length)
      : 0;
    
    const avgComments = allMedia.length > 0
      ? Math.round(allMedia.reduce((sum, m) => sum + m.commentCount, 0) / allMedia.length)
      : 0;

    const videosWithViews = allMedia.filter(m => m.viewCount || m.playCount);
    const avgViews = videosWithViews.length > 0
      ? Math.round(videosWithViews.reduce((sum, m) => sum + (m.viewCount || m.playCount || 0), 0) / videosWithViews.length)
      : 0;

    const engagementRate = profile.followerCount > 0
      ? Number(((avgLikes + avgComments) / profile.followerCount * 100).toFixed(2))
      : 0;

    const avgShares = Math.round(avgLikes * 0.1);
    const avgSaves = Math.round(avgLikes * 0.12);

    const { score: viralScore, factors: viralFactors } = calculateViralScore(profile, posts, reels);

    return {
      profile,
      posts,
      reels,
      metrics: {
        avgLikes,
        avgComments,
        avgViews,
        engagementRate,
        avgShares,
        avgSaves,
      },
      viralScore,
      viralFactors,
      isDemo: false,
    };
  } catch (error: any) {
    console.log(`[API] Live data failed for @${username}, using demo mode: ${error.message}`);
    // Return demo data as fallback
    return generateDemoData(username);
  }
}

export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://${RAPIDAPI_HOST}/ig_get_fb_profile_v3.php`,
      new URLSearchParams({ username_or_url: "instagram" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": getApiKey(),
        },
        timeout: 15000,
      }
    );
    
    return response.status === 200 && response.data && !!response.data.username;
  } catch (error) {
    return false;
  }
}
