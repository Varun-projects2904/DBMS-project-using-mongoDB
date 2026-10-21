// =====================================================================
//  StyleStock — MongoDB version            03_queries.js
//
//  The website's 8 "quick queries", each with the original SQL above it,
//  then a few everyday SQL clauses and their MongoDB equivalents.
//  Read-only: nothing here changes the data.
//
//  Run all:  mongosh "mongodb://127.0.0.1:27017" 03_queries.js
//  Run one:  open mongosh, type  use fashion_retail  and paste a single
//            db.<collection>.aggregate([...]) — the shell prints the result.
//
//  SQL → aggregation pipeline
//    FROM a JOIN b ON a.x = b.y   { $lookup: { from: "b", localField: "x", foreignField: "y", as: "b" } },
//                                 { $unwind: "$b" }     ← one document per match = INNER JOIN
//    WHERE                        { $match: { ... } }   ← placed before the joins when it only
//                                                         needs the first collection (less work)
//    WHERE col1 <= col2           { $match: { $expr: { $lte: ["$col1", "$col2"] } } }
//    GROUP BY x + SUM / COUNT     { $group: { _id: "$x", total: { $sum: ... } } }
//    COUNT(DISTINCT x)            $addToSet in $group, then $size
//    ORDER BY / LIMIT             { $sort: { ... } } / { $limit: n }
//    SELECT list (with AS)        final { $project: { ... } }
// =====================================================================

db = db.getSiblingDB("fashion_retail");

// prints a cursor or an array as a table, like the MySQL console does
function show(title, result) {
  const rows = Array.isArray(result) ? result : result.toArray();
  print("\n" + title + "  (" + rows.length + " row" + (rows.length === 1 ? "" : "s") + ")");
  console.table(rows);
}

// ---------------------------------------------------------------------
// 1. Low stock alerts
//    SELECT s.store_id, st.store_name, s.sku, p.pname, v.size, v.colour,
//           s.qty_on_hand, s.reorder_level
//    FROM stocks s
//    JOIN stores st ON s.store_id = st.store_id
//    JOIN variant v ON s.sku = v.sku
//    JOIN product p ON v.product_id = p.product_id
//    WHERE s.qty_on_hand <= s.reorder_level
//    ORDER BY s.qty_on_hand ASC;
show("1. Low stock alerts", db.stocks.aggregate([
  { $match: { $expr: { $lte: ["$qty_on_hand", "$reorder_level"] } } },
  { $lookup: { from: "stores", localField: "store_id", foreignField: "store_id", as: "st" } },
  { $unwind: "$st" },
  { $lookup: { from: "variant", localField: "sku", foreignField: "sku", as: "v" } },
  { $unwind: "$v" },
  { $lookup: { from: "product", localField: "v.product_id", foreignField: "product_id", as: "p" } },
  { $unwind: "$p" },
  { $sort: { qty_on_hand: 1 } },
  { $project: { _id: 0, store_id: "$store_id", store_name: "$st.store_name", sku: "$sku", pname: "$p.pname",
                size: "$v.size", colour: "$v.colour", qty_on_hand: "$qty_on_hand", reorder_level: "$reorder_level" } }
]));

// ---------------------------------------------------------------------
// 2. Best-selling products
//    SELECT p.pname, SUM(c.qty) AS units_sold, SUM(c.qty * c.unit_price) AS revenue
//    FROM contains c
//    JOIN variant v ON c.sku = v.sku
//    JOIN product p ON v.product_id = p.product_id
//    GROUP BY p.pname
//    ORDER BY revenue DESC
//    LIMIT 5;
show("2. Best-selling products", db.contains.aggregate([
  { $lookup: { from: "variant", localField: "sku", foreignField: "sku", as: "v" } },
  { $unwind: "$v" },
  { $lookup: { from: "product", localField: "v.product_id", foreignField: "product_id", as: "p" } },
  { $unwind: "$p" },
  { $group: { _id: "$p.pname",
              units_sold: { $sum: "$qty" },
              revenue: { $sum: { $multiply: ["$qty", "$unit_price"] } } } },
  { $sort: { revenue: -1 } },
  { $limit: 5 },
  { $project: { _id: 0, pname: "$_id", units_sold: "$units_sold", revenue: "$revenue" } }
]));

// ---------------------------------------------------------------------
// 3. Revenue by category
//    SELECT cat.cat_name, SUM(c.qty * c.unit_price) AS revenue
//    FROM contains c
//    JOIN variant v ON c.sku = v.sku
//    JOIN product p ON v.product_id = p.product_id
//    JOIN category cat ON p.category_id = cat.category_id
//    GROUP BY cat.cat_name
//    ORDER BY revenue DESC;
show("3. Revenue by category", db.contains.aggregate([
  { $lookup: { from: "variant", localField: "sku", foreignField: "sku", as: "v" } },
  { $unwind: "$v" },
  { $lookup: { from: "product", localField: "v.product_id", foreignField: "product_id", as: "p" } },
  { $unwind: "$p" },
  { $lookup: { from: "category", localField: "p.category_id", foreignField: "category_id", as: "cat" } },
  { $unwind: "$cat" },
  { $group: { _id: "$cat.cat_name", revenue: { $sum: { $multiply: ["$qty", "$unit_price"] } } } },
  { $sort: { revenue: -1 } },
  { $project: { _id: 0, cat_name: "$_id", revenue: "$revenue" } }
]));

// ---------------------------------------------------------------------
// 4. Top customers by spend
//    SELECT cu.cname, COUNT(DISTINCT o.order_id) AS orders_placed, SUM(pay.amount) AS total_spent
//    FROM orders o
//    JOIN customer cu ON o.cust_id = cu.cust_id
//    JOIN payment pay ON o.pay_id = pay.pay_id
//    GROUP BY cu.cname
//    ORDER BY total_spent DESC;
show("4. Top customers by spend", db.orders.aggregate([
  { $lookup: { from: "customer", localField: "cust_id", foreignField: "cust_id", as: "cu" } },
  { $unwind: "$cu" },
  { $lookup: { from: "payment", localField: "pay_id", foreignField: "pay_id", as: "pay" } },
  { $unwind: "$pay" },
  { $group: { _id: "$cu.cname",
              order_ids: { $addToSet: "$order_id" },          // the DISTINCT set...
              total_spent: { $sum: "$pay.amount" } } },
  { $sort: { total_spent: -1 } },
  { $project: { _id: 0, cname: "$_id",
                orders_placed: { $size: "$order_ids" },        // ...and its COUNT
                total_spent: "$total_spent" } }
]));

// ---------------------------------------------------------------------
// 5. Orders awaiting shipment
//    SELECT o.order_id, o.order_date, o.status, cu.cname
//    FROM orders o
//    JOIN customer cu ON o.cust_id = cu.cust_id
//    WHERE o.status = 'Placed'
//    ORDER BY o.order_date;
show("5. Orders awaiting shipment", db.orders.aggregate([
  { $match: { status: "Placed" } },
  { $lookup: { from: "customer", localField: "cust_id", foreignField: "cust_id", as: "cu" } },
  { $unwind: "$cu" },
  { $sort: { order_date: 1 } },
  { $project: { _id: 0, order_id: "$order_id",
                order_date: { $dateToString: { format: "%Y-%m-%d", date: "$order_date" } },
                status: "$status", cname: "$cu.cname" } }
]));

// ---------------------------------------------------------------------
// 6. Order totals (via view)
//    SELECT ot.order_id, cu.cname, o.status, ot.total_amount
//    FROM order_totals ot
//    JOIN orders o ON o.order_id = ot.order_id
//    JOIN customer cu ON o.cust_id = cu.cust_id
//    ORDER BY ot.order_id;
show("6. Order totals (via view)", db.order_totals.aggregate([
  { $lookup: { from: "orders", localField: "order_id", foreignField: "order_id", as: "o" } },
  { $unwind: "$o" },
  { $lookup: { from: "customer", localField: "o.cust_id", foreignField: "cust_id", as: "cu" } },
  { $unwind: "$cu" },
  { $sort: { order_id: 1 } },
  { $project: { _id: 0, order_id: "$order_id", cname: "$cu.cname", status: "$o.status", total_amount: "$total_amount" } }
]));

// ---------------------------------------------------------------------
// 7. Online stock by brand
//    SELECT b.brand_name, SUM(s.qty_on_hand) AS online_stock
//    FROM brand b
//    JOIN product p ON b.brand_id = p.brand_id
//    JOIN variant v ON p.product_id = v.product_id
//    JOIN stocks s ON v.sku = s.sku
//    WHERE s.store_id = 5
//    GROUP BY b.brand_name
//    ORDER BY online_stock DESC;
//  Same inner joins, walked from the stocks end so the WHERE can run first.
show("7. Online stock by brand", db.stocks.aggregate([
  { $match: { store_id: 5 } },
  { $lookup: { from: "variant", localField: "sku", foreignField: "sku", as: "v" } },
  { $unwind: "$v" },
  { $lookup: { from: "product", localField: "v.product_id", foreignField: "product_id", as: "p" } },
  { $unwind: "$p" },
  { $lookup: { from: "brand", localField: "p.brand_id", foreignField: "brand_id", as: "b" } },
  { $unwind: "$b" },
  { $group: { _id: "$b.brand_name", online_stock: { $sum: "$qty_on_hand" } } },
  { $sort: { online_stock: -1 } },
  { $project: { _id: 0, brand_name: "$_id", online_stock: "$online_stock" } }
]));

// ---------------------------------------------------------------------
// 8. Supplier lead times
//    SELECT sup.sname, p.pname, sp.cost_price, sp.lead_time
//    FROM supplies sp
//    JOIN supplier sup ON sp.supplier_id = sup.supplier_id
//    JOIN product p ON sp.product_id = p.product_id
//    ORDER BY sp.lead_time DESC;
show("8. Supplier lead times", db.supplies.aggregate([
  { $lookup: { from: "supplier", localField: "supplier_id", foreignField: "supplier_id", as: "sup" } },
  { $unwind: "$sup" },
  { $lookup: { from: "product", localField: "product_id", foreignField: "product_id", as: "p" } },
  { $unwind: "$p" },
  { $sort: { lead_time: -1 } },
  { $project: { _id: 0, sname: "$sup.sname", pname: "$p.pname", cost_price: "$cost_price", lead_time: "$lead_time" } }
]));

// ---------------------------------------------------------------------
// Dashboard numbers (the stat cards on the website's console page)
//    SELECT COUNT(*) FROM variant;
//    SELECT SUM(qty_on_hand) FROM stocks;
//    SELECT COUNT(*) FROM stocks WHERE qty_on_hand <= reorder_level;
//    SELECT COUNT(*) FROM orders WHERE status = 'Placed' OR status = 'Shipped';
//    SELECT SUM(amount) FROM payment;
show("Dashboard numbers", [{
  skus_tracked: db.variant.countDocuments(),
  units_in_stock: db.stocks.aggregate([{ $group: { _id: null, n: { $sum: "$qty_on_hand" } } }]).toArray()[0].n,
  low_stock_alerts: db.stocks.countDocuments({ $expr: { $lte: ["$qty_on_hand", "$reorder_level"] } }),
  open_orders: db.orders.countDocuments({ $or: [{ status: "Placed" }, { status: "Shipped" }] }),
  revenue_paid: db.payment.aggregate([{ $group: { _id: null, n: { $sum: "$amount" } } }]).toArray()[0].n
}]);

// =====================================================================
//  Everyday SQL clauses → MongoDB  (find() is enough when there is no join)
// =====================================================================

// SELECT * FROM product LIMIT 10;
show("SELECT * ... LIMIT", db.product.find().limit(10));

// SELECT pname, base_price FROM product WHERE base_price > 2000 ORDER BY base_price DESC;
show("WHERE + ORDER BY", db.product.find({ base_price: { $gt: 2000 } }, { _id: 0, pname: 1, base_price: 1 })
  .sort({ base_price: -1 }));

// SELECT pname FROM product WHERE pname LIKE '%Shirt%';
show("LIKE", db.product.find({ pname: /Shirt/ }, { _id: 0, pname: 1 }));

// SELECT order_id, status FROM orders WHERE status IN ('Placed', 'Shipped');
show("IN", db.orders.find({ status: { $in: ["Placed", "Shipped"] } }, { _id: 0, order_id: 1, status: 1 }));

// SELECT pay_id, amount, pay_date FROM payment
// WHERE pay_date BETWEEN '2026-07-01' AND '2026-07-31';
show("BETWEEN dates", db.payment.find(
  { pay_date: { $gte: ISODate("2026-07-01"), $lte: ISODate("2026-07-31") } },
  { _id: 0, pay_id: 1, amount: 1, pay_date: 1 }));

// SELECT COUNT(*) FROM customer;
show("COUNT(*)", [{ customers: db.customer.countDocuments() }]);

// SELECT DISTINCT store_type FROM stores;
show("DISTINCT", db.stores.distinct("store_type").map(t => ({ store_type: t })));

// SELECT category_id, COUNT(*) AS products FROM product
// GROUP BY category_id HAVING COUNT(*) >= 3;
show("GROUP BY + HAVING", db.product.aggregate([
  { $group: { _id: "$category_id", products: { $sum: 1 } } },
  { $match: { products: { $gte: 3 } } },                       // HAVING = $match after $group
  { $sort: { _id: 1 } },
  { $project: { _id: 0, category_id: "$_id", products: "$products" } }
]));

// Sub-categories with their parent (self-join on category)
// SELECT c.cat_name, parent.cat_name AS parent_name
// FROM category c JOIN category parent ON c.parent_category_id = parent.category_id;
show("Self-join", db.category.aggregate([
  { $lookup: { from: "category", localField: "parent_category_id", foreignField: "category_id", as: "parent" } },
  { $unwind: "$parent" },
  { $project: { _id: 0, cat_name: "$cat_name", parent_name: "$parent.cat_name" } }
]));

// LEFT JOIN: every customer, with how many orders they have (0 included)
// SELECT cu.cname, COUNT(o.order_id) AS orders
// FROM customer cu LEFT JOIN orders o ON cu.cust_id = o.cust_id
// GROUP BY cu.cust_id, cu.cname ORDER BY orders DESC, cu.cname;
show("LEFT JOIN", db.customer.aggregate([
  { $lookup: { from: "orders", localField: "cust_id", foreignField: "cust_id", as: "o" } },
  // no $unwind: the array may be empty, which is exactly a LEFT JOIN's NULL side
  { $project: { _id: 0, cname: "$cname", orders: { $size: "$o" } } },
  { $sort: { orders: -1, cname: 1 } }
]));
