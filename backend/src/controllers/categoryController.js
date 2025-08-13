import Category from '../models/category.js';
import Batch from '../models/batch.js';

// Create a new category
export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  try {
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    throw err;
  }
};

// Get all categories (optionally with batches)
export const getAllCategories = async (req, res) => {
  const includeBatches = req.query.withBatches === 'true';
  const categories = await Category.findAll({
    include: includeBatches ? [{ model: Batch }] : [],
  });
  res.json(categories);
};

// Get a single category by ID (optionally with batches)
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const includeBatches = req.query.withBatches === 'true';
  const category = await Category.findByPk(id, {
    include: includeBatches ? [{ model: Batch }] : [],
  });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
};

// Update a category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  if (name) {
    // Check for duplicate name
    const existing = await Category.findOne({ where: { name } });
    if (existing && existing.id !== category.id) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    category.name = name;
  }
  await category.save();
  res.json(category);
};

// Delete a category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  await category.destroy();
  res.json({ message: 'Category deleted successfully' });
};
