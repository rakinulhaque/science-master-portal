import StudentPayment from '../models/studentPayment.js';
import Student from '../models/student.js';
import { Op } from 'sequelize';

// List all payments (super admin only, with search by student name or mobile)
export const getAllPayments = async (req, res) => {
  const { search } = req.query;
  let studentWhere = undefined;
  if (search) {
    studentWhere = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } }
      ]
    };
  }
  const payments = await StudentPayment.findAll({
    include: [
      {
        model: Student,
        attributes: ['id', 'name', 'phoneNumber'],
        ...(studentWhere ? { where: studentWhere } : {})
      }
    ],
    order: [['date', 'DESC']]
  });
  res.json(payments);
};
