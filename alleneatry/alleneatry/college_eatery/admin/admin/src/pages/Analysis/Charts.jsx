import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Title, Tooltip, Legend, ArcElement);

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

export function DailyOrdersLineChart({ data }) {
  const chartData = {
    labels: (data || []).map((item) => item.label),
    datasets: [
      {
        type: 'bar',
        label: 'Orders',
        data: (data || []).map((item) => item.value || 0),
        backgroundColor: '#1976ff',
        borderRadius: 12,
        barPercentage: 0.78,
        categoryPercentage: 0.8
      },
      {
        type: 'line',
        label: 'Trend',
        data: (data || []).map((item) => item.value || 0),
        borderColor: '#ff8a00',
        backgroundColor: 'rgba(255, 138, 0, 0.15)',
        pointBackgroundColor: '#ff8a00',
        pointBorderColor: '#ff8a00',
        pointRadius: 4,
        tension: 0.35,
        fill: false,
      },
    ],
  };

  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />;
}

export function DailyRevenueLineChart({ data }) {
  const chartData = {
    labels: (data || []).map((item) => item.label),
    datasets: [
      {
        label: 'Revenue',
        data: (data || []).map((item) => item.value || 0),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.14)',
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ec4899',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  return <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
}

export function OrderStatusPieChart({ data }) {
  const chartData = {
    labels: ['Cancelled', 'Fulfilled', 'Pending'],
    datasets: [
      {
        data: [data.cancelled || 0, data.fulfilled || 0, data.pending || 0],
        backgroundColor: ['#1f6fcb', '#ef3b39', '#fb8c00'],
        borderWidth: 0,
      },
    ],
  };

  return <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '0%' }} />;
}

export function ItemOrdersBarChart({ data }) {
  const chartData = {
    labels: (data || []).map((item) => item.name),
    datasets: [
      {
        label: 'Total Orders',
        data: (data || []).map((item) => item.totalOrders || 0),
        backgroundColor: '#8b5cf6',
        borderRadius: 10,
        barPercentage: 0.65,
        categoryPercentage: 0.72,
      }
    ]
  };

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0 } },
          y: { ticks: { autoSkip: false } }
        }
      }}
    />
  );
}

export function RevenueVsExpensesLineChart({ revenueData, expensesData }) {
  const labels = (revenueData || []).map((item) => item.label);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: (revenueData || []).map((item) => item.value || 0),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#22c55e',
        tension: 0.35,
        fill: false,
      },
      {
        label: 'Expenses',
        data: (expensesData || []).map((item) => item.value || 0),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#2563eb',
        tension: 0.35,
        fill: false,
      }
    ],
  };

  return <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />;
}

export function ProductRevenueDoughnutChart({ data }) {
  const labels = (data || []).map((item) => item.name);
  const values = (data || []).map((item) => item.totalRevenue || 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'],
        borderWidth: 0,
      },
    ],
  };

  return <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '58%' }} />;
}
