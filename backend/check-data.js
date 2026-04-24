const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('\ní³Š MANAGER DATA CHECK:\n');
  
  const managers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    include: { assignedBoard: true }
  });
  
  console.log('Managers found:', managers.length);
  
  for (const m of managers) {
    console.log('\n  Manager email:', m.email);
    console.log('    Board ID:', m.landBoardId);
    console.log('    Board Name:', m.assignedBoard?.name || 'NO BOARD ASSIGNED');
    console.log('    Region:', m.assignedBoard?.region || 'UNKNOWN');
    
    if (m.assignedBoard) {
      const appCount = await prisma.application.count({
        where: { landBoardId: m.assignedBoard.landBoardId }
      });
      console.log('    Applications for this board:', appCount);
    }
  }
  
  console.log('\ní³Š LAND BOARDS WITH APPLICATIONS:\n');
  const boards = await prisma.landBoard.findMany({
    where: { type: 'MAIN' },
    include: { _count: { select: { applications: true } } }
  });
  
  for (const board of boards) {
    console.log(`  ${board.name}: ${board._count.applications} applications`);
  }
  
  console.log('\ní³Š RECENT APPLICATIONS (first 5):\n');
  const recentApps = await prisma.application.findMany({
    take: 5,
    include: { landBoard: { select: { name: true, region: true } } }
  });
  
  for (const app of recentApps) {
    console.log(`  App ${app.applicationNumber}: Board=${app.landBoard?.name}, Region=${app.landBoard?.region}`);
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
