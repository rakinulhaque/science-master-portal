// Update a branch (super admin only)

import sequelize from '../models/db.js';
import User from '../models/user.js';

export const updateBranch = async (req, res) => {
  const { id } = req.params;
  const { name, location, branchAdminId } = req.body;
  const t = await sequelize.transaction();
  try {
    const branch = await Branch.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!branch) {
      await t.rollback();
      return res.status(404).json({ message: 'Branch not found' });
    }
    const exists = await Branch.findOne({ where: { name } });
    if (exists) {
      return res.status(409).json({ message: 'Branch name already exists' });
    }
    if (name) branch.name = name;
    if (location !== undefined) branch.location = location;
    if (branchAdminId !== undefined) {
      if (branchAdminId !== null) {
        const user = await User.findByPk(branchAdminId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!user) {
          await t.rollback();
          return res.status(404).json({ message: 'Branch admin user not found' });
        }
        branch.branchAdminId = branchAdminId;
        user.branchId = branch.id;
        await user.save({ transaction: t });
      } else {
        branch.branchAdminId = null;
      }
    }
    await branch.save({ transaction: t });
    await t.commit();
    res.json(branch);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Delete a branch (super admin only)
export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const branch = await Branch.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!branch) {
      await t.rollback();
      return res.status(404).json({ message: 'Branch not found' });
    }
    await branch.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
import Branch from '../models/branch.js';

// Only super admin can create branches
export const createBranch = async (req, res) => {
  const { name, location, branchAdminId } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Branch name is required' });
  }
  const exists = await Branch.findOne({ where: { name } });
  if (exists) {
    return res.status(409).json({ message: 'Branch name already exists' });
  }
  const t = await sequelize.transaction();
  try {
    let user = null;
    if (branchAdminId) {
      user = await User.findByPk(branchAdminId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: 'Branch admin user not found' });
      }
    }
    const branch = await Branch.create({ name, location, branchAdminId }, { transaction: t });
    // If branchAdminId is provided and user exists, update the user's branchId
    if (user) {
      user.branchId = branch.id;
      await user.save({ transaction: t });
    }
    await t.commit();
    res.status(201).json(branch);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Get all branches with branch admin details
export const getAllBranches = async (req, res) => {
  const branches = await Branch.findAll({
    include: [
      {
        model: User,
        as: 'branchAdmin',
        attributes: ['id', 'fullName', 'email', 'mobile']
      }
    ]
  });
  res.json(branches);
};

// Get a single branch by ID with branch admin details
export const getBranchById = async (req, res) => {
  const { id } = req.params;
  const branch = await Branch.findByPk(id, {
    include: [
      {
        model: User,
        as: 'branchAdmin',
        attributes: ['id', 'fullName', 'email', 'mobile']
      }
    ]
  });
  if (!branch) {
    return res.status(404).json({ message: 'Branch not found' });
  }
  res.json(branch);
};
