const { AppDataSource } = require('../config/db');
const { LeaveType } = require('../entities/LeaveType');
const { LeaveRequest } = require('../entities/LeaveRequest');

const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

const getAllLeaveTypes = async () => {
  return leaveTypeRepo.find({
    where: { isDeleted: false },
  });
};

const getLeaveTypeById = async (id) => {
  return leaveTypeRepo.findOne({
    where: { id, isDeleted: false },
  });
};

const createLeaveType = async (name, maxPerYear, multiApprover = 1) => {
  const leaveType = leaveTypeRepo.create({ name, maxPerYear, multiApprover });
  return leaveTypeRepo.save(leaveType);
};

const updateLeaveType = async (id, name, maxPerYear, multiApprover = 1) => {
  const leaveType = await leaveTypeRepo.findOne({
    where: { id, isDeleted: false },
  });
  if (!leaveType) return null;
  leaveType.name = name;
  leaveType.maxPerYear = maxPerYear;
  leaveType.multiApprover = multiApprover;
  return leaveTypeRepo.save(leaveType);
};

const deleteLeaveType = async (id) => {
  const result = await leaveTypeRepo.update({ id, isDeleted: false }, { isDeleted: true });

  if (result.affected !== 0) {
    await AppDataSource
      .createQueryBuilder()
      .update(LeaveRequest)
      .set({ isDeleted: true })
      .where('leaveTypeId = :id', { id })
      .execute();
    return true;
  }

  return false;
};

module.exports = {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
};
