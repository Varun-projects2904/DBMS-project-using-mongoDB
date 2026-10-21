# StyleStock

Fashion retail inventory & order management — a DBMS course project. ER/EER
design, relational mapping, and normalization (1NF→BCNF) are what this grew
out of. It now runs on **MongoDB**: the 14 normalized tables are mirrored
one-to-one as 14 collections, and the three pieces of the repo share them.

**Live demo:**   https://varun-projects2904.github.io/DBMS-Project/frontend/index.html
(runs entirely client-side — login, shop, purchases, and a MongoDB console,
all against an in-browser MongoDB engine, no server needed to try it)

## Structure

```
stylestock/
├── frontend/
│   └── index.html        ← the live demo above, as a single self-contained file
├── backend/               ← Express + MongoDB API (separate from the demo — see below)
│   ├── server.js
│   ├── config/db.js       MongoClient + transaction-support check
│   ├── utils/nextId.js    AUTO_INCREMENT replacement (counters collection)
│   ├── routes/            auth, products, orders
│   ├── controllers/       auth, products, orders
│   └── README.md          full setup + endpoint reference
└── database/
    ├── mongodb/
    │   ├── 01_schema.js   14 collections with $jsonSchema validators, indexes, order_totals view
    │   ├── 02_seed.js     demo data — brands, products, stock, 10 customer accounts
    │   ├── 03_queries.js  the 8 quick queries (SQL shown above each) + SQL-clause cheatsheet
    │   ├── 04_purchase.js the purchase as a multi-document transaction
    │   └── README.md      run order + MySQL → MongoDB mapping table
    ├── schema.sql         original MySQL schema (kept for reference)
    └── seed.sql           original MySQL seed data
```

## How the pieces relate

`frontend/index.html` is fully self-contained: it seeds and queries its own
copy of the collections with an in-browser MongoDB engine (the
[mingo](https://github.com/kofrasa/mingo) query library, bundled in the file,
plus a small layer for validators, unique indexes, views and transactions), so
it needs nothing else to run — open the file, or the live link above. Its
console takes mongosh syntax; you can paste any script from `database/mongodb/`
into it.

`backend/` + `database/mongodb/` are the "real" two-tier version: a genuine
Express API backed by MongoDB, with the purchase flow as a multi-document
transaction (stock check-and-decrement in one atomic update, then payment /
order / line-item inserts, all rolled back together on failure). It is **not**
wired to `frontend/index.html` — the demo still talks to its own in-browser
engine. See `backend/README.md` for setup.

## Schema highlights

- Same tables, same columns: each MySQL table is one collection, each column one
  field. `$jsonSchema` validators enforce the column types, `VARCHAR` lengths and
  `NOT NULL`s; unique indexes enforce every primary key and `UNIQUE` column.
- `order_totals` is still a view, not a stored field — `orders.total_amount` was
  deliberately left out to avoid the redundancy flagged in the normalization
  pass; the view's aggregation pipeline derives it from `contains`.
- `supplies` (product↔supplier) keeps its composite key as a compound unique
  index, resolving the same 2NF partial dependency worked through in the assignment.
- MongoDB has no foreign keys, so references (`orders.cust_id`, `variant.product_id`, …)
  are indexed but checked by the application, and the demo's Browse & edit tab
  points out dangling ones.
- `customer.password` is sized for a bcrypt hash; the seed ships plaintext demo
  passwords for readability, and the backend upgrades an account to a real hash
  the first time it logs in through the API.

## Quick start

```bash
# Frontend — nothing to install, just open it
open frontend/index.html

# Database + backend (MongoDB running locally, or use an Atlas connection string)
cd database/mongodb
mongosh "mongodb://127.0.0.1:27017" 01_schema.js
mongosh "mongodb://127.0.0.1:27017" 02_seed.js
cd ../../backend
npm install
cp .env.example .env      # set MONGODB_URI
npm start
```
