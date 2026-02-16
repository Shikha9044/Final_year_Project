import React, { useState, useEffect, useContext } from 'react';
import './SpecialMenuPopup.css';
import { StoreContext } from '../Context/StoreContext';
import { assets } from '../../assets/assets';

const SpecialMenuPopup = ({ onClose }) => {
  const [specialMenuItems, setSpecialMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { url, addToCart, cartItems, removeFromCart, fetchFoodList } = useContext(StoreContext);

  useEffect(() => {
    fetchSpecialMenu();
  }, []);

  const fetchSpecialMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/food/todays-menu`);
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s menu');
      }
      const data = await response.json();
      setSpecialMenuItems(data);
    } catch (err) {
      console.error('Error fetching special menu:', err);
      setSpecialMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      // Refresh main food list when popup closes so newly added items appear
      try { fetchFoodList(); } catch (err) { console.warn('Failed refreshing food list', err); }
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="special-menu-popup-overlay" onClick={handleBackdropClick}>
        <div className="special-menu-popup">
          <div className="popup-header">
            <h2>🍽️ Today's Special Menu</h2>
            <p className="date">{getCurrentDate()}</p>
            <button className="close-btn" onClick={() => { try { fetchFoodList(); } catch (err) { console.warn('Failed refreshing food list', err); } onClose(); }}>×</button>
          </div>
          <div className="loading">Loading today's special menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="special-menu-popup-overlay" onClick={handleBackdropClick}>
      <div className="special-menu-popup">
        <div className="popup-header">
          <h2>🍽️ Today's Special Menu</h2>
          <p className="date">{getCurrentDate()}</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {specialMenuItems.length === 0 ? (
          <div className="no-special-menu">
            <div className="no-menu-icon">🍽️</div>
            <h3>No Special Items Today</h3>
            <p>Check back later for today's special menu items!</p>
          </div>
        ) : (
          <div className="special-menu-content">
            <div className="special-menu-grid">
              {specialMenuItems.map((item) => {
                const isOutOfStock = item.stock === 0;
                return (
                  <div key={item._id} className={`special-menu-item${isOutOfStock ? ' out-of-stock' : ''}`}>
                    <div className="item-image">
                      <img src={`${url}/images/${item.image}`} alt={item.name} />
                      <div className="special-badge">⭐ Special</div>
                      {isOutOfStock && (
                        <div className="food-item-out-overlay">
                          <span className="food-item-out-text">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="description">{item.description}</p>
                      <div className="item-meta">
                        <span className="price">₹{item.price}</span>
                        <span className="category">{item.category}</span>
                      </div>
                      <div className="item-actions">
                        {!isOutOfStock ? (
                          (!cartItems || !cartItems[item._id] ? (
                            <img 
                              className='add-to-cart' 
                              onClick={() => addToCart(item._id)} 
                              src={assets.add_icon_green} 
                              alt='Add to cart' 
                            />
                          ) : (
                            <div className='food-item-counter'>
                              <img 
                                onClick={() => removeFromCart(item._id)} 
                                src={assets.remove_icon_red} 
                                alt="Remove from cart" 
                              />
                              <p>{cartItems[item._id]}</p>
                              <img 
                                onClick={() => addToCart(item._id)} 
                                src={assets.add_icon_green} 
                                alt="Add to cart" 
                              />
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialMenuPopup;
