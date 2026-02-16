import React, { useState, useEffect, useContext, useRef } from 'react';
import { StoreContext } from '../../components/Context/StoreContext';
import axios from 'axios';
import './UserProfile.css';
import FeedbackForm from '../../components/FeedbackForm';

const UserProfile = () => {
  const { token, user, setUser } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePic: user?.profilePic || ''
  });
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || '');
  const fileInputRef = useRef();

  useEffect(() => {
    if (token && activeTab === 'orders') {
      fetchOrders();
    }
  }, [token, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/order/user-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      let uploadUrl = '';
      if (profileData.profilePic && profileData.profilePic !== user?.profilePic && profileData.profilePic.startsWith('data:')) {
        // Upload base64 image to server (implement this endpoint in backend if needed)
        const uploadRes = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/user/upload-profile-pic`, { image: profileData.profilePic }, { headers: { Authorization: `Bearer ${token}` } });
        if (uploadRes.data.success) {
          uploadUrl = uploadRes.data.url;
        }
      }
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/user/profile`,
        { ...profileData, profilePic: uploadUrl || profileData.profilePic },
        {
          headers: { token }
        }
      );
      if (response.data.success) {
        setUser(response.data.user);
        setEditMode(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        setProfileData((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#ffa500',
      confirmed: '#007bff',
      preparing: '#17a2b8',
      ready: '#28a745',
      delivered: '#6c757d',
      cancelled: '#dc3545'
    };
    return statusColors[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProfileTab = () => (
    <div className="profile-section">
      <div className="profile-header">
        <h2>Profile Information</h2>
        <button 
          onClick={() => setEditMode(!editMode)} 
          className="edit-btn"
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {editMode ? (
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            />
          </div>
          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-item">
            <span className="label">Name:</span>
            <span className="value">{user?.name || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{user?.email || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="label">Phone:</span>
            <span className="value">{user?.phone || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="label">Member Since:</span>
            <span className="value">
              {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="orders-section">
      <h2>Order History</h2>
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
          <p>Start ordering delicious food to see your order history here!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-number">
                  <strong>Order #{order.orderNumber}</strong>
                </div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              <div style={{marginTop:8, marginBottom:8}}>
                <b>Order ID:</b> {order._id} <button style={{marginLeft:8}} onClick={()=>navigator.clipboard.writeText(order._id)}>Copy</button>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/images/${item.image}`} 
                      alt={item.name}
                    />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: ₹{order.totalAmount}</strong>
                </div>
                <div className="order-date">
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <button style={{marginTop:8}} onClick={()=>window.location.href = `/track/${order._id}`}>Track Order</button>
              {/* Feedback Form for this order */}
              <div style={{marginTop:16}}>
                <FeedbackForm orderId={order._id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-section">
      <h2>Account Settings</h2>
      
      <div className="settings-group">
        <h3>Password</h3>
        <p>Change your account password</p>
        <button className="change-password-btn">Change Password</button>
      </div>
      
      <div className="settings-group">
        <h3>Notifications</h3>
        <div className="setting-item">
          <label>
            <input type="checkbox" defaultChecked />
            Email notifications for orders
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input type="checkbox" defaultChecked />
            SMS notifications for delivery
          </label>
        </div>
      </div>
      
      <div className="settings-group">
        <h3>Privacy</h3>
        <div className="setting-item">
          <label>
            <input type="checkbox" defaultChecked />
            Share order history for recommendations
          </label>
        </div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="user-profile-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header-banner">
        <div className="profile-avatar" style={{position:'relative',cursor: editMode ? 'pointer' : 'default'}} onClick={() => editMode && fileInputRef.current.click()}>
          {profilePicPreview ? (
            <img src={profilePicPreview} alt="Profile" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
          ) : (
            <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
          {editMode && (
            <span style={{position:'absolute',bottom:0,right:0,background:'#fff',borderRadius:'50%',padding:4,border:'1px solid #ccc',fontSize:12}}>✏️</span>
          )}
          <input type="file" accept="image/*" style={{display:'none'}} ref={fileInputRef} onChange={handleProfilePicChange} />
        </div>
        <div className="profile-welcome">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your profile, view orders, and customize your experience</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
