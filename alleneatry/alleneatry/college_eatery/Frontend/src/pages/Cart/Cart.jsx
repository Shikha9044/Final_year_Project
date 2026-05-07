import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../components/Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, safeGetTotalCartAmount, url, token, loading } = useContext(StoreContext);
  const navigate = useNavigate();

  // Show loading state while data is being fetched
  if (loading) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  const cartEntryIds = Object.entries(cartItems || {})
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([itemId]) => itemId);

  if (cartEntryIds.length === 0) {
    return <p>Your cart is empty. Please add items to proceed.</p>;
  }

  // Use the safe version from context
  const cartTotal = safeGetTotalCartAmount();

  const safeTotal = Number.isFinite(cartTotal) ? cartTotal : 0;

  const cartLineItems = cartEntryIds.map((itemId) => {
    const matchedItem = (food_list || []).find((food) => food._id === itemId);
    const quantity = Number(cartItems[itemId]) || 0;
    const price = matchedItem?.price || 0;
    return {
      itemId,
      name: matchedItem?.name || 'Item',
      image: matchedItem?.image || '',
      price,
      quantity,
      lineTotal: price * quantity
    };
  });


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
        {cartLineItems.map((item) => {
            return (
              <div key={item.itemId}>
                <div className='cart-items-title cart-items-item'>
                  <img src={item.image ? url + "/images/" + item.image : assets.food_1} alt="" />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{item.quantity}</p>
                  <p>₹{item.lineTotal}</p>
                  <img
                    src={assets.remove_icon_red}
                    alt="Remove"
                    className='remove-btn-img'
                    onClick={() => removeFromCart(item.itemId)}
                    style={{ cursor: 'pointer', width: 28, height: 28 }}
                  />
                </div>
                <hr />
              </div>
            );
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{safeTotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{safeTotal}</b>
            </div>
            
          </div>
          <button 
            onClick={() => {
              if (!token) {
                alert('Please log in to proceed to checkout');
                return;
              }
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
