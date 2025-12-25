import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module first
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

// Import after mocking
import {
  saveInstagramProfileSnapshot,
  getCachedInstagramProfile,
  saveInstagramPostsSnapshot,
  getCachedInstagramPosts,
  saveAiAnalysisCache,
  getCachedAiAnalysis,
  saveFollowerSnapshot,
  addToCollectionQueue,
  getCacheStatisticsSummary,
} from "./historicalDataService";

describe("Historical Data Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Instagram Profile History", () => {
    it("should save a profile snapshot without throwing", async () => {
      const profileData = {
        id: "123456",
        full_name: "Test User",
        biography: "Test bio",
        profile_pic_url: "https://example.com/pic.jpg",
        is_verified: true,
        is_business_account: false,
      };

      const metrics = {
        followerCount: 10000,
        followingCount: 500,
        postCount: 100,
        engagementRate: 3.5,
        avgLikes: 350,
        avgComments: 25,
        viralScore: 78,
      };

      // Should not throw
      await expect(
        saveInstagramProfileSnapshot("testuser", profileData, metrics, "api")
      ).resolves.not.toThrow();
    });

    it("should return null for cache miss", async () => {
      const result = await getCachedInstagramProfile("nonexistent_user");
      expect(result).toBeNull();
    });
  });

  describe("Instagram Posts History", () => {
    it("should save posts snapshot without throwing", async () => {
      const posts = [
        {
          id: "post1",
          code: "ABC123",
          caption: "Test caption #test @mention",
          like_count: 100,
          comment_count: 10,
          media_type: 1,
          taken_at: Date.now() / 1000,
        },
      ];

      await expect(
        saveInstagramPostsSnapshot("testuser", posts)
      ).resolves.not.toThrow();
    });

    it("should return null for cache miss on posts", async () => {
      const result = await getCachedInstagramPosts("nonexistent_user");
      expect(result).toBeNull();
    });
  });

  describe("AI Analysis Cache", () => {
    it("should save AI analysis cache without throwing", async () => {
      const analysisData = {
        hapss: { hook: 85, attention: 78 },
        recommendations: ["Post more reels"],
      };

      await expect(
        saveAiAnalysisCache("instagram", "testuser", "profile", analysisData)
      ).resolves.not.toThrow();
    });

    it("should return null for cache miss on AI analysis", async () => {
      const result = await getCachedAiAnalysis("instagram", "nonexistent", "profile");
      expect(result).toBeNull();
    });
  });

  describe("Follower Snapshots", () => {
    it("should save follower snapshot without throwing", async () => {
      await expect(
        saveFollowerSnapshot("instagram", "testuser", {
          followerCount: 10000,
          followingCount: 500,
          postCount: 100,
          engagementRate: 3.5,
        })
      ).resolves.not.toThrow();
    });
  });

  describe("Data Collection Queue", () => {
    it("should add profile to collection queue without throwing", async () => {
      await expect(
        addToCollectionQueue("instagram", "testuser", "daily")
      ).resolves.not.toThrow();
    });
  });

  describe("Cache Statistics", () => {
    it("should return statistics object with required properties", async () => {
      const stats = await getCacheStatisticsSummary(30);
      
      expect(stats).toHaveProperty("totalRequests");
      expect(stats).toHaveProperty("cacheHits");
      expect(stats).toHaveProperty("cacheMisses");
      expect(stats).toHaveProperty("hitRate");
      expect(stats).toHaveProperty("totalCostSaved");
      expect(stats).toHaveProperty("totalActualCost");
      expect(stats).toHaveProperty("byPlatform");
    });
  });
});

describe("Service Function Exports", () => {
  it("should export all required functions", () => {
    expect(saveInstagramProfileSnapshot).toBeDefined();
    expect(getCachedInstagramProfile).toBeDefined();
    expect(saveInstagramPostsSnapshot).toBeDefined();
    expect(getCachedInstagramPosts).toBeDefined();
    expect(saveAiAnalysisCache).toBeDefined();
    expect(getCachedAiAnalysis).toBeDefined();
    expect(saveFollowerSnapshot).toBeDefined();
    expect(addToCollectionQueue).toBeDefined();
    expect(getCacheStatisticsSummary).toBeDefined();
  });
});
