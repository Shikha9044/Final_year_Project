import React, { useState } from 'react';
import StarRating from './StarRating';
import axios from 'axios';

const AdminFeedbackForm = ({ orderId }) => {
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
        'http://localhost:4000/api/feedback/submit',
        { orderId, rating, comment, isAdmin: true }
      );
      if (resp.data.success) {
        setSubmitted(true);
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

export default AdminFeedbackForm;
