import { DataTypes, Model } from 'sequelize';
import sequelize from './db.js';
import Batch from './batch.js';
import Branch from './branch.js';


class Student extends Model {}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gpa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    coachingBranchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
  }
);


// Many-to-many: Student <-> Batch
Student.belongsToMany(Batch, { through: 'StudentBatches', foreignKey: 'studentId', otherKey: 'batchId' });
Batch.belongsToMany(Student, { through: 'StudentBatches', foreignKey: 'batchId', otherKey: 'studentId' });

// Student belongs to a coaching branch
Student.belongsTo(Branch, { foreignKey: 'coachingBranchId' });

export default Student;
