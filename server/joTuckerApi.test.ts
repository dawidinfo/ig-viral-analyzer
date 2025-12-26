import { describe, it, expect, beforeAll } from "vitest";
import * as joTuckerApi from "./services/joTuckerInstagramApi";

describe("JoTucker Instagram API", () => {
  beforeAll(() => {
    // Check if API key is configured
    if (!process.env.RAPIDAPI_KEY) {
      console.warn("RAPIDAPI_KEY not set, tests may fail");
    }
  });

  it("should have RAPIDAPI_KEY configured", () => {
    expect(process.env.RAPIDAPI_KEY).toBeDefined();
    expect(process.env.RAPIDAPI_KEY?.length).toBeGreaterThan(0);
  });

  it("should fetch profile for a public account", async () => {
    const profile = await joTuckerApi.getUserInfo("instagram");
    
    // Should return profile data
    expect(profile).not.toBeNull();
    if (profile) {
      expect(profile.username).toBe("instagram");
      expect(profile.follower_count).toBeGreaterThan(0);
      expect(profile.is_verified).toBe(true);
      console.log(`[Test] Instagram profile: ${profile.follower_count} followers`);
    }
  }, 60000); // 60s timeout for API call

  it("should fetch posts for a public account", async () => {
    const posts = await joTuckerApi.getMedias("instagram", 6);
    
    // Should return posts
    expect(Array.isArray(posts)).toBe(true);
    console.log(`[Test] Fetched ${posts.length} posts`);
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      expect(firstPost.id).toBeDefined();
      expect(firstPost.shortcode).toBeDefined();
    }
  }, 60000);

  it("should fetch reels for a public account", async () => {
    const reels = await joTuckerApi.getUserReels("instagram", 6);
    
    // Should return reels (may be empty for some accounts)
    expect(Array.isArray(reels)).toBe(true);
    console.log(`[Test] Fetched ${reels.length} reels`);
  }, 60000);

  it("should analyze a complete profile", async () => {
    const result = await joTuckerApi.analyzeInstagramProfile("cristiano");
    
    expect(result).toBeDefined();
    
    // Profile should be fetched
    if (result.profile) {
      expect(result.profile.username).toBe("cristiano");
      expect(result.profile.follower_count).toBeGreaterThan(0);
      console.log(`[Test] Cristiano: ${result.profile.follower_count} followers, ${result.posts.length} posts, ${result.reels.length} reels`);
    }
  }, 90000); // 90s timeout for full analysis
});
