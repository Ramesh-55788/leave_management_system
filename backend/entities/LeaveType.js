const { EntitySchema } = require("typeorm");

const LeaveType = new EntitySchema({
  name: "LeaveType",
  tableName: "leave_types",
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    name: {
      type: String,
    },
    maxPerYear: {
      name: "max_per_year",
      type: Number,
    },
    multiApprover: {
      name: "multi_approver",
      type: Number,
      default: 1,
    },
    isDeleted: {
      name: "is_deleted",
      type: Boolean,
      default: false,
    },
  },
  relations: {
    leaveRequests: {
      type: "one-to-many",
      target: "LeaveRequest",
      inverseSide: "leaveType",
    },
    leaveBalances: {
      type: "one-to-many",
      target: "LeaveBalance",
      inverseSide: "leaveType",
    },
  },
});

module.exports = { LeaveType };
