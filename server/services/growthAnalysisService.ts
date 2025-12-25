/**
 * Growth Analysis Service
 * Analyzes follower growth patterns and correlates with posts
 * Uses Instagram Statistics API for real data when DB data is insufficient
 */

import { getDb } from "../db";
import { followerSnapshots, savedAnalyses } from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getHistoricalFollowerData, isInstagramStatisticsApiConfigured } from "./instagramStatisticsApi";

export interface GrowthDay {
  date: string;
  followers: number;
  growth: number;
  growthPercent: number;
  posts: PostOnDay[];
  interactions?: number;
  likes?: number;
  comments?: number;
}

export interface PostOnDay {
  id: string;
  type: 'reel' | 'post' | 'story';
  thumbnail?: string;
  caption?: string;
  likes: number;
  comments: number;
  views?: number;
  engagementRate: number;
  postedAt: string;
}

export interface GrowthAnalysis {
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  period: {
    start: string;
    end: string;
    days: number;
  };
  topGrowthDays: GrowthDay[];
  worstGrowthDays: GrowthDay[];
  averageDailyGrowth: number;
  totalGrowth: number;
  totalGrowthPercent: number;
  bestPerformingPosts: PostOnDay[];
  insights: GrowthInsight[];
  dataSource: 'api' | 'database' | 'mixed';
}

export interface GrowthInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  metric?: string;
}

/**
 * Get top growth days with correlated posts
 * First tries Instagram Statistics API, then falls back to DB data
 */
export async function getGrowthAnalysis(
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube' = 'instagram',
  days: number = 30
): Promise<GrowthAnalysis | null> {
  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  // Try Instagram Statistics API first for Instagram accounts
  if (platform === 'instagram' && isInstagramStatisticsApiConfigured()) {
    const apiData = await getHistoricalFollowerData(cleanUsername, days);
    
    if (apiData && apiData.dataPoints.length >= 2) {
      console.log(`[GrowthAnalysis] Using API data for @${cleanUsername} (${apiData.dataPoints.length} points)`);
      return buildAnalysisFromApiData(apiData, cleanUsername, platform, days, startDate, endDate);
    }
  }

  // Fall back to database data
  return getGrowthAnalysisFromDb(cleanUsername, platform, days, startDate, endDate);
}

/**
 * Build growth analysis from Instagram Statistics API data
 */
async function buildAnalysisFromApiData(
  apiData: any,
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube',
  days: number,
  startDate: Date,
  endDate: Date
): Promise<GrowthAnalysis> {
  // Transform API data points to GrowthDay format
  const growthDays: GrowthDay[] = apiData.dataPoints.map((point: any) => ({
    date: point.date,
    followers: point.followers,
    growth: point.change,
    growthPercent: point.changePercent,
    posts: [],
    interactions: point.interactions,
    likes: point.likes,
    comments: point.comments,
  }));

  // Sort by growth to find top and worst days
  const sortedByGrowth = [...growthDays].sort((a, b) => b.growth - a.growth);
  const topGrowthDays = sortedByGrowth.slice(0, 5);
  const worstGrowthDays = sortedByGrowth.slice(-5).reverse();

  // Try to get posts from saved analyses for correlation
  const db = await getDb();
  if (db) {
    const analyses = await db
      .select()
      .from(savedAnalyses)
      .where(
        and(
          eq(savedAnalyses.username, username),
          gte(savedAnalyses.createdAt, startDate)
        )
      )
      .orderBy(desc(savedAnalyses.createdAt));

    // Extract posts and correlate with growth days
    const allPosts = extractPostsFromAnalyses(analyses);
    correlatePostsWithGrowthDays(topGrowthDays, allPosts);
  }

  // Generate insights
  const insights = generateGrowthInsights(growthDays, topGrowthDays, apiData.summary.avgDailyGrowth);

  return {
    username,
    platform,
    period: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      days
    },
    topGrowthDays,
    worstGrowthDays,
    averageDailyGrowth: apiData.summary.avgDailyGrowth,
    totalGrowth: apiData.summary.totalGrowth,
    totalGrowthPercent: apiData.summary.totalGrowthPercent,
    bestPerformingPosts: [],
    insights,
    dataSource: 'api'
  };
}

/**
 * Get growth analysis from database (original implementation)
 */
async function getGrowthAnalysisFromDb(
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube',
  days: number,
  startDate: Date,
  endDate: Date
): Promise<GrowthAnalysis | null> {
  const db = await getDb();
  if (!db) {
    console.error('[GrowthAnalysis] Database not available');
    return null;
  }

  try {
    // Get follower snapshots for the period
    const snapshots = await db
      .select()
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.platform, platform),
          eq(followerSnapshots.username, username),
          gte(followerSnapshots.snapshotDate, startDate.toISOString().split('T')[0]),
          lte(followerSnapshots.snapshotDate, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(followerSnapshots.snapshotDate);

    if (snapshots.length < 2) {
      console.log(`[GrowthAnalysis] Not enough DB data points for ${username}`);
      return null;
    }

    // Calculate daily growth
    const growthDays: GrowthDay[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const growth = curr.followerCount - prev.followerCount;
      const growthPercent = prev.followerCount > 0 
        ? (growth / prev.followerCount) * 100 
        : 0;

      growthDays.push({
        date: curr.snapshotDate,
        followers: curr.followerCount,
        growth,
        growthPercent: Math.round(growthPercent * 100) / 100,
        posts: []
      });
    }

    // Sort by growth to find top and worst days
    const sortedByGrowth = [...growthDays].sort((a, b) => b.growth - a.growth);
    const topGrowthDays = sortedByGrowth.slice(0, 5);
    const worstGrowthDays = sortedByGrowth.slice(-5).reverse();

    // Get saved analyses to correlate posts
    const analyses = await db
      .select()
      .from(savedAnalyses)
      .where(
        and(
          eq(savedAnalyses.username, username),
          gte(savedAnalyses.createdAt, startDate)
        )
      )
      .orderBy(desc(savedAnalyses.createdAt));

    // Extract posts and correlate
    const allPosts = extractPostsFromAnalyses(analyses);
    correlatePostsWithGrowthDays(topGrowthDays, allPosts);

    // Calculate totals
    const totalGrowth = growthDays.reduce((sum, d) => sum + d.growth, 0);
    const avgDailyGrowth = growthDays.length > 0 ? Math.round(totalGrowth / growthDays.length) : 0;
    const firstFollowers = snapshots[0]?.followerCount || 0;
    const totalGrowthPercent = firstFollowers > 0 
      ? Math.round((totalGrowth / firstFollowers) * 10000) / 100 
      : 0;

    // Sort posts by engagement to find best performing
    const bestPerformingPosts = [...allPosts]
      .sort((a, b) => (b.views || b.likes) - (a.views || a.likes))
      .slice(0, 5);

    // Generate insights
    const insights = generateGrowthInsights(growthDays, topGrowthDays, avgDailyGrowth);

    return {
      username,
      platform,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days
      },
      topGrowthDays,
      worstGrowthDays,
      averageDailyGrowth: avgDailyGrowth,
      totalGrowth,
      totalGrowthPercent,
      bestPerformingPosts,
      insights,
      dataSource: 'database'
    };
  } catch (error) {
    console.error('[GrowthAnalysis] Error:', error);
    return null;
  }
}

/**
 * Extract posts from saved analyses
 */
function extractPostsFromAnalyses(analyses: any[]): PostOnDay[] {
  const allPosts: PostOnDay[] = [];
  
  for (const analysis of analyses) {
    if (analysis.analysisData) {
      try {
        const data = typeof analysis.analysisData === 'string' 
          ? JSON.parse(analysis.analysisData) 
          : analysis.analysisData;
        
        // Extract reels/posts from analysis
        if (data.reels && Array.isArray(data.reels)) {
          for (const reel of data.reels) {
            const postDate = reel.timestamp 
              ? new Date(reel.timestamp).toISOString().split('T')[0]
              : analysis.createdAt?.toISOString().split('T')[0];
            
            allPosts.push({
              id: reel.id || `reel-${Math.random().toString(36).substr(2, 9)}`,
              type: 'reel',
              thumbnail: reel.thumbnail || reel.displayUrl,
              caption: reel.caption?.substring(0, 100),
              likes: reel.likes || 0,
              comments: reel.comments || 0,
              views: reel.views || reel.playCount,
              engagementRate: reel.engagementRate || 0,
              postedAt: postDate || ''
            });
          }
        }
      } catch (e) {
        console.error('[GrowthAnalysis] Error parsing analysis data:', e);
      }
    }
  }
  
  return allPosts;
}

/**
 * Correlate posts with growth days
 */
function correlatePostsWithGrowthDays(growthDays: GrowthDay[], allPosts: PostOnDay[]) {
  for (const day of growthDays) {
    const dayDate = new Date(day.date);
    // Find posts from the day before or same day (posts drive next-day growth)
    const relevantPosts = allPosts.filter(post => {
      if (!post.postedAt) return false;
      const postDate = new Date(post.postedAt);
      const diffDays = Math.abs((dayDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 1;
    });
    day.posts = relevantPosts.slice(0, 3); // Top 3 posts per day
  }
}

/**
 * Generate insights from growth data
 */
function generateGrowthInsights(
  growthDays: GrowthDay[],
  topDays: GrowthDay[],
  avgGrowth: number
): GrowthInsight[] {
  const insights: GrowthInsight[] = [];

  // Best day insight
  if (topDays.length > 0 && topDays[0].growth > 0) {
    const bestDay = topDays[0];
    const dayName = new Date(bestDay.date).toLocaleDateString('de-DE', { weekday: 'long' });
    insights.push({
      type: 'positive',
      title: 'Stärkster Wachstumstag',
      description: `Am ${dayName}, ${new Date(bestDay.date).toLocaleDateString('de-DE')} hast du ${bestDay.growth.toLocaleString('de-DE')} neue Follower gewonnen.`,
      metric: `+${bestDay.growth.toLocaleString('de-DE')}`
    });
  }

  // Weekday pattern
  const weekdayGrowth: { [key: number]: number[] } = {};
  for (const day of growthDays) {
    const weekday = new Date(day.date).getDay();
    if (!weekdayGrowth[weekday]) weekdayGrowth[weekday] = [];
    weekdayGrowth[weekday].push(day.growth);
  }

  const weekdayAvg = Object.entries(weekdayGrowth).map(([day, growths]) => ({
    day: parseInt(day),
    avg: growths.reduce((a, b) => a + b, 0) / growths.length
  })).sort((a, b) => b.avg - a.avg);

  if (weekdayAvg.length > 0) {
    const bestWeekday = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][weekdayAvg[0].day];
    insights.push({
      type: 'neutral',
      title: 'Bester Wochentag',
      description: `${bestWeekday} ist dein stärkster Tag für Follower-Wachstum. Plane wichtige Posts für diesen Tag.`,
      metric: bestWeekday
    });
  }

  // Growth trend
  if (growthDays.length >= 7) {
    const recentWeek = growthDays.slice(-7);
    const previousWeek = growthDays.slice(-14, -7);
    
    if (previousWeek.length > 0) {
      const recentAvg = recentWeek.reduce((a, b) => a + b.growth, 0) / recentWeek.length;
      const previousAvg = previousWeek.reduce((a, b) => a + b.growth, 0) / previousWeek.length;
      
      if (recentAvg > previousAvg * 1.2) {
        insights.push({
          type: 'positive',
          title: 'Wachstum beschleunigt',
          description: 'Dein Follower-Wachstum hat sich in der letzten Woche beschleunigt. Mach weiter so!',
          metric: `+${Math.round((recentAvg / previousAvg - 1) * 100)}%`
        });
      } else if (recentAvg < previousAvg * 0.8) {
        insights.push({
          type: 'negative',
          title: 'Wachstum verlangsamt',
          description: 'Dein Follower-Wachstum hat sich verlangsamt. Probiere neue Content-Formate aus.',
          metric: `${Math.round((recentAvg / previousAvg - 1) * 100)}%`
        });
      }
    }
  }

  // High interaction days
  const daysWithHighInteractions = topDays.filter(d => d.interactions && d.interactions > 0);
  if (daysWithHighInteractions.length > 0) {
    const totalInteractions = daysWithHighInteractions.reduce((sum, d) => sum + (d.interactions || 0), 0);
    insights.push({
      type: 'positive',
      title: 'Engagement-Korrelation',
      description: `Deine Top-Wachstumstage hatten insgesamt ${totalInteractions.toLocaleString('de-DE')} Interaktionen. Hohes Engagement = mehr Follower!`,
      metric: `${totalInteractions.toLocaleString('de-DE')} Interaktionen`
    });
  }

  // Posts with high engagement correlation
  if (topDays.some(d => d.posts.length > 0)) {
    const daysWithPosts = topDays.filter(d => d.posts.length > 0);
    if (daysWithPosts.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Content-Korrelation',
        description: `${daysWithPosts.length} deiner Top-Wachstumstage hatten Posts mit hohem Engagement. Qualitäts-Content zahlt sich aus!`
      });
    }
  }

  return insights;
}

/**
 * Get daily growth data for chart
 */
export async function getDailyGrowthData(
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube' = 'instagram',
  days: number = 30
): Promise<{ date: string; growth: number; followers: number }[]> {
  const cleanUsername = username.toLowerCase().replace('@', '').trim();

  // Try API first for Instagram
  if (platform === 'instagram' && isInstagramStatisticsApiConfigured()) {
    const apiData = await getHistoricalFollowerData(cleanUsername, days);
    if (apiData && apiData.dataPoints.length > 0) {
      return apiData.dataPoints.map(p => ({
        date: p.date,
        growth: p.change,
        followers: p.followers
      }));
    }
  }

  // Fall back to DB
  const db = await getDb();
  if (!db) return [];

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const snapshots = await db
      .select()
      .from(followerSnapshots)
      .where(
        and(
          eq(followerSnapshots.platform, platform),
          eq(followerSnapshots.username, cleanUsername),
          gte(followerSnapshots.snapshotDate, startDate.toISOString().split('T')[0])
        )
      )
      .orderBy(followerSnapshots.snapshotDate);

    const result: { date: string; growth: number; followers: number }[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      result.push({
        date: curr.snapshotDate,
        growth: curr.followerCount - prev.followerCount,
        followers: curr.followerCount
      });
    }

    return result;
  } catch (error) {
    console.error('[GrowthAnalysis] Error getting daily data:', error);
    return [];
  }
}
