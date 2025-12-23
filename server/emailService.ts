import { Resend } from "resend";

/**
 * Email Service
 * Sends notifications to admins for important events using Resend
 */

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Admin email for notifications
const ADMIN_EMAIL = "qliq.marketing@proton.me";

// Sender email (verified domain at Resend)
const FROM_EMAIL = "ReelSpy.ai <noreply@reelspy.ai>";

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

// Store notifications in memory for dashboard
const notificationQueue: NotificationPayload[] = [];

/**
 * Send email via Resend
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Resend not configured - logging email instead");
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Body: ${html}`);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }

    console.log(`[Email] Sent successfully: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

/**
 * Create HTML email template
 */
function createEmailTemplate(title: string, content: string, type: NotificationType): string {
  const typeColors: Record<NotificationType, string> = {
    new_signup: "#10B981",
    purchase: "#8B5CF6",
    suspicious_activity: "#F59E0B",
    account_banned: "#EF4444",
    high_usage: "#3B82F6",
    error: "#EF4444",
  };

  const typeEmojis: Record<NotificationType, string> = {
    new_signup: "🎉",
    purchase: "💰",
    suspicious_activity: "⚠️",
    account_banned: "🚫",
    high_usage: "📊",
    error: "❌",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${typeColors[type]} 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">${typeEmojis[type]}</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <div style="color: #e5e5e5; font-size: 15px; line-height: 1.6; white-space: pre-line;">
${content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Diese E-Mail wurde automatisch von ReelSpy.ai gesendet.
              </p>
              <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                <a href="https://reelspy.ai/admin" style="color: #8B5CF6; text-decoration: none;">Admin Dashboard öffnen</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

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
    
    // Keep only last 100 notifications
    if (notificationQueue.length > 100) {
      notificationQueue.shift();
    }

    // Create HTML email
    const html = createEmailTemplate(subject, message, type);

    // Send email
    const sent = await sendEmail(ADMIN_EMAIL, subject, html);

    console.log(`[Email] Admin notification: ${type} - ${subject} (sent: ${sent})`);

    return sent;
  } catch (error) {
    console.error("[Email] Error sending notification:", error);
    return false;
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

/**
 * Test email sending (for validation)
 */
export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: "Resend not configured - RESEND_API_KEY missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: "✅ ReelSpy.ai E-Mail-Test",
      html: createEmailTemplate(
        "E-Mail-Test erfolgreich",
        `Die E-Mail-Konfiguration funktioniert korrekt.

• Zeitpunkt: ${new Date().toLocaleString("de-DE")}
• Service: Resend
• Status: Aktiv

Du erhältst ab jetzt automatische Benachrichtigungen bei:
- Neuen Anmeldungen
- Käufen und Upgrades
- Verdächtigen Aktivitäten
- Account-Sperrungen`,
        "new_signup"
      ),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Unknown error" };
  }
}
