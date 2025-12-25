import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        }))
      }))
    }))
  }))
}));

describe("Leaderboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLeaderboard", () => {
    it("should return an empty array when no users exist", async () => {
      const { getLeaderboard } = await import("../services/leaderboardService");
      const result = await getLeaderboard(50, "all");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should accept valid time ranges", async () => {
      const { getLeaderboard } = await import("../services/leaderboardService");
      
      // These should not throw
      await expect(getLeaderboard(50, "all")).resolves.toBeDefined();
      await expect(getLeaderboard(50, "month")).resolves.toBeDefined();
      await expect(getLeaderboard(50, "week")).resolves.toBeDefined();
    });

    it("should respect limit parameter", async () => {
      const { getLeaderboard } = await import("../services/leaderboardService");
      const result = await getLeaderboard(10, "all");
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getUserRank", () => {
    it("should return rank info for a user", async () => {
      const { getUserRank } = await import("../services/leaderboardService");
      const result = await getUserRank(1);
      
      expect(result).toHaveProperty("rank");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("percentile");
    });

    it("should return default values for non-existent user", async () => {
      const { getUserRank } = await import("../services/leaderboardService");
      const result = await getUserRank(99999);
      
      expect(result.score).toBe(0);
      expect(result.percentile).toBe(0);
    });
  });

  describe("getLeaderboardStats", () => {
    it("should return stats object", async () => {
      const { getLeaderboardStats } = await import("../services/leaderboardService");
      const result = await getLeaderboardStats();
      
      expect(result).toHaveProperty("totalParticipants");
      expect(result).toHaveProperty("totalAnalyses");
      expect(result).toHaveProperty("totalBadgesEarned");
      expect(result).toHaveProperty("topScorer");
    });
  });

  describe("BADGE_DEFINITIONS", () => {
    it("should export badge definitions", async () => {
      const { BADGE_DEFINITIONS } = await import("../services/leaderboardService");
      
      expect(BADGE_DEFINITIONS).toBeDefined();
      expect(typeof BADGE_DEFINITIONS).toBe("object");
      
      // Check for expected badges
      expect(BADGE_DEFINITIONS.first_analysis).toBeDefined();
      expect(BADGE_DEFINITIONS.first_analysis.name).toBe("Erste Analyse");
      expect(BADGE_DEFINITIONS.first_analysis.icon).toBe("🎯");
    });

    it("should have required properties for each badge", async () => {
      const { BADGE_DEFINITIONS } = await import("../services/leaderboardService");
      
      Object.values(BADGE_DEFINITIONS).forEach((badge) => {
        expect(badge).toHaveProperty("name");
        expect(badge).toHaveProperty("description");
        expect(badge).toHaveProperty("icon");
        expect(badge).toHaveProperty("color");
      });
    });
  });
});

describe("Affiliate Service - Milestone Rewards", () => {
  describe("AFFILIATE_CONFIG", () => {
    it("should have milestone rewards configured", async () => {
      const { AFFILIATE_CONFIG } = await import("../../drizzle/schema");
      
      expect(AFFILIATE_CONFIG.milestoneRewards).toBeDefined();
      expect(Array.isArray(AFFILIATE_CONFIG.milestoneRewards)).toBe(true);
      expect(AFFILIATE_CONFIG.milestoneRewards.length).toBeGreaterThan(0);
    });

    it("should have correct milestone structure", async () => {
      const { AFFILIATE_CONFIG } = await import("../../drizzle/schema");
      
      AFFILIATE_CONFIG.milestoneRewards.forEach((milestone) => {
        expect(milestone).toHaveProperty("referrals");
        expect(milestone).toHaveProperty("bonus");
        expect(milestone).toHaveProperty("badge");
        expect(typeof milestone.referrals).toBe("number");
        expect(typeof milestone.bonus).toBe("number");
        expect(typeof milestone.badge).toBe("string");
      });
    });

    it("should have referredUserBonus configured", async () => {
      const { AFFILIATE_CONFIG } = await import("../../drizzle/schema");
      
      expect(AFFILIATE_CONFIG.referredUserBonus).toBeDefined();
      expect(typeof AFFILIATE_CONFIG.referredUserBonus).toBe("number");
      expect(AFFILIATE_CONFIG.referredUserBonus).toBe(50);
    });
  });
});

describe("Cron Jobs", () => {
  describe("runDailyDripCampaign", () => {
    it("should export runDailyDripCampaign function", async () => {
      const cronJobs = await import("../cronJobs");
      expect(typeof cronJobs.runDailyDripCampaign).toBe("function");
    });

    it("should return result object", async () => {
      const { runDailyDripCampaign } = await import("../cronJobs");
      const result = await runDailyDripCampaign();
      
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
    });
  });

  describe("runDailyFollowerTracking", () => {
    it("should export runDailyFollowerTracking function", async () => {
      const cronJobs = await import("../cronJobs");
      expect(typeof cronJobs.runDailyFollowerTracking).toBe("function");
    });
  });

  describe("getCronJobStatus", () => {
    it("should return status for all jobs", async () => {
      const { getCronJobStatus } = await import("../cronJobs");
      const status = getCronJobStatus();
      
      expect(status).toHaveProperty("dripCampaign");
      expect(status).toHaveProperty("followerTracking");
      expect(status).toHaveProperty("weeklyReports");
    });
  });
});
