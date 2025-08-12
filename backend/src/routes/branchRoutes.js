import { Router } from 'express';
import { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Only super admin can create branches
router.post('/create', authenticate, authorizeSuperAdmin, createBranch);


// Any authenticated user can view branches
router.get('/list-branches', authenticate, getAllBranches);
router.get('/list-branches/:id', authenticate, getBranchById);


// Only super admin can update or delete branches
router.put('/update/:id', authenticate, authorizeSuperAdmin, updateBranch);
router.delete('/delete/:id', authenticate, authorizeSuperAdmin, deleteBranch);

export default router;
