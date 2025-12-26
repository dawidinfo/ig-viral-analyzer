/**
 * Multi-API Instagram Service
 * Fallback chain: Social Blade → JoTucker Instagram Scraper → Demo Data
 * 
 * Social Blade is the primary source for profile stats and historical data.
 * JoTucker provides posts and reels data.
 */

import { socialBladeService, InstagramStatistics } from './socialBladeService';
import * as joTuckerApi from './joTuckerInstagramApi';
import { generateDemoData } from '../instagram';

export interface InstagramAnalysisResult {
  profile: {
    username: string;
    fullName: string;
    biography: string;
    followerCount: number;
    followingCount: number;
    postsCount: number;
    isVerified: boolean;
    isPrivate: boolean;
    profilePicUrl: string;
    externalUrl?: string;
    category?: string;
    grade?: string;
    gradeColor?: string;
    engagementRate?: number;
  };
  posts: Array<{
    id: string;
    shortcode: string;
    caption: string;
    likeCount: number;
    commentCount: number;
    viewCount?: number;
    isVideo: boolean;
    displayUrl: string;
    videoUrl?: string;
    takenAt: number;
  }>;
  reels: Array<{
    id: string;
    shortcode: string;
    caption: string;
    likeCount: number;
    commentCount: number;
    playCount: number;
    displayUrl: string;
    videoUrl: string;
    takenAt: number;
  }>;
  isDemo: boolean;
  source: 'socialblade' | 'jotucker' | 'demo';
  latency: number;
  // Additional Social Blade data
  growth?: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
  };
  dailyData?: Array<{
    date: string;
    followers: number;
    following: number;
    media: number;
    avgLikes: number;
    avgComments: number;
  }>;
}

/**
 * Normalize Social Blade data to common format
 */
function normalizeSocialBladeData(stats: InstagramStatistics, username: string): InstagramAnalysisResult {
  const growth = stats.statistics.growth.followers;
  
  return {
    profile: {
      username: stats.id.username || username,
      fullName: stats.id.display_name || username,
      biography: '', // Social Blade doesn't provide bio
      followerCount: stats.statistics.total.followers,
      followingCount: stats.statistics.total.following,
      postsCount: stats.statistics.total.media,
      isVerified: stats.misc.sb_verified,
      isPrivate: false,
      profilePicUrl: stats.general.branding.avatar || '',
      externalUrl: stats.general.branding.website,
      grade: stats.misc.grade.grade,
      gradeColor: stats.misc.grade.color,
      engagementRate: stats.statistics.total.engagement_rate,
    },
    posts: [],
    reels: [],
    isDemo: false,
    source: 'socialblade',
    latency: 0,
    growth: {
      day1: growth["1"] || 0,
      day7: growth["7"] || 0,
      day14: growth["14"] || 0,
      day30: growth["30"] || 0,
    },
    dailyData: stats.daily?.map(d => ({
      date: d.date,
      followers: d.followers,
      following: d.following,
      media: d.media,
      avgLikes: d.avg_likes,
      avgComments: d.avg_comments,
    })) || [],
  };
}

/**
 * Normalize JoTucker data to common format
 */
function normalizeJoTuckerData(data: Awaited<ReturnType<typeof joTuckerApi.analyzeInstagramProfile>>): InstagramAnalysisResult | null {
  if (!data.profile) return null;
  
  return {
    profile: {
      username: data.profile.username,
      fullName: data.profile.full_name,
      biography: data.profile.biography,
      followerCount: data.profile.follower_count,
      followingCount: data.profile.following_count,
      postsCount: data.profile.media_count,
      isVerified: data.profile.is_verified,
      isPrivate: data.profile.is_private,
      profilePicUrl: data.profile.profile_pic_url_hd || data.profile.profile_pic_url,
      externalUrl: data.profile.external_url,
      category: data.profile.category,
    },
    posts: data.posts.map(p => ({
      id: p.id,
      shortcode: p.shortcode,
      caption: p.caption || '',
      likeCount: p.like_count,
      commentCount: p.comment_count,
      viewCount: p.view_count,
      isVideo: p.is_video,
      displayUrl: p.display_url,
      videoUrl: p.video_url,
      takenAt: p.taken_at,
    })),
    reels: data.reels.map(r => ({
      id: r.id,
      shortcode: r.shortcode,
      caption: r.caption || '',
      likeCount: r.like_count,
      commentCount: r.comment_count,
      playCount: r.play_count,
      displayUrl: r.display_url,
      videoUrl: r.video_url,
      takenAt: r.taken_at,
    })),
    isDemo: false,
    source: 'jotucker',
    latency: 0,
  };
}

/**
 * Main analysis function with fallback chain
 * Social Blade (profile + history) + JoTucker (posts/reels) → JoTucker only → Demo
 */
export async function analyzeInstagram(username: string): Promise<InstagramAnalysisResult> {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  const startTime = Date.now();
  
  console.log(`[MultiAPI] Starting analysis for @${cleanUsername}`);
  console.log(`[MultiAPI] Fallback chain: Social Blade + JoTucker → JoTucker → Demo`);
  
  // Try Social Blade first for profile stats (primary source)
  let socialBladeData: InstagramAnalysisResult | null = null;
  
  if (socialBladeService.isConfigured()) {
    try {
      console.log(`[MultiAPI] Trying Social Blade API for profile stats...`);
      const sbStartTime = Date.now();
      const stats = await socialBladeService.getInstagramStatistics(cleanUsername, 'default');
      
      if (stats) {
        socialBladeData = normalizeSocialBladeData(stats, cleanUsername);
        console.log(`[MultiAPI] ✓ Social Blade succeeded in ${Date.now() - sbStartTime}ms`);
      }
    } catch (error: any) {
      console.log(`[MultiAPI] ✗ Social Blade failed: ${error.message}`);
    }
  } else {
    console.log(`[MultiAPI] Social Blade not configured, skipping...`);
  }
  
  // Try JoTucker for posts and reels (and profile if Social Blade failed)
  try {
    console.log(`[MultiAPI] Trying JoTucker Instagram Scraper for posts/reels...`);
    const jtStartTime = Date.now();
    const joTuckerData = await joTuckerApi.analyzeInstagramProfile(cleanUsername);
    
    if (joTuckerData.profile || joTuckerData.posts.length > 0 || joTuckerData.reels.length > 0) {
      console.log(`[MultiAPI] ✓ JoTucker succeeded in ${Date.now() - jtStartTime}ms`);
      
      // If we have Social Blade data, merge with JoTucker posts/reels
      if (socialBladeData) {
        socialBladeData.posts = joTuckerData.posts.map(p => ({
          id: p.id,
          shortcode: p.shortcode,
          caption: p.caption || '',
          likeCount: p.like_count,
          commentCount: p.comment_count,
          viewCount: p.view_count,
          isVideo: p.is_video,
          displayUrl: p.display_url,
          videoUrl: p.video_url,
          takenAt: p.taken_at,
        }));
        socialBladeData.reels = joTuckerData.reels.map(r => ({
          id: r.id,
          shortcode: r.shortcode,
          caption: r.caption || '',
          likeCount: r.like_count,
          commentCount: r.comment_count,
          playCount: r.play_count,
          displayUrl: r.display_url,
          videoUrl: r.video_url,
          takenAt: r.taken_at,
        }));
        
        // Fill in missing profile data from JoTucker
        if (joTuckerData.profile) {
          if (!socialBladeData.profile.biography && joTuckerData.profile.biography) {
            socialBladeData.profile.biography = joTuckerData.profile.biography;
          }
          if (!socialBladeData.profile.profilePicUrl && joTuckerData.profile.profile_pic_url) {
            socialBladeData.profile.profilePicUrl = joTuckerData.profile.profile_pic_url_hd || joTuckerData.profile.profile_pic_url;
          }
          if (!socialBladeData.profile.category && joTuckerData.profile.category) {
            socialBladeData.profile.category = joTuckerData.profile.category;
          }
        }
        
        socialBladeData.latency = Date.now() - startTime;
        return socialBladeData;
      }
      
      // Use JoTucker data only
      const result = normalizeJoTuckerData(joTuckerData);
      if (result) {
        result.latency = Date.now() - startTime;
        return result;
      }
    }
  } catch (error: any) {
    console.log(`[MultiAPI] ✗ JoTucker failed: ${error.message}`);
  }
  
  // If we have Social Blade data but no posts/reels, still return it
  if (socialBladeData) {
    socialBladeData.latency = Date.now() - startTime;
    console.log(`[MultiAPI] Returning Social Blade data without posts/reels`);
    return socialBladeData;
  }
  
  // Fallback to demo data
  console.log(`[MultiAPI] All APIs failed, using demo data for @${cleanUsername}`);
  const demoData = generateDemoData(cleanUsername);
  
  return {
    profile: {
      username: demoData.profile.username,
      fullName: demoData.profile.fullName,
      biography: demoData.profile.biography,
      followerCount: demoData.profile.followerCount,
      followingCount: demoData.profile.followingCount,
      postsCount: demoData.profile.mediaCount,
      isVerified: demoData.profile.isVerified,
      isPrivate: false,
      profilePicUrl: demoData.profile.profilePicUrl,
      externalUrl: demoData.profile.externalUrl,
    },
    posts: demoData.posts?.map((p: any) => ({
      id: p.id,
      shortcode: p.shortcode,
      caption: p.caption || '',
      likeCount: p.likeCount || 0,
      commentCount: p.commentCount || 0,
      viewCount: p.viewCount,
      isVideo: p.isVideo || false,
      displayUrl: p.thumbnailUrl || '',
      videoUrl: p.videoUrl,
      takenAt: p.timestamp || Math.floor(Date.now() / 1000),
    })) || [],
    reels: demoData.reels?.map((r: any) => ({
      id: r.id,
      shortcode: r.shortcode,
      caption: r.caption || '',
      likeCount: r.likeCount || 0,
      commentCount: r.commentCount || 0,
      playCount: r.playCount || r.viewCount || 0,
      displayUrl: r.thumbnailUrl || '',
      videoUrl: r.videoUrl || '',
      takenAt: r.timestamp || Math.floor(Date.now() / 1000),
    })) || [],
    isDemo: true,
    source: 'demo',
    latency: Date.now() - startTime,
  };
}

/**
 * Check health of all APIs
 */
export async function checkAllApisHealth(): Promise<{
  socialblade: boolean;
  jotucker: boolean;
}> {
  const [socialbladeHealth, jotuckerHealth] = await Promise.all([
    Promise.resolve(socialBladeService.isConfigured()),
    joTuckerApi.checkApiHealth().catch(() => false),
  ]);
  
  return {
    socialblade: socialbladeHealth,
    jotucker: jotuckerHealth,
  };
}

export default {
  analyzeInstagram,
  checkAllApisHealth,
};
