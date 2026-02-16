# Payment Setup (Frontend)

The app now supports UPI QR payments.

## UPI QR

- Component: `src/components/Payment/PaymentQR.jsx`
- Configure your UPI VPA in `PlaceOrder.jsx` prop `vpa={"your-upi-id@bank"}` and `payeeName`.
- User scans the QR and enters the UTR; order includes this reference for admin verification.

## Optional: keep card payments

If you later want cards back, restore `PaymentProvider` + `PaymentForm` and the "card" radio path in `PlaceOrder.jsx`.

## Install deps

Already installed:

```
npm install qrcode.react
```

## Run

```
cd Frontend
npm start
```
