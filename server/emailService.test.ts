import { describe, it, expect, vi } from "vitest";

// Mock the email sending to prevent actual emails during tests
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
    },
  })),
}));

describe("Email Service - Resend Integration", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  // DISABLED: This test sends actual emails - use only for manual testing
  it.skip("should successfully send a test email", async () => {
    const { testEmailConnection } = await import("./emailService");
    const result = await testEmailConnection();
    
    // Log result for debugging
    console.log("Email test result:", result);
    
    expect(result.success).toBe(true);
    if (!result.success) {
      console.error("Email test failed:", result.error);
    }
  }, 30000);
});

describe("Welcome Email", () => {
  it("should have sendWelcomeEmail function exported", async () => {
    const emailService = await import("./emailService");
    expect(typeof emailService.sendWelcomeEmail).toBe("function");
  });

  it("should return false when no email is provided", async () => {
    const { sendWelcomeEmail } = await import("./emailService");
    const result = await sendWelcomeEmail("", null);
    expect(result).toBe(false);
  });

  // DISABLED: This test sends actual emails - use only for manual testing
  it.skip("should attempt to send welcome email with valid email", async () => {
    const { sendWelcomeEmail } = await import("./emailService");
    const result = await sendWelcomeEmail("test-welcome@example.com", "Test User");
    expect(typeof result).toBe("boolean");
  }, 30000);
});

describe("Admin Notifications", () => {
  it("should have all notification functions exported", async () => {
    const emailService = await import("./emailService");
    
    expect(typeof emailService.notifyNewSignup).toBe("function");
    expect(typeof emailService.notifyPurchase).toBe("function");
    expect(typeof emailService.notifySuspiciousActivity).toBe("function");
    expect(typeof emailService.notifyAccountBanned).toBe("function");
    expect(typeof emailService.notifyHighUsage).toBe("function");
    expect(typeof emailService.notifyError).toBe("function");
  });

  it("should return notification stats with correct structure", async () => {
    const { getNotificationStats } = await import("./emailService");
    const stats = getNotificationStats();
    
    expect(stats).toHaveProperty("new_signup");
    expect(stats).toHaveProperty("purchase");
    expect(stats).toHaveProperty("suspicious_activity");
    expect(stats).toHaveProperty("account_banned");
    expect(stats).toHaveProperty("high_usage");
    expect(stats).toHaveProperty("error");
  });
});
