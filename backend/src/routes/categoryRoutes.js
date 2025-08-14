import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Create category (super admin only)
router.post('/create', authenticate, authorizeSuperAdmin, createCategory);

// Get all categories (admin or super admin)
router.get('/', authenticate, getAllCategories);

// Get single category by id (admin or super admin)
router.get('/:id', authenticate, getCategoryById);

// Update category (super admin only)
router.put('/update/:id', authenticate, authorizeSuperAdmin, updateCategory);

// Delete category (super admin only)
router.delete('/delete/:id', authenticate, authorizeSuperAdmin, deleteCategory);

export default router;
