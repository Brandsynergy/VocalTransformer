import Stripe from 'stripe';
import { env } from '../config/env';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY must be set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['5 conversions per month', 'Basic voice conversion'],
    limits: {
      conversionsPerMonth: 5
    }
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    stripePriceId: 'price_pro', // You'll need to replace this with your actual Stripe price ID
    features: [
      'Unlimited conversions',
      'Advanced voice customization',
      'Priority processing',
      'Download in multiple formats'
    ],
    limits: {
      conversionsPerMonth: Infinity
    }
  },
  BUSINESS: {
    name: 'Business',
    price: 29.99,
    stripePriceId: 'price_business', // You'll need to replace this with your actual Stripe price ID
    features: [
      'Everything in Pro',
      'API access',
      'Batch processing',
      'Custom branding',
      'Priority support'
    ],
    limits: {
      conversionsPerMonth: Infinity,
      apiAccess: true,
      batchProcessing: true
    }
  }
};

export async function createCustomer(email: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      source: 'MEDIAD AUDIOVERTER'
    }
  });
  return customer.id;
}

export async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent']
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url || '';
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
