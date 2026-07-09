# Payment Portal Plan

## Goal

Build a secure payment portal where users can log in, make payments, view their payment history, and where an admin can review payment activity.

This project is also a learning project for understanding how web applications are planned, built, tested, and improved.

## MVP Features

1. User registration and login
2. User dashboard
3. Make payment page
4. Payment success and failure handling
5. Transaction history
6. Admin payment list
7. Backend payment verification

## Planned Stack

- Frontend: React with Vite
- Backend: Node.js with Express
- Database: PostgreSQL
- Payments: Stripe Checkout
- Authentication: JWT for the first version

## Folder Structure

```txt
frontend/
  User interface and pages

backend/
  API server, auth, payment creation, payment verification

database/
  Database schema and migrations

docs/
  Project plan, security notes, and API notes
```

## Payment Flow

```txt
User clicks Pay
-> Frontend asks backend to create a Stripe Checkout Session
-> Backend creates the Checkout Session with Stripe
-> User completes payment on Stripe's hosted checkout page
-> Stripe sends a webhook to the backend
-> Backend verifies the webhook signature
-> Backend updates payment status in the database
-> User sees success or failure result
```

## Build Order

1. Write project documentation - done
2. Set up backend server - done
3. Create database schema - done
4. Add user authentication - done
5. Add Stripe Checkout Session creation - done
6. Add webhook verification - done
7. Build frontend pages - done
8. Connect frontend to backend - done
9. Test payment success, failure, and duplicate webhook cases - next
