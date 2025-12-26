/**
 * Magic Link Authentication Service
 * Handles passwordless email authentication via magic links
 */

import { getDb } from "../db";
import { magicLinkTokens, users } from "../../drizzle/schema";
import { eq, and, gt, lt } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";

const TOKEN_EXPIRY_MINUTES = 15;
const MAX_REQUESTS_PER_HOUR = 5;

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "ReelSpy.ai <noreply@reelspy.ai>";

/**
 * Send email via Resend
 */
async function sendMagicLinkEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!resend) {
    console.warn("[MagicLink] Resend not configured - logging email instead");
    console.log(`[MagicLink] To: ${to}`);
    console.log(`[MagicLink] Subject: ${subject}`);
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
      console.error("[MagicLink] Resend error:", error);
      return false;
    }

    console.log(`[MagicLink] Email sent successfully: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[MagicLink] Failed to send email:", error);
    return false;
  }
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a unique openId for new users
 */
function generateOpenId(): string {
  return `email_${crypto.randomBytes(16).toString("hex")}`;
}

/**
 * Check rate limiting for email requests
 */
async function checkRateLimit(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Allow if no DB
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentRequests = await db
    .select()
    .from(magicLinkTokens)
    .where(
      and(
        eq(magicLinkTokens.email, email.toLowerCase()),
        gt(magicLinkTokens.createdAt, oneHourAgo)
      )
    );
  
  return recentRequests.length < MAX_REQUESTS_PER_HOUR;
}

/**
 * Create and send a magic link to the user's email
 */
export async function sendMagicLink(
  email: string,
  ipAddress?: string,
  userAgent?: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { success: false, message: "Ungültige E-Mail-Adresse" };
  }
  
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Datenbank nicht verfügbar" };
  }
  
  // Check rate limiting
  const withinLimit = await checkRateLimit(normalizedEmail);
  if (!withinLimit) {
    return { 
      success: false, 
      message: "Zu viele Anfragen. Bitte warte eine Stunde und versuche es erneut." 
    };
  }
  
  // Generate token
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
  
  // Store token in database
  await db.insert(magicLinkTokens).values({
    email: normalizedEmail,
    token,
    expiresAt,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
  
  // Build magic link URL
  const appUrl = baseUrl || process.env.VITE_APP_URL || "https://reelspy.ai";
  const magicLinkUrl = `${appUrl}/auth/verify?token=${token}`;
  
  // Send email
  const sent = await sendMagicLinkEmail(
    normalizedEmail,
    "Dein Login-Link für ReelSpy.ai",
    getMagicLinkEmailTemplate(magicLinkUrl)
  );
  
  if (sent) {
    console.log(`[MagicLink] Sent magic link to ${normalizedEmail}`);
    return { 
      success: true, 
      message: "Login-Link wurde gesendet! Prüfe dein E-Mail-Postfach." 
    };
  } else {
    return { 
      success: false, 
      message: "E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut." 
    };
  }
}

/**
 * Verify a magic link token and create/login user
 */
export async function verifyMagicLink(token: string): Promise<{
  success: boolean;
  message: string;
  user?: {
    id: number;
    openId: string;
    email: string;
    name: string | null;
  };
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Datenbank nicht verfügbar" };
  }
  
  // Find token
  const [tokenRecord] = await db
    .select()
    .from(magicLinkTokens)
    .where(eq(magicLinkTokens.token, token))
    .limit(1);
  
  if (!tokenRecord) {
    return { success: false, message: "Ungültiger oder abgelaufener Link" };
  }
  
  // Check if already used
  if (tokenRecord.used) {
    return { success: false, message: "Dieser Link wurde bereits verwendet" };
  }
  
  // Check expiration
  if (new Date() > tokenRecord.expiresAt) {
    return { success: false, message: "Dieser Link ist abgelaufen. Bitte fordere einen neuen an." };
  }
  
  // Mark token as used
  await db
    .update(magicLinkTokens)
    .set({ used: 1 })
    .where(eq(magicLinkTokens.id, tokenRecord.id));
  
  // Find or create user
  let [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, tokenRecord.email))
    .limit(1);
  
  if (!existingUser) {
    // Create new user
    const openId = generateOpenId();
    await db.insert(users).values({
      openId,
      email: tokenRecord.email,
      name: tokenRecord.email.split("@")[0], // Use email prefix as initial name
      loginMethod: "email",
      credits: 10, // Starting credits
      plan: "free",
    });
    
    // Fetch the created user
    [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);
    
    console.log(`[MagicLink] Created new user: ${tokenRecord.email}`);
    
    // Send welcome email (non-blocking)
    sendMagicLinkEmail(
      tokenRecord.email,
      "Willkommen bei ReelSpy.ai! 🎉",
      getWelcomeEmailTemplate(existingUser.name || tokenRecord.email.split("@")[0])
    ).catch(err => console.error("[MagicLink] Failed to send welcome email:", err));
  } else {
    // Update last sign in
    await db
      .update(users)
      .set({ 
        lastSignedIn: new Date(),
        loginMethod: "email",
      })
      .where(eq(users.id, existingUser.id));
    
    console.log(`[MagicLink] User logged in: ${tokenRecord.email}`);
  }
  
  return {
    success: true,
    message: "Erfolgreich eingeloggt!",
    user: {
      id: existingUser.id,
      openId: existingUser.openId,
      email: existingUser.email || tokenRecord.email,
      name: existingUser.name,
    },
  };
}

/**
 * Clean up expired tokens (call periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .delete(magicLinkTokens)
    .where(lt(magicLinkTokens.expiresAt, new Date()));
  
  // @ts-ignore - affectedRows exists on MySQL result
  const deleted = result[0]?.affectedRows || 0;
  if (deleted > 0) {
    console.log(`[MagicLink] Cleaned up ${deleted} expired tokens`);
  }
  return deleted;
}

/**
 * Magic Link Email Template
 */
function getMagicLinkEmailTemplate(magicLinkUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login bei ReelSpy.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <img src="https://reelspy.ai/logo.png" alt="ReelSpy.ai" width="48" height="48" style="display: inline-block; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Login bei ReelSpy.ai</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a0a0a0; text-align: center;">
                Klicke auf den Button unten, um dich einzuloggen. Der Link ist 15 Minuten gültig.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="${magicLinkUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                      Jetzt einloggen →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.5; color: #666666; text-align: center;">
                Falls der Button nicht funktioniert, kopiere diesen Link:<br>
                <a href="${magicLinkUrl}" style="color: #6366f1; word-break: break-all;">${magicLinkUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666666; text-align: center;">
                Du hast diesen Link nicht angefordert? Ignoriere diese E-Mail einfach.<br>
                © 2025 ReelSpy.ai - KI-gestützte Instagram Analyse
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
 * Welcome Email Template
 */
function getWelcomeEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei ReelSpy.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <img src="https://reelspy.ai/logo.png" alt="ReelSpy.ai" width="48" height="48" style="display: inline-block; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Willkommen, ${name}! 🎉</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Dein Account wurde erfolgreich erstellt. Du hast <strong style="color: #22c55e;">10 kostenlose Credits</strong> erhalten!
              </p>
              
              <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #ffffff;">So startest du:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #a0a0a0; font-size: 14px; line-height: 1.8;">
                  <li>Gib einen Instagram-Username ein</li>
                  <li>Erhalte KI-gestützte Viral-Analyse</li>
                  <li>Lerne von Top-Creatorn</li>
                </ul>
              </div>
              
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://reelspy.ai" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                      Erste Analyse starten →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666666; text-align: center;">
                Bei Fragen erreichst du uns unter support@reelspy.ai<br>
                © 2025 ReelSpy.ai - KI-gestützte Instagram Analyse
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

export default {
  sendMagicLink,
  verifyMagicLink,
  cleanupExpiredTokens,
};
