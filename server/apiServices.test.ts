import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Instagram API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export analyzeInstagramAccount function", async () => {
    const { analyzeInstagramAccount } = await import("./instagram");
    expect(typeof analyzeInstagramAccount).toBe("function");
  });

  it("should export fetchInstagramProfile function", async () => {
    const { fetchInstagramProfile } = await import("./instagram");
    expect(typeof fetchInstagramProfile).toBe("function");
  });

  it("should export fetchInstagramPosts function", async () => {
    const { fetchInstagramPosts } = await import("./instagram");
    expect(typeof fetchInstagramPosts).toBe("function");
  });

  it("should export fetchInstagramReels function", async () => {
    const { fetchInstagramReels } = await import("./instagram");
    expect(typeof fetchInstagramReels).toBe("function");
  });

  it("should return analysis with isDemo flag", async () => {
    const { analyzeInstagramAccount } = await import("./instagram");
    
    // Test with a username - should return either real or demo data
    const result = await analyzeInstagramAccount("testuser123456789");
    
    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("reels");
    expect(result).toHaveProperty("metrics");
    expect(result).toHaveProperty("viralScore");
    expect(result).toHaveProperty("viralFactors");
    expect(result).toHaveProperty("isDemo");
    expect(typeof result.isDemo).toBe("boolean");
  }, 60000);
});

describe("TikTok API Service", () => {
  it("should export analyzeTikTokAccount function", async () => {
    const { analyzeTikTokAccount } = await import("./tiktok");
    expect(typeof analyzeTikTokAccount).toBe("function");
  });

  it("should export fetchTikTokProfile function", async () => {
    const { fetchTikTokProfile } = await import("./tiktok");
    expect(typeof fetchTikTokProfile).toBe("function");
  });

  it("should export fetchTikTokVideos function", async () => {
    const { fetchTikTokVideos } = await import("./tiktok");
    expect(typeof fetchTikTokVideos).toBe("function");
  });

  it("should return analysis with isDemo flag", async () => {
    const { analyzeTikTokAccount } = await import("./tiktok");
    
    // Test with a username - should return either real or demo data
    const result = await analyzeTikTokAccount("testuser123456789");
    
    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("videos");
    expect(result).toHaveProperty("analytics");
    expect(typeof result.isDemo).toBe("boolean");
  }, 60000);
});

describe("YouTube API Service", () => {
  it("should export analyzeYouTubeChannel function", async () => {
    const { analyzeYouTubeChannel } = await import("./youtube");
    expect(typeof analyzeYouTubeChannel).toBe("function");
  });

  it("should export fetchYouTubeChannel function", async () => {
    const { fetchYouTubeChannel } = await import("./youtube");
    expect(typeof fetchYouTubeChannel).toBe("function");
  });

  it("should export fetchYouTubeVideos function", async () => {
    const { fetchYouTubeVideos } = await import("./youtube");
    expect(typeof fetchYouTubeVideos).toBe("function");
  });

  it("should return analysis with isDemo flag", async () => {
    const { analyzeYouTubeChannel } = await import("./youtube");
    
    // Test with a channel - should return either real or demo data
    const result = await analyzeYouTubeChannel("@testchannel123456789");
    
    expect(result).toHaveProperty("channel");
    expect(result).toHaveProperty("videos");
    expect(result).toHaveProperty("shorts");
    expect(result).toHaveProperty("analytics");
    expect(typeof result.isDemo).toBe("boolean");
  }, 60000);
});

describe("API Services - Demo Data Fallback", () => {
  it("Instagram demo data should have consistent structure", async () => {
    const { analyzeInstagramAccount } = await import("./instagram");
    
    const result1 = await analyzeInstagramAccount("demotestuser");
    const result2 = await analyzeInstagramAccount("demotestuser");
    
    // Same username should produce consistent results (deterministic)
    if (result1.isDemo && result2.isDemo) {
      expect(result1.profile.username).toBe(result2.profile.username);
      expect(result1.viralScore).toBe(result2.viralScore);
    }
  }, 60000);

  it("TikTok demo data should have consistent structure", async () => {
    const { analyzeTikTokAccount } = await import("./tiktok");
    
    const result1 = await analyzeTikTokAccount("demotestuser");
    const result2 = await analyzeTikTokAccount("demotestuser");
    
    // Same username should produce consistent results (deterministic)
    if (result1.isDemo && result2.isDemo) {
      expect(result1.profile.uniqueId).toBe(result2.profile.uniqueId);
      expect(result1.analytics.viralScore).toBe(result2.analytics.viralScore);
    }
  }, 60000);

  it("YouTube demo data should have consistent structure", async () => {
    const { analyzeYouTubeChannel } = await import("./youtube");
    
    const result1 = await analyzeYouTubeChannel("@demotestchannel");
    const result2 = await analyzeYouTubeChannel("@demotestchannel");
    
    // Same channel should produce consistent results (deterministic)
    if (result1.isDemo && result2.isDemo) {
      expect(result1.channel.title).toBe(result2.channel.title);
      expect(result1.analytics.viralScore).toBe(result2.analytics.viralScore);
    }
  }, 60000);
});
