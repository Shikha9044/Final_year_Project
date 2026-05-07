import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../components/Context/StoreContext';
import StarRating from '../../components/StarRating';
import './FeedbackPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const emptyFeedback = () => ({ rating: 0, comment: '' });
const getItemIdentifier = (item) => {
  if (item?.foodId && typeof item.foodId === 'object') {
    return String(item.foodId._id || item.foodId.id || item._id || item.name);
  }
  if (item?.foodId) return String(item.foodId);
  if (item?._id) return String(item._id);
  return String(item?.name || 'item');
};

const FeedbackPage = () => {
  const { token, url, fetchFoodList } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiBase = url || API_URL;
  const highlightedOrderId = searchParams.get('orderId');
  const cameFromPayment = searchParams.get('source') === 'payment';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [feedbackByItem, setFeedbackByItem] = useState({});
  const [submittedKeys, setSubmittedKeys] = useState({});
  const [savingKey, setSavingKey] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${apiBase}/api/order/user-orders`, {
        headers: { token }
      });
      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        setError('Unable to load your orders right now.');
      }
    } catch (fetchError) {
      setError('Unable to load your orders right now.');
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  const fetchSubmittedFeedback = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBase}/api/feedback/mine`, {
        headers: { token }
      });

      if (response.data?.success) {
        const submitted = {};
        for (const item of response.data.feedbacks || []) {
          const key = `${item.orderId}-${item.itemId || 'order'}`;
          submitted[key] = true;
        }
        setSubmittedKeys(submitted);
      }
    } catch (fetchError) {
      setSubmittedKeys({});
    }
  }, [apiBase, token]);

  useEffect(() => {
    if (!token) return;
    fetchOrders();
    fetchSubmittedFeedback();
  }, [token, fetchOrders, fetchSubmittedFeedback]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((order) => Array.isArray(order.items) && order.items.length > 0);
  }, [orders]);

  const currentOrder = deliveredOrders.find((order) => order._id === activeOrderId) || null;

  const getItemKey = (orderId, item) => `${orderId}-${getItemIdentifier(item)}`;

  const openFeedback = useCallback((order) => {
    setActiveOrderId(order._id);

    const nextState = {};
    for (const item of order.items || []) {
      const itemKey = getItemKey(order._id, item);
      nextState[itemKey] = feedbackByItem[itemKey] || emptyFeedback();
    }
    setFeedbackByItem((prev) => ({ ...prev, ...nextState }));
  }, [feedbackByItem]);

  const closeFeedback = () => {
    setActiveOrderId(null);
  };

  const updateItemFeedback = (orderId, itemKey, field, value) => {
    const key = `${orderId}-${itemKey}`;
    setFeedbackByItem((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || emptyFeedback()),
        [field]: value
      }
    }));
  };

  const submitItemFeedback = async (order, item) => {
    const itemKeyValue = getItemIdentifier(item);
    const key = getItemKey(order._id, item);
    const itemState = feedbackByItem[key] || emptyFeedback();

    if (!itemState.rating) {
      alert('Please select a rating before submitting.');
      return;
    }

    try {
      setSavingKey(key);
      const response = await axios.post(
        `${apiBase}/api/feedback/submit`,
        {
          orderId: order._id,
          itemId: itemKeyValue,
          itemName: item.name,
          itemImage: item.image,
          itemCategory: item.category,
          feedbackScope: 'item',
          rating: itemState.rating,
          comment: itemState.comment
        },
        {
          headers: { token }
        }
      );

      if (response.data?.success) {
        setSubmittedKeys((prev) => ({ ...prev, [key]: true }));
        setFeedbackByItem((prev) => ({
          ...prev,
          [key]: {
            rating: 0,
            comment: ''
          }
        }));
        // Refresh menu ratings so filled stars update on food cards immediately.
        await fetchFoodList();
      } else {
        alert(response.data?.message || 'Failed to submit feedback');
      }
    } catch (submitError) {
      alert(submitError?.response?.data?.message || 'Error submitting feedback');
    } finally {
      setSavingKey('');
    }
  };

  useEffect(() => {
    if (!highlightedOrderId || activeOrderId || deliveredOrders.length === 0) return;
    const match = deliveredOrders.find((order) => String(order._id) === String(highlightedOrderId));
    if (match) {
      openFeedback(match);
    }
  }, [highlightedOrderId, deliveredOrders, activeOrderId, openFeedback]);

  if (!token) {
    return (
      <div className="feedback-page-shell">
        <div className="feedback-page-empty">
          <h2>Login Required</h2>
          <p>Please log in to view your orders and submit feedback.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="feedback-page-shell">
        <div className="feedback-page-empty">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="feedback-page-shell">
      <div className="feedback-page-hero">
        <div className="feedback-checkmark">✓</div>
        <h1>Thank you for your order!</h1>
        <p>Enjoyed your food? Rate each item and help us improve.</p>
        {cameFromPayment && (
          <div className="feedback-optional-note">
            <strong>Quick and optional:</strong> Give feedback now while the experience is fresh, or skip for later.
          </div>
        )}
      </div>

      <div className="feedback-page-content">
        <div className="feedback-page-header">
          <div>
            <h2>Your Order History</h2>
            <p>Choose an order to leave item-wise feedback.</p>
          </div>
          <button className="feedback-refresh-btn" onClick={fetchOrders}>
            Refresh
          </button>
        </div>

        {cameFromPayment && highlightedOrderId && (
          <div className="feedback-recent-order-banner">
            <div>
              <strong>Recent payment detected.</strong> We selected your latest order so you can rate it in a few taps.
            </div>
            <button type="button" onClick={() => navigate('/order-history')}>
              Skip for now
            </button>
          </div>
        )}

        {error && <div className="feedback-page-error">{error}</div>}

        {deliveredOrders.length === 0 ? (
          <div className="feedback-page-empty">No orders found.</div>
        ) : (
          <div className="feedback-order-list">
            {deliveredOrders.map((order) => (
              <div key={order._id} className="feedback-order-card">
                <div className="feedback-order-card-header">
                  <div>
                    <div className="feedback-order-title">Order #{order.orderNumber || order._id}</div>
                    <div className="feedback-order-meta">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                      {' '}• {order.status}
                    </div>
                  </div>
                  <button
                    className="feedback-order-button"
                    onClick={() => openFeedback(order)}
                    disabled={!order.items?.length}
                  >
                    Add Feedback
                  </button>
                </div>

                <div className="feedback-order-items-preview">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={`${order._id}-${item.foodId || item._id || item.name}`} className="feedback-mini-item">
                      <img
                        src={`${url}/images/${item.image}`}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.src = 'https://via.placeholder.com/80?text=Food';
                        }}
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <p>Qty {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentOrder && (
        <div className="feedback-modal-overlay" onClick={closeFeedback}>
          <div className="feedback-modal" onClick={(event) => event.stopPropagation()}>
            <button className="feedback-modal-close" onClick={closeFeedback}>
              ×
            </button>

            <div className="feedback-modal-hero">
              <div className="feedback-checkmark large">✓</div>
              <h2>Write your feedback</h2>
              <p>Rate the items from this order individually.</p>
            </div>

            <div className="feedback-order-summary">
              <img
                src={currentOrder.items[0]?.image ? `${url}/images/${currentOrder.items[0].image}` : ''}
                alt={currentOrder.items[0]?.name || 'Order item'}
                onError={(event) => {
                  event.currentTarget.src = 'https://via.placeholder.com/90?text=Food';
                }}
              />
              <div>
                <h3>Your Order</h3>
                <p>{currentOrder.items.map((item) => item.name).join(', ')}</p>
                <span>
                  Order #{currentOrder.orderNumber || currentOrder._id} • {new Date(currentOrder.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="feedback-order-total">₹{currentOrder.totalAmount}</div>
            </div>

            <div className="feedback-items-list">
              {currentOrder.items.map((item) => {
                const itemKeyValue = getItemIdentifier(item);
                const key = getItemKey(currentOrder._id, item);
                const itemState = feedbackByItem[key] || emptyFeedback();
                const isSubmitted = !!submittedKeys[key];

                return (
                  <div key={key} className="feedback-item-card">
                    <div className="feedback-item-header">
                      <img
                        src={`${url}/images/${item.image}`}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.src = 'https://via.placeholder.com/96?text=Food';
                        }}
                      />
                      <div className="feedback-item-info">
                        <h4>{item.name}</h4>
                        <p>Qty {item.quantity} • ₹{item.price}</p>
                        {item.category && <span>{item.category}</span>}
                      </div>
                    </div>

                    <div className="feedback-item-rating-row">
                      <div className="feedback-label">Rate this item</div>
                      <StarRating
                        rating={itemState.rating}
                        setRating={(value) => updateItemFeedback(currentOrder._id, itemKeyValue, 'rating', value)}
                        disabled={isSubmitted || savingKey === key}
                      />
                    </div>

                    <textarea
                      className="feedback-textarea"
                      placeholder={`Tell us about ${item.name}...`}
                      value={itemState.comment}
                      onChange={(event) => updateItemFeedback(currentOrder._id, itemKeyValue, 'comment', event.target.value)}
                      disabled={isSubmitted || savingKey === key}
                    />

                    <div className="feedback-item-actions">
                      <button
                        className="feedback-submit-btn"
                        onClick={() => submitItemFeedback(currentOrder, item)}
                        disabled={isSubmitted || savingKey === key || itemState.rating === 0}
                      >
                        {isSubmitted ? 'Submitted' : savingKey === key ? 'Submitting...' : 'Submit Item Feedback'}
                      </button>
                      {isSubmitted && <span className="feedback-submitted-note">Feedback saved</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;