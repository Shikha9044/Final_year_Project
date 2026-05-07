import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../components/Context/StoreContext';


const FoodItem = ({ id, name, price, description, image, stock, rating = 0, ratingCount = 0 }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [selected, setSelected] = useState(false);
  const roundedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  const isOutOfStock = stock === 0;

  const handleImageClick = () => {
    setSelected(true);
    setTimeout(() => setSelected(false), 200); // Remove highlight after 200ms
  };

  return (
    <div className={`food-item${isOutOfStock ? ' out-of-stock' : ''}`}> 
      <div className='food-item-img-container'>
        <img
          src={url + "/images/" + image}
          alt=''
          className={`food-item-img${selected ? ' selected' : ''}`}
          onClick={handleImageClick}
        />
        {isOutOfStock && (
          <div className='food-item-out-overlay'>
            <span className='food-item-out-text'>Out of Stock</span>
          </div>
        )}
        {/* Cart Controls */}
        {!isOutOfStock ? (
          (!cartItems || !cartItems[id]
            ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt='' />
            : <div className='food-item-counter'>
                <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                <p>{cartItems[id]}</p>
                <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
              </div>
          )
        ) : null}
      </div>
      <div className='food-item-info'>
        <div className='food-item-name-rating'>
          <p>{name}</p>
          <div className='food-item-stars' aria-label={`Rating ${roundedRating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= roundedRating ? 'filled' : 'empty'}>
                ★
              </span>
            ))}
          </div>
        </div>
        {ratingCount > 0 && <p className='food-item-rating-count'>{rating.toFixed(1)} ({ratingCount})</p>}
        <p className='food-item-desc'>{description}</p>
        <p className='food-item-price'>₹{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
