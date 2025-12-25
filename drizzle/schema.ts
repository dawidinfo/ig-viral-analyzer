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
  /** Stripe subscription ID */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  /** Subscription status */
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "past_due", "cancelling", "cancelled", "trialing"]).default("active"),
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
  /** E-Mail opt-out flag */
  emailOptOut: int("emailOptOut").default(0).notNull(),
  /** Last drip email sent (1-4) */
  lastDripEmailSent: int("lastDripEmailSent").default(0).notNull(),
  /** Timestamp of last drip email */
  lastDripEmailAt: timestamp("lastDripEmailAt"),
  /** A/B test variant assigned (A or B) */
  emailVariant: varchar("emailVariant", { length: 1 }),
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


/**
 * Referral/Affiliate System
 * Users can refer others and earn credits when referrals become paying customers
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  /** User who referred (the affiliate) */
  referrerId: int("referrerId").notNull(),
  /** User who was referred */
  referredUserId: int("referredUserId").notNull().unique(),
  /** Unique referral code used */
  referralCode: varchar("referralCode", { length: 32 }).notNull(),
  /** Status of the referral */
  status: mysqlEnum("status", ["pending", "qualified", "rewarded", "expired"]).default("pending").notNull(),
  /** Total credits spent by referred user */
  referredUserCreditsSpent: int("referredUserCreditsSpent").default(0).notNull(),
  /** Credits rewarded to referrer (500 when qualified) */
  rewardCredits: int("rewardCredits").default(0).notNull(),
  /** When the reward was given */
  rewardedAt: timestamp("rewardedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Referral codes - each user gets a unique code
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Unique referral code (e.g., "JOHN2024" or random string) */
  code: varchar("code", { length: 32 }).notNull().unique(),
  /** Custom vanity code (optional) */
  vanityCode: varchar("vanityCode", { length: 32 }).unique(),
  /** Total successful referrals */
  totalReferrals: int("totalReferrals").default(0).notNull(),
  /** Total credits earned from referrals */
  totalCreditsEarned: int("totalCreditsEarned").default(0).notNull(),
  /** Is the code active */
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

/**
 * Affiliate configuration
 */
export const AFFILIATE_CONFIG = {
  /** Credits reward when referral qualifies */
  rewardCredits: 500,
  /** Minimum credits referred user must spend to qualify */
  qualificationThreshold: 500,
  /** Referral code prefix */
  codePrefix: "RS",
} as const;

/**
 * Saved Content Plans - User's generated content plans
 */
export const savedContentPlans = mysqlTable("saved_content_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Plan name/title */
  name: varchar("name", { length: 128 }).notNull(),
  /** Target audience profile */
  profile: json("profile").$type<{
    niche: string;
    painPoints: string[];
    usps: string[];
    benefits: string[];
    tonality: string;
  }>(),
  /** Plan duration in days */
  duration: int("duration").notNull(),
  /** Selected framework preference */
  framework: mysqlEnum("framework", ["HAPSS", "AIDA", "mixed"]).default("mixed").notNull(),
  /** Generated content plan items */
  planItems: json("planItems").$type<{
    day: number;
    topic: string;
    hook: string;
    framework: "HAPSS" | "AIDA";
    scriptStructure: string[];
    cutRecommendation: string;
    hashtags: string[];
    bestTime: string;
    trendingAudio: string;
    copywritingTip: string;
  }[]>(),
  /** Is this plan marked as favorite */
  isFavorite: int("isFavorite").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedContentPlan = typeof savedContentPlans.$inferSelect;
export type InsertSavedContentPlan = typeof savedContentPlans.$inferInsert;


/**
 * E-Mail Tracking - tracks sent emails and A/B test results
 */
export const emailTracking = mysqlTable("email_tracking", {
  id: int("id").autoincrement().primaryKey(),
  /** User who received the email */
  userId: int("userId").notNull(),
  /** Email type (drip_day1, drip_day3, etc.) */
  emailType: varchar("emailType", { length: 64 }).notNull(),
  /** A/B test variant (A or B) */
  variant: varchar("variant", { length: 1 }),
  /** Subject line used */
  subject: varchar("subject", { length: 255 }).notNull(),
  /** Was the email opened? */
  opened: int("opened").default(0).notNull(),
  /** Timestamp when opened */
  openedAt: timestamp("openedAt"),
  /** Was a link clicked? */
  clicked: int("clicked").default(0).notNull(),
  /** Timestamp when clicked */
  clickedAt: timestamp("clickedAt"),
  /** Did user convert (purchase/upgrade)? */
  converted: int("converted").default(0).notNull(),
  /** Resend email ID */
  resendId: varchar("resendId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailTracking = typeof emailTracking.$inferSelect;
export type InsertEmailTracking = typeof emailTracking.$inferInsert;

/**
 * A/B Test Results - aggregated stats for email variants
 */
export const emailAbTests = mysqlTable("email_ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  /** Email type being tested */
  emailType: varchar("emailType", { length: 64 }).notNull(),
  /** Variant A subject line */
  subjectA: varchar("subjectA", { length: 255 }).notNull(),
  /** Variant B subject line */
  subjectB: varchar("subjectB", { length: 255 }).notNull(),
  /** Total sent for variant A */
  sentA: int("sentA").default(0).notNull(),
  /** Total sent for variant B */
  sentB: int("sentB").default(0).notNull(),
  /** Opens for variant A */
  opensA: int("opensA").default(0).notNull(),
  /** Opens for variant B */
  opensB: int("opensB").default(0).notNull(),
  /** Clicks for variant A */
  clicksA: int("clicksA").default(0).notNull(),
  /** Clicks for variant B */
  clicksB: int("clicksB").default(0).notNull(),
  /** Conversions for variant A */
  conversionsA: int("conversionsA").default(0).notNull(),
  /** Conversions for variant B */
  conversionsB: int("conversionsB").default(0).notNull(),
  /** Is the test still active? */
  isActive: int("isActive").default(1).notNull(),
  /** Winning variant (null if test ongoing) */
  winner: varchar("winner", { length: 1 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailAbTest = typeof emailAbTests.$inferSelect;
export type InsertEmailAbTest = typeof emailAbTests.$inferInsert;
