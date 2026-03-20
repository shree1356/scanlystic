import { openDB } from "idb";

const DB_NAME = "scanlystic-db";
const STORE = "products";
const VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("createdAt", "createdAt");
        store.createIndex("deleted", "deleted");
        store.createIndex("category", "category");
      }
    }
  });
}

export async function addProduct(product) {
  const db = await getDB();
  const record = {
    ...product,
    price: Number(product.price || 0),
    quantity: Number(product.quantity || 1),
    caloriesPer100g: Number(product.caloriesPer100g || 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    category: product.category || "Uncategorized"
  };
  const id = await db.add(STORE, record);
  return { ...record, id };
}

export async function getProducts() {
  const db = await getDB();
  const all = await db.getAll(STORE);
  return all.filter((item) => !item.deleted).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getTrash() {
  const db = await getDB();
  const all = await db.getAll(STORE);
  return all.filter((item) => item.deleted).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateProduct(id, updates = {}) {
  const db = await getDB();
  const item = await db.get(STORE, Number(id));
  if (!item) return null;
  const merged = { ...item, ...updates, updatedAt: new Date().toISOString() };
  await db.put(STORE, merged);
  return merged;
}

export async function softDelete(id) {
  return updateProduct(id, { deleted: true });
}

export async function restore(id) {
  return updateProduct(id, { deleted: false });
}

export async function clearTrash() {
  const db = await getDB();
  const all = await db.getAll(STORE);
  const deletedItems = all.filter((item) => item.deleted);
  for (const item of deletedItems) {
    await db.delete(STORE, item.id);
  }
}

export async function clearAll() {
  const db = await getDB();
  await db.clear(STORE);
}