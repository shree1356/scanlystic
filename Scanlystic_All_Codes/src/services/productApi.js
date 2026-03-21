function cleanCategory(raw) {
  if (!raw) return "Uncategorized";
  if (Array.isArray(raw)) raw = raw[0];
  const text = String(raw).split(",")[0].trim();
  return text || "Uncategorized";
}

export async function fetchProductByBarcode(barcode) {
  const clean = String(barcode || "").trim().replace(/\s+/g, "");
  if (!clean) {
    return { found: false, message: "Barcode missing", product: null };
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(clean)}.json`;
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();

    if (!data || data.status !== 1 || !data.product) {
      return {
        found: false,
        message: "Not found",
        product: {
          barcode: clean,
          name: "Unknown product",
          brand: "",
          image: "",
          caloriesPer100g: 0,
          category: "Uncategorized"
        }
      };
    }

    const p = data.product;
    const nutriments = p.nutriments || {};
    const calories =
      nutriments["energy-kcal_100g"] ||
      nutriments["energy-kcal"] ||
      nutriments["energy_100g"] ||
      nutriments["energy"] ||
      0;

    return {
      found: true,
      message: "Product found",
      product: {
        barcode: clean,
        name: p.product_name || p.generic_name || "Unknown product",
        brand: (p.brands || "").split(",")[0].trim(),
        image: p.image_small_url || p.image_front_small_url || "",
        caloriesPer100g: Number(calories) || 0,
        category: cleanCategory(p.categories || p.categories_hierarchy?.[0])
      }
    };
  } catch {
    return {
      found: false,
      message: "Fetch failed",
      product: {
        barcode: clean,
        name: "Manual product",
        brand: "",
        image: "",
        caloriesPer100g: 0,
        category: "Uncategorized"
      }
    };
  }
}