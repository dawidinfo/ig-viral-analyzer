/**
 * Abuse Protection Service
 * Rate limiting, auto-suspension, and admin notifications for suspicious activity
 */

import { getDb } from "../db";
import { users, usageTracking } from "../../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { sendAdminNotification } from "../emailService";
import { alertUserSuspended, alertSuspiciousActivity, alertRateLimitExceeded } from "./webhookService";

// Rate limits per plan (analyses per hour / per day)
export const RATE_LIMITS = {
  free: { perHour: 5, perDay: 10, warningThreshold: 8 },
  starter: { perHour: 20, perDay: 100, warningThreshold: 80 },
  pro: { perHour: 50, perDay: 300, warningThreshold: 250 },
  business: { perHour: 100, perDay: 1000, warningThreshold: 800 },
  enterprise: { perHour: 500, perDay: 5000, warningThreshold: 4000 },
} as const;

// Suspicious activity thresholds
const SUSPICIOUS_THRESHOLDS = {
  rapidFireRequests: 10, // More than 10 requests in 1 minute = suspicious
  unusualHourlySpike: 3, // 3x normal usage in an hour = suspicious
  dailyOverage: 1.5, // 1.5x daily limit = auto-suspend
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
  reason?: string;
  suspended?: boolean;
  suspensionReason?: string;
}

export interface UserActivity {
  userId: number;
  email: string;
  name: string;
  plan: string;
  requestsLastHour: number;
  requestsToday: number;
  requestsLastMinute: number;
  isSuspicious: boolean;
  suspiciousReasons: string[];
  // Extended fields for admin panel
  status?: 'active' | 'suspended' | 'warned';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  suspendedAt?: string;
  reason?: string;
}

/**
 * Check if a user is rate limited and track their request
 */
export async function checkRateLimit(
  userId: number,
  actionType: string = 'analysis'
): Promise<RateLimitResult> {
  const db = await getDb();
  if (!db) {
    return { allowed: true, remaining: 999, resetIn: 0 };
  }

  try {
    // Get user info
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return { allowed: false, remaining: 0, resetIn: 0, reason: 'User not found' };
    }

    const user = userResult[0];

    // Check if user is already suspended
    if (user.status === 'suspended' || user.status === 'banned') {
      return {
        allowed: false,
        remaining: 0,
        resetIn: 0,
        suspended: true,
        suspensionReason: 'Dein Account wurde wegen auffälliger Aktivität vorübergehend gesperrt. Ein Admin prüft deinen Account.'
      };
    }

    const plan = (user.plan || 'free') as keyof typeof RATE_LIMITS;
    const limits = RATE_LIMITS[plan] || RATE_LIMITS.free;

    // Get usage counts
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Count requests in different time windows
    const [hourlyCount, dailyCount, minuteCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(usageTracking)
        .where(and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.actionType, actionType),
          gte(usageTracking.createdAt, oneHourAgo)
        )),
      db.select({ count: sql<number>`count(*)` })
        .from(usageTracking)
        .where(and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.actionType, actionType),
          gte(usageTracking.createdAt, oneDayAgo)
        )),
      db.select({ count: sql<number>`count(*)` })
        .from(usageTracking)
        .where(and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.actionType, actionType),
          gte(usageTracking.createdAt, oneMinuteAgo)
        ))
    ]);

    const requestsLastHour = Number(hourlyCount[0]?.count || 0);
    const requestsToday = Number(dailyCount[0]?.count || 0);
    const requestsLastMinute = Number(minuteCount[0]?.count || 0);

    // Check for suspicious activity
    const suspiciousReasons: string[] = [];
    
    if (requestsLastMinute >= SUSPICIOUS_THRESHOLDS.rapidFireRequests) {
      suspiciousReasons.push(`${requestsLastMinute} Anfragen in 1 Minute (Rapid-Fire)`);
    }
    
    if (requestsLastHour >= limits.perHour * SUSPICIOUS_THRESHOLDS.unusualHourlySpike) {
      suspiciousReasons.push(`${requestsLastHour} Anfragen/Stunde (${SUSPICIOUS_THRESHOLDS.unusualHourlySpike}x über Limit)`);
    }

    // Auto-suspend if way over daily limit
    if (requestsToday >= limits.perDay * SUSPICIOUS_THRESHOLDS.dailyOverage) {
      await suspendUser(userId, user.email || '', user.name || '', suspiciousReasons, requestsToday, limits.perDay);
      return {
        allowed: false,
        remaining: 0,
        resetIn: 0,
        suspended: true,
        suspensionReason: 'Dein Account wurde wegen ungewöhnlich hoher Aktivität vorübergehend gesperrt. Ein Admin wird deinen Account prüfen und sich bei dir melden.'
      };
    }

    // Send warning if approaching limit
    if (requestsToday >= limits.warningThreshold && requestsToday < limits.perDay) {
      await sendUsageWarning(userId, user.email || '', user.name || '', requestsToday, limits.perDay);
    }

    // Check rate limits
    if (requestsLastHour >= limits.perHour) {
      const resetIn = Math.ceil((oneHourAgo.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000);
      
      // Log suspicious activity if they keep trying
      if (suspiciousReasons.length > 0) {
        await logSuspiciousActivity(userId, user.email || '', user.name || '', suspiciousReasons);
      }
      
      return {
        allowed: false,
        remaining: 0,
        resetIn,
        reason: `Stündliches Limit erreicht (${limits.perHour} Analysen/Stunde). Bitte warte ${Math.ceil(resetIn / 60)} Minuten.`
      };
    }

    if (requestsToday >= limits.perDay) {
      const resetIn = Math.ceil((oneDayAgo.getTime() + 24 * 60 * 60 * 1000 - now.getTime()) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetIn,
        reason: `Tägliches Limit erreicht (${limits.perDay} Analysen/Tag). Bitte warte bis morgen oder upgrade deinen Plan.`
      };
    }

    // Log suspicious activity even if allowed
    if (suspiciousReasons.length > 0) {
      await logSuspiciousActivity(userId, user.email || '', user.name || '', suspiciousReasons);
    }

    return {
      allowed: true,
      remaining: Math.min(limits.perHour - requestsLastHour, limits.perDay - requestsToday),
      resetIn: 0
    };
  } catch (error) {
    console.error('[AbuseProtection] Error checking rate limit:', error);
    return { allowed: true, remaining: 999, resetIn: 0 };
  }
}

/**
 * Suspend a user and notify admin
 */
async function suspendUser(
  userId: number,
  email: string,
  name: string,
  reasons: string[],
  actualUsage: number,
  dailyLimit: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Suspend the user
    await db.update(users)
      .set({ status: 'suspended', statusReason: `Auto-suspended: ${reasons.join(', ')}` })
      .where(eq(users.id, userId));

    console.log(`[AbuseProtection] User ${userId} (${email}) suspended for abuse`);

    // Send webhook alert
    alertUserSuspended(userId, reasons.join(', ')).catch(console.error);

    // Send admin notification
    await sendAdminNotification(
      'security',
      `🚨 SICHERHEITSWARNUNG: Account gesperrt - ${name || email}`,
      `
        <h2 style="color: #ef4444;">🚨 Automatische Account-Sperrung</h2>
        <p>Ein Account wurde wegen auffälliger Aktivität automatisch gesperrt.</p>
        
        <h3>Account-Details:</h3>
        <ul>
          <li><strong>User ID:</strong> ${userId}</li>
          <li><strong>Name:</strong> ${name || 'Nicht angegeben'}</li>
          <li><strong>E-Mail:</strong> ${email}</li>
        </ul>
        
        <h3>Verdächtige Aktivität:</h3>
        <ul>
          ${reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        
        <h3>Nutzungsstatistik:</h3>
        <ul>
          <li><strong>Tatsächliche Nutzung:</strong> ${actualUsage} Analysen heute</li>
          <li><strong>Tägliches Limit:</strong> ${dailyLimit} Analysen</li>
          <li><strong>Überschreitung:</strong> ${Math.round((actualUsage / dailyLimit - 1) * 100)}%</li>
        </ul>
        
        <p style="margin-top: 20px;">
          <a href="https://igviralana-2nevkskx.manus.space/admin" 
             style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Account im Admin-Dashboard prüfen
          </a>
        </p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Der Account wurde automatisch gesperrt. Du kannst ihn im Admin-Dashboard entsperren, 
          wenn die Aktivität legitim war.
        </p>
      `
    );
  } catch (error) {
    console.error('[AbuseProtection] Error suspending user:', error);
  }
}

/**
 * Log suspicious activity and notify admin
 */
async function logSuspiciousActivity(
  userId: number,
  email: string,
  name: string,
  reasons: string[]
): Promise<void> {
  console.log(`[AbuseProtection] Suspicious activity for user ${userId}: ${reasons.join(', ')}`);

  // Only send admin notification for serious issues (not every warning)
  if (reasons.some(r => r.includes('Rapid-Fire') || r.includes('3x'))) {
    await sendAdminNotification(
      'security',
      `⚠️ Verdächtige Aktivität: ${name || email}`,
      `
        <h2 style="color: #f59e0b;">⚠️ Verdächtige Aktivität erkannt</h2>
        <p>Ein Account zeigt ungewöhnliches Verhalten.</p>
        
        <h3>Account-Details:</h3>
        <ul>
          <li><strong>User ID:</strong> ${userId}</li>
          <li><strong>Name:</strong> ${name || 'Nicht angegeben'}</li>
          <li><strong>E-Mail:</strong> ${email}</li>
        </ul>
        
        <h3>Verdächtige Aktivität:</h3>
        <ul>
          ${reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Der Account wurde noch nicht gesperrt. Bitte prüfe die Aktivität im Admin-Dashboard.
        </p>
      `
    );
  }
}

/**
 * Send usage warning to admin when user approaches limit
 */
async function sendUsageWarning(
  userId: number,
  email: string,
  name: string,
  currentUsage: number,
  dailyLimit: number
): Promise<void> {
  // Only send once per day per user (check if we already sent)
  const warningKey = `usage_warning_${userId}_${new Date().toISOString().split('T')[0]}`;
  
  // Use a simple in-memory cache to avoid duplicate warnings
  if ((global as any)[warningKey]) return;
  (global as any)[warningKey] = true;

  console.log(`[AbuseProtection] Usage warning for user ${userId}: ${currentUsage}/${dailyLimit}`);
}

/**
 * Get user activity summary for admin dashboard
 */
export async function getUserActivitySummary(userId: number): Promise<UserActivity | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) return null;

    const user = userResult[0];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const [hourlyCount, dailyCount, minuteCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(usageTracking)
        .where(and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.createdAt, oneHourAgo)
        )),
      db.select({ count: sql<number>`count(*)` })
        .from(usageTracking)
        .where(and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.createdAt, oneDayAgo)
        )),
      db.select({ count: sql<number>`count(*)` })
        .from(usageTracking)
        .where(and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.createdAt, oneMinuteAgo)
        ))
    ]);

    const requestsLastHour = Number(hourlyCount[0]?.count || 0);
    const requestsToday = Number(dailyCount[0]?.count || 0);
    const requestsLastMinute = Number(minuteCount[0]?.count || 0);

    const plan = (user.plan || 'free') as keyof typeof RATE_LIMITS;
    const limits = RATE_LIMITS[plan] || RATE_LIMITS.free;

    const suspiciousReasons: string[] = [];
    if (requestsLastMinute >= SUSPICIOUS_THRESHOLDS.rapidFireRequests) {
      suspiciousReasons.push('Rapid-Fire Anfragen');
    }
    if (requestsLastHour >= limits.perHour * 0.8) {
      suspiciousReasons.push('Nahe am stündlichen Limit');
    }
    if (requestsToday >= limits.perDay * 0.8) {
      suspiciousReasons.push('Nahe am täglichen Limit');
    }

    // Determine severity based on activity
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (requestsToday > 100) severity = 'critical';
    else if (requestsToday > 50) severity = 'high';
    else if (requestsToday > 30) severity = 'medium';

    return {
      userId,
      email: user.email || '',
      name: user.name || '',
      plan: user.plan || 'free',
      requestsLastHour,
      requestsToday,
      requestsLastMinute,
      isSuspicious: suspiciousReasons.length > 0,
      suspiciousReasons,
      status: (user.status as 'active' | 'suspended' | 'warned') || 'active',
      severity,
      suspendedAt: user.status === 'suspended' ? new Date().toISOString() : undefined,
      reason: user.statusReason || undefined
    };
  } catch (error) {
    console.error('[AbuseProtection] Error getting user activity:', error);
    return null;
  }
}

/**
 * Get all suspicious users for admin dashboard
 */
export async function getSuspiciousUsers(): Promise<UserActivity[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get users with high activity in the last 24 hours
    const highActivityUsers = await db
      .select({
        userId: usageTracking.userId,
        count: sql<number>`count(*)`
      })
      .from(usageTracking)
      .where(gte(usageTracking.createdAt, oneDayAgo))
      .groupBy(usageTracking.userId)
      .having(sql`count(*) > 20`)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const activities: UserActivity[] = [];
    for (const { userId } of highActivityUsers) {
      if (userId) {
        const activity = await getUserActivitySummary(userId);
        if (activity) {
          activities.push(activity);
        }
      }
    }

    return activities.filter(a => a.isSuspicious);
  } catch (error) {
    console.error('[AbuseProtection] Error getting suspicious users:', error);
    return [];
  }
}

/**
 * Unsuspend a user (admin action)
 */
export async function unsuspendUser(userId: number, adminId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(users)
      .set({ status: 'active', statusReason: null })
      .where(eq(users.id, userId));

    console.log(`[AbuseProtection] User ${userId} unsuspended by admin ${adminId}`);
    return true;
  } catch (error) {
    console.error('[AbuseProtection] Error unsuspending user:', error);
    return false;
  }
}
