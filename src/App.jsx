import React, { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scanner from "./components/Scanner";
import Dashboard from "./components/Dashboard";
import {
  addProduct,
  clearAll,
  clearTrash,
  getProducts,
  getTrash,
  restore,
  softDelete
} from "./db";
import { fetchProductByBarcode } from "./services/productApi";

const ChartsPanel = React.lazy(() => import("./components/ChartsPanel"));

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function ChartFallback() {
  return <div className="emptyState">Loading charts...</div>;
}

function SplashScreen() {
  return (
    <motion.div
      className="splashOverlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="splashCard"
        initial={{ scale: 0.88, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <img src="/logo.jpg" alt="Scanlystic logo" className="splashLogo" />
        <div className="splashTitle">Scanlystic</div>
        <div className="splashSub">Scan. Calculate. Simplify your life.</div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("Scan to begin");
  const [draftName, setDraftName] = useState("");
  const [draftBrand, setDraftBrand] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftQty, setDraftQty] = useState(1);
  const [draftCalories, setDraftCalories] = useState("");
  const [draftCategory, setDraftCategory] = useState("Uncategorized");
  const [showSplash, setShowSplash] = useState(true);

  const refreshData = async () => {
    const saved = await getProducts();
    const deleted = await getTrash();
    setItems(saved);
    setTrashItems(deleted);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDraftName(selected.name || "");
    setDraftBrand(selected.brand || "");
    setDraftPrice(selected.price ?? "");
    setDraftQty(selected.quantity || 1);
    setDraftCalories(selected.caloriesPer100g ?? "");
    setDraftCategory(selected.category || "Uncategorized");
  }, [selected]);

  const lookupProduct = async (rawCode) => {
    const code = String(rawCode || "").trim();
    if (!code) {
      setMessage("Enter or scan a barcode first.");
      return;
    }

    setLoading(true);
    setMessage("Looking up product...");

    try {
      const result = await fetchProductByBarcode(code);
      setSelected(result.product);
      setMessage(result.found ? "Detected product" : "Product not found");
    } catch (error) {
      console.error(error);
      setSelected({
        barcode: code,
        name: "Manual product",
        brand: "",
        image: "",
        caloriesPer100g: 0,
        category: "Uncategorized"
      });
      setMessage("Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (decoded) => {
    setManualCode(decoded);
    await lookupProduct(decoded);
  };

  const saveCurrent = async () => {
    if (!selected) return;

    await addProduct({
      barcode: selected.barcode,
      name: draftName.trim() || selected.name || "Unknown product",
      brand: draftBrand.trim(),
      image: selected.image || "",
      caloriesPer100g: Number(draftCalories || 0),
      price: Number(draftPrice || 0),
      quantity: Number(draftQty || 1),
      category: draftCategory || selected.category || "Uncategorized"
    });

    setSelected(null);
    setManualCode("");
    setMessage("Saved to dashboard.");
    await refreshData();
  };

  const deleteItem = async (id) => {
    await softDelete(id);
    await refreshData();
  };

  const restoreItem = async (id) => {
    await restore(id);
    await refreshData();
  };

  const clearTrashHandler = async () => {
    await clearTrash();
    await refreshData();
  };

  const clearEverything = async () => {
    if (!confirm("Clear all saved items and trash?")) return;
    await clearAll();
    await refreshData();
    setSelected(null);
    setManualCode("");
    setMessage("All data cleared.");
  };

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [items]
  );

  const totalCalories = useMemo(
    () => items.reduce(
      (sum, item) => sum + Number(item.caloriesPer100g || 0) * Number(item.quantity || 1),
      0
    ),
    [items]
  );

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <div className="appShell">
        <div className="bgGlow bg1" />
        <div className="bgGlow bg2" />

        <header className="topBar">
          <div className="brandText">
            <h1>Scanlystic</h1>
            <p>Scan. Calculate. Simplify your life.</p>
            <h2 style={{ margin: 0, fontSize: "16px", color: "#2563eb" }}>
              Welcome to Scanlystic
            </h2>
          </div>

          <div className="topActions">
            <span className="chartChip">AI-assisted</span>
            <button className="btnGhost" onClick={clearEverything}>
              Clear All
            </button>
          </div>
        </header>

        <main className="layoutGrid">
          <section className="leftPane">
            <Scanner onScan={handleScan} />

            <div className="manualCard">
              <div className="eyebrow">Or paste barcode / QR text</div>
              <div className="manualRow">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter code here"
                />
                <button className="btnPrimary" onClick={() => lookupProduct(manualCode)}>
                  Use Code
                </button>
              </div>
            </div>

            <div className={`detectedCard ${selected ? "show" : ""}`}>
              <div className="sectionHead">
                <div>
                  <div className="eyebrow">Detected product</div>
                  <h2>{message}</h2>
                </div>
                {loading ? <div className="spinner" /> : null}
              </div>

              {selected ? (
                <motion.div
                  className="detectedBody"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="detectedTop">
                    <div className="productShot">
                      {selected.image ? (
                        <img src={selected.image} alt={selected.name} />
                      ) : (
                        <span>OK</span>
                      )}
                    </div>

                    <div className="productInfo">
                      <h3>{selected.name}</h3>
                      <p className="muted">
                        {selected.brand || "No brand"} · {selected.barcode}
                      </p>
                      <p className="muted">
                        Category: {selected.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  <div className="formGrid">
                    <label>
                      Product name
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                      />
                    </label>

                    <label>
                      Brand
                      <input
                        value={draftBrand}
                        onChange={(e) => setDraftBrand(e.target.value)}
                      />
                    </label>

                    <label>
                      Price
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                        placeholder="0"
                      />
                    </label>

                    <label>
                      Qty
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={draftQty}
                        onChange={(e) => setDraftQty(e.target.value)}
                      />
                    </label>

                    <label>
                      Calories / 100g
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={draftCalories}
                        onChange={(e) => setDraftCalories(e.target.value)}
                      />
                    </label>

                    <label>
                      Category
                      <input
                        value={draftCategory}
                        onChange={(e) => setDraftCategory(e.target.value)}
                      />
                    </label>
                  </div>

                  <button className="btnPrimary fullBtn" onClick={saveCurrent}>
                    Save to Dashboard
                  </button>
                </motion.div>
              ) : (
                <div className="emptyState largeEmpty">
                  No product detected yet.
                </div>
              )}
            </div>
          </section>

          <aside className="rightPane">
            <div className="statsStrip">
              <div className="statCard">
                <span>Total price</span>
                <strong>{money(totalPrice)}</strong>
              </div>
              <div className="statCard">
                <span>Calories total</span>
                <strong>{Number(totalCalories || 0).toLocaleString()} kcal</strong>
              </div>
            </div>

            <Suspense fallback={<ChartFallback />}>
              <ChartsPanel items={items} />
            </Suspense>

            <Dashboard items={items} onDelete={deleteItem} />

            <div className="trashCard">
              <div className="sectionHead">
                <div>
                  <div className="eyebrow">Recycle Bin</div>
                  <h2>{trashItems.length} deleted item(s)</h2>
                </div>
                <button className="btnGhost" onClick={clearTrashHandler}>
                  Clear
                </button>
              </div>

              {trashItems.length === 0 ? (
                <div className="emptyState">Trash is empty.</div>
              ) : (
                <div className="trashList">
                  {trashItems.map((item) => (
                    <div className="trashRow" key={item.id}>
                      <div>
                        <strong>{item.name || "Unknown product"}</strong>
                        <p className="muted">
                          ₹{Number(item.price || 0) * Number(item.quantity || 1)} · Qty{" "}
                          {Number(item.quantity || 1)}
                        </p>
                      </div>
                      <button
                        className="btnPrimary smallBtn"
                        onClick={() => restoreItem(item.id)}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
