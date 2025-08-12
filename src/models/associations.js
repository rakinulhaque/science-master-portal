import User from './user.js';
import Branch from './branch.js';

// Associations
User.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.belongsTo(User, { as: 'branchAdmin', foreignKey: 'branchAdminId' });
