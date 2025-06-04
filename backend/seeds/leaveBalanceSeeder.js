const { AppDataSource } = require('../config/db');
const { LeaveBalance } = require('../entities/LeaveBalance');

const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);

const leaveBalances = [
    { userId: 1, leaveTypeId: 1, year: 2025, balance: 12, used: 1 },
    { userId: 1, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 1, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 1, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 1, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 1, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 1, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 2, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 2, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 2, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 2, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 2, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 2, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 2, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 3, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 3, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 3, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 3, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 3, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 3, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 3, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 4, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 4, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 4, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 4, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 4, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 4, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 4, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 5, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 5, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 5, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 5, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 5, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 5, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 5, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 6, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 6, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 6, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 6, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 6, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 6, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 6, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 7, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 7, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 7, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 7, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 7, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 7, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 7, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 8, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 8, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 8, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 8, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 8, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 8, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 8, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 9, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 9, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 9, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 9, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 9, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 9, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 9, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 10, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 10, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 10, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 10, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 10, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 10, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 10, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 15, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 15, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 15, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 15, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 15, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 15, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 15, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },

    { userId: 16, leaveTypeId: 1, year: 2025, balance: 12, used: 0 },
    { userId: 16, leaveTypeId: 2, year: 2025, balance: 10, used: 0 },
    { userId: 16, leaveTypeId: 3, year: 2025, balance: 15, used: 0 },
    { userId: 16, leaveTypeId: 4, year: 2025, balance: 20, used: 0 },
    { userId: 16, leaveTypeId: 5, year: 2025, balance: 15, used: 0 },
    { userId: 16, leaveTypeId: 9, year: 2025, balance: 25, used: 0 },
    { userId: 16, leaveTypeId: 10, year: 2025, balance: 20, used: 0 },
];

async function seedLeaveBalances() {
    for (const lb of leaveBalances) {
        await leaveBalanceRepo.save(lb);
    }
}

module.exports = seedLeaveBalances;
