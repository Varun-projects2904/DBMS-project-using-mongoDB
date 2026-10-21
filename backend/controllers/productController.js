const { getDb } = require('../config/db');

const ONLINE_STORE_ID = 5; // "StyleStock Online Store" — the shop always reads/writes this store's stock

// variant JOIN stocks (online store only), for a set of products
function variantStockPipeline(productMatch) {
  return [
    { $match: productMatch },
    { $lookup: { from: 'stocks', localField: 'sku', foreignField: 'sku', as: 's' } },
    { $unwind: '$s' },
    { $match: { 's.store_id': ONLINE_STORE_ID } },
    { $sort: { sku: 1 } },
    {
      $project: {
        _id: 0, product_id: '$product_id', sku: '$sku', size: '$size', colour: '$colour',
        qty_on_hand: '$s.qty_on_hand'
      }
    }
  ];
}

// product JOIN brand JOIN category
const productJoins = [
  { $lookup: { from: 'brand', localField: 'brand_id', foreignField: 'brand_id', as: 'b' } },
  { $unwind: '$b' },
  { $lookup: { from: 'category', localField: 'category_id', foreignField: 'category_id', as: 'c' } },
  { $unwind: '$c' }
];

// GET /api/products?category=All|Men|Women|Kids
async function listProducts(req, res) {
  const category = typeof req.query.category === 'string' ? req.query.category : 'All';
  const db = getDb();

  const pipeline = [...productJoins];
  if (category !== 'All') {
    // WHERE c.gender = ? OR c.gender = 'Unisex'
    pipeline.push({ $match: { $or: [{ 'c.gender': category }, { 'c.gender': 'Unisex' }] } });
  }
  pipeline.push(
    { $sort: { product_id: 1 } },
    {
      $project: {
        _id: 0, product_id: '$product_id', pname: '$pname', base_price: '$base_price',
        category_id: '$category_id', brand_name: '$b.brand_name', cat_name: '$c.cat_name', gender: '$c.gender'
      }
    }
  );

  const products = await db.collection('product').aggregate(pipeline).toArray();
  if (!products.length) return res.json({ products: [] });

  // one extra query for every variant+stock row, instead of one per product
  const ids = products.map((p) => p.product_id);
  const variantRows = await db.collection('variant')
    .aggregate(variantStockPipeline({ product_id: { $in: ids } }))
    .toArray();

  const byProduct = {};
  variantRows.forEach((v) => {
    if (!byProduct[v.product_id]) byProduct[v.product_id] = [];
    byProduct[v.product_id].push(v);
  });
  products.forEach((p) => {
    p.variants = byProduct[p.product_id] || [];
  });

  res.json({ products });
}

// GET /api/products/:id
async function getProduct(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Product not found' });

  const db = getDb();
  const rows = await db.collection('product').aggregate([
    { $match: { product_id: id } },
    ...productJoins,
    {
      $project: {
        _id: 0, product_id: '$product_id', pname: '$pname', base_price: '$base_price',
        brand_name: '$b.brand_name', cat_name: '$c.cat_name', gender: '$c.gender'
      }
    }
  ]).toArray();
  if (!rows.length) return res.status(404).json({ error: 'Product not found' });

  const variants = (await db.collection('variant').aggregate(variantStockPipeline({ product_id: id })).toArray())
    .map(({ product_id, ...v }) => v);

  res.json({ product: { ...rows[0], variants } });
}

module.exports = { listProducts, getProduct, ONLINE_STORE_ID };
