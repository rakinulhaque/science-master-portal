import { DataTypes, Model } from 'sequelize';
import sequelize from './db.js';
import Student from './student.js';

class StudentPayment extends Model {}

StudentPayment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  },
  {
    sequelize,
    modelName: 'StudentPayment',
    tableName: 'student_payments',
    timestamps: true,
  }
);
// Auto-increment installmentNumber per student




StudentPayment.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(StudentPayment, { foreignKey: 'studentId' });

export default StudentPayment;
