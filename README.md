# Quelwear — Formal Watches

A premium e-commerce storefront for **Quelwear**, a formal-watch brand. Elegant dark/gold design, six signature models with custom-drawn dials, and a fully working cart (add / remove / quantity / persistent via localStorage).

🔗 **Live demo:** https://xonix97.github.io/quelwear/

> © 2026 Quelwear. All rights reserved. Proprietary — see [LICENSE](./LICENSE).

## What's here

| Part | Stack | Notes |
|---|---|---|
| **Storefront** (`index.html`) | Vanilla JS, zero dependencies | Hostable on GitHub Pages as-is |
| **API** (`server/`) | Node + Express + SQLite | Products, server-side price validation, orders |

## Why a backend?

Prices and order totals are validated **server-side** (`server/server.js`) so they can't be tampered with from the browser — the one part of an online shop you should never trust the client for. The frontend is a presentation layer; the money logic lives on the server.

## Run the backend locally

```bash
cd server
npm install
npm start          # API on http://localhost:3000
```

Endpoints:
- `GET  /api/products` — list products
- `POST /api/checkout` — `{ items: { id: qty }, email }` → validates against server prices, creates a pending order
- `GET  /api/orders/:id` — order status

## Deploy the backend (free options)

GitHub Pages can't run a server, so deploy the `server/` folder to one of:
- **Render** (render.com) — free web service, connect this repo, start command `npm start`
- **Railway** (railway.app) — free starter, deploy from repo
- **Fly.io** — free allowance

Then point the storefront's checkout `fetch` at your deployed API URL, and wire `POST /api/checkout` to a payment provider (Stripe, or a crypto gateway like NOWPayments) to take real payments.

## License
Proprietary — All Rights Reserved. Not for reuse or redistribution. See [LICENSE](./LICENSE).
