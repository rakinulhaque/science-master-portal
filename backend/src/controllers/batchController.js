import Batch from '../models/batch.js';
import Branch from '../models/branch.js';
import Category from '../models/category.js';
import sequelize from '../models/db.js';


// Create a batch (super admin only, supports multiple branches)
export const createBatch = async (req, res) => {
  const { batchCode, name, branchIds, cost, categoryId } = req.body;
  if (!name || !Array.isArray(branchIds) || branchIds.length === 0 || !categoryId || cost === undefined) {
    return res.status(400).json({ message: 'Batch name, branchIds (array), categoryId, and cost are required.' });
  }
  // Check if all branches exist
  const branches = await Branch.findAll({ where: { id: branchIds } });
  if (branches.length !== branchIds.length) {
    return res.status(404).json({ message: 'One or more branches not found' });
  }
  // Check for unique batch name
  const existingBatch = await Batch.findOne({ where: { name } });
  if (existingBatch) {
    return res.status(409).json({ message: 'Batch name already exists' });
  }
  // Check if category exists
  const category = await Category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  const t = await sequelize.transaction();
  try {
    const batch = await Batch.create({ batchCode, name, cost, categoryId }, { transaction: t });
    await batch.setBranches(branchIds, { transaction: t });
    await t.commit();
    // Return batch with branches
    const batchWithBranches = await Batch.findByPk(batch.id, {
      include: [
        { model: Branch, attributes: ['id', 'name', 'location'] },
        { model: Category, attributes: ['id', 'name'] }
      ]
    });
    res.status(201).json(batchWithBranches);
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError' && err.errors.some(e => e.path === 'batchCode')) {
      return res.status(409).json({ message: 'Batch code already exists' });
    }
    throw err;
  }
};

// Update a batch (super admin only, supports multiple branches)
export const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { batchCode, name, branchIds, cost, categoryId } = req.body;
  const t = await sequelize.transaction();
  try {
    const batch = await Batch.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
    if (!batch) {
      await t.rollback();
      return res.status(404).json({ message: 'Batch not found' });
    }
    if (Array.isArray(branchIds)) {
      const branches = await Branch.findAll({ where: { id: branchIds } });
      if (branches.length !== branchIds.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more branches not found' });
      }
      await batch.setBranches(branchIds, { transaction: t });
    }
    // Check for unique batch name (if changed)
    if (name && name !== batch.name) {
      const existingBatch = await Batch.findOne({ where: { name } });
      if (existingBatch) {
        await t.rollback();
        return res.status(409).json({ message: 'Batch name already exists' });
      }
      batch.name = name;
    }
    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        await t.rollback();
        return res.status(404).json({ message: 'Category not found' });
      }
      batch.categoryId = categoryId;
    }
    if (batchCode) batch.batchCode = batchCode;
    if (cost !== undefined) batch.cost = cost;
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
    // Return batch with branches
    const batchWithBranches = await Batch.findByPk(batch.id, {
      include: [
        { model: Branch, attributes: ['id', 'name', 'location'] },
        { model: Category, attributes: ['id', 'name'] }
      ]
    });
    res.json(batchWithBranches);
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
  const { categoryId, branchId, search } = req.query;
  const { Op } = await import('sequelize');
  const where = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (search) {
    where[Op.or] = [
      { batchCode: { [Op.iLike]: `%${search}%` } },
      { name: { [Op.iLike]: `%${search}%` } }
    ];
  }
  const include = [
    {
      model: Branch,
      attributes: ['id', 'name', 'location'],
      ...(branchId ? { where: { id: branchId } } : {})
    },
    {
      model: Category,
      attributes: ['id', 'name']
    }
  ];
  const batches = await Batch.findAll({
    where,
    include
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
      },
      {
        model: Category,
        attributes: ['id', 'name']
      }
    ]
  });
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }
  res.json(batch);
};
