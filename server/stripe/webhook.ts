/**
 * Stripe Webhook Handler for ReelSpy.ai
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users, creditTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyPurchase } from "../emailService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("[Stripe Webhook] Missing signature");
    return res.status(400).json({ error: "Missing signature" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        console.log("[Stripe Webhook] Payment succeeded:", event.data.object.id);
        break;

      case "payment_intent.payment_failed":
        console.log("[Stripe Webhook] Payment failed:", event.data.object.id);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Stripe Webhook] Processing checkout.session.completed:", session.id);

  const userId = session.metadata?.user_id;
  const credits = parseInt(session.metadata?.credits || "0", 10);
  const packageId = session.metadata?.package_id;
  const customerEmail = session.metadata?.customer_email;
  const customerName = session.metadata?.customer_name;

  if (!userId || !credits) {
    console.error("[Stripe Webhook] Missing user_id or credits in metadata");
    return;
  }

  const userIdNum = parseInt(userId, 10);

  // Get current user
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }
  const [user] = await db.select().from(users).where(eq(users.id, userIdNum));
  if (!user) {
    console.error("[Stripe Webhook] User not found:", userId);
    return;
  }

  // Calculate new balance
  const newBalance = user.credits + credits;

  // Update user credits and Stripe customer ID
  await db
    .update(users)
    .set({
      credits: newBalance,
      totalCreditsPurchased: user.totalCreditsPurchased + credits,
      stripeCustomerId: session.customer as string || user.stripeCustomerId,
      plan: determinePlan(credits, user.plan),
    })
    .where(eq(users.id, userIdNum));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId: userIdNum,
    type: "purchase",
    amount: credits,
    balanceAfter: newBalance,
    description: `${packageId} Paket gekauft (${credits} Credits)`,
    referenceId: session.payment_intent as string,
  });

  // Send notification email
  const packageName = packageId?.charAt(0).toUpperCase() + (packageId?.slice(1) || "");
  const amount = (session.amount_total || 0) / 100;

  await notifyPurchase(
    userIdNum,
    customerEmail || user.email || "",
    packageName,
    amount,
    credits
  );

  console.log(`[Stripe Webhook] Credits added: ${credits} to user ${userId}. New balance: ${newBalance}`);
}

/**
 * Determine user plan based on credits purchased
 */
function determinePlan(creditsPurchased: number, currentPlan: string): "free" | "starter" | "pro" | "business" | "enterprise" {
  if (creditsPurchased >= 350) return "business";
  if (creditsPurchased >= 100) return "pro";
  if (creditsPurchased >= 25) return "starter";
  return currentPlan as "free" | "starter" | "pro" | "business" | "enterprise";
}
