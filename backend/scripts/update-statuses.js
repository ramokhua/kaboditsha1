// backend/scripts/update-statuses.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REGIONS = ['Central', 'North-West', 'Kgatleng', 'Kweneng', 'Southern', 'South-East', 'Kgalagadi', 'Ghanzi', 'North-East'];
const STATUSES = ['UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED'];

// March 2026 date range
const MARCH_START = new Date('2026-03-01T00:00:00.000Z');
const MARCH_END = new Date('2026-03-31T23:59:59.999Z');

async function updateApplicationStatuses() {
  console.log('\n📊 UPDATING APPLICATION STATUSES FOR VISUALIZATION');
  console.log('==================================================\n');

  let totalUpdated = 0;
  let updatedByRegion = {};

  for (const region of REGIONS) {
    // Get all land boards in this region
    const boards = await prisma.landBoard.findMany({
      where: { region },
      select: { landBoardId: true, name: true }
    });

    if (boards.length === 0) continue;

    console.log(`📍 Region: ${region} (${boards.length} boards)`);

    let regionCount = 0;

    for (const board of boards) {
      // Get pending applications for this board (SUBMITTED status)
      const pendingApps = await prisma.application.findMany({
        where: {
          landBoardId: board.landBoardId,
          status: 'SUBMITTED'
        },
        select: {
          applicationId: true,
          submittedAt: true
        }
      });

      if (pendingApps.length === 0) continue;

      // Determine how many to update (20-25% of pending)
      const updatePercentage = 0.2 + (Math.random() * 0.05); // 20-25%
      const numToUpdate = Math.max(1, Math.floor(pendingApps.length * updatePercentage));
      const shuffledApps = [...pendingApps].sort(() => 0.5 - Math.random());
      const appsToUpdate = shuffledApps.slice(0, numToUpdate);

      console.log(`   ${board.name}: ${pendingApps.length} pending, updating ${appsToUpdate.length} (${Math.round(updatePercentage * 100)}%)`);

      for (const app of appsToUpdate) {
        // Random status (weighted towards UNDER_REVIEW and DOCUMENTS_VERIFIED)
        const random = Math.random();
        let newStatus;
        if (random < 0.4) newStatus = 'UNDER_REVIEW';
        else if (random < 0.7) newStatus = 'DOCUMENTS_VERIFIED';
        else if (random < 0.85) newStatus = 'APPROVED';
        else newStatus = 'REJECTED';

        // Random date within March 2026
        const randomDay = Math.floor(Math.random() * 30) + 1;
        const randomHour = Math.floor(Math.random() * 23);
        const randomMinute = Math.floor(Math.random() * 59);
        const updatedAt = new Date(`2026-03-${randomDay.toString().padStart(2, '0')}T${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:00.000Z`);

        // Update application
        await prisma.application.update({
          where: { applicationId: app.applicationId },
          data: {
            status: newStatus,
            updatedAt,
            reviewedAt: newStatus !== 'SUBMITTED' ? updatedAt : null,
            approvedAt: newStatus === 'APPROVED' ? updatedAt : null,
            ...(newStatus === 'REJECTED' && { rejectionReason: 'Incomplete documentation or eligibility criteria not met' })
          }
        });

        // Create audit log entry
        await prisma.auditLog.create({
          data: {
            userId: null,
            action: `Status changed to ${newStatus} for application ${app.applicationId} (via batch update script)`,
            ipAddress: 'batch-script',
            timestamp: updatedAt
          }
        });

        regionCount++;
        totalUpdated++;
      }
    }

    updatedByRegion[region] = regionCount;
    console.log(`   ✅ ${region}: ${regionCount} applications updated\n`);
  }

  // Rebalance queue positions after updates
  console.log('🔄 Rebalancing queue positions...');
  
  const allBoards = await prisma.landBoard.findMany();
  for (const board of allBoards) {
    for (const settlementType of ['CITY', 'TOWN', 'VILLAGE', 'FARM']) {
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
      }
    }
  }

  // Update waiting list stats
  console.log('\n📊 Updating waiting list statistics...');
  
  for (const board of allBoards) {
    for (const settlementType of ['CITY', 'TOWN', 'VILLAGE', 'FARM']) {
      const activeApps = await prisma.application.findMany({
        where: {
          landBoardId: board.landBoardId,
          settlementType,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
        }
      });
      
      const oldestApp = activeApps[0];
      await prisma.waitingListStat.upsert({
        where: {
          landBoardId_settlementType: {
            landBoardId: board.landBoardId,
            settlementType
          }
        },
        update: {
          totalCount: activeApps.length,
          oldestDate: oldestApp?.submittedAt || new Date(),
          updatedAt: new Date()
        },
        create: {
          landBoardId: board.landBoardId,
          settlementType,
          totalCount: activeApps.length,
          eligibleCount: Math.floor(activeApps.length * 0.75),
          oldestDate: oldestApp?.submittedAt || new Date(),
          averageWaitMonths: Math.floor(Math.random() * 96) + 24
        }
      });
    }
  }

  console.log('\n================================');
  console.log('✅ STATUS UPDATE COMPLETED!');
  console.log('================================\n');
  console.log('📊 SUMMARY:');
  console.log(`   Total Applications Updated: ${totalUpdated}`);
  console.log('\n   By Region:');
  for (const [region, count] of Object.entries(updatedByRegion)) {
    console.log(`   • ${region}: ${count} applications`);
  }
  console.log('\n📅 All updates dated between March 1-31, 2026');
  console.log('📋 Audit logs created for each status change\n');
}

updateApplicationStatuses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());