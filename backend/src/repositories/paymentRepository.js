import { pool } from "../config/database.js";

const paymentFields = `
  id,
  user_id,
  amount_minor,
  currency,
  status,
  provider,
  provider_order_id,
  provider_payment_id,
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  receipt_id,
  created_at,
  updated_at
`;

export async function createPaymentRecord({
  userId,
  amountMinor,
  currency,
  stripeCheckoutSessionId,
  receiptId
}) {
  const result = await pool.query(
    `
      INSERT INTO payments (
        user_id,
        amount_minor,
        currency,
        status,
        provider,
        provider_order_id,
        stripe_checkout_session_id,
        receipt_id
      )
      VALUES ($1, $2, $3, 'pending', 'stripe', $4, $4, $5)
      RETURNING ${paymentFields}
    `,
    [userId, amountMinor, currency.toUpperCase(), stripeCheckoutSessionId, receiptId]
  );

  return result.rows[0];
}

export async function listPaymentsByUser(userId) {
  const result = await pool.query(
    `
      SELECT ${paymentFields}
      FROM payments
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function listAllPayments() {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.user_id,
        p.amount_minor,
        p.currency,
        p.status,
        p.provider,
        p.provider_order_id,
        p.provider_payment_id,
        p.stripe_checkout_session_id,
        p.stripe_payment_intent_id,
        p.receipt_id,
        p.created_at,
        p.updated_at,
        u.name AS user_name,
        u.email AS user_email
      FROM payments p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `
  );

  return result.rows;
}

export async function updatePaymentFromStripeSession({
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  status
}) {
  const result = await pool.query(
    `
      UPDATE payments
      SET
        status = $2,
        provider_payment_id = COALESCE($3, provider_payment_id),
        stripe_payment_intent_id = COALESCE($3, stripe_payment_intent_id),
        updated_at = NOW()
      WHERE stripe_checkout_session_id = $1
      RETURNING ${paymentFields}
    `,
    [stripeCheckoutSessionId, status, stripePaymentIntentId]
  );

  return result.rows[0];
}

export async function createWebhookEvent({ providerEventId, eventType, payload }) {
  const result = await pool.query(
    `
      INSERT INTO webhook_events (provider, provider_event_id, event_type, payload)
      VALUES ('stripe', $1, $2, $3)
      ON CONFLICT (provider, provider_event_id) DO NOTHING
      RETURNING id
    `,
    [providerEventId, eventType, payload]
  );

  return result.rows[0];
}

export async function markWebhookEventProcessed(providerEventId) {
  await pool.query(
    `
      UPDATE webhook_events
      SET processed_at = NOW()
      WHERE provider = 'stripe' AND provider_event_id = $1
    `,
    [providerEventId]
  );
}
