import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './PlaceOrder.css';
import { StoreContext } from '../../components/Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PaymentQR from '../../components/Payment/PaymentQR';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, clearCart, loading: contextLoading } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    branch: '',
    phone: '',
  });
  
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const [previewToken, setPreviewToken] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [rfCardNumber, setRfCardNumber] = useState('');
  const totalAmount = getTotalCartAmount();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
    if (error) setError('');
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setPlacingOrder(true);
    setError('');
    
    try {
      // Prepare order items
      const orderItems = [];
      food_list.forEach((item) => {
        if (cartItems[item._id] > 0) {
          orderItems.push({
            foodId: item._id,
            quantity: cartItems[item._id]
          });
        }
      });

      if (orderItems.length === 0) {
        setError('No items in cart to order');
        setPlacingOrder(false);
        return;
      }

      // Prepare delivery address
      const deliveryAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        branch: data.branch,
        phone: data.phone,
      };


      const orderData = {
        items: orderItems,
        deliveryAddress: deliveryAddress,
        specialInstructions: '',
        paymentMethod: paymentMethod,
        paymentIntentId: undefined,
        rfCardNumber: paymentMethod === 'rfcard' ? rfCardNumber : undefined
      };

      // For UPI and Cash, create order directly
      const endpoint = '/api/order/place';
      const response = await axios.post(url + endpoint, orderData, { 
        headers: { token } 
      });

      if (response.data.success) {
        // Clear cart after successful order
        await clearCart();
        const createdId = response.data?.order?._id;
        const serverToken = response.data?.order?.tokenNumber;
        const orderNum = response.data?.order?.orderNumber;
        if (serverToken) setTokenNumber(serverToken);
        if (createdId) setPlacedOrderId(createdId);
        if (orderNum) setPlacedOrderNumber(orderNum);
        setShowSuccess(true);
        toast.success('Order placed successfully!', { position: 'top-center' });
      } else {
        setError(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while placing the order');
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate('/');
    } else if (!contextLoading && totalAmount === 0 && !showSuccess) {
      navigate('/cart');
    }
    // Auto-redirect to order-linked feedback after successful payment/order placement.
    if (showSuccess) {
      const timeout = setTimeout(() => {
        setShowSuccess(false);
        if (placedOrderId) {
          navigate(`/feedback?orderId=${placedOrderId}&source=payment`);
          return;
        }
        navigate('/feedback');
      }, 1600);
      return () => clearTimeout(timeout);
    }
  }, [token, navigate, showSuccess, placedOrderId, contextLoading, totalAmount]);

  // No client-side token generation; server returns token in order

  if (!token) {
    return <div>Please login to place an order.</div>;
  }

  if (contextLoading) {
    return <div>Loading checkout...</div>;
  }

  if (totalAmount === 0) {
    return <div>Your cart is empty. Please add items to proceed.</div>;
  }

  return (
    <form onSubmit={placeOrder} className="place-order">
      {showSuccess && (
        <div className="success-modal" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fff',borderRadius:12,padding:24,maxWidth:420,width:'90%',boxShadow:'0 8px 30px rgba(0,0,0,0.2)'}}>
            <h3 style={{margin:'0 0 8px 0'}}>Order Placed</h3>
            <p style={{margin:'0 0 12px 0'}}>Thank you! Your order has been placed successfully.</p>
            {placedOrderNumber && (<p style={{margin:'0 0 8px 0'}}><b>Order:</b> {placedOrderNumber}</p>)}
            {tokenNumber && (<p style={{margin:'0 0 16px 0'}}><b>Pickup Token:</b> {tokenNumber}</p>)}
            <p style={{margin:'0 0 16px 0', color:'#334155'}}>Redirecting you to quick feedback...</p>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={()=>{ setShowSuccess(false); navigate('/'); }} style={{padding:'10px 14px',borderRadius:8,border:'1px solid #ddd',background:'#fff',cursor:'pointer'}}>Close</button>
              <button type="button" onClick={()=>{ setShowSuccess(false); navigate('/order-history'); }} style={{padding:'10px 14px',borderRadius:8,border:'1px solid #007bff',background:'#007bff',color:'#fff',cursor:'pointer'}}>View Order History</button>
              {placedOrderId && (
                <button type="button" onClick={()=>{ setShowSuccess(false); navigate(`/feedback?orderId=${placedOrderId}&source=payment`); }} style={{padding:'10px 14px',borderRadius:8,border:'1px solid #16a34a',background:'#16a34a',color:'#fff',cursor:'pointer'}}>Give Feedback</button>
              )}
              {placedOrderId && (
                <button type="button" onClick={()=>{ setShowSuccess(false); navigate(`/track/${placedOrderId}`); }} className="place-order-btn">Track Order</button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        
        {error && (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last Name"
          />
        </div>


        <input
          required
          name="branch"
          onChange={onChangeHandler}
          value={data.branch}
          type="text"
          placeholder="Branch"
        />

        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone"
        />

        {/* Payment Method Selection */}
        <div className="payment-method-section">
          <p className="title">Payment Method</p>
          <div className="payment-options">
            {/* Cash on Delivery removed — only UPI and RF Card are supported */}
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-option-label">
                <span className="payment-icon">📱</span>
                UPI QR
              </span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="rfcard"
                checked={paymentMethod === 'rfcard'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-option-label">
                <span className="payment-icon">💳</span>
                RF Card
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{totalAmount}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{totalAmount}</b>
            </div>
          </div>
          {paymentMethod === 'upi' ? (
            <div className="card-payment-section">
              {!showPaymentQR ? (
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPaymentQR(true);
                    if (!previewToken) {
                      setPreviewToken(Math.floor(1000 + Math.random() * 9000).toString());
                    }
                    setPaymentReady(true);
                  }}
                  className="proceed-payment-btn"
                >
                  SHOW QR TO PAY
                </button>
              ) : (
                <PaymentQR 
                  amount={totalAmount} 
                  vpa={"kashyaprishabh8957@okicici"} 
                  payeeName={"AllenEatery"}
                  note={"Order payment"}
                  tokenNumber={tokenNumber || previewToken}
                  items={food_list.filter(f => (cartItems[f._id] || 0) > 0).map(f => ({
                    name: f.name,
                    quantity: cartItems[f._id],
                    price: f.price,
                    subtotal: f.price * cartItems[f._id]
                  }))}
                  itemsCount={Object.values(cartItems).reduce((sum, qty) => sum + (qty || 0), 0)}
                />
              )}
              {paymentReady && (
                <button type="submit" disabled={placingOrder} className="place-order-btn">
                  {placingOrder ? "Placing Order..." : "PLACE ORDER"}
                </button>
              )}
            </div>
          ) : paymentMethod === 'rfcard' ? (
            <div className="card-payment-section">
              <input
                type="text"
                placeholder="Enter RF Card Number"
                value={rfCardNumber}
                onChange={e => setRfCardNumber(e.target.value)}
                style={{ marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                maxLength={16}
                required
              />
              <button
                type="button"
                className="proceed-payment-btn"
                disabled={placingOrder || !rfCardNumber}
                onClick={() => {
                  setPaymentReady(true);
                }}
              >
                TAP RF CARD TO PAY
              </button>
              {paymentReady && (
                <button type="submit" disabled={placingOrder} className="place-order-btn">
                  {placingOrder ? "Placing Order..." : "PLACE ORDER"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: 12 }}>
              <p style={{ margin: 0 }}>Please select a payment method to proceed.</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;