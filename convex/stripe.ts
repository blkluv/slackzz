// convex/stripe.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import Stripe from "stripe";
import { Id } from "./_generated/dataModel";
import { auth } from "./auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = mutation({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, { priceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("User not found");
    }

    // Check if user already has a customer ID
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    let customerId: string;

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: identity.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/subscription`,
      metadata: {
        userId: userId,
      },
    });

    return session.url;
  },
});

export const verifySubscription = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      throw new Error("No session found");
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await ctx.db.insert("subscriptions", {
      userId: session.metadata?.userId as Id<"users">,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: subscription.current_period_end,
      isActive: true,
    });
  },
});

export const isSubscribed = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const userId = await auth.getUserId(ctx);

    if (!userId) return false;

    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!subscription) return false;

    return (
      subscription.isActive &&
      subscription.stripeCurrentPeriodEnd > Date.now() / 1000
    );
  },
});
export const updateSubscription = mutation({
  args: {
    subscriptionId: v.string(),
    currentPeriodEnd: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, { subscriptionId, currentPeriodEnd, isActive }) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("stripeSubscriptionId"), subscriptionId))
      .first();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(subscription._id, {
      stripeCurrentPeriodEnd: currentPeriodEnd,
      isActive,
    });
  },
});
