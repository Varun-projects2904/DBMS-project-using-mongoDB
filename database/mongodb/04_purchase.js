// =====================================================================
//  StyleStock — MongoDB version            04_purchase.js
//
//  The shop's "Buy now", written as one MongoDB transaction.
//
//    MySQL backend (before)                        MongoDB (here)
//    START TRANSACTION                             session.startTransaction()
//    SELECT qty_on_hand ... FOR UPDATE + check     findOneAndUpdate() that only matches when
//    UPDATE stocks SET qty_on_hand = qty - ?       qty_on_hand >= qty, with $inc: -qty  (one atomic step)
//    INSERT INTO payment / orders / contains       insertOne() on each collection
//    COMMIT / ROLLBACK                             commitTransaction() / abortTransaction()
//    AUTO_INCREMENT                                nextId(): $inc on the counters collection
//    FOREIGN KEY (orders.cust_id)                  checked here in code — MongoDB doesn't enforce it
//
//  Multi-document transactions need a replica set: MongoDB Atlas, or a local
//  mongod started with --replSet rs0 followed by rs.initiate() once.
//  On a plain standalone mongod this script runs the same steps without a
//  transaction. The stock check-and-decrement is still a single atomic update,
//  so it can never oversell, but a crash half-way through would not be undone.
//
//  Run:   mongosh "mongodb://127.0.0.1:27017" 04_purchase.js
//  It places a real order — run 02_seed.js again to reset the data.
// =====================================================================

db = db.getSiblingDB("fashion_retail");
const ONLINE_STORE_ID = 5;   // "StyleStock Online Store"

// AUTO_INCREMENT replacement: atomically add 1 to the table's counter and return it
function nextId(d, table) {
  return d.counters.findOneAndUpdate(
    { _id: table }, { $inc: { seq: 1 } }, { upsert: true, returnNewDocument: true }
  ).seq;
}

// Today's local date at midnight UTC — what CURDATE() puts in a DATE column
function today() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// The purchase itself. `d` is the normal db, or the session's db inside a transaction.
function placeOrder(d, custId, sku, qty) {
  // MongoDB has no FOREIGN KEY constraint, so check the reference ourselves
  if (!d.customer.findOne({ cust_id: custId })) {
    throw new Error("No customer with cust_id " + custId);
  }

  // Stock check + decrement as ONE atomic operation (replaces SELECT ... FOR UPDATE):
  // the filter matches only while enough stock is left, and the $inc is applied
  // to that same document before anyone else can touch it.
  const stock = d.stocks.findOneAndUpdate(
    { store_id: ONLINE_STORE_ID, sku: sku, qty_on_hand: { $gte: qty } },
    { $inc: { qty_on_hand: -qty } },
    { returnNewDocument: true }
  );
  if (!stock) {
    const row = d.stocks.findOne({ store_id: ONLINE_STORE_ID, sku: sku });
    throw new Error(row ? "Only " + row.qty_on_hand + " left in stock" : "Unknown SKU " + sku);
  }

  const variant = d.variant.findOne({ sku: sku });
  const product = d.product.findOne({ product_id: variant.product_id });
  const unitPrice = product.base_price;
  const total = unitPrice * qty;
  const date = today();

  const payId = nextId(d, "payment");
  d.payment.insertOne({ pay_id: payId, mode: "Card", amount: total, pay_date: date });

  const orderId = nextId(d, "orders");
  d.orders.insertOne({ order_id: orderId, order_date: date, status: "Placed", cust_id: custId, pay_id: payId });
  d.contains.insertOne({ order_id: orderId, sku: sku, qty: qty, unit_price: unitPrice });

  return { order_id: orderId, total_amount: total, remaining_stock: stock.qty_on_hand };
}

function supportsTransactions() {
  let info;
  try { info = db.hello(); } catch (e) { info = db.isMaster(); }   // hello() needs MongoDB 4.4.2+
  return (Boolean(info.setName) && info.maxWireVersion >= 7)        // replica set, MongoDB 4.0+
      || (info.msg === "isdbgrid" && info.maxWireVersion >= 8);     // sharded cluster, MongoDB 4.2+
}

function purchase(custId, sku, qty) {
  if (!supportsTransactions()) {
    print("   (standalone server: running the steps without a transaction)");
    return placeOrder(db, custId, sku, qty);
  }
  const session = db.getMongo().startSession();
  const sdb = session.getDatabase(db.getName());
  session.startTransaction({ readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });  // START TRANSACTION
  try {
    const result = placeOrder(sdb, custId, sku, qty);
    session.commitTransaction();                                                                     // COMMIT
    return result;
  } catch (err) {
    session.abortTransaction();                                                                      // ROLLBACK
    throw err;
  } finally {
    session.endSession();
  }
}

// ------------------------------------------------------------------ demo
const SKU = "P1-M";   // Classic Oxford Shirt, size M
const stockLeft = () => db.stocks.findOne({ store_id: ONLINE_STORE_ID, sku: SKU }).qty_on_hand;
const rowCounts = () => ({
  payment: db.payment.countDocuments(),
  orders: db.orders.countDocuments(),
  contains: db.contains.countDocuments()
});

print("Online stock of " + SKU + " before: " + stockLeft());

print("\n1) aditi (cust_id 1) buys 2 × " + SKU);
printjson(purchase(1, SKU, 2));
print("Online stock of " + SKU + " now: " + stockLeft());

print("\n2) aditi tries to buy 999 × " + SKU + " — must fail and write nothing");
const before = rowCounts();
try {
  purchase(1, SKU, 999);
} catch (err) {
  print("Rejected: " + err.message);
}
printjson({ rowsBefore: before, rowsAfter: rowCounts(), stockLeft: stockLeft() });

print("\n3) The new order, read back through the order_totals view");
const lastOrderId = db.orders.find().sort({ order_id: -1 }).limit(1).toArray()[0].order_id;
console.table(db.order_totals.aggregate([
  { $match: { order_id: lastOrderId } },
  { $lookup: { from: "orders", localField: "order_id", foreignField: "order_id", as: "o" } },
  { $unwind: "$o" },
  { $project: { _id: 0, order_id: "$order_id", cust_id: "$o.cust_id", status: "$o.status", total_amount: "$total_amount" } }
]).toArray());
