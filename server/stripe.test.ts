/**
 * Tests for Stripe Integration
 */

import { describe, it, expect } from "vitest";
import { CREDIT_PACKAGES, getPackageById, formatPrice } from "./stripe/products";

describe("Stripe Products", () => {
  describe("CREDIT_PACKAGES", () => {
    it("should have 3 packages defined", () => {
      expect(CREDIT_PACKAGES).toHaveLength(3);
    });

    it("should have starter package with correct values", () => {
      const starter = CREDIT_PACKAGES.find(p => p.id === "starter");
      expect(starter).toBeDefined();
      expect(starter?.credits).toBe(25);
      expect(starter?.price).toBe(1900); // €19 in cents
      expect(starter?.currency).toBe("eur");
    });

    it("should have pro package marked as popular", () => {
      const pro = CREDIT_PACKAGES.find(p => p.id === "pro");
      expect(pro).toBeDefined();
      expect(pro?.isPopular).toBe(true);
      expect(pro?.credits).toBe(100);
      expect(pro?.price).toBe(4900); // €49 in cents
    });

    it("should have business package with highest credits", () => {
      const business = CREDIT_PACKAGES.find(p => p.id === "business");
      expect(business).toBeDefined();
      expect(business?.credits).toBe(350);
      expect(business?.price).toBe(9900); // €99 in cents
    });

    it("all packages should have required fields", () => {
      CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.id).toBeDefined();
        expect(pkg.name).toBeDefined();
        expect(pkg.credits).toBeGreaterThan(0);
        expect(pkg.price).toBeGreaterThan(0);
        expect(pkg.currency).toBe("eur");
        expect(pkg.features).toBeInstanceOf(Array);
        expect(pkg.features.length).toBeGreaterThan(0);
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
  it("should have valid package IDs for checkout", () => {
    const validIds = ["starter", "pro", "business"];
    validIds.forEach(id => {
      const pkg = getPackageById(id);
      expect(pkg).toBeDefined();
    });
  });

  it("packages should have increasing prices", () => {
    const starter = getPackageById("starter");
    const pro = getPackageById("pro");
    const business = getPackageById("business");

    expect(starter?.price).toBeLessThan(pro?.price || 0);
    expect(pro?.price).toBeLessThan(business?.price || 0);
  });

  it("packages should have increasing credits", () => {
    const starter = getPackageById("starter");
    const pro = getPackageById("pro");
    const business = getPackageById("business");

    expect(starter?.credits).toBeLessThan(pro?.credits || 0);
    expect(pro?.credits).toBeLessThan(business?.credits || 0);
  });
});
