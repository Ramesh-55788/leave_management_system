const { AppDataSource } = require('../config/db');
const { LeaveRequest, LeaveStatus } = require('../entities/LeaveRequest');

const leaveRequestRepo = AppDataSource.getRepository(LeaveRequest);

// Get users on leave for the current day
const getUsersOnLeaveToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await leaveRequestRepo
    .createQueryBuilder('lr')
    .select([
      'u.id AS userId',
      'u.name AS userName',
      'u.email AS userEmail',
      'lr.startDate AS leaveStartDate',
      'lr.endDate AS leaveEndDate',
      'lt.name AS leaveTypeName'
    ])
    .innerJoin('lr.user', 'u')
    .innerJoin('lr.leaveType', 'lt')
    .where('lr.status = :status', { status: LeaveStatus.APPROVED })
    .andWhere(':today BETWEEN lr.startDate AND lr.endDate', { today })
    .getRawMany();

  return result.map(row => ({
    id: row.userId,
    name: row.userName,
    email: row.userEmail,
    startDate: row.leaveStartDate,
    endDate: row.leaveEndDate,
    leaveType: row.leaveTypeName
  }));
};

// Get team leave requests for a specific month and year
const getTeamLeave = async (userIds, month, year, role) => {
  const query = leaveRequestRepo
    .createQueryBuilder('lr')
    .leftJoin('lr.leaveType', 'lt')
    .select([
      'lr.id',
      'lr.userId',
      'lr.leaveTypeId',
      'lr.startDate',
      'lr.endDate',
      'lr.reason',
      'lr.status',
      'lt.name AS leaveTypeName'
    ])
    .andWhere('MONTH(lr.startDate) = :month', { month })
    .andWhere('YEAR(lr.startDate) = :year', { year })
    .andWhere('lr.status = :status', { status: LeaveStatus.APPROVED });

  if (role !== 'admin') {
    query.andWhere('lr.userId IN (:...userIds)', { userIds });
  }

  return await query.getRawMany();
};

// Get leave history by user ID
const getLeaveHistoryByUserId = async (userId) => {
  const leaveRequests = await leaveRequestRepo.find({
    where: { userId },
    relations: ['leaveType', 'user', 'user.manager'],
    order: { createdAt: 'DESC' }
  });
// console.log(leaveRequests);
  return leaveRequests.map(request => ({
    id: request.id,
    leave_type: request.leaveType.name,
    start_date: request.startDate,
    end_date: request.endDate,
    reason: request.reason,
    status: request.status,
    manager_name: request.user.manager?.name || null,
    total_days: request.totalDays,
    created_at: request.createdAt,
    updated_at:request.statusUpdatedAt
  }));
};

// Check for overlapping leave requests for a user
const findLeaveOverlappingDates = async (userId, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const overlappingLeaves = await leaveRequestRepo
    .createQueryBuilder('lr')
    .where('lr.userId = :userId', { userId })
    .andWhere('lr.status IN (:...statuses)', {
      statuses: [
        LeaveStatus.PENDING,
        LeaveStatus.PENDING_L1,
        LeaveStatus.PENDING_L2,
        LeaveStatus.APPROVED,
      ],
    })
    .andWhere('DATE(lr.startDate) <= DATE(:end)', { end })
    .andWhere('DATE(lr.endDate) >= DATE(:start)', { start })
    .getMany();

  return overlappingLeaves;
};

// Create a new leave request
const createLeaveRequest = async (
  userId,
  leaveTypeId,
  startDate,
  endDate,
  isHalfDay,
  halfDayType,
  reason,
  status,
  finalApprovalLevel,
  totalDays,
  level2ApproverId = null,
  level3ApproverId = null
) => {
  const leaveRequest = leaveRequestRepo.create({
    userId,
    leaveTypeId,
    startDate,
    endDate,
    isHalfDay,
    halfDayType,
    reason,
    status,
    approvalLevel: finalApprovalLevel,
    totalDays,
    level2ApproverId,
    level3ApproverId,
  });

  const savedRequest = await leaveRequestRepo.save(leaveRequest);
  return { insertId: savedRequest.id };
};

// Get leave request by ID
const getLeaveRequestById = async (id) =>
  leaveRequestRepo.findOne({ where: { id }, relations: ['user', 'leaveType'] });

// Update leave request status
const updateLeaveRequestStatus = async (id, status) => {
  const leaveRequest = await leaveRequestRepo.findOne({ where: { id } });
  if (!leaveRequest) return null;
  leaveRequest.status = status;
  leaveRequest.statusUpdatedAt = new Date();
  return leaveRequestRepo.save(leaveRequest);
};

// Get incoming leave requests based on user role
const getIncomingRequests = async (userId, userRole) => {
  let query = leaveRequestRepo.createQueryBuilder('lr')
    .leftJoinAndSelect('lr.user', 'u')
    .leftJoinAndSelect('lr.leaveType', 'lt')
    .leftJoinAndSelect('u.manager', 'mgr');

  if (userRole === 'admin') {
    query = query
      .leftJoinAndSelect('mgr.manager', 'hr')
      .where('(lr.status = :pending AND u.role = :hrRole)', { pending: LeaveStatus.PENDING, hrRole: 'hr' })
      .orWhere('(lr.status = :pendingL3 AND hr.managerId = :userId)', { pendingL3: LeaveStatus.PENDING_L3, userId })
      .orWhere('(lr.status = :pendingL2 AND mgr.managerId = :userId)', { pendingL2: LeaveStatus.PENDING_L2, userId });
  } else if (userRole === 'hr') {
    query = query
      .where('(lr.status = :pending AND u.managerId = :userId)', { pending: LeaveStatus.PENDING, userId })
      .orWhere('(lr.status = :pendingL1 AND u.managerId = :userId)', { pendingL1: LeaveStatus.PENDING_L1, userId })
      .orWhere('(lr.status = :pendingL2 AND mgr.managerId = :userId)', { pendingL2: LeaveStatus.PENDING_L2, userId });
  } else if (userRole === 'manager') {
    query = query
      .where('(lr.status = :pending AND u.managerId = :userId)', { pending: LeaveStatus.PENDING, userId })
      .orWhere('(lr.status = :pendingL1 AND u.managerId = :userId)', { pendingL1: LeaveStatus.PENDING_L1, userId });
  }

  const results = await query.getMany();
  return results.map(request => ({
    ...request,
    employee_name: request.user.name,
    leave_type: request.leaveType.name,
    start_date: request.startDate,
    end_date: request.endDate
  }));
};

module.exports = {
  getUsersOnLeaveToday,
  getTeamLeave,
  getLeaveHistoryByUserId,
  findLeaveOverlappingDates,
  createLeaveRequest,
  getLeaveRequestById,
  updateLeaveRequestStatus,
  getIncomingRequests
};
