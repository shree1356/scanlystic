import React from "react";

export default function Trash({ items, onRestore, onClear }) {
  return (
    <div className="trashCard">
      <div className="sectionHead">
        <div>
          <div className="eyebrow">Recycle Bin</div>
          <h2>{items.length} deleted item(s)</h2>
        </div>
        <button className="btnGhost" onClick={onClear}>Clear</button>
      </div>

      {items.length === 0 ? (
        <div className="emptyState">Trash is empty.</div>
      ) : (
        <div className="trashList">
          {items.map((item) => (
            <div className="trashRow" key={item.id}>
              <div>
                <strong>{item.name || "Unknown product"}</strong>
                <p className="muted">₹{Number(item.price || 0) * Number(item.quantity || 1)} · Qty {Number(item.quantity || 1)}</p>
              </div>
              <button className="btnPrimary smallBtn" onClick={() => onRestore(item.id)}>Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}