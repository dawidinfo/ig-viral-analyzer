/**
 * Stripe Checkout Service for ReelSpy.ai
 */

import Stripe from "stripe";
import { CREDIT_PACKAGES, getPackageById } from "./products";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export interface CreateCheckoutParams {
  packageId: string;
  userId: number;
  userEmail: string;
  userName?: string;
  origin: string;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session for credit package purchase
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const { packageId, userId, userEmail, userName, origin } = params;

  const creditPackage = getPackageById(packageId);
  if (!creditPackage) {
    throw new Error(`Invalid package ID: ${packageId}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: creditPackage.currency,
          product_data: {
            name: `ReelSpy.ai ${creditPackage.name}`,
            description: `${creditPackage.analyses} KI-Analysen`,
            images: ["https://reelspy.ai/logo.png"],
          },
          unit_amount: creditPackage.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || "",
      package_id: packageId,
      credits: creditPackage.credits.toString(),
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
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId);
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

export { stripe };
