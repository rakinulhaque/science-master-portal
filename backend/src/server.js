import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Science Master Portal API is running!',
    version: '1.0.0',
    status: 'healthy'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'active',
    timestamp: new Date().toISOString(),
    features: [
      'User Authentication',
      'Student Management', 
      'Branch Management',
      'Batch Management',
      'Payment Tracking'
    ]
  });
});

// Database connection and routes (commented out for demo)
/*
import sequelize from './models/db.js';
import userRoutes from './routes/userRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import './models/associations.js';

app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/students', studentRoutes);

// Uncomment below to enable database connection
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connection established successfully.');
//     await sequelize.sync();
//     console.log('Database synchronized successfully.');
//   } catch (err) {
//     console.error('Unable to connect to the database:', err);
//   }
// })();
*/

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Science Master Portal Backend running on port ${PORT}`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/`);
  console.log(`📝 To enable database features, configure PostgreSQL and uncomment database code in server.js`);
});
