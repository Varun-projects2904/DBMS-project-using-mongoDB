require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect, getDb, supportsTransactions } = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await getDb().command({ ping: 1 });
    res.json({ status: 'ok', db: 'connected', transactions: supportsTransactions() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'unreachable', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// centralized error handler — anything an async controller throws lands here
// (see utils/asyncHandler.js), so a failed query never just hangs the request
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 4000;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`StyleStock API listening on http://localhost:${PORT}`);
      if (!supportsTransactions()) {
        console.log('Note: this MongoDB server is standalone, so purchases run without a ' +
          'multi-document transaction (see backend/README.md).');
      }
    });
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB at', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
    console.error(err.message);
    process.exit(1);
  });
