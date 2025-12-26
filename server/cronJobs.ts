import { sendWeeklyReport, ReportType } from "./weeklyReportService";
import { runDripCampaign } from "./services/dripCampaignService";
import { runScheduledTracking } from "./scheduledTracking";
import { runDailyDataCollection, getCacheStatisticsSummary } from "./services/historicalDataService";
import { runScheduledBackup } from "./backupService";
import { getDb } from "./db";
import { users, savedAnalyses } from "../drizzle/schema";
import { eq, isNull, or, desc } from "drizzle-orm";

/**
 * Cron Job Service for Weekly Email Reports
 * 
 * Schedule:
 * - Sunday 19:00 (UTC+1): "Deine Woche startet mit diesen Insights"
 * - Tuesday 10:00 (UTC+1): "Mid-Week Performance Check"  
 * - Thursday 10:00 (UTC+1): "Wochenend-Boost: Das solltest du wissen"
 */

interface CronSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  hour: number;
  minute: number;
  reportType: ReportType;
}

const SCHEDULES: CronSchedule[] = [
  { dayOfWeek: 0, hour: 18, minute: 0, reportType: "sunday_weekly" }, // Sunday 19:00 CET = 18:00 UTC
  { dayOfWeek: 2, hour: 9, minute: 0, reportType: "tuesday_midweek" }, // Tuesday 10:00 CET = 09:00 UTC
  { dayOfWeek: 4, hour: 9, minute: 0, reportType: "thursday_boost" }, // Thursday 10:00 CET = 09:00 UTC
];

// Track last run to prevent duplicate sends
const lastRunTimes: Map<ReportType, number> = new Map();

/**
 * Check if it's time to send a specific report
 */
function shouldSendReport(schedule: CronSchedule): boolean {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  
  // Check if it's the right day and time (within 5 minute window)
  if (currentDay !== schedule.dayOfWeek) return false;
  if (currentHour !== schedule.hour) return false;
  if (currentMinute < schedule.minute || currentMinute > schedule.minute + 5) return false;
  
  // Check if we already sent this report today
  const lastRun = lastRunTimes.get(schedule.reportType);
  if (lastRun) {
    const hoursSinceLastRun = (Date.now() - lastRun) / (1000 * 60 * 60);
    if (hoursSinceLastRun < 23) return false; // Don't send more than once per day
  }
  
  return true;
}

/**
 * Get all users eligible for email reports
 */
async function getEligibleUsers() {
  const db = await getDb();
  if (!db) {
    console.log("[CronJobs] Database not available");
    return [];
  }
  
  try {
    // Get users who haven't opted out and have email
    const allUsers = await db
      .select()
      .from(users);
    
    const eligibleUsers = [];
    
    for (const user of allUsers) {
      if (!user.email) continue;
      // Note: emailOptOut field doesn't exist yet, so we send to all users with email
      
      // Get user's saved analyses
      const analyses = await db
        .select()
        .from(savedAnalyses)
        .where(eq(savedAnalyses.userId, user.id))
        .orderBy(desc(savedAnalyses.createdAt))
        .limit(10);
      
      eligibleUsers.push({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan || "free",
        savedAccounts: analyses.map(a => ({
          username: a.username,
          followerCount: a.followerCount || 0,
          viralScore: a.viralScore || 0
        }))
      });
    }
    
    return eligibleUsers;
  } catch (error) {
    console.error("[CronJobs] Error getting eligible users:", error);
    return [];
  }
}

/**
 * Get trending accounts from recent data
 */
async function getTrendingAccounts() {
  // For now, return demo trending accounts
  // In production, this would query the followerSnapshots table
  return [
    { username: "garyvee", growth: 15, viralScore: 92 },
    { username: "tonyrobbins", growth: 12, viralScore: 88 },
    { username: "alexhormozi", growth: 18, viralScore: 95 }
  ];
}

/**
 * Send reports to all eligible users
 */
async function sendReportsToAllUsers(reportType: ReportType): Promise<{ sent: number; failed: number }> {
  console.log("[CronJobs] Starting " + reportType + " report batch...");
  
  const eligibleUsers = await getEligibleUsers();
  const trendingAccounts = await getTrendingAccounts();
  
  let sent = 0;
  let failed = 0;
  
  for (const user of eligibleUsers) {
    const success = await sendWeeklyReport(reportType, user, trendingAccounts);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Rate limiting - wait 200ms between emails
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log("[CronJobs] " + reportType + " batch complete: " + sent + " sent, " + failed + " failed");
  
  // Update last run time
  lastRunTimes.set(reportType, Date.now());
  
  return { sent, failed };
}

/**
 * Check and run scheduled reports
 * Call this function every minute from the main server
 */
export async function checkAndRunScheduledReports(): Promise<void> {
  for (const schedule of SCHEDULES) {
    if (shouldSendReport(schedule)) {
      console.log("[CronJobs] Triggering " + schedule.reportType + " report...");
      await sendReportsToAllUsers(schedule.reportType);
    }
  }
}

/**
 * Manually trigger a specific report (for testing)
 */
export async function triggerReport(reportType: ReportType): Promise<{ sent: number; failed: number }> {
  return sendReportsToAllUsers(reportType);
}

/**
 * Get next scheduled report time
 */
export function getNextScheduledReport(): { reportType: ReportType; scheduledTime: Date } | null {
  const now = new Date();
  let nextReport: { reportType: ReportType; scheduledTime: Date } | null = null;
  let minDiff = Infinity;
  
  for (const schedule of SCHEDULES) {
    const scheduledDate = new Date(now);
    scheduledDate.setUTCHours(schedule.hour, schedule.minute, 0, 0);
    
    // Adjust to the correct day of week
    const daysUntil = (schedule.dayOfWeek - now.getUTCDay() + 7) % 7;
    if (daysUntil === 0 && scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 7);
    } else {
      scheduledDate.setDate(scheduledDate.getDate() + daysUntil);
    }
    
    const diff = scheduledDate.getTime() - now.getTime();
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextReport = {
        reportType: schedule.reportType,
        scheduledTime: scheduledDate
      };
    }
  }
  
  return nextReport;
}

// Start the cron checker (runs every minute)
let cronInterval: NodeJS.Timeout | null = null;

export function startCronJobs(): void {
  if (cronInterval) {
    console.log("[CronJobs] Already running");
    return;
  }
  
  console.log("[CronJobs] Starting cron job scheduler...");
  
  // Check every minute
  cronInterval = setInterval(async () => {
    await checkAndRunScheduledReports();
  }, 60 * 1000);
  
  // Also run immediately on start
  checkAndRunScheduledReports();
  
  const nextReport = getNextScheduledReport();
  if (nextReport) {
    console.log("[CronJobs] Next scheduled report: " + nextReport.reportType + " at " + nextReport.scheduledTime.toISOString());
  }
  
  // Start automatic database backup every 15 minutes
  startBackupCron();
}

export function stopCronJobs(): void {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("[CronJobs] Stopped cron job scheduler");
  }
  stopBackupCron();
}

/**
 * Start automatic database backup twice daily (8:00 and 20:00 UTC)
 */
function startBackupCron(): void {
  if (backupInterval) {
    console.log("[CronJobs] Backup cron already running");
    return;
  }
  
  console.log("[CronJobs] Starting automatic backup (twice daily at 8:00 and 20:00 UTC)...");
  
  // Check every hour if it's time for a backup
  backupInterval = setInterval(async () => {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    
    // Run backup at 8:00 and 20:00 UTC (within first 5 minutes of the hour)
    if ((hour === 8 || hour === 20) && minute < 5) {
      // Check if we already ran a backup in the last hour
      if (lastBackupRun) {
        const hoursSinceLastBackup = (Date.now() - lastBackupRun.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastBackup < 1) {
          return; // Already ran recently
        }
      }
      await runBackupJob();
    }
  }, 60 * 60 * 1000); // Check every hour
  
  // Run first backup after 1 minute delay (to let server fully start)
  setTimeout(async () => {
    await runBackupJob();
  }, 60 * 1000);
}

function stopBackupCron(): void {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log("[CronJobs] Stopped backup cron");
  }
}

async function runBackupJob(): Promise<void> {
  try {
    console.log("[CronJobs] Running scheduled backup...");
    const result = await runScheduledBackup();
    lastBackupRun = new Date();
    
    if (result.success) {
      console.log(`[CronJobs] Backup completed: ID ${result.backupId}`);
    } else {
      console.error(`[CronJobs] Backup failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[CronJobs] Backup error:", error);
  }
}

// Track last drip campaign run
let lastDripCampaignRun: Date | null = null;
let lastFollowerTrackingRun: Date | null = null;
let lastDataCollectionRun: Date | null = null;
let lastBackupRun: Date | null = null;
let backupInterval: NodeJS.Timeout | null = null;

/**
 * Run daily drip campaign
 * Should be called once per day
 */
export async function runDailyDripCampaign(): Promise<{
  success: boolean;
  message: string;
  stats?: { processed: number; sent: number; errors: number };
}> {
  const minInterval = 12 * 60 * 60 * 1000; // 12 hours minimum between runs

  if (lastDripCampaignRun && Date.now() - lastDripCampaignRun.getTime() < minInterval) {
    const nextRun = new Date(lastDripCampaignRun.getTime() + minInterval);
    return {
      success: false,
      message: `Drip campaign already ran recently. Next run available at ${nextRun.toISOString()}`,
    };
  }

  try {
    console.log("[CronJobs] Starting daily drip campaign...");
    const stats = await runDripCampaign();
    lastDripCampaignRun = new Date();

    return {
      success: true,
      message: `Drip campaign completed: ${stats.sent} emails sent, ${stats.errors} errors`,
      stats,
    };
  } catch (error) {
    console.error("[CronJobs] Drip campaign error:", error);
    return {
      success: false,
      message: `Drip campaign failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Run daily follower tracking
 */
export async function runDailyFollowerTracking(): Promise<{
  success: boolean;
  message: string;
  stats?: { processed: number; updated: number; errors: number };
}> {
  const minInterval = 12 * 60 * 60 * 1000; // 12 hours minimum between runs

  if (lastFollowerTrackingRun && Date.now() - lastFollowerTrackingRun.getTime() < minInterval) {
    const nextRun = new Date(lastFollowerTrackingRun.getTime() + minInterval);
    return {
      success: false,
      message: `Follower tracking already ran recently. Next run available at ${nextRun.toISOString()}`,
    };
  }

  try {
    console.log("[CronJobs] Starting daily follower tracking...");
    const result = await runScheduledTracking();
    lastFollowerTrackingRun = new Date();

    return {
      success: true,
      message: `Follower tracking completed: ${result.successful} accounts updated, ${result.failed} errors`,
      stats: {
        processed: result.totalAccounts,
        updated: result.successful,
        errors: result.failed,
      },
    };
  } catch (error) {
    console.error("[CronJobs] Follower tracking error:", error);
    return {
      success: false,
      message: `Follower tracking failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Run daily historical data collection
 * Collects data for profiles in the collection queue
 */
export async function runDailyDataCollectionJob(): Promise<{
  success: boolean;
  message: string;
  stats?: { collected: number; errors: number; apiCallsSaved: number };
}> {
  const minInterval = 12 * 60 * 60 * 1000; // 12 hours minimum between runs

  if (lastDataCollectionRun && Date.now() - lastDataCollectionRun.getTime() < minInterval) {
    const nextRun = new Date(lastDataCollectionRun.getTime() + minInterval);
    return {
      success: false,
      message: `Data collection already ran recently. Next run available at ${nextRun.toISOString()}`,
    };
  }

  try {
    console.log("[CronJobs] Starting daily historical data collection...");
    const result = await runDailyDataCollection();
    lastDataCollectionRun = new Date();

    return {
      success: true,
      message: `Data collection completed: ${result.collected} profiles collected, ${result.apiCallsSaved} API calls saved`,
      stats: result,
    };
  } catch (error) {
    console.error("[CronJobs] Data collection error:", error);
    return {
      success: false,
      message: `Data collection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Run all daily jobs
 */
export async function runAllDailyJobs(): Promise<{
  dripCampaign: { success: boolean; message: string };
  followerTracking: { success: boolean; message: string };
  dataCollection: { success: boolean; message: string };
}> {
  const [dripResult, trackingResult, dataCollectionResult] = await Promise.all([
    runDailyDripCampaign(),
    runDailyFollowerTracking(),
    runDailyDataCollectionJob(),
  ]);

  return {
    dripCampaign: dripResult,
    followerTracking: trackingResult,
    dataCollection: dataCollectionResult,
  };
}

/**
 * Get cron job status
 */
export function getCronJobStatus(): {
  dripCampaign: { lastRun: Date | null; nextAvailable: Date | null };
  followerTracking: { lastRun: Date | null; nextAvailable: Date | null };
  dataCollection: { lastRun: Date | null; nextAvailable: Date | null };
  weeklyReports: { nextScheduled: { reportType: ReportType; scheduledTime: Date } | null };
} {
  const minInterval = 12 * 60 * 60 * 1000;
  
  return {
    dripCampaign: {
      lastRun: lastDripCampaignRun,
      nextAvailable: lastDripCampaignRun ? new Date(lastDripCampaignRun.getTime() + minInterval) : null,
    },
    followerTracking: {
      lastRun: lastFollowerTrackingRun,
      nextAvailable: lastFollowerTrackingRun ? new Date(lastFollowerTrackingRun.getTime() + minInterval) : null,
    },
    dataCollection: {
      lastRun: lastDataCollectionRun,
      nextAvailable: lastDataCollectionRun ? new Date(lastDataCollectionRun.getTime() + minInterval) : null,
    },
    weeklyReports: {
      nextScheduled: getNextScheduledReport(),
    },
  };
}

/**
 * Get cache statistics for admin dashboard
 */
export async function getCacheStats(): Promise<{
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalCostSaved: number;
  totalActualCost: number;
  byPlatform: Record<string, any>;
}> {
  return getCacheStatisticsSummary(30);
}
