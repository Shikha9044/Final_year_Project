import React from 'react';

const StarRating = ({ rating, setRating, disabled }) => {
  return (
    <div className="star-rating" style={{ display: 'inline-block' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: 22,
            color: star <= rating ? '#FFD700' : '#ccc',
            cursor: disabled ? 'default' : 'pointer',
            marginRight: 2
          }}
          onClick={() => !disabled && setRating(star)}
          role="button"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
