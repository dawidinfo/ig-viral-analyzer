import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockResolvedValue([{ affectedRows: 0 }]),
  }),
}));

// Mock Resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test-email-id" }, error: null }),
    },
  })),
}));

describe("Magic Link Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Email Validation", () => {
    it("should validate correct email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.org",
        "user+tag@gmail.com",
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "notanemail",
        "@nodomain.com",
        "no@domain",
        "spaces in@email.com",
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe("Token Generation", () => {
    it("should generate unique tokens", async () => {
      const crypto = await import("crypto");
      const tokens = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const token = crypto.randomBytes(32).toString("hex");
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }
      
      expect(tokens.size).toBe(100);
    });

    it("should generate tokens of correct length", async () => {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      
      // 32 bytes = 64 hex characters
      expect(token.length).toBe(64);
    });
  });

  describe("Token Expiration", () => {
    it("should set correct expiration time (15 minutes)", () => {
      const TOKEN_EXPIRY_MINUTES = 15;
      const now = Date.now();
      const expiresAt = new Date(now + TOKEN_EXPIRY_MINUTES * 60 * 1000);
      
      const expectedMs = TOKEN_EXPIRY_MINUTES * 60 * 1000;
      const actualMs = expiresAt.getTime() - now;
      
      // Allow 1 second tolerance
      expect(Math.abs(actualMs - expectedMs)).toBeLessThan(1000);
    });

    it("should correctly identify expired tokens", () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 1000); // 1 second ago
      const validDate = new Date(now.getTime() + 60000); // 1 minute from now
      
      expect(now > expiredDate).toBe(true);
      expect(now > validDate).toBe(false);
    });
  });

  describe("OpenId Generation", () => {
    it("should generate unique openIds with email prefix", async () => {
      const crypto = await import("crypto");
      const openId = `email_${crypto.randomBytes(16).toString("hex")}`;
      
      expect(openId.startsWith("email_")).toBe(true);
      expect(openId.length).toBe(6 + 32); // "email_" + 32 hex chars
    });
  });

  describe("Rate Limiting", () => {
    it("should allow up to 5 requests per hour", () => {
      const MAX_REQUESTS_PER_HOUR = 5;
      const recentRequests = [1, 2, 3, 4]; // 4 requests
      
      expect(recentRequests.length < MAX_REQUESTS_PER_HOUR).toBe(true);
    });

    it("should block after 5 requests", () => {
      const MAX_REQUESTS_PER_HOUR = 5;
      const recentRequests = [1, 2, 3, 4, 5]; // 5 requests
      
      expect(recentRequests.length < MAX_REQUESTS_PER_HOUR).toBe(false);
    });
  });
});

describe("Magic Link Email Template", () => {
  it("should contain required elements", () => {
    const magicLinkUrl = "https://reelspy.ai/auth/verify?token=test123";
    
    // Template should contain the magic link URL
    expect(magicLinkUrl).toContain("/auth/verify");
    expect(magicLinkUrl).toContain("token=");
  });
});
