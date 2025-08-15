import Student from '../models/student.js';
import Batch from '../models/batch.js';
import StudentPayment from '../models/studentPayment.js';
import sequelize from '../models/db.js';
import { calculateStudentDue } from './studentDueController.js';

// Create a payment (installment)
export const addStudentPayment = async (req, res) => {
  const { studentId } = req.params;
  const { amount, date, note } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Amount is required and must be a number.' });
  }
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }
    // Calculate what the new due would be if this payment is added
    const dueDetails = await calculateStudentDue(studentId);
    const newFinalDue = dueDetails.finalDue - parseFloat(amount);
    if (newFinalDue < 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Final due cannot be less than zero after this payment. Please check the payment amount, discount, and batch cost.' });
    }
    // Find last installment number for this student
    const lastPayment = await StudentPayment.findOne({
      where: { studentId },
      order: [['installmentNumber', 'DESC']],
      transaction: t,
    });
    const installmentNumber = lastPayment ? lastPayment.installmentNumber + 1 : 1;
    const payment = await StudentPayment.create({ studentId, amount, date, note, installmentNumber }, { transaction: t });
    await t.commit();
    // Return updated due
    const updatedDue = await calculateStudentDue(studentId);
    res.status(201).json({ payment, due: updatedDue });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Edit a student payment (superadmin only)
export const updateStudentPayment = async (req, res) => {
  const { paymentId } = req.params;
  const { amount, date, note } = req.body;
  if (amount !== undefined && (isNaN(amount) || amount < 0)) {
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  }
  try {
    const payment = await StudentPayment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (amount !== undefined) payment.amount = amount;
    if (date !== undefined) payment.date = date;
    if (note !== undefined) payment.note = note;
    await payment.save();
    // Optionally recalculate due
    const due = await calculateStudentDue(payment.studentId);
    res.json({ payment, due });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment', error: err.message });
  }
};
