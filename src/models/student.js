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
    schoolCollege: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true, // Drive link, optional
    },
    gpa: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for later
    },
    // batchId removed for many-to-many
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
    coachingBatch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentInfo: {
      type: DataTypes.JSONB,
      allowNull: true, // Structure can be defined later
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
