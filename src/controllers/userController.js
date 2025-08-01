import User from '../models/user.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// Only allow one super admin to be created
export const createSuperAdmin = async (req, res) => {
  const existingSuperAdmin = await User.findOne({ where: { role: 'super_admin' } });
  if (existingSuperAdmin) {
    return res.status(403).json({ message: 'Super admin already exists.' });
  }
  const { username, password, email } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = await User.create({ username, password: hashedPassword, email, role: 'super_admin' });
  res.status(201).json(user);
};

// Only super admin can create admins (enforce this in route/middleware)
export const createUser = async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = await User.create({ username, password: hashedPassword, email, role: 'admin' });
  res.status(201).json(user);
};

// Login endpoint
export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
};
