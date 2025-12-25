/**
 * Webhook Service for Slack/Discord Alerts
 * Sends real-time notifications for security events and important updates
 */

import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Webhook URLs from environment
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export type AlertType = 
  | 'user_suspended'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'new_subscription'
  | 'subscription_cancelled'
  | 'high_value_signup'
  | 'system_error';

export interface AlertPayload {
  type: AlertType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: number;
  userEmail?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Send alert to configured webhooks (Slack and/or Discord)
 */
export async function sendWebhookAlert(payload: AlertPayload): Promise<boolean> {
  const timestamp = payload.timestamp || new Date().toISOString();
  
  const results = await Promise.allSettled([
    SLACK_WEBHOOK_URL ? sendSlackAlert(payload, timestamp) : Promise.resolve(true),
    DISCORD_WEBHOOK_URL ? sendDiscordAlert(payload, timestamp) : Promise.resolve(true),
  ]);

  const success = results.every(r => r.status === 'fulfilled' && r.value);
  
  if (!success) {
    console.error('[Webhook] Some alerts failed to send:', results);
  }
  
  return success;
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(payload: AlertPayload, timestamp: string): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) return true;

  try {
    const color = getSlackColor(payload.severity);
    const emoji = getEmoji(payload.type);

    const slackPayload = {
      attachments: [{
        color,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${emoji} ${payload.title}`,
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: payload.message
            }
          },
          ...(payload.userEmail ? [{
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*User:*\n${payload.userEmail}`
              },
              {
                type: "mrkdwn",
                text: `*Severity:*\n${payload.severity.toUpperCase()}`
              }
            ]
          }] : []),
          ...(payload.metadata ? [{
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Details:*\n\`\`\`${JSON.stringify(payload.metadata, null, 2)}\`\`\``
            }
          }] : []),
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `ReelSpy.ai | ${new Date(timestamp).toLocaleString('de-DE')}`
              }
            ]
          }
        ]
      }]
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });

    if (!response.ok) {
      console.error('[Slack] Webhook failed:', response.status, await response.text());
      return false;
    }

    console.log('[Slack] Alert sent successfully:', payload.type);
    return true;
  } catch (error) {
    console.error('[Slack] Error sending alert:', error);
    return false;
  }
}

/**
 * Send alert to Discord
 */
async function sendDiscordAlert(payload: AlertPayload, timestamp: string): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) return true;

  try {
    const color = getDiscordColor(payload.severity);
    const emoji = getEmoji(payload.type);

    const discordPayload = {
      embeds: [{
        title: `${emoji} ${payload.title}`,
        description: payload.message,
        color,
        fields: [
          ...(payload.userEmail ? [{
            name: "User",
            value: payload.userEmail,
            inline: true
          }] : []),
          {
            name: "Severity",
            value: payload.severity.toUpperCase(),
            inline: true
          },
          ...(payload.metadata ? [{
            name: "Details",
            value: `\`\`\`json\n${JSON.stringify(payload.metadata, null, 2)}\`\`\``,
            inline: false
          }] : [])
        ],
        footer: {
          text: "ReelSpy.ai Security Alert"
        },
        timestamp
      }]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      console.error('[Discord] Webhook failed:', response.status, await response.text());
      return false;
    }

    console.log('[Discord] Alert sent successfully:', payload.type);
    return true;
  } catch (error) {
    console.error('[Discord] Error sending alert:', error);
    return false;
  }
}

/**
 * Get Slack color based on severity
 */
function getSlackColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#dc2626'; // red-600
    case 'error': return '#ea580c'; // orange-600
    case 'warning': return '#ca8a04'; // yellow-600
    default: return '#2563eb'; // blue-600
  }
}

/**
 * Get Discord color based on severity (decimal format)
 */
function getDiscordColor(severity: string): number {
  switch (severity) {
    case 'critical': return 14423100; // #dc2626
    case 'error': return 15358988; // #ea580c
    case 'warning': return 13273604; // #ca8a04
    default: return 2456047; // #2563eb
  }
}

/**
 * Get emoji based on alert type
 */
function getEmoji(type: AlertType): string {
  switch (type) {
    case 'user_suspended': return '🚫';
    case 'suspicious_activity': return '⚠️';
    case 'rate_limit_exceeded': return '🔒';
    case 'new_subscription': return '💰';
    case 'subscription_cancelled': return '📉';
    case 'high_value_signup': return '🌟';
    case 'system_error': return '🔴';
    default: return '📢';
  }
}

// Convenience functions for common alerts

export async function alertUserSuspended(userId: number, reason: string): Promise<void> {
  const db = await getDb();
  let userEmail = 'Unknown';
  
  if (db) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length > 0) {
      userEmail = userResult[0].email || 'Unknown';
    }
  }

  await sendWebhookAlert({
    type: 'user_suspended',
    title: 'User Account Suspended',
    message: `Ein Benutzer wurde wegen verdächtiger Aktivitäten gesperrt.\n\n*Grund:* ${reason}`,
    severity: 'critical',
    userId,
    userEmail,
    metadata: { reason, suspendedAt: new Date().toISOString() }
  });
}

export async function alertSuspiciousActivity(userId: number, reasons: string[]): Promise<void> {
  const db = await getDb();
  let userEmail = 'Unknown';
  
  if (db) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length > 0) {
      userEmail = userResult[0].email || 'Unknown';
    }
  }

  await sendWebhookAlert({
    type: 'suspicious_activity',
    title: 'Suspicious Activity Detected',
    message: `Verdächtige Aktivitäten wurden erkannt.\n\n*Gründe:*\n${reasons.map(r => `• ${r}`).join('\n')}`,
    severity: 'warning',
    userId,
    userEmail,
    metadata: { reasons }
  });
}

export async function alertRateLimitExceeded(userId: number, limit: number, actual: number): Promise<void> {
  const db = await getDb();
  let userEmail = 'Unknown';
  
  if (db) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length > 0) {
      userEmail = userResult[0].email || 'Unknown';
    }
  }

  await sendWebhookAlert({
    type: 'rate_limit_exceeded',
    title: 'Rate Limit Exceeded',
    message: `Ein Benutzer hat das Rate-Limit überschritten.\n\n*Limit:* ${limit}\n*Tatsächlich:* ${actual}`,
    severity: 'error',
    userId,
    userEmail,
    metadata: { limit, actual, exceeded: actual - limit }
  });
}

export async function alertNewSubscription(userId: number, plan: string, amount: number): Promise<void> {
  const db = await getDb();
  let userEmail = 'Unknown';
  
  if (db) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length > 0) {
      userEmail = userResult[0].email || 'Unknown';
    }
  }

  await sendWebhookAlert({
    type: 'new_subscription',
    title: 'New Subscription! 🎉',
    message: `Ein neuer Kunde hat ein Abo abgeschlossen!\n\n*Plan:* ${plan}\n*Betrag:* €${(amount / 100).toFixed(2)}`,
    severity: 'info',
    userId,
    userEmail,
    metadata: { plan, amount: amount / 100 }
  });
}

export async function alertHighValueSignup(userId: number, referralCode?: string): Promise<void> {
  const db = await getDb();
  let userEmail = 'Unknown';
  
  if (db) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length > 0) {
      userEmail = userResult[0].email || 'Unknown';
    }
  }

  await sendWebhookAlert({
    type: 'high_value_signup',
    title: 'High-Value Signup',
    message: `Ein potenziell wertvoller Neukunde hat sich registriert!${referralCode ? `\n\n*Referral Code:* ${referralCode}` : ''}`,
    severity: 'info',
    userId,
    userEmail,
    metadata: { referralCode }
  });
}

export async function alertSystemError(error: string, context?: Record<string, any>): Promise<void> {
  await sendWebhookAlert({
    type: 'system_error',
    title: 'System Error',
    message: `Ein Systemfehler ist aufgetreten.\n\n*Fehler:* ${error}`,
    severity: 'critical',
    metadata: { error, ...context }
  });
}

/**
 * Test webhook configuration
 */
export async function testWebhooks(): Promise<{ slack: boolean; discord: boolean }> {
  const results = {
    slack: false,
    discord: false
  };

  if (SLACK_WEBHOOK_URL) {
    results.slack = await sendSlackAlert({
      type: 'suspicious_activity',
      title: 'Webhook Test',
      message: 'Dies ist ein Test der Slack-Webhook-Integration.',
      severity: 'info'
    }, new Date().toISOString());
  }

  if (DISCORD_WEBHOOK_URL) {
    results.discord = await sendDiscordAlert({
      type: 'suspicious_activity',
      title: 'Webhook Test',
      message: 'Dies ist ein Test der Discord-Webhook-Integration.',
      severity: 'info'
    }, new Date().toISOString());
  }

  return results;
}
