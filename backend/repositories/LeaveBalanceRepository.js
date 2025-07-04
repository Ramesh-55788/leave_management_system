const { AppDataSource } = require('../config/db');
const { LeaveBalance } = require('../entities/LeaveBalance');

const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

const getLeaveBalanceByUserAndYear = async (userId, year) => {
  const leaveBalances = await leaveBalanceRepo
    .createQueryBuilder('lb')
    .leftJoinAndSelect('lb.leaveType', 'lt')
    .where('lb.userId = :userId', { userId })
    .andWhere('lb.year = :year', { year })
    .andWhere('lb.isDeleted = false')
    .andWhere('lt.isDeleted = false')
    .getMany();

  return leaveBalances;
};

const updateLeaveBalance = async (id, balance, used) => {
  const leaveBalance = await leaveBalanceRepo.findOne({ where: { id, isDeleted: false } });
  if (!leaveBalance) return null;
  leaveBalance.balance = Number(balance);
  leaveBalance.used = Number(used);
  return leaveBalanceRepo.save(leaveBalance);
};

const updateLeaveBalanceByUserAndType = async (userId, leaveTypeId, year, balanceChange, usedChange) => {
  const leaveBalance = await leaveBalanceRepo.findOne({
    where: { userId, leaveTypeId, year, isDeleted: false },
  });

  if (!leaveBalance) return null;

  leaveBalance.balance += Number(balanceChange);
  leaveBalance.used += Number(usedChange);

  return leaveBalanceRepo.save(leaveBalance);
};

const createLeaveBalance = async (userId, leaveTypeId, year, balance, used = 0) => {
  const leaveBalance = leaveBalanceRepo.create({
    userId,
    leaveTypeId,
    year,
    balance,
    used,
  });
  return leaveBalanceRepo.save(leaveBalance);
};

const createOrInitLeaveBalance = async (userId, leaveTypeId, year, balance = 0) => {
  const existing = await leaveBalanceRepo.findOne({
    where: { userId, leaveTypeId, year, isDeleted: false }
  });

  if (!existing) {
    const leaveBalance = leaveBalanceRepo.create({
      userId,
      leaveTypeId,
      year,
      balance,
      used: 0
    });
    await leaveBalanceRepo.save(leaveBalance);
  }
};

module.exports = {
  getLeaveBalanceByUserAndYear,
  updateLeaveBalance,
  updateLeaveBalanceByUserAndType,
  createLeaveBalance,
  createOrInitLeaveBalance
};
