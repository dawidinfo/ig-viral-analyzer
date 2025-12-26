import { getDb } from "./db";
import { databaseBackups, savedAnalyses, savedContentPlans, users } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Backup Service - Automatic and manual database backups
 * Runs twice daily (8:00 and 20:00 UTC) to create snapshots of user data
 */

interface BackupResult {
  success: boolean;
  backupId?: number;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restored?: {
    savedAnalyses: number;
    notes: number;
    contentPlans: number;
  };
  error?: string;
}

/**
 * Create a full backup of all user data
 */
export async function createFullBackup(
  createdBy: string = "system",
  description?: string
): Promise<BackupResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    console.log("[Backup] Starting full backup...");

    // Fetch all data to backup
    const allUsers = await db.select().from(users);
    const allSavedAnalyses = await db.select().from(savedAnalyses);
    const allContentPlans = await db.select().from(savedContentPlans);
    
    // Notes are stored in savedAnalyses as a field, not separate table
    const allNotes: any[] = [];

    // Create backup data object
    const backupData = {
      users: allUsers,
      savedAnalyses: allSavedAnalyses,
      notes: allNotes,
      contentPlans: allContentPlans,
    };

    // Calculate size
    const sizeBytes = Buffer.byteLength(JSON.stringify(backupData), "utf8");

    // Insert backup record
    const result = await db.insert(databaseBackups).values({
      backupType: description ? "manual" : "full",
      backupData: backupData,
      savedAnalysesCount: allSavedAnalyses.length,
      notesCount: allNotes.length,
      contentPlansCount: allContentPlans.length,
      sizeBytes: sizeBytes,
      description: description,
      status: "completed",
      createdBy: createdBy,
    });

    const backupId = Number((result as any)[0]?.insertId || 0);

    console.log(`[Backup] Full backup completed. ID: ${backupId}, Size: ${(sizeBytes / 1024).toFixed(2)} KB`);
    console.log(`[Backup] Stats: ${allUsers.length} users, ${allSavedAnalyses.length} analyses, ${allNotes.length} notes, ${allContentPlans.length} content plans`);

    return { success: true, backupId };
  } catch (error) {
    console.error("[Backup] Error creating backup:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get list of backups
 */
export async function getBackupsList(limit: number = 50): Promise<{
  success: boolean;
  backups: any[];
  error?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, backups: [], error: "Database not available" };
  }

  try {
    const backups = await db
      .select({
        id: databaseBackups.id,
        backupType: databaseBackups.backupType,
        status: databaseBackups.status,
        savedAnalysesCount: databaseBackups.savedAnalysesCount,
        notesCount: databaseBackups.notesCount,
        contentPlansCount: databaseBackups.contentPlansCount,
        sizeBytes: databaseBackups.sizeBytes,
        description: databaseBackups.description,
        createdBy: databaseBackups.createdBy,
        restoredAt: databaseBackups.restoredAt,
        restoredBy: databaseBackups.restoredBy,
        createdAt: databaseBackups.createdAt,
      })
      .from(databaseBackups)
      .orderBy(desc(databaseBackups.createdAt))
      .limit(limit);

    return { success: true, backups };
  } catch (error) {
    console.error("[Backup] Error fetching backups:", error);
    return { success: false, backups: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Restore from a backup
 */
export async function restoreFromBackup(
  backupId: number,
  restoredBy: string = "admin",
  options: {
    restoreSavedAnalyses?: boolean;
    restoreNotes?: boolean;
    restoreContentPlans?: boolean;
  } = {}
): Promise<RestoreResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  const {
    restoreSavedAnalyses: doRestoreAnalyses = true,
    restoreNotes: doRestoreNotes = true,
    restoreContentPlans: doRestorePlans = true,
  } = options;

  try {
    console.log(`[Backup] Starting restore from backup ID: ${backupId}`);

    // Get the backup
    const backup = await db
      .select()
      .from(databaseBackups)
      .where(eq(databaseBackups.id, backupId))
      .limit(1);

    if (backup.length === 0) {
      return { success: false, error: "Backup nicht gefunden" };
    }

    const backupData = backup[0].backupData as any;
    if (!backupData) {
      return { success: false, error: "Backup enthält keine Daten" };
    }

    let restoredAnalyses = 0;
    let restoredNotes = 0;
    let restoredPlans = 0;

    // Restore saved analyses
    if (doRestoreAnalyses && backupData.savedAnalyses && backupData.savedAnalyses.length > 0) {
      console.log(`[Backup] Restoring ${backupData.savedAnalyses.length} saved analyses...`);
      
      for (const analysis of backupData.savedAnalyses) {
        try {
          // Check if already exists
          const existing = await db
            .select()
            .from(savedAnalyses)
            .where(eq(savedAnalyses.id, analysis.id))
            .limit(1);

          if (existing.length === 0) {
            // Insert new
            await db.insert(savedAnalyses).values({
              ...analysis,
              id: undefined, // Let DB assign new ID
            });
            restoredAnalyses++;
          }
        } catch (e) {
          console.error(`[Backup] Error restoring analysis ${analysis.id}:`, e);
        }
      }
    }

    // Restore content plans
    if (doRestorePlans && backupData.contentPlans && backupData.contentPlans.length > 0) {
      console.log(`[Backup] Restoring ${backupData.contentPlans.length} content plans...`);
      
      for (const plan of backupData.contentPlans) {
        try {
          const existing = await db
            .select()
            .from(savedContentPlans)
            .where(eq(savedContentPlans.id, plan.id))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(savedContentPlans).values({
              ...plan,
              id: undefined,
            });
            restoredPlans++;
          }
        } catch (e) {
          console.error(`[Backup] Error restoring content plan ${plan.id}:`, e);
        }
      }
    }

    // Notes are stored within savedAnalyses, no separate restore needed
    // The notes field in savedAnalyses will be restored with the analyses

    // Update backup status
    await db
      .update(databaseBackups)
      .set({
        status: "restored",
        restoredAt: new Date(),
        restoredBy: restoredBy,
      })
      .where(eq(databaseBackups.id, backupId));

    console.log(`[Backup] Restore completed: ${restoredAnalyses} analyses, ${restoredNotes} notes, ${restoredPlans} content plans`);

    return {
      success: true,
      restored: {
        savedAnalyses: restoredAnalyses,
        notes: restoredNotes,
        contentPlans: restoredPlans,
      },
    };
  } catch (error) {
    console.error("[Backup] Error restoring backup:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Cleanup old backups, keeping only the most recent ones
 */
export async function cleanupOldBackups(keepCount: number = 96): Promise<{
  success: boolean;
  deletedCount?: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Get IDs of backups to keep (most recent)
    const backupsToKeep = await db
      .select({ id: databaseBackups.id })
      .from(databaseBackups)
      .orderBy(desc(databaseBackups.createdAt))
      .limit(keepCount);

    const keepIds = backupsToKeep.map((b) => b.id);

    if (keepIds.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Delete old backups
    const result = await db
      .delete(databaseBackups)
      .where(
        sql`${databaseBackups.id} NOT IN (${sql.join(keepIds.map(id => sql`${id}`), sql`, `)})`
      );

    const deletedCount = Number((result as any)[0]?.affectedRows || 0);
    console.log(`[Backup] Cleaned up ${deletedCount} old backups, keeping ${keepCount}`);

    return { success: true, deletedCount };
  } catch (error) {
    console.error("[Backup] Error cleaning up backups:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Run scheduled backup (called by cron job)
 */
export async function runScheduledBackup(): Promise<BackupResult> {
  try {
    // Create backup
    const result = await createFullBackup("system", undefined);

    // Cleanup old backups (keep last 14 = 7 days of twice-daily backups)
    if (result.success) {
      await cleanupOldBackups(14);
    }

    return result;
  } catch (error) {
    console.error("[Backup] Scheduled backup error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
