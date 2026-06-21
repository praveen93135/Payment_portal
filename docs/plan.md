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

- Frontend: React
- Backend: Node.js with Express
- Database: PostgreSQL
- Payments: Razorpay first, Stripe later if international payments are needed
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
-> Frontend asks backend to create a payment order
-> Backend creates the order with the payment provider
-> User completes payment through the provider
-> Provider sends callback or webhook
-> Backend verifies the payment
-> Backend updates payment status in the database
-> User sees success or failure result
```

## Build Order

1. Write project documentation
2. Set up backend server
3. Create database schema
4. Add user authentication
5. Add payment order creation
6. Add payment verification
7. Build frontend pages
8. Connect frontend to backend
9. Test payment success, failure, and duplicate callback cases
