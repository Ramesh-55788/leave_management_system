const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const { LeaveType } = require('../entities/LeaveType');
const { LeaveBalance } = require('../entities/LeaveBalance');

const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
const userRepo = AppDataSource.getRepository(User);

const getAllUsers = async () => {
  return userRepo.find({
    where: { isDeleted: false },
  });
};

const createUser = async (name, email, password, role, managerId = null) => {
  const user = userRepo.create({ name, email, password, role, managerId });
  const savedUser = await userRepo.save(user);

  const leaveTypes = await leaveTypeRepo.find({
    where: { isDeleted: false },
  });

  const currentYear = new Date().getFullYear();
  const leaveBalances = leaveTypes.map((lt) => {
    return leaveBalanceRepo.create({
      userId: savedUser.id,
      leaveTypeId: lt.id,
      year: currentYear,
      balance: lt.maxPerYear,
      used: 0
    });
  });

  await leaveBalanceRepo.save(leaveBalances);

  return savedUser;
};

const softDeleteUser = async (id) => {
  const user = await userRepo.findOne({ where: { id, isDeleted: false } });
  if (!user) return false;
  user.isDeleted = true;
  await userRepo.save(user);
  return true;
};

const updateManagerForUser = async (userId, newManagerId) => {
  const user = await userRepo.findOne({ where: { id: userId, isDeleted: false } });
  if (!user) return null;
  user.managerId = newManagerId;
  return await userRepo.save(user);
};

const getUserByEmail = async (email) => {
  return userRepo.findOne({
    where: { email, isDeleted: false },
  });
};

const getUserById = async (id) => {
  return userRepo.findOne({
    where: { id, isDeleted: false },
  });
};

module.exports = {
  getAllUsers,
  createUser,
  softDeleteUser,
  updateManagerForUser,
  getUserByEmail,
  getUserById,
};
