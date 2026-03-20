// src/services/api.js
// Axios instance + helpful helpers that fall back to Open Food Facts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || ''; // set in .env when using backend
const USE_BACKEND = Boolean(API_BASE && API_BASE.trim().length > 0);

const instance = axios.create({
  baseURL: API_BASE || undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Normalize product object returned to { found: boolean, product: {...} }
 * so frontend code can use same shape whether using backend or direct OFF.
 */
function normalizeOffResponse(barcode, offData) {
  if (!offData || offData.status !== 1) {
    return { found: false, message: 'Not found in Open Food Facts', product: { barcode } };
  }
  const p = offData.product || {};
  const nutriments = p.nutriments || {};
  const calories =
    nutriments['energy-kcal_100g'] ||
    nutriments['energy-kcal'] ||
    nutriments['energy_100g'] ||
    nutriments['energy'];

  const productObj = {
    barcode,
    name: p.product_name || p.generic_name || 'Unknown product',
    brand: (p.brands && p.brands.split(',')[0]) || p.brand || '',
    image: p.image_small_url || p.image_front_small_url || '',
    caloriesPer100g: calories ? Number(calories) : null
  };

  return { found: true, product: productObj };
}

/**
 * Fetch product info for a barcode.
 * If a backend is configured (VITE_API_BASE), it calls backend: GET /product/:barcode.
 * Otherwise it directly queries Open Food Facts and returns normalized object:
 * { found: boolean, product: {...} }
 */
export async function fetchProduct(barcode) {
  if (!barcode) return { found: false, message: 'barcode missing' };

  if (USE_BACKEND) {
    // Backend should respond with { found, product } like our example server
    try {
      const res = await instance.get(`/product/${encodeURIComponent(barcode)}`);
      return res.data;
    } catch (err) {
      console.error('fetchProduct (backend) error', err?.message || err);
      // If backend is down/misconfigured, fall back to OFF so the app still works offline.
      try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
        const resp = await fetch(url, { cache: 'no-store' });
        const data = await resp.json();
        return normalizeOffResponse(barcode, data);
      } catch (e2) {
        console.error('fetchProduct (fallback OFF) error', e2);
        return { found: false, message: 'Backend fetch failed (and OFF fallback failed)' };
      }
    }
  } else {
    // Client-only: fetch directly from Open Food Facts
    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
      const resp = await fetch(url, { cache: 'no-store' });
      const data = await resp.json();
      return normalizeOffResponse(barcode, data);
    } catch (err) {
      console.error('fetchProduct (OFF) error', err);
      return { found: false, message: 'Open Food Facts fetch failed' };
    }
  }
}

/**
 * Save product to backend (only if backend exists).
 * Returns backend response or throws if no backend.
 */
export async function saveProductToBackend(product) {
  if (!USE_BACKEND) {
    throw new Error('No backend configured (VITE_API_BASE not set). Save client-side via IndexedDB instead.');
  }
  try {
    const res = await instance.post('/product/save', product);
    return res.data;
  } catch (err) {
    console.error('saveProductToBackend error', err?.message || err);
    throw err;
  }
}

/**
 * Fetch all products from backend (if backend configured).
 * For client-only flow, you should call IndexedDB helpers instead.
 */
export async function fetchAllFromBackend() {
  if (!USE_BACKEND) {
    throw new Error('No backend configured. Use IndexedDB getProducts() instead.');
  }
  try {
    const res = await instance.get('/product');
    return res.data;
  } catch (err) {
    console.error('fetchAllFromBackend error', err?.message || err);
    throw err;
  }
}

export default instance;