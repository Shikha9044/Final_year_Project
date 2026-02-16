import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from "../../assets/assets";

const Orders = () => {
  const navigate = useNavigate();
  const url = "http://localhost:4000";
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${url}/api/order/admin/all`, {
        params: {
          status: filter,
          page: currentPage,
          limit: 20
        },
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
        console.log('Orders:', response.data.orders);
      } else {
        toast.error("Failed to fetch orders.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error fetching orders:", error.response.data);
        toast.error(`Error: ${error.response.data.message || "An error occurred while fetching orders."}`);
      } else {
        console.error("Error fetching orders:", error);
        toast.error("An error occurred while fetching orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${url}/api/order/admin/stats`, {
        headers: { token }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${url}/api/order/admin/${orderId}/status`, {
        status: event.target.value,
      }, {
        headers: { token }
      });
      if (response.data.success) {
        await fetchAllOrders();
        await fetchStats();
        toast.success("Order status updated successfully.");
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'confirmed': return '#007bff';
      case 'preparing': return '#ffc107';
      case 'ready': return '#28a745';
      case 'delivered': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    // initial fetch
    fetchAllOrders();
    fetchStats();
    // poll for new orders/stats every 5 seconds
    const interval = setInterval(() => {
      fetchAllOrders();
      fetchStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [filter, currentPage]);

  if (loading) {
    return <div className="order add"><h3>Loading orders...</h3></div>;
  }

  return (
    <div className="order add">
      <h3>Order Management</h3>
      
      {/* Statistics Dashboard */}
      <div className="stats-dashboard" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div className="stat-card" style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Today's Orders</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.todayOrders || 0}</p>
        </div>
        <div className="stat-card" style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Today's Revenue</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>₹{stats.todayRevenue || 0}</p>
        </div>
        <div className="stat-card" style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffa500' }}>Pending Orders</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.pendingOrders || 0}</p>
        </div>
        <div className="stat-card" style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Preparing Orders</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.preparingOrders || 0}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls" style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <div className="pagination" style={{ marginLeft: 'auto' }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              marginRight: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ margin: '0 10px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              marginLeft: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div className="order-list">
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No orders found for the selected filter.
          </div>
        ) : (
          orders.map((order, index) => (
            <div key={order._id} className="order-item" style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={assets.parcel_icon} alt="Parcel Icon" style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#333' }}>Order #{order.orderNumber}</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {order.status.toUpperCase()}
                  </div>
                  {order.tokenNumber && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      Token: {order.tokenNumber}
                    </p>
                  )}
                  {<button 
                    onClick={() => navigate(`/orders/${order._id}`)}
                    style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #007bff',
                      backgroundColor: '#007bff',
                      color: 'white',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button> }
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                {/* Order Details */}
                <div>
                  <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Order Items:</h5>
                  <div style={{ marginBottom: '15px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '5px',
                        fontSize: '14px'
                      }}>
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Customer Details:</h5>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Name:</strong> {order.deliveryAddress?.name || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Phone:</strong> {order.deliveryAddress?.phone || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Address:</strong> {order.deliveryAddress?.address || 'N/A'}
                  </p>
                  {order.specialInstructions && (
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      <strong>Special Instructions:</strong> {order.specialInstructions}
                    </p>
                  )}
                </div>

                {/* Payment & Amount */}
                <div>
                  <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Payment Details:</h5>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Method:</strong> {order.paymentMethod?.toUpperCase() || 'CASH'}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Status:</strong> {order.paymentStatus?.toUpperCase() || 'PENDING'}
                  </p>
                  {order.paymentStatus === 'received' ? (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: 'green', fontWeight: 'bold' }}>
                      Payment Received: ₹{order.totalAmount}
                    </p>
                  ) : (
                    <>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#d35400', fontWeight: 'bold' }}>
                        Payment Pending
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Total Amount:</strong> ₹{order.totalAmount}
                      </p>
                    </>
                  )}
                </div>

                {/* Status Control */}
                <div>
                  <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Update Status:</h5>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      marginBottom: '10px'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  {order.estimatedDeliveryTime && (
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      <strong>Est. Delivery:</strong><br />
                      {formatDate(order.estimatedDeliveryTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;