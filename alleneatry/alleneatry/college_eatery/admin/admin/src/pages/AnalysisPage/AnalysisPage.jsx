import React, { useEffect } from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from "chart.js";
import "./AnalysisPage.css"; // Import the CSS file

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const AnalysisPage = () => {
  // Mock data for analysis (replace with real API data)
  const data = {
    totalOrders: 1200,
    totalRevenue: "₹45,000",
    // 1. Daily Orders Trend
    dailyOrders: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [120, 150, 90, 200, 180, 220, 170],
    },
    // 2. Most Popular Food Items
    popularItems: {
      labels: ["Samosa", "Maggie", "Burger", "Pizza", "Pasta"],
      values: [220, 180, 140, 120, 80],
    },
    // 3. Revenue Analysis (daily)
    revenue: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [5000, 7200, 4800, 9000, 8200, 11000, 7600],
    },
    // 4. Order Distribution by Category
    categoryDistribution: {
      labels: ["Snacks", "Meals", "Drinks"],
      values: [45, 30, 25],
    },
    // 5. Peak Ordering Time
    peakTimes: {
      labels: ["8-9 AM", "10-11 AM", "1-2 PM", "4-5 PM", "7-8 PM"],
      values: [40, 180, 300, 260, 150],
    },
    // 6. Order Status Analysis
    orderStatus: {
      labels: ["Completed", "Pending", "Cancelled"],
      values: [1100, 80, 20],
    },
    // 7. Weekly vs Last Week Comparison
    weeklyComparison: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      thisWeek: [120, 150, 90, 200, 180, 220, 170],
      lastWeek: [100, 140, 110, 190, 160, 200, 150],
    },
    feedback: [
      { user: "John", comment: "Great service!", rating: 5 },
      { user: "Jane", comment: "Loved the food!", rating: 4 },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  // Chart data objects
  const dailyOrdersData = {
    labels: data.dailyOrders.labels,
    datasets: [
      {
        label: "Orders",
        data: data.dailyOrders.values,
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54,162,235,0.2)",
        tension: 0.3,
      },
    ],
  };

  const popularItemsData = {
    labels: data.popularItems.labels,
    datasets: [
      {
        label: "Orders",
        data: data.popularItems.values,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const revenueData = {
    labels: data.revenue.labels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.revenue.values,
        borderColor: "#4BC0C0",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: data.categoryDistribution.labels,
    datasets: [
      {
        data: data.categoryDistribution.values,
        backgroundColor: ["#FF9F40", "#36A2EB", "#FF6384"],
      },
    ],
  };

  const peakTimesData = {
    labels: data.peakTimes.labels,
    datasets: [
      {
        label: "Orders",
        data: data.peakTimes.values,
        backgroundColor: "#bd66ff",
      },
    ],
  };

  const orderStatusData = {
    labels: data.orderStatus.labels,
    datasets: [
      {
        data: data.orderStatus.values,
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
      },
    ],
  };

  const weeklyComparisonData = {
    labels: data.weeklyComparison.labels,
    datasets: [
      {
        label: "This Week",
        data: data.weeklyComparison.thisWeek,
        backgroundColor: "#36A2EB",
      },
      {
        label: "Last Week",
        data: data.weeklyComparison.lastWeek,
        backgroundColor: "#FFCE56",
      },
    ],
  };

  const completionRate = (data.orderStatus.values[0] / data.orderStatus.values.reduce((a, b) => a + b, 0)) * 100;

  useEffect(() => {
    console.log("AnalysisPage mounted: dailyOrders values:", data.dailyOrders.values);
    console.log("ChartJS registered keys:", Object.keys(ChartJS.registry.elements));
  }, []);

  // Error boundary to catch render errors from chart components
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, info) {
      console.error("Chart render error:", error, info);
    }
    render() {
      if (this.state.hasError) {
        return <div style={{ color: "red" }}>Chart failed to render</div>;
      }
      return this.props.children;
    }
  }

  const ChartCard = ({ title, children }) => {
    useEffect(() => {
      console.log(`${title} mounted`);
    }, []);
    return (
      <div className="card">
        <h2>{title}</h2>
        <div className="chart-container" style={{ height: 260 }}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="analysis-page">
      <h1>Analysis Dashboard</h1>
      <div className="grid">
        <div className="card">
          <h2>1️⃣ Daily Orders Trend</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Line data={dailyOrdersData} options={commonOptions} height={240} />
          </div>
        </div>

        <div className="card">
          <h2>2️⃣ Most Popular Food Items</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Bar data={popularItemsData} options={commonOptions} height={240} />
          </div>
        </div>

        <div className="card">
          <h2>3️⃣ Revenue Analysis</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Line data={revenueData} options={commonOptions} height={240} />
          </div>
        </div>

        <div className="card">
          <h2>4️⃣ Order Distribution by Category</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Pie data={categoryData} options={commonOptions} height={240} />
          </div>
        </div>

        <div className="card">
          <h2>5️⃣ Peak Ordering Time</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Bar data={peakTimesData} options={commonOptions} height={240} />
          </div>
        </div>

        <div className="card">
          <h2>6️⃣ Order Status Analysis</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Doughnut data={orderStatusData} options={commonOptions} height={240} />
          </div>
          <p>Completion Rate: {completionRate.toFixed(1)}%</p>
        </div>

        <div className="card">
          <h2>7️⃣ Weekly vs Last Week Comparison</h2>
          <div className="chart-container" style={{ height: 260 }}>
            <Bar data={weeklyComparisonData} options={{ ...commonOptions, scales: { x: { stacked: false }, y: { beginAtZero: true } } }} height={240} />
          </div>
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
          <h2>Totals</h2>
          <p>Total Orders: {data.totalOrders}</p>
          <p>Total Revenue: {data.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;