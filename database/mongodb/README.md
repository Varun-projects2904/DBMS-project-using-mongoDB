# StyleStock on MongoDB

The 14 MySQL tables mirrored one-to-one as 14 MongoDB collections — same
names, same columns as fields — plus the `order_totals` view. Run the
scripts in order with [mongosh](https://www.mongodb.com/docs/mongodb-shell/):

```bash
cd database/mongodb
mongosh "mongodb://127.0.0.1:27017" 01_schema.js    # collections, validators, indexes, view
mongosh "mongodb://127.0.0.1:27017" 02_seed.js      # same rows as ../seed.sql, plus counters
mongosh "mongodb://127.0.0.1:27017" 03_queries.js   # the 8 quick queries + SQL-clause cheatsheet
mongosh "mongodb://127.0.0.1:27017" 04_purchase.js  # the "Buy now" transaction (places an order)
```

For MongoDB Atlas, use your `mongodb+srv://…` connection string instead.
`01_schema.js` drops and recreates the `fashion_retail` database, so re-running
01 → 02 always gets you back to the seed data.

## How each MySQL feature maps

| MySQL | MongoDB here |
|---|---|
| `CREATE TABLE` | `db.createCollection()` with a `$jsonSchema` validator |
| `INT` / `VARCHAR(n)` / `DATE` | `bsonType: "int"` / `"string"` + `maxLength: n` / `"date"` |
| `DECIMAL(10,2)` | `bsonType: "number"` (all prices are whole rupees; `NumberDecimal()` if paise matter) |
| `NOT NULL` | listed in `required`, `"null"` not allowed |
| fixed column list | `additionalProperties: false` |
| `PRIMARY KEY` (incl. composite) | unique index `pk_<table>` — MongoDB still adds its own `_id` |
| `UNIQUE` | unique index `uq_<table>_<col>`, partial so several NULLs are allowed (like MySQL) |
| `FOREIGN KEY` | a plain field + index `fk_<table>_<col>`; **not enforced** — the app checks it |
| `AUTO_INCREMENT` | `counters` collection + atomic `$inc` (`nextId()`) |
| `CREATE VIEW` | `db.createView()` over an aggregation pipeline |
| `JOIN` | `$lookup` + `$unwind` |
| `WHERE` / `GROUP BY` / `HAVING` | `$match` / `$group` / `$match` after `$group` |
| `COUNT(DISTINCT x)` | `$addToSet` then `$size` |
| `START TRANSACTION … COMMIT` | `session.startTransaction()` … `commitTransaction()` |
| `SELECT … FOR UPDATE` | one `findOneAndUpdate()` whose filter checks the stock and `$inc`s it |

## Notes

- **Transactions need a replica set.** Atlas is one already. For a local
  server, start `mongod --replSet rs0` and run `rs.initiate()` once in mongosh.
  On a plain standalone server `04_purchase.js` (and the backend) run the same
  steps without a transaction: the stock check-and-decrement is still a single
  atomic update, so nothing can oversell.
- **Seed data** matches `../seed.sql` row for row, except store 5 is called
  "StyleStock Online Store" to match the website (seed.sql still says Threadline).
- Every query in `03_queries.js` was checked against the original SQL run on
  the same data and returns identical rows.
