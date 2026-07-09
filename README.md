# Payment Portal

This is my first full-stack learning project for web development.

The app has a Node/Express backend, PostgreSQL database, React frontend, JWT authentication, and Stripe Checkout payments.

## What It Does

- Register and log in
- View available payment products
- Start a Stripe Checkout payment
- Store payment records in PostgreSQL
- Receive Stripe webhook events
- View your payment history

## Run Locally

Start PostgreSQL:

```bash
docker compose up -d database
```

Run migrations:

```bash
cd backend
npm install
npm run db:migrate
```

Create `backend/.env` from `backend/.env.example`, then add your Stripe test secret key and webhook secret.

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Vite, usually `http://localhost:5173`.

## Stripe Test Card

Use Stripe test mode. A common successful test card is:

```txt
4242 4242 4242 4242
```

Use any future expiry date, any CVC, and any postal code.
