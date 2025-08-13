import Batch from './batch.js';
import Branch from './branch.js';
import User from './user.js';
import Category from './category.js';

// Many-to-many: Batch <-> Branch
Batch.belongsToMany(Branch, { through: 'BatchBranches', foreignKey: 'batchId', otherKey: 'branchId' });
Branch.belongsToMany(Batch, { through: 'BatchBranches', foreignKey: 'branchId', otherKey: 'batchId' });

// Category and Batch association
Category.hasMany(Batch, { foreignKey: 'categoryId' });
Batch.belongsTo(Category, { foreignKey: 'categoryId' });

// Associations
User.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.belongsTo(User, { as: 'branchAdmin', foreignKey: 'branchAdminId' });
