import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { StoreContext } from '../../components/Context/StoreContext';
import OrderFeedback from '../../components/Feedback/OrderFeedback';

const OrderHistory = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url + '/api/order/user-orders', {
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) fetchOrders();
  }, [token, url]);

  if (!token) return <div>Please login to view your order history.</div>;
  if (loading) return <div>Loading your orders...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{maxWidth:600,margin:'40px auto',padding:24,background:'#fff',borderRadius:10,boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2>Your Orders</h2>
        <button onClick={fetchOrders} style={{padding:'6px 16px',borderRadius:6,background:'#3498db',color:'#fff',border:'none',cursor:'pointer'}}>Refresh</button>
      </div>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <ul style={{listStyle:'none',padding:0}}>
          {orders.map(order => (
            <li key={order._id} style={{border:'1px solid #eee',borderRadius:8,padding:16,marginBottom:16}}>
              <div><b>Order ID:</b> {order._id} <button style={{marginLeft:8}} onClick={()=>navigator.clipboard.writeText(order._id)}>Copy</button></div>
              <div><b>Order Number:</b> {order.orderNumber}</div>
              <div><b>Status:</b> {order.status}</div>
              <div><b>Total:</b> ₹{order.totalAmount}</div>
              <div><b>Date:</b> {new Date(order.createdAt).toLocaleString('en-IN')}</div>
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  style={{marginTop:8, background:'#e74c3c', color:'#fff', border:'none', borderRadius:4, padding:'6px 16px', cursor:'pointer'}}
                  onClick={async () => {
                    if(window.confirm('Are you sure you want to cancel this order?')) {
                      try {
                        const res = await axios.post(url+`/api/order/${order._id}/cancel`, {}, { headers: { token } });
                        if(res.data.success) {
                          setOrders(orders => orders.map(o => o._id === order._id ? { ...o, status: 'cancelled' } : o));
                        } else {
                          alert(res.data.message || 'Failed to cancel order');
                        }
                      } catch (err) {
                        alert('Error cancelling order');
                      }
                    }
                  }}
                >
                  Cancel Order
                </button>
              )}
              <OrderFeedback orderId={order._id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
