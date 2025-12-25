import { getDb } from "./db";
import { users, creditTransactions, CREDIT_COSTS, CreditAction } from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
import { notifyPurchase } from "./emailService";

// Owner OpenID - no credit costs for owner
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID || "";

// Owner email addresses - used as fallback to identify owner
const OWNER_EMAILS = [
  "qliq.marketing@proton.me",
  "dp@dawid.info"
];

/**
 * Credit Service - Manages user credits, transactions, and usage tracking
 */

export interface CreditBalance {
  credits: number;
  totalPurchased: number;
  plan: string;
}

export interface CreditTransaction {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  actionType?: string;
  platform?: string;
  createdAt: Date;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: number): Promise<CreditBalance | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      credits: users.credits,
      totalPurchased: users.totalCreditsPurchased,
      plan: users.plan,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) return null;

  return {
    credits: result[0].credits,
    totalPurchased: result[0].totalPurchased,
    plan: result[0].plan,
  };
}

/**
 * Check if user has enough credits for an action
 */
export async function hasEnoughCredits(userId: number, action: CreditAction): Promise<boolean> {
  const balance = await getUserCredits(userId);
  if (!balance) return false;

  const cost = CREDIT_COSTS[action];
  return balance.credits >= cost;
}

/**
 * Get the cost of an action
 */
export function getActionCost(action: CreditAction): number {
  return CREDIT_COSTS[action];
}

/**
 * Use credits for an action
 * Returns true if successful, false if not enough credits
 */
export async function useCredits(
  userId: number,
  action: CreditAction,
  platform: string = "instagram",
  description?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, newBalance: 0, error: "Database not available" };

  // Check if user is owner - no credit cost for owner (by OpenID or email)
  const userResult = await db.select({ openId: users.openId, email: users.email, credits: users.credits }).from(users).where(eq(users.id, userId));
  const userOpenId = userResult[0]?.openId;
  const userEmail = userResult[0]?.email;
  const isOwner = (OWNER_OPEN_ID && userOpenId === OWNER_OPEN_ID) || (userEmail && OWNER_EMAILS.includes(userEmail));
  
  // Owner pays no credits
  const cost = isOwner ? 0 : CREDIT_COSTS[action];
  const balance = await getUserCredits(userId);

  if (!balance) {
    return { success: false, newBalance: 0, error: "User not found" };
  }

  if (balance.credits < cost) {
    return {
      success: false,
      newBalance: balance.credits,
      error: `Nicht genügend Credits. Benötigt: ${cost}, Verfügbar: ${balance.credits}`,
    };
  }

  const newBalance = balance.credits - cost;

  // Update user credits
  await db
    .update(users)
    .set({ credits: newBalance })
    .where(eq(users.id, userId));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    type: "usage",
    amount: -cost,
    balanceAfter: newBalance,
    description: description || `${action} auf ${platform}`,
    actionType: action,
    platform,
  });

  return { success: true, newBalance };
}

/**
 * Add credits to user account (purchase, bonus, refund)
 */
export async function addCredits(
  userId: number,
  amount: number,
  type: "purchase" | "bonus" | "refund" | "admin_adjustment",
  description: string,
  referenceId?: string,
  adminId?: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, newBalance: 0, error: "Database not available" };

  const balance = await getUserCredits(userId);
  if (!balance) {
    return { success: false, newBalance: 0, error: "User not found" };
  }

  const newBalance = balance.credits + amount;
  const newTotalPurchased = type === "purchase" 
    ? balance.totalPurchased + amount 
    : balance.totalPurchased;

  // Update user credits
  await db
    .update(users)
    .set({ 
      credits: newBalance,
      totalCreditsPurchased: newTotalPurchased,
    })
    .where(eq(users.id, userId));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    type,
    amount,
    balanceAfter: newBalance,
    description,
    referenceId,
    adminId,
  });

  // Send notification for purchases
  if (type === "purchase") {
    const user = await db.select({ email: users.email, plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
    if (user.length > 0) {
      // Estimate price based on credits (rough calculation)
      const pricePerCredit = 0.29; // Average price per credit
      const estimatedPrice = amount * pricePerCredit;
      notifyPurchase(userId, user[0].email, user[0].plan, estimatedPrice, amount).catch(err => {
        console.error("[Credits] Failed to send purchase notification:", err);
      });
    }
  }

  return { success: true, newBalance };
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(
  userId: number,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  const transactions = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);

  return transactions.map(t => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    description: t.description,
    actionType: t.actionType || undefined,
    platform: t.platform || undefined,
    createdAt: t.createdAt,
  }));
}

/**
 * Get credit usage statistics for a user
 */
export async function getCreditStats(userId: number): Promise<{
  totalUsed: number;
  totalPurchased: number;
  usageByPlatform: Record<string, number>;
  usageByAction: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalUsed: 0,
      totalPurchased: 0,
      usageByPlatform: {},
      usageByAction: {},
    };
  }

  // Get all usage transactions
  const usageTransactions = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));

  let totalUsed = 0;
  let totalPurchased = 0;
  const usageByPlatform: Record<string, number> = {};
  const usageByAction: Record<string, number> = {};

  for (const t of usageTransactions) {
    if (t.type === "usage") {
      totalUsed += Math.abs(t.amount);
      
      if (t.platform) {
        usageByPlatform[t.platform] = (usageByPlatform[t.platform] || 0) + Math.abs(t.amount);
      }
      
      if (t.actionType) {
        usageByAction[t.actionType] = (usageByAction[t.actionType] || 0) + Math.abs(t.amount);
      }
    } else if (t.type === "purchase" || t.type === "bonus") {
      totalPurchased += t.amount;
    }
  }

  return {
    totalUsed,
    totalPurchased,
    usageByPlatform,
    usageByAction,
  };
}

/**
 * Initialize credits for new user based on plan
 */
export async function initializeUserCredits(userId: number, plan: string = "free"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const initialCredits = plan === "free" ? 10 : 0;

  await db
    .update(users)
    .set({ credits: initialCredits })
    .where(eq(users.id, userId));

  if (initialCredits > 0) {
    await db.insert(creditTransactions).values({
      userId,
      type: "bonus",
      amount: initialCredits,
      balanceAfter: initialCredits,
      description: "Willkommens-Credits für neuen Account",
    });
  }
}

/**
 * Check if user can perform action (has credits and module access)
 */
export async function canPerformAction(
  userId: number,
  action: CreditAction,
  platform: string = "instagram"
): Promise<{ allowed: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) return { allowed: false, reason: "Database not available" };

  // Get user with modules
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length === 0) {
    return { allowed: false, reason: "User not found" };
  }

  const user = userResult[0];

  // Check account status
  if (user.status !== "active") {
    return { allowed: false, reason: `Account ist ${user.status}: ${user.statusReason || "Kontaktiere den Support"}` };
  }

  // Check platform module access
  const enabledModules = (user.modulesEnabled as string[]) || ["instagram"];
  if (!enabledModules.includes(platform)) {
    return { 
      allowed: false, 
      reason: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Modul nicht aktiviert. Upgrade deinen Plan.` 
    };
  }

  // Check credits
  const cost = CREDIT_COSTS[action];
  if (user.credits < cost) {
    return {
      allowed: false,
      reason: `Nicht genügend Credits. Benötigt: ${cost}, Verfügbar: ${user.credits}`,
    };
  }

  return { allowed: true };
}
