import { describe, it, expect } from "vitest";
import { testEmailConnection } from "./emailService";

describe("Email Service - Resend Integration", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it("should successfully send a test email", async () => {
    const result = await testEmailConnection();
    
    // Log result for debugging
    console.log("Email test result:", result);
    
    expect(result.success).toBe(true);
    if (!result.success) {
      console.error("Email test failed:", result.error);
    }
  }, 30000); // 30 second timeout for email sending
});
