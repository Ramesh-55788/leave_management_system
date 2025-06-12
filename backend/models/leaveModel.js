const { LeaveStatus } = require('../entities/LeaveRequest');

const repositories = {
  leaveType: require('../repositories/LeaveTypeRepository'),
  leaveRequest: require('../repositories/LeaveRequestRepository'),
  leaveBalance: require('../repositories/LeaveBalanceRepository'),
  user: require('../repositories/UserRepository')
};

const SPECIAL_LEAVE_TYPES = [6, 7];

const helpers = {
  getYear: (date) => (date instanceof Date ? date : new Date(date)).getFullYear(),
  isSpecialLeaveType: (leaveTypeId) => SPECIAL_LEAVE_TYPES.includes(leaveTypeId),

  validateEntity: async (fetchFn, id, notFoundMsg) => {
    const entity = await fetchFn(id);
    if (!entity) throw new Error(notFoundMsg);
    return entity;
  },

  getMaxApproverByRole: (role) => ({ employee: 3, manager: 2 }[role] || 1),

  getApprovalHierarchy: async (userId) => {
    const user = await helpers.validateEntity(repositories.user.getUserById, userId, 'User not found');
    const manager = user.managerId ? await repositories.user.getUserById(user.managerId) : null;
    const level2Manager = manager?.managerId ? await repositories.user.getUserById(manager.managerId) : null;

    return { user, managerId: user.managerId, level2ApproverId: manager?.managerId, level3ApproverId: level2Manager?.managerId };
  },

  updateLeaveBalance: async (userId, leaveTypeId, year, balanceChange, usedChange) => {
    await repositories.leaveBalance.updateLeaveBalanceByUserAndType(userId, leaveTypeId, year, balanceChange, usedChange);
  },

  processBalanceUpdate: async (userId, leaveTypeId, year, totalDays, isApproval = true) => {
    const multiplier = isApproval ? 1 : -1;
    const balanceChange = helpers.isSpecialLeaveType(leaveTypeId) ? 0 : -totalDays * multiplier;
    const usedChange = totalDays * multiplier;

    await helpers.updateLeaveBalance(userId, leaveTypeId, year, balanceChange, usedChange);
  }
};

const getUsersOnLeaveToday = () => repositories.leaveRequest.getUsersOnLeaveToday();
const getTeamLeave = (userIdArray, month, year) => repositories.leaveRequest.getTeamLeave(userIdArray, month, year);
const getLeaveBalance = (userId, year) => repositories.leaveBalance.getLeaveBalanceByUserAndYear(userId, year);
const getLeaveTypes = () => repositories.leaveType.getAllLeaveTypes();
const getLeaveHistory = (userId) => repositories.leaveRequest.getLeaveHistoryByUserId(userId);

const requestLeave = async (userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, totalDays) => {
  const year = helpers.getYear(startDate);
  if (!helpers.isSpecialLeaveType(leaveTypeId)) {
    const balances = await repositories.leaveBalance.getLeaveBalanceByUserAndYear(userId, year);
    const balance = balances.find(b => b.leaveTypeId === Number(leaveTypeId));
    if (!balance) throw new Error('Leave balance not found');
    if (balance.used + totalDays > balance.balance + balance.used) throw new Error('Leave limit exceeded');
  }

  const overlapping = await repositories.leaveRequest.findLeaveOverlappingDates(userId, new Date(startDate), new Date(endDate));
  if (overlapping.length) throw new Error('Leave dates overlap with existing requests');

  const { user } = await helpers.getApprovalHierarchy(userId);
  const leaveType = await repositories.leaveType.getLeaveTypeById(leaveTypeId);
  const maxApprover = helpers.getMaxApproverByRole(user.role);
  const finalLevel = totalDays >= 5 ? maxApprover : Math.min(leaveType?.multiApprover || 1, maxApprover);

  const status = leaveTypeId === 6 ? 'Approved' : (finalLevel > 1 ? LeaveStatus.PENDING_L1 : LeaveStatus.PENDING);

  return repositories.leaveRequest.createLeaveRequest(userId, leaveTypeId, new Date(startDate), new Date(endDate), isHalfDay, halfDayType, reason, status, finalLevel, totalDays);
};

const cancelLeave = async (leaveRequestId) => {
  const leaveRequest = await helpers.validateEntity(repositories.leaveRequest.getLeaveRequestById, leaveRequestId, 'Leave request not found');
  await repositories.leaveRequest.updateLeaveRequestStatus(leaveRequestId, LeaveStatus.CANCELLED);

  if (leaveRequest.status === LeaveStatus.APPROVED) {
    const year = helpers.getYear(leaveRequest.startDate);
    await helpers.processBalanceUpdate(leaveRequest.userId, leaveRequest.leaveTypeId, year, leaveRequest.totalDays, false);
  }

  return { success: true, message: 'Leave request cancelled successfully' };
};

const getIncomingRequests = async (userId) => {
  const user = await repositories.user.getUserById(userId);
  return user ? repositories.leaveRequest.getIncomingRequests(userId, user.role) : [];
};

const finalizeApproval = async (requestId, userId, leaveTypeId, totalDays, startDate) => {
  await repositories.leaveRequest.updateLeaveRequestStatus(requestId, LeaveStatus.APPROVED);
  await helpers.processBalanceUpdate(userId, leaveTypeId, helpers.getYear(startDate), totalDays, true);
  return { nextStep: 'Approved' };
};

const approveLeave = async (requestId) => {
  const leaveRequest = await helpers.validateEntity(repositories.leaveRequest.getLeaveRequestById, requestId, 'Leave request not found');
  const { userId, leaveTypeId, status, totalDays, finalApprovalLevel, startDate } = leaveRequest;

  if (totalDays == null) throw new Error('Total days not calculated');

  if (leaveTypeId === 6 && status !== LeaveStatus.APPROVED) return finalizeApproval(requestId, userId, leaveTypeId, totalDays, startDate);

  const approvalFlow = {
    [LeaveStatus.PENDING]: () => finalizeApproval(requestId, userId, leaveTypeId, totalDays, startDate),
    [LeaveStatus.PENDING_L1]: async () => {
      await repositories.leaveRequest.updateLeaveRequestStatus(requestId, LeaveStatus.PENDING_L2);
      return { nextStep: 'Approved (L2)' };
    },
    [LeaveStatus.PENDING_L2]: async () => {
      if (finalApprovalLevel === 3) {
        await repositories.leaveRequest.updateLeaveRequestStatus(requestId, LeaveStatus.PENDING_L3);
        return { nextStep: 'Approved (L3)' };
      }
      return finalizeApproval(requestId, userId, leaveTypeId, totalDays, startDate);
    },
    [LeaveStatus.PENDING_L3]: () => finalizeApproval(requestId, userId, leaveTypeId, totalDays, startDate)
  };

  return approvalFlow[status] ? approvalFlow[status]() : { message: 'Leave already processed' };
};

const rejectLeave = async (requestId) => {
  await helpers.validateEntity(repositories.leaveRequest.getLeaveRequestById, requestId, 'Leave request not found');
  await repositories.leaveRequest.updateLeaveRequestStatus(requestId, LeaveStatus.REJECTED);
  return { success: true, message: 'Leave request rejected successfully' };
};

const addLeaveType = async (name, maxPerYear, multiApprover = 1) => {
  const leaveType = await repositories.leaveType.createLeaveType(name, maxPerYear, multiApprover);
  const users = await repositories.user.getAllUsers();
  const year = new Date().getFullYear();

  await Promise.all(users.map(user => repositories.leaveBalance.createOrInitLeaveBalance(user.id, leaveType.id, year, maxPerYear)));
  return leaveType;
};

const updateLeaveType = (id, name, maxPerYear, multiApprover = 1) => repositories.leaveType.updateLeaveType(id, name, maxPerYear, multiApprover);
const deleteLeaveType = (id) => repositories.leaveType.deleteLeaveType(id);

module.exports = {
  getUsersOnLeaveToday, getLeaveTypes, requestLeave, getLeaveHistory, cancelLeave, getIncomingRequests, approveLeave,
  getTeamLeave, getLeaveBalance, rejectLeave, addLeaveType, updateLeaveType, deleteLeaveType
};