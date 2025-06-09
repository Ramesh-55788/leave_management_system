const { AppDataSource } = require('../config/db');
const { User } = require('../entities/User');
const userRepo = AppDataSource.getRepository(User);
const { LeaveType } = require('../entities/LeaveType');
const { LeaveBalance } = require('../entities/LeaveBalance');
const leaveBalanceRepo = AppDataSource.getRepository(LeaveBalance);
const leaveTypeRepo = AppDataSource.getRepository(LeaveType);
const bcrypt = require('bcrypt');

const users = [
  {
    name: 'admin1',
    email: 'admin1@gmail.com',
    password: 'admin1password',
    role: 'admin',
    managerId: null,
    created_at: '2025-04-18 10:56:42'
  },
  {
    name: 'manager1',
    email: 'manager1@gmail.com',
    password: 'manager1password',
    role: 'manager',
    managerId: 6,
    created_at: '2025-04-16 17:59:21'
  },
  {
    name: 'employee1',
    email: 'employee1@gmail.com',
    password: 'employee1password',
    role: 'employee',
    managerId: 2,
    created_at: '2025-04-16 18:02:02'
  },
  {
    name: 'manager2',
    email: 'manager2@gmail.com',
    password: 'manager2password',
    role: 'manager',
    managerId: 6,
    created_at: '2025-04-17 09:30:20'
  },
  {
    name: 'employee2',
    email: 'employee2@gmail.com',
    password: 'employee2password',
    role: 'employee',
    managerId: 4,
    created_at: '2025-04-17 09:32:48'
  },
  {
    name: 'hr1',
    email: 'hr1@gmail.com',
    password: 'hr1password',
    role: 'hr',
    managerId: 1,
    created_at: '2025-04-21 15:09:55'
  },
];

async function seedUsers() {
  const existingUsers = await userRepo.find();
  if (existingUsers.length > 0) {
    console.log('Users already exist. Skipping users seeding...');
    return;
  }

  const savedUsersMap = {};

  // Insert users with hashed passwords
  for (const { managerId, password, ...userData } of users) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo.create({ ...userData, password: hashedPassword });
    const savedUser = await userRepo.save(user);
    savedUsersMap[savedUser.email] = savedUser;
  }

  // Update users with managerId
  for (const userData of users) {
    if (userData.managerId !== null) {
      const user = await userRepo.findOneBy({ email: userData.email });
      if (user) {
        user.managerId = userData.managerId;
        await userRepo.save(user);
      }
    }
  }

  // Seed leave balances
  const leaveTypes = await leaveTypeRepo.find();
  const currentYear = new Date().getFullYear();

  for (const user of await userRepo.find()) {
    const leaveBalances = leaveTypes.map((lt) =>
      leaveBalanceRepo.create({
        userId: user.id,
        leaveTypeId: lt.id,
        year: currentYear,
        balance: lt.maxPerYear,
        used: 0,
      })
    );
    await leaveBalanceRepo.save(leaveBalances);
  }

  console.log('User data and leave balances seeded successfully!');
}

module.exports = seedUsers;
