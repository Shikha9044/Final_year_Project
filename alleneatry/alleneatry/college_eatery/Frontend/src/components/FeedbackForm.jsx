import React, { useState, useContext } from 'react';
import { StoreContext } from './Context/StoreContext';
import axios from 'axios';
import StarRating from './StarRating';

const FeedbackForm = ({ orderId, onSubmitted }) => {
  const { token } = useContext(StoreContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const resp = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/feedback/submit`,
        { orderId, rating, comment },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      if (resp.data.success) {
        setSubmitted(true);
        if (onSubmitted) onSubmitted();
      } else {
        setError(resp.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <div className="feedback-success">Thank you for your feedback!</div>;

  return (
    <form className="feedback-form" onSubmit={handleSubmit} style={{marginTop:12}}>
      <div style={{marginBottom:8}}>
        <label>Rating: </label>
        <StarRating rating={rating} setRating={setRating} disabled={submitting} />
      </div>
      <div>
        <textarea
          placeholder="Write your feedback..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={2}
          style={{width:'100%',marginTop:6}}
        />
      </div>
      <button type="submit" disabled={submitting} style={{marginTop:8}}>
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      {error && <div className="feedback-error" style={{color:'#c00',marginTop:4}}>{error}</div>}
    </form>
  );
};

export default FeedbackForm;
