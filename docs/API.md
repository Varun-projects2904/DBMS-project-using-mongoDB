# StyleStock API Documentation

REST API for StyleStock, a fashion retail inventory & order management system
(DBMS course project). The backend is built with **Node.js + Express** and stores
data in **MongoDB** through the official MongoDB Node.js driver. The earlier MySQL
version of the backend exposes exactly the same endpoints and responses.

| | |
|---|---|
| Base URL | `http://localhost:4000/api` |
| Format | JSON requests and responses (`Content-Type: application/json`) |
| Authentication | None. The login endpoint returns the customer; the client keeps `cust_id` |
| Frontend client | `frontend/api.js` (wraps every endpoint with `fetch()`) |

## Running the API

```bash
# 1. Database (MongoDB 4.2+ running locally, or an Atlas connection string)
cd database/mongodb
mongosh "mongodb://127.0.0.1:27017" 01_schema.js
mongosh "mongodb://127.0.0.1:27017" 02_seed.js

# 2. Server
cd ../../backend
npm install
cp .env.example .env      # set MONGODB_URI
npm start                 # → http://localhost:4000
```

Sample accounts after seeding: `aditi`, `rohan`, `priya`, `kabir`, … all with password `threadline123`.

## Endpoints at a glance

| Method | Endpoint | Purpose |
|---|---|---|
| GET | [`/api/health`](#get-apihealth) | Check the server and database connection |
| POST | [`/api/auth/check-username`](#post-apiauthcheck-username) | Check whether a username exists |
| POST | [`/api/auth/login`](#post-apiauthlogin) | Log in |
| POST | [`/api/auth/signup`](#post-apiauthsignup) | Create an account |
| GET | [`/api/products`](#get-apiproducts) | List products with online stock |
| GET | [`/api/products/:id`](#get-apiproductsid) | Get one product |
| POST | [`/api/orders`](#post-apiorders) | Place an order (transaction) |
| GET | [`/api/orders/:custId`](#get-apiorderscustid) | Get a customer's order history |

## Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created (new account or order) |
| 400 | Invalid or missing input |
| 401 | Wrong password |
| 404 | Not found (user, product, SKU, customer or route) |
| 409 | Conflict (username taken, or not enough stock) |
| 500 | Server or database error |

Every error response has the same shape:

```json
{ "error": "Only 8 left in stock" }
```

---

## Health

### GET /api/health

Checks that the server is running and can reach the database.

**Response 200**
```json
{ "status": "ok", "db": "connected", "transactions": true }
```
`transactions` is `true` on a replica set (MongoDB Atlas, or `mongod --replSet`) and
`false` on a standalone server, where purchases run without a multi-document transaction.

**Response 500**
```json
{ "status": "error", "db": "unreachable", "message": "connect ECONNREFUSED 127.0.0.1:27017" }
```

---

## Authentication

### POST /api/auth/check-username

Used by the login screen to decide between showing the password field (existing
customer) and the sign-up form (new customer).

**Request body**
| Field | Type | Required |
|---|---|---|
| `username` | string | yes |

```json
{ "username": "aditi" }
```

**Response 200**
```json
{ "exists": true }
```

| Status | `error` |
|---|---|
| 400 | `username is required` |

### POST /api/auth/login

**Request body**
| Field | Type | Required |
|---|---|---|
| `username` | string | yes |
| `password` | string | yes |

```json
{ "username": "aditi", "password": "threadline123" }
```

**Response 200**
```json
{
  "customer": {
    "cust_id": 1,
    "cname": "Aditi Sharma",
    "email": "aditi.sharma@example.com",
    "username": "aditi"
  }
}
```
The password is never returned. Seed accounts store plain-text passwords; the first
successful login replaces the stored password with a bcrypt hash.

| Status | `error` |
|---|---|
| 400 | `username and password are required` |
| 401 | `Incorrect password` |
| 404 | `No account with that username` |

### POST /api/auth/signup

**Request body**
| Field | Type | Rules |
|---|---|---|
| `cname` | string | required, max 80 characters |
| `username` | string | required, max 40 characters, must be unique |
| `password` | string | required, min 4 characters (stored as a bcrypt hash) |

```json
{ "cname": "Varun V", "username": "varun", "password": "pass1" }
```

**Response 201**
```json
{
  "customer": {
    "cust_id": 11,
    "cname": "Varun V",
    "email": "varun@example.com",
    "username": "varun"
  }
}
```
`cust_id` comes from the `counters` collection (MongoDB's replacement for AUTO_INCREMENT).
The email is generated from the username.

| Status | `error` |
|---|---|
| 400 | `cname, username and password are required` |
| 400 | `Password must be at least 4 characters` |
| 400 | `Name must be at most 80 characters and username at most 40` |
| 409 | `That username is already taken` |
| 409 | `An account with that email already exists` |

---

## Products

### GET /api/products

Lists products with their brand, category and every size/colour variant, with the
stock held by the online store (`store_id = 5`).

**Query parameters**
| Name | Values | Default |
|---|---|---|
| `category` | `All`, `Men`, `Women`, `Kids` | `All` |

A gender filter also includes `Unisex` categories (footwear and accessories).

```
GET /api/products?category=Men
```

**Response 200** (first product shown)
```json
{
  "products": [
    {
      "product_id": 1,
      "pname": "Classic Oxford Shirt",
      "base_price": 1499,
      "category_id": 5,
      "brand_name": "Allen Solly",
      "cat_name": "Shirts",
      "gender": "Men",
      "variants": [
        { "product_id": 1, "sku": "P1-L", "size": "L", "colour": "White", "qty_on_hand": 8 },
        { "product_id": 1, "sku": "P1-M", "size": "M", "colour": "White", "qty_on_hand": 10 },
        { "product_id": 1, "sku": "P1-S", "size": "S", "colour": "White", "qty_on_hand": 6 }
      ]
    }
  ]
}
```

Built with an aggregation: `product` → `$lookup` `brand` → `$lookup` `category`, then one
more query that joins `variant` with `stocks` for all listed products at once.

### GET /api/products/:id

```
GET /api/products/1
```

**Response 200**
```json
{
  "product": {
    "product_id": 1,
    "pname": "Classic Oxford Shirt",
    "base_price": 1499,
    "brand_name": "Allen Solly",
    "cat_name": "Shirts",
    "gender": "Men",
    "variants": [
      { "sku": "P1-L", "size": "L", "colour": "White", "qty_on_hand": 8 },
      { "sku": "P1-M", "size": "M", "colour": "White", "qty_on_hand": 10 },
      { "sku": "P1-S", "size": "S", "colour": "White", "qty_on_hand": 6 }
    ]
  }
}
```

| Status | `error` |
|---|---|
| 404 | `Product not found` |

---

## Orders

### POST /api/orders

Places an order for one SKU from the online store.

**Request body**
| Field | Type | Rules |
|---|---|---|
| `cust_id` | integer | required, must be an existing customer |
| `sku` | string | required, e.g. `"P11-8"` |
| `qty` | integer | required, at least 1 |

```json
{ "cust_id": 3, "sku": "P11-8", "qty": 2 }
```

**Response 201**
```json
{ "order_id": 16, "total_amount": 6598, "remaining_stock": 15 }
```
(Running Trainers ₹3,299 × 2 = ₹6,598; online stock of P11-8 goes from 17 to 15.)

**What happens, all inside one transaction**
1. Check the customer exists (MongoDB has no foreign keys, so the API checks).
2. Claim the stock in one atomic step: `findOneAndUpdate` on `stocks` with the filter
   `{ store_id: 5, sku, qty_on_hand: { $gte: qty } }` and the update `{ $inc: { qty_on_hand: -qty } }`.
   Two buyers can never both take the last unit.
3. Read the price from `product.base_price`.
4. Insert into `payment` (mode `Card`, today's date).
5. Insert into `orders` (status `Placed`).
6. Insert the line item into `contains`.
7. Commit. If any step fails, everything is rolled back.

| Status | `error` |
|---|---|
| 400 | `cust_id, sku and a positive qty are required` |
| 404 | `Unknown customer` |
| 404 | `Unknown SKU` |
| 409 | `Only 8 left in stock` (the number is the current stock) |
| 500 | `Purchase failed, nothing was charged` |

### GET /api/orders/:custId

Returns a customer's orders, newest first, with their items and totals.

```
GET /api/orders/1
```

**Response 200**
```json
{
  "orders": [
    {
      "order_id": 10,
      "order_date": "2026-07-24",
      "status": "Placed",
      "items": [
        { "order_id": 10, "sku": "P15-TOR", "qty": 2, "unit_price": 1499, "size": "OneSize", "colour": "Tortoise", "pname": "Aviator Sunglasses" },
        { "order_id": 10, "sku": "P3-30", "qty": 3, "unit_price": 2299, "size": "30", "colour": "Indigo", "pname": "Straight Fit Jeans" }
      ],
      "total_amount": 9895
    }
  ]
}
```
`total_amount` is calculated as Σ qty × unit_price, the same as the `order_totals` view;
it is never stored. A customer with no orders gets `{ "orders": [] }`.

---

## Using the API from the frontend

`frontend/api.js` wraps every endpoint:

```html
<script src="api.js"></script>
<script>
  (async () => {
    const { customer } = await StyleStockAPI.login('aditi', 'threadline123');
    const { products } = await StyleStockAPI.getProducts('Men');
    const order = await StyleStockAPI.placeOrder(customer.cust_id, 'P1-M', 2);
    const { orders } = await StyleStockAPI.getOrders(customer.cust_id);
  })();
</script>
```

On an error status the functions throw an `Error` whose `message` is the server's
`error` text and whose `status` is the HTTP code.

## Testing with curl

```bash
curl http://localhost:4000/api/health

curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"aditi","password":"threadline123"}'

curl "http://localhost:4000/api/products?category=Women"

curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"cust_id":1,"sku":"P1-M","qty":2}'

curl http://localhost:4000/api/orders/1
```

## Security notes

- **Passwords** are stored as bcrypt hashes and never returned.
- **NoSQL injection:** every input is checked to be the expected type before it reaches a
  query, so a body like `{ "username": { "$ne": null } }` is rejected with 400 instead of
  matching every account.
- **CORS:** allowed origins are set with `CORS_ORIGIN` in `.env` (`*` during development).
