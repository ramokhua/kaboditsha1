// seed-5-supporting-data.js - Populate WaitingListStat, Notifications, and StatusHistory
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateNotificationNumber() {
  return `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
}

async function main() {
  console.log('\n📊 Populating supporting tables...\n');

  // 1. Populate WaitingListStat
  console.log('1. Updating WaitingListStat...');
  
  const allBoards = await prisma.landBoard.findMany();
  const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];
  let waitingStatsCount = 0;

  for (const board of allBoards) {
    for (const settlementType of settlementTypes) {
      const activeApps = await prisma.application.findMany({
        where: {
          landBoardId: board.landBoardId,
          settlementType,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
        },
        orderBy: { submittedAt: 'asc' }
      });

      if (activeApps.length > 0) {
        const oldestDate = activeApps[0]?.submittedAt || new Date();
        
        await prisma.waitingListStat.upsert({
          where: {
            landBoardId_settlementType: {
              landBoardId: board.landBoardId,
              settlementType
            }
          },
          update: {
            totalCount: activeApps.length,
            eligibleCount: Math.floor(activeApps.length * 0.75),
            oldestDate: oldestDate,
            averageWaitMonths: 24
          },
          create: {
            landBoardId: board.landBoardId,
            settlementType,
            totalCount: activeApps.length,
            eligibleCount: Math.floor(activeApps.length * 0.75),
            oldestDate: oldestDate,
            averageWaitMonths: 24
          }
        });
        waitingStatsCount++;
      }
    }
  }
  console.log(`   ✅ Created/updated ${waitingStatsCount} waiting list statistics`);

  // 2. Populate StatusHistory
  console.log('\n2. Creating StatusHistory entries...');
  
  const applications = await prisma.application.findMany({
    include: { user: true }
  });
  
  let statusHistoryCount = 0;

  for (const app of applications) {
    // Create status history entry for current status
    await prisma.statusHistory.create({
      data: {
        applicationId: app.applicationId,
        status: app.status,
        changedAt: app.submittedAt || new Date(),
        changedBy: app.userId,
        notes: `Application ${app.status.toLowerCase().replace('_', ' ')}`
      }
    });
    statusHistoryCount++;
  }
  console.log(`   ✅ Created ${statusHistoryCount} status history entries`);

  // 3. Create Notifications for applicants
  console.log('\n3. Creating Notifications...');
  
  let notificationCount = 0;

  for (const app of applications) {
    if (app.userId && app.status) {
      let subject = '';
      let message = '';
      
      if (app.status === 'APPROVED') {
        subject = 'Application Approved';
        message = `Congratulations! Your application ${app.applicationNumber} has been APPROVED.`;
      } else if (app.status === 'REJECTED') {
        subject = 'Application Rejected';
        message = `Your application ${app.applicationNumber} has been REJECTED. Reason: ${app.rejectionReason || 'Does not meet eligibility criteria'}`;
      } else if (app.status === 'SUBMITTED') {
        subject = 'Application Submitted';
        message = `Your application ${app.applicationNumber} has been successfully SUBMITTED and is now in the queue.`;
      } else if (app.status === 'UNDER_REVIEW') {
        subject = 'Application Under Review';
        message = `Your application ${app.applicationNumber} is now UNDER REVIEW by Land Board staff.`;
      } else if (app.status === 'DOCUMENTS_VERIFIED') {
        subject = 'Documents Verified';
        message = `Your documents for application ${app.applicationNumber} have been VERIFIED.`;
      } else if (app.status === 'WITHDRAWN') {
        subject = 'Application Withdrawn';
        message = `Your application ${app.applicationNumber} has been WITHDRAWN.`;
      } else {
        continue; // Skip unknown status
      }
      
      await prisma.notification.create({
        data: {
          notificationNumber: generateNotificationNumber(),
          userId: app.userId,
          type: 'IN_APP',
          subject: subject,
          message: message,
          sentAt: app.submittedAt || new Date(),
          readAt: null
        }
      });
      notificationCount++;
    }
  }
  console.log(`   ✅ Created ${notificationCount} notifications`);

  // 4. Update queue positions for all active applications
  console.log('\n4. Rebalancing queue positions...');
  
  let queueUpdated = 0;
  for (const board of allBoards) {
    for (const settlementType of settlementTypes) {
      const activeApps = await prisma.application.findMany({
        where: {
          landBoardId: board.landBoardId,
          settlementType,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
        },
        orderBy: { submittedAt: 'asc' }
      });
      
      for (let i = 0; i < activeApps.length; i++) {
        await prisma.application.update({
          where: { applicationId: activeApps[i].applicationId },
          data: { queuePosition: i + 1 }
        });
        queueUpdated++;
      }
    }
  }
  console.log(`   ✅ Updated queue positions for ${queueUpdated} applications`);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ SUPPORTING DATA POPULATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 Final counts:`);
  console.log(`   ├─ WaitingListStat: ${await prisma.waitingListStat.count()}`);
  console.log(`   ├─ StatusHistory: ${await prisma.statusHistory.count()}`);
  console.log(`   ├─ Notifications: ${await prisma.notification.count()}`);
  console.log(`   └─ Applications: ${await prisma.application.count()}`);
  console.log('='.repeat(60) + '\n');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });