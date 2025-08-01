import { Router } from 'express';
import { getAllUsers, createUser, createSuperAdmin, login } from '../controllers/userController.js';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Public: Super admin signup (only if none exists)
router.post('/superadmin', createSuperAdmin);

// Public: Login
router.post('/login', login);

// Protected: Only super admin can create admins
router.post('/createadmins', authenticate, authorizeSuperAdmin, createUser);

// Protected: List users (any admin or super admin)
router.get('/users', authenticate, getAllUsers);

export default router;
