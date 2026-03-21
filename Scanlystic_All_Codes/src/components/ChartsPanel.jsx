import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#14b8a6", "#2563eb", "#8b5cf6", "#f59e0b", "#fb7185", "#22c55e", "#06b6d4"];

function groupByDay(items, fieldName) {
  const map = new Map();
  items.forEach((item) => {
    const date = new Date(item.createdAt || Date.now());
    const key = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const current = map.get(key) || 0;

    let value = 0;
    if (fieldName === "price") value = Number(item.price || 0) * Number(item.quantity || 1);
    if (fieldName === "calories") value = Number(item.caloriesPer100g || 0) * Number(item.quantity || 1);

    map.set(key, current + value);
  });

  return Array.from(map.entries()).map(([date, value]) => ({
    date,
    value: Number(value.toFixed(2))
  }));
}

function FancyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chartTooltip">
      <strong>{label}</strong>
      <span>{payload[0].value}</span>
    </div>
  );
}

export default function ChartsPanel({ items }) {
  const spendingData = useMemo(() => groupByDay(items, "price"), [items]);
  const calorieData = useMemo(() => groupByDay(items, "calories"), [items]);

  const categoryData = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const key = item.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [items]);

  const totalPrice = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const totalCalories = items.reduce((sum, item) => sum + Number(item.caloriesPer100g || 0) * Number(item.quantity || 1), 0);

  return (
    <div className="chartsWrap">
      <motion.div className="chartCard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="chartHeader">
          <div>
            <div className="eyebrow">Charts</div>
            <h2>Spending trend</h2>
          </div>
          <div className="chartChip">₹{Number(totalPrice || 0).toFixed(2)}</div>
        </div>
        <div className="chartBox">
          {spendingData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<FancyTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#spendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="emptyState">Add items to see spending trends.</div>
          )}
        </div>
      </motion.div>

      <motion.div className="chartCard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="chartHeader">
          <div>
            <div className="eyebrow">Charts</div>
            <h2>Calories trend</h2>
          </div>
          <div className="chartChip">{Number(totalCalories || 0).toLocaleString()} kcal</div>
        </div>
        <div className="chartBox">
          {calorieData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={calorieData}>
                <defs>
                  <linearGradient id="calFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<FancyTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fill="url(#calFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="emptyState">Add items to see calorie trends.</div>
          )}
        </div>
      </motion.div>

      <motion.div className="chartCard fullWidthChart" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="chartHeader">
          <div>
            <div className="eyebrow">Charts</div>
            <h2>Category mix</h2>
          </div>
          <div className="chartChip">{items.length} items</div>
        </div>
        <div className="chartBox">
          {categoryData.length ? (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={105} innerRadius={58} paddingAngle={3}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="emptyState">Add items to see category breakdown.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}