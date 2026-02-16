import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../components/Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, safeGetTotalCartAmount, url, token, loading } = useContext(StoreContext);
  const navigate = useNavigate();
  
  console.log('Cart Items:', cartItems);
  console.log('Food List:', food_list);
  console.log('Loading:', loading);
  console.log('Token status:', token ? 'Logged in' : 'Not logged in');

  // Show loading state while data is being fetched
  if (loading) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  // Additional safety check - ensure food_list and cartItems are loaded
  if (!food_list || food_list.length === 0) {
    return <div className="cart-loading">Loading food items...</div>;
  }

  if (!cartItems || Object.keys(cartItems).length === 0) {
    return <p>Your cart is empty. Please add items to proceed.</p>;
  }

  // Use the safe version from context
  const cartTotal = safeGetTotalCartAmount();
  console.log('Total Cart Amount:', cartTotal);

  // Final safety check - if cartTotal is still undefined or NaN, return early
  if (cartTotal === undefined || cartTotal === null || isNaN(cartTotal)) {
    console.error('Invalid cart total calculated:', cartTotal);
    return <div className="cart-loading">Error loading cart. Please refresh the page.</div>;
  }

  if (cartTotal === 0) {
    return <p>Your cart is empty. Please add items to proceed.</p>;
  }


  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title cart-header-attractive">
          <p className="cart-header-word items">🛒 Items</p>
          <p className="cart-header-word title">🍽️ Title</p>
          <p className="cart-header-word price">💰 Price</p>
          <p className="cart-header-word quantity">🔢 Quantity</p>
          <p className="cart-header-word total">🧾 Total</p>
          <p className="cart-header-word remove">❌Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          // Additional safety check for item properties
          if (!item || !item._id || !item.price || !item.name) {
            console.warn('Invalid item in food_list:', item);
            return null;
          }
          
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className='cart-items-title cart-items-item'>
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <img
                    src={assets.remove_icon_red}
                    alt="Remove"
                    className='remove-btn-img'
                    onClick={() => removeFromCart(item._id)}
                    style={{ cursor: 'pointer', width: 28, height: 28 }}
                  />
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{cartTotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{cartTotal}</b>
            </div>
            
          </div>
          <button 
            onClick={() => {
              console.log('Checkout button clicked!');
              console.log('Token status:', token ? 'Logged in' : 'Not logged in');
              
              if (!token) {
                alert('Please log in to proceed to checkout');
                return;
              }
              
              console.log('Navigating to /order');
              navigate('/order');
            }}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code , Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
