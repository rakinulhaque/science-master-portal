import Student from '../models/student.js';
import Batch from '../models/batch.js';
import StudentPayment from '../models/studentPayment.js';

// Helper: Calculate total due for a student
export async function calculateStudentDue(studentId) {
  const student = await Student.findByPk(studentId, { include: [Batch] });
  if (!student) return null;
  const batchCosts = student.Batches.map(batch => parseFloat(batch.cost || 0));
  const totalBatchCost = batchCosts.reduce((sum, c) => sum + c, 0);
  const discount = parseFloat(student.discount || 0);
  const payments = await StudentPayment.findAll({ where: { studentId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  return {
    initialDue: totalBatchCost,
    discount,
    totalPaid,
    finalDue: totalBatchCost - discount - totalPaid
  };
}

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
  const dueDetails = await calculateStudentDue(id);
  // Validation for negative finalDue is now handled in addStudentPayment
  res.json({ ...student.toJSON(), ...dueDetails });
};

// Get all students with real-time due calculation
export const getAllStudentsWithDue = async (req, res) => {
  const students = await Student.findAll({
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
  // Calculate due for each student
  const results = await Promise.all(
    students.map(async (student) => {
      const dueDetails = await calculateStudentDue(student.id);
      // Validation for negative finalDue is now handled in addStudentPayment
      return { ...student.toJSON(), ...dueDetails };
    })
  );
  res.json(results);
};
