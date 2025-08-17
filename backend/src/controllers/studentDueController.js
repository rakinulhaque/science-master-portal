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
import { Op } from 'sequelize';

export const getAllStudentsWithDue = async (req, res) => {
  const { search, institution, batchId, branchId, page = 1, limit = 15 } = req.query;
  
  // Parse pagination parameters
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const offset = (pageNumber - 1) * pageSize;
  
  let where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { phoneNumber: { [Op.iLike]: `%${search}%` } },
      { institution: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (institution) {
    where.institution = { [Op.iLike]: `%${institution}%` };
  }
  if (branchId) {
    where.coachingBranchId = branchId;
  }
  
  const include = [
    {
      model: Batch,
      through: { attributes: [] },
      ...(batchId ? { where: { id: batchId } } : {})
    },
    {
      model: StudentPayment,
      attributes: ['id', 'amount', 'date', 'note', 'installmentNumber'],
    },
  ];
  
  try {
    // Get total count for pagination
    const totalCount = await Student.count({
      where,
      include: batchId ? [{ model: Batch, through: { attributes: [] }, where: { id: batchId } }] : []
    });
    
    // Get paginated students
    const students = await Student.findAll({
      where,
      include,
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']] // Order by creation date, newest first
    });
    
    // Calculate due for each student
    const results = await Promise.all(
      students.map(async (student) => {
        const dueDetails = await calculateStudentDue(student.id);
        return { ...student.toJSON(), ...dueDetails };
      })
    );
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;
    
    res.json({
      data: results,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        pageSize,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching students with pagination:', error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};
