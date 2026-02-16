import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedbackAdmin.css';

const UserFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/feedback', { headers: { token } });
        if (response.data.success) {
          // Only show feedbacks with user details (not admin feedback)
          setFeedbacks(response.data.feedbacks.filter(fb => !fb.isAdmin));
        } else {
          setError(response.data.message || 'Failed to fetch feedback');
        }
      } catch (err) {
        setError('Error fetching feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="feedback-admin-container">
      <h3>User Feedbacks</h3>
      {loading && <div>Loading...</div>}
      {error && <div className="feedback-admin-error">{error}</div>}
      <ul>
        {feedbacks.map((fb, idx) => (
          <li key={idx} className="feedback-admin-item">
            <div><b>User:</b> {fb.user || 'N/A'}</div>
            <div><b>Order ID:</b> {fb.orderId || 'N/A'}</div>
            <div><b>Rating:</b> {fb.rating ? `${fb.rating} ★` : 'No rating'}</div>
            <div><b>Feedback:</b> {fb.comment || fb.feedback}</div>
            <div style={{fontSize:'0.9em',color:'#888'}}>{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserFeedbacks;
