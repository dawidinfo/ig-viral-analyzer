/**
 * Tests for Stripe Integration
 */

import { describe, it, expect } from "vitest";
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS, getPackageById, getPlanById, formatPrice } from "./stripe/products";

describe("Stripe Products", () => {
  describe("SUBSCRIPTION_PLANS", () => {
    it("should have 4 plans defined", () => {
      expect(SUBSCRIPTION_PLANS).toHaveLength(4);
    });

    it("should have starter plan with correct values", () => {
      const starter = getPlanById("starter");
      expect(starter).toBeDefined();
      expect(starter?.analysesPerMonth).toBe(10);
      expect(starter?.monthlyPrice).toBe(1900); // €19 in cents
      expect(starter?.currency).toBe("eur");
    });

    it("should have pro plan marked as popular", () => {
      const pro = getPlanById("pro");
      expect(pro).toBeDefined();
      expect(pro?.isPopular).toBe(true);
      expect(pro?.analysesPerMonth).toBe(35);
      expect(pro?.monthlyPrice).toBe(4900); // €49 in cents
    });

    it("should have business plan with correct values", () => {
      const business = getPlanById("business");
      expect(business).toBeDefined();
      expect(business?.analysesPerMonth).toBe(100);
      expect(business?.monthlyPrice).toBe(9900); // €99 in cents
    });

    it("should have enterprise plan with unlimited analyses", () => {
      const enterprise = getPlanById("enterprise");
      expect(enterprise).toBeDefined();
      expect(enterprise?.analysesPerMonth).toBe(-1); // Unlimited
      expect(enterprise?.monthlyPrice).toBe(29900); // €299 in cents
    });

    it("all plans should have required fields", () => {
      SUBSCRIPTION_PLANS.forEach(plan => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.monthlyPrice).toBeGreaterThan(0);
        expect(plan.yearlyPrice).toBeGreaterThan(0);
        expect(plan.currency).toBe("eur");
        expect(plan.features).toBeInstanceOf(Array);
        expect(plan.features.length).toBeGreaterThan(0);
        expect(plan.stripePriceIdMonthly).toBeDefined();
        expect(plan.stripePriceIdYearly).toBeDefined();
      });
    });
  });

  describe("CREDIT_PACKAGES (Legacy)", () => {
    it("should map from subscription plans", () => {
      expect(CREDIT_PACKAGES.length).toBe(SUBSCRIPTION_PLANS.length);
    });

    it("should have correct structure", () => {
      CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.id).toBeDefined();
        expect(pkg.name).toBeDefined();
        expect(pkg.price).toBeGreaterThan(0);
        expect(pkg.currency).toBe("eur");
      });
    });
  });

  describe("getPackageById", () => {
    it("should return starter package", () => {
      const pkg = getPackageById("starter");
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe("starter");
    });

    it("should return pro package", () => {
      const pkg = getPackageById("pro");
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe("pro");
    });

    it("should return business package", () => {
      const pkg = getPackageById("business");
      expect(pkg).toBeDefined();
      expect(pkg?.id).toBe("business");
    });

    it("should return undefined for invalid id", () => {
      const pkg = getPackageById("invalid");
      expect(pkg).toBeUndefined();
    });
  });

  describe("formatPrice", () => {
    it("should format EUR price correctly", () => {
      const formatted = formatPrice(1900, "eur");
      expect(formatted).toContain("19");
      expect(formatted).toContain("€");
    });

    it("should format USD price correctly", () => {
      const formatted = formatPrice(2500, "usd");
      expect(formatted).toContain("25");
      expect(formatted).toContain("$");
    });

    it("should handle zero price", () => {
      const formatted = formatPrice(0, "eur");
      expect(formatted).toContain("0");
    });
  });
});

describe("Stripe Checkout Flow", () => {
  it("should have valid plan IDs for checkout", () => {
    const validIds = ["starter", "pro", "business", "enterprise"];
    validIds.forEach(id => {
      const plan = getPlanById(id);
      expect(plan).toBeDefined();
    });
  });

  it("plans should have increasing prices", () => {
    const starter = getPlanById("starter");
    const pro = getPlanById("pro");
    const business = getPlanById("business");
    const enterprise = getPlanById("enterprise");

    expect(starter?.monthlyPrice).toBeLessThan(pro?.monthlyPrice || 0);
    expect(pro?.monthlyPrice).toBeLessThan(business?.monthlyPrice || 0);
    expect(business?.monthlyPrice).toBeLessThan(enterprise?.monthlyPrice || 0);
  });

  it("plans should have increasing analyses (except enterprise)", () => {
    const starter = getPlanById("starter");
    const pro = getPlanById("pro");
    const business = getPlanById("business");

    expect(starter?.analysesPerMonth).toBeLessThan(pro?.analysesPerMonth || 0);
    expect(pro?.analysesPerMonth).toBeLessThan(business?.analysesPerMonth || 0);
  });
});
