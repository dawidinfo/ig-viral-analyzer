import { describe, expect, it } from "vitest";
import { testApiConnection, fetchInstagramProfile } from "./instagram";

describe("Instagram API", () => {
  it("should successfully connect to the RapidAPI Instagram service", async () => {
    const isConnected = await testApiConnection();
    expect(isConnected).toBe(true);
  }, 20000);

  it("should fetch profile data for a known account", async () => {
    const profile = await fetchInstagramProfile("instagram");
    
    expect(profile).toBeDefined();
    expect(profile.username).toBe("instagram");
    expect(profile.followerCount).toBeGreaterThan(0);
  }, 20000);
});
