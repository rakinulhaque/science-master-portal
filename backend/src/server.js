// backend/src/server.js
import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';

import sequelize from './models/db.js';
import './models/associations.js';

import userRoutes from './routes/userRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import studentPaymentRoutes from './routes/studentPaymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------------------- Middleware ---------------------------- */

// Parse JSON first
app.use(express.json());

// CORS — allow your Vercel app (+ localhost for dev)
const whitelist = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: true,
  // origin(origin, cb) {
  //   // allow tools without Origin (curl/Postman) and same-origin
  //   if (!origin) return cb(null, true);
  //   if (whitelist.includes(origin)) return cb(null, true);
  //   return cb(new Error('Not allowed by CORS'));

  // },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight for every route

// If you use cookies/sessions behind a proxy (Render), keep this:
app.set('trust proxy', 1);

/* ------------------------------ Health ----------------------------- */

app.get('/', (_req, res) => {
  res.status(200).send('Pocket Coach API is running');
});

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

/* -------------------------------- API ------------------------------ */

app.use('/users', userRoutes);
app.use('/branches', branchRoutes);
app.use('/batches', batchRoutes);
app.use('/students', studentRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', studentPaymentRoutes);

/* ------------------------- Error (last) ---------------------------- */

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

/* --------------------------- Start app ----------------------------- */

// Start HTTP server first so Render sees an open port,
// then connect to the database in the background.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);

  (async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      console.log('✅ Database connected & synced');
    } catch (err) {
      console.error('❌ Database connection failed (server still running):', err);
    }
  })();
});
