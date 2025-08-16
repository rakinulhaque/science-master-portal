import { Router } from 'express';
import { getAllUsers, getUserById, createUser, createSuperAdmin, login, updateAdmin, deleteAdmin } from '../controllers/userController.js';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Public: Super admin signup (only if none exists)
router.post('/superadmin', createSuperAdmin);

// Public: Login
router.post('/login', login);

// Protected: Only super admin can create admins
router.post('/createadmins', authenticate, authorizeSuperAdmin, createUser);


// Protected: List users (any admin or super admin)
router.get('/list-users', authenticate, getAllUsers);
router.get('/user/:id', authenticate, getUserById);

// Protected: Update and delete admin (super admin only)
router.put('/updateadmin/:id', authenticate, authorizeSuperAdmin, updateAdmin);
router.delete('/delete/:id', authenticate, authorizeSuperAdmin, deleteAdmin);

export default router;
