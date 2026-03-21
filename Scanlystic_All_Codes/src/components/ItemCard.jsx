import React from "react";

export default function ItemCard({ item, onQtyChange, onDelete }) {
  const total = (item.price || 0) * (item.quantity || 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="font-semibold text-lg">{item.name}</h3>
      <p className="text-sm opacity-60">{item.brand}</p>

      <div className="mt-2 text-sm">
        <p>Barcode: {item.barcode}</p>
        <p>Price: ₹{item.price || 0}</p>
        <p>Calories: {item.calories || 0}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onQtyChange(item.id, Number(e.target.value))}
          className="w-20 rounded-lg bg-black/40 p-2 text-white"
        />
        <button
          onClick={() => onDelete(item.id)}
          className="bg-red-500 px-3 py-2 rounded-lg text-white"
        >
          Delete
        </button>
      </div>

      <p className="mt-2 font-semibold">Total: ₹{total}</p>
    </div>
  );
}