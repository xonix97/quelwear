// Quelwear API — minimal Express backend for products, cart validation & orders.
// © 2026 Quelwear. All rights reserved. Proprietary — see LICENSE.
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// --- DB setup (SQLite) ---
const db = new Database(join(__dirname, "quelwear.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// products are the source of truth on the server (prices can't be tampered client-side)
const PRODUCTS = JSON.parse(readFileSync(join(__dirname, "products.json"), "utf8"));
const priceMap = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.price]));

// --- routes ---
app.get("/api/products", (_req, res) => res.json(PRODUCTS));

// Validate a cart against server-side prices (never trust client totals)
app.post("/api/checkout", (req, res) => {
  const { items, email } = req.body || {};
  if (!items || typeof items !== "object") return res.status(400).json({ error: "items required" });

  let total = 0;
  for (const [id, qty] of Object.entries(items)) {
    if (!priceMap[id]) return res.status(400).json({ error: `unknown product: ${id}` });
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: `bad qty for ${id}` });
    total += priceMap[id] * qty;
  }

  const id = "ord_" + Math.random().toString(36).slice(2, 10);
  db.prepare("INSERT INTO orders (id, items, total, email) VALUES (?, ?, ?, ?)")
    .run(id, JSON.stringify(items), total, email ?? null);

  // 👉 here you'd create a Stripe / crypto-gateway payment intent for `total`
  res.json({ orderId: id, total, status: "pending" });
});

app.get("/api/orders/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  res.json({ ...row, items: JSON.parse(row.items) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Quelwear API on :${PORT}`));
