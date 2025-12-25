import { getDb } from "./db";
import { users, creditTransactions, usageTracking, savedAnalyses } from "../drizzle/schema";
import { eq, desc, sql, and, gte, lte, like, or } from "drizzle-orm";
import { notifySuspiciousActivity, notifyAccountBanned } from "./emailService";

/**
 * Admin Service
 * Provides admin functionality for user management, analytics, and moderation
 */

// List of admin email addresses
const ADMIN_EMAILS = [
  "qliq.marketing@proton.me"
];

// Owner OpenID - exclude from statistics and set costs to 0
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID || "";

// Owner email addresses - used as fallback to identify owner
const OWNER_EMAILS = [
  "qliq.marketing@proton.me",
  "dp@dawid.info"
];

// List of forbidden keywords for adult content detection
const FORBIDDEN_KEYWORDS = [
  "porn", "xxx", "adult", "nsfw", "onlyfans", "sex", "nude", "naked",
  "escort", "cam", "fetish", "erotic", "stripper", "playboy", "playmate",
  "hentai", "fap", "milf", "teen", "amateur", "hardcore", "softcore"
];

export interface AdminUser {
  id: number;
  openId: string;
  email: string | null;
  name: string | null;
  // avatarUrl not in schema, removed
  plan: string;
  credits: number;
  role: string;
  status: string;
  statusReason: string | null;
  createdAt: Date;
  lastActivity: Date;
  totalAnalyses: number;
  totalSpent: number;
  isSuspicious: boolean;
  suspiciousReason: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalAnalyses: number;
  monthlyAnalyses: number;
  avgRevenuePerUser: number;
  conversionRate: number;
  suspiciousAccounts: number;
  bannedAccounts: number;
  planDistribution: { plan: string; count: number }[];
  revenueByPlan: { plan: string; revenue: number }[];
  dailySignups: { date: string; count: number }[];
  dailyRevenue: { date: string; revenue: number }[];
  // Neue Business-Metriken
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number; // Prozent der Nutzer, die abgewandert sind
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost (geschätzt)
  trialToProConversion: number; // Free zu Paid Conversion
  apiCosts: {
    instagramStatistics: { used: number; limit: number; cost: number };
    totalMonthlyCost: number;
  };
  featureUsage: {
    feature: string;
    usageCount: number;
    uniqueUsers: number;
  }[];
  recentSignups: { date: string; count: number }[];
  recentChurns: { date: string; count: number }[];
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  platform: string;
  targetUsername: string;
  creditsUsed: number;
  timestamp: Date;
}

/**
 * Check if user is admin by ID
 */
export async function isUserAdmin(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const user = await db
      .select({ role: users.role, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) return false;
    
    // Check if user has admin role OR is in admin emails list
    const isAdminRole = user[0].role === "admin";
    const isAdminEmail = user[0].email ? ADMIN_EMAILS.includes(user[0].email.toLowerCase()) : false;
    
    // Auto-promote admin email users to admin role
    if (isAdminEmail && !isAdminRole) {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
    }
    
    return isAdminRole || isAdminEmail;
  } catch (error) {
    console.error("[Admin] Error checking admin status:", error);
    return false;
  }
}

/**
 * Check if email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if content is suspicious (adult/forbidden)
 */
export function isSuspiciousContent(text: string): { suspicious: boolean; reason: string | null } {
  const lowerText = text.toLowerCase();
  
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return { suspicious: true, reason: `Verbotenes Keyword gefunden: ${keyword}` };
    }
  }
  
  return { suspicious: false, reason: null };
}

/**
 * Check user for suspicious content and notify admin if found
 */
export async function checkAndNotifySuspiciousUser(
  userId: number,
  email: string | null,
  name: string | null,
  analyzedUsername?: string
): Promise<void> {
  const textToCheck = `${name || ""} ${email || ""} ${analyzedUsername || ""}`;
  const result = isSuspiciousContent(textToCheck);
  
  if (result.suspicious && result.reason) {
    notifySuspiciousActivity(
      userId,
      email,
      result.reason,
      `Analysierter Account: ${analyzedUsername || "Unbekannt"}`
    ).catch(err => {
      console.error("[Admin] Failed to send suspicious activity notification:", err);
    });
  }
}

/**
 * Get all users with admin details
 */
export async function getAllUsers(
  page: number = 1,
  limit: number = 50,
  search?: string,
  filterPlan?: string,
  filterSuspicious?: boolean,
  filterBanned?: boolean
): Promise<{ users: AdminUser[]; total: number; pages: number }> {
  try {
    const db = await getDb();
    if (!db) return { users: [], total: 0, pages: 0 };

    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.openId, `%${search}%`)
        )
      );
    }
    
    if (filterPlan) {
      conditions.push(eq(users.plan, filterPlan as "free" | "starter" | "pro" | "business" | "enterprise"));
    }
    
    if (filterBanned !== undefined) {
      conditions.push(eq(users.status, filterBanned ? "banned" : "active"));
    }

    // Get users
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const userList = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Enrich with activity data
    const enrichedUsers: AdminUser[] = await Promise.all(
      userList.map(async (user) => {
        // Get total analyses
        const analysesResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(usageTracking)
          .where(eq(usageTracking.userId, user.id));
        
        // Get total spent (sum of credit purchases)
        const spentResult = await db
          .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(creditTransactions)
          .where(and(
            eq(creditTransactions.userId, user.id),
            eq(creditTransactions.type, "purchase")
          ));

        // Check if suspicious
        const suspiciousCheck = isSuspiciousContent(
          `${user.name || ""} ${user.email || ""}`
        );

        return {
          id: user.id,
          openId: user.openId,
          email: user.email,
          name: user.name,
          // avatarUrl not in schema
          plan: user.plan || "free",
          credits: user.credits || 0,
          role: user.role || "user",
          status: user.status || "active",
          statusReason: user.statusReason,
          createdAt: user.createdAt,
          lastActivity: user.lastActivity,
          totalAnalyses: Number(analysesResult[0]?.count || 0),
          totalSpent: Number(spentResult[0]?.total || 0),
          isSuspicious: suspiciousCheck.suspicious || (filterSuspicious === true),
          suspiciousReason: suspiciousCheck.reason,
        };
      })
    );

    // Filter suspicious if needed
    const filteredUsers = filterSuspicious !== undefined
      ? enrichedUsers.filter(u => u.isSuspicious === filterSuspicious)
      : enrichedUsers;

    return {
      users: filteredUsers,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Admin] Error getting users:", error);
    return { users: [], total: 0, pages: 0 };
  }
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const db = await getDb();
    if (!db) {
      return getEmptyStats();
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Exclude owner from all statistics (by OpenID or email)
    const excludeOwnerCondition = sql`(
      ${users.openId} != ${OWNER_OPEN_ID || 'non-existent-id'}
      AND ${users.email} NOT IN (${OWNER_EMAILS.map(e => `'${e}'`).join(', ')})
    )`;

    // Total users (excluding owner)
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(excludeOwnerCondition);
    const totalUsers = Number(totalUsersResult[0]?.count || 0);

    // Active users (last 30 days, excluding owner)
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(gte(users.lastActivity, thirtyDaysAgo), excludeOwnerCondition));
    const activeUsers = Number(activeUsersResult[0]?.count || 0);

    // Total revenue (all time)
    const totalRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(creditTransactions)
      .where(eq(creditTransactions.type, "purchase"));
    const totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    // Monthly revenue
    const monthlyRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(creditTransactions)
      .where(and(
        eq(creditTransactions.type, "purchase"),
        gte(creditTransactions.createdAt, monthStart)
      ));
    const monthlyRevenue = Number(monthlyRevenueResult[0]?.total || 0);

    // Total analyses
    const totalAnalysesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(usageTracking);
    const totalAnalyses = Number(totalAnalysesResult[0]?.count || 0);

    // Monthly analyses
    const monthlyAnalysesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(usageTracking)
      .where(gte(usageTracking.createdAt, monthStart));
    const monthlyAnalyses = Number(monthlyAnalysesResult[0]?.count || 0);

    // Banned accounts (excluding owner)
    const bannedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.status, "banned"), excludeOwnerCondition));
    const bannedAccounts = Number(bannedResult[0]?.count || 0);

    // Plan distribution (excluding owner)
    const planDistResult = await db
      .select({
        plan: users.plan,
        count: sql<number>`count(*)`
      })
      .from(users)
      .where(excludeOwnerCondition)
      .groupBy(users.plan);
    
    const planDistribution = planDistResult.map(p => ({
      plan: p.plan || "free",
      count: Number(p.count)
    }));

    // Calculate metrics
    const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    const paidUsers = planDistribution
      .filter(p => p.plan !== "free")
      .reduce((sum, p) => sum + p.count, 0);
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

    // MRR Berechnung basierend auf aktiven Abonnements
    // Preise: Starter €9.99, Pro €19.99, Business €49.99
    const planPrices: Record<string, number> = {
      starter: 9.99,
      pro: 19.99,
      business: 49.99,
      enterprise: 199.99
    };
    
    const mrr = planDistribution.reduce((sum, p) => {
      return sum + (planPrices[p.plan] || 0) * p.count;
    }, 0);
    const arr = mrr * 12;

    // Churn Rate (Nutzer die in den letzten 30 Tagen inaktiv wurden, excluding owner)
    const inactiveUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        lte(users.lastActivity, thirtyDaysAgo),
        sql`${users.plan} != 'free'`,
        excludeOwnerCondition
      ));
    const inactiveUsers = Number(inactiveUsersResult[0]?.count || 0);
    const churnRate = paidUsers > 0 ? (inactiveUsers / paidUsers) * 100 : 0;

    // LTV (Lifetime Value) = ARPU / Churn Rate
    const ltv = churnRate > 0 ? (avgRevenuePerUser / (churnRate / 100)) : avgRevenuePerUser * 12;

    // CAC geschätzt (Marketing-Kosten / Neue Nutzer)
    // Annahme: ~€5 pro Nutzer für Marketing
    const cac = 5;

    // Trial to Pro Conversion
    const freeUsers = planDistribution.find(p => p.plan === "free")?.count || 0;
    const trialToProConversion = totalUsers > 0 ? ((totalUsers - freeUsers) / totalUsers) * 100 : 0;

    // API-Kosten Berechnung
    // Instagram Statistics API: $75/Monat für 10.000 Requests
    const apiRequestsThisMonth = monthlyAnalyses; // Jede Analyse = 1 API Request
    const instagramApiCost = Math.min(apiRequestsThisMonth * 0.0075, 75); // Max $75
    const apiCosts = {
      instagramStatistics: {
        used: apiRequestsThisMonth,
        limit: 10000,
        cost: Math.round(instagramApiCost * 100) / 100
      },
      totalMonthlyCost: Math.round(instagramApiCost * 100) / 100
    };

    // Feature Usage (basierend auf usageTracking)
    const featureUsageResult = await db
      .select({
        actionType: usageTracking.actionType,
        count: sql<number>`count(*)`,
        uniqueUsers: sql<number>`count(distinct ${usageTracking.userId})`
      })
      .from(usageTracking)
      .where(gte(usageTracking.createdAt, monthStart))
      .groupBy(usageTracking.actionType);
    
    const featureUsage = featureUsageResult.map(f => ({
      feature: f.actionType || 'unknown',
      usageCount: Number(f.count),
      uniqueUsers: Number(f.uniqueUsers)
    }));

    // Recent Signups (letzte 7 Tage)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let recentSignups: { date: string; count: number }[] = [];
    try {
      const recentSignupsResult = await db
        .select({
          signupDate: sql<string>`DATE(createdAt)`.as('signup_date'),
          count: sql<number>`count(*)`
        })
        .from(users)
        .where(and(gte(users.createdAt, sevenDaysAgo), excludeOwnerCondition))
        .groupBy(sql`DATE(createdAt)`);
      
      recentSignups = recentSignupsResult.map(r => ({
        date: String(r.signupDate),
        count: Number(r.count)
      }));
    } catch (e) {
      console.error('[Admin] Error getting recent signups:', e);
      recentSignups = [];
    }

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalAnalyses,
      monthlyAnalyses,
      avgRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      suspiciousAccounts: 0,
      bannedAccounts,
      planDistribution,
      revenueByPlan: [],
      dailySignups: [],
      dailyRevenue: [],
      // Neue Metriken
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      churnRate: Math.round(churnRate * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      cac,
      trialToProConversion: Math.round(trialToProConversion * 100) / 100,
      apiCosts,
      featureUsage,
      recentSignups,
      recentChurns: [] // TODO: Implement churn tracking
    };
  } catch (error) {
    console.error("[Admin] Error getting stats:", error);
    return getEmptyStats();
  }
}

function getEmptyStats(): AdminStats {
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalAnalyses: 0,
    monthlyAnalyses: 0,
    avgRevenuePerUser: 0,
    conversionRate: 0,
    suspiciousAccounts: 0,
    bannedAccounts: 0,
    planDistribution: [],
    revenueByPlan: [],
    dailySignups: [],
    dailyRevenue: [],
    mrr: 0,
    arr: 0,
    churnRate: 0,
    ltv: 0,
    cac: 5,
    trialToProConversion: 0,
    apiCosts: {
      instagramStatistics: { used: 0, limit: 10000, cost: 0 },
      totalMonthlyCost: 0
    },
    featureUsage: [],
    recentSignups: [],
    recentChurns: []
  };
}

/**
 * Ban a user
 */
export async function banUser(userId: number, reason: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get user email before banning
    const user = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    const userEmail = user.length > 0 ? user[0].email : null;

    await db
      .update(users)
      .set({
        status: "banned",
        statusReason: reason,
      })
      .where(eq(users.id, userId));

    // Send notification
    notifyAccountBanned(userId, userEmail, reason).catch(err => {
      console.error("[Admin] Failed to send ban notification:", err);
    });

    console.log(`[Admin] User ${userId} banned: ${reason}`);
    return true;
  } catch (error) {
    console.error("[Admin] Error banning user:", error);
    return false;
  }
}

/**
 * Unban a user
 */
export async function unbanUser(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(users)
      .set({
        status: "active",
        statusReason: null,
      })
      .where(eq(users.id, userId));

    console.log(`[Admin] User ${userId} unbanned`);
    return true;
  } catch (error) {
    console.error("[Admin] Error unbanning user:", error);
    return false;
  }
}

/**
 * Set user role (admin, support, user)
 */
export async function setUserRole(userId: number, role: "user" | "admin" | "support"): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId));

    console.log(`[Admin] User ${userId} role set to: ${role}`);
    return true;
  } catch (error) {
    console.error("[Admin] Error setting user role:", error);
    return false;
  }
}

/**
 * Update user plan
 */
export async function updateUserPlan(
  userId: number, 
  plan: "free" | "starter" | "pro" | "business" | "enterprise", 
  credits: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(users)
      .set({ plan, credits })
      .where(eq(users.id, userId));

    console.log(`[Admin] User ${userId} plan updated to ${plan} with ${credits} credits`);
    return true;
  } catch (error) {
    console.error("[Admin] Error updating user plan:", error);
    return false;
  }
}

/**
 * Get user activity log
 */
export async function getUserActivity(
  userId: number,
  page: number = 1,
  limit: number = 50
): Promise<{ activities: UserActivity[]; total: number }> {
  try {
    const db = await getDb();
    if (!db) return { activities: [], total: 0 };

    const offset = (page - 1) * limit;

    const activities = await db
      .select()
      .from(usageTracking)
      .where(eq(usageTracking.userId, userId))
      .orderBy(desc(usageTracking.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(usageTracking)
      .where(eq(usageTracking.userId, userId));

    return {
      activities: activities.map(a => ({
        id: a.id,
        userId: a.userId,
        action: a.actionType,
        platform: a.platform || "instagram",
        targetUsername: "",
        creditsUsed: a.creditsUsed || 0,
        timestamp: a.createdAt,
      })),
      total: Number(countResult[0]?.count || 0),
    };
  } catch (error) {
    console.error("[Admin] Error getting user activity:", error);
    return { activities: [], total: 0 };
  }
}

/**
 * Get top users by activity
 */
export async function getTopUsers(limit: number = 10): Promise<AdminUser[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    // Get users with most analyses
    const topUsersResult = await db
      .select({
        userId: usageTracking.userId,
        count: sql<number>`count(*)`
      })
      .from(usageTracking)
      .groupBy(usageTracking.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const topUsers: AdminUser[] = [];
    
    for (const result of topUsersResult) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, result.userId))
        .limit(1);

      if (user.length > 0) {
        const suspiciousCheck = isSuspiciousContent(
          `${user[0].name || ""} ${user[0].email || ""}`
        );

        topUsers.push({
          id: user[0].id,
          openId: user[0].openId,
          email: user[0].email,
          name: user[0].name,
          // avatarUrl not in schema
          plan: user[0].plan || "free",
          credits: user[0].credits || 0,
          role: user[0].role || "user",
          status: user[0].status || "active",
          statusReason: user[0].statusReason,
          createdAt: user[0].createdAt,
          lastActivity: user[0].lastActivity,
          totalAnalyses: Number(result.count),
          totalSpent: 0,
          isSuspicious: suspiciousCheck.suspicious,
          suspiciousReason: suspiciousCheck.reason,
        });
      }
    }

    return topUsers;
  } catch (error) {
    console.error("[Admin] Error getting top users:", error);
    return [];
  }
}

/**
 * Scan all users for suspicious content
 */
export async function scanForSuspiciousUsers(): Promise<AdminUser[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const allUsers = await db.select().from(users);
    const suspiciousUsers: AdminUser[] = [];

    for (const user of allUsers) {
      const suspiciousCheck = isSuspiciousContent(
        `${user.name || ""} ${user.email || ""}`
      );

      if (suspiciousCheck.suspicious) {
        suspiciousUsers.push({
          id: user.id,
          openId: user.openId,
          email: user.email,
          name: user.name,
          // avatarUrl not in schema
          plan: user.plan || "free",
          credits: user.credits || 0,
          role: user.role || "user",
          status: user.status || "active",
          statusReason: user.statusReason,
          createdAt: user.createdAt,
          lastActivity: user.lastActivity,
          totalAnalyses: 0,
          totalSpent: 0,
          isSuspicious: true,
          suspiciousReason: suspiciousCheck.reason,
        });
      }
    }

    return suspiciousUsers;
  } catch (error) {
    console.error("[Admin] Error scanning for suspicious users:", error);
    return [];
  }
}


/**
 * Create a new user with invitation email
 */
export async function createUserWithInvitation(
  email: string,
  name: string,
  initialCredits: number = 10,
  plan: string = "free"
): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "User with this email already exists" };
    }

    // Generate a unique openId for the new user
    const openId = `invited_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create the user - use valid plan enum value
    const validPlan = ["free", "starter", "pro", "business", "enterprise"].includes(plan) 
      ? plan as "free" | "starter" | "pro" | "business" | "enterprise"
      : "free";
    
    await db.insert(users).values({
      openId,
      email: email.toLowerCase(),
      name,
      plan: validPlan,
      credits: initialCredits,
      role: "user",
      status: "active",
    });

    // Get the created user ID
    const createdUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);
    
    const userId = createdUser[0]?.id || 0;

    // Send invitation email
    const { sendUserInvitation } = await import("./emailService");
    await sendUserInvitation(email, name);

    console.log(`[Admin] Created invited user: ${email} (ID: ${userId})`);

    return { success: true, userId };
  } catch (error) {
    console.error("[Admin] Error creating user:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Add credits to a user account (admin action)
 */
export async function adminAddCredits(
  userId: number,
  amount: number,
  reason: string,
  adminId: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };

    // Get current user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: "User not found" };
    }

    const currentCredits = user[0].credits || 0;
    const newBalance = currentCredits + amount;

    // Update user credits
    await db
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.id, userId));

    // Log the transaction
    await db.insert(creditTransactions).values({
      userId,
      amount,
      balanceAfter: newBalance,
      type: "admin_adjustment",
      description: `Admin (ID: ${adminId}): ${reason}`,
      adminId,
    });

    console.log(`[Admin] Credits ${amount > 0 ? "added" : "removed"}: User ${userId}, Amount: ${amount}, Reason: ${reason}`);

    return { success: true, newBalance };
  } catch (error) {
    console.error("[Admin] Error adding credits:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get detailed user information for admin view
 */
export async function getDetailedUserInfo(userId: number): Promise<{
  user: AdminUser | null;
  recentActivity: UserActivity[];
  creditHistory: any[];
  savedAccounts: any[];
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) return { user: null, recentActivity: [], creditHistory: [], savedAccounts: [], error: "Database not available" };

    // Get user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return { user: null, recentActivity: [], creditHistory: [], savedAccounts: [], error: "User not found" };
    }

    const u = userResult[0];

    // Get total analyses
    const analysesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(usageTracking)
      .where(eq(usageTracking.userId, userId));

    // Get total spent
    const spentResult = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(creditTransactions)
      .where(and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.type, "purchase")
      ));

    // Get recent activity
    const recentActivity = await db
      .select()
      .from(usageTracking)
      .where(eq(usageTracking.userId, userId))
      .orderBy(desc(usageTracking.createdAt))
      .limit(20);

    // Get credit history
    const creditHistory = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50);

    // Get saved accounts
    const savedAccounts = await db
      .select()
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId))
      .orderBy(desc(savedAnalyses.createdAt))
      .limit(50);

    const adminUser: AdminUser = {
      id: u.id,
      openId: u.openId,
      email: u.email,
      name: u.name,
      plan: u.plan || "free",
      credits: u.credits || 0,
      role: u.role || "user",
      status: u.status || "active",
      statusReason: u.statusReason,
      createdAt: u.createdAt,
      lastActivity: u.lastActivity,
      totalAnalyses: Number(analysesResult[0]?.count) || 0,
      totalSpent: Number(spentResult[0]?.total) || 0,
      isSuspicious: false,
      suspiciousReason: null,
    };

    return {
      user: adminUser,
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        userId: a.userId,
        action: a.actionType,
        platform: a.platform || "instagram",
        targetUsername: "",
        creditsUsed: a.creditsUsed || 0,
        timestamp: a.createdAt,
      })),
      creditHistory,
      savedAccounts,
    };
  } catch (error) {
    console.error("[Admin] Error getting detailed user info:", error);
    return { user: null, recentActivity: [], creditHistory: [], savedAccounts: [], error: String(error) };
  }
}

/**
 * Get all users with extended info for admin dashboard
 */
export async function getAllUsersExtended(
  page: number = 1,
  limit: number = 50,
  search?: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const db = await getDb();
    if (!db) return { users: [], total: 0, page: 1, totalPages: 0 };

    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = [];
    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.openId, `%${search}%`)
        )
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count) || 0;

    // Get users
    const usersResult = await db
      .select()
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortOrder === "desc" ? desc(users.createdAt) : users.createdAt)
      .limit(limit)
      .offset(offset);

    // Get additional stats for each user
    const adminUsers: AdminUser[] = await Promise.all(
      usersResult.map(async (u) => {
        // Get total analyses
        const analysesResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(usageTracking)
          .where(eq(usageTracking.userId, u.id));

        // Get total spent
        const spentResult = await db
          .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(creditTransactions)
          .where(and(
            eq(creditTransactions.userId, u.id),
            eq(creditTransactions.type, "purchase")
          ));

        return {
          id: u.id,
          openId: u.openId,
          email: u.email,
          name: u.name,
          plan: u.plan || "free",
          credits: u.credits || 0,
          role: u.role || "user",
          status: u.status || "active",
          statusReason: u.statusReason,
          createdAt: u.createdAt,
          lastActivity: u.lastActivity,
          totalAnalyses: Number(analysesResult[0]?.count) || 0,
          totalSpent: Number(spentResult[0]?.total) || 0,
          isSuspicious: false,
          suspiciousReason: null,
        };
      })
    );

    return {
      users: adminUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Admin] Error getting all users extended:", error);
    return { users: [], total: 0, page: 1, totalPages: 0 };
  }
}
