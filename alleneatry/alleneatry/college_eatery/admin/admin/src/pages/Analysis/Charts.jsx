import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function OrdersBarChart({ data }) {
  const chartData = {
    labels: ['Pending', 'Preparing', 'Confirmed', 'Ready', 'Delivered', 'Cancelled'],
    datasets: [
      {
        label: 'Orders',
        data: [
          data.pendingOrders || 0,
          data.preparingOrders || 0,
          data.confirmedOrders || 0,
          data.readyOrders || 0,
          data.deliveredOrders || 0,
          data.cancelledOrders || 0
        ],
        backgroundColor: [
          '#ffa500', '#17a2b8', '#007bff', '#28a745', '#6c757d', '#dc3545'
        ],
      },
    ],
  };
  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function RevenuePieChart({ data }) {
  const chartData = {
    labels: ['Today', 'Other'],
    datasets: [
      {
        label: 'Revenue',
        data: [data.todayRevenue || 0, (data.totalRevenue || 0) - (data.todayRevenue || 0)],
        backgroundColor: ['#28a745', '#e0e0e0'],
      },
    ],
  };
  return <Pie data={chartData} options={{ responsive: true }} />;
}
