import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const PIE_COLORS = ['#22c55e', '#e5e7eb'];

const AnalysisDashboard = () => {
  const [stats, setStats] = useState(null);
  const [itemStats, setItemStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(`${API_URL}/api/order/admin/stats`, {
          headers: { token: localStorage.getItem('token') }
        });

        const itemResponse = await axios.get(`${API_URL}/api/order/admin/item-stats`, {
          headers: { token: localStorage.getItem('token') }
        });

        if (response.data?.success) {
          setStats(response.data.stats);
        } else {
          setError('Failed to load analysis data.');
        }

        if (itemResponse.data?.success) {
          setItemStats(itemResponse.data.itemStats || []);
        }
      } catch (fetchError) {
        setError('Unable to load analysis data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    const currentStats = stats || {};

    return [
      { name: 'Pending', value: currentStats.pendingOrders || 0 },
      { name: 'Preparing', value: currentStats.preparingOrders || 0 },
      { name: 'Today Orders', value: currentStats.todayOrders || 0 }
    ];
  }, [stats]);

  const revenueData = useMemo(() => {
    const currentStats = stats || {};
    const todayRevenue = currentStats.todayRevenue || 0;
    const totalRevenue = currentStats.totalRevenue || todayRevenue;
    return [
      { name: 'Today', value: todayRevenue },
      { name: 'Other', value: Math.max(totalRevenue - todayRevenue, 0) }
    ];
  }, [stats]);

  const itemChartData = useMemo(() => {
    return itemStats.map((item) => ({
      name: item.name,
      totalOrders: item.totalOrders
    }));
  }, [itemStats]);

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        Loading analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', color: '#dc2626', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  const currentStats = stats || {};

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Order & Revenue Analysis</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <StatCard label="Today's Orders" value={currentStats.todayOrders || 0} accent="#2563eb" />
        <StatCard label="Today's Revenue" value={`₹${currentStats.todayRevenue || 0}`} accent="#16a34a" />
        <StatCard label="Pending Orders" value={currentStats.pendingOrders || 0} accent="#f59e0b" />
        <StatCard label="Preparing Orders" value={currentStats.preparingOrders || 0} accent="#ef4444" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        <Panel title="Order Status Overview">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Total Orders by Item">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={itemChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={110} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalOrders" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Today Revenue Split">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={revenueData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={65}
                paddingAngle={2}
              >
                {revenueData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '18px 20px',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
      border: `1px solid ${accent}22`
    }}
  >
    <div style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '10px' }}>{label}</div>
    <div style={{ color: accent, fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
  </div>
);

const Panel = ({ title, children }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
      border: '1px solid rgba(148, 163, 184, 0.18)'
    }}
  >
    <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{title}</h3>
    {children}
  </div>
);

export default AnalysisDashboard;