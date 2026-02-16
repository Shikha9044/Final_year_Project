import React from 'react';
import './PaymentSuccess.css';

const PaymentSuccess = ({ amount, orderNumber, onContinue }) => {
  return (
    <div className="payment-success-container">
      <div className="success-icon">✅</div>
      <h2>Payment Successful!</h2>
      <p className="success-message">
        Your payment of ₹{amount} has been processed successfully.
      </p>
      {orderNumber && (
        <div className="order-details">
          <p><strong>Order Number:</strong> {orderNumber}</p>
        </div>
      )}
      <p className="confirmation-message">
        You will receive an email confirmation shortly. Thank you for your order!
      </p>
      <button onClick={onContinue} className="continue-btn">
        Continue Shopping
      </button>
    </div>
  );
};

export default PaymentSuccess;

