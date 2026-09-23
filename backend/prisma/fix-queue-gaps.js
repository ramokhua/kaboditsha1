// backend/prisma/fix-queue-gaps.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing queue positions PER STATUS across all boards...\n');

  const boards = await prisma.landBoard.findMany();
  const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];
  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'];

  let totalFixed = 0;

  for (const board of boards) {
    for (const settlementType of settlementTypes) {
      for (const status of statuses) {
        const apps = await prisma.application.findMany({
          where: {
            landBoardId: board.landBoardId,
            settlementType,
            status
          },
          orderBy: { submittedAt: 'asc' },
          select: { applicationId: true }
        });

        if (apps.length === 0) continue;

        const CHUNK = 500;
        for (let i = 0; i < apps.length; i += CHUNK) {
          const chunk = apps.slice(i, i + CHUNK);
          await prisma.$transaction(
            chunk.map((app, idx) =>
              prisma.application.update({
                where: { applicationId: app.applicationId },
                data: { queuePosition: i + idx + 1 }
              })
            )
          );
        }

        totalFixed += apps.length;
        console.log(`  ✓ ${board.name} - ${settlementType} - ${status}: ${apps.length}`);
      }
    }
  }

  console.log(`\n✅ Fixed ${totalFixed} queue positions across all combinations.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());