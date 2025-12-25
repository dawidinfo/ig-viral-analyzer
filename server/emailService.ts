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
  | "error"
  | "contact"
  | "viral_alert";

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
    contact: "#06B6D4",
    viral_alert: "#EC4899",
  };

  const typeEmojis: Record<NotificationType, string> = {
    new_signup: "🎉",
    purchase: "💰",
    suspicious_activity: "⚠️",
    account_banned: "🚫",
    high_usage: "📊",
    error: "❌",
    contact: "📧",
    viral_alert: "🔥",
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
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 24px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">
                Diese E-Mail wurde automatisch von ReelSpy.ai gesendet.
              </p>
              <p style="color: #444; font-size: 11px; margin: 10px 0 0 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.
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
    error: 0,
    contact: 0,
    viral_alert: 0,
  };

  for (const notification of notificationQueue) {
    stats[notification.type]++;
  }

  return stats;
}

/**
 * Create welcome email template for new users
 */
function createWelcomeEmailTemplate(name: string | null): string {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei ReelSpy.ai</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🚀</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Willkommen bei ReelSpy.ai!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 16px;">Deine KI-gestützte Instagram-Analyse startet jetzt</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0;">
                Hallo ${userName},<br><br>
                Schön, dass du dabei bist! 🎉 Du hast jetzt Zugang zu der leistungsstärksten KI-Analyse für Instagram Reels.
              </p>
            </td>
          </tr>
          
          <!-- Free Credits Box -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">🎁</div>
                <p style="color: #8B5CF6; font-size: 18px; font-weight: 600; margin: 0;">3 kostenlose KI-Analysen</p>
                <p style="color: #a1a1aa; font-size: 14px; margin: 5px 0 0 0;">Dein Startguthaben wartet auf dich!</p>
              </div>
            </td>
          </tr>
          
          <!-- Getting Started Steps -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0;">🎯 So startest du in 3 Schritten:</h2>
              
              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-block; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">1</div>
                  <div>
                    <p style="color: #e5e5e5; font-size: 15px; margin: 0; font-weight: 500;">Instagram-Username eingeben</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 3px 0 0 0;">Analysiere jeden öffentlichen Account</p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-block; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">2</div>
                  <div>
                    <p style="color: #e5e5e5; font-size: 15px; margin: 0; font-weight: 500;">KI-Tiefenanalyse starten</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 3px 0 0 0;">3.000+ Parameter werden analysiert</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #8B5CF6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-block; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">3</div>
                  <div>
                    <p style="color: #e5e5e5; font-size: 15px; margin: 0; font-weight: 500;">Viral-Strategien entdecken</p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 3px 0 0 0;">HAPSS, AIDA, Hopkins & mehr</p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Features -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 15px 0;">✨ Das erwartet dich:</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10B981; margin-right: 8px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">HAPSS-Framework Analyse (Hook, Attention, Problem, Solution, Story)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10B981; margin-right: 8px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">Viral Score basierend auf 47 Faktoren</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10B981; margin-right: 8px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">Copywriting-Analyse nach Hopkins, Ogilvy & Schwartz</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10B981; margin-right: 8px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">HOT-Transkription mit Hook-Insights</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10B981; margin-right: 8px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">Posting-Zeit-Analyse mit Heatmap</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10B981; margin-right: 8px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">Follower-Wachstums-Charts</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 30px 30px 30px; text-align: center;">
              <a href="https://reelspy.ai" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                🚀 Jetzt erste Analyse starten
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 25px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 24px; margin-bottom: 12px;" />
              <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 10px 0;">
                Fragen? Antworte einfach auf diese E-Mail.
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.<br>
                <a href="https://reelspy.ai/privacy" style="color: #666; text-decoration: underline;">Datenschutz</a> · 
                <a href="https://reelspy.ai/terms" style="color: #666; text-decoration: underline;">AGB</a>
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
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  name: string | null
): Promise<boolean> {
  if (!email) {
    console.warn("[Email] Cannot send welcome email - no email address provided");
    return false;
  }

  try {
    const html = createWelcomeEmailTemplate(name);
    const sent = await sendEmail(
      email,
      "🚀 Willkommen bei ReelSpy.ai – Deine 3 kostenlosen KI-Analysen warten!",
      html
    );

    console.log(`[Email] Welcome email to ${email}: ${sent ? 'sent' : 'failed'}`);
    return sent;
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    return false;
  }
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


/**
 * Send viral alert email to user
 * Triggered when a saved account shows significant growth
 */
export async function sendViralAlert(
  userEmail: string,
  username: string,
  data: {
    currentFollowers: number;
    previousFollowers: number;
    growthPercent: number;
    viralScore: number;
    platform: 'instagram' | 'tiktok' | 'youtube';
  }
): Promise<boolean> {
  const growth = data.currentFollowers - data.previousFollowers;
  const isViral = data.growthPercent > 10 || growth > 10000;
  
  const subject = isViral 
    ? `🔥 @${username} geht viral! +${growth.toLocaleString()} Follower`
    : `📈 @${username} wächst stark: +${data.growthPercent.toFixed(1)}%`;
  
  const content = `
<div style="text-align: center; margin-bottom: 24px;">
  <div style="font-size: 48px; margin-bottom: 8px;">${isViral ? '🔥' : '📈'}</div>
  <h2 style="margin: 0; font-size: 24px;">@${username}</h2>
  <p style="color: #888; margin: 8px 0 0 0;">${data.platform.charAt(0).toUpperCase() + data.platform.slice(1)}</p>
</div>

<div style="background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
  <div style="display: flex; justify-content: space-between; text-align: center;">
    <div>
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">Vorher</p>
      <p style="color: white; font-size: 24px; font-weight: bold; margin: 4px 0 0 0;">${data.previousFollowers.toLocaleString()}</p>
    </div>
    <div>
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">Jetzt</p>
      <p style="color: white; font-size: 24px; font-weight: bold; margin: 4px 0 0 0;">${data.currentFollowers.toLocaleString()}</p>
    </div>
    <div>
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">Wachstum</p>
      <p style="color: #10B981; font-size: 24px; font-weight: bold; margin: 4px 0 0 0;">+${data.growthPercent.toFixed(1)}%</p>
    </div>
  </div>
</div>

<div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
  <p style="margin: 0 0 8px 0; font-weight: 600;">Was bedeutet das?</p>
  <p style="margin: 0; color: #888; font-size: 14px;">
    ${isViral 
      ? `@${username} zeigt starkes virales Wachstum! Jetzt ist der perfekte Zeitpunkt, um den Content zu analysieren und die Erfolgsfaktoren zu verstehen.`
      : `@${username} wächst überdurchschnittlich. Behalte den Account im Auge und analysiere die neuesten Posts.`
    }
  </p>
</div>

<div style="text-align: center;">
  <a href="https://reelspy.ai/analysis?username=${username}" 
     style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Jetzt analysieren →
  </a>
</div>
`;

  return sendEmail(userEmail, subject, createEmailTemplate(
    isViral ? "Viraler Account erkannt!" : "Starkes Wachstum erkannt",
    content,
    "viral_alert"
  ));
}

/**
 * Check saved accounts for viral growth and send alerts
 * Should be called by a scheduled job
 */
export async function checkViralGrowthAlerts(): Promise<{ checked: number; alerts: number }> {
  // This function would be called by a cron job to check all saved accounts
  // and send alerts when significant growth is detected
  
  // Implementation would:
  // 1. Get all users with saved accounts
  // 2. For each saved account, compare current followers with last snapshot
  // 3. If growth > threshold, send viral alert email
  
  console.log("[ViralAlerts] Checking for viral growth...");
  
  // Placeholder - actual implementation would query the database
  return { checked: 0, alerts: 0 };
}


/**
 * Send invitation email to a new user created by admin
 */
export async function sendUserInvitation(
  email: string,
  name: string
): Promise<boolean> {
  const subject = "🎉 Du wurdest zu ReelSpy.ai eingeladen!";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei ReelSpy.ai</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Logo Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%); padding: 40px; text-align: center;">
              <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px; display: inline-block;">
                <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 48px; width: auto;" />
              </div>
              <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Willkommen bei ReelSpy.ai!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 16px;">Virale Reels und Content liefern</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #e5e5e5; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0;">
                Hallo <strong>${name || "Content Creator"}</strong>,
              </p>
              
              <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Du wurdest persönlich zu <strong style="color: #8B5CF6;">ReelSpy.ai</strong> eingeladen – der KI-gestützten Plattform für Instagram-Analyse und Viral Content!
              </p>

              <!-- CTA Box -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎁</div>
                <p style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0;">Dein Account ist bereit!</p>
                <p style="color: #888; font-size: 14px; margin: 12px 0 24px 0;">Klicke unten um dich einzuloggen und loszulegen.</p>
                
                <a href="https://reelspy.ai/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);">
                  Jetzt einloggen →
                </a>
              </div>

              <!-- Features -->
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 32px 0 16px 0;">Was dich erwartet:</p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="background: rgba(139, 92, 246, 0.2); border-radius: 8px; width: 32px; height: 32px; text-align: center; line-height: 32px;">🔍</div>
                        </td>
                        <td style="color: #a3a3a3; font-size: 14px; padding-left: 12px;">
                          <strong style="color: #e5e5e5;">KI-Analyse</strong><br>
                          3.000+ Parameter für jeden Instagram-Account
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="background: rgba(236, 72, 153, 0.2); border-radius: 8px; width: 32px; height: 32px; text-align: center; line-height: 32px;">📈</div>
                        </td>
                        <td style="color: #a3a3a3; font-size: 14px; padding-left: 12px;">
                          <strong style="color: #e5e5e5;">Viral Score & HAPSS</strong><br>
                          Verstehe warum Content viral geht
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="background: rgba(6, 182, 212, 0.2); border-radius: 8px; width: 32px; height: 32px; text-align: center; line-height: 32px;">📊</div>
                        </td>
                        <td style="color: #a3a3a3; font-size: 14px; padding-left: 12px;">
                          <strong style="color: #e5e5e5;">Follower-Tracking</strong><br>
                          Tägliches Wachstum & Engagement-Analyse
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="background: rgba(16, 185, 129, 0.2); border-radius: 8px; width: 32px; height: 32px; text-align: center; line-height: 32px;">🏆</div>
                        </td>
                        <td style="color: #a3a3a3; font-size: 14px; padding-left: 12px;">
                          <strong style="color: #e5e5e5;">Konkurrenz-Vergleich</strong><br>
                          Benchmarking gegen Top-Accounts
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Bei Fragen erreichst du uns unter <a href="mailto:support@reelspy.ai" style="color: #8B5CF6; text-decoration: none;">support@reelspy.ai</a>
              </p>
              <p style="color: #444; font-size: 11px; margin: 16px 0 0 0;">
                © 2024 ReelSpy.ai • QLIQ Marketing L.L.C.
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

  return sendEmail(email, subject, html);
}


/**
 * Weekly Performance Report Email
 * Sends a weekly summary of account performance to users
 */
export interface WeeklyReportData {
  username: string;
  followerChange: number;
  followerTotal: number;
  engagementRate: number;
  engagementChange: number;
  topReel: {
    thumbnail?: string;
    views: number;
    likes: number;
  } | null;
  reelsPosted: number;
  avgViews: number;
  recommendations: string[];
}

function createWeeklyReportTemplate(name: string | null, data: WeeklyReportData): string {
  const userName = name || "Content Creator";
  const isGrowth = data.followerChange >= 0;
  const isEngagementUp = data.engagementChange >= 0;
  
  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dein Wöchentlicher Performance Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 16px;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Wöchentlicher Report</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">@${data.username} • Diese Woche</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <p style="color: #e5e5e5; font-size: 16px; margin: 0;">
                Hey ${userName}! 👋
              </p>
              <p style="color: #a3a3a3; font-size: 14px; margin: 8px 0 0 0;">
                Hier ist dein wöchentlicher Performance-Überblick für @${data.username}:
              </p>
            </td>
          </tr>
          
          <!-- Stats Grid -->
          <tr>
            <td style="padding: 16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Follower Change -->
                  <td width="50%" style="padding: 8px;">
                    <div style="background: ${isGrowth ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)'}; border: 1px solid ${isGrowth ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #a3a3a3; font-size: 12px; margin: 0; text-transform: uppercase;">Follower</p>
                      <p style="color: ${isGrowth ? '#10B981' : '#EF4444'}; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0;">
                        ${isGrowth ? '+' : ''}${formatNumber(data.followerChange)}
                      </p>
                      <p style="color: #666; font-size: 12px; margin: 0;">Gesamt: ${formatNumber(data.followerTotal)}</p>
                    </div>
                  </td>
                  <!-- Engagement -->
                  <td width="50%" style="padding: 8px;">
                    <div style="background: ${isEngagementUp ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)'}; border: 1px solid ${isEngagementUp ? 'rgba(139,92,246,0.3)' : 'rgba(239,68,68,0.3)'}; border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #a3a3a3; font-size: 12px; margin: 0; text-transform: uppercase;">Engagement</p>
                      <p style="color: ${isEngagementUp ? '#8B5CF6' : '#EF4444'}; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0;">
                        ${data.engagementRate.toFixed(1)}%
                      </p>
                      <p style="color: #666; font-size: 12px; margin: 0;">${isEngagementUp ? '+' : ''}${data.engagementChange.toFixed(1)}% vs. letzte Woche</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <!-- Reels Posted -->
                  <td width="50%" style="padding: 8px;">
                    <div style="background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.05) 100%); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #a3a3a3; font-size: 12px; margin: 0; text-transform: uppercase;">Reels gepostet</p>
                      <p style="color: #06B6D4; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0;">
                        ${data.reelsPosted}
                      </p>
                      <p style="color: #666; font-size: 12px; margin: 0;">Diese Woche</p>
                    </div>
                  </td>
                  <!-- Avg Views -->
                  <td width="50%" style="padding: 8px;">
                    <div style="background: linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.05) 100%); border: 1px solid rgba(236,72,153,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #a3a3a3; font-size: 12px; margin: 0; text-transform: uppercase;">Ø Views</p>
                      <p style="color: #EC4899; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0;">
                        ${formatNumber(data.avgViews)}
                      </p>
                      <p style="color: #666; font-size: 12px; margin: 0;">Pro Reel</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${data.topReel ? `
          <!-- Top Reel -->
          <tr>
            <td style="padding: 16px 32px;">
              <p style="color: #e5e5e5; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">🔥 Dein Top-Reel diese Woche</p>
              <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 16px; display: flex; align-items: center;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="80" style="vertical-align: top;">
                      ${data.topReel.thumbnail ? `<img src="${data.topReel.thumbnail}" alt="Top Reel" style="width: 70px; height: 100px; object-fit: cover; border-radius: 8px;" />` : '<div style="width: 70px; height: 100px; background: #333; border-radius: 8px;"></div>'}
                    </td>
                    <td style="padding-left: 16px; vertical-align: middle;">
                      <p style="color: #e5e5e5; font-size: 14px; margin: 0;">
                        👁 <strong>${formatNumber(data.topReel.views)}</strong> Views
                      </p>
                      <p style="color: #a3a3a3; font-size: 14px; margin: 8px 0 0 0;">
                        ❤️ <strong>${formatNumber(data.topReel.likes)}</strong> Likes
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Recommendations -->
          ${data.recommendations.length > 0 ? `
          <tr>
            <td style="padding: 16px 32px;">
              <p style="color: #e5e5e5; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">💡 KI-Empfehlungen für diese Woche</p>
              <div style="background: linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 16px;">
                ${data.recommendations.map((rec, i) => `
                  <p style="color: #e5e5e5; font-size: 13px; margin: ${i === 0 ? '0' : '12px 0 0 0'};">
                    ✨ ${rec}
                  </p>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai/analysis?username=${data.username}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Vollständige Analyse ansehen →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Du erhältst diese E-Mail, weil du @${data.username} auf ReelSpy.ai trackst.
              </p>
              <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">
                <a href="https://reelspy.ai/dashboard" style="color: #8B5CF6; text-decoration: none;">Einstellungen</a> • 
                <a href="https://reelspy.ai/unsubscribe" style="color: #8B5CF6; text-decoration: none;">Abmelden</a>
              </p>
              <p style="color: #444; font-size: 11px; margin: 16px 0 0 0;">
                © 2024 ReelSpy.ai • QLIQ Marketing L.L.C.
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
 * Send weekly performance report to user
 */
export async function sendWeeklyReport(
  email: string,
  name: string | null,
  data: WeeklyReportData
): Promise<boolean> {
  const subject = `📊 Dein Wöchentlicher Report für @${data.username}`;
  const html = createWeeklyReportTemplate(name, data);
  
  return sendEmail(email, subject, html);
}

/**
 * Send engagement drop alert
 */
export async function sendEngagementAlert(
  email: string,
  name: string | null,
  username: string,
  currentEngagement: number,
  previousEngagement: number,
  dropPercent: number
): Promise<boolean> {
  const userName = name || "Content Creator";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Engagement Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Engagement Alert</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">@${username}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; margin: 0;">
                Hey ${userName},
              </p>
              <p style="color: #a3a3a3; font-size: 14px; margin: 16px 0;">
                Wir haben einen <strong style="color: #EF4444;">Rückgang von ${dropPercent.toFixed(0)}%</strong> im Engagement für @${username} festgestellt.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td width="50%" style="padding: 8px;">
                    <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #a3a3a3; font-size: 12px; margin: 0;">Vorher</p>
                      <p style="color: #e5e5e5; font-size: 24px; font-weight: 700; margin: 8px 0 0 0;">${previousEngagement.toFixed(1)}%</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 8px;">
                    <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                      <p style="color: #a3a3a3; font-size: 12px; margin: 0;">Jetzt</p>
                      <p style="color: #EF4444; font-size: 24px; font-weight: 700; margin: 8px 0 0 0;">${currentEngagement.toFixed(1)}%</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #a3a3a3; font-size: 14px; margin: 16px 0;">
                <strong style="color: #e5e5e5;">Was du tun kannst:</strong>
              </p>
              <ul style="color: #a3a3a3; font-size: 14px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Analysiere deine letzten Posts auf Hook-Qualität</li>
                <li style="margin-bottom: 8px;">Überprüfe deine Posting-Zeiten</li>
                <li style="margin-bottom: 8px;">Teste neue Content-Formate</li>
              </ul>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai/analysis?username=${username}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Jetzt analysieren →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Du erhältst diese E-Mail, weil du Alerts für @${username} aktiviert hast.
              </p>
              <p style="color: #444; font-size: 11px; margin: 16px 0 0 0;">
                © 2024 ReelSpy.ai • QLIQ Marketing L.L.C.
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

  return sendEmail(email, `⚠️ Engagement-Rückgang bei @${username}`, html);
}


/**
 * Drip Campaign E-Mails
 * Automatische E-Mail-Serie für neue Nutzer
 */

// Drip Campaign Types
export type DripEmailType = 
  | "drip_day1_welcome"
  | "drip_day3_tips"
  | "drip_day7_contentplan"
  | "drip_day14_upgrade";

/**
 * Day 1: Welcome & First Analysis
 */
function createDripDay1Template(name: string | null): string {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Starte jetzt deine erste Analyse!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Bereit für deine erste Analyse?</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Du hast dich gestern bei ReelSpy.ai angemeldet – super! 🎉<br><br>
                Hast du schon deine <strong style="color: #8B5CF6;">erste KI-Analyse</strong> gestartet?
              </p>
              
              <!-- Quick Start Box -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">⚡ Quick-Start in 30 Sekunden:</p>
                <ol style="color: #a3a3a3; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Gib einen Instagram-Username ein (z.B. @cristiano)</li>
                  <li style="margin-bottom: 8px;">Klicke auf "KI-Analyse starten"</li>
                  <li style="margin-bottom: 0;">Erhalte sofort deinen Viral Score + Insights</li>
                </ol>
              </div>
              
              <!-- Pro Tip -->
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="color: #10B981; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">💡 Pro-Tipp:</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  Analysiere zuerst einen erfolgreichen Account in deiner Nische. So siehst du sofort, was bei deiner Zielgruppe funktioniert!
                </p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);">
                      🚀 Jetzt erste Analyse starten
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
                Du hast noch <strong style="color: #8B5CF6;">3 kostenlose Analysen</strong> übrig!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.
              </p>
              <p style="color: #444; font-size: 11px; margin: 12px 0 0 0;">
                <a href="https://reelspy.ai/unsubscribe" style="color: #444; text-decoration: underline;">Abmelden</a>
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
 * Day 3: Tips & Best Practices
 */
function createDripDay3Template(name: string | null): string {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3 Geheimnisse viraler Reels</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🔥</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">3 Geheimnisse viraler Reels</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Was Top-Creator anders machen</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Nach der Analyse von <strong style="color: #8B5CF6;">50.000+ viralen Reels</strong> haben wir diese 3 Muster entdeckt:
              </p>
              
              <!-- Secret 1 -->
              <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8B5CF6; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                <p style="color: #8B5CF6; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🎯 GEHEIMNIS #1</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Der 3-Sekunden-Hook</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  87% der viralen Reels haben einen Hook, der in den ersten 3 Sekunden eine Frage aufwirft oder ein Problem anspricht. Unsere KI analysiert genau diese Hook-Qualität.
                </p>
              </div>
              
              <!-- Secret 2 -->
              <div style="background: rgba(236, 72, 153, 0.1); border-left: 4px solid #EC4899; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                <p style="color: #EC4899; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">📈 GEHEIMNIS #2</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Das HAPSS-Framework</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  <strong>H</strong>ook → <strong>A</strong>ttention → <strong>P</strong>roblem → <strong>S</strong>olution → <strong>S</strong>tory<br>
                  Diese Struktur nutzen 92% der Top-Performer. ReelSpy analysiert jeden Reel auf dieses Framework.
                </p>
              </div>
              
              <!-- Secret 3 -->
              <div style="background: rgba(6, 182, 212, 0.1); border-left: 4px solid #06B6D4; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                <p style="color: #06B6D4; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⏰ GEHEIMNIS #3</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Posting-Zeit ist alles</p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0;">
                  Die beste Zeit zum Posten variiert je nach Nische. Unsere Heatmap zeigt dir genau, wann deine Zielgruppe am aktivsten ist.
                </p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(236, 72, 153, 0.3);">
                      🔍 Diese Muster in deiner Nische finden
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.
              </p>
              <p style="color: #444; font-size: 11px; margin: 12px 0 0 0;">
                <a href="https://reelspy.ai/unsubscribe" style="color: #444; text-decoration: underline;">Abmelden</a>
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
 * Day 7: Content Plan Feature
 */
function createDripDay7Template(name: string | null): string {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dein 30-Tage Content-Plan wartet!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #06B6D4 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Nie wieder Content-Ideen suchen!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">KI-generierter 30-Tage Content-Plan</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Kennst du das? Du sitzt vor dem Handy und weißt nicht, was du posten sollst... 😅<br><br>
                <strong style="color: #10B981;">Das muss nicht sein!</strong>
              </p>
              
              <!-- Feature Box -->
              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                  🤖 KI Content-Plan Generator
                </p>
                <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 16px 0; text-align: center;">
                  Unser Pro-Feature erstellt dir einen kompletten 30-Tage-Plan:
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">30 einzigartige Reel-Ideen für deine Nische</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">Fertige Hooks nach HAPSS-Framework</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">Optimale Posting-Zeiten für jeden Tag</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">Hashtag-Strategie pro Post</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10B981; margin-right: 8px;">✓</span>
                      <span style="color: #e5e5e5; font-size: 14px;">PDF-Export zum Ausdrucken</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Testimonial -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="color: #a3a3a3; font-size: 14px; font-style: italic; margin: 0 0 12px 0;">
                  "Der Content-Plan hat mir so viel Zeit gespart! Ich poste jetzt jeden Tag ohne nachzudenken und mein Engagement ist um 47% gestiegen."
                </p>
                <p style="color: #8B5CF6; font-size: 13px; font-weight: 600; margin: 0;">
                  — Sarah M., Fitness-Creator
                </p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #06B6D4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);">
                      📅 Content-Plan Generator freischalten
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.
              </p>
              <p style="color: #444; font-size: 11px; margin: 12px 0 0 0;">
                <a href="https://reelspy.ai/unsubscribe" style="color: #444; text-decoration: underline;">Abmelden</a>
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
 * Day 14: Upgrade Offer
 */
function createDripDay14Template(name: string | null): string {
  const userName = name || "Content Creator";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exklusives Angebot: 20% Rabatt!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%); padding: 40px; text-align: center;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 40px; margin-bottom: 20px;" />
              <div style="font-size: 48px; margin-bottom: 15px;">🎁</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Exklusiv für dich: 20% Rabatt!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Nur noch 48 Stunden gültig</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hey ${userName}! 👋
              </p>
              
              <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Du bist jetzt seit 2 Wochen bei ReelSpy.ai dabei. 🎉<br><br>
                Als Dankeschön haben wir ein <strong style="color: #F59E0B;">exklusives Angebot</strong> für dich:
              </p>
              
              <!-- Promo Code Box -->
              <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%); border: 2px dashed #F59E0B; border-radius: 16px; padding: 32px; margin: 24px 0; text-align: center;">
                <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 12px 0;">Dein persönlicher Rabatt-Code:</p>
                <div style="background: #0a0a0a; border-radius: 8px; padding: 16px; margin: 0 0 16px 0;">
                  <p style="color: #F59E0B; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 4px; font-family: monospace;">REELSPY20</p>
                </div>
                <p style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0;">20% auf alle Pro-Pläne!</p>
                <p style="color: #EF4444; font-size: 13px; margin: 12px 0 0 0;">⏰ Nur noch 48 Stunden gültig</p>
              </div>
              
              <!-- What you get -->
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 24px 0 16px 0;">Was du mit Pro bekommst:</p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;"><strong>Unbegrenzte</strong> KI-Analysen</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">30-Tage Content-Plan Generator</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">Follower-Wachstums-Tracking</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">HAPSS + AIDA Framework-Analyse</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #10B981; margin-right: 10px;">✓</span>
                    <span style="color: #e5e5e5; font-size: 14px;">PDF-Export aller Analysen</span>
                  </td>
                </tr>
              </table>
              
              <!-- Price comparison -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 8px 0;">Pro-Plan mit deinem Rabatt:</p>
                <p style="margin: 0;">
                  <span style="color: #666; font-size: 18px; text-decoration: line-through;">€29/Monat</span>
                  <span style="color: #10B981; font-size: 28px; font-weight: 700; margin-left: 12px;">€23,20/Monat</span>
                </p>
                <p style="color: #F59E0B; font-size: 13px; margin: 8px 0 0 0;">Du sparst €69,60 im Jahr!</p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://reelspy.ai/pricing" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 10px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">
                      🚀 Jetzt 20% sparen
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666; font-size: 12px; text-align: center; margin: 16px 0 0 0;">
                Code <strong>REELSPY20</strong> beim Checkout eingeben
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #111; padding: 24px; text-align: center; border-top: 1px solid #333;">
              <img src="https://reelspy.ai/logo.svg" alt="ReelSpy.ai" style="height: 20px; margin-bottom: 12px;" />
              <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 ReelSpy.ai • QLIQ Marketing L.L.C.
              </p>
              <p style="color: #444; font-size: 11px; margin: 12px 0 0 0;">
                <a href="https://reelspy.ai/unsubscribe" style="color: #444; text-decoration: underline;">Abmelden</a>
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
 * Send Drip Campaign Email
 */
export async function sendDripEmail(
  email: string,
  name: string | null,
  type: DripEmailType,
  userId?: number
): Promise<boolean> {
  if (!email) {
    console.warn("[Email] Cannot send drip email - no email address provided");
    return false;
  }

  const templates: Record<DripEmailType, { subject: string; template: (name: string | null) => string }> = {
    drip_day1_welcome: {
      subject: "🎯 Bereit für deine erste KI-Analyse?",
      template: createDripDay1Template
    },
    drip_day3_tips: {
      subject: "🔥 3 Geheimnisse viraler Reels (aus 50.000+ Analysen)",
      template: createDripDay3Template
    },
    drip_day7_contentplan: {
      subject: "📅 Nie wieder Content-Ideen suchen – KI macht's für dich!",
      template: createDripDay7Template
    },
    drip_day14_upgrade: {
      subject: "🎁 Exklusiv für dich: 20% Rabatt auf Pro!",
      template: createDripDay14Template
    }
  };

  const config = templates[type];
  if (!config) {
    console.error(`[Email] Unknown drip email type: ${type}`);
    return false;
  }

  try {
    let html = config.template(name);
    
    // Add tracking pixel if userId is provided
    if (userId) {
      const trackingPixel = `<img src="https://reelspy.ai/api/email/track.gif?u=${userId}&e=${type}&t=${Date.now()}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
      // Insert tracking pixel before closing body tag
      html = html.replace('</body>', `${trackingPixel}</body>`);
      
      // Replace all CTA links with tracked versions
      const baseUrl = 'https://reelspy.ai';
      html = html.replace(
        /href="(https:\/\/reelspy\.ai[^"]*)"/g,
        (match, url) => `href="${baseUrl}/api/email/click?u=${userId}&e=${type}&r=${encodeURIComponent(url)}"`
      );
    }
    
    const sent = await sendEmail(email, config.subject, html);
    console.log(`[Email] Drip email ${type} to ${email}: ${sent ? 'sent' : 'failed'}`);
    return sent;
  } catch (error) {
    console.error(`[Email] Error sending drip email ${type}:`, error);
    return false;
  }
}

/**
 * Send test preview of all drip emails to admin
 */
export async function sendDripEmailPreview(): Promise<{ success: boolean; sent: string[] }> {
  const types: DripEmailType[] = [
    "drip_day1_welcome",
    "drip_day3_tips", 
    "drip_day7_contentplan",
    "drip_day14_upgrade"
  ];
  
  const sent: string[] = [];
  
  for (const type of types) {
    const success = await sendDripEmail(ADMIN_EMAIL, "Admin", type);
    if (success) {
      sent.push(type);
    }
    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { success: sent.length === types.length, sent };
}
