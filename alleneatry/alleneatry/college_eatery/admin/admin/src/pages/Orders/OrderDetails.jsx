import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4000/api/order/admin/${id}`, {
          headers: { token }
        });
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Order #{order.orderNumber}</h2>
      <p><b>Status:</b> {order.status}</p>
      <p><b>Payment:</b> {order.paymentStatus} - ₹{order.totalAmount}</p>
      <h3>Items:</h3>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>{item.name} x {item.quantity} (₹{item.price * item.quantity})</li>
        ))}
      </ul>
      <h3>Customer:</h3>
      <p><b>Name:</b> {order.deliveryAddress?.name || 'N/A'}</p>
      <p><b>Phone:</b> {order.deliveryAddress?.phone || 'N/A'}</p>
      <p><b>Address:</b> {order.deliveryAddress?.address || 'N/A'}</p>
      {order.specialInstructions && (
        <p><b>Special Instructions:</b> {order.specialInstructions}</p>
      )}
    </div>
  );
};

export default OrderDetails;