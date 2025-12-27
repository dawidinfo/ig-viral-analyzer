/**
 * Database Backup Service
 * Exports all important tables to JSON and stores in S3
 */

import { getDb } from '../db';
import { storagePut, storageGet } from '../storage';
import { 
  users, 
  savedAnalyses, 
  creditTransactions, 
  usageTracking,
  followerSnapshots,
  revenueTracking,
  adminAuditLog,
  User
} from '../../drizzle/schema';

export interface BackupMetadata {
  id: string;
  createdAt: string;
  size: number;
  tables: string[];
  recordCounts: Record<string, number>;
  url?: string;
}

export interface BackupData {
  metadata: {
    createdAt: string;
    version: string;
    tables: string[];
  };
  data: {
    users: any[];
    savedAnalyses: any[];
    creditTransactions: any[];
    usageTracking: any[];
    followerSnapshots: any[];
    revenueTracking: any[];
    adminAuditLog: any[];
  };
}

/**
 * Create a full database backup and upload to S3
 */
export async function createBackup(): Promise<BackupMetadata> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const now = new Date();
  const backupId = `backup-${now.toISOString().replace(/[:.]/g, '-')}`;
  
  console.log(`[Backup] Starting backup ${backupId}...`);

  // Export all tables
  const [
    usersData,
    savedAnalysesData,
    creditTransactionsData,
    usageTrackingData,
    followerSnapshotsData,
    revenueTrackingData,
    adminAuditLogData
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(savedAnalyses),
    db.select().from(creditTransactions),
    db.select().from(usageTracking),
    db.select().from(followerSnapshots),
    db.select().from(revenueTracking),
    db.select().from(adminAuditLog)
  ]);

  // Sanitize user data (remove sensitive fields for backup)
  const sanitizedUsers = usersData.map((user: User) => ({
    ...user,
    stripeCustomerId: user.stripeCustomerId ? '[ENCRYPTED]' : null,
    stripeSubscriptionId: user.stripeSubscriptionId ? '[ENCRYPTED]' : null,
  }));

  const backupData: BackupData = {
    metadata: {
      createdAt: now.toISOString(),
      version: '1.0',
      tables: [
        'users',
        'savedAnalyses', 
        'creditTransactions',
        'usageTracking',
        'followerSnapshots',
        'revenueTracking',
        'adminAuditLog'
      ]
    },
    data: {
      users: sanitizedUsers,
      savedAnalyses: savedAnalysesData,
      creditTransactions: creditTransactionsData,
      usageTracking: usageTrackingData,
      followerSnapshots: followerSnapshotsData,
      revenueTracking: revenueTrackingData,
      adminAuditLog: adminAuditLogData
    }
  };

  // Convert to JSON
  const jsonData = JSON.stringify(backupData, null, 2);
  const size = Buffer.byteLength(jsonData, 'utf8');

  // Upload to S3
  const s3Key = `backups/${backupId}.json`;
  const { url } = await storagePut(s3Key, jsonData, 'application/json');

  console.log(`[Backup] Backup ${backupId} completed. Size: ${(size / 1024).toFixed(2)} KB`);

  const metadata: BackupMetadata = {
    id: backupId,
    createdAt: now.toISOString(),
    size,
    tables: backupData.metadata.tables,
    recordCounts: {
      users: sanitizedUsers.length,
      savedAnalyses: savedAnalysesData.length,
      creditTransactions: creditTransactionsData.length,
      usageTracking: usageTrackingData.length,
      followerSnapshots: followerSnapshotsData.length,
      revenueTracking: revenueTrackingData.length,
      adminAuditLog: adminAuditLogData.length
    },
    url
  };

  // Store metadata for listing
  await storeBackupMetadata(metadata);

  return metadata;
}

/**
 * Store backup metadata in a separate file for quick listing
 */
async function storeBackupMetadata(metadata: BackupMetadata): Promise<void> {
  try {
    const existingList = await getBackupList();
    existingList.unshift(metadata);
    if (existingList.length > 50) {
      existingList.pop();
    }
    await storagePut(
      'backups/metadata.json',
      JSON.stringify(existingList, null, 2),
      'application/json'
    );
  } catch (error) {
    console.error('[Backup] Failed to store metadata:', error);
  }
}

/**
 * Get list of all backups
 */
export async function getBackupList(): Promise<BackupMetadata[]> {
  try {
    const { url } = await storageGet('backups/metadata.json');
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.log('[Backup] No existing backup list found');
    return [];
  }
}

/**
 * Get download URL for a specific backup
 */
export async function getBackupDownloadUrl(backupId: string): Promise<string> {
  const { url } = await storageGet(`backups/${backupId}.json`);
  return url;
}

/**
 * Delete a backup
 */
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const existingList = await getBackupList();
    const updatedList = existingList.filter(b => b.id !== backupId);
    await storagePut(
      'backups/metadata.json',
      JSON.stringify(updatedList, null, 2),
      'application/json'
    );
    return true;
  } catch (error) {
    console.error('[Backup] Failed to delete backup:', error);
    return false;
  }
}
