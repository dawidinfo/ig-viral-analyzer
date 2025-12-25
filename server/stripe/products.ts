/**
 * Stripe Products Configuration for ReelSpy.ai
 * Subscription-based pricing with monthly and yearly options
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  analysesPerMonth: number;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents (total per year)
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  // Stripe Price IDs
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    analysesPerMonth: 10,
    monthlyPrice: 1299, // €12.99
    yearlyPrice: 12499, // €124.99/year (~€10.42/month)
    currency: "eur",
    description: "Für Einsteiger",
    features: [
      "10 KI-Analysen pro Monat",
      "Instagram Analyse",
      "Viral Score",
      "HAPSS-Analyse",
      "E-Mail Support",
    ],
    stripePriceIdMonthly: "price_1SiDoJDffvKeT7w7072eciVj",
    stripePriceIdYearly: "price_1SiDoKDffvKeT7w70nEo85o2",
  },
  {
    id: "pro",
    name: "Pro",
    analysesPerMonth: 35,
    monthlyPrice: 2499, // €24.99
    yearlyPrice: 23999, // €239.99/year (~€20/month)
    currency: "eur",
    description: "Für Creator",
    features: [
      "35 KI-Analysen pro Monat",
      "Instagram + TikTok",
      "KI-Tiefenanalyse",
      "Hopkins, Ogilvy, Schwartz",
      "PDF-Export",
      "1 Jahr Follower-Historie",
      "Prioritäts-Support",
    ],
    isPopular: true,
    stripePriceIdMonthly: "price_1SiDoMDffvKeT7w7JYTosb7J",
    stripePriceIdYearly: "price_1SiDoNDffvKeT7w7QCH4HkWB",
  },
  {
    id: "business",
    name: "Business",
    analysesPerMonth: 100,
    monthlyPrice: 5999, // €59.99
    yearlyPrice: 57599, // €575.99/year (~€48/month)
    currency: "eur",
    description: "Für Agenturen",
    features: [
      "100 KI-Analysen pro Monat",
      "Alle Plattformen inklusive",
      "White-Label Reports",
      "Competitor-Vergleich",
      "Team-Accounts (bis 5)",
      "API-Zugang",
      "Dedizierter Support",
    ],
    stripePriceIdMonthly: "price_1SiDoPDffvKeT7w7lkhDcaNx",
    stripePriceIdYearly: "price_1SiDoQDffvKeT7w7tzvzOBkk",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    analysesPerMonth: -1, // Unlimited
    monthlyPrice: 19999, // €199.99
    yearlyPrice: 191999, // €1919.99/year (~€160/month)
    currency: "eur",
    description: "Für große Agenturen",
    features: [
      "Unbegrenzte KI-Analysen",
      "Alle Plattformen inklusive",
      "White-Label Reports",
      "Unbegrenzte Team-Accounts",
      "Custom API-Integration",
      "Dedicated Account Manager",
      "SLA-Garantie",
    ],
    stripePriceIdMonthly: "price_1SiDoSDffvKeT7w7q4RSLPIJ",
    stripePriceIdYearly: "price_1SiDoSDffvKeT7w73HQl5Qpi",
  },
];

// Legacy credit packages for backward compatibility
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  analyses: number;
  price: number;
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = SUBSCRIPTION_PLANS.map(plan => ({
  id: plan.id,
  name: plan.name,
  credits: plan.analysesPerMonth,
  analyses: plan.analysesPerMonth,
  price: plan.monthlyPrice,
  currency: plan.currency,
  description: plan.description,
  features: plan.features,
  isPopular: plan.isPopular,
}));

// Platform module add-ons
export const PLATFORM_MODULES = {
  tiktok: {
    id: "tiktok",
    name: "TikTok Modul",
    price: 900, // €9/month
    currency: "eur",
  },
  youtube: {
    id: "youtube", 
    name: "YouTube Modul",
    price: 900, // €9/month
    currency: "eur",
  },
  bundle: {
    id: "all-platforms",
    name: "All-in-One Bundle",
    price: 1500, // €15/month (saves €3)
    currency: "eur",
  },
};

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
}

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

export function formatPrice(priceInCents: number, currency: string = "eur"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceInCents / 100);
}

export function getStripePriceId(planId: string, isYearly: boolean): string | undefined {
  const plan = getPlanById(planId);
  if (!plan) return undefined;
  return isYearly ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
}
