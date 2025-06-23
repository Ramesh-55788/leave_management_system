const leaveModel = require('../models/leaveModel');

const asyncHandler = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

const parseId = (value) => parseInt(value);

// Fetch users on leave today
const fetchUsersOnLeaveToday = asyncHandler(async (req, res) => {
  const users = await leaveModel.getUsersOnLeaveToday();
  if (users.length === 0) return res.status(204).json({ message: 'No users are on leave today.' });
  res.json({ count: users.length, users });
});

// Fetch team leave
const fetchTeamLeave = asyncHandler(async (req, res) => {
  const { teamMembers, month, year } = req.query;
  if (!teamMembers || !month || !year) return res.status(400).json({ error: 'Missing teamMembers, month, or year' });

  const userIdArray = teamMembers.split(',').map((id) => parseId(id.trim()));
  const leaveRequests = await leaveModel.getTeamLeave(userIdArray, month, year);

  res.json({ leaveRequests });
});

// Fetch leave balance
const fetchLeaveBalance = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId);
  const currentYear = new Date().getFullYear();
  const balance = await leaveModel.getLeaveBalance(userId, currentYear);

  if (balance.length === 0) return res.status(404).json({ error: 'No leave balance found for the current year.' });

  let totalBalance = 0, totalLeaves = 0;

  const leaveDetails = balance.map(({ leaveTypeId, balance, used, leaveType }) => {
    const isSpecial = leaveTypeId === 9 || leaveTypeId === 10;
    const total = balance + used;

    if (!isSpecial) {
      totalBalance += balance;
      totalLeaves += total;
    }

    return { leave_type: leaveType.name, total, balance, used };
  });

  res.json({ totalBalance, totalLeaves, leaveDetails });
});

// Fetch leave types
const fetchLeaveTypes = asyncHandler(async (req, res) => {
  const leaveTypes = await leaveModel.getLeaveTypes();
  if (!leaveTypes.length) return res.status(404).json({ error: 'No leave types found.' });
  res.json(leaveTypes);
});

// Request leave
const requestLeaveHandler = asyncHandler(async (req, res) => {
  const { leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, totalDays } = req.body;
  const userId = req.user.id;

  const result = await leaveModel.requestLeave(userId, leaveTypeId, startDate, endDate, isHalfDay, halfDayType, reason, totalDays);

  res.status(201).json({ message: 'Leave requested successfully', insertId: result.insertId });
});

// Get leave history
const getLeaveHistoryHandler = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId);
  const leaveHistory = await leaveModel.getLeaveHistory(userId);
  res.json({ leaveHistory });
});

// Cancel leave request
const cancelLeaveHandler = asyncHandler(async (req, res) => {
  const leaveRequestId = parseId(req.params.leaveRequestId);
  await leaveModel.cancelLeave(leaveRequestId);
  res.json({ message: 'Leave canceled successfully' });
});

// Get incoming leave requests
const getIncomingRequestsHandler = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId);
  const requests = await leaveModel.getIncomingRequests(userId);
  res.json({ incomingRequests: requests });
});

// Approve leave request
const approveLeaveHandler = asyncHandler(async (req, res) => {
  const requestId = parseId(req.params.approveId);
  const result = await leaveModel.approveLeave(requestId);
  res.json({ message: 'Leave approval processed', result });
});

// Reject leave request
const rejectLeaveHandler = asyncHandler(async (req, res) => {
  const rejectId = parseId(req.params.rejectId);
  const result = await leaveModel.rejectLeave(rejectId);
  res.json({ message: 'Leave rejected', result });
});

// Create, Update, Delete leave type 
const createLeaveHandler = asyncHandler(async (req, res) => {
  const { name, maxPerYear, multiApprover } = req.body;
  const result = await leaveModel.addLeaveType(name, maxPerYear, multiApprover);
  res.json({ message: 'Leave type added successfully', result });
});

const updateLeaveHandler = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { name, maxPerYear, multiApprover } = req.body;
  const result = await leaveModel.updateLeaveType(id, name, maxPerYear, multiApprover);
  res.json({ message: 'Leave type updated successfully', result });
});

const deleteLeaveHandler = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const result = await leaveModel.deleteLeaveType(id);
  res.json({ message: 'Leave type deleted successfully', result });
});

module.exports = {
  fetchUsersOnLeaveToday, fetchTeamLeave, fetchLeaveBalance, fetchLeaveTypes, requestLeaveHandler, getLeaveHistoryHandler, cancelLeaveHandler,
  getIncomingRequestsHandler, approveLeaveHandler, rejectLeaveHandler, createLeaveHandler, updateLeaveHandler, deleteLeaveHandler
};
