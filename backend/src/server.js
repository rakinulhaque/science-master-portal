import express from 'express';
import sequelize from './models/db.js';
import userRoutes from './routes/userRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import './models/associations.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRoutes);
app.use('/branches', branchRoutes);
app.use('/batches', batchRoutes);
app.use('/students', studentRoutes);

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
