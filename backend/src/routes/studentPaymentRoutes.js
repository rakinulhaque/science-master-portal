import { Router } from 'express';
import { getAllPayments } from '../controllers/studentPaymentController.js';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Only super admin can list all payments
router.get('/payments', authenticate, authorizeSuperAdmin, getAllPayments);

export default router;
