import { Resend } from "resend";

/**
 * Weekly Report Email Service
 * Sends engaging, story-driven emails at optimal times:
 * - Sunday 19:00: "Deine Woche startet mit diesen Insights"
 * - Tuesday 10:00: "Mid-Week Performance Check"
 * - Thursday 10:00: "Wochenend-Boost: Das solltest du wissen"
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "ReelSpy.ai <noreply@reelspy.ai>";
const LOGO_URL = "https://reelspy.ai/logo.svg";
const APP_URL = "https://reelspy.ai";

export type ReportType = "sunday_weekly" | "tuesday_midweek" | "thursday_boost";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  plan: string;
  savedAccounts: Array<{
    username: string;
    followerCount: number;
    viralScore: number;
  }>;
}

interface TrendingAccount {
  username: string;
  growth: number;
  viralScore: number;
}

interface ReportContent {
  subject: string;
  emoji: string;
  headline: string;
  subheadline: string;
  intro: string;
  tip: string;
  ctaText: string;
  ctaSubtext: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function generateUnsubscribeToken(userId: number): string {
  const secret = process.env.JWT_SECRET || "reelspy-secret";
  const data = userId.toString() + "-" + secret + "-unsubscribe";
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getReportContent(
  reportType: ReportType,
  trendingCount: number,
  totalAnalyses: number
): ReportContent {
  if (reportType === "sunday_weekly") {
    return {
      subject: "🚀 Deine Woche startet mit diesen Insights",
      emoji: "🚀",
      headline: "Bereit für eine virale Woche?",
      subheadline: "Die wichtigsten Trends und deine Performance auf einen Blick",
      intro: "Eine neue Woche, neue Chancen viral zu gehen! Ich habe die Daten der letzten 7 Tage analysiert und " + (trendingCount > 0 ? "einige spannende Trends" : "wichtige Insights") + " für dich gefunden.",
      tip: "Die besten Posting-Zeiten für Montag sind 7-9 Uhr (Pendler) und 12-13 Uhr (Mittagspause). Nutze einen starken Hook in den ersten 0.5 Sekunden!",
      ctaText: "Woche planen →",
      ctaSubtext: "Starte mit einer KI-Analyse deiner Konkurrenz"
    };
  } else if (reportType === "tuesday_midweek") {
    return {
      subject: "📊 Mid-Week Check: So läuft deine Woche",
      emoji: "📊",
      headline: "Halbzeit-Check für deine Content-Woche",
      subheadline: "Zeit für einen kurzen Performance-Blick",
      intro: "Die Woche ist halb rum – perfekter Zeitpunkt für einen Reality-Check! " + (totalAnalyses > 0 ? "Du hast bereits " + totalAnalyses + " Analysen durchgeführt." : "Hast du diese Woche schon analysiert?"),
      tip: "Mittwoch und Donnerstag haben die höchsten Engagement-Raten. Poste heute zwischen 11-13 Uhr für maximale Reichweite!",
      ctaText: "Performance checken →",
      ctaSubtext: "Sieh wie deine Accounts performen"
    };
  } else {
    return {
      subject: "🔥 Wochenend-Boost: Das musst du wissen",
      emoji: "🔥",
      headline: "Letzte Chance vor dem Wochenende!",
      subheadline: "Diese Insights bringen dich ins Wochenende",
      intro: "Das Wochenende steht vor der Tür – und damit die beste Zeit für viralen Content! Samstag und Sonntag haben 23% höhere Engagement-Raten.",
      tip: "Wochenend-Content performt am besten zwischen 10-12 Uhr und 19-21 Uhr. Nutze emotionale Hooks – am Wochenende sind Menschen empfänglicher für Storytelling!",
      ctaText: "Wochenend-Content planen →",
      ctaSubtext: "Analysiere die Top-Performer für Inspiration"
    };
  }
}

function createTrendingAccountsHtml(trendingAccounts: TrendingAccount[]): string {
  if (trendingAccounts.length === 0) return "";
  
  let accountRows = "";
  trendingAccounts.slice(0, 3).forEach((acc, i) => {
    const borderStyle = i < 2 ? "border-bottom: 1px solid #2a2a3a;" : "";
    accountRows += '<div style="padding: 12px 0; ' + borderStyle + '">' +
      '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
      '<td width="40"><div style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px;">' + (i + 1) + '</div></td>' +
      '<td><div style="color: #ffffff; font-weight: 500;">@' + acc.username + '</div><div style="color: #10b981; font-size: 13px;">+' + acc.growth + '% Wachstum</div></td>' +
      '<td align="right"><div style="color: #7c3aed; font-weight: 600;">' + acc.viralScore + '</div><div style="color: #6b7280; font-size: 12px;">Viral Score</div></td>' +
      '</tr></table></div>';
  });
  
  return '<tr><td style="padding: 0 40px 30px 40px;">' +
    '<div style="background: linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.1) 100%); border: 1px solid rgba(124,58,237,0.3); border-radius: 12px; padding: 24px;">' +
    '<h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">🔥 Diese Woche explodiert</h2>' +
    accountRows +
    '</div></td></tr>';
}

function createSavedAccountsHtml(savedAccounts: UserData["savedAccounts"]): string {
  if (savedAccounts.length === 0) return "";
  
  let accountRows = "";
  savedAccounts.slice(0, 5).forEach(acc => {
    accountRows += '<tr>' +
      '<td style="padding: 12px 16px; color: #ffffff; font-size: 14px; border-bottom: 1px solid #2a2a3a;">@' + acc.username + '</td>' +
      '<td style="padding: 12px 16px; color: #9ca3af; font-size: 14px; text-align: right; border-bottom: 1px solid #2a2a3a;">' + formatNumber(acc.followerCount) + '</td>' +
      '<td style="padding: 12px 16px; color: #7c3aed; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #2a2a3a;">' + acc.viralScore + '</td>' +
    '</tr>';
  });
  
  return '<tr><td style="padding: 0 40px 30px 40px;">' +
    '<h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">📊 Deine beobachteten Accounts</h2>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 12px; overflow: hidden;">' +
    '<tr style="background: #2a2a3a;">' +
    '<td style="padding: 12px 16px; color: #9ca3af; font-size: 12px; font-weight: 600;">ACCOUNT</td>' +
    '<td style="padding: 12px 16px; color: #9ca3af; font-size: 12px; font-weight: 600; text-align: right;">FOLLOWER</td>' +
    '<td style="padding: 12px 16px; color: #9ca3af; font-size: 12px; font-weight: 600; text-align: right;">VIRAL SCORE</td>' +
    '</tr>' + accountRows + '</table></td></tr>';
}

function createPremiumTeaserHtml(isPremium: boolean): string {
  if (isPremium) return "";
  
  return '<tr><td style="padding: 0 40px 30px 40px;">' +
    '<div style="background: linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.15) 100%); border: 1px dashed rgba(124,58,237,0.5); border-radius: 12px; padding: 24px; text-align: center;">' +
    '<div style="font-size: 32px; margin-bottom: 12px;">🔒</div>' +
    '<h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Mit Pro hättest du auch gesehen...</h3>' +
    '<ul style="color: #9ca3af; font-size: 14px; text-align: left; margin: 16px 0; padding-left: 20px; line-height: 1.8;">' +
    '<li>Welche Hooks diese Woche am besten performten</li>' +
    '<li>Die optimalen Posting-Zeiten für deine Nische</li>' +
    '<li>KI-generierte Caption-Vorschläge</li>' +
    '<li>Detaillierte Konkurrenz-Analyse</li>' +
    '</ul>' +
    '<a href="' + APP_URL + '/pricing" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Jetzt upgraden →</a>' +
    '</div></td></tr>';
}

export function createWeeklyReportTemplate(
  reportType: ReportType,
  user: UserData,
  trendingAccounts: TrendingAccount[]
): string {
  const isPremium = user.plan !== "free";
  const reportContent = getReportContent(reportType, trendingAccounts.length, user.savedAccounts.length);
  const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const userName = user.name || "Creator";
  const unsubscribeUrl = APP_URL + "/unsubscribe?email=" + encodeURIComponent(user.email) + "&token=" + generateUnsubscribeToken(user.id);
  
  const trendingHtml = createTrendingAccountsHtml(trendingAccounts);
  const savedAccountsHtml = createSavedAccountsHtml(user.savedAccounts);
  const premiumTeaserHtml = createPremiumTeaserHtml(isPremium);
  
  return '<!DOCTYPE html>' +
'<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + reportContent.subject + '</title></head>' +
'<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">' +
'<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;"><tr><td align="center">' +
'<table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3a;">' +
'<tr><td style="padding: 30px 40px; background: linear-gradient(135deg, #1a1a2e 0%, #12121a 100%); border-bottom: 1px solid #2a2a3a;">' +
'<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
'<td><img src="' + LOGO_URL + '" alt="ReelSpy.ai" style="height: 32px; width: auto;" /></td>' +
'<td align="right"><span style="color: #6b7280; font-size: 12px;">' + dateStr + '</span></td>' +
'</tr></table></td></tr>' +
'<tr><td style="padding: 40px; text-align: center; background: linear-gradient(180deg, #1a1a2e 0%, transparent 100%);">' +
'<div style="font-size: 56px; margin-bottom: 16px;">' + reportContent.emoji + '</div>' +
'<h1 style="color: #ffffff; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; line-height: 1.3;">' + reportContent.headline + '</h1>' +
'<p style="color: #9ca3af; margin: 0; font-size: 16px; line-height: 1.5;">' + reportContent.subheadline + '</p></td></tr>' +
'<tr><td style="padding: 0 40px 30px 40px;">' +
'<p style="color: #e5e7eb; font-size: 15px; line-height: 1.7; margin: 0;">Hey ' + userName + ' 👋</p>' +
'<p style="color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 16px 0 0 0;">' + reportContent.intro + '</p></td></tr>' +
trendingHtml +
savedAccountsHtml +
premiumTeaserHtml +
'<tr><td style="padding: 0 40px 30px 40px;">' +
'<div style="background: #1a1a2e; border-left: 4px solid #06b6d4; border-radius: 0 12px 12px 0; padding: 20px;">' +
'<h3 style="color: #06b6d4; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">💡 Tipp der Woche</h3>' +
'<p style="color: #e5e7eb; margin: 0; font-size: 14px; line-height: 1.6;">' + reportContent.tip + '</p></div></td></tr>' +
'<tr><td style="padding: 0 40px 40px 40px; text-align: center;">' +
'<a href="' + APP_URL + '/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">' + reportContent.ctaText + '</a>' +
'<p style="color: #6b7280; font-size: 13px; margin: 16px 0 0 0;">' + reportContent.ctaSubtext + '</p></td></tr>' +
'<tr><td style="background: #0a0a0f; padding: 30px 40px; border-top: 1px solid #2a2a3a;">' +
'<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
'<td><img src="' + LOGO_URL + '" alt="ReelSpy.ai" style="height: 24px; width: auto; opacity: 0.5;" /></td>' +
'<td align="right">' +
'<a href="' + APP_URL + '" style="color: #6b7280; text-decoration: none; font-size: 12px; margin-right: 16px;">Website</a>' +
'<a href="' + APP_URL + '/dashboard" style="color: #6b7280; text-decoration: none; font-size: 12px; margin-right: 16px;">Dashboard</a>' +
'<a href="' + APP_URL + '/pricing" style="color: #6b7280; text-decoration: none; font-size: 12px;">Pricing</a></td></tr></table>' +
'<p style="color: #4b5563; font-size: 11px; margin: 20px 0 0 0; line-height: 1.6;">' +
'Du erhältst diese E-Mail, weil du dich bei ReelSpy.ai angemeldet hast.<br>' +
'<a href="' + unsubscribeUrl + '" style="color: #6b7280; text-decoration: underline;">E-Mails abbestellen</a> · ' +
'<a href="' + APP_URL + '/privacy" style="color: #6b7280; text-decoration: underline;">Datenschutz</a></p>' +
'<p style="color: #374151; font-size: 10px; margin: 12px 0 0 0;">© 2025 QLIQ Marketing L.L.C. · Dubai, UAE</p></td></tr>' +
'</table></td></tr></table></body></html>';
}

export async function sendWeeklyReport(
  reportType: ReportType,
  user: UserData,
  trendingAccounts: TrendingAccount[] = []
): Promise<boolean> {
  if (!resend || !user.email) {
    console.log("[WeeklyReport] Cannot send - no email or Resend not configured");
    return false;
  }
  
  try {
    const html = createWeeklyReportTemplate(reportType, user, trendingAccounts);
    const content = getReportContent(reportType, trendingAccounts.length, user.savedAccounts.length);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email],
      subject: content.subject,
      html: html
    });
    
    if (error) {
      console.error("[WeeklyReport] Error sending to " + user.email + ":", error);
      return false;
    }
    
    console.log("[WeeklyReport] Sent " + reportType + " to " + user.email + " (ID: " + data?.id + ")");
    return true;
  } catch (error) {
    console.error("[WeeklyReport] Failed to send:", error);
    return false;
  }
}

export { getReportContent, generateUnsubscribeToken };
