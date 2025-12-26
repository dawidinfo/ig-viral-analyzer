/**
 * FastGram Scraper API Service
 * Fallback API for Instagram data - reliable (173ms latency, 100% uptime)
 * https://rapidapi.com/scraperpunk-scraperpunk-default/api/fastgram-scraper
 */

import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'fastgram-scraper.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

interface FastGramProfile {
  username: string;
  full_name: string;
  biography: string;
  followers: number;
  follows: number;
  is_verified: boolean;
  is_private: boolean;
  profile_image: string;
  video_count: number;
  image_count: number;
}

interface FastGramPost {
  instagramId: string;
  shortcode: string;
  caption: string;
  like_count: number;
  comment_count: number;
  is_video: boolean;
  media_url: string;
  thumbnail_url: string;
  taken_at: number;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
  timeout: 30000,
});

/**
 * Get cached user data (fast endpoint)
 */
export async function getSavedUserData(username: string): Promise<FastGramProfile | null> {
  try {
    console.log(`[FastGram] Fetching cached profile for @${username}`);
    const startTime = Date.now();
    
    const response = await axiosInstance.get('/api/scrape/data/user/' + username.replace('@', ''));
    
    const latency = Date.now() - startTime;
    console.log(`[FastGram] Profile fetched in ${latency}ms`);
    
    if (response.data && response.data.user) {
      const user = response.data.user;
      return {
        username: user.username,
        full_name: user.name || user.full_name || '',
        biography: user.bio || user.biography || '',
        followers: user.followers || user.follower_count || 0,
        follows: user.follows || user.following_count || 0,
        is_verified: user.is_verified || false,
        is_private: user.is_private || false,
        profile_image: user.profile_image || user.profile_pic_url || '',
        video_count: user.video_count || 0,
        image_count: user.image_count || 0,
      };
    }
    
    return null;
  } catch (error: any) {
    console.error(`[FastGram] Error fetching profile:`, error.message);
    throw error;
  }
}

/**
 * Get cached posts data (fast endpoint)
 */
export async function getSavedPostsData(username: string, limit: number = 12): Promise<FastGramPost[]> {
  try {
    console.log(`[FastGram] Fetching cached posts for @${username}`);
    const startTime = Date.now();
    
    const response = await axiosInstance.get('/api/scrape/data/posts/' + username.replace('@', ''), {
      params: { limit },
    });
    
    const latency = Date.now() - startTime;
    console.log(`[FastGram] Posts fetched in ${latency}ms`);
    
    if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
      return response.data.posts.map((post: any) => ({
        instagramId: post.instagramId || post.id,
        shortcode: post.shortcode || post.code,
        caption: post.caption || '',
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        is_video: post.is_video || false,
        media_url: post.media_url || post.display_url || '',
        thumbnail_url: post.thumbnail_url || post.display_url || '',
        taken_at: post.taken_at || Math.floor(Date.now() / 1000),
      }));
    }
    
    return [];
  } catch (error: any) {
    console.error(`[FastGram] Error fetching posts:`, error.message);
    throw error;
  }
}

/**
 * Start a scraping job for fresh data
 */
export async function startScrapingJob(username: string): Promise<{ jobId: string } | null> {
  try {
    console.log(`[FastGram] Starting scraping job for @${username}`);
    
    const response = await axiosInstance.post('/api/scrape/user/' + username.replace('@', ''));
    
    if (response.data && response.data.job) {
      return { jobId: response.data.job.id || response.data.job.queueJobId };
    }
    
    return null;
  } catch (error: any) {
    console.error(`[FastGram] Error starting scraping job:`, error.message);
    throw error;
  }
}

/**
 * Check job status
 */
export async function getJobStatus(jobId: string): Promise<{
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: { current: number; total: number; message: string };
  result?: any;
  error?: string;
}> {
  try {
    const response = await axiosInstance.get('/api/scrape/jobs/' + jobId);
    
    if (response.data && response.data.job) {
      return {
        status: response.data.job.status,
        progress: response.data.job.progress,
        result: response.data.job.result,
        error: response.data.job.error,
      };
    }
    
    return { status: 'failed', error: 'Job not found' };
  } catch (error: any) {
    console.error(`[FastGram] Error checking job status:`, error.message);
    throw error;
  }
}

/**
 * Full Instagram analysis using FastGram
 */
export async function analyzeInstagramProfile(username: string): Promise<{
  profile: FastGramProfile | null;
  posts: FastGramPost[];
  reels: FastGramPost[];
  isDemo: boolean;
  source: string;
}> {
  const cleanUsername = username.replace('@', '').trim();
  
  try {
    console.log(`[FastGram] Starting analysis for @${cleanUsername}`);
    const startTime = Date.now();
    
    // Try to get cached data first (fast)
    const [profile, posts] = await Promise.all([
      getSavedUserData(cleanUsername),
      getSavedPostsData(cleanUsername, 24),
    ]);
    
    const totalLatency = Date.now() - startTime;
    console.log(`[FastGram] Analysis completed in ${totalLatency}ms`);
    
    if (!profile) {
      // If no cached data, start a scraping job
      console.log(`[FastGram] No cached data, starting scraping job...`);
      const job = await startScrapingJob(cleanUsername);
      if (job) {
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 5000));
        const freshProfile = await getSavedUserData(cleanUsername);
        const freshPosts = await getSavedPostsData(cleanUsername, 24);
        
        if (freshProfile) {
          // Separate reels from posts (videos)
          const reels = freshPosts.filter(p => p.is_video);
          const regularPosts = freshPosts.filter(p => !p.is_video);
          
          return {
            profile: freshProfile,
            posts: regularPosts,
            reels,
            isDemo: false,
            source: 'fastgram',
          };
        }
      }
      throw new Error('Profile not found');
    }
    
    // Separate reels from posts (videos)
    const reels = posts.filter(p => p.is_video);
    const regularPosts = posts.filter(p => !p.is_video);
    
    return {
      profile,
      posts: regularPosts,
      reels,
      isDemo: false,
      source: 'fastgram',
    };
  } catch (error: any) {
    console.error(`[FastGram] Analysis failed for @${cleanUsername}:`, error.message);
    throw error;
  }
}

/**
 * Check if FastGram API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await axiosInstance.get('/api/scrape/data/user/instagram', {
      timeout: 10000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

export default {
  getSavedUserData,
  getSavedPostsData,
  startScrapingJob,
  getJobStatus,
  analyzeInstagramProfile,
  checkApiHealth,
};
