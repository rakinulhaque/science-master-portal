import Student from '../models/student.js';
import StudentPayment from '../models/studentPayment.js';
import sequelize from '../models/db.js';
import { calculateStudentDue } from './studentDueController.js';

/**
 * Create a payment (installment) and/or update discount.
 * - `amount` is optional (supports discount-only updates).
 * - `discount` is optional (can be sent alone or with amount).
 * Validates that the resulting final due never goes below zero.
 */
export const addStudentPayment = async (req, res) => {
  const { studentId } = req.params;
  let { amount, date, note, discount } = req.body;

  // Normalize inputs
  const hasAmount = amount !== undefined && amount !== null && `${amount}` !== '';
  const parsedAmount = hasAmount ? Number(amount) : 0;

  const hasDiscount = discount !== undefined && discount !== null && `${discount}` !== '';
  const parsedDiscount = hasDiscount ? Number(discount) : null;

  if (hasAmount && (isNaN(parsedAmount) || parsedAmount < 0)) {
    return res.status(400).json({ message: 'Amount must be a non-negative number.' });
  }
  if (hasDiscount && (isNaN(parsedDiscount) || parsedDiscount < 0)) {
    return res.status(400).json({ message: 'Discount must be a non-negative number.' });
  }

  const t = await sequelize.transaction();
  try {
    // Lock the student row to avoid race conditions while computing/installments
    const student = await Student.findByPk(studentId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // Current (committed) due before any change
    const currentDue = await calculateStudentDue(studentId);
    const oldDiscount = Number(student.discount || 0);
    const newDiscount = parsedDiscount !== null ? parsedDiscount : oldDiscount;

    // Compute the new final due WITHOUT writing anything yet:
    // finalDue = totalCost - discount - totalPayments
    // Change effect = (oldDiscount - newDiscount) + (oldAmount(0) - newAmount(parsedAmount))
    const newFinalDue = currentDue.finalDue + (oldDiscount - newDiscount) - parsedAmount;

    if (newFinalDue < 0) {
      await t.rollback();
      return res.status(400).json({
        message:
          'Final due cannot be less than zero after this payment/discount. Please check the payment amount, discount, and batch cost.',
      });
    }

    // Apply discount if provided
    if (parsedDiscount !== null) {
      student.discount = newDiscount;
      await student.save({ transaction: t });
    }

    // Create payment if amount > 0
    let payment = null;
    if (parsedAmount > 0) {
      const lastPayment = await StudentPayment.findOne({
        where: { studentId },
        order: [['installmentNumber', 'DESC']],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const installmentNumber = lastPayment ? lastPayment.installmentNumber + 1 : 1;

      payment = await StudentPayment.create(
        {
          studentId,
          amount: parsedAmount,
          date: date || new Date(),
          note,
          installmentNumber,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const updatedDue = await calculateStudentDue(studentId);
    return res.status(201).json({
      payment,
      due: updatedDue,
      discount: newDiscount,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: 'Error creating payment/discount', error: err.message });
  }
};

/**
 * Update a specific payment (superadmin-only at route/middleware level) and/or update discount.
 * Validates new state won’t push final due below zero.
 */
export const updateStudentPayment = async (req, res) => {
  const { paymentId } = req.params;
  let { amount, date, note, discount } = req.body;

  const hasAmount = amount !== undefined && amount !== null && `${amount}` !== '';
  const parsedAmount = hasAmount ? Number(amount) : null;

  const hasDiscount = discount !== undefined && discount !== null && `${discount}` !== '';
  const parsedDiscount = hasDiscount ? Number(discount) : null;

  if (hasAmount && (isNaN(parsedAmount) || parsedAmount < 0)) {
    return res.status(400).json({ message: 'Amount must be a non-negative number.' });
  }
  if (hasDiscount && (isNaN(parsedDiscount) || parsedDiscount < 0)) {
    return res.status(400).json({ message: 'Discount must be a non-negative number.' });
  }

  const t = await sequelize.transaction();
  try {
    // Lock payment and student
    const payment = await StudentPayment.findByPk(paymentId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!payment) {
      await t.rollback();
      return res.status(404).json({ message: 'Payment not found' });
    }

    const student = await Student.findByPk(payment.studentId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // Current (committed) due before any change
    const currentDue = await calculateStudentDue(student.id);
    const oldDiscount = Number(student.discount || 0);
    const oldAmount = Number(payment.amount || 0);

    const nextAmount = parsedAmount !== null ? parsedAmount : oldAmount;
    const nextDiscount = parsedDiscount !== null ? parsedDiscount : oldDiscount;

    // newFinalDue = currentFinalDue + (oldAmount - nextAmount) + (oldDiscount - nextDiscount)
    const newFinalDue = currentDue.finalDue + (oldAmount - nextAmount) + (oldDiscount - nextDiscount);
    if (newFinalDue < 0) {
      await t.rollback();
      return res.status(400).json({
        message:
          'Final due cannot be less than zero after this update. Please check the payment amount, discount, and batch cost.',
      });
    }

    // Apply updates
    if (parsedDiscount !== null) {
      student.discount = nextDiscount;
      await student.save({ transaction: t });
    }

    if (parsedAmount !== null) payment.amount = nextAmount;
    if (date !== undefined) payment.date = date;
    if (note !== undefined) payment.note = note;
    await payment.save({ transaction: t });

    await t.commit();

    const due = await calculateStudentDue(student.id);
    return res.json({ payment, due, discount: student.discount });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: 'Error updating payment/discount', error: err.message });
  }
};
