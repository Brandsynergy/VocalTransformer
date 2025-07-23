import express from 'express';
import { db } from '@db';
import { users, subscriptions, usageLimits } from '@db/schema';
import { eq } from 'drizzle-orm';
import { 
  stripe, 
  SUBSCRIPTION_PLANS, 
  createCustomer, 
  createCheckoutSession,
  createPortalSession,
} from '../services/stripe';

const router = express.Router();

// Get subscription plans
router.get('/api/subscription/plans', (_req, res) => {
  res.json(SUBSCRIPTION_PLANS);
});

// Create checkout session for subscription
router.post('/api/subscription/create-checkout', async (req, res) => {
  try {
    const { priceId, userId } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let { stripeCustomerId } = user;

    if (!stripeCustomerId) {
      stripeCustomerId = await createCustomer(user.email);
      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, userId));
    }

    const session = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      `${req.protocol}://${req.get('host')}/subscription/success`,
      `${req.protocol}://${req.get('host')}/subscription/cancel`
    );

    res.json({ url: session });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/api/subscription/portal', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.stripeCustomerId) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const portalSession = await createPortalSession(
      user.stripeCustomerId,
      `${req.protocol}://${req.get('host')}/account`
    );

    res.json({ url: portalSession });
  } catch (error) {
    console.error('Portal session creation error:', error);
    res.status(500).json({ message: 'Failed to create portal session' });
  }
});

// Webhook handler for Stripe events
router.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, subscription.customer),
        });

        if (user) {
          await db.insert(subscriptions).values({
            userId: user.id,
            stripePlanId: subscription.plan.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });

          // Update usage limits based on the plan
          const plan = Object.values(SUBSCRIPTION_PLANS).find(
            p => p.stripePriceId === subscription.plan.id
          );

          if (plan) {
            await db.insert(usageLimits).values({
              userId: user.id,
              conversionsLimit: plan.limits.conversionsPerMonth,
              periodStart: new Date(subscription.current_period_start * 1000),
              periodEnd: new Date(subscription.current_period_end * 1000),
            });
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, subscription.customer),
        });

        if (user) {
          await db
            .update(subscriptions)
            .set({ status: 'canceled' })
            .where(eq(subscriptions.userId, user.id));
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
});

export default router;
