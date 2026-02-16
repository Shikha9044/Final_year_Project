import React, { useState } from 'react';
import axios from 'axios';
import './Feedback.css';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const response = await axios.post('/api/feedback', { feedback });
      if (response.data.success) {
        setSuccess(true);
        setFeedback('');
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Error submitting feedback');
    }
  };

  return (
    <div className="feedback-container">
      <h3>Send us your Feedback</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Your feedback..."
          required
        />
        <button type="submit">Submit</button>
      </form>
      {success && <div className="feedback-success">Thank you for your feedback!</div>}
      {error && <div className="feedback-error">{error}</div>}
    </div>
  );
};

export default Feedback;
