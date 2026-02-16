import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({ orders: 0, users: 0, sales: 0 });
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Example endpoints, adjust as needed
        const [ordersRes, usersRes, lowStockRes] = await Promise.all([
          fetch(url + '/api/order/stats'),
          fetch(url + '/api/user/stats'),
          fetch(url + '/api/food/low-stock', { credentials: 'include' })
        ]);
        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();
        const lowStockData = await lowStockRes.json();
        setStats({
          orders: ordersData.totalOrders || 0,
          users: usersData.totalUsers || 0,
          sales: ordersData.totalSales || 0
        });
        setLowStock(lowStockData.items || []);
        if (lowStockData.items && lowStockData.items.length > 0) {
          toast.warn(`Low stock alert: ${lowStockData.items.map(i => i.name + ' (' + i.stock + ')').join(', ')}`, { position: 'top-center', autoClose: 8000 });
        }
      } catch (err) {
        setStats({ orders: 0, users: 0, sales: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [url]);

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Orders</h3>
          <p>{loading ? '...' : stats.orders}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Users</h3>
          <p>{loading ? '...' : stats.users}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <p>{loading ? '...' : `₹${stats.sales}`}</p>
        </div>
      </div>
      {lowStock.length > 0 && (
        <div style={{ marginTop: 24, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 16 }}>
          <h4 style={{ color: '#d48806' }}>Low/Out of Stock Items</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {lowStock.map(item => (
              <li key={item._id} style={{ color: item.stock === 0 ? 'red' : '#d48806', fontWeight: 500 }}>
                {item.name} (Stock: {item.stock})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
