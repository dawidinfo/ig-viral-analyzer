import { sendWeeklyReport, ReportType } from "./weeklyReportService";
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
}

export function stopCronJobs(): void {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("[CronJobs] Stopped cron job scheduler");
  }
}
