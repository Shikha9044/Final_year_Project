import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './PaymentForm.css';

const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError, url, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${url}/api/payment/create-intent`,
        {
          amount: amount,
          currency: 'inr'
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
      } else {
        setError(response.data.message || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Create payment intent error:', error);
      setError(error.response?.data?.message || 'Error creating payment intent');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onPaymentError && onPaymentError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const confirmResponse = await axios.post(
          `${url}/api/payment/confirm`,
          {
            paymentIntentId: paymentIntent.id
          },
          {
            headers: { token }
          }
        );

        if (confirmResponse.data.success) {
          onPaymentSuccess && onPaymentSuccess(paymentIntent);
        } else {
          setError(confirmResponse.data.message || 'Payment confirmation failed');
          onPaymentError && onPaymentError(confirmResponse.data.message);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Payment processing failed';
      setError(errorMessage);
      onPaymentError && onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#6772e5',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (loading && !clientSecret) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Setting up payment...</p>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h3>Secure Payment</h3>
        <p>Total Amount: ₹{amount}</p>
      </div>

      {error && (
        <div className="payment-error">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-element-container">
          <label>Card Details</label>
          <CardElement options={cardElementOptions} />
        </div>

        <button 
          type="submit" 
          disabled={!stripe || loading || !clientSecret}
          className="payment-button"
        >
          {loading ? (
            <div className="button-content">
              <div className="spinner-small"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            `Pay ₹${amount}`
          )}
        </button>
      </form>

      <div className="payment-security">
        <div className="security-badge">
          <span className="lock-icon">🔒</span>
          <span>Secure Payment</span>
        </div>
        <p className="security-text">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;

