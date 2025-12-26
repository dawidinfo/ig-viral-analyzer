/**
 * InstaPulse Instagram API Service
 * Primary API for Instagram data - fastest (90ms latency)
 * https://rapidapi.com/EndpointHub/api/instapulse-instagram-api1
 */

import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'instapulse-instagram-api1.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

interface InstaPulseProfile {
  username: string;
  full_name: string;
  biography: string;
  followers_count: number;
  following_count: number;
  media_count: number;
  is_verified: boolean;
  is_private: boolean;
  profile_pic_url: string;
  external_url?: string;
  category?: string;
}

interface InstaPulsePost {
  id: string;
  shortcode: string;
  caption?: string;
  like_count: number;
  comment_count: number;
  view_count?: number;
  is_video: boolean;
  display_url: string;
  video_url?: string;
  taken_at: number;
}

interface InstaPulseReel {
  id: string;
  shortcode: string;
  caption?: string;
  like_count: number;
  comment_count: number;
  play_count: number;
  display_url: string;
  video_url: string;
  taken_at: number;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
  timeout: 30000, // 30 seconds
});

/**
 * Get user profile information
 */
export async function getUserInfo(username: string): Promise<InstaPulseProfile | null> {
  try {
    console.log(`[InstaPulse] Fetching profile for @${username}`);
    const startTime = Date.now();
    
    const response = await axiosInstance.get('/user-info', {
      params: { username: username.replace('@', '') },
    });
    
    const latency = Date.now() - startTime;
    console.log(`[InstaPulse] Profile fetched in ${latency}ms`);
    
    if (response.data && response.data.data) {
      const user = response.data.data;
      return {
        username: user.username,
        full_name: user.full_name || user.name || '',
        biography: user.biography || user.bio || '',
        followers_count: user.follower_count || user.followers_count || 0,
        following_count: user.following_count || 0,
        media_count: user.media_count || 0,
        is_verified: user.is_verified || false,
        is_private: user.is_private || false,
        profile_pic_url: user.profile_pic_url || user.profile_pic_url_hd || '',
        external_url: user.external_url,
        category: user.category,
      };
    }
    
    return null;
  } catch (error: any) {
    console.error(`[InstaPulse] Error fetching profile:`, error.message);
    if (error.response) {
      console.error(`[InstaPulse] Status: ${error.response.status}`);
    }
    throw error;
  }
}

/**
 * Get user posts
 */
export async function getUserPosts(username: string, limit: number = 12): Promise<InstaPulsePost[]> {
  try {
    console.log(`[InstaPulse] Fetching posts for @${username}`);
    const startTime = Date.now();
    
    const response = await axiosInstance.get('/user-posts', {
      params: { 
        username: username.replace('@', ''),
        count: limit,
      },
    });
    
    const latency = Date.now() - startTime;
    console.log(`[InstaPulse] Posts fetched in ${latency}ms`);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map((post: any) => ({
        id: post.id || post.pk,
        shortcode: post.shortcode || post.code,
        caption: post.caption?.text || post.caption || '',
        like_count: post.like_count || post.likes_count || 0,
        comment_count: post.comment_count || post.comments_count || 0,
        view_count: post.view_count || post.video_view_count,
        is_video: post.is_video || post.media_type === 2,
        display_url: post.display_url || post.thumbnail_url || post.image_versions2?.candidates?.[0]?.url || '',
        video_url: post.video_url,
        taken_at: post.taken_at || Math.floor(Date.now() / 1000),
      }));
    }
    
    return [];
  } catch (error: any) {
    console.error(`[InstaPulse] Error fetching posts:`, error.message);
    throw error;
  }
}

/**
 * Get user reels
 */
export async function getUserReels(username: string, limit: number = 12): Promise<InstaPulseReel[]> {
  try {
    console.log(`[InstaPulse] Fetching reels for @${username}`);
    const startTime = Date.now();
    
    const response = await axiosInstance.get('/user-reels', {
      params: { 
        username: username.replace('@', ''),
        count: limit,
      },
    });
    
    const latency = Date.now() - startTime;
    console.log(`[InstaPulse] Reels fetched in ${latency}ms`);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map((reel: any) => ({
        id: reel.id || reel.pk,
        shortcode: reel.shortcode || reel.code,
        caption: reel.caption?.text || reel.caption || '',
        like_count: reel.like_count || reel.likes_count || 0,
        comment_count: reel.comment_count || reel.comments_count || 0,
        play_count: reel.play_count || reel.view_count || 0,
        display_url: reel.display_url || reel.thumbnail_url || reel.image_versions2?.candidates?.[0]?.url || '',
        video_url: reel.video_url || '',
        taken_at: reel.taken_at || Math.floor(Date.now() / 1000),
      }));
    }
    
    return [];
  } catch (error: any) {
    console.error(`[InstaPulse] Error fetching reels:`, error.message);
    throw error;
  }
}

/**
 * Get user stories
 */
export async function getUserStories(username: string): Promise<any[]> {
  try {
    console.log(`[InstaPulse] Fetching stories for @${username}`);
    
    const response = await axiosInstance.get('/user-stories', {
      params: { username: username.replace('@', '') },
    });
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error(`[InstaPulse] Error fetching stories:`, error.message);
    throw error;
  }
}

/**
 * Full Instagram analysis using InstaPulse
 */
export async function analyzeInstagramProfile(username: string): Promise<{
  profile: InstaPulseProfile | null;
  posts: InstaPulsePost[];
  reels: InstaPulseReel[];
  isDemo: boolean;
  source: string;
}> {
  const cleanUsername = username.replace('@', '').trim();
  
  try {
    console.log(`[InstaPulse] Starting full analysis for @${cleanUsername}`);
    const startTime = Date.now();
    
    // Fetch all data in parallel
    const [profile, posts, reels] = await Promise.all([
      getUserInfo(cleanUsername),
      getUserPosts(cleanUsername, 12),
      getUserReels(cleanUsername, 12),
    ]);
    
    const totalLatency = Date.now() - startTime;
    console.log(`[InstaPulse] Full analysis completed in ${totalLatency}ms`);
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    return {
      profile,
      posts,
      reels,
      isDemo: false,
      source: 'instapulse',
    };
  } catch (error: any) {
    console.error(`[InstaPulse] Analysis failed for @${cleanUsername}:`, error.message);
    throw error;
  }
}

/**
 * Check if InstaPulse API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    // Try to fetch a known public profile
    const response = await axiosInstance.get('/user-info', {
      params: { username: 'instagram' },
      timeout: 10000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

export default {
  getUserInfo,
  getUserPosts,
  getUserReels,
  getUserStories,
  analyzeInstagramProfile,
  checkApiHealth,
};
