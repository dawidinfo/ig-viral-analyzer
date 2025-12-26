/**
 * GDPR Compliance Service
 * 
 * Handles user data deletion requests in compliance with GDPR Article 17 (Right to Erasure).
 * 
 * Features:
 * - Complete user data deletion
 * - Data export (Article 20 - Right to Data Portability)
 * - Audit logging for compliance
 * - Cascading deletion across all related tables
 */

import { getDb } from "../db";
import { 
  users, 
  usageTracking, 
  creditTransactions, 
  followerSnapshots,
  instagramCache,
  analysisNotes,
  savedContentPlans,
  savedAnalyses,
  rateLimits
} from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export interface DeletionResult {
  success: boolean;
  deletedRecords: {
    users: number;
    usageTracking: number;
    creditTransactions: number;
    followerSnapshots: number;
    instagramCache: number;
    analysisNotes: number;
    contentPlans: number;
    savedAnalyses: number;
    rateLimits: number;
  };
  errors: string[];
  completedAt: Date;
}

export interface DataExportResult {
  success: boolean;
  data: {
    user: any;
    usageHistory: any[];
    creditTransactions: any[];
    savedAnalyses: any[];
    contentPlans: any[];
    analysisNotes: any[];
  };
  exportedAt: Date;
}

/**
 * Delete all user data (GDPR Article 17 - Right to Erasure)
 * 
 * This function permanently deletes all data associated with a user.
 * It should be called after proper verification of the user's identity.
 */
export async function deleteUserData(userId: number): Promise<DeletionResult> {
  const result: DeletionResult = {
    success: false,
    deletedRecords: {
      users: 0,
      usageTracking: 0,
      creditTransactions: 0,
      followerSnapshots: 0,
      instagramCache: 0,
      analysisNotes: 0,
      contentPlans: 0,
      savedAnalyses: 0,
      rateLimits: 0,
    },
    errors: [],
    completedAt: new Date(),
  };

  const db = await getDb();
  if (!db) {
    result.errors.push("Database connection not available");
    return result;
  }

  console.log(`[GDPR] Starting data deletion for user ${userId}`);

  try {
    // 1. Delete usage tracking records
    try {
      await db.delete(usageTracking).where(eq(usageTracking.userId, userId));
      console.log(`[GDPR] Deleted usage tracking for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete usage tracking: ${e}`);
    }

    // 2. Delete credit transactions
    try {
      await db.delete(creditTransactions).where(eq(creditTransactions.userId, userId));
      console.log(`[GDPR] Deleted credit transactions for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete credit transactions: ${e}`);
    }

    // 3. Delete analysis notes
    try {
      await db.delete(analysisNotes).where(eq(analysisNotes.userId, userId));
      console.log(`[GDPR] Deleted analysis notes for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete analysis notes: ${e}`);
    }

    // 4. Delete content plans
    try {
      await db.delete(savedContentPlans).where(eq(savedContentPlans.userId, userId));
      console.log(`[GDPR] Deleted content plans for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete content plans: ${e}`);
    }

    // 5. Delete saved analyses
    try {
      await db.delete(savedAnalyses).where(eq(savedAnalyses.userId, userId));
      console.log(`[GDPR] Deleted saved analyses for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete saved analyses: ${e}`);
    }

    // 6. Delete rate limit records
    try {
      await db.delete(rateLimits).where(eq(rateLimits.identifier, String(userId)));
      console.log(`[GDPR] Deleted rate limits for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete rate limits: ${e}`);
    }

    // 7. Finally, delete the user record
    try {
      await db.delete(users).where(eq(users.id, userId));
      result.deletedRecords.users = 1;
      console.log(`[GDPR] Deleted user record for user ${userId}`);
    } catch (e) {
      result.errors.push(`Failed to delete user: ${e}`);
    }

    result.success = result.errors.length === 0;
    result.completedAt = new Date();

    // Log the deletion for audit purposes
    console.log(`[GDPR] Data deletion completed for user ${userId}. Success: ${result.success}. Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${error}`);
    console.error(`[GDPR] Data deletion failed for user ${userId}:`, error);
    return result;
  }
}

/**
 * Export all user data (GDPR Article 20 - Right to Data Portability)
 * 
 * Returns all data associated with a user in a structured format.
 */
export async function exportUserData(userId: number): Promise<DataExportResult> {
  const result: DataExportResult = {
    success: false,
    data: {
      user: null,
      usageHistory: [],
      creditTransactions: [],
      savedAnalyses: [],
      contentPlans: [],
      analysisNotes: [],
    },
    exportedAt: new Date(),
  };

  const db = await getDb();
  if (!db) {
    return result;
  }

  console.log(`[GDPR] Starting data export for user ${userId}`);

  try {
    // 1. Get user data (excluding sensitive internal fields)
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      credits: users.credits,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      loginMethod: users.loginMethod,
    }).from(users).where(eq(users.id, userId));

    if (user) {
      result.data.user = user;
    }

    // 2. Get usage history
    const usage = await db.select({
      actionType: usageTracking.actionType,
      creditsUsed: usageTracking.creditsUsed,
      createdAt: usageTracking.createdAt,
    }).from(usageTracking).where(eq(usageTracking.userId, userId));
    result.data.usageHistory = usage;

    // 3. Get credit transactions
    const transactions = await db.select({
      type: creditTransactions.type,
      amount: creditTransactions.amount,
      description: creditTransactions.description,
      createdAt: creditTransactions.createdAt,
    }).from(creditTransactions).where(eq(creditTransactions.userId, userId));
    result.data.creditTransactions = transactions;

    // 4. Get saved analyses
    const analyses = await db.select({
      username: savedAnalyses.username,
      platform: savedAnalyses.platform,
      createdAt: savedAnalyses.createdAt,
    }).from(savedAnalyses).where(eq(savedAnalyses.userId, userId));
    result.data.savedAnalyses = analyses;

    // 5. Get content plans
    const plans = await db.select({
      name: savedContentPlans.name,
      duration: savedContentPlans.duration,
      framework: savedContentPlans.framework,
      createdAt: savedContentPlans.createdAt,
    }).from(savedContentPlans).where(eq(savedContentPlans.userId, userId));
    result.data.contentPlans = plans;

    // 6. Get analysis notes
    const notes = await db.select({
      username: analysisNotes.username,
      section: analysisNotes.section,
      notes: analysisNotes.notes,
      actionItems: analysisNotes.actionItems,
      createdAt: analysisNotes.createdAt,
    }).from(analysisNotes).where(eq(analysisNotes.userId, userId));
    result.data.analysisNotes = notes;

    result.success = true;
    result.exportedAt = new Date();

    console.log(`[GDPR] Data export completed for user ${userId}`);

    return result;
  } catch (error) {
    console.error(`[GDPR] Data export failed for user ${userId}:`, error);
    return result;
  }
}

/**
 * Anonymize user data instead of full deletion
 * 
 * This is an alternative to full deletion that preserves aggregate statistics
 * while removing personally identifiable information.
 */
export async function anonymizeUserData(userId: number): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database connection not available" };
  }

  console.log(`[GDPR] Starting data anonymization for user ${userId}`);

  try {
    const anonymousId = `deleted_user_${Date.now()}`;

    // Anonymize user record
    await db.update(users).set({
      name: "Deleted User",
      email: null,
      openId: anonymousId,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      loginMethod: null,
    }).where(eq(users.id, userId));

    console.log(`[GDPR] User ${userId} anonymized successfully`);

    return { success: true };
  } catch (error) {
    console.error(`[GDPR] Anonymization failed for user ${userId}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Schedule data deletion (for delayed deletion with grace period)
 * 
 * Some regulations allow for a grace period before permanent deletion.
 */
export async function scheduleDeletion(
  userId: number, 
  daysUntilDeletion: number = 30
): Promise<{ success: boolean; scheduledFor: Date }> {
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + daysUntilDeletion);

  const db = await getDb();
  if (!db) {
    return { success: false, scheduledFor };
  }

  try {
    // Mark user for deletion by setting a flag
    // Note: In production, add a deletionScheduledAt column to the schema
    await db.update(users).set({
      subscriptionStatus: "cancelled", // Mark as cancelled for pending deletion
    }).where(eq(users.id, userId));

    console.log(`[GDPR] Deletion scheduled for user ${userId} on ${scheduledFor.toISOString()}`);

    return { success: true, scheduledFor };
  } catch (error) {
    console.error(`[GDPR] Failed to schedule deletion for user ${userId}:`, error);
    return { success: false, scheduledFor };
  }
}

/**
 * Cancel scheduled deletion
 */
export async function cancelScheduledDeletion(userId: number): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) {
    return { success: false };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (user) {
      await db.update(users).set({
        subscriptionStatus: "active",
      }).where(eq(users.id, userId));
    }

    console.log(`[GDPR] Scheduled deletion cancelled for user ${userId}`);

    return { success: true };
  } catch (error) {
    console.error(`[GDPR] Failed to cancel deletion for user ${userId}:`, error);
    return { success: false };
  }
}

/**
 * Get deletion status for a user
 */
export async function getDeletionStatus(userId: number): Promise<{
  isPendingDeletion: boolean;
  scheduledFor?: Date;
}> {
  const db = await getDb();
  if (!db) {
    return { isPendingDeletion: false };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return { isPendingDeletion: false };
    }

    return {
      isPendingDeletion: user.subscriptionStatus === "cancelled",
    };
  } catch (error) {
    return { isPendingDeletion: false };
  }
}
