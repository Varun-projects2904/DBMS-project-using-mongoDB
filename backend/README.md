# StyleStock backend

Express + MongoDB API for the fashion retail shop. Pairs with the scripts in
`database/mongodb/` and (conceptually) with `frontend/` — the live browser demo
runs its own in-browser MongoDB engine instead of calling this API; see the note
at the bottom if you want them wired together.

## Setup

Needs Node.js 18+ and MongoDB 4.2 or newer (any current local install, or a free Atlas cluster).

```bash
cd backend
npm install
cp .env.example .env      # then set MONGODB_URI (local server or Atlas)
```

Load the collections and seed data first (from the `database/mongodb/` folder):

```bash
mongosh "mongodb://127.0.0.1:27017" 01_schema.js
mongosh "mongodb://127.0.0.1:27017" 02_seed.js
```

`02_seed.js` also fills the `counters` collection that new customer, payment and
order ids come from, so run it before using the API.

Then run the API:

```bash
npm start          # node server.js
# or, while developing:
npm run dev        # nodemon server.js, restarts on file changes
```

It listens on `http://localhost:4000` by default (`PORT` in `.env`).

### Transactions and replica sets

MongoDB only allows multi-document transactions on a replica set (or a sharded
cluster). MongoDB Atlas — including the free tier — is already a replica set.
A local `mongod` is standalone by default; to turn it into a one-node replica set,
start it with `--replSet rs0` (or add `replication: { replSetName: rs0 }` to
`mongod.cfg`) and run `rs.initiate()` once in mongosh.

The API checks this when it starts (`GET /api/health` reports `transactions: true/false`).
Without a replica set it still works: the purchase runs without a transaction,
the stock check-and-decrement is still one atomic update (so it can't oversell),
and if a later step fails the earlier writes are undone in code.

## Endpoints

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/health` | — | Confirms the DB connection is alive and whether transactions are available |
| POST | `/api/auth/check-username` | `{ username }` | `{ exists: true/false }` — drives the login-vs-signup detection |
| POST | `/api/auth/login` | `{ username, password }` | 401 on wrong password, 404 if unknown. Upgrades plaintext seed passwords to bcrypt on first successful login |
| POST | `/api/auth/signup` | `{ cname, username, password }` | 409 if the username (or its derived email) is taken, 400 if password < 4 chars |
| GET | `/api/products?category=All\|Men\|Women\|Kids` | — | Each product includes its `variants` with live online-store stock |
| GET | `/api/products/:id` | — | Single product + variants |
| POST | `/api/orders` | `{ cust_id, sku, qty }` | The purchase. 409 if not enough stock, 404 for an unknown SKU or customer |
| GET | `/api/orders/:custId` | — | Order history for that customer, items + total per order |

Request and response shapes are the same as the earlier MySQL version of this API.

## Design notes

- **Purchase**: `orderController.js` is the one place correctness really matters.
  The stock row is claimed with a single `findOneAndUpdate` whose filter requires
  `qty_on_hand >= qty` and whose update is `$inc: -qty` — the MongoDB replacement
  for `SELECT ... FOR UPDATE`, so two buyers can never both take the last unit.
  The `payment`, `orders` and `contains` inserts follow inside the same
  `session.withTransaction()`, which commits all of it or rolls all of it back
  (and retries on a write conflict). Tested with 20 simultaneous buyers for one
  unit: exactly one order, stock 0.
- **Ids**: MongoDB has no AUTO_INCREMENT; `utils/nextId.js` does an atomic `$inc`
  on the `counters` collection. Inside a transaction the counter rolls back too.
- **Foreign keys**: MongoDB doesn't enforce them, so the purchase checks the
  customer exists before writing an order.
- **Input types**: request values are used directly in MongoDB filters, so every
  one is type-checked first. Without that, a body like
  `{ "username": { "$ne": null } }` would become a query operator and match any
  account (NoSQL injection).
- **Passwords**: seed data ships as plaintext (easy to read while grading) but the
  `password` field is sized for a bcrypt hash, and every account gets upgraded to
  a real hash the moment it logs in through this API. New signups are hashed immediately.
- **`ONLINE_STORE_ID = 5`** throughout — matches the "StyleStock Online Store"
  document from `02_seed.js`. The physical stores (1–4) are untouched by this API;
  they exist for the console side of the assignment.

## Connecting the existing frontend

The published demo (`frontend/index.html`) does everything with an in-browser
MongoDB engine — it has no way to reach `localhost`, since it's a static page.
To have it call this API instead, the login/shop/orders code would swap its
`db.<collection>` calls for `fetch('http://localhost:4000/api/...')` calls, and
the page would need to run from a local dev server (or keep the online demo as
is while a separate local build talks to this backend).
