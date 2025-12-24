/**
 * Stripe Checkout Service for ReelSpy.ai
 * Subscription-based checkout with monthly and yearly billing
 */

import Stripe from "stripe";
import { SUBSCRIPTION_PLANS, getPlanById, getStripePriceId } from "./products";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export interface CreateCheckoutParams {
  packageId: string;
  userId: number;
  userEmail: string;
  userName?: string;
  origin: string;
  isYearly?: boolean;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session for subscription purchase
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const { packageId, userId, userEmail, userName, origin, isYearly = false } = params;

  const plan = getPlanById(packageId);
  if (!plan) {
    throw new Error(`Invalid plan ID: ${packageId}`);
  }

  const priceId = getStripePriceId(packageId, isYearly);
  if (!priceId) {
    throw new Error(`No price ID found for plan: ${packageId}`);
  }

  // Get or create customer
  const customerId = await getOrCreateCustomer(userEmail, userName);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    client_reference_id: userId.toString(),
    allow_promotion_codes: true,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || "",
      plan_id: packageId,
      billing_period: isYearly ? "yearly" : "monthly",
      analyses_per_month: plan.analysesPerMonth.toString(),
    },
    subscription_data: {
      metadata: {
        user_id: userId.toString(),
        plan_id: packageId,
        billing_period: isYearly ? "yearly" : "monthly",
      },
    },
    success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?payment=cancelled`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Create a portal session for subscription management
 */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate subscription (remove cancel at period end)
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Get Stripe customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  return await stripe.customers.retrieve(customerId);
}

/**
 * Create or get Stripe customer for a user
 */
export async function getOrCreateCustomer(
  email: string,
  name?: string,
  existingCustomerId?: string
): Promise<string> {
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return customer.id;
      }
    } catch (e) {
      // Customer doesn't exist, create new one
    }
  }

  // Check if customer already exists by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      source: "reelspy.ai",
    },
  });

  return customer.id;
}

/**
 * List payment history for a customer
 */
export async function getPaymentHistory(customerId: string, limit: number = 10): Promise<Stripe.PaymentIntent[]> {
  const paymentIntents = await stripe.paymentIntents.list({
    customer: customerId,
    limit,
  });

  return paymentIntents.data;
}

/**
 * List subscriptions for a customer
 */
export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });

  return subscriptions.data;
}

/**
 * List invoices for a customer
 */
export async function getCustomerInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

export { stripe };
