import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Google OAuth Service", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getGoogleAuthUrl", () => {
    it("should generate correct Google OAuth URL when client ID is set", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-client-id";
      
      const { getGoogleAuthUrl } = await import("./googleOAuthService");
      
      const redirectUri = "https://reelspy.ai/api/oauth/google/callback";
      const url = getGoogleAuthUrl(redirectUri);
      
      expect(url).toContain("accounts.google.com");
      expect(url).toContain("client_id=test-client-id");
      expect(url).toContain("redirect_uri=");
      expect(url).toContain("response_type=code");
      expect(url).toContain("scope=");
      
      delete process.env.GOOGLE_CLIENT_ID;
    });

    it("should throw error if GOOGLE_CLIENT_ID is not set", async () => {
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;
      
      vi.resetModules();
      const { getGoogleAuthUrl } = await import("./googleOAuthService");
      
      expect(() => getGoogleAuthUrl("https://example.com/callback")).toThrow("GOOGLE_CLIENT_ID not configured");
      
      if (originalClientId) {
        process.env.GOOGLE_CLIENT_ID = originalClientId;
      }
    });
  });

  describe("verifyGoogleToken", () => {
    it("should return null for invalid Google token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });
      
      const { verifyGoogleToken } = await import("./googleOAuthService");
      
      const result = await verifyGoogleToken("invalid-token");
      expect(result).toBeNull();
    });

    it("should return user info for valid token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sub: "123456789",
          email: "test@example.com",
          name: "Test User",
          picture: "https://example.com/photo.jpg",
          email_verified: "true",
        }),
      });
      
      const { verifyGoogleToken } = await import("./googleOAuthService");
      
      const result = await verifyGoogleToken("valid-token");
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe("123456789");
      expect(result?.email).toBe("test@example.com");
      expect(result?.name).toBe("Test User");
    });
  });

  describe("getGoogleUserInfo", () => {
    it("should return null for invalid access token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      
      const { getGoogleUserInfo } = await import("./googleOAuthService");
      
      const result = await getGoogleUserInfo("invalid-access-token");
      expect(result).toBeNull();
    });

    it("should return user info for valid access token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: "123456789",
          email: "test@example.com",
          name: "Test User",
          picture: "https://example.com/photo.jpg",
          verified_email: true,
        }),
      });
      
      const { getGoogleUserInfo } = await import("./googleOAuthService");
      
      const result = await getGoogleUserInfo("valid-access-token");
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe("123456789");
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("exchangeGoogleCode", () => {
    it("should return null when code exchange fails", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-client-id";
      process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("Invalid code"),
      });
      
      vi.resetModules();
      const { exchangeGoogleCode } = await import("./googleOAuthService");
      
      const result = await exchangeGoogleCode("invalid-code", "https://example.com/callback");
      expect(result).toBeNull();
      
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
    });

    it("should return tokens for valid code", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-client-id";
      process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: "access-token-123",
          id_token: "id-token-456",
        }),
      });
      
      vi.resetModules();
      const { exchangeGoogleCode } = await import("./googleOAuthService");
      
      const result = await exchangeGoogleCode("valid-code", "https://example.com/callback");
      
      expect(result).not.toBeNull();
      expect(result?.accessToken).toBe("access-token-123");
      expect(result?.idToken).toBe("id-token-456");
      
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
    });
  });
});

describe("Apple OAuth Service", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  describe("getAppleAuthUrl", () => {
    it("should generate correct Apple OAuth URL when client ID is set", async () => {
      process.env.APPLE_CLIENT_ID = "com.reelspy.app";
      
      vi.resetModules();
      const { getAppleAuthUrl } = await import("./appleOAuthService");
      
      const redirectUri = "https://reelspy.ai/api/oauth/apple/callback";
      const url = getAppleAuthUrl(redirectUri);
      
      expect(url).toContain("appleid.apple.com");
      expect(url).toContain("client_id=com.reelspy.app");
      expect(url).toContain("redirect_uri=");
      expect(url).toContain("response_type=");
      expect(url).toContain("scope=");
      
      delete process.env.APPLE_CLIENT_ID;
    });

    it("should throw error if APPLE_CLIENT_ID is not set", async () => {
      const originalClientId = process.env.APPLE_CLIENT_ID;
      delete process.env.APPLE_CLIENT_ID;
      
      vi.resetModules();
      const { getAppleAuthUrl } = await import("./appleOAuthService");
      
      expect(() => getAppleAuthUrl("https://example.com/callback")).toThrow("APPLE_CLIENT_ID not configured");
      
      if (originalClientId) {
        process.env.APPLE_CLIENT_ID = originalClientId;
      }
    });
  });

  describe("verifyAppleToken", () => {
    it("should return null for invalid Apple token", async () => {
      const { verifyAppleToken } = await import("./appleOAuthService");
      
      const result = await verifyAppleToken("invalid-token");
      expect(result).toBeNull();
    });
  });
});
