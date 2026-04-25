// seed-6-audit-logs.js - Populate audit logs with backdated historical data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to generate random date within range
function randomDate(startDate, endDate) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

// Helper function to generate random IP address
function randomIP() {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Helper function to generate random application number
function randomAppNumber() {
  return `APP${2020 + Math.floor(Math.random() * 6)}${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
}

// Audit action templates for different roles
const STAFF_ACTIONS = [
  (appNum) => `Reviewed application ${appNum}`,
  (appNum) => `Verified documents for application ${appNum}`,
  (appNum) => `Updated application ${appNum} status to UNDER_REVIEW`,
  (appNum) => `Updated application ${appNum} status to DOCUMENTS_VERIFIED`,
  (appNum) => `Rejected document for application ${appNum}`,
  (appNum) => `Added internal notes to application ${appNum}`,
  () => `User logged in`,
  () => `User logged out`,
  () => `Viewed pending applications queue`,
  () => `Exported applications list`
];

const MANAGER_ACTIONS = [
  (appNum) => `Approved application ${appNum}`,
  (appNum) => `Rejected application ${appNum}`,
  (appNum) => `Reviewed application ${appNum} for final decision`,
  () => `Viewed region performance dashboard`,
  () => `Exported region performance report (PDF)`,
  () => `Exported analytics data (Excel)`,
  () => `Changed application filter settings`,
  () => `User logged in`,
  () => `User logged out`,
  () => `Reviewed staff activity in region`
];

const ADMIN_ACTIONS = [
  (email) => `Created user: ${email}`,
  (email) => `Updated user: ${email}`,
  (email) => `Deleted user: ${email}`,
  (board) => `Created land board: ${board}`,
  (board) => `Updated land board: ${board}`,
  (board) => `Deleted land board: ${board}`,
  () => `Viewed system audit logs`,
  () => `Sent broadcast notification to all users`,
  () => `User logged in`,
  () => `User logged out`
];

async function main() {
  console.log('\n📜 SEEDING: Creating historical audit logs...\n');

  // Get all users by role
  const staffUsers = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { userId: true, email: true, fullName: true, assignedBoard: { select: { name: true, region: true } } }
  });

  const managerUsers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    select: { userId: true, email: true, fullName: true, assignedBoard: { select: { name: true, region: true } } }
  });

  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { userId: true, email: true, fullName: true }
  });

  console.log(`Found ${staffUsers.length} STAFF users`);
  console.log(`Found ${managerUsers.length} MANAGER users`);
  console.log(`Found ${adminUsers.length} ADMIN users\n`);

  // Date range: Last 60 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);

  let totalLogs = 0;

  // ========== CREATE AUDIT LOGS FOR STAFF ==========
  console.log('📝 Creating audit logs for STAFF users...');
  
  for (const staff of staffUsers) {
    // Each staff gets 8-15 audit logs
    const numLogs = 8 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < numLogs; i++) {
      const actionIndex = Math.floor(Math.random() * STAFF_ACTIONS.length);
      const actionGenerator = STAFF_ACTIONS[actionIndex];
      const appNum = randomAppNumber();
      const action = actionGenerator(appNum);
      const timestamp = randomDate(startDate, endDate);
      const ipAddress = randomIP();
      
      await prisma.auditLog.create({
        data: {
          userId: staff.userId,
          action: action,
          ipAddress: ipAddress,
          timestamp: timestamp
        }
      });
      totalLogs++;
    }
    console.log(`  ✓ ${staff.fullName} (${staff.assignedBoard?.name || 'No board'}) - ${numLogs} logs`);
  }

  // ========== CREATE AUDIT LOGS FOR MANAGERS ==========
  console.log('\n📝 Creating audit logs for MANAGER users...');
  
  for (const manager of managerUsers) {
    // Each manager gets 10-20 audit logs
    const numLogs = 10 + Math.floor(Math.random() * 11);
    
    for (let i = 0; i < numLogs; i++) {
      const actionIndex = Math.floor(Math.random() * MANAGER_ACTIONS.length);
      const actionGenerator = MANAGER_ACTIONS[actionIndex];
      const appNum = randomAppNumber();
      const action = actionGenerator(appNum);
      const timestamp = randomDate(startDate, endDate);
      const ipAddress = randomIP();
      
      await prisma.auditLog.create({
        data: {
          userId: manager.userId,
          action: action,
          ipAddress: ipAddress,
          timestamp: timestamp
        }
      });
      totalLogs++;
    }
    console.log(`  ✓ ${manager.fullName} (${manager.assignedBoard?.region || 'No region'}) - ${numLogs} logs`);
  }

  // ========== CREATE AUDIT LOGS FOR ADMINS ==========
  console.log('\n📝 Creating audit logs for ADMIN users...');
  
  // Sample data for admin actions
  const sampleEmails = ['user1@example.com', 'staff2@landboard.gov.bw', 'manager3@landboard.gov.bw', 'applicant4@example.com'];
  const sampleBoards = ['New Land Board', 'Test Board', 'Demo Board', 'Sub Board Alpha'];
  
  for (const admin of adminUsers) {
    // Each admin gets 15-25 audit logs
    const numLogs = 15 + Math.floor(Math.random() * 11);
    
    for (let i = 0; i < numLogs; i++) {
      const actionIndex = Math.floor(Math.random() * ADMIN_ACTIONS.length);
      const actionGenerator = ADMIN_ACTIONS[actionIndex];
      
      let action;
      if (actionIndex === 0 || actionIndex === 1 || actionIndex === 2) {
        // User management actions
        const randomEmail = sampleEmails[Math.floor(Math.random() * sampleEmails.length)];
        action = actionGenerator(randomEmail);
      } else if (actionIndex === 3 || actionIndex === 4 || actionIndex === 5) {
        // Board management actions
        const randomBoard = sampleBoards[Math.floor(Math.random() * sampleBoards.length)];
        action = actionGenerator(randomBoard);
      } else {
        action = actionGenerator();
      }
      
      const timestamp = randomDate(startDate, endDate);
      const ipAddress = randomIP();
      
      await prisma.auditLog.create({
        data: {
          userId: admin.userId,
          action: action,
          ipAddress: ipAddress,
          timestamp: timestamp
        }
      });
      totalLogs++;
    }
    console.log(`  ✓ ${admin.fullName} - ${numLogs} logs`);
  }

  // ========== VERIFICATION ==========
  const finalCount = await prisma.auditLog.count();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ AUDIT LOG SEEDING COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 Statistics:`);
  console.log(`   ├─ Total audit logs created: ${totalLogs}`);
  console.log(`   ├─ Total audit logs in database: ${finalCount}`);
  console.log(`   ├─ Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
  console.log(`   └─ Users covered: ${staffUsers.length + managerUsers.length + adminUsers.length}`);
  console.log('='.repeat(60) + '\n');

  // Show sample of recent logs
  console.log('📋 Sample of recent audit logs:');
  const recentLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: { email: true, role: true }
      }
    }
  });
  
  console.table(recentLogs.map(log => ({
    Timestamp: log.timestamp.toLocaleString(),
    User: log.user?.email || 'Unknown',
    Role: log.user?.role || '?',
    Action: log.action.substring(0, 50) + (log.action.length > 50 ? '...' : '')
  })));
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });