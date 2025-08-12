const router = express.Router();
import { createStudent, updateStudent } from '../controllers/studentInfoController.js';
import { authenticate, authorizeSuperAdmin, authorizeAdmin } from '../middleware/auth.js';
import express from 'express';
import { addStudentPayment, getStudentWithDue } from '../controllers/studentController.js';
import { getAllStudentsWithDue } from '../controllers/studentDueController.js';



// Get all students with real-time due calculation
router.get('/', getAllStudentsWithDue);

// Add a payment (installment) for a student
router.post('/:studentId/payments', addStudentPayment);

// Get a student with real-time due calculation
router.get('/:id', getStudentWithDue);

// Create a student (admin or super admin)
router.post('/', authenticate, authorizeAdmin, createStudent);

// Edit student info (admin or super admin, except payment info)
router.put('/:id', authenticate, authorizeAdmin, updateStudent);

export default router;
