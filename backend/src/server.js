import express from 'express';
import cors from 'cors';
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

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/users', userRoutes);
app.use('/branches', branchRoutes);
app.use('/batches', batchRoutes);
app.use('/students', studentRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', studentPaymentRoutes);

(async () => {
  try {
    await sequelize.sync(); // Auto-creates DB tables
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();