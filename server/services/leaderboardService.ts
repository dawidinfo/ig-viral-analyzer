import { getDb } from "../db";
import { users, savedAnalyses, referralCodes, creditTransactions } from "../../drizzle/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string | null;
  avatarUrl?: string;
  totalAnalyses: number;
  totalBadges: number;
  totalReferrals: number;
  score: number;
  topBadges: string[];
  plan: string;
  joinedAt: Date;
}

/**
 * Score weights for leaderboard calculation
 */
const SCORE_WEIGHTS = {
  analysis: 10,      // Points per analysis
  badge: 50,         // Points per badge
  referral: 100,     // Points per successful referral
  proPlan: 200,      // Bonus for Pro plan
  businessPlan: 500, // Bonus for Business plan
  enterprisePlan: 1000, // Bonus for Enterprise plan
};

/**
 * Calculate user score for leaderboard
 */
function calculateScore(
  totalAnalyses: number,
  totalBadges: number,
  totalReferrals: number,
  plan: string
): number {
  let score = 0;
  
  score += totalAnalyses * SCORE_WEIGHTS.analysis;
  score += totalBadges * SCORE_WEIGHTS.badge;
  score += totalReferrals * SCORE_WEIGHTS.referral;
  
  // Plan bonuses
  if (plan === "pro") score += SCORE_WEIGHTS.proPlan;
  if (plan === "business") score += SCORE_WEIGHTS.businessPlan;
  if (plan === "enterprise") score += SCORE_WEIGHTS.enterprisePlan;
  
  return score;
}

/**
 * Get top users for leaderboard
 */
export async function getLeaderboard(
  limit: number = 50,
  timeRange: "all" | "month" | "week" = "all"
): Promise<LeaderboardEntry[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all users with their stats
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        plan: users.plan,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.status, "active"));

    const leaderboardData: LeaderboardEntry[] = [];

    for (const user of allUsers) {
      // Get analysis count
      let analysisQuery = db
        .select({ count: sql<number>`COUNT(*)` })
        .from(savedAnalyses)
        .where(eq(savedAnalyses.userId, user.id));

      // Apply time filter
      if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        analysisQuery = db
          .select({ count: sql<number>`COUNT(*)` })
          .from(savedAnalyses)
          .where(
            and(
              eq(savedAnalyses.userId, user.id),
              gte(savedAnalyses.createdAt, monthAgo)
            )
          );
      } else if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        analysisQuery = db
          .select({ count: sql<number>`COUNT(*)` })
          .from(savedAnalyses)
          .where(
            and(
              eq(savedAnalyses.userId, user.id),
              gte(savedAnalyses.createdAt, weekAgo)
            )
          );
      }

      const analysisResult = await analysisQuery;
      const totalAnalyses = analysisResult[0]?.count || 0;

      // Calculate badges based on analysis count (same logic as UserBadges component)
      const badgeMilestones = [1, 5, 10, 25, 50, 100];
      const totalBadges = badgeMilestones.filter(m => totalAnalyses >= m).length;
      
      // Determine top badges based on achievements
      const topBadges: string[] = [];
      if (totalAnalyses >= 100) topBadges.push("analysis_100");
      else if (totalAnalyses >= 50) topBadges.push("analysis_50");
      else if (totalAnalyses >= 25) topBadges.push("analysis_25");
      else if (totalAnalyses >= 10) topBadges.push("analysis_10");
      else if (totalAnalyses >= 5) topBadges.push("analysis_5");
      else if (totalAnalyses >= 1) topBadges.push("first_analysis");
      
      // Check for Pro badge
      if (user.plan !== "free") {
        totalBadges + 1;
        topBadges.push("pro_upgrade");
      }

      // Get referral count
      const referralResult = await db
        .select({ totalReferrals: referralCodes.totalReferrals })
        .from(referralCodes)
        .where(eq(referralCodes.userId, user.id))
        .limit(1);
      const totalReferrals = referralResult[0]?.totalReferrals || 0;

      // Calculate score
      const score = calculateScore(totalAnalyses, totalBadges, totalReferrals, user.plan);

      // Only include users with some activity
      if (score > 0) {
        leaderboardData.push({
          rank: 0, // Will be set after sorting
          userId: user.id,
          name: user.name,
          totalAnalyses,
          totalBadges,
          totalReferrals,
          score,
          topBadges,
          plan: user.plan,
          joinedAt: user.createdAt,
        });
      }
    }

    // Sort by score and assign ranks
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardData.slice(0, limit);
  } catch (error) {
    console.error("[Leaderboard] Error fetching leaderboard:", error);
    return [];
  }
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(userId: number): Promise<{
  rank: number;
  score: number;
  totalUsers: number;
  percentile: number;
}> {
  const leaderboard = await getLeaderboard(1000, "all");
  
  const userEntry = leaderboard.find((e) => e.userId === userId);
  const totalUsers = leaderboard.length;
  
  if (!userEntry) {
    return {
      rank: totalUsers + 1,
      score: 0,
      totalUsers,
      percentile: 0,
    };
  }
  
  const percentile = Math.round(((totalUsers - userEntry.rank + 1) / totalUsers) * 100);
  
  return {
    rank: userEntry.rank,
    score: userEntry.score,
    totalUsers,
    percentile,
  };
}

/**
 * Get leaderboard stats
 */
export async function getLeaderboardStats(): Promise<{
  totalParticipants: number;
  totalAnalyses: number;
  totalBadgesEarned: number;
  topScorer: LeaderboardEntry | null;
}> {
  const leaderboard = await getLeaderboard(100, "all");
  
  const totalParticipants = leaderboard.length;
  const totalAnalyses = leaderboard.reduce((sum, e) => sum + e.totalAnalyses, 0);
  const totalBadgesEarned = leaderboard.reduce((sum, e) => sum + e.totalBadges, 0);
  const topScorer = leaderboard.length > 0 ? leaderboard[0] : null;
  
  return {
    totalParticipants,
    totalAnalyses,
    totalBadgesEarned,
    topScorer,
  };
}

/**
 * Badge definitions for display
 */
export const BADGE_DEFINITIONS: Record<string, { name: string; description: string; icon: string; color: string }> = {
  first_analysis: {
    name: "Erste Analyse",
    description: "Deine erste KI-Analyse durchgeführt",
    icon: "🎯",
    color: "#10B981",
  },
  analysis_5: {
    name: "Analyst",
    description: "5 Analysen durchgeführt",
    icon: "📊",
    color: "#3B82F6",
  },
  analysis_10: {
    name: "Power Analyst",
    description: "10 Analysen durchgeführt",
    icon: "🔥",
    color: "#F59E0B",
  },
  analysis_25: {
    name: "Super Analyst",
    description: "25 Analysen durchgeführt",
    icon: "⚡",
    color: "#8B5CF6",
  },
  analysis_50: {
    name: "Elite Analyst",
    description: "50 Analysen durchgeführt",
    icon: "💎",
    color: "#EC4899",
  },
  analysis_100: {
    name: "Legendary Analyst",
    description: "100 Analysen durchgeführt",
    icon: "👑",
    color: "#EF4444",
  },
  first_note: {
    name: "Notizen-Starter",
    description: "Erste Notiz gespeichert",
    icon: "📝",
    color: "#06B6D4",
  },
  first_content_plan: {
    name: "Content Planer",
    description: "Ersten Content-Plan erstellt",
    icon: "📅",
    color: "#14B8A6",
  },
  first_pdf_export: {
    name: "PDF Profi",
    description: "Ersten PDF-Report exportiert",
    icon: "📄",
    color: "#6366F1",
  },
  pro_upgrade: {
    name: "Pro Member",
    description: "Auf Pro-Plan upgraded",
    icon: "⭐",
    color: "#F59E0B",
  },
  referral_starter: {
    name: "Empfehlungs-Starter",
    description: "5 Freunde geworben",
    icon: "🤝",
    color: "#10B981",
  },
  referral_pro: {
    name: "Empfehlungs-Pro",
    description: "10 Freunde geworben",
    icon: "🌟",
    color: "#3B82F6",
  },
  referral_expert: {
    name: "Empfehlungs-Experte",
    description: "25 Freunde geworben",
    icon: "🏆",
    color: "#8B5CF6",
  },
  referral_master: {
    name: "Empfehlungs-Master",
    description: "50 Freunde geworben",
    icon: "💫",
    color: "#EC4899",
  },
  referral_legend: {
    name: "Empfehlungs-Legende",
    description: "100 Freunde geworben",
    icon: "👑",
    color: "#EF4444",
  },
};
