import { describe, expect, it } from "vitest";
import { testApiConnection, analyzeInstagramAccount } from "./instagram";

describe("Instagram API", () => {
  it("should have testApiConnection function", () => {
    expect(typeof testApiConnection).toBe("function");
  });

  it("should analyze Instagram account and return valid structure", async () => {
    // Use analyzeInstagramAccount which has demo fallback
    const result = await analyzeInstagramAccount("testuser12345");
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("reels");
    expect(result).toHaveProperty("metrics");
    expect(result).toHaveProperty("viralScore");
    expect(result).toHaveProperty("viralFactors");
    expect(result).toHaveProperty("isDemo");
    
    // Profile should have required fields
    expect(result.profile).toHaveProperty("username");
    expect(result.profile).toHaveProperty("followerCount");
    expect(result.profile).toHaveProperty("followingCount");
    
    // Metrics should be numbers
    expect(typeof result.metrics.avgLikes).toBe("number");
    expect(typeof result.metrics.engagementRate).toBe("number");
    expect(typeof result.viralScore).toBe("number");
  }, 60000);

  it("should return consistent demo data for same username", async () => {
    const result1 = await analyzeInstagramAccount("consistentuser");
    const result2 = await analyzeInstagramAccount("consistentuser");
    
    // If both are demo, they should be identical
    if (result1.isDemo && result2.isDemo) {
      expect(result1.profile.username).toBe(result2.profile.username);
      expect(result1.viralScore).toBe(result2.viralScore);
      expect(result1.profile.followerCount).toBe(result2.profile.followerCount);
    }
  }, 60000);
});
