// Update an admin (super admin only)
import sequelize from '../models/db.js';
import Branch from '../models/branch.js';

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { email, mobile, password, branchId, fullName } = req.body;
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!user || user.role !== 'admin') {
      await t.rollback();
      return res.status(404).json({ message: 'Admin not found' });
    }
    // username removed
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (!fullName) {
      await t.rollback();
      return res.status(400).json({ message: 'Full name is required' });
    }
    user.fullName = fullName;
    if (branchId !== undefined) {
      if (branchId !== null) {
        const branch = await Branch.findByPk(branchId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!branch) {
          await t.rollback();
          return res.status(404).json({ message: 'Branch not found' });
        }
        user.branchId = branchId;
        branch.branchAdminId = user.id;
        await branch.save({ transaction: t });
      } else {
        user.branchId = null;
      }
    }
    if (password) user.password = await hashPassword(password);
    await user.save({ transaction: t });
    await t.commit();
    // Exclude sensitive fields from response
    const { password: _pw, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Delete an admin (super admin only)
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!user || user.role !== 'admin') {
      await t.rollback();
      return res.status(404).json({ message: 'Admin not found' });
    }
    await user.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
import User from '../models/user.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

import { Op } from 'sequelize';

export const getAllUsers = async (req, res) => {
  const { search } = req.query;
  let where = {};
  if (search) {
    where = {
      [Op.or]: [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } }
      ]
    };
  }
  const users = await User.findAll({ where });
  // Exclude sensitive fields from all users
  const safeUsers = users.map(u => {
    const { password: _pw, ...safeUser } = u.toJSON();
    return safeUser;
  });
  res.json(safeUsers);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password: _pw, ...safeUser } = user.toJSON();
  res.json(safeUser);
};

// Only allow one super admin to be created
export const createSuperAdmin = async (req, res) => {
  const existingSuperAdmin = await User.findOne({ where: { role: 'super_admin' } });
  if (existingSuperAdmin) {
    return res.status(403).json({ message: 'Super admin already exists.' });
  }
  const { password, email, fullName, mobile } = req.body;
  if (!fullName) {
    return res.status(400).json({ message: 'Full name is required' });
  }
  if (!mobile) {
    return res.status(400).json({ message: 'Mobile is required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  const hashedPassword = await hashPassword(password);
  const user = await User.create({ password: hashedPassword, email, fullName, role: 'super_admin', mobile });
  // Exclude sensitive fields from response
  const { password: _pw, ...safeUser } = user.toJSON();
  res.status(201).json(safeUser);
};

// Only super admin can create admins (enforce this in route/middleware)
export const createUser = async (req, res) => {
  const { password, email, mobile, branchId, fullName } = req.body;
  if (!fullName || !email || !password || !mobile) {
    return res.status(400).json({ message: 'Full name, email, mobile, and password are required' });
  }
  const t = await sequelize.transaction();
  try {
    let branch = null;
    if (branchId) {
      branch = await Branch.findByPk(branchId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!branch) {
        await t.rollback();
        return res.status(404).json({ message: 'Branch not found' });
      }
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({ password: hashedPassword, email, fullName, role: 'admin', mobile, branchId }, { transaction: t });
    // If branchId is provided and branch exists, set this user as the branch admin for the branch
    if (branch) {
      branch.branchAdminId = user.id;
      await branch.save({ transaction: t });
    }
    await t.commit();
    // Exclude sensitive fields from response
    const { password: _pw, ...safeUser } = user.toJSON();
    res.status(201).json(safeUser);
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      if (err.errors.some(e => e.path === 'email')) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      if (err.errors.some(e => e.path === 'mobile')) {
        return res.status(409).json({ message: 'Mobile already exists' });
      }
    }
    throw err;
  }
};

// Login endpoint (now uses mobile instead of username)
export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const user = await User.findOne({ where: { mobile: phoneNumber } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  // Exclude sensitive fields from response
  const { password: _pw, ...safeUser } = user.toJSON();
  res.json({ token, user: safeUser });
};
