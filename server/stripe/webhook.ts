/**
 * Stripe Webhook Handler for ReelSpy.ai
 * Handles subscription lifecycle events
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users, creditTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyPurchase } from "../emailService";
import { getPlanById } from "./products";

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
      // Subscription created (first payment successful)
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Subscription renewed (recurring payment)
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      // Subscription payment failed
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Subscription cancelled
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Subscription updated (plan change, etc.)
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
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
 * Handle successful checkout session (new subscription)
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Stripe Webhook] Processing checkout.session.completed:", session.id);

  // Only handle subscription mode
  if (session.mode !== "subscription") {
    console.log("[Stripe Webhook] Not a subscription checkout, skipping");
    return;
  }

  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;
  const billingPeriod = session.metadata?.billing_period;
  const customerEmail = session.metadata?.customer_email;
  const customerName = session.metadata?.customer_name;

  if (!userId || !planId) {
    console.error("[Stripe Webhook] Missing user_id or plan_id in metadata");
    return;
  }

  const plan = getPlanById(planId);
  if (!plan) {
    console.error("[Stripe Webhook] Invalid plan:", planId);
    return;
  }

  const userIdNum = parseInt(userId, 10);
  const analysesPerMonth = plan.analysesPerMonth;

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

  // Calculate new balance (add monthly credits)
  const creditsToAdd = analysesPerMonth === -1 ? 9999 : analysesPerMonth;
  const newBalance = user.credits + creditsToAdd;

  // Update user with subscription info
  await db
    .update(users)
    .set({
      credits: newBalance,
      totalCreditsPurchased: user.totalCreditsPurchased + creditsToAdd,
      stripeCustomerId: session.customer as string || user.stripeCustomerId,
      stripeSubscriptionId: session.subscription as string,
      plan: planId as "free" | "starter" | "pro" | "business" | "enterprise",
      subscriptionStatus: "active",
      subscriptionEndsAt: new Date(Date.now() + (billingPeriod === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000),
    })
    .where(eq(users.id, userIdNum));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId: userIdNum,
    type: "purchase",
    amount: creditsToAdd,
    balanceAfter: newBalance,
    description: `${plan.name} Abo gestartet (${analysesPerMonth === -1 ? 'Unbegrenzt' : analysesPerMonth} Analysen/Monat)`,
    referenceId: session.subscription as string,
  });

  // Send notification email
  const amount = (session.amount_total || 0) / 100;
  await notifyPurchase(
    userIdNum,
    customerEmail || user.email || "",
    plan.name,
    amount,
    creditsToAdd
  );

  console.log(`[Stripe Webhook] Subscription started: ${plan.name} for user ${userId}. Credits: ${creditsToAdd}`);
}

/**
 * Handle successful invoice payment (subscription renewal)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Skip if this is the first invoice (handled by checkout.session.completed)
  if (invoice.billing_reason === "subscription_create") {
    console.log("[Stripe Webhook] First invoice, skipping (handled by checkout)");
    return;
  }

  console.log("[Stripe Webhook] Processing invoice.payment_succeeded:", invoice.id);

  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) {
    console.error("[Stripe Webhook] No subscription ID in invoice");
    return;
  }

  // Get subscription to find plan info
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planId = subscription.metadata?.plan_id;

  if (!planId) {
    console.error("[Stripe Webhook] No plan_id in subscription metadata");
    return;
  }

  const plan = getPlanById(planId);
  if (!plan) {
    console.error("[Stripe Webhook] Invalid plan:", planId);
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  // Find user by subscription ID
  const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscriptionId));
  if (!user) {
    console.error("[Stripe Webhook] User not found for subscription:", subscriptionId);
    return;
  }

  // Add monthly credits
  const creditsToAdd = plan.analysesPerMonth === -1 ? 9999 : plan.analysesPerMonth;
  const newBalance = user.credits + creditsToAdd;

  // Update user credits and subscription period
  await db
    .update(users)
    .set({
      credits: newBalance,
      totalCreditsPurchased: user.totalCreditsPurchased + creditsToAdd,
      subscriptionStatus: "active",
      subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
    })
    .where(eq(users.id, user.id));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId: user.id,
    type: "purchase",
    amount: creditsToAdd,
    balanceAfter: newBalance,
    description: `${plan.name} Abo verlängert (${plan.analysesPerMonth === -1 ? 'Unbegrenzt' : plan.analysesPerMonth} Analysen)`,
    referenceId: invoice.id,
  });

  console.log(`[Stripe Webhook] Subscription renewed: ${plan.name} for user ${user.id}. Credits added: ${creditsToAdd}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Processing invoice.payment_failed:", invoice.id);

  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const db = await getDb();
  if (!db) return;

  // Find user by subscription ID
  const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscriptionId));
  if (!user) return;

  // Update subscription status
  await db
    .update(users)
    .set({
      subscriptionStatus: "past_due",
    })
    .where(eq(users.id, user.id));

  console.log(`[Stripe Webhook] Payment failed for user ${user.id}`);
}

/**
 * Handle subscription deletion (cancelled)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Processing customer.subscription.deleted:", subscription.id);

  const db = await getDb();
  if (!db) return;

  // Find user by subscription ID
  const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscription.id));
  if (!user) return;

  // Update user to free plan
  await db
    .update(users)
    .set({
      plan: "free",
      subscriptionStatus: "cancelled",
      stripeSubscriptionId: null,
    })
    .where(eq(users.id, user.id));

  console.log(`[Stripe Webhook] Subscription cancelled for user ${user.id}`);
}

/**
 * Handle subscription update (plan change)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Processing customer.subscription.updated:", subscription.id);

  const planId = subscription.metadata?.plan_id;
  if (!planId) return;

  const db = await getDb();
  if (!db) return;

  // Find user by subscription ID
  const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscription.id));
  if (!user) return;

  // Update subscription status and period
  await db
    .update(users)
    .set({
      plan: planId as "free" | "starter" | "pro" | "business" | "enterprise",
      subscriptionStatus: subscription.cancel_at_period_end ? "cancelling" : "active",
      subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
    })
    .where(eq(users.id, user.id));

  console.log(`[Stripe Webhook] Subscription updated for user ${user.id}: ${planId}`);
}
