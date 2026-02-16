
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Analysis.css';
import { OrdersBarChart, RevenuePieChart } from './Charts';

const Analysis = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/order/admin/stats', {
          headers: { token: localStorage.getItem('token') }
        });
        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err) {
        setError('Error fetching stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading analysis...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div className="analysis-container">
      <h2>Order & Revenue Analysis</h2>
      <div className="analysis-cards">
        <div className="analysis-card">
          <h3>Today's Orders</h3>
          <p>{stats.todayOrders}</p>
        </div>
        <div className="analysis-card">
          <h3>Today's Revenue</h3>
          <p>₹{stats.todayRevenue}</p>
        </div>
        <div className="analysis-card">
          <h3>Pending Orders</h3>
          <p>{stats.pendingOrders}</p>
        </div>
        <div className="analysis-card">
          <h3>Preparing Orders</h3>
          <p>{stats.preparingOrders}</p>
        </div>
      </div>
      <div style={{display:'flex',gap:40,marginTop:40,flexWrap:'wrap'}}>
        <div style={{flex:'1 1 350px',minWidth:320,background:'#fff',padding:24,borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <h3 style={{textAlign:'center'}}>Order Status Distribution</h3>
          <OrdersBarChart data={stats} />
        </div>
        <div style={{flex:'1 1 350px',minWidth:320,background:'#fff',padding:24,borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <h3 style={{textAlign:'center'}}>Today's Revenue vs Other</h3>
          <RevenuePieChart data={stats} />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
