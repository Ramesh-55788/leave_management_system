const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const parseExcelToJson = require('../utils/excelParser');
const Queue = require('bull');
const {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
  softDeleteUser,
  updateManagerForUser
} = require('../repositories/UserRepository');

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

const userQueue = new Queue('userQueue', { redis: { port: 6380, host: '127.0.0.1' } });

const register = async (req, res) => {
  try {
    const { name, email, password, role, reportingManagerId } = req.body;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(name, email, hashedPassword, role, reportingManagerId);
    res.status(201).json({ message: 'User Added successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', user, token });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }
    res.json({ count: users.length, users });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const deleted = await softDeleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const updateUserManager = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newManagerId } = req.body;
    const updated = await updateManagerForUser(userId, newManagerId);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Manager reassigned successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to update manager' });
  }
};

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const CHUNK_SIZE = 100;

const uploadBulkUsers = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const rawUsers = parseExcelToJson(file.buffer);
    const users = await Promise.all(
      rawUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    const userChunks = chunkArray(users, CHUNK_SIZE);
    for (const chunk of userChunks) {
      await userQueue.add({ users: chunk });
    }
    res.status(200).json({ message: 'Users Added' });
  } catch {
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
};

module.exports = {
  register,
  login,
  fetchAllUsers,
  updateUserManager,
  deleteUserController,
  uploadBulkUsers
};
