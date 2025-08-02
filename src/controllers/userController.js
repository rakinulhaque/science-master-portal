// Update an admin (super admin only)
import sequelize from '../models/db.js';
import Branch from '../models/branch.js';

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, email, mobile, password, branchId } = req.body;
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!user || user.role !== 'admin') {
      await t.rollback();
      return res.status(404).json({ message: 'Admin not found' });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
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
    res.json(user);
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

export const getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// Only allow one super admin to be created
export const createSuperAdmin = async (req, res) => {
  const existingSuperAdmin = await User.findOne({ where: { role: 'super_admin' } });
  if (existingSuperAdmin) {
    return res.status(403).json({ message: 'Super admin already exists.' });
  }
  const { username, password, email } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = await User.create({ username, password: hashedPassword, email, role: 'super_admin' });
  res.status(201).json(user);
};

// Only super admin can create admins (enforce this in route/middleware)
export const createUser = async (req, res) => {
  const { username, password, email, mobile, branchId } = req.body;
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
    const user = await User.create({ username, password: hashedPassword, email, role: 'admin', mobile, branchId }, { transaction: t });
    // If branchId is provided and branch exists, set this user as the branch admin for the branch
    if (branch) {
      branch.branchAdminId = user.id;
      await branch.save({ transaction: t });
    }
    await t.commit();
    res.status(201).json(user);
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      if (err.errors.some(e => e.path === 'email')) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      if (err.errors.some(e => e.path === 'username')) {
        return res.status(409).json({ message: 'Username already exists' });
      }
    }
    throw err;
  }
};

// Login endpoint
export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
};
