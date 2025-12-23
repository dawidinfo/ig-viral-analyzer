import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with credit system and platform modules.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "support"]).default("user").notNull(),
  /** User's subscription plan */
  plan: mysqlEnum("plan", ["free", "starter", "pro", "business", "enterprise"]).default("free").notNull(),
  /** Current credit balance */
  credits: int("credits").default(10).notNull(),
  /** Total credits ever purchased */
  totalCreditsPurchased: int("totalCreditsPurchased").default(0).notNull(),
  /** Stripe customer ID for billing */
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  /** Subscription end date */
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  /** Platform modules enabled */
  modulesEnabled: json("modulesEnabled").$type<string[]>(),
  /** Account status */
  status: mysqlEnum("status", ["active", "suspended", "banned"]).default("active").notNull(),
  /** Reason for suspension/ban */
  statusReason: text("statusReason"),
  /** Last activity timestamp */
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credit transactions - tracks all credit changes
 */
export const creditTransactions = mysqlTable("credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Type: purchase, usage, refund, bonus, admin_adjustment */
  type: mysqlEnum("type", ["purchase", "usage", "refund", "bonus", "admin_adjustment"]).notNull(),
  /** Amount (positive for additions, negative for usage) */
  amount: int("amount").notNull(),
  /** Balance after transaction */
  balanceAfter: int("balanceAfter").notNull(),
  /** Description of the transaction */
  description: varchar("description", { length: 255 }).notNull(),
  /** Related action type if usage */
  actionType: varchar("actionType", { length: 64 }),
  /** Platform used (instagram, tiktok, youtube) */
  platform: varchar("platform", { length: 32 }),
  /** Reference ID (e.g., Stripe payment ID) */
  referenceId: varchar("referenceId", { length: 128 }),
  /** Admin who made adjustment (if applicable) */
  adminId: int("adminId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Credit packages available for purchase
 */
export const creditPackages = mysqlTable("credit_packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  credits: int("credits").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  /** Price per credit for display */
  pricePerCredit: decimal("pricePerCredit", { precision: 10, scale: 4 }),
  /** Stripe price ID */
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  /** Is this a subscription or one-time? */
  isSubscription: int("isSubscription").default(0).notNull(),
  /** Popular badge */
  isPopular: int("isPopular").default(0).notNull(),
  /** Sort order */
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = typeof creditPackages.$inferInsert;

/**
 * Platform modules (Instagram, TikTok, YouTube)
 */
export const platformModules = mysqlTable("platform_modules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  description: text("description"),
  /** Monthly price (0 for included) */
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  /** Stripe price ID for subscription */
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  /** Is this module included in base plan? */
  isIncluded: int("isIncluded").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlatformModule = typeof platformModules.$inferSelect;
export type InsertPlatformModule = typeof platformModules.$inferInsert;

/**
 * User module subscriptions
 */
export const userModules = mysqlTable("user_modules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  moduleId: int("moduleId").notNull(),
  /** Stripe subscription ID */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserModule = typeof userModules.$inferSelect;
export type InsertUserModule = typeof userModules.$inferInsert;

/**
 * Admin audit log - tracks all admin actions
 */
export const adminAuditLog = mysqlTable("admin_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  targetType: varchar("targetType", { length: 32 }), // user, transaction, etc.
  targetId: int("targetId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

/**
 * Flagged accounts - accounts flagged for review
 */
export const flaggedAccounts = mysqlTable("flagged_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reason: mysqlEnum("reason", ["adult_content", "spam", "abuse", "fraud", "other"]).notNull(),
  details: text("details"),
  /** Instagram/TikTok/YouTube username that triggered flag */
  flaggedUsername: varchar("flaggedUsername", { length: 128 }),
  platform: varchar("platform", { length: 32 }),
  status: mysqlEnum("status", ["pending", "reviewed", "dismissed", "actioned"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  actionTaken: text("actionTaken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlaggedAccount = typeof flaggedAccounts.$inferSelect;
export type InsertFlaggedAccount = typeof flaggedAccounts.$inferInsert;

/**
 * Revenue tracking - daily revenue stats
 */
export const revenueTracking = mysqlTable("revenue_tracking", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  /** Total revenue in cents */
  totalRevenue: int("totalRevenue").default(0).notNull(),
  /** Number of transactions */
  transactionCount: int("transactionCount").default(0).notNull(),
  /** New subscribers */
  newSubscribers: int("newSubscribers").default(0).notNull(),
  /** Churned subscribers */
  churnedSubscribers: int("churnedSubscribers").default(0).notNull(),
  /** Credit purchases */
  creditPurchases: int("creditPurchases").default(0).notNull(),
  /** Module subscriptions */
  moduleSubscriptions: int("moduleSubscriptions").default(0).notNull(),
  /** Estimated costs (API calls) */
  estimatedCosts: int("estimatedCosts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueTracking = typeof revenueTracking.$inferSelect;
export type InsertRevenueTracking = typeof revenueTracking.$inferInsert;

/**
 * Cache table for Instagram analysis results.
 */
export const instagramCache = mysqlTable("instagram_cache", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  profileData: json("profileData"),
  postsData: json("postsData"),
  reelsData: json("reelsData"),
  analysisData: json("analysisData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type InstagramCache = typeof instagramCache.$inferSelect;
export type InsertInstagramCache = typeof instagramCache.$inferInsert;

/**
 * TikTok cache table
 */
export const tiktokCache = mysqlTable("tiktok_cache", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  profileData: json("profileData"),
  videosData: json("videosData"),
  analysisData: json("analysisData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type TikTokCache = typeof tiktokCache.$inferSelect;
export type InsertTikTokCache = typeof tiktokCache.$inferInsert;

/**
 * YouTube cache table
 */
export const youtubeCache = mysqlTable("youtube_cache", {
  id: int("id").autoincrement().primaryKey(),
  channelId: varchar("channelId", { length: 64 }).notNull().unique(),
  channelData: json("channelData"),
  videosData: json("videosData"),
  analysisData: json("analysisData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type YouTubeCache = typeof youtubeCache.$inferSelect;
export type InsertYouTubeCache = typeof youtubeCache.$inferInsert;

/**
 * Saved analyses table
 */
export const savedAnalyses = mysqlTable("saved_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube"]).default("instagram").notNull(),
  username: varchar("username", { length: 64 }).notNull(),
  profilePicUrl: text("profilePicUrl"),
  fullName: text("fullName"),
  followerCount: int("followerCount"),
  viralScore: int("viralScore"),
  engagementRate: varchar("engagementRate", { length: 16 }),
  analysisData: json("analysisData"),
  notes: text("notes"),
  isFavorite: int("isFavorite").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type InsertSavedAnalysis = typeof savedAnalyses.$inferInsert;

/**
 * Usage tracking table
 */
export const usageTracking = mysqlTable("usage_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  actionType: varchar("actionType", { length: 32 }).notNull(),
  platform: varchar("platform", { length: 32 }).default("instagram").notNull(),
  usageMonth: varchar("usageMonth", { length: 7 }).notNull(),
  count: int("count").default(0).notNull(),
  creditsUsed: int("creditsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

/**
 * Rate limiting table
 */
export const rateLimits = mysqlTable("rate_limits", {
  id: int("id").autoincrement().primaryKey(),
  identifier: varchar("identifier", { length: 128 }).notNull(), // userId or IP
  identifierType: mysqlEnum("identifierType", ["user", "ip"]).notNull(),
  endpoint: varchar("endpoint", { length: 128 }).notNull(),
  requestCount: int("requestCount").default(0).notNull(),
  windowStart: timestamp("windowStart").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;

/**
 * Credit costs per action
 */
export const CREDIT_COSTS = {
  // Instagram
  instagram_basic_analysis: 1,
  instagram_deep_analysis: 3,
  instagram_reel_analysis: 2,
  // TikTok
  tiktok_basic_analysis: 1,
  tiktok_deep_analysis: 3,
  tiktok_video_analysis: 2,
  // YouTube
  youtube_basic_analysis: 2,
  youtube_deep_analysis: 5,
  youtube_video_analysis: 3,
  // General
  pdf_export: 1,
  competitor_comparison: 2,
  ai_recommendations: 2,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

/**
 * Credit packages configuration
 */
export const CREDIT_PACKAGES = {
  starter: { credits: 25, price: 9, pricePerCredit: 0.36 },
  pro: { credits: 100, price: 29, pricePerCredit: 0.29 },
  business: { credits: 350, price: 79, pricePerCredit: 0.23 },
  enterprise: { credits: 1000, price: 199, pricePerCredit: 0.20 },
} as const;

/**
 * Platform module pricing
 */
export const MODULE_PRICING = {
  instagram: { price: 0, included: true },
  tiktok: { price: 9, included: false },
  youtube: { price: 9, included: false },
  bundle: { price: 15, included: false }, // All platforms
} as const;

/**
 * Forbidden content keywords for auto-flagging
 */
export const FORBIDDEN_KEYWORDS = [
  "onlyfans", "fansly", "porn", "xxx", "adult", "nsfw", "18+",
  "escort", "sex", "nude", "naked", "cam girl", "cam boy",
  "sugar daddy", "sugar baby", "hookup"
] as const;

/**
 * Admin emails that have access to admin dashboard
 */
export const ADMIN_EMAILS = [
  // Add your admin emails here
] as const;

export type PlanType = "free" | "starter" | "pro" | "business" | "enterprise";
export type PlatformType = "instagram" | "tiktok" | "youtube";


/**
 * Legacy plan limits for backward compatibility
 * Will be replaced by credit system
 */
export const PLAN_LIMITS = {
  free: {
    analyses: 3,
    aiAnalyses: 1,
    pdfExports: 0,
    comparisons: 1,
    savedAnalyses: 5,
  },
  starter: {
    analyses: 30,
    aiAnalyses: 15,
    pdfExports: 10,
    comparisons: 10,
    savedAnalyses: 50,
  },
  pro: {
    analyses: 100,
    aiAnalyses: 50,
    pdfExports: 50,
    comparisons: 50,
    savedAnalyses: 200,
  },
  business: {
    analyses: 300,
    aiAnalyses: 150,
    pdfExports: 150,
    comparisons: 100,
    savedAnalyses: 500,
  },
  enterprise: {
    analyses: -1, // unlimited
    aiAnalyses: -1,
    pdfExports: -1,
    comparisons: -1,
    savedAnalyses: -1,
  },
} as const;


/**
 * Follower snapshots - stores daily follower counts for tracking history
 * This enables real historical data over time instead of demo data
 */
export const followerSnapshots = mysqlTable("follower_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  /** Platform: instagram, tiktok, youtube */
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube"]).notNull(),
  /** Username or channel ID */
  username: varchar("username", { length: 128 }).notNull(),
  /** Follower/subscriber count at snapshot time */
  followerCount: int("followerCount").notNull(),
  /** Following count (Instagram/TikTok) */
  followingCount: int("followingCount"),
  /** Post/video count */
  postCount: int("postCount"),
  /** Total likes/hearts (TikTok) */
  totalLikes: int("totalLikes"),
  /** Total views (YouTube) */
  totalViews: int("totalViews"),
  /** Engagement rate at time of snapshot */
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }),
  /** Date of snapshot (YYYY-MM-DD) */
  snapshotDate: varchar("snapshotDate", { length: 10 }).notNull(),
  /** Is this from real API data or demo? */
  isRealData: int("isRealData").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FollowerSnapshot = typeof followerSnapshots.$inferSelect;
export type InsertFollowerSnapshot = typeof followerSnapshots.$inferInsert;
