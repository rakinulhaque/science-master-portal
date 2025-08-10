import Student from '../models/student.js';
import Batch from '../models/batch.js';
import Branch from '../models/branch.js';
import sequelize from '../models/db.js';

// Create a student (admin or super admin)
export const createStudent = async (req, res) => {
  const { name, phoneNumber, schoolCollege, email, photo, gpa, coachingBranchId, batchIds } = req.body;
  if (!name || !phoneNumber || !schoolCollege) {
    return res.status(400).json({ message: 'Name, phone number, and school/college are required.' });
  }
  const t = await sequelize.transaction();
  try {
    const student = await Student.create({ name, phoneNumber, schoolCollege, email, photo, gpa, coachingBranchId }, { transaction: t });
    // Assign batches if provided
    if (Array.isArray(batchIds) && batchIds.length > 0) {
      const batches = await Batch.findAll({ where: { id: batchIds } });
      await student.setBatches(batches, { transaction: t });
    }
    await t.commit();
    res.status(201).json(student);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Edit student info (admin or super admin, except payment info)
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, schoolCollege, email, photo, gpa, coachingBranchId, batchIds } = req.body;
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(id, { transaction: t });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }
    if (name) student.name = name;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (schoolCollege) student.schoolCollege = schoolCollege;
    if (email !== undefined) student.email = email;
    if (photo !== undefined) student.photo = photo;
    if (gpa !== undefined) student.gpa = gpa;
    if (coachingBranchId !== undefined) student.coachingBranchId = coachingBranchId;
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
