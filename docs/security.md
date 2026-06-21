# Payment Security Notes

## Core Rule

The portal should never store sensitive payment credentials.

What not to store:

- Full card number
- CVV
- OTP
- UPI PIN
- Netbanking password
- Banking PIN

## What Can Be Stored

The portal can store payment reference data needed for records and support.

Examples:

- User ID
- Amount
- Currency
- Payment status
- Payment provider name
- Provider order ID
- Provider payment ID
- Invoice or transaction ID
- Created and updated timestamps

## Verification Rule

The frontend should not decide whether a payment is successful.

The backend must verify payment status using the payment provider response, signature, API, or webhook.

## Webhook Rule

When a payment provider sends a webhook:

1. Verify the webhook signature.
2. Check if the event was already processed.
3. Update the payment status only after verification.
4. Store the event ID to avoid duplicate processing.

## Secrets Rule

API keys and secrets must stay outside the codebase.

Use environment variables such as:

```txt
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
JWT_SECRET
DATABASE_URL
```

These values should be placed in a local `.env` file and excluded from Git.

## Production Rule

In production, the portal must use HTTPS so user data and payment-related requests are encrypted in transit.
