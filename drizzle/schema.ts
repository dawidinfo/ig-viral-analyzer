import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's subscription plan */
  plan: mysqlEnum("plan", ["free", "starter", "pro", "business"]).default("free").notNull(),
  /** Stripe customer ID for billing */
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  /** Subscription end date */
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Cache table for Instagram analysis results.
 * Stores analysis data for 1 hour to reduce API calls.
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
 * Saved analyses table - stores user's saved Instagram analyses
 */
export const savedAnalyses = mysqlTable("saved_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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
 * Usage tracking table - tracks user's API usage for limits
 */
export const usageTracking = mysqlTable("usage_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Type of action: analysis, ai_analysis, pdf_export, comparison */
  actionType: varchar("actionType", { length: 32 }).notNull(),
  /** The month this usage applies to (YYYY-MM format) */
  usageMonth: varchar("usageMonth", { length: 7 }).notNull(),
  /** Number of times this action was used */
  count: int("count").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  free: {
    analyses: 3,
    aiAnalyses: 0,
    pdfExports: 0,
    comparisons: 1,
    savedAnalyses: 5,
  },
  starter: {
    analyses: 10,
    aiAnalyses: 5,
    pdfExports: 5,
    comparisons: 5,
    savedAnalyses: 25,
  },
  pro: {
    analyses: 50,
    aiAnalyses: 30,
    pdfExports: 30,
    comparisons: 25,
    savedAnalyses: 100,
  },
  business: {
    analyses: -1, // unlimited
    aiAnalyses: -1,
    pdfExports: -1,
    comparisons: -1,
    savedAnalyses: -1,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
