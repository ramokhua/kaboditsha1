const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SCALE_FACTOR = 0.1; // 10% scale for Supabase
let userCounter = 1;

function generateUserNumber() { return `US${(userCounter++).toString().padStart(6, '0')}`; }
function generateOmang(gender) { const prefix = Math.floor(1000 + Math.random() * 9000); const genderDigit = gender === 'male' ? 1 : 2; const suffix = Math.floor(1000 + Math.random() * 9000); return parseInt(`${prefix}${genderDigit}${suffix}`); }
function randomDate(startYear, endYear) { return new Date(startYear + Math.random() * (endYear - startYear), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1); }

const FIRST_NAMES = { male: ['Thabo', 'Kagiso', 'Boitsholo', 'Olebile', 'Mpho', 'Tumelo', 'Modisa', 'Kgosi', 'Lesego', 'Thato'], female: ['Keitumetse', 'Lorato', 'Bontle', 'Tshireletso', 'Goitsemang', 'Kelebogile', 'Masego', 'Boitumelo', 'Gofaone', 'Wame'] };
const LAST_NAMES = ['Molefe', 'Modise', 'Kelebeng', 'Raditladi', 'Mmusi', 'Kgafela', 'Sechele', 'Montsho', 'Tawana', 'Moroka'];

const BOARD_BACKLOGS = {
  'Kgatleng Land Board': { pending: Math.round(152498 * SCALE_FACTOR), disqualificationRate: 0.25, avgWaitMonths: 60 },
  'Ngwato Land Board': { pending: Math.round(120000 * SCALE_FACTOR), disqualificationRate: 0.22, avgWaitMonths: 54 },
  'Kweneng Land Board': { pending: Math.round(85000 * SCALE_FACTOR), disqualificationRate: 0.20, avgWaitMonths: 48 },
  'Ngwaketse Land Board': { pending: Math.round(65000 * SCALE_FACTOR), disqualificationRate: 0.20, avgWaitMonths: 45 },
  'Tlokweng Land Board': { pending: Math.round(45000 * SCALE_FACTOR), disqualificationRate: 0.18, avgWaitMonths: 36 },
  'Tati Land Board': { pending: Math.round(30000 * SCALE_FACTOR), disqualificationRate: 0.15, avgWaitMonths: 30 },
  'North West Land Board': { pending: Math.round(25000 * SCALE_FACTOR), disqualificationRate: 0.12, avgWaitMonths: 18 },
  'Rolong Land Board': { pending: Math.round(15000 * SCALE_FACTOR), disqualificationRate: 0.12, avgWaitMonths: 21 },
  'Kgalagadi Land Board': { pending: Math.round(12000 * SCALE_FACTOR), disqualificationRate: 0.10, avgWaitMonths: 15 },
  'Ghanzi Land Board': { pending: Math.round(10000 * SCALE_FACTOR), disqualificationRate: 0.10, avgWaitMonths: 13 },
  'Chobe Land Board': { pending: Math.round(8000 * SCALE_FACTOR), disqualificationRate: 0.08, avgWaitMonths: 9 },
  'Malete Land Board': { pending: Math.round(35000 * SCALE_FACTOR), disqualificationRate: 0.15, avgWaitMonths: 27 },
};

async function getNextUserNumber() {
  const lastUser = await prisma.user.findFirst({ orderBy: { userNumber: 'desc' } });
  if (!lastUser || !lastUser.userNumber) return 'US000001';
  const lastNumber = parseInt(lastUser.userNumber.replace('US', ''));
  return `US${(lastNumber + 1).toString().padStart(6, '0')}`;
}

async function getNextApplicationNumber(year) {
  const lastApp = await prisma.application.findFirst({
    where: { applicationNumber: { startsWith: `APP${year}` } },
    orderBy: { applicationNumber: 'desc' }
  });
  if (!lastApp) return `APP${year}000001`;
  const lastNumber = parseInt(lastApp.applicationNumber.slice(-6));
  return `APP${year}${(lastNumber + 1).toString().padStart(6, '0')}`;
}

async function main() {
  console.log('\n👥 PART 3: Creating Applicants and Applications (30% Scale)...\n');
  
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const usedOmangs = new Set();
  const usedEmails = new Set();
  
  const existingUsers = await prisma.user.findMany({ select: { omangNumber: true, email: true } });
  existingUsers.forEach(u => {
    usedOmangs.add(u.omangNumber);
    usedEmails.add(u.email);
  });
  
  const mainBoards = await prisma.landBoard.findMany({ where: { type: 'MAIN' } });
  const boardMap = new Map();
  mainBoards.forEach(b => boardMap.set(b.name, b));
  
  let totalUsers = existingUsers.length;
  let totalApps = 0;
  const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];
  
  for (const [boardName, backlog] of Object.entries(BOARD_BACKLOGS)) {
    const board = boardMap.get(boardName);
    if (!board) continue;
    
    console.log(`\n  📍 ${boardName}: Creating ${backlog.pending.toLocaleString()} applications...`);
    
    for (let i = 0; i < backlog.pending; i++) {
      const rand = Math.random();
      let settlementType;
      if (rand < 0.6) settlementType = 'VILLAGE';
      else if (rand < 0.85) settlementType = 'TOWN';
      else settlementType = 'FARM';
      
      const submittedAt = randomDate(2010, 2025);
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      
      let omangNumber;
      do { omangNumber = generateOmang(gender); } while (usedOmangs.has(omangNumber));
      usedOmangs.add(omangNumber);
      
      let email;
      do { email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${totalUsers}@example.com`; } while (usedEmails.has(email));
      usedEmails.add(email);
      
      const userNumber = await getNextUserNumber();
      
      const user = await prisma.user.create({
        data: {
          userNumber,
          email,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          omangNumber,
          phone: `7${Math.random().toString().slice(2,9)}`,
          role: 'APPLICANT',
          emailVerified: true,
          createdAt: randomDate(2010, 2024),
        }
      });
      totalUsers++;
      
      const applicationNumber = await getNextApplicationNumber(submittedAt.getFullYear());
      await prisma.application.create({
        data: {
          applicationNumber,
          referenceNumber: applicationNumber,
          userId: user.userId,
          landBoardId: board.landBoardId,
          settlementType,
          status: 'SUBMITTED',
          purpose: settlementType === 'FARM' ? 'Agricultural' : 'Residential',
          submittedAt,
          queuePosition: 0,
        }
      });
      totalApps++;
      
      if (totalApps % 5000 === 0) {
        console.log(`     Created ${totalApps.toLocaleString()} applications so far...`);
      }
    }
    console.log(`     ✅ Completed ${backlog.pending.toLocaleString()} applications for ${boardName}`);
  }
  
  console.log(`\n✅ Created ${totalUsers.toLocaleString()} applicants and ${totalApps.toLocaleString()} applications\n`);
  
  // Rebalance queue positions
  console.log('🔄 Rebalancing queue positions...');
  const allBoards = await prisma.landBoard.findMany();
  for (const board of allBoards) {
    for (const settlementType of settlementTypes) {
      const activeApps = await prisma.application.findMany({
        where: { landBoardId: board.landBoardId, settlementType, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] } },
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
  console.log('✅ Queue positions updated\n');
  
  console.log('\n✅ SEEDING COMPLETE!');
  console.log(`📊 Final counts: Users: ${await prisma.user.count()}, Applications: ${await prisma.application.count()}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());