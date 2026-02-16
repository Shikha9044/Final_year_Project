import React from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from "chart.js";
import "./AnalysisPage.css"; // Import the CSS file

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const AnalysisPage = () => {
  // Mock data for analysis
  const data = {
    totalOrders: 1200,
    totalRevenue: "₹45,000",
    activeUsers: {
      total: 350,
      students: 200,
      teachers: 150,
    },
    topDishes: ["Pizza", "Burger", "Pasta"],
    topDishesOrders: [300, 250, 150], // Orders for each dish
    revenueTrend: [5000, 7000, 8000, 6000, 9000, 10000], // Monthly revenue
    orderTimeDistribution: [150, 300, 450], // Orders by time of day
    feedback: [
      { user: "John", comment: "Great service!", rating: 5 },
      { user: "Jane", comment: "Loved the food!", rating: 4 },
    ],
    topCustomers: [
      { name: "Alice", orders: 25, spending: "₹500" },
      { name: "Bob", orders: 20, spending: "₹400" },
    ],
  };

  // Data for the Pie Chart (Active Users)
  const activeUsersData = {
    labels: ["Students", "Teachers"],
    datasets: [
      {
        data: [data.activeUsers.students, data.activeUsers.teachers],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Data for the Bar Chart (Top Dishes)
  const topDishesData = {
    labels: data.topDishes,
    datasets: [
      {
        label: "Orders",
        data: data.topDishesOrders,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Data for the Line Chart (Revenue Trend)
  const revenueTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: data.revenueTrend,
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Data for the Doughnut Chart (Order Distribution by Time)
  const orderTimeData = {
    labels: ["Morning", "Afternoon", "Evening"],
    datasets: [
      {
        data: data.orderTimeDistribution,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Calculate Order Completion Rate
  const completedOrders = 1100;
  const pendingOrders = 100;
  const completionRate = (completedOrders / (completedOrders + pendingOrders)) * 100;

  return (
    <div className="analysis-page">
      <h1>Analysis Dashboard</h1>
      <div className="grid">
        <div className="card">
          <h2>Total Orders</h2>
          <p>{data.totalOrders}</p>
        </div>
        <div className="card">
          <h2>Total Revenue</h2>
          <p>{data.totalRevenue}</p>
        </div>
        <div className="card">
          <h2>Active Users</h2>
          <div className="chart-container">
            <Pie data={activeUsersData} />
          </div>
        </div>
        <div className="card">
          <h2>Top Dishes</h2>
          <div className="chart-container">
            <Bar data={topDishesData} />
          </div>
        </div>
        <div className="card">
          <h2>Revenue Trend</h2>
          <div className="chart-container">
            <Line data={revenueTrendData} />
          </div>
        </div>
        <div className="card">
          <h2>Order Distribution by Time</h2>
          <div className="chart-container">
            <Doughnut data={orderTimeData} />
          </div>
        </div>
        <div className="card">
          <h2>Order Completion Rate</h2>
          <p>{completionRate.toFixed(2)}%</p>
          <div className="progress-bar"></div>
        </div>
        <div className="card">
          <h2>Customer Feedback</h2>
          <ul>
            {data.feedback.map((item, index) => (
              <li key={index}>
                <strong>{item.user}:</strong> {item.comment} ({item.rating}★)
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>Top Customers</h2>
          <ul>
            {data.topCustomers.map((customer, index) => (
              <li key={index}>
                {customer.name}: {customer.orders} orders (₹{customer.spending})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;