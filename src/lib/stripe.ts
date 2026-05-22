import { loadStripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Stripe will not load. " +
      "Add it to .env.local"
  );
}

export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
