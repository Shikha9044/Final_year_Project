import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./AnalysisDashboard.css";

const canteenData = {
  orders: [
    { item: "Burger", count: 50 },
    { item: "Pizza", count: 30 },
    { item: "Tea", count: 70 },
    { item: "Sandwich", count: 20 },
  ],
  stock: [
    { item: "Burger", remaining: 20 },
    { item: "Pizza", remaining: 5 },
    { item: "Tea", remaining: 40 },
    { item: "Sandwich", remaining: 0 },
  ],
};

const lowStockThreshold = 5;
const orderColors = ["#2563eb", "#f97316", "#14b8a6", "#8b5cf6", "#ef4444", "#22c55e"];

const AnalysisDashboard = () => {
  const mergedItems = useMemo(() => {
    return canteenData.orders.map((orderItem, index) => {
      const stockItem = canteenData.stock.find((stock) => stock.item === orderItem.item);
      const remaining = stockItem ? stockItem.remaining : 0;

      return {
        item: orderItem.item,
        count: orderItem.count,
        remaining,
        orderColor: orderColors[index % orderColors.length],
        stockColor: remaining === 0 ? "#b91c1c" : remaining <= lowStockThreshold ? "#ef4444" : "#16a34a",
      };
    });
  }, []);

  const mostOrdered = useMemo(
    () => [...mergedItems].sort((a, b) => b.count - a.count)[0],
    [mergedItems]
  );

  const leastOrdered = useMemo(
    () => [...mergedItems].sort((a, b) => a.count - b.count)[0],
    [mergedItems]
  );

  const lowStockItems = useMemo(
    () => mergedItems.filter((item) => item.remaining > 0 && item.remaining <= lowStockThreshold),
    [mergedItems]
  );

  const outOfStockItems = useMemo(
    () => mergedItems.filter((item) => item.remaining === 0),
    [mergedItems]
  );

  return (
    <div className="analysis-page">
      <div className="analysis-shell">
        <section className="analysis-hero">
          <h1>Canteen Analysis Dashboard</h1>
          <p>Overview of orders and stock availability</p>
        </section>

        <section className="chart-grid">
          <article className="chart-card">
            <h2>Orders per Item</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={mergedItems} margin={{ top: 22, right: 18, left: 8, bottom: 22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="item" label={{ value: "Item Names", position: "insideBottom", dy: 12 }} />
                <YAxis
                  allowDecimals={false}
                  label={{ value: "Number of Orders", angle: -90, position: "insideLeft" }}
                />
                <Tooltip formatter={(value) => `${value} orders`} />
                <Legend />
                <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                  {mergedItems.map((entry) => (
                    <Cell key={entry.item} fill={entry.orderColor} />
                  ))}
                  <LabelList dataKey="count" position="top" fill="#111827" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </article>

          <article className="chart-card">
            <h2>Remaining Stock per Item</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={mergedItems} layout="vertical" margin={{ top: 12, right: 25, left: 32, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  label={{ value: "Remaining Quantity", position: "insideBottom", dy: 10 }}
                />
                <YAxis type="category" dataKey="item" label={{ value: "Item Names", angle: -90, position: "insideLeft" }} width={95} />
                <Tooltip formatter={(value) => `${value} units`} />
                <Legend
                  payload={[
                    { value: "In Stock", type: "square", color: "#16a34a" },
                    { value: "Low Stock", type: "square", color: "#ef4444" },
                    { value: "Out of Stock", type: "square", color: "#b91c1c" },
                  ]}
                />
                <Bar dataKey="remaining" name="Remaining Stock" radius={[0, 6, 6, 0]}>
                  {mergedItems.map((entry) => (
                    <Cell key={entry.item} fill={entry.stockColor} />
                  ))}
                  <LabelList dataKey="remaining" position="right" fill="#111827" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </article>
        </section>

        <section className="insights-card">
          <h2>Key Insights</h2>
          <div className="insight-grid">
            <article className="insight-box">
              <h3>Most Ordered Item</h3>
              <p>
                {mostOrdered?.item}: <strong>{mostOrdered?.count ?? 0}</strong> orders
              </p>
            </article>
            <article className="insight-box">
              <h3>Least Ordered Item</h3>
              <p>
                {leastOrdered?.item}: <strong>{leastOrdered?.count ?? 0}</strong> orders
              </p>
            </article>
            <article className="insight-box">
              <h3>Low Stock Items</h3>
              <p>
                {lowStockItems.length > 0
                  ? lowStockItems.map((item) => `${item.item} (${item.remaining})`).join(", ")
                  : "No low stock items"}
              </p>
            </article>
            <article className="insight-box">
              <h3>Out-of-Stock Items</h3>
              <p>
                {outOfStockItems.length > 0
                  ? outOfStockItems.map((item) => item.item).join(", ")
                  : "No out-of-stock items"}
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
