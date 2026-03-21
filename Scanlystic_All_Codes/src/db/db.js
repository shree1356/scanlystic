const DB_NAME = "scanlystic-db";
const STORE_ITEMS = "items";
const STORE_TRASH = "trash";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_TRASH)) {
        db.createObjectStore(STORE_TRASH, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addItem(item) {
  const db = await openDB();
  const tx = db.transaction(STORE_ITEMS, "readwrite");
  tx.objectStore(STORE_ITEMS).put(item);
  return tx.complete;
}

export async function getAllItems() {
  const db = await openDB();
  const tx = db.transaction(STORE_ITEMS, "readonly");
  return tx.objectStore(STORE_ITEMS).getAll();
}

export async function getAllTrash() {
  const db = await openDB();
  const tx = db.transaction(STORE_TRASH, "readonly");
  return tx.objectStore(STORE_TRASH).getAll();
}

export async function updateItem(id, updates) {
  const db = await openDB();
  const tx = db.transaction(STORE_ITEMS, "readwrite");
  const store = tx.objectStore(STORE_ITEMS);

  const item = await store.get(id);
  const updated = { ...item, ...updates };
  updated.total = (updated.price || 0) * (updated.quantity || 1);

  store.put(updated);
}

export async function moveItemToTrash(id) {
  const db = await openDB();
  const tx = db.transaction([STORE_ITEMS, STORE_TRASH], "readwrite");

  const item = await tx.objectStore(STORE_ITEMS).get(id);
  tx.objectStore(STORE_ITEMS).delete(id);
  tx.objectStore(STORE_TRASH).put(item);
}

export async function restoreFromTrash(id) {
  const db = await openDB();
  const tx = db.transaction([STORE_ITEMS, STORE_TRASH], "readwrite");

  const item = await tx.objectStore(STORE_TRASH).get(id);
  tx.objectStore(STORE_TRASH).delete(id);
  tx.objectStore(STORE_ITEMS).put(item);
}

export async function permanentlyDeleteFromTrash(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_TRASH, "readwrite");
  tx.objectStore(STORE_TRASH).delete(id);
}

export async function clearTrash() {
  const db = await openDB();
  const tx = db.transaction(STORE_TRASH, "readwrite");
  tx.objectStore(STORE_TRASH).clear();
}