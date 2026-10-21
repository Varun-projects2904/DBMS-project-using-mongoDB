// =====================================================================
//  StyleStock — MongoDB version            01_schema.js  (run this first)
//
//  The 14 MySQL tables are mirrored one-to-one as 14 collections with the
//  same column names, plus the order_totals view.
//
//  Run:   mongosh "mongodb://127.0.0.1:27017" 01_schema.js
//  Then:  02_seed.js → 03_queries.js → 04_purchase.js
//
//  How each MySQL feature is expressed here
//    CREATE TABLE          → db.createCollection() with a $jsonSchema validator
//                            (validationLevel "strict", validationAction "error"
//                            are the defaults, so bad documents are rejected)
//    INT                   → bsonType "int"
//    VARCHAR(n)            → bsonType "string" + maxLength n
//    DECIMAL(10,2)         → bsonType "number" (plain numbers — every price
//                            here is whole rupees; use NumberDecimal() for paise)
//    DATE                  → bsonType "date"   (ISODate("2026-07-06"))
//    NOT NULL              → listed in "required", "null" not allowed
//    fixed column list     → additionalProperties: false
//    PRIMARY KEY           → unique index named pk_<table>; MongoDB still adds
//                            its own _id to every document
//    UNIQUE                → unique index uq_<table>_<column> (partial, so many
//                            documents may leave it null — same as MySQL)
//    FOREIGN KEY           → a plain field + index fk_<table>_<column>.
//                            MongoDB does NOT enforce references; the app
//                            checks them (see 04_purchase.js)
//    DEFAULT 0             → no column defaults in MongoDB; the app sets values
//    AUTO_INCREMENT        → "counters" collection, filled by 02_seed.js
//    CREATE VIEW           → db.createView() over an aggregation pipeline
// =====================================================================

db = db.getSiblingDB("fashion_retail");

// Start from a clean database so this script can be re-run
// (same idea as DROP DATABASE IF EXISTS fashion_retail; CREATE DATABASE ...)
db.dropDatabase();

// ---------------------------------------------------------- category
db.createCollection("category", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["category_id", "cat_name"],
      additionalProperties: false,
      properties: {
        _id:                { bsonType: "objectId" },                         // added by MongoDB
        category_id:        { bsonType: "int" },                              // INT AUTO_INCREMENT PRIMARY KEY
        cat_name:           { bsonType: "string", maxLength: 60 },            // VARCHAR(60) NOT NULL
        gender:             { bsonType: ["string", "null"], maxLength: 10 },  // VARCHAR(10)
        parent_category_id: { bsonType: ["int", "null"] }                     // INT REFERENCES category(category_id)
      }
    }
  }
});
db.category.createIndex({ category_id: 1 }, { unique: true, name: "pk_category" });
db.category.createIndex({ parent_category_id: 1 }, { name: "fk_category_parent_category_id" });

// ---------------------------------------------------------- brand
db.createCollection("brand", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["brand_id", "brand_name"],
      additionalProperties: false,
      properties: {
        _id:        { bsonType: "objectId" },              // added by MongoDB
        brand_id:   { bsonType: "int" },                   // INT AUTO_INCREMENT PRIMARY KEY
        brand_name: { bsonType: "string", maxLength: 60 }  // VARCHAR(60) NOT NULL UNIQUE
      }
    }
  }
});
db.brand.createIndex({ brand_id: 1 }, { unique: true, name: "pk_brand" });
db.brand.createIndex({ brand_name: 1 }, { unique: true, name: "uq_brand_brand_name" });

// ---------------------------------------------------------- supplier
db.createCollection("supplier", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["supplier_id", "sname"],
      additionalProperties: false,
      properties: {
        _id:         { bsonType: "objectId" },                        // added by MongoDB
        supplier_id: { bsonType: "int" },                             // INT AUTO_INCREMENT PRIMARY KEY
        sname:       { bsonType: "string", maxLength: 80 },           // VARCHAR(80) NOT NULL
        city:        { bsonType: ["string", "null"], maxLength: 60 }  // VARCHAR(60)
      }
    }
  }
});
db.supplier.createIndex({ supplier_id: 1 }, { unique: true, name: "pk_supplier" });

// ---------------------------------------------------------- product
db.createCollection("product", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product_id", "pname", "base_price"],
      additionalProperties: false,
      properties: {
        _id:         { bsonType: "objectId" },                // added by MongoDB
        product_id:  { bsonType: "int" },                     // INT AUTO_INCREMENT PRIMARY KEY
        pname:       { bsonType: "string", maxLength: 100 },  // VARCHAR(100) NOT NULL
        base_price:  { bsonType: "number" },                  // DECIMAL(10,2) NOT NULL
        category_id: { bsonType: ["int", "null"] },           // INT REFERENCES category(category_id)
        brand_id:    { bsonType: ["int", "null"] }            // INT REFERENCES brand(brand_id)
      }
    }
  }
});
db.product.createIndex({ product_id: 1 }, { unique: true, name: "pk_product" });
db.product.createIndex({ category_id: 1 }, { name: "fk_product_category_id" });
db.product.createIndex({ brand_id: 1 }, { name: "fk_product_brand_id" });

// ---------------------------------------------------------- supplies
db.createCollection("supplies", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["supplier_id", "product_id"],
      additionalProperties: false,
      properties: {
        _id:         { bsonType: "objectId" },          // added by MongoDB
        supplier_id: { bsonType: "int" },               // INT (composite PRIMARY KEY) REFERENCES supplier(supplier_id)
        product_id:  { bsonType: "int" },               // INT (composite PRIMARY KEY) REFERENCES product(product_id)
        cost_price:  { bsonType: ["number", "null"] },  // DECIMAL(10,2)
        lead_time:   { bsonType: ["int", "null"] }      // INT
      }
    }
  }
});
db.supplies.createIndex({ supplier_id: 1, product_id: 1 }, { unique: true, name: "pk_supplies" });
db.supplies.createIndex({ product_id: 1 }, { name: "fk_supplies_product_id" });

// ---------------------------------------------------------- variant
db.createCollection("variant", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku"],
      additionalProperties: false,
      properties: {
        _id:        { bsonType: "objectId" },                         // added by MongoDB
        sku:        { bsonType: "string", maxLength: 20 },            // VARCHAR(20) PRIMARY KEY
        size:       { bsonType: ["string", "null"], maxLength: 10 },  // VARCHAR(10)
        colour:     { bsonType: ["string", "null"], maxLength: 20 },  // VARCHAR(20)
        product_id: { bsonType: ["int", "null"] }                     // INT REFERENCES product(product_id)
      }
    }
  }
});
db.variant.createIndex({ sku: 1 }, { unique: true, name: "pk_variant" });
db.variant.createIndex({ product_id: 1 }, { name: "fk_variant_product_id" });

// ---------------------------------------------------------- stores
db.createCollection("stores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["store_id", "store_name"],
      additionalProperties: false,
      properties: {
        _id:        { bsonType: "objectId" },                        // added by MongoDB
        store_id:   { bsonType: "int" },                             // INT AUTO_INCREMENT PRIMARY KEY
        store_name: { bsonType: "string", maxLength: 80 },           // VARCHAR(80) NOT NULL
        store_type: { bsonType: ["string", "null"], maxLength: 20 }  // VARCHAR(20)
      }
    }
  }
});
db.stores.createIndex({ store_id: 1 }, { unique: true, name: "pk_stores" });

// ---------------------------------------------------------- stocks
db.createCollection("stocks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["store_id", "sku"],
      additionalProperties: false,
      properties: {
        _id:           { bsonType: "objectId" },               // added by MongoDB
        store_id:      { bsonType: "int" },                    // INT (composite PRIMARY KEY) REFERENCES stores(store_id)
        sku:           { bsonType: "string", maxLength: 20 },  // VARCHAR(20) (composite PRIMARY KEY) REFERENCES variant(sku)
        qty_on_hand:   { bsonType: ["int", "null"] },          // INT
        reorder_level: { bsonType: ["int", "null"] }           // INT
      }
    }
  }
});
db.stocks.createIndex({ store_id: 1, sku: 1 }, { unique: true, name: "pk_stocks" });
db.stocks.createIndex({ sku: 1 }, { name: "fk_stocks_sku" });

// ---------------------------------------------------------- customer
db.createCollection("customer", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cust_id", "cname"],
      additionalProperties: false,
      properties: {
        _id:      { bsonType: "objectId" },                          // added by MongoDB
        cust_id:  { bsonType: "int" },                               // INT AUTO_INCREMENT PRIMARY KEY
        cname:    { bsonType: "string", maxLength: 80 },             // VARCHAR(80) NOT NULL
        email:    { bsonType: ["string", "null"], maxLength: 100 },  // VARCHAR(100) UNIQUE
        username: { bsonType: ["string", "null"], maxLength: 40 },   // VARCHAR(40) UNIQUE
        password: { bsonType: ["string", "null"], maxLength: 255 }   // VARCHAR(255)
      }
    }
  }
});
db.customer.createIndex({ cust_id: 1 }, { unique: true, name: "pk_customer" });
db.customer.createIndex({ email: 1 }, { unique: true, name: "uq_customer_email", partialFilterExpression: { email: { $type: "string" } } });
db.customer.createIndex({ username: 1 }, { unique: true, name: "uq_customer_username", partialFilterExpression: { username: { $type: "string" } } });

// ---------------------------------------------------------- customer_phone
db.createCollection("customer_phone", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cust_id", "phone"],
      additionalProperties: false,
      properties: {
        _id:     { bsonType: "objectId" },              // added by MongoDB
        cust_id: { bsonType: "int" },                   // INT (composite PRIMARY KEY) REFERENCES customer(cust_id)
        phone:   { bsonType: "string", maxLength: 20 }  // VARCHAR(20) (composite PRIMARY KEY)
      }
    }
  }
});
db.customer_phone.createIndex({ cust_id: 1, phone: 1 }, { unique: true, name: "pk_customer_phone" });

// ---------------------------------------------------------- payment
db.createCollection("payment", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["pay_id"],
      additionalProperties: false,
      properties: {
        _id:      { bsonType: "objectId" },                         // added by MongoDB
        pay_id:   { bsonType: "int" },                              // INT AUTO_INCREMENT PRIMARY KEY
        mode:     { bsonType: ["string", "null"], maxLength: 20 },  // VARCHAR(20)
        amount:   { bsonType: ["number", "null"] },                 // DECIMAL(10,2)
        pay_date: { bsonType: ["date", "null"] }                    // DATE
      }
    }
  }
});
db.payment.createIndex({ pay_id: 1 }, { unique: true, name: "pk_payment" });

// ---------------------------------------------------------- orders
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id"],
      additionalProperties: false,
      properties: {
        _id:        { bsonType: "objectId" },                         // added by MongoDB
        order_id:   { bsonType: "int" },                              // INT AUTO_INCREMENT PRIMARY KEY
        order_date: { bsonType: ["date", "null"] },                   // DATE
        status:     { bsonType: ["string", "null"], maxLength: 20 },  // VARCHAR(20)
        cust_id:    { bsonType: ["int", "null"] },                    // INT REFERENCES customer(cust_id)
        pay_id:     { bsonType: ["int", "null"] }                     // INT REFERENCES payment(pay_id)
      }
    }
  }
});
db.orders.createIndex({ order_id: 1 }, { unique: true, name: "pk_orders" });
db.orders.createIndex({ cust_id: 1 }, { name: "fk_orders_cust_id" });
db.orders.createIndex({ pay_id: 1 }, { name: "fk_orders_pay_id" });

// ---------------------------------------------------------- contains
db.createCollection("contains", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "sku"],
      additionalProperties: false,
      properties: {
        _id:        { bsonType: "objectId" },               // added by MongoDB
        order_id:   { bsonType: "int" },                    // INT (composite PRIMARY KEY) REFERENCES orders(order_id)
        sku:        { bsonType: "string", maxLength: 20 },  // VARCHAR(20) (composite PRIMARY KEY) REFERENCES variant(sku)
        qty:        { bsonType: ["int", "null"] },          // INT
        unit_price: { bsonType: ["number", "null"] }        // DECIMAL(10,2)
      }
    }
  }
});
db.contains.createIndex({ order_id: 1, sku: 1 }, { unique: true, name: "pk_contains" });
db.contains.createIndex({ sku: 1 }, { name: "fk_contains_sku" });

// ---------------------------------------------------------- shipment
db.createCollection("shipment", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["ship_id"],
      additionalProperties: false,
      properties: {
        _id:         { bsonType: "objectId" },                         // added by MongoDB
        ship_id:     { bsonType: "int" },                              // INT AUTO_INCREMENT PRIMARY KEY
        carrier:     { bsonType: ["string", "null"], maxLength: 40 },  // VARCHAR(40)
        tracking_no: { bsonType: ["string", "null"], maxLength: 40 },  // VARCHAR(40)
        order_id:    { bsonType: ["int", "null"] }                     // INT REFERENCES orders(order_id)
      }
    }
  }
});
db.shipment.createIndex({ ship_id: 1 }, { unique: true, name: "pk_shipment" });
db.shipment.createIndex({ order_id: 1 }, { name: "fk_shipment_order_id" });

// ---------------------------------------------------------- order_totals (view)
// CREATE VIEW order_totals AS
//   SELECT o.order_id, SUM(c.qty * c.unit_price) AS total_amount
//   FROM orders o JOIN contains c ON o.order_id = c.order_id
//   GROUP BY o.order_id;
// Like the SQL view, nothing is stored: the pipeline runs every time
// order_totals is queried.
db.createView("order_totals", "orders", [
  { $lookup: { from: "contains", localField: "order_id", foreignField: "order_id", as: "c" } },
  { $unwind: "$c" },
  { $group: { _id: "$order_id", total_amount: { $sum: { $multiply: ["$c.qty", "$c.unit_price"] } } } },
  { $project: { _id: 0, order_id: "$_id", total_amount: "$total_amount" } }
]);

print("fashion_retail ready: 14 collections + order_totals view. Next: 02_seed.js");
