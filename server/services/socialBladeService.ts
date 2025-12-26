/**
 * Social Blade API Service
 * Provides historical follower data for Instagram accounts
 * 
 * API Documentation: https://socialblade.com/developers/docs
 * Base URL: https://matrix.sbapis.com/b
 */

import axios, { AxiosInstance } from "axios";

const SOCIALBLADE_BASE_URL = "https://matrix.sbapis.com/b";

// History options and their credit costs
export type HistoryOption = "default" | "extended" | "archive" | "vault";

const HISTORY_OPTIONS: Record<HistoryOption, { credits: number; days: string }> = {
  default: { credits: 1, days: "30 days" },
  extended: { credits: 2, days: "1 year" },
  archive: { credits: 3, days: "3 years" },
  vault: { credits: 5, days: "10 years" },
};

// Response types
export interface SocialBladeResponse<T> {
  status: {
    success: boolean;
    status: number;
    error?: string;
  };
  info?: {
    access: {
      seconds_to_expire: number;
    };
    credits: {
      available: number;
    };
  };
  data?: T;
}

export interface InstagramStatistics {
  id: {
    id: string;
    username?: string;
    display_name: string;
  };
  general: {
    branding: {
      avatar: string;
      website?: string;
    };
    media: {
      recent: Record<string, unknown>;
    };
  };
  statistics: {
    total: {
      followers: number;
      following: number;
      media: number;
      engagement_rate: number;
    };
    growth: {
      followers: Record<string, number>;
      media: Record<string, number>;
    };
  };
  misc: {
    grade: {
      color: string;
      grade: string;
    };
    sb_verified: boolean;
  };
  ranks: Record<string, unknown>;
  daily: DailyData[];
}

export interface DailyData {
  date: string;
  followers: number;
  following: number;
  media: number;
  avg_likes: number;
  avg_comments: number;
}

export interface FollowerGrowthData {
  date: string;
  followers: number;
  change: number;
  following?: number;
  media?: number;
  avgLikes?: number;
  avgComments?: number;
}

export interface GrowthSummary {
  day1: number;
  day3: number;
  day7: number;
  day14: number;
  day30: number;
  day60?: number;
  day90?: number;
  day180?: number;
  day365?: number;
}

class SocialBladeService {
  private client: AxiosInstance;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.SOCIALBLADE_CLIENT_ID || "";
    this.clientSecret = process.env.SOCIALBLADE_CLIENT_SECRET || "";

    this.client = axios.create({
      baseURL: SOCIALBLADE_BASE_URL,
      timeout: 15000,
      headers: {
        clientid: this.clientId,
        token: this.clientSecret,
      },
    });
  }

  /**
   * Check if Social Blade API is configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Get available credits
   */
  async getCredits(): Promise<number> {
    if (!this.isConfigured()) {
      return 0;
    }

    try {
      // Use free endpoint to check credits
      const response = await this.client.get<SocialBladeResponse<unknown>>(
        "/instagram/top?query=followers&page=0"
      );
      return response.data.info?.credits?.available || 0;
    } catch (error) {
      console.error("[SocialBlade] Failed to get credits:", error);
      return 0;
    }
  }

  /**
   * Fetch Instagram statistics with historical data
   * @param username Instagram username
   * @param history History depth option (default: 30 days)
   */
  async getInstagramStatistics(
    username: string,
    history: HistoryOption = "default"
  ): Promise<InstagramStatistics | null> {
    if (!this.isConfigured()) {
      console.warn("[SocialBlade] API not configured");
      return null;
    }

    try {
      console.log(`[SocialBlade] Fetching statistics for @${username} (${HISTORY_OPTIONS[history].days})`);
      
      const response = await this.client.get<SocialBladeResponse<InstagramStatistics>>(
        `/instagram/statistics`,
        {
          params: {
            query: username,
            history: history,
            "allow-stale": false,
          },
        }
      );

      if (!response.data.status.success) {
        console.error("[SocialBlade] API error:", response.data.status.error);
        return null;
      }

      console.log(`[SocialBlade] Successfully fetched data for @${username}`);
      console.log(`[SocialBlade] Credits remaining: ${response.data.info?.credits?.available}`);

      return response.data.data || null;
    } catch (error: any) {
      console.error("[SocialBlade] Request failed:", error.message);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error("[SocialBlade] Invalid credentials");
      } else if (error.response?.data?.status?.error) {
        console.error("[SocialBlade] API Error:", error.response.data.status.error);
      }
      
      return null;
    }
  }

  /**
   * Get historical follower growth data formatted for charts
   * @param username Instagram username
   * @param history History depth option
   */
  async getFollowerGrowthHistory(
    username: string,
    history: HistoryOption = "default"
  ): Promise<{
    daily: FollowerGrowthData[];
    summary: GrowthSummary;
    currentFollowers: number;
    engagementRate: number;
  } | null> {
    const stats = await this.getInstagramStatistics(username, history);
    
    if (!stats || !stats.daily || stats.daily.length === 0) {
      return null;
    }

    // Sort daily data by date (oldest first)
    const sortedDaily = [...stats.daily].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate daily changes
    const dailyWithChanges: FollowerGrowthData[] = sortedDaily.map((day, index) => {
      const prevDay = index > 0 ? sortedDaily[index - 1] : null;
      const change = prevDay ? day.followers - prevDay.followers : 0;

      return {
        date: day.date,
        followers: day.followers,
        change: change,
        following: day.following,
        media: day.media,
        avgLikes: day.avg_likes,
        avgComments: day.avg_comments,
      };
    });

    // Build growth summary from API data
    const growth = stats.statistics.growth.followers;
    const summary: GrowthSummary = {
      day1: growth["1"] || 0,
      day3: growth["3"] || 0,
      day7: growth["7"] || 0,
      day14: growth["14"] || 0,
      day30: growth["30"] || 0,
      day60: growth["60"],
      day90: growth["90"],
      day180: growth["180"],
      day365: growth["365"],
    };

    return {
      daily: dailyWithChanges,
      summary: summary,
      currentFollowers: stats.statistics.total.followers,
      engagementRate: stats.statistics.total.engagement_rate,
    };
  }

  /**
   * Get credit cost for a history option
   */
  getCreditCost(history: HistoryOption): number {
    return HISTORY_OPTIONS[history].credits;
  }

  /**
   * Get available history options with costs
   */
  getHistoryOptions(): typeof HISTORY_OPTIONS {
    return HISTORY_OPTIONS;
  }
}

// Export singleton instance
export const socialBladeService = new SocialBladeService();
