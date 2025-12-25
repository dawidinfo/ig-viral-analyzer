/**
 * Instagram Statistics API Service
 * Fetches real historical follower data from RapidAPI
 * API: https://rapidapi.com/artemlipko/api/instagram-statistics-api
 */

import axios from 'axios';

const API_HOST = 'instagram-statistics-api.p.rapidapi.com';

interface RetrospectiveDataPoint {
  date: string;
  usersCount: number;
  deltaUsersCount: number;
  deltaPosts: number;
  deltaInteractions: number;
  deltaLikes: number;
  deltaComments: number;
  deltaRePosts: number;
  deltaDisLikes: number;
  deltaViews: number;
}

interface RetrospectiveResponse {
  meta: {
    status?: string;
    code?: number;
    message?: string;
  };
  data: {
    series: {
      current: RetrospectiveDataPoint[];
      prev: RetrospectiveDataPoint[];
    };
    summary: {
      current: Record<string, number>;
      prev: Record<string, number>;
      delta: Record<string, number>;
    };
  };
}

interface ProfileResponse {
  meta?: {
    status: string;
  };
  // The API returns data directly at root level
  cid?: string;
  id?: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  profilePicUrl?: string;
  profile_pic_url?: string;
  biography?: string;
  followersCount?: number;
  followers_count?: number;
  edge_followed_by?: { count: number };
  followingCount?: number;
  following_count?: number;
  edge_follow?: { count: number };
  mediaCount?: number;
  media_count?: number;
  edge_owner_to_timeline_media?: { count: number };
  isVerified?: boolean;
  is_verified?: boolean;
  isPrivate?: boolean;
  is_private?: boolean;
  // Nested data structure (alternative format)
  data?: {
    cid: string;
    username: string;
    fullName: string;
    profilePicUrl: string;
    biography: string;
    followersCount: number;
    followingCount: number;
    mediaCount: number;
    isVerified: boolean;
    isPrivate: boolean;
  };
}

export interface HistoricalFollowerData {
  username: string;
  cid: string;
  dataPoints: Array<{
    date: string;
    followers: number;
    change: number;
    changePercent: number;
    interactions: number;
    likes: number;
    comments: number;
  }>;
  summary: {
    totalGrowth: number;
    totalGrowthPercent: number;
    avgDailyGrowth: number;
    totalInteractions: number;
    trend: 'rising' | 'stable' | 'declining';
  };
  isReal: boolean;
}

/**
 * Get the RapidAPI key for Instagram Statistics API
 */
function getApiKey(): string | null {
  return process.env.INSTAGRAM_STATISTICS_API_KEY || null;
}

/**
 * Format date to DD.MM.YYYY format required by the API
 */
function formatDateForApi(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Parse date from DD.MM.YYYY format
 */
function parseDateFromApi(dateStr: string): string {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month}-${day}`;
}

/**
 * Get Instagram profile and CID (Channel ID) by username
 */
export async function getInstagramProfile(username: string): Promise<{ cid: string; profile: any } | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log('[InstagramStatisticsAPI] No API key configured');
    return null;
  }

  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

  try {
    // Use the Profile by URL endpoint (community endpoint)
    const response = await axios.get<any>(
      `https://${API_HOST}/community`,
      {
        params: { url: profileUrl },
        headers: {
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': apiKey,
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    
    // Log the response structure for debugging
    console.log('[InstagramStatisticsAPI] Response keys:', Object.keys(data || {}));
    
    // Handle nested data structure (actual API response format)
    // Response: { meta: { code: 200, message: 'OK' }, data: { cid: 'INST:...', usersCount: ..., ... } }
    if (data?.meta?.code === 200 && data?.data?.cid) {
      const profileData = data.data;
      return {
        cid: profileData.cid,
        profile: {
          username: profileData.screenName || cleanUsername,
          fullName: profileData.name || '',
          profilePicUrl: profileData.image || '',
          biography: profileData.description || '',
          followersCount: profileData.usersCount || 0,
          followingCount: 0, // Not provided by this API
          mediaCount: 0, // Not provided by this API
          isVerified: profileData.verified || false,
          isPrivate: profileData.isClosed || false,
        },
      };
    }
    
    // Alternative: check for meta.status === 'ok'
    if (data?.meta?.status === 'ok' && data?.data?.cid) {
      const profileData = data.data;
      return {
        cid: profileData.cid,
        profile: profileData,
      };
    }
    
    // Handle flat structure with cid at root
    if (data?.cid) {
      return {
        cid: data.cid,
        profile: {
          username: data.username || cleanUsername,
          fullName: data.fullName || data.full_name || '',
          profilePicUrl: data.profilePicUrl || data.profile_pic_url || '',
          biography: data.biography || '',
          followersCount: data.followersCount || data.followers_count || data.edge_followed_by?.count || 0,
          followingCount: data.followingCount || data.following_count || data.edge_follow?.count || 0,
          mediaCount: data.mediaCount || data.media_count || data.edge_owner_to_timeline_media?.count || 0,
          isVerified: data.isVerified || data.is_verified || false,
          isPrivate: data.isPrivate || data.is_private || false,
        },
      };
    }
    
    // Handle structure with id instead of cid
    if (data?.id) {
      const cid = `INST:${data.id}`;
      return {
        cid,
        profile: {
          username: data.username || cleanUsername,
          fullName: data.fullName || data.full_name || '',
          profilePicUrl: data.profilePicUrl || data.profile_pic_url || '',
          biography: data.biography || '',
          followersCount: data.followersCount || data.followers_count || data.edge_followed_by?.count || 0,
          followingCount: data.followingCount || data.following_count || data.edge_follow?.count || 0,
          mediaCount: data.mediaCount || data.media_count || data.edge_owner_to_timeline_media?.count || 0,
          isVerified: data.isVerified || data.is_verified || false,
          isPrivate: data.isPrivate || data.is_private || false,
        },
      };
    }

    console.log('[InstagramStatisticsAPI] Profile not found or invalid response structure');
    console.log('[InstagramStatisticsAPI] Response:', JSON.stringify(data).substring(0, 500));
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[InstagramStatisticsAPI] Profile fetch error:', error.response?.status, error.message);
      if (error.response?.data) {
        console.error('[InstagramStatisticsAPI] Error response:', JSON.stringify(error.response.data).substring(0, 300));
      }
    } else {
      console.error('[InstagramStatisticsAPI] Profile fetch error:', error);
    }
    return null;
  }
}

/**
 * Get historical follower data using the Retrospective endpoint
 */
export async function getHistoricalFollowerData(
  username: string,
  days: number = 30
): Promise<HistoricalFollowerData | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log('[InstagramStatisticsAPI] No API key configured, using demo data');
    return null;
  }

  // First, get the profile to obtain the CID
  const profileData = await getInstagramProfile(username);
  if (!profileData) {
    console.log('[InstagramStatisticsAPI] Could not get profile CID');
    return null;
  }

  const { cid, profile } = profileData;

  // Calculate date range
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  try {
    const response = await axios.get<RetrospectiveResponse>(
      `https://${API_HOST}/statistics/retrospective`,
      {
        params: {
          cid: cid,
          from: formatDateForApi(fromDate),
          to: formatDateForApi(toDate),
        },
        headers: {
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': apiKey,
        },
        timeout: 20000,
      }
    );

    // Log response for debugging
    console.log('[InstagramStatisticsAPI] Retrospective response meta:', JSON.stringify(response.data?.meta));
    
    // Check for valid response (code 200 or status 'ok')
    const isValidResponse = response.data?.meta?.code === 200 || response.data?.meta?.status === 'ok';
    const hasData = response.data?.data?.series?.current || response.data?.data?.series;
    
    if (!isValidResponse || !hasData) {
      console.log('[InstagramStatisticsAPI] Invalid response or no data');
      console.log('[InstagramStatisticsAPI] Response data keys:', Object.keys(response.data?.data || {}));
      return null;
    }

    const series = response.data.data.series.current;
    const summary = response.data.data.summary;

    // Transform data points
    const dataPoints = series.map((point, index) => {
      const prevFollowers = index > 0 ? series[index - 1].usersCount : point.usersCount;
      const changePercent = prevFollowers > 0 
        ? ((point.usersCount - prevFollowers) / prevFollowers) * 100 
        : 0;

      return {
        date: parseDateFromApi(point.date),
        followers: point.usersCount,
        change: point.deltaUsersCount,
        changePercent: parseFloat(changePercent.toFixed(3)),
        interactions: point.deltaInteractions,
        likes: point.deltaLikes,
        comments: point.deltaComments,
      };
    });

    // Sort by date ascending
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summary
    const totalGrowth = summary.delta?.usersCount || 
      dataPoints.reduce((sum, p) => sum + p.change, 0);
    const firstFollowers = dataPoints[0]?.followers || 1;
    const totalGrowthPercent = (totalGrowth / firstFollowers) * 100;
    const avgDailyGrowth = totalGrowth / dataPoints.length;
    const totalInteractions = dataPoints.reduce((sum, p) => sum + p.interactions, 0);

    let trend: 'rising' | 'stable' | 'declining';
    if (totalGrowthPercent > 2) trend = 'rising';
    else if (totalGrowthPercent < -1) trend = 'declining';
    else trend = 'stable';

    console.log(`[InstagramStatisticsAPI] Successfully fetched ${dataPoints.length} data points for @${username}`);

    return {
      username: profile.username,
      cid,
      dataPoints,
      summary: {
        totalGrowth,
        totalGrowthPercent: parseFloat(totalGrowthPercent.toFixed(2)),
        avgDailyGrowth: Math.round(avgDailyGrowth),
        totalInteractions,
        trend,
      },
      isReal: true,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[InstagramStatisticsAPI] Retrospective fetch error:', error.response?.status, error.message);
      if (error.response?.status === 429) {
        console.error('[InstagramStatisticsAPI] Rate limit exceeded');
      }
    } else {
      console.error('[InstagramStatisticsAPI] Retrospective fetch error:', error);
    }
    return null;
  }
}

/**
 * Check if the Instagram Statistics API is configured and available
 */
export function isInstagramStatisticsApiConfigured(): boolean {
  return !!getApiKey();
}
