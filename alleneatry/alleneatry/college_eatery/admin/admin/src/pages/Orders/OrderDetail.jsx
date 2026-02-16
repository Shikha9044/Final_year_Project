import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from "../../assets/assets";
import AdminFeedbackForm from '../../components/AdminFeedbackForm';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const url = "http://localhost:4000";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/order/admin/${orderId}`);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error("Failed to fetch order details.");
        navigate('/orders');
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("An error occurred while fetching order details.");
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const response = await axios.put(`${url}/api/order/admin/${orderId}/status`, {
        status: newStatus,
      });
      
      if (response.data.success) {
        await fetchOrderDetail();
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

  // Cancel order handler
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const response = await axios.put(`${url}/api/order/${order._id}/cancel`);
      if (response.data.success) {
        toast.success('Order cancelled successfully.');
        await fetchOrderDetail();
      } else {
        toast.error('Failed to cancel order.');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the order.');
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
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return <div className="order add"><h3>Loading order details...</h3></div>;
  }

  if (!order) {
    return <div className="order add"><h3>Order not found</h3></div>;
  }

  return (
    <div className="order add">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Order Details - #{order.orderNumber}</h3>
        <button 
          onClick={() => navigate('/orders')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          ← Back to Orders
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left Column - Order Information */}
        <div>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Order Information</h4>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Order Number:</strong> {order.orderNumber}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Order Date:</strong> {formatDate(order.createdAt)}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(order.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {order.status.toUpperCase()}
                </span>
                {/* Cancel Order Button (show if not delivered/cancelled) */}
                {(order.status !== 'cancelled' && order.status !== 'delivered') && (
                  <button
                    onClick={handleCancelOrder}
                    style={{
                      marginLeft: '20px',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </p>
              {order.tokenNumber && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Pickup Token:</strong> {order.tokenNumber}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Payment Details</h5>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Method:</strong> {order.paymentMethod?.toUpperCase() || 'CASH'}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Status:</strong> {order.paymentStatus?.toUpperCase() || 'PENDING'}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Total Amount:</strong> ₹{order.totalAmount}
              </p>
            </div>

            {order.estimatedDeliveryTime && (
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Delivery Information</h5>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Estimated Delivery:</strong> {formatDate(order.estimatedDeliveryTime)}
                </p>
                {order.actualDeliveryTime && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Actual Delivery:</strong> {formatDate(order.actualDeliveryTime)}
                  </p>
                )}
              </div>
            )}

            {order.specialInstructions && (
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Special Instructions</h5>
                <p style={{ margin: '5px 0', fontSize: '14px', fontStyle: 'italic' }}>
                  {order.specialInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Customer Information</h4>
            
            {order.userId && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Name:</strong> {order.userId.name || 'N/A'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Email:</strong> {order.userId.email || 'N/A'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Phone:</strong> {order.userId.phone || order.deliveryAddress?.phone || 'N/A'}
                </p>
              </div>
            )}

            <div>
              <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Delivery Address</h5>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Name:</strong> {order.deliveryAddress?.name || 'N/A'}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Phone:</strong> {order.deliveryAddress?.phone || 'N/A'}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Address:</strong> {order.deliveryAddress?.address || 'N/A'}
              </p>
              {order.deliveryAddress?.landmark && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Landmark:</strong> {order.deliveryAddress.landmark}
                </p>
              )}
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Pincode:</strong> {order.deliveryAddress?.pincode || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Order Items and Status Control */}
        <div>
          {/* Order Items */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Order Items</h4>
            
            {order.items.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <img 
                  src={item.image ? `${url}/images/${item.image}` : assets.parcel_icon} 
                  alt={item.name}
                  style={{ width: '50px', height: '50px', borderRadius: '4px', marginRight: '15px' }}
                />
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{item.name}</h5>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                    Quantity: {item.quantity} | Price: ₹{item.price}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 0',
              borderTop: '2px solid #eee',
              marginTop: '10px'
            }}>
              <h4 style={{ margin: 0, color: '#333' }}>Total</h4>
              <h4 style={{ margin: 0, color: '#333' }}>₹{order.totalAmount}</h4>
            </div>
          </div>

          {/* Status Control */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Update Order Status</h4>
            
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '15px',
                fontSize: '14px'
              }}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div style={{ marginTop: '15px' }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Status Timeline</h5>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Created:</strong> {formatDate(order.createdAt)}
                </p>
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Last Updated:</strong> {formatDate(order.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
