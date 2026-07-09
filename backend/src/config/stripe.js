import Stripe from "stripe";

import { env } from "./env.js";

export function getStripeClient() {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe payments");
  }

  return new Stripe(env.stripeSecretKey);
}
