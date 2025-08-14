import { DataTypes, Model } from 'sequelize';
import sequelize from './db.js';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Only required for admins
      references: {
        model: 'branches',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);



export default User;
