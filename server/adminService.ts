import { getDb } from "./db";
import { users, creditTransactions, usageTracking, savedAnalyses } from "../drizzle/schema";
import { eq, desc, sql, and, gte, lte, like, or } from "drizzle-orm";

/**
 * Admin Service
 * Provides admin functionality for user management, analytics, and moderation
 */

// List of admin email addresses
const ADMIN_EMAILS = [
  "qliq.marketing@proton.me"
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

    // Total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = Number(totalUsersResult[0]?.count || 0);

    // Active users (last 30 days)
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.lastActivity, thirtyDaysAgo));
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

    // Banned accounts
    const bannedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, "banned"));
    const bannedAccounts = Number(bannedResult[0]?.count || 0);

    // Plan distribution
    const planDistResult = await db
      .select({
        plan: users.plan,
        count: sql<number>`count(*)`
      })
      .from(users)
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

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalAnalyses,
      monthlyAnalyses,
      avgRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      suspiciousAccounts: 0, // Would need to scan all users
      bannedAccounts,
      planDistribution,
      revenueByPlan: [], // Would need complex query
      dailySignups: [], // Would need date grouping
      dailyRevenue: [], // Would need date grouping
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
  };
}

/**
 * Ban a user
 */
export async function banUser(userId: number, reason: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(users)
      .set({
        status: "banned",
        statusReason: reason,
      })
      .where(eq(users.id, userId));

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
