import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './UserFeedbacks.css';

const UserFeedbacks = ({ url = 'http://localhost:4000' }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${url}/api/feedback`, { headers: { token } });
        if (response.data.success) {
          // Show only user submitted item-level feedback.
          const itemFeedbacks = (response.data.feedbacks || []).filter(
            (fb) => !fb.isAdmin && (fb.feedbackScope === 'item' || !!fb.itemId || !!fb.itemName)
          );
          setFeedbacks(itemFeedbacks);
        } else {
          setError(response.data.message || 'Failed to fetch feedback');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Error fetching feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [url]);

  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    const normalizedQuery = searchCategory.trim().toLowerCase();
    if (!normalizedQuery) return sortedFeedbacks;

    return sortedFeedbacks.filter((fb) => {
      const category = String(fb.itemCategory || '').toLowerCase();
      return category.includes(normalizedQuery);
    });
  }, [sortedFeedbacks, searchCategory]);

  const formatUserLabel = (userValue) => {
    if (!userValue) return 'Anonymous User';
    const raw = String(userValue).trim();
    if (!raw) return 'Anonymous User';
    if (raw.includes('@')) return raw.split('@')[0].replace(/[._-]/g, ' ');
    return raw;
  };

  const getInitials = (name) => {
    const parts = String(name || 'User').split(' ').filter(Boolean);
    const first = parts[0]?.[0] || 'U';
    const second = parts[1]?.[0] || '';
    return `${first}${second}`.toUpperCase();
  };

  const renderStars = (ratingValue) => {
    const rating = Math.max(0, Math.min(5, Math.round(Number(ratingValue) || 0)));
    return (
      <span className="feedback-stars" aria-label={`Rating ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'filled' : 'empty'}>
            ★
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="uf-page">
      <div className="uf-topbar">
        <h3>Recent Feedback</h3>
        <div className="uf-search-wrap">
          <div className="uf-search-box">
            <span className="uf-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search category"
              value={searchCategory}
              onChange={(event) => setSearchCategory(event.target.value)}
            />
          </div>
          <button type="button" className="uf-filter-btn" aria-label="Filter">
            ▽
          </button>
        </div>
      </div>

      {loading && <div className="uf-state">Loading...</div>}
      {error && <div className="uf-state uf-error">{error}</div>}

      {!loading && !error && filteredFeedbacks.length === 0 && (
        <div className="uf-state">No item feedback available for this category.</div>
      )}

      <div className="uf-grid">
        {filteredFeedbacks.map((fb, idx) => {
          const userLabel = formatUserLabel(fb.user);
          const initials = getInitials(userLabel);

          return (
            <article key={fb._id || idx} className="uf-card">
              <div className="uf-card-user-row">
                <div className="uf-user-avatar" aria-hidden="true">{initials}</div>
                <div>
                  <h4>{userLabel}</h4>
                  <p>{fb.createdAt ? `Reviewed ${new Date(fb.createdAt).toLocaleDateString('en-IN')}` : 'Recent feedback'}</p>
                </div>
              </div>

              <div className="uf-card-item-row">
                <img
                  src={fb.itemImage ? `${url}/images/${fb.itemImage}` : 'https://via.placeholder.com/72?text=Food'}
                  alt={fb.itemName || 'Food item'}
                  onError={(event) => {
                    event.currentTarget.src = 'https://via.placeholder.com/72?text=Food';
                  }}
                />
                <div>
                  <h5>{fb.itemName || 'Item Name'}</h5>
                  <div className="uf-stars-row">{renderStars(fb.rating)}</div>
                  <p className="uf-meta">{fb.itemCategory || 'General'} • Order {fb.orderId || 'N/A'}</p>
                </div>
              </div>

              <p className="uf-comment">{fb.comment || 'No comment provided.'}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default UserFeedbacks;
