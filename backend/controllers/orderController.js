const { client, getDb, supportsTransactions } = require('../config/db');
const { ONLINE_STORE_ID } = require('./productController');
const nextId = require('../utils/nextId');

// An error that should reach the client with its own status code
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Today's local date at midnight UTC — what CURDATE() puts in a DATE column
function today() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// The purchase steps. `session` is set when running inside a transaction;
// `undo` collects compensating steps when running without one.
async function placeOrder(db, { custId, sku, quantity }, session, undo) {
  const opts = { session };

  // MongoDB has no FOREIGN KEY constraints, so check the reference here
  const customer = await db.collection('customer').findOne({ cust_id: custId }, { ...opts, projection: { _id: 1 } });
  if (!customer) throw new HttpError(404, 'Unknown customer');

  // Stock check + decrement as ONE atomic operation. This replaces
  // SELECT ... FOR UPDATE: the filter only matches while enough stock is
  // left, and the $inc is applied to that same document before any other
  // request can change it — two buyers can't both get the last unit.
  const stock = await db.collection('stocks').findOneAndUpdate(
    { store_id: ONLINE_STORE_ID, sku, qty_on_hand: { $gte: quantity } },
    { $inc: { qty_on_hand: -quantity } },
    { ...opts, returnDocument: 'after' }
  );
  if (!stock) {
    const row = await db.collection('stocks').findOne({ store_id: ONLINE_STORE_ID, sku }, opts);
    if (!row) throw new HttpError(404, 'Unknown SKU');
    throw new HttpError(409, `Only ${row.qty_on_hand} left in stock`);
  }
  undo?.push(() => db.collection('stocks').updateOne({ _id: stock._id }, { $inc: { qty_on_hand: quantity } }));

  const variant = await db.collection('variant').findOne({ sku }, opts);
  const product = await db.collection('product').findOne({ product_id: variant.product_id }, opts);
  const unitPrice = product.base_price;
  const total = unitPrice * quantity;
  const date = today();

  const payId = await nextId(db, 'payment', session);
  await db.collection('payment').insertOne({ pay_id: payId, mode: 'Card', amount: total, pay_date: date }, opts);
  undo?.push(() => db.collection('payment').deleteOne({ pay_id: payId }));

  const orderId = await nextId(db, 'orders', session);
  await db.collection('orders').insertOne(
    { order_id: orderId, order_date: date, status: 'Placed', cust_id: custId, pay_id: payId }, opts
  );
  undo?.push(() => db.collection('orders').deleteOne({ order_id: orderId }));

  await db.collection('contains').insertOne({ order_id: orderId, sku, qty: quantity, unit_price: unitPrice }, opts);

  return { order_id: orderId, total_amount: total, remaining_stock: stock.qty_on_hand };
}

// Replica set / Atlas: a real multi-document transaction. withTransaction()
// commits if the callback finishes, aborts (rolls back) if it throws, and
// retries automatically on a write conflict with a concurrent purchase.
async function purchaseWithTransaction(db, args) {
  const session = client.startSession();
  try {
    let result;
    await session.withTransaction(
      async () => {
        result = await placeOrder(db, args, session);
      },
      { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } }
    );
    return result;
  } finally {
    await session.endSession();
  }
}

// Standalone mongod: no transactions. The atomic stock update still prevents
// overselling; if a later step fails, the steps already done are undone in
// reverse order so no half-finished order is left behind.
async function purchaseWithoutTransaction(db, args) {
  const undo = [];
  try {
    return await placeOrder(db, args, undefined, undo);
  } catch (err) {
    for (const step of undo.reverse()) {
      await step().catch((undoErr) => console.error('undo step failed:', undoErr));
    }
    throw err;
  }
}

// POST /api/orders  { cust_id, sku, qty }
async function purchase(req, res) {
  const { cust_id, sku, qty } = req.body;
  const custId = Number.parseInt(cust_id, 10);
  const quantity = Number.parseInt(qty, 10);
  if (!Number.isInteger(custId) || typeof sku !== 'string' || !sku || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'cust_id, sku and a positive qty are required' });
  }

  const db = getDb();
  const args = { custId, sku, quantity };
  try {
    const result = supportsTransactions()
      ? await purchaseWithTransaction(db, args)
      : await purchaseWithoutTransaction(db, args);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error('purchase failed:', err);
    res.status(500).json({ error: 'Purchase failed, nothing was charged' });
  }
}

// GET /api/orders/:custId
async function getOrdersForCustomer(req, res) {
  const custId = Number.parseInt(req.params.custId, 10);
  if (!Number.isInteger(custId)) return res.json({ orders: [] });
  const db = getDb();

  const orders = await db.collection('orders').aggregate([
    { $match: { cust_id: custId } },
    { $sort: { order_id: -1 } },
    {
      $project: {
        _id: 0, order_id: '$order_id',
        order_date: { $dateToString: { format: '%Y-%m-%d', date: '$order_date' } },
        status: '$status'
      }
    }
  ]).toArray();
  if (!orders.length) return res.json({ orders: [] });

  const ids = orders.map((o) => o.order_id);
  const itemRows = await db.collection('contains').aggregate([
    { $match: { order_id: { $in: ids } } },
    { $lookup: { from: 'variant', localField: 'sku', foreignField: 'sku', as: 'v' } },
    { $unwind: '$v' },
    { $lookup: { from: 'product', localField: 'v.product_id', foreignField: 'product_id', as: 'p' } },
    { $unwind: '$p' },
    {
      $project: {
        _id: 0, order_id: '$order_id', sku: '$sku', qty: '$qty', unit_price: '$unit_price',
        size: '$v.size', colour: '$v.colour', pname: '$p.pname'
      }
    }
  ]).toArray();

  const byOrder = {};
  itemRows.forEach((it) => {
    if (!byOrder[it.order_id]) byOrder[it.order_id] = [];
    byOrder[it.order_id].push(it);
  });
  orders.forEach((o) => {
    o.items = byOrder[o.order_id] || [];
    o.total_amount = o.items.reduce((sum, it) => sum + it.qty * it.unit_price, 0);
  });

  res.json({ orders });
}

module.exports = { purchase, getOrdersForCustomer };
