/**
 * Stripe Products Configuration for ReelSpy.ai
 * Credit packages for AI analysis
 */

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  analyses: number; // Approximate number of analyses (1 credit = 1 basic analysis)
  price: number; // in cents
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 25,
    analyses: 25,
    price: 1900, // €19
    currency: "eur",
    description: "Perfect for getting started",
    features: [
      "25 KI-Analysen",
      "Instagram Analyse",
      "Viral Score",
      "HAPSS-Analyse",
      "30 Tage gültig",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 100,
    analyses: 100,
    price: 4900, // €49
    currency: "eur",
    description: "Most popular for creators",
    features: [
      "100 KI-Analysen",
      "Instagram + TikTok",
      "KI-Tiefenanalyse",
      "Hopkins, Ogilvy, Schwartz",
      "PDF-Export",
      "1 Jahr Follower-Historie",
    ],
    isPopular: true,
  },
  {
    id: "business",
    name: "Business",
    credits: 350,
    analyses: 350,
    price: 9900, // €99
    currency: "eur",
    description: "For agencies and teams",
    features: [
      "350 KI-Analysen",
      "Alle Plattformen",
      "White-Label Reports",
      "Competitor-Vergleich",
      "Prioritäts-Support",
      "Team-Accounts",
    ],
  },
];

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

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

export function formatPrice(priceInCents: number, currency: string = "eur"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceInCents / 100);
}
