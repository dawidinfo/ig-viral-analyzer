import { getDb } from "../db";
import { users, emailTracking, emailAbTests } from "../../drizzle/schema";
import { eq, and, lt, isNull, or, sql } from "drizzle-orm";
import { sendDripEmail, DripEmailType } from "../emailService";

/**
 * Drip Campaign Configuration
 * Defines when each email should be sent after user signup
 */
const DRIP_SCHEDULE = [
  { day: 1, emailNumber: 1, type: "drip_day1_welcome" as DripEmailType },
  { day: 3, emailNumber: 2, type: "drip_day3_tips" as DripEmailType },
  { day: 7, emailNumber: 3, type: "drip_day7_contentplan" as DripEmailType },
  { day: 14, emailNumber: 4, type: "drip_day14_upgrade" as DripEmailType },
];

/**
 * A/B Test Subject Lines
 * Each email type has two variants to test
 */
const AB_TEST_SUBJECTS: Record<DripEmailType, { A: string; B: string }> = {
  drip_day1_welcome: {
    A: "🎯 Bereit für deine erste KI-Analyse?",
    B: "Hey! Deine 3 kostenlosen Analysen warten 🚀",
  },
  drip_day3_tips: {
    A: "🔥 3 Geheimnisse viraler Reels (aus 50.000+ Analysen)",
    B: "Was 92% der Top-Creator anders machen 📈",
  },
  drip_day7_contentplan: {
    A: "📅 Nie wieder Content-Ideen suchen – KI macht's für dich!",
    B: "30 Tage Content in 2 Minuten erstellen? So geht's! ⚡",
  },
  drip_day14_upgrade: {
    A: "🎁 Exklusiv für dich: 20% Rabatt auf Pro!",
    B: "Letzte Chance: Dein persönlicher 20% Rabatt läuft ab ⏰",
  },
};

/**
 * Get users who should receive a drip email today
 */
export async function getUsersForDripEmail(): Promise<{
  userId: number;
  email: string;
  name: string | null;
  emailNumber: number;
  emailType: DripEmailType;
  variant: "A" | "B";
}[]> {
  const db = await getDb();
  if (!db) return [];

  const results: {
    userId: number;
    email: string;
    name: string | null;
    emailNumber: number;
    emailType: DripEmailType;
    variant: "A" | "B";
  }[] = [];

  const now = new Date();

  for (const schedule of DRIP_SCHEDULE) {
    // Calculate the date range for this drip email
    // Users who signed up X days ago should receive email #X
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - schedule.day);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Find users who:
    // 1. Signed up on the target day
    // 2. Haven't received this email yet (lastDripEmailSent < emailNumber)
    // 3. Haven't opted out
    // 4. Have an email address
    const eligibleUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVariant: users.emailVariant,
        lastDripEmailSent: users.lastDripEmailSent,
      })
      .from(users)
      .where(
        and(
          sql`${users.createdAt} >= ${startOfDay}`,
          sql`${users.createdAt} <= ${endOfDay}`,
          lt(users.lastDripEmailSent, schedule.emailNumber),
          eq(users.emailOptOut, 0),
          sql`${users.email} IS NOT NULL AND ${users.email} != ''`
        )
      );

    for (const user of eligibleUsers) {
      if (!user.email) continue;

      // Assign A/B variant if not already assigned
      let variant = user.emailVariant as "A" | "B";
      if (!variant) {
        // Randomly assign variant (50/50 split)
        variant = Math.random() < 0.5 ? "A" : "B";
        await db
          .update(users)
          .set({ emailVariant: variant })
          .where(eq(users.id, user.id));
      }

      results.push({
        userId: user.id,
        email: user.email,
        name: user.name,
        emailNumber: schedule.emailNumber,
        emailType: schedule.type,
        variant,
      });
    }
  }

  return results;
}

/**
 * Send a drip email and track it
 */
export async function sendTrackedDripEmail(
  userId: number,
  email: string,
  name: string | null,
  emailType: DripEmailType,
  emailNumber: number,
  variant: "A" | "B"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const subject = AB_TEST_SUBJECTS[emailType][variant];

  try {
    // Send the email
    const sent = await sendDripEmail(email, name, emailType);

    if (sent) {
      // Update user's drip status
      await db
        .update(users)
        .set({
          lastDripEmailSent: emailNumber,
          lastDripEmailAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Track the email
      await db.insert(emailTracking).values({
        userId,
        emailType,
        variant,
        subject,
        opened: 0,
        clicked: 0,
        converted: 0,
      });

      // Update A/B test stats
      await updateAbTestStats(emailType, variant, "sent");

      console.log(`[DripCampaign] Sent ${emailType} (variant ${variant}) to user ${userId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`[DripCampaign] Error sending ${emailType} to user ${userId}:`, error);
    return false;
  }
}

/**
 * Update A/B test statistics
 */
async function updateAbTestStats(
  emailType: DripEmailType,
  variant: "A" | "B",
  action: "sent" | "opened" | "clicked" | "converted"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get or create the A/B test record
  const existing = await db
    .select()
    .from(emailAbTests)
    .where(eq(emailAbTests.emailType, emailType))
    .limit(1);

  if (existing.length === 0) {
    // Create new A/B test record
    const subjects = AB_TEST_SUBJECTS[emailType];
    await db.insert(emailAbTests).values({
      emailType,
      subjectA: subjects.A,
      subjectB: subjects.B,
      sentA: variant === "A" && action === "sent" ? 1 : 0,
      sentB: variant === "B" && action === "sent" ? 1 : 0,
      opensA: variant === "A" && action === "opened" ? 1 : 0,
      opensB: variant === "B" && action === "opened" ? 1 : 0,
      clicksA: variant === "A" && action === "clicked" ? 1 : 0,
      clicksB: variant === "B" && action === "clicked" ? 1 : 0,
      conversionsA: variant === "A" && action === "converted" ? 1 : 0,
      conversionsB: variant === "B" && action === "converted" ? 1 : 0,
    });
  } else {
    // Update existing record
    const field = `${action === "sent" ? "sent" : action === "opened" ? "opens" : action === "clicked" ? "clicks" : "conversions"}${variant}`;
    await db
      .update(emailAbTests)
      .set({
        [field]: sql`${emailAbTests[field as keyof typeof emailAbTests]} + 1`,
      })
      .where(eq(emailAbTests.emailType, emailType));
  }
}

/**
 * Run the drip campaign - send all pending emails
 * This should be called by a cron job daily
 */
export async function runDripCampaign(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  console.log("[DripCampaign] Starting daily drip campaign run...");

  const usersToEmail = await getUsersForDripEmail();
  let sent = 0;
  let errors = 0;

  for (const user of usersToEmail) {
    const success = await sendTrackedDripEmail(
      user.userId,
      user.email,
      user.name,
      user.emailType,
      user.emailNumber,
      user.variant
    );

    if (success) {
      sent++;
    } else {
      errors++;
    }

    // Small delay between emails to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`[DripCampaign] Completed: ${sent} sent, ${errors} errors, ${usersToEmail.length} processed`);

  return {
    processed: usersToEmail.length,
    sent,
    errors,
  };
}

/**
 * Get A/B test results for all email types
 */
export async function getAbTestResults(): Promise<{
  emailType: string;
  subjectA: string;
  subjectB: string;
  stats: {
    variant: string;
    sent: number;
    opens: number;
    openRate: number;
    clicks: number;
    clickRate: number;
    conversions: number;
    conversionRate: number;
  }[];
  winner: string | null;
  confidence: number;
}[]> {
  const db = await getDb();
  if (!db) return [];

  const tests = await db.select().from(emailAbTests);

  return tests.map((test) => {
    const openRateA = test.sentA > 0 ? (test.opensA / test.sentA) * 100 : 0;
    const openRateB = test.sentB > 0 ? (test.opensB / test.sentB) * 100 : 0;
    const clickRateA = test.opensA > 0 ? (test.clicksA / test.opensA) * 100 : 0;
    const clickRateB = test.opensB > 0 ? (test.clicksB / test.opensB) * 100 : 0;
    const convRateA = test.sentA > 0 ? (test.conversionsA / test.sentA) * 100 : 0;
    const convRateB = test.sentB > 0 ? (test.conversionsB / test.sentB) * 100 : 0;

    // Simple winner determination based on open rate
    // In production, use proper statistical significance testing
    let winner: string | null = null;
    let confidence = 0;
    const totalSent = test.sentA + test.sentB;

    if (totalSent >= 100) {
      // Need at least 100 emails for meaningful results
      const diff = Math.abs(openRateA - openRateB);
      if (diff > 5) {
        // 5% difference threshold
        winner = openRateA > openRateB ? "A" : "B";
        confidence = Math.min(95, 50 + diff * 3); // Rough confidence estimate
      }
    }

    return {
      emailType: test.emailType,
      subjectA: test.subjectA,
      subjectB: test.subjectB,
      stats: [
        {
          variant: "A",
          sent: test.sentA,
          opens: test.opensA,
          openRate: Math.round(openRateA * 10) / 10,
          clicks: test.clicksA,
          clickRate: Math.round(clickRateA * 10) / 10,
          conversions: test.conversionsA,
          conversionRate: Math.round(convRateA * 10) / 10,
        },
        {
          variant: "B",
          sent: test.sentB,
          opens: test.opensB,
          openRate: Math.round(openRateB * 10) / 10,
          clicks: test.clicksB,
          clickRate: Math.round(clickRateB * 10) / 10,
          conversions: test.conversionsB,
          conversionRate: Math.round(convRateB * 10) / 10,
        },
      ],
      winner,
      confidence: Math.round(confidence),
    };
  });
}

/**
 * Track email open (called via tracking pixel)
 */
export async function trackEmailOpen(
  userId: number,
  emailType: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Find the most recent email of this type for this user
  const tracking = await db
    .select()
    .from(emailTracking)
    .where(
      and(
        eq(emailTracking.userId, userId),
        eq(emailTracking.emailType, emailType),
        eq(emailTracking.opened, 0)
      )
    )
    .orderBy(sql`${emailTracking.createdAt} DESC`)
    .limit(1);

  if (tracking.length > 0) {
    await db
      .update(emailTracking)
      .set({
        opened: 1,
        openedAt: new Date(),
      })
      .where(eq(emailTracking.id, tracking[0].id));

    // Update A/B test stats
    if (tracking[0].variant) {
      await updateAbTestStats(
        emailType as DripEmailType,
        tracking[0].variant as "A" | "B",
        "opened"
      );
    }
  }
}

/**
 * Track email click (called when user clicks a link)
 */
export async function trackEmailClick(
  userId: number,
  emailType: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const tracking = await db
    .select()
    .from(emailTracking)
    .where(
      and(
        eq(emailTracking.userId, userId),
        eq(emailTracking.emailType, emailType),
        eq(emailTracking.clicked, 0)
      )
    )
    .orderBy(sql`${emailTracking.createdAt} DESC`)
    .limit(1);

  if (tracking.length > 0) {
    await db
      .update(emailTracking)
      .set({
        clicked: 1,
        clickedAt: new Date(),
      })
      .where(eq(emailTracking.id, tracking[0].id));

    if (tracking[0].variant) {
      await updateAbTestStats(
        emailType as DripEmailType,
        tracking[0].variant as "A" | "B",
        "clicked"
      );
    }
  }
}

/**
 * Track conversion (called when user purchases/upgrades)
 */
export async function trackEmailConversion(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Find the most recent drip email for this user that hasn't converted
  const tracking = await db
    .select()
    .from(emailTracking)
    .where(
      and(
        eq(emailTracking.userId, userId),
        eq(emailTracking.converted, 0)
      )
    )
    .orderBy(sql`${emailTracking.createdAt} DESC`)
    .limit(1);

  if (tracking.length > 0) {
    await db
      .update(emailTracking)
      .set({ converted: 1 })
      .where(eq(emailTracking.id, tracking[0].id));

    if (tracking[0].variant) {
      await updateAbTestStats(
        tracking[0].emailType as DripEmailType,
        tracking[0].variant as "A" | "B",
        "converted"
      );
    }
  }
}
