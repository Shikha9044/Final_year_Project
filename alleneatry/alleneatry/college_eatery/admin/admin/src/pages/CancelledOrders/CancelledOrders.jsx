import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CancelledOrders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from "../../assets/assets";

const CancelledOrders = ({ url = "http://localhost:4000" }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date');

  const fetchCancelledOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${url}/api/order/admin/all`, {
        params: {
          status: 'cancelled',
          page: currentPage,
          limit: 20
        },
        headers: { token }
      });
      if (response.data.success) {
        let sortedOrders = response.data.orders;
        
        // Sort by selected criteria
        if (sortBy === 'date') {
          sortedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'amount') {
          sortedOrders.sort((a, b) => b.total_amount - a.total_amount);
        } else if (sortBy === 'user') {
          sortedOrders.sort((a, b) => (a.userId?.email || '').localeCompare(b.userId?.email || ''));
        }
        
        setOrders(sortedOrders);
        setTotalPages(response.data.totalPages);
        console.log('Cancelled Orders:', response.data.orders);
      } else {
        toast.error("Failed to fetch cancelled orders.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error fetching cancelled orders:", error.response.data);
        toast.error(`Error: ${error.response.data.message || "An error occurred."}`);
      } else {
        console.error("Error fetching cancelled orders:", error);
        toast.error("An error occurred while fetching cancelled orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, [currentPage, sortBy]);

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading && orders.length === 0) {
    return <div className="cancelled-orders-loading">Loading cancelled orders...</div>;
  }

  return (
    <div className="cancelled-orders-container">
      <div className="cancelled-orders-header">
        <h1>🚫 Cancelled Orders List</h1>
        <p>Total Cancelled: {orders.length}</p>
      </div>

      <div className="cancelled-orders-controls">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Latest First</option>
            <option value="amount">Highest Amount</option>
            <option value="user">User Email</option>
          </select>
        </div>
      </div>

      <div className="cancelled-orders-list">
        {orders.length === 0 ? (
          <div className="no-cancelled-orders">
            <p>✅ No cancelled orders found!</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Cancelled On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="order-row cancelled">
                  <td className="order-id">
                    <span className="id-badge">#{order._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="user-info">
                    <div className="user-name">{order.userId?.name || 'Unknown'}</div>
                    <div className="user-email">{order.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="items-count">
                    <span className="badge">{order.items?.length || 0} items</span>
                  </td>
                  <td className="amount">
                    <span className="price">₹{order.total_amount || 0}</span>
                  </td>
                  <td className="timestamp">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="action">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetails(order._id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {orders.length > 0 && (
        <div className="pagination">
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default CancelledOrders;
