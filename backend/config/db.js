require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'fashion_retail';

// One client for the whole app. It manages its own connection pool,
// so it plays the part mysql2's createPool() used to.
const client = new MongoClient(uri);

let db = null;
let transactionsSupported = false;

async function connect() {
  await client.connect();
  db = client.db(dbName);

  // Multi-document transactions need a replica set (MongoDB 4.0+) or a
  // sharded cluster (4.2+). A plain standalone mongod has neither, so the
  // purchase code checks this flag and falls back when it's false.
  let info;
  try {
    info = await db.admin().command({ hello: 1 });
  } catch (err) {
    info = await db.admin().command({ isMaster: 1 }); // servers older than 4.4.2
  }
  transactionsSupported =
    (Boolean(info.setName) && info.maxWireVersion >= 7) ||
    (info.msg === 'isdbgrid' && info.maxWireVersion >= 8);

  return db;
}

function getDb() {
  if (!db) throw new Error('MongoDB is not connected yet — call connect() first');
  return db;
}

module.exports = {
  client,
  connect,
  getDb,
  supportsTransactions: () => transactionsSupported
};
