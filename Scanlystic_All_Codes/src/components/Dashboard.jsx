import React from "react";
import { motion } from "framer-motion";

function money(v) {
  return `₹${Number(v || 0).toFixed(2)}`;
}

export default function Dashboard({ items, onDelete }) {
  const total = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0
  );

  const totalCalories = items.reduce(
    (sum, i) => sum + Number(i.caloriesPer100g || 0) * Number(i.quantity || 1),
    0
  );

  return (
    <div className="dashboardCard">
      <div className="sectionHead">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h2>{items.length} item(s)</h2>
        </div>
        <div className="totalBox">{money(total)}</div>
      </div>

      <div className="summaryGrid">
        <div className="miniCard">
          <span>Total Calories</span>
          <strong>{totalCalories.toLocaleString()} kcal</strong>
        </div>
        <div className="miniCard">
          <span>Total Items</span>
          <strong>{items.length}</strong>
        </div>
      </div>

      <div className="itemList">
        {items.length === 0 ? (
          <div className="emptyState">No items yet. Scan something!</div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              className="itemCard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="itemThumb">
                {item.image ? <img src={item.image} alt={item.name} /> : <span>SC</span>}
              </div>

              <div className="itemBody">
                <div className="itemTitleRow">
                  <h3>{item.name}</h3>
                  <button className="iconBtn danger" onClick={() => onDelete(item.id)}>
                    Delete
                  </button>
                </div>

                <p className="muted">
                  {item.brand || "No brand"} · {item.barcode}
                </p>

                <div className="itemMeta">
                  <span>
                    Price:{" "}
                    {money(Number(item.price || 0) * Number(item.quantity || 1))}
                  </span>
                  <span>Qty: {item.quantity}</span>
                  <span>Cal/100g: {item.caloriesPer100g || 0}</span>
                  <span>Category: {item.category || "General"}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}