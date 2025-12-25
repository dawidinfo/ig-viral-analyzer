import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

// Mock the webhook service
vi.mock("./services/webhookService", () => ({
  sendWebhookAlert: vi.fn().mockResolvedValue({ success: true }),
}));

import {
  getCacheStatisticsSummary,
  getCacheStatisticsHistory,
  checkCacheHealthAndAlert,
} from "./services/historicalDataService";

describe("Cache Dashboard Backend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCacheStatisticsSummary", () => {
    it("should return default values when no data exists", async () => {
      const result = await getCacheStatisticsSummary(30);
      
      expect(result).toHaveProperty("totalRequests");
      expect(result).toHaveProperty("cacheHits");
      expect(result).toHaveProperty("cacheMisses");
      expect(result).toHaveProperty("hitRate");
      expect(result).toHaveProperty("totalCostSaved");
      expect(result).toHaveProperty("totalActualCost");
      expect(result).toHaveProperty("byPlatform");
      
      expect(result.totalRequests).toBe(0);
      expect(result.hitRate).toBe(0);
    });

    it("should accept different day ranges", async () => {
      const result7 = await getCacheStatisticsSummary(7);
      const result30 = await getCacheStatisticsSummary(30);
      const result90 = await getCacheStatisticsSummary(90);
      
      expect(result7).toBeDefined();
      expect(result30).toBeDefined();
      expect(result90).toBeDefined();
    });
  });

  describe("getCacheStatisticsHistory", () => {
    it("should return arrays for chart data", async () => {
      const result = await getCacheStatisticsHistory(30);
      
      expect(result).toHaveProperty("dates");
      expect(result).toHaveProperty("hits");
      expect(result).toHaveProperty("misses");
      expect(result).toHaveProperty("hitRates");
      expect(result).toHaveProperty("costSaved");
      expect(result).toHaveProperty("actualCost");
      
      expect(Array.isArray(result.dates)).toBe(true);
      expect(Array.isArray(result.hits)).toBe(true);
      expect(Array.isArray(result.misses)).toBe(true);
      expect(Array.isArray(result.hitRates)).toBe(true);
    });

    it("should return same length arrays", async () => {
      const result = await getCacheStatisticsHistory(7);
      
      const lengths = [
        result.dates.length,
        result.hits.length,
        result.misses.length,
        result.hitRates.length,
        result.costSaved.length,
        result.actualCost.length,
      ];
      
      // All arrays should have the same length
      expect(new Set(lengths).size).toBe(1);
    });
  });

  describe("checkCacheHealthAndAlert", () => {
    it("should return health status object", async () => {
      const result = await checkCacheHealthAndAlert(50);
      
      expect(result).toHaveProperty("healthy");
      expect(result).toHaveProperty("currentHitRate");
      expect(result).toHaveProperty("alertSent");
      expect(result).toHaveProperty("message");
      
      expect(typeof result.healthy).toBe("boolean");
      expect(typeof result.currentHitRate).toBe("number");
      expect(typeof result.alertSent).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });

    it("should accept custom threshold", async () => {
      const result30 = await checkCacheHealthAndAlert(30);
      const result70 = await checkCacheHealthAndAlert(70);
      
      expect(result30).toBeDefined();
      expect(result70).toBeDefined();
    });

    it("should report healthy when no data (not enough requests)", async () => {
      const result = await checkCacheHealthAndAlert(50);
      
      // With mocked empty data, should report not enough data
      expect(result.message).toContain("Nicht genügend Daten");
    });
  });
});

describe("Cache Dashboard API Exports", () => {
  it("should export getCacheStatisticsSummary function", () => {
    expect(getCacheStatisticsSummary).toBeDefined();
    expect(typeof getCacheStatisticsSummary).toBe("function");
  });

  it("should export getCacheStatisticsHistory function", () => {
    expect(getCacheStatisticsHistory).toBeDefined();
    expect(typeof getCacheStatisticsHistory).toBe("function");
  });

  it("should export checkCacheHealthAndAlert function", () => {
    expect(checkCacheHealthAndAlert).toBeDefined();
    expect(typeof checkCacheHealthAndAlert).toBe("function");
  });
});
