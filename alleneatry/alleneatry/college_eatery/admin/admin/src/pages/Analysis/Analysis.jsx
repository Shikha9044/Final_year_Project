
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Analysis.css';
import {
  OrderStatusPieChart,
  ItemOrdersBarChart,
  DailyOrdersLineChart,
  DailyRevenueLineChart,
  RevenueVsExpensesLineChart,
  ProductRevenueDoughnutChart
} from './Charts';

const VIEW_OPTIONS = ['day', 'week', 'month', 'year'];
const VIEW_LABELS = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year'
};
const PRODUCT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const pad = (value) => String(value).padStart(2, '0');
const localDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const hourLabel = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

const createBuckets = (view) => {
  const today = new Date();

  if (view === 'day') {
    return Array.from({ length: 24 }, (_, hour) => ({
      key: String(hour),
      label: hourLabel(hour)
    }));
  }

  if (view === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: localDateKey(date),
        label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      };
    });
  }

  if (view === 'month') {
    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - index));
      return {
        key: localDateKey(date),
        label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
    return {
      key: monthKey(date),
      label: date.toLocaleDateString('en-IN', { month: 'short' })
    };
  });
};

const buildSeries = (orders, view, metric) => {
  const buckets = createBuckets(view);
  const valuesByKey = new Map(buckets.map((bucket) => [bucket.key, 0]));

  (orders || []).forEach((order) => {
    const date = new Date(order.createdAt);
    let key = '';

    if (view === 'day') {
      key = String(date.getHours());
    } else if (view === 'week' || view === 'month') {
      key = localDateKey(date);
    } else {
      key = monthKey(date);
    }

    if (!valuesByKey.has(key)) {
      return;
    }

    const increment = metric === 'revenue' ? Number(order.totalAmount || 0) : 1;
    valuesByKey.set(key, valuesByKey.get(key) + increment);
  });

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: valuesByKey.get(bucket.key) || 0
  }));
};

const buildProductRevenue = (orders) => {
  const totals = new Map();

  (orders || []).forEach((order) => {
    (order.items || []).forEach((item) => {
      const itemName = item.name || item.foodId?.name || 'Unknown item';
      const itemRevenue = Number(item.price || 0) * Number(item.quantity || 0);
      totals.set(itemName, (totals.get(itemName) || 0) + itemRevenue);
    });
  });

  return Array.from(totals.entries())
    .map(([name, totalRevenue]) => ({ name, totalRevenue }))
    .sort((first, second) => second.totalRevenue - first.totalRevenue)
    .slice(0, 4);
};

const buildItemCounts = (orders) => {
  const totals = new Map();

  (orders || []).forEach((order) => {
    (order.items || []).forEach((item) => {
      const itemName = item.name || item.foodId?.name || 'Unknown item';
      totals.set(itemName, (totals.get(itemName) || 0) + Number(item.quantity || 0));
    });
  });

  return Array.from(totals.entries())
    .map(([name, totalOrders]) => ({ name, totalOrders }))
    .sort((first, second) => second.totalOrders - first.totalOrders)
    .slice(0, 8);
};

const ChartFrame = ({ title, activeView, onChangeView, actionLabel, children }) => (
  <div className="analysis-chart-card">
    <div className="analysis-chart-header">
      <button type="button" className="analysis-title-pill">
        {title}
        {title !== 'Revenue Profit Product wise' ? <span className="analysis-title-caret">▾</span> : null}
      </button>
      {activeView ? (
        <div className="analysis-range-tabs">
          {VIEW_OPTIONS.map((view) => (
            <button
              key={view}
              type="button"
              className={`analysis-range-tab ${activeView === view ? 'active' : ''}`}
              onClick={() => onChangeView(view)}
            >
              {VIEW_LABELS[view]}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="analysis-options-button">
          {actionLabel || 'Options'} <span>▾</span>
        </button>
      )}
    </div>
    {children}
  </div>
);

const Analysis = () => {
  const [orders, setOrders] = useState([]);
  const [dailyOrdersView, setDailyOrdersView] = useState('month');
  const [dailyValuesView, setDailyValuesView] = useState('month');
  const [revenueVsExpensesView, setRevenueVsExpensesView] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const headers = { token: localStorage.getItem('token') };
        const response = await axios.get('http://localhost:4000/api/order/admin/all?limit=5000&page=1', { headers });

        if (response.data?.success) {
          setOrders(response.data.orders || []);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError('Error fetching stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dailyOrdersSeries = useMemo(
    () => buildSeries(orders, dailyOrdersView, 'count'),
    [orders, dailyOrdersView]
  );
  const dailyValuesSeries = useMemo(
    () => buildSeries(orders, dailyValuesView, 'revenue'),
    [orders, dailyValuesView]
  );
  const revenueSeries = useMemo(
    () => buildSeries(orders, revenueVsExpensesView, 'revenue'),
    [orders, revenueVsExpensesView]
  );
  const expensesSeries = useMemo(
    () => revenueSeries.map((item) => ({
      label: item.label,
      value: Math.round(item.value * 0.62)
    })),
    [revenueSeries]
  );
  const productRevenue = useMemo(() => buildProductRevenue(orders), [orders]);
  const statusStats = useMemo(() => {
    const totals = { pending: 0, fulfilled: 0, cancelled: 0 };

    (orders || []).forEach((order) => {
      if (order.status === 'pending') {
        totals.pending += 1;
      } else if (order.status === 'cancelled') {
        totals.cancelled += 1;
      } else {
        totals.fulfilled += 1;
      }
    });

    return totals;
  }, [orders]);
  const itemStats = useMemo(() => buildItemCounts(orders), [orders]);

  if (loading) return <div>Loading analysis...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  const totalProductRevenue = productRevenue.reduce((sum, item) => sum + item.totalRevenue, 0) || 1;

  return (
    <div className="analysis-container">
      <div className="analysis-top-grid">
        <ChartFrame title="Daily Orders" activeView={dailyOrdersView} onChangeView={setDailyOrdersView}>
          <div className="analysis-chart-area">
            <DailyOrdersLineChart data={dailyOrdersSeries} />
          </div>
        </ChartFrame>

        <ChartFrame title="Daily Values" activeView={dailyValuesView} onChangeView={setDailyValuesView}>
          <div className="analysis-chart-area">
            <DailyRevenueLineChart data={dailyValuesSeries} />
          </div>
        </ChartFrame>
      </div>

      <div className="analysis-bottom-grid">
        <div className="analysis-column-stack">
          <ChartFrame title="Revenue VS Expenses" activeView={revenueVsExpensesView} onChangeView={setRevenueVsExpensesView}>
            <div className="analysis-chart-area">
              <RevenueVsExpensesLineChart
                revenueData={revenueSeries}
                expensesData={expensesSeries}
              />
            </div>
          </ChartFrame>

          <div className="analysis-chart-card">
            <div className="analysis-chart-header">
              <button type="button" className="analysis-title-pill">
                Order Status Pie Chart
              </button>
              <button type="button" className="analysis-options-button">
                Options <span>▾</span>
              </button>
            </div>
            <div className="analysis-chart-area analysis-chart-area--pie">
              <OrderStatusPieChart data={statusStats} />
            </div>
          </div>
        </div>

        <div className="analysis-column-stack">
          <div className="analysis-chart-card">
            <div className="analysis-chart-header">
              <button type="button" className="analysis-title-pill">
                Revenue Profit Product wise
              </button>
              <button type="button" className="analysis-options-button">
                Options <span>▾</span>
              </button>
            </div>
            <div className="analysis-product-body">
              <div className="analysis-product-list">
                {productRevenue.map((item, index) => {
                  const percentage = Math.round((item.totalRevenue / totalProductRevenue) * 100);
                  return (
                    <div className="analysis-product-item" key={item.name}>
                      <div className="analysis-product-name">
                        <span
                          className="analysis-product-dot"
                          style={{ backgroundColor: PRODUCT_COLORS[index % PRODUCT_COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span>{percentage}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="analysis-product-chart">
                <ProductRevenueDoughnutChart data={productRevenue} />
              </div>
            </div>
          </div>

          <div className="analysis-chart-card">
            <div className="analysis-chart-header">
              <button type="button" className="analysis-title-pill">
                Most Demanding item
              </button>
              <button type="button" className="analysis-options-button">
                Options <span>▾</span>
              </button>
            </div>
            <div className="analysis-chart-area">
              <ItemOrdersBarChart data={itemStats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
