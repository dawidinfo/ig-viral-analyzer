/**
 * Multi-API Instagram Service
 * Fallback chain: InstaPulse → FastGram → Instagram Statistics → Demo Data
 * 
 * This service provides reliable Instagram data by trying multiple APIs
 * in order of speed and reliability.
 */

import * as instaPulse from './instaPulseApi';
import * as fastGram from './fastGramApi';
import { analyzeInstagramAccount, generateDemoData } from '../instagram';

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
  source: 'instapulse' | 'fastgram' | 'instagram-statistics' | 'demo';
  latency: number;
}

/**
 * Normalize InstaPulse data to common format
 */
function normalizeInstaPulseData(data: Awaited<ReturnType<typeof instaPulse.analyzeInstagramProfile>>): InstagramAnalysisResult {
  return {
    profile: {
      username: data.profile!.username,
      fullName: data.profile!.full_name,
      biography: data.profile!.biography,
      followerCount: data.profile!.followers_count,
      followingCount: data.profile!.following_count,
      postsCount: data.profile!.media_count,
      isVerified: data.profile!.is_verified,
      isPrivate: data.profile!.is_private,
      profilePicUrl: data.profile!.profile_pic_url,
      externalUrl: data.profile!.external_url,
      category: data.profile!.category,
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
    source: 'instapulse',
    latency: 0,
  };
}

/**
 * Normalize FastGram data to common format
 */
function normalizeFastGramData(data: Awaited<ReturnType<typeof fastGram.analyzeInstagramProfile>>): InstagramAnalysisResult {
  return {
    profile: {
      username: data.profile!.username,
      fullName: data.profile!.full_name,
      biography: data.profile!.biography,
      followerCount: data.profile!.followers,
      followingCount: data.profile!.follows,
      postsCount: data.profile!.image_count + data.profile!.video_count,
      isVerified: data.profile!.is_verified,
      isPrivate: data.profile!.is_private,
      profilePicUrl: data.profile!.profile_image,
    },
    posts: data.posts.map(p => ({
      id: p.instagramId,
      shortcode: p.shortcode,
      caption: p.caption,
      likeCount: p.like_count,
      commentCount: p.comment_count,
      isVideo: p.is_video,
      displayUrl: p.media_url || p.thumbnail_url,
      takenAt: p.taken_at,
    })),
    reels: data.reels.map(r => ({
      id: r.instagramId,
      shortcode: r.shortcode,
      caption: r.caption,
      likeCount: r.like_count,
      commentCount: r.comment_count,
      playCount: 0, // FastGram doesn't provide play count separately
      displayUrl: r.thumbnail_url,
      videoUrl: r.media_url,
      takenAt: r.taken_at,
    })),
    isDemo: false,
    source: 'fastgram',
    latency: 0,
  };
}

/**
 * Main analysis function with fallback chain
 */
export async function analyzeInstagram(username: string): Promise<InstagramAnalysisResult> {
  const cleanUsername = username.replace('@', '').trim();
  const startTime = Date.now();
  
  console.log(`[MultiAPI] Starting analysis for @${cleanUsername}`);
  console.log(`[MultiAPI] Fallback chain: InstaPulse → FastGram → Instagram Statistics → Demo`);
  
  // Try InstaPulse first (fastest - 90ms)
  try {
    console.log(`[MultiAPI] Trying InstaPulse API...`);
    const data = await instaPulse.analyzeInstagramProfile(cleanUsername);
    if (data.profile) {
      const result = normalizeInstaPulseData(data);
      result.latency = Date.now() - startTime;
      console.log(`[MultiAPI] ✓ InstaPulse succeeded in ${result.latency}ms`);
      return result;
    }
  } catch (error: any) {
    console.log(`[MultiAPI] ✗ InstaPulse failed: ${error.message}`);
  }
  
  // Try FastGram second (reliable - 173ms)
  try {
    console.log(`[MultiAPI] Trying FastGram API...`);
    const data = await fastGram.analyzeInstagramProfile(cleanUsername);
    if (data.profile) {
      const result = normalizeFastGramData(data);
      result.latency = Date.now() - startTime;
      console.log(`[MultiAPI] ✓ FastGram succeeded in ${result.latency}ms`);
      return result;
    }
  } catch (error: any) {
    console.log(`[MultiAPI] ✗ FastGram failed: ${error.message}`);
  }
  
  // Try Instagram Statistics API (current - slow but works)
  try {
    console.log(`[MultiAPI] Trying Instagram Statistics API...`);
    const data = await analyzeInstagramAccount(cleanUsername);
    if (data && !data.isDemo) {
      const result: InstagramAnalysisResult = {
        profile: {
          username: data.profile.username,
          fullName: data.profile.fullName,
          biography: data.profile.biography,
          followerCount: data.profile.followerCount,
          followingCount: data.profile.followingCount,
          postsCount: data.profile.mediaCount,
          isVerified: data.profile.isVerified,
          isPrivate: false,
          profilePicUrl: data.profile.profilePicUrl,
          externalUrl: data.profile.externalUrl,
        },
        posts: data.posts?.map((p: any) => ({
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
        reels: data.reels?.map((r: any) => ({
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
        isDemo: false,
        source: 'instagram-statistics',
        latency: Date.now() - startTime,
      };
      console.log(`[MultiAPI] ✓ Instagram Statistics succeeded in ${result.latency}ms`);
      return result;
    }
  } catch (error: any) {
    console.log(`[MultiAPI] ✗ Instagram Statistics failed: ${error.message}`);
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
  instapulse: boolean;
  fastgram: boolean;
  instagramStatistics: boolean;
}> {
  const [instapulseHealth, fastgramHealth] = await Promise.all([
    instaPulse.checkApiHealth().catch(() => false),
    fastGram.checkApiHealth().catch(() => false),
  ]);
  
  return {
    instapulse: instapulseHealth,
    fastgram: fastgramHealth,
    instagramStatistics: true, // Assume available
  };
}

export default {
  analyzeInstagram,
  checkAllApisHealth,
};
