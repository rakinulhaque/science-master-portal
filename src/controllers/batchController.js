import Batch from '../models/batch.js';
import Branch from '../models/branch.js';
import sequelize from '../models/db.js';


// Get all batches for a specific branch
export const getBatchesByBranch = async (req, res) => {
  const { branchId } = req.params;
  const branch = await Branch.findByPk(branchId);
  if (!branch) {
    return res.status(404).json({ message: 'Branch not found' });
  }
  const batches = await Batch.findAll({
    where: { branchId },
    include: [
      {
        model: Branch,
        attributes: ['id', 'name', 'location']
      }
    ]
  });
  res.json(batches);
};


// Create a batch (super admin only)
export const createBatch = async (req, res) => {
  const { batchCode, name, location, timing, branchId } = req.body;
  if (!name || !location || !branchId) {
    return res.status(400).json({ message: 'Batch name, location, and branchId are required.' });
  }
  // Check if branch exists
  const branch = await Branch.findByPk(branchId);
  if (!branch) {
    return res.status(404).json({ message: 'Branch not found' });
  }
  const t = await sequelize.transaction();
  try {
    const batch = await Batch.create({ batchCode, name, location, timing, branchId }, { transaction: t });
    await t.commit();
    res.status(201).json(batch);
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError' && err.errors.some(e => e.path === 'batchCode')) {
      return res.status(409).json({ message: 'Batch code already exists' });
    }
    throw err;
  }
};

// Update a batch (super admin only)
export const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { batchCode, name, location, timing, branchId } = req.body;
  const t = await sequelize.transaction();
  try {
    const batch = await Batch.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!batch) {
      await t.rollback();
      return res.status(404).json({ message: 'Batch not found' });
    }
    if (branchId !== undefined) {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        await t.rollback();
        return res.status(404).json({ message: 'Branch not found' });
      }
      batch.branchId = branchId;
    }
    if (batchCode) batch.batchCode = batchCode;
    if (name) batch.name = name;
    if (location) batch.location = location;
    if (timing !== undefined) batch.timing = timing;
    try {
      await batch.save({ transaction: t });
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError' && err.errors.some(e => e.path === 'batchCode')) {
        return res.status(409).json({ message: 'Batch code already exists' });
      }
      throw err;
    }
    await t.commit();
    res.json(batch);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Delete a batch (super admin only)
export const deleteBatch = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const batch = await Batch.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!batch) {
      await t.rollback();
      return res.status(404).json({ message: 'Batch not found' });
    }
    await batch.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Get all batches (any authenticated user)
export const getAllBatches = async (req, res) => {
  const batches = await Batch.findAll({
    include: [
      {
        model: Branch,
        attributes: ['id', 'name', 'location']
      }
    ]
  });
  res.json(batches);
};

// Get a single batch by ID (any authenticated user)
export const getBatchById = async (req, res) => {
  const { id } = req.params;
  const batch = await Batch.findByPk(id, {
    include: [
      {
        model: Branch,
        attributes: ['id', 'name', 'location']
      }
    ]
  });
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }
  res.json(batch);
};
