# Payment Setup (Backend)

This backend uses Stripe for card payments.

## Environment variables

Create a `.env` file in `Backend folder/` with:

- `PORT=4000`
- `MONGO_URI=<your mongodb connection string>`
- `JWT_SECRET=<your secret>`
- `STRIPE_SECRET_KEY=sk_test_xxx` (your Stripe Secret Key)

## Install dependencies

Already present: `stripe`. If needed:

```
npm install
```

## Endpoints

- `POST /api/payment/create-intent` (auth) → body: `{ amount, currency? }`
- `POST /api/payment/confirm` (auth) → body: `{ paymentIntentId, orderId? }`
- `GET  /api/payment/status/:paymentIntentId` (auth)
- `POST /api/payment/process-order` (auth)

## Flow summary

1. Frontend calls `create-intent` with amount.
2. Client confirms card with Stripe Elements.
3. Frontend calls `confirm`.
4. Frontend posts to `process-order` with `paymentMethod='card'` and `paymentIntentId`.

## Run

```
cd "Backend folder"
npm run server
```
