import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from './models/db.js';
import userRoutes from './routes/userRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import studentPaymentRoutes from './routes/studentPaymentRoutes.js';
import './models/associations.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Configure CORS (include your Render domain)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://science-portal.onrender.com'   // change to your actual Render domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middleware
app.use(express.json());

// ✅ API Routes
app.use('/users', userRoutes);
app.use('/branches', branchRoutes);
app.use('/batches', batchRoutes);
app.use('/students', studentRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', studentPaymentRoutes);

// ✅ Serve React frontend build
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// ✅ Fallback route (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// ✅ Start server after DB sync
(async () => {
  try {
    await sequelize.sync(); // Auto-creates DB tables
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
  }
})();
