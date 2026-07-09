ALTER TABLE payments
  ALTER COLUMN provider SET DEFAULT 'stripe';

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

UPDATE payments
SET provider = 'stripe'
WHERE provider = 'razorpay';

UPDATE payments
SET stripe_checkout_session_id = provider_order_id
WHERE stripe_checkout_session_id IS NULL
  AND provider = 'stripe'
  AND provider_order_id IS NOT NULL;

UPDATE payments
SET stripe_payment_intent_id = provider_payment_id
WHERE stripe_payment_intent_id IS NULL
  AND provider = 'stripe'
  AND provider_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_checkout_session_unique
  ON payments (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_payment_intent_unique
  ON payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
