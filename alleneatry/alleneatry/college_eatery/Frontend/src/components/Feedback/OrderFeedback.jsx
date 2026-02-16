import React, { useState } from 'react';
import './OrderFeedback.css';
import axios from 'axios';

const OrderFeedback = ({ orderId }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const response = await axios.post('/api/feedback/submit', { comment: feedback, rating, orderId });
      if (response.data.success) {
        setSuccess(true);
        setFeedback('');
        setRating(0);
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Error submitting feedback');
    }
  };

  return (
    <div className="order-feedback-container">
      <form onSubmit={handleSubmit}>
        <div className="order-feedback-stars">
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              className={star <= rating ? 'star filled' : 'star'}
              onClick={() => setRating(star)}
              role="button"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Write feedback for this order..."
          required
        />
        <button type="submit">Submit Feedback</button>
      </form>
      {success && <div className="order-feedback-success">Thank you for your feedback!</div>}
      {error && <div className="order-feedback-error">{error}</div>}
    </div>
  );
};

export default OrderFeedback;
