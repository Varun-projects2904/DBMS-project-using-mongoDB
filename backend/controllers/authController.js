const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const nextId = require('../utils/nextId');

// Request values go straight into MongoDB filters, so they must be plain
// strings. Otherwise a body like { "username": { "$ne": null } } would turn
// into a query operator and match any account (NoSQL injection).
const isText = (v) => typeof v === 'string' && v.length > 0;

// POST /api/auth/check-username  { username }
// Lets the frontend "detect" whether to show a password field (existing
// customer) or expand into the create-account form (new customer) —
// mirrors the flow on the live demo.
async function checkUsername(req, res) {
  const { username } = req.body;
  if (!isText(username)) return res.status(400).json({ error: 'username is required' });

  const found = await getDb().collection('customer').findOne({ username }, { projection: { _id: 1 } });
  res.json({ exists: Boolean(found) });
}

// POST /api/auth/login  { username, password }
async function login(req, res) {
  const { username, password } = req.body;
  if (!isText(username) || !isText(password)) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const customers = getDb().collection('customer');
  const customer = await customers.findOne({ username });
  if (!customer) return res.status(404).json({ error: 'No account with that username' });

  const stored = customer.password || '';
  const looksHashed = /^\$2[aby]\$/.test(stored);
  const passwordOk = looksHashed ? await bcrypt.compare(password, stored) : password === stored;

  if (!passwordOk) return res.status(401).json({ error: 'Incorrect password' });

  // 02_seed.js ships plaintext demo passwords (threadline123) so the data is
  // easy to read in the console; upgrade to a bcrypt hash the first time
  // that account successfully logs in through this API.
  if (!looksHashed) {
    const hash = await bcrypt.hash(password, 10);
    await customers.updateOne({ cust_id: customer.cust_id }, { $set: { password: hash } });
  }

  const { _id, password: _password, ...publicFields } = customer;
  res.json({ customer: publicFields });
}

// POST /api/auth/signup  { cname, username, password }
async function signup(req, res) {
  const { cname, username, password } = req.body;
  if (!isText(cname) || !isText(username) || !isText(password)) {
    return res.status(400).json({ error: 'cname, username and password are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  if (cname.length > 80 || username.length > 40) {
    return res.status(400).json({ error: 'Name must be at most 80 characters and username at most 40' });
  }

  const db = getDb();
  const customers = db.collection('customer');
  const existing = await customers.findOne({ username }, { projection: { _id: 1 } });
  if (existing) return res.status(409).json({ error: 'That username is already taken' });

  const hash = await bcrypt.hash(password, 10);
  const email = username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@example.com';
  const custId = await nextId(db, 'customer');

  try {
    await customers.insertOne({ cust_id: custId, cname, email, username, password: hash });
  } catch (err) {
    // the unique indexes still catch a race between the check above and this insert
    if (err.code === 11000) {
      const onEmail = /email/.test(err.message);
      return res.status(409).json({
        error: onEmail ? 'An account with that email already exists' : 'That username is already taken'
      });
    }
    throw err;
  }

  res.status(201).json({ customer: { cust_id: custId, cname, email, username } });
}

module.exports = { checkUsername, login, signup };
