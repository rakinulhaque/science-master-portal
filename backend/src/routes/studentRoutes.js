const router = express.Router();
import { createStudent, updateStudent } from '../controllers/studentInfoController.js';
import { authenticate, authorizeSuperAdmin, authorizeAdmin } from '../middleware/auth.js';
import express from 'express';
import { addStudentPayment } from '../controllers/studentController.js';
import { getStudentWithDue, getAllStudentsWithDue } from '../controllers/studentDueController.js';



// Get all students with real-time due calculation
router.get('/', getAllStudentsWithDue);

// Add a payment (installment) for a student
router.post('/:studentId/payments', authenticate, addStudentPayment);

// Edit a payment (superadmin only)
import { updateStudentPayment } from '../controllers/studentController.js';
router.put('/payments/:paymentId', authenticate, authorizeSuperAdmin, updateStudentPayment);

// Get a student with real-time due calculation
router.get('/:id', authenticate, getStudentWithDue);

// Create a student (admin or super admin)
router.post('/', authenticate, authorizeAdmin, createStudent);

// Edit student info (admin or super admin, except payment info)
router.put('/:id', authenticate, authorizeAdmin, updateStudent);

export default router;
