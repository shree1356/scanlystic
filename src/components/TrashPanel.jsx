import React from "react";

export default function TrashPanel({
  trash,
  onRestore,
  onPermanentDelete,
  onClear,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-lg font-semibold mb-3">Recycle Bin</h2>

      {trash.length === 0 ? (
        <p className="text-sm opacity-60">Trash is empty</p>
      ) : (
        <div className="space-y-3">
          {trash.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-black/30 p-3 flex justify-between items-center"
            >
              <div>
                <p>{item.name}</p>
                <p className="text-xs opacity-60">{item.barcode}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onRestore(item.id)}
                  className="bg-green-500 px-2 py-1 rounded"
                >
                  Restore
                </button>
                <button
                  onClick={() => onPermanentDelete(item.id)}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={onClear}
            className="mt-3 w-full bg-red-600 py-2 rounded-lg"
          >
            Clear Trash
          </button>
        </div>
      )}
    </div>
  );
}