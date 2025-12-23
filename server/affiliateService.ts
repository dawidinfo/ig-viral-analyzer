import { getDb } from "./db";
import { referrals, referralCodes, users, creditTransactions, AFFILIATE_CONFIG } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(userId: number): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${AFFILIATE_CONFIG.codePrefix}${userId}${random}`;
}

/**
 * Get or create a referral code for a user
 */
export async function getOrCreateReferralCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already has a code
  const existing = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].vanityCode || existing[0].code;
  }

  // Generate new code
  const code = generateReferralCode(userId);
  
  await db.insert(referralCodes).values({
    userId,
    code,
    totalReferrals: 0,
    totalCreditsEarned: 0,
    isActive: 1,
  });

  return code;
}

/**
 * Get referral code info for a user
 */
export async function getReferralCodeInfo(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const codeInfo = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  if (codeInfo.length === 0) {
    // Create one if doesn't exist
    const code = await getOrCreateReferralCode(userId);
    return {
      code,
      vanityCode: null,
      totalReferrals: 0,
      totalCreditsEarned: 0,
      isActive: true,
    };
  }

  return {
    code: codeInfo[0].code,
    vanityCode: codeInfo[0].vanityCode,
    totalReferrals: codeInfo[0].totalReferrals,
    totalCreditsEarned: codeInfo[0].totalCreditsEarned,
    isActive: codeInfo[0].isActive === 1,
  };
}

/**
 * Get all referrals for a user (as referrer)
 */
export async function getUserReferrals(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userReferrals = await db
    .select({
      id: referrals.id,
      referredUserId: referrals.referredUserId,
      status: referrals.status,
      referredUserCreditsSpent: referrals.referredUserCreditsSpent,
      rewardCredits: referrals.rewardCredits,
      rewardedAt: referrals.rewardedAt,
      createdAt: referrals.createdAt,
      referredUserName: users.name,
      referredUserEmail: users.email,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredUserId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(sql`${referrals.createdAt} DESC`);

  return userReferrals;
}

/**
 * Apply a referral code when a new user signs up
 */
export async function applyReferralCode(newUserId: number, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find the referral code
  const codeInfo = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        sql`(${referralCodes.code} = ${code} OR ${referralCodes.vanityCode} = ${code})`,
        eq(referralCodes.isActive, 1)
      )
    )
    .limit(1);

  if (codeInfo.length === 0) {
    return false; // Invalid code
  }

  const referrerId = codeInfo[0].userId;

  // Don't allow self-referral
  if (referrerId === newUserId) {
    return false;
  }

  // Check if user was already referred
  const existingReferral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredUserId, newUserId))
    .limit(1);

  if (existingReferral.length > 0) {
    return false; // Already referred
  }

  // Create the referral
  await db.insert(referrals).values({
    referrerId,
    referredUserId: newUserId,
    referralCode: codeInfo[0].code,
    status: "pending",
    referredUserCreditsSpent: 0,
    rewardCredits: 0,
  });

  return true;
}

/**
 * Update referral status when referred user spends credits
 * Called after each credit transaction
 */
export async function updateReferralOnCreditSpend(userId: number, creditsSpent: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Find if this user was referred
  const referral = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referredUserId, userId),
        eq(referrals.status, "pending")
      )
    )
    .limit(1);

  if (referral.length === 0) return;

  const ref = referral[0];
  const newTotalSpent = ref.referredUserCreditsSpent + creditsSpent;

  // Update the spent amount
  await db
    .update(referrals)
    .set({
      referredUserCreditsSpent: newTotalSpent,
    })
    .where(eq(referrals.id, ref.id));

  // Check if qualifies for reward (spent > 500 credits)
  if (newTotalSpent >= AFFILIATE_CONFIG.qualificationThreshold) {
    await qualifyReferral(ref.id, ref.referrerId);
  }
}

/**
 * Qualify a referral and give reward to referrer
 */
async function qualifyReferral(referralId: number, referrerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Update referral status
  await db
    .update(referrals)
    .set({
      status: "rewarded",
      rewardCredits: AFFILIATE_CONFIG.rewardCredits,
      rewardedAt: new Date(),
    })
    .where(eq(referrals.id, referralId));

  // Get current referrer balance
  const referrer = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, referrerId))
    .limit(1);

  if (referrer.length === 0) return;

  const newBalance = referrer[0].credits + AFFILIATE_CONFIG.rewardCredits;

  // Add credits to referrer
  await db
    .update(users)
    .set({ credits: newBalance })
    .where(eq(users.id, referrerId));

  // Log the transaction
  await db.insert(creditTransactions).values({
    userId: referrerId,
    type: "bonus",
    amount: AFFILIATE_CONFIG.rewardCredits,
    balanceAfter: newBalance,
    description: `Affiliate reward - referral qualified`,
    actionType: "affiliate_reward",
  });

  // Update referral code stats
  await db
    .update(referralCodes)
    .set({
      totalReferrals: sql`${referralCodes.totalReferrals} + 1`,
      totalCreditsEarned: sql`${referralCodes.totalCreditsEarned} + ${AFFILIATE_CONFIG.rewardCredits}`,
    })
    .where(eq(referralCodes.userId, referrerId));
}

/**
 * Set a custom vanity code for a user
 */
export async function setVanityCode(userId: number, vanityCode: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validate vanity code
  if (vanityCode.length < 4 || vanityCode.length > 20) {
    return { success: false, error: "Code must be 4-20 characters" };
  }

  if (!/^[A-Za-z0-9]+$/.test(vanityCode)) {
    return { success: false, error: "Code can only contain letters and numbers" };
  }

  const upperCode = vanityCode.toUpperCase();

  // Check if already taken
  const existing = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        sql`(${referralCodes.code} = ${upperCode} OR ${referralCodes.vanityCode} = ${upperCode})`,
        sql`${referralCodes.userId} != ${userId}`
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Code already taken" };
  }

  // Update or create
  const userCode = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);

  if (userCode.length === 0) {
    // Create new
    const code = generateReferralCode(userId);
    await db.insert(referralCodes).values({
      userId,
      code,
      vanityCode: upperCode,
      totalReferrals: 0,
      totalCreditsEarned: 0,
      isActive: 1,
    });
  } else {
    // Update existing
    await db
      .update(referralCodes)
      .set({ vanityCode: upperCode })
      .where(eq(referralCodes.userId, userId));
  }

  return { success: true };
}

/**
 * Get affiliate dashboard stats
 */
export async function getAffiliateStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const codeInfo = await getReferralCodeInfo(userId);
  const referralsList = await getUserReferrals(userId);

  const pendingCount = referralsList.filter((r: any) => r.status === "pending").length;
  const qualifiedCount = referralsList.filter((r: any) => r.status === "rewarded").length;

  return {
    referralCode: codeInfo.vanityCode || codeInfo.code,
    totalReferrals: codeInfo.totalReferrals,
    totalCreditsEarned: codeInfo.totalCreditsEarned,
    pendingReferrals: pendingCount,
    qualifiedReferrals: qualifiedCount,
    referrals: referralsList.map((r: any) => ({
      id: r.id,
      userName: r.referredUserName || "Anonymous",
      status: r.status,
      creditsSpent: r.referredUserCreditsSpent,
      rewardCredits: r.rewardCredits,
      createdAt: r.createdAt,
      rewardedAt: r.rewardedAt,
    })),
    rewardAmount: AFFILIATE_CONFIG.rewardCredits,
    qualificationThreshold: AFFILIATE_CONFIG.qualificationThreshold,
  };
}
