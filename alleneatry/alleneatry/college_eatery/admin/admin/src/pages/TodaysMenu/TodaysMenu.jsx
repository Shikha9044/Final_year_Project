import React, { useState, useEffect } from 'react';
import './TodaysMenu.css';
import { Link } from 'react-router-dom';

const TodaysMenu = ({ url }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodaysMenu();
  }, []);

  const fetchTodaysMenu = async () => {
    try {
      setLoading(true);
      console.log('Fetching today\'s menu from:', `${url}/api/food/todays-menu`);
      const response = await fetch(`${url}/api/food/todays-menu`);
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s menu');
      }
      const data = await response.json();
      console.log('Today\'s menu data:', data);
      setMenuItems(data);
    } catch (err) {
      console.error('Error fetching today\'s menu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e, itemName) => {
    console.error(`Failed to load image for ${itemName}:`, e.target.src);
    // Instead of hiding the image, show a fallback
    e.target.style.display = 'none';
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'image-fallback';
    fallbackDiv.innerHTML = `
      <div class="fallback-icon">🍽️</div>
      <div class="fallback-text">${itemName}</div>
    `;
    e.target.parentNode.appendChild(fallbackDiv);
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

  if (loading) {
    return (
      <div className="todays-menu">
        <div className="menu-header">
          <h1>Today's Menu</h1>
          <p className="date">{getCurrentDate()}</p>
        </div>
        <div className="loading">Loading today's menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="todays-menu">
        <div className="menu-header">
          <h1>Today's Menu</h1>
          <p className="date">{getCurrentDate()}</p>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="todays-menu">
      <div className="menu-header">
        <h1>Today's Menu</h1>
        <p className="date">{getCurrentDate()}</p>
      </div>
      
      {menuItems.length === 0 ? (
        <div className="no-menu">
          <h3>No items in today's menu yet!</h3>
          <p>To add items to today's menu:</p>
          <div className="no-menu-actions">
            <Link to="/add" className="add-menu-btn">
              Add New Food Item
            </Link>
            <Link to="/list" className="manage-menu-btn">
              Manage Existing Items
            </Link>
          </div>
          <p className="help-text">
            • Use "Add Items" to create new food items and mark them for today's menu<br/>
            • Use "List Items" to toggle existing items in/out of today's menu
          </p>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => {
            const imageUrl = `${url}/images/${item.image}`;
            console.log(`Rendering item ${item.name} with image:`, imageUrl);
            
            return (
              <div key={item._id} className="menu-item">
                <div className="item-image">
                  <img 
                    src={imageUrl} 
                    alt={item.name}
                    onError={(e) => handleImageError(e, item.name)}
                    onLoad={() => console.log(`Image loaded successfully for ${item.name}:`, imageUrl)}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="description">{item.description}</p>
                  <div className="item-meta">
                    <span className="price">₹{item.price}</span>
                    <span className="category">{item.category}</span>
                  </div>
                  <div className="item-status">
                    <span className="status available">
                      ✓ In Today's Menu
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysMenu;
