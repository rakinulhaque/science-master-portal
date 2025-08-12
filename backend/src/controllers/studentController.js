import Student from '../models/student.js';
import Batch from '../models/batch.js';
import StudentPayment from '../models/studentPayment.js';
import sequelize from '../models/db.js';

// Helper: Calculate total due for a student
async function calculateStudentDue(studentId) {
  // Get all batches for the student
  const student = await Student.findByPk(studentId, { include: [Batch] });
  if (!student) return null;
  const batchCosts = student.Batches.map(batch => parseFloat(batch.cost || 0));
  const totalBatchCost = batchCosts.reduce((sum, c) => sum + c, 0);
  // Get all payments
  const payments = await StudentPayment.findAll({ where: { studentId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  return totalBatchCost - totalPaid;
}

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
    const due = await calculateStudentDue(studentId);
    res.status(201).json({ payment, due });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Get student with due calculation
export const getStudentWithDue = async (req, res) => {
  const { id } = req.params;
  const student = await Student.findByPk(id, {
    include: [
      {
        model: Batch,
        through: { attributes: [] },
      },
      {
        model: StudentPayment,
        attributes: ['id', 'amount', 'date', 'note', 'installmentNumber'],
      },
    ],
  });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  const due = await calculateStudentDue(id);
  res.json({ ...student.toJSON(), due });
};
