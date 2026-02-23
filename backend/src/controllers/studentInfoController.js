import Student from '../models/student.js';
import Batch from '../models/batch.js';
import Branch from '../models/branch.js';
import StudentPayment from '../models/studentPayment.js';
import sequelize from '../models/db.js';

// Create a student (admin or super admin) with atomic initial payment
export const createStudent = async (req, res) => {
  const {
    name, phoneNumber, institution, email, photo, gpa,
    coachingBranchId, batchIds, discount,
    initialPaymentAmount, paymentDate, paymentNote
  } = req.body;

  if (!name || !phoneNumber || !institution) {
    return res.status(400).json({ message: 'Name, phone number, and institution are required.' });
  }

  const t = await sequelize.transaction();
  try {
    const student = await Student.create({
      name, phoneNumber, institution, email, photo, gpa, coachingBranchId,
      discount: discount || 0
    }, { transaction: t });

    // Assign batches if provided
    if (Array.isArray(batchIds) && batchIds.length > 0) {
      const batches = await Batch.findAll({ where: { id: batchIds }, transaction: t });
      await student.setBatches(batches, { transaction: t });
    }

    // Atomic initial payment
    let payment = null;
    if (initialPaymentAmount && !isNaN(initialPaymentAmount) && parseFloat(initialPaymentAmount) > 0) {
      payment = await StudentPayment.create({
        studentId: student.id,
        amount: parseFloat(initialPaymentAmount),
        date: paymentDate || new Date(),
        note: paymentNote || 'Initial payment',
        installmentNumber: 1
      }, { transaction: t });
    }

    await t.commit();

    // Refresh student to include associated data if needed, or just return basic info
    res.status(201).json({ ...student.toJSON(), initialPayment: payment });
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'A student with this phone number already exists.' });
    }
    throw err;
  }
};

// Delete a student (admin or super admin)
export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(id, { transaction: t });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete all payments associated with the student
    await StudentPayment.destroy({
      where: { studentId: id },
      transaction: t,
    });

    // Remove student from batches
    await student.setBatches([], { transaction: t });

    // Delete the student
    await student.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
};

// Edit student info (admin or super admin, except payment info)
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, institution, email, photo, gpa, coachingBranchId, batchIds, discount } = req.body;
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(id, { transaction: t });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }
    if (name) student.name = name;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (institution) student.institution = institution;
    if (email !== undefined) student.email = email;
    if (photo !== undefined) student.photo = photo;
    if (gpa !== undefined) student.gpa = gpa;
    if (coachingBranchId !== undefined) student.coachingBranchId = coachingBranchId;
    if (discount !== undefined) {
      if (isNaN(discount)) {
        await t.rollback();
        return res.status(400).json({ message: 'Discount must be a number if provided.' });
      }
      student.discount = discount;
    }
    await student.save({ transaction: t });
    // Update batches if provided
    if (Array.isArray(batchIds)) {
      const batches = await Batch.findAll({ where: { id: batchIds } });
      await student.setBatches(batches, { transaction: t });
    }
    await t.commit();
    res.json(student);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
