import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Email Service
 * Sends notifications to admins for important events
 * Uses the built-in notification system
 */

// Admin email for notifications
const ADMIN_EMAIL = "qliq.marketing@proton.me";

// Notification types
export type NotificationType = 
  | "new_signup"
  | "purchase"
  | "suspicious_activity"
  | "account_banned"
  | "high_usage"
  | "error";

interface NotificationPayload {
  type: NotificationType;
  subject: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

// Store notifications in memory (will be persisted to DB later)
const notificationQueue: NotificationPayload[] = [];

/**
 * Send notification to admin
 */
export async function sendAdminNotification(
  type: NotificationType,
  subject: string,
  message: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    const notification: NotificationPayload = {
      type,
      subject,
      message,
      data,
      timestamp: new Date()
    };

    // Add to queue
    notificationQueue.push(notification);

    // Log notification
    console.log(`[Email] Admin notification: ${type} - ${subject}`);
    console.log(`[Email] Message: ${message}`);
    if (data) {
      console.log(`[Email] Data:`, JSON.stringify(data, null, 2));
    }

    // In production, this would send via email service
    // For now, we store in the notification system
    await storeNotification(notification);

    return true;
  } catch (error) {
    console.error("[Email] Error sending notification:", error);
    return false;
  }
}

/**
 * Store notification in database
 */
async function storeNotification(notification: NotificationPayload): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Store in a notifications table or log
    // For now, we just log it
    console.log(`[Email] Notification stored: ${notification.type}`);
  } catch (error) {
    console.error("[Email] Error storing notification:", error);
  }
}

/**
 * Notify admin of new user signup
 */
export async function notifyNewSignup(
  userId: number,
  email: string | null,
  name: string | null
): Promise<void> {
  await sendAdminNotification(
    "new_signup",
    "🎉 Neue Anmeldung bei ReelSpy.ai",
    `Ein neuer Benutzer hat sich registriert:
    
• Name: ${name || "Nicht angegeben"}
• E-Mail: ${email || "Nicht angegeben"}
• User ID: ${userId}
• Zeitpunkt: ${new Date().toLocaleString("de-DE")}

Der Benutzer hat 3 kostenlose KI-Analysen erhalten.`,
    { userId, email, name }
  );
}

/**
 * Notify admin of purchase/upgrade
 */
export async function notifyPurchase(
  userId: number,
  email: string | null,
  plan: string,
  amount: number,
  credits: number
): Promise<void> {
  await sendAdminNotification(
    "purchase",
    `💰 Neuer Kauf: ${plan} Plan`,
    `Ein Benutzer hat ein Upgrade durchgeführt:
    
• E-Mail: ${email || "Nicht angegeben"}
• User ID: ${userId}
• Plan: ${plan}
• Betrag: €${amount.toFixed(2)}
• Credits: ${credits}
• Zeitpunkt: ${new Date().toLocaleString("de-DE")}

Umsatz wurde verbucht.`,
    { userId, email, plan, amount, credits }
  );
}

/**
 * Notify admin of suspicious activity
 */
export async function notifySuspiciousActivity(
  userId: number,
  email: string | null,
  reason: string,
  details: string
): Promise<void> {
  await sendAdminNotification(
    "suspicious_activity",
    "⚠️ Verdächtige Aktivität erkannt",
    `Verdächtige Aktivität wurde erkannt:
    
• E-Mail: ${email || "Nicht angegeben"}
• User ID: ${userId}
• Grund: ${reason}
• Details: ${details}
• Zeitpunkt: ${new Date().toLocaleString("de-DE")}

Bitte überprüfe den Account im Admin-Dashboard.`,
    { userId, email, reason, details }
  );
}

/**
 * Notify admin when account is banned
 */
export async function notifyAccountBanned(
  userId: number,
  email: string | null,
  reason: string
): Promise<void> {
  await sendAdminNotification(
    "account_banned",
    "🚫 Account gesperrt",
    `Ein Account wurde gesperrt:
    
• E-Mail: ${email || "Nicht angegeben"}
• User ID: ${userId}
• Grund: ${reason}
• Zeitpunkt: ${new Date().toLocaleString("de-DE")}`,
    { userId, email, reason }
  );
}

/**
 * Notify admin of high usage (potential abuse)
 */
export async function notifyHighUsage(
  userId: number,
  email: string | null,
  analysesCount: number,
  timeframe: string
): Promise<void> {
  await sendAdminNotification(
    "high_usage",
    "📊 Hohe Nutzung erkannt",
    `Ein Benutzer zeigt ungewöhnlich hohe Nutzung:
    
• E-Mail: ${email || "Nicht angegeben"}
• User ID: ${userId}
• Analysen: ${analysesCount} in ${timeframe}
• Zeitpunkt: ${new Date().toLocaleString("de-DE")}

Dies könnte auf API-Missbrauch hindeuten.`,
    { userId, email, analysesCount, timeframe }
  );
}

/**
 * Notify admin of system error
 */
export async function notifyError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
): Promise<void> {
  await sendAdminNotification(
    "error",
    `❌ Systemfehler: ${errorType}`,
    `Ein Fehler ist aufgetreten:
    
• Typ: ${errorType}
• Nachricht: ${errorMessage}
• Zeitpunkt: ${new Date().toLocaleString("de-DE")}
${context ? `• Kontext: ${JSON.stringify(context)}` : ""}`,
    { errorType, errorMessage, context }
  );
}

/**
 * Get recent notifications (for admin dashboard)
 */
export function getRecentNotifications(limit: number = 50): NotificationPayload[] {
  return notificationQueue.slice(-limit).reverse();
}

/**
 * Get notification count by type
 */
export function getNotificationStats(): Record<NotificationType, number> {
  const stats: Record<NotificationType, number> = {
    new_signup: 0,
    purchase: 0,
    suspicious_activity: 0,
    account_banned: 0,
    high_usage: 0,
    error: 0
  };

  for (const notification of notificationQueue) {
    stats[notification.type]++;
  }

  return stats;
}
