import Student from '../models/student.js';
import Batch from '../models/batch.js';
import StudentPayment from '../models/studentPayment.js';

// Helper: Calculate total due for a student
export async function calculateStudentDue(studentId) {
  const student = await Student.findByPk(studentId, { include: [Batch] });
  if (!student) return null;
  const batchCosts = student.Batches.map(batch => parseFloat(batch.cost || 0));
  const totalBatchCost = batchCosts.reduce((sum, c) => sum + c, 0);
  const payments = await StudentPayment.findAll({ where: { studentId } });
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  return totalBatchCost - totalPaid;
}

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
      const due = await calculateStudentDue(student.id);
      return { ...student.toJSON(), due };
    })
  );
  res.json(results);
};
