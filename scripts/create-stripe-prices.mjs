/**
 * Script to create new Stripe prices for ReelSpy.ai
 * Run with: node scripts/create-stripe-prices.mjs
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// New pricing structure (in cents)
const NEW_PRICES = [
  {
    planId: 'starter',
    name: 'Starter',
    monthlyPrice: 1299, // €12.99
    yearlyPrice: 12499, // €124.99/year (~€10.42/month, 20% discount)
  },
  {
    planId: 'pro',
    name: 'Pro',
    monthlyPrice: 2499, // €24.99
    yearlyPrice: 23999, // €239.99/year (~€20/month, 20% discount)
  },
  {
    planId: 'business',
    name: 'Business',
    monthlyPrice: 5999, // €59.99
    yearlyPrice: 57599, // €575.99/year (~€48/month, 20% discount)
  },
  {
    planId: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 19999, // €199.99
    yearlyPrice: 191999, // €1919.99/year (~€160/month, 20% discount)
  },
];

async function createPrices() {
  console.log('🚀 Creating new Stripe prices...\n');

  // First, get existing products or create them
  const products = await stripe.products.list({ limit: 100 });
  
  const results = [];

  for (const plan of NEW_PRICES) {
    console.log(`\n📦 Processing ${plan.name} plan...`);
    
    // Find or create product
    let product = products.data.find(p => p.metadata?.planId === plan.planId);
    
    if (!product) {
      console.log(`  Creating product for ${plan.name}...`);
      product = await stripe.products.create({
        name: `ReelSpy ${plan.name}`,
        metadata: { planId: plan.planId },
      });
      console.log(`  ✅ Product created: ${product.id}`);
    } else {
      console.log(`  ✅ Product exists: ${product.id}`);
    }

    // Create monthly price
    console.log(`  Creating monthly price (€${(plan.monthlyPrice / 100).toFixed(2)})...`);
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthlyPrice,
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { planId: plan.planId, billing: 'monthly' },
    });
    console.log(`  ✅ Monthly price: ${monthlyPrice.id}`);

    // Create yearly price
    console.log(`  Creating yearly price (€${(plan.yearlyPrice / 100).toFixed(2)})...`);
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearlyPrice,
      currency: 'eur',
      recurring: { interval: 'year' },
      metadata: { planId: plan.planId, billing: 'yearly' },
    });
    console.log(`  ✅ Yearly price: ${yearlyPrice.id}`);

    results.push({
      planId: plan.planId,
      name: plan.name,
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
      monthlyAmount: plan.monthlyPrice,
      yearlyAmount: plan.yearlyPrice,
    });
  }

  console.log('\n\n✨ All prices created successfully!\n');
  console.log('📋 Copy these values to server/stripe/products.ts:\n');
  
  for (const result of results) {
    console.log(`// ${result.name}`);
    console.log(`stripePriceIdMonthly: "${result.monthlyPriceId}",`);
    console.log(`stripePriceIdYearly: "${result.yearlyPriceId}",`);
    console.log(`monthlyPrice: ${result.monthlyAmount}, // €${(result.monthlyAmount / 100).toFixed(2)}`);
    console.log(`yearlyPrice: ${result.yearlyAmount}, // €${(result.yearlyAmount / 100).toFixed(2)}`);
    console.log('');
  }

  // Output as JSON for easy copy
  console.log('\n📄 JSON output:\n');
  console.log(JSON.stringify(results, null, 2));
}

createPrices().catch(console.error);
