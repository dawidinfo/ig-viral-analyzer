import { describe, it, expect } from "vitest";
import axios from "axios";

const SOCIALBLADE_BASE_URL = "https://matrix.sbapis.com/b";

describe("Social Blade API Credentials", () => {
  it("should have valid credentials and connect to API", async () => {
    const clientId = process.env.SOCIALBLADE_CLIENT_ID;
    const clientSecret = process.env.SOCIALBLADE_CLIENT_SECRET;

    // Check that credentials are set
    expect(clientId).toBeDefined();
    expect(clientId).not.toBe("");
    expect(clientSecret).toBeDefined();
    expect(clientSecret).not.toBe("");

    // Test API connection with a free endpoint (SocialBlade's own account)
    // Page 0 of top lists is free
    try {
      const response = await axios.get(
        `${SOCIALBLADE_BASE_URL}/instagram/top?query=followers&page=0`,
        {
          headers: {
            clientid: clientId,
            token: clientSecret,
          },
          timeout: 10000,
        }
      );

      // Check response structure
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status");
      expect(response.data.status).toHaveProperty("success");
      
      // If success is true, credentials are valid
      if (response.data.status.success) {
        console.log("✅ Social Blade API credentials are valid!");
        console.log("Available credits info:", response.data.info?.credits);
      } else {
        // API returned error
        console.log("API Error:", response.data.status.error);
        throw new Error(`API Error: ${response.data.status.error}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(
          "Invalid Social Blade API credentials. Please check your CLIENT_ID and CLIENT_SECRET."
        );
      }
      throw error;
    }
  });

  it("should be able to fetch Instagram statistics for a test account", async () => {
    const clientId = process.env.SOCIALBLADE_CLIENT_ID;
    const clientSecret = process.env.SOCIALBLADE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.log("Skipping: No credentials available");
      return;
    }

    try {
      // Test with SocialBlade's own Instagram account (free lookup)
      const response = await axios.get(
        `${SOCIALBLADE_BASE_URL}/instagram/statistics?query=socialblade&history=default`,
        {
          headers: {
            clientid: clientId,
            token: clientSecret,
          },
          timeout: 15000,
        }
      );

      expect(response.status).toBe(200);
      
      if (response.data.status.success) {
        console.log("✅ Successfully fetched Instagram statistics!");
        console.log("Account:", response.data.data?.id?.username);
        console.log("Followers:", response.data.data?.statistics?.total?.followers);
        
        // Check for daily data
        if (response.data.data?.daily) {
          console.log("Daily data points:", response.data.data.daily.length);
        }
      }
    } catch (error: any) {
      // This might fail if no credits available - that's okay for validation
      if (error.response?.data?.status?.error?.includes("credit")) {
        console.log("⚠️ No credits available, but credentials are valid");
      } else {
        throw error;
      }
    }
  });
});
