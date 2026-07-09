import { randomUUID } from "node:crypto";

import { env } from "../config/env.js";
import { findProductById, products } from "../config/products.js";
import { getStripeClient } from "../config/stripe.js";
import {
  createPaymentRecord,
  createWebhookEvent,
  listAllPayments,
  listPaymentsByUser,
  markWebhookEventProcessed,
  updatePaymentFromStripeSession
} from "../repositories/paymentRepository.js";
import { ApiError } from "../utils/apiError.js";

function formatPayment(payment) {
  return {
    id: payment.id,
    userId: payment.user_id,
    amountMinor: payment.amount_minor,
    currency: payment.currency,
    status: payment.status,
    provider: payment.provider,
    stripeCheckoutSessionId: payment.stripe_checkout_session_id,
    stripePaymentIntentId: payment.stripe_payment_intent_id,
    receiptId: payment.receipt_id,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
    userName: payment.user_name,
    userEmail: payment.user_email
  };
}

export function listProducts(req, res) {
  res.json({
    success: true,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      amountMinor: product.amountMinor,
      currency: product.currency
    }))
  });
}

export async function createCheckoutSession(req, res, next) {
  try {
    const product = findProductById(req.body.productId);

    if (!product) {
      throw new ApiError(400, "Unknown product");
    }

    const stripe = getStripeClient();
    const receiptId = `receipt_${randomUUID()}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description
            },
            unit_amount: product.amountMinor
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: req.user.sub,
        productId: product.id,
        receiptId
      },
      success_url: `${env.frontendUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/cancel.html`
    });

    const payment = await createPaymentRecord({
      userId: req.user.sub,
      amountMinor: product.amountMinor,
      currency: product.currency,
      stripeCheckoutSessionId: session.id,
      receiptId
    });

    res.status(201).json({
      success: true,
      checkoutUrl: session.url,
      payment: formatPayment(payment)
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyPayments(req, res, next) {
  try {
    const payments = await listPaymentsByUser(req.user.sub);

    res.json({
      success: true,
      payments: payments.map(formatPayment)
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminPayments(req, res, next) {
  try {
    const payments = await listAllPayments();

    res.json({
      success: true,
      payments: payments.map(formatPayment)
    });
  } catch (error) {
    next(error);
  }
}

export async function handleStripeWebhook(req, res, next) {
  try {
    if (!env.stripeWebhookSecret) {
      throw new ApiError(500, "STRIPE_WEBHOOK_SECRET is required for webhooks");
    }

    const stripe = getStripeClient();
    const signature = req.get("stripe-signature");
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret
    );

    const insertedEvent = await createWebhookEvent({
      providerEventId: event.id,
      eventType: event.type,
      payload: event
    });

    if (!insertedEvent) {
      res.json({ received: true, duplicate: true });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await updatePaymentFromStripeSession({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        status: "paid"
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      await updatePaymentFromStripeSession({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        status: "failed"
      });
    }

    await markWebhookEventProcessed(event.id);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
