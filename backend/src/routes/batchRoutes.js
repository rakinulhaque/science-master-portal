import express from 'express';
import {
  createBatch,
  updateBatch,
  deleteBatch,
  getAllBatches,
  getBatchById,
  getBatchesByBranch
} from '../controllers/batchController.js';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Only super admins can create, update, delete batches
router.post('/', authenticate, authorizeSuperAdmin, createBatch);
router.put('/:id', authenticate, authorizeSuperAdmin, updateBatch);
router.delete('/:id', authenticate, authorizeSuperAdmin, deleteBatch);

// Any authenticated user can view batches
router.get('/', authenticate, getAllBatches);
router.get('/branch/:branchId', authenticate, getBatchesByBranch);
router.get('/:id', authenticate, getBatchById);

export default router;
