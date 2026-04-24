// seed-3-applications-fast.js - BATCH INSERT with UNIQUE reference numbers
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SCALE_FACTOR = 0.10;
const BATCH_SIZE = 500;

let appCounter = 1;
let usedOmangs = new Set();
let userNumberCounter = 1;

function generateApplicationNumber(year) { 
  return `APP${year}${(appCounter++).toString().padStart(6, '0')}`; 
}

function generateReferenceNumber() {
  return `REF${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
}

function generateUniqueOmang(gender) {
  let omangNumber;
  let attempts = 0;
  do {
    const prefix = Math.floor(1000 + Math.random() * 9000);
    const genderDigit = gender === 'male' ? 1 : 2;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    omangNumber = parseInt(`${prefix}${genderDigit}${suffix}`);
    if (attempts++ > 20) break;
  } while (usedOmangs.has(omangNumber));
  usedOmangs.add(omangNumber);
  return omangNumber;
}

function randomDate(startYear, endYear) { 
  return new Date(startYear + Math.random() * (endYear - startYear), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1); 
}

function randomInt(min, max) { 
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

const FIRST_NAMES = { 
  male: ['Thabo', 'Kagiso', 'Boitsholo', 'Olebile', 'Mpho', 'Tumelo', 'Modisa', 'Kgosi', 'Lesego', 'Thato'], 
  female: ['Keitumetse', 'Lorato', 'Bontle', 'Tshireletso', 'Goitsemang', 'Kelebogile', 'Masego', 'Boitumelo', 'Gofaone', 'Wame'] 
};
const LAST_NAMES = ['Molefe', 'Modise', 'Kelebeng', 'Raditladi', 'Mmusi', 'Kgafela', 'Sechele', 'Montsho', 'Tawana', 'Moroka'];

const MAIN_BOARD_BACKLOGS = {
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

function getPurpose(settlementType) {
  const random = Math.random();
  if (settlementType === 'FARM') return 'Agricultural';
  if (settlementType === 'TOWN') {
    if (random < 0.55) return 'Residential';
    if (random < 0.70) return 'Commercial';
    if (random < 0.82) return 'Industrial';
    return 'Civic';
  }
  if (random < 0.75) return 'Residential';
  if (random < 0.88) return 'Commercial';
  return 'Civic';
}

function getWaitModifier(purpose) {
  const m = { 'Residential': 1.0, 'Commercial': 0.7, 'Industrial': 0.6, 'Civic': 0.8, 'Agricultural': 1.2 };
  return m[purpose] || 1.0;
}

async function getNextUserNumber() {
  return `US${(userNumberCounter++).toString().padStart(6, '0')}`;
}

async function main() {
  console.log('\n⚡ FAST SEEDING: Creating applications in BATCH mode...\n');

  const hashedPassword = await bcrypt.hash('Password123', 10);
  
  // Load existing OMANGs
  const existing = await prisma.user.findMany({ select: { omangNumber: true } });
  existing.forEach(u => { if (u.omangNumber) usedOmangs.add(u.omangNumber); });
  
  // Get last user number
  const lastUser = await prisma.user.findFirst({ orderBy: { userNumber: 'desc' } });
  if (lastUser?.userNumber) {
    userNumberCounter = parseInt(lastUser.userNumber.replace('US', '')) + 1;
  }

  const allBoards = await prisma.landBoard.findMany();
  const boardMap = new Map(allBoards.map(b => [b.name, b]));
  
  let totalApps = 0;
  let cumulativeApps = 0;
  const startTime = Date.now();

  for (const [boardName, backlog] of Object.entries(MAIN_BOARD_BACKLOGS)) {
    const board = boardMap.get(boardName);
    if (!board) continue;
    
    console.log(`\n📌 ${boardName}: ${backlog.pending.toLocaleString()} apps`);
    
    const batchUsers = [];
    const batchApps = [];
    
    for (let i = 0; i < backlog.pending; i++) {
      const rand = Math.random();
      let settlementType = rand < 0.6 ? 'VILLAGE' : (rand < 0.85 ? 'TOWN' : 'FARM');
      const purpose = getPurpose(settlementType);
      const waitModifier = getWaitModifier(purpose);
      const adjustedWaitMonths = Math.round(backlog.avgWaitMonths * waitModifier);
      const submittedAt = randomDate(2018, 2025);
      
      // Status distribution
      let status = 'SUBMITTED';
      const r = Math.random();
      if (r < 0.12) status = 'APPROVED';
      else if (r < 0.25) status = 'REJECTED';
      else if (r < 0.28) status = 'WITHDRAWN';
      else if (r < 0.45) status = 'UNDER_REVIEW';
      else if (r < 0.60) status = 'DOCUMENTS_VERIFIED';
      
      let approvedAt = null, reviewedAt = null, rejectionReason = null;
      if (status === 'APPROVED') {
        approvedAt = new Date(submittedAt.getTime() + randomInt(30, adjustedWaitMonths * 30) * 86400000);
        reviewedAt = approvedAt;
      } else if (status === 'REJECTED') {
        reviewedAt = new Date(submittedAt.getTime() + randomInt(30, 120) * 86400000);
        rejectionReason = 'Does not meet eligibility criteria';
      }
      
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const omangNumber = generateUniqueOmang(gender);
      const userNumber = await getNextUserNumber();
      const uniqueSuffix = `${Date.now()}${Math.random().toString(36).substring(2, 6)}${i}`;
      
      batchUsers.push({
        userNumber,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueSuffix}@example.com`,
        password: hashedPassword,
        fullName: `${firstName} ${lastName}`,
        omangNumber,
        phone: `7${Math.random().toString().slice(2, 9)}`,
        role: 'APPLICANT',
        emailVerified: true,
        createdAt: randomDate(2015, 2024),
      });
      
      const applicationNumber = generateApplicationNumber(submittedAt.getFullYear());
      const referenceNumber = generateReferenceNumber();
      
      batchApps.push({
        applicationNumber,
        referenceNumber,
        landBoardId: board.landBoardId,
        settlementType,
        status,
        purpose,
        submittedAt,
        reviewedAt,
        approvedAt,
        rejectionReason,
        queuePosition: 0,
      });
      
      totalApps++;
      
      // Execute batch
      if (batchUsers.length >= BATCH_SIZE) {
        // Insert users
        await prisma.user.createMany({ data: batchUsers, skipDuplicates: true });
        
        // Fetch created users to get IDs
        const emails = batchUsers.map(u => u.email);
        const createdUsers = await prisma.user.findMany({
          where: { email: { in: emails } },
          select: { userId: true, email: true }
        });
        
        const emailToId = new Map(createdUsers.map(u => [u.email, u.userId]));
        
        // Match apps with user IDs
        const appsWithIds = batchApps.map((app, idx) => ({
          ...app,
          userId: emailToId.get(batchUsers[idx]?.email)
        })).filter(app => app.userId);
        
        if (appsWithIds.length) {
          await prisma.application.createMany({ data: appsWithIds, skipDuplicates: true });
        }
        
        cumulativeApps += batchUsers.length;
        console.log(`     ✅ ${cumulativeApps.toLocaleString()} apps created`);
        
        // Clear batches
        batchUsers.length = 0;
        batchApps.length = 0;
      }
    }
    
    // Final batch for this board
    if (batchUsers.length > 0) {
      await prisma.user.createMany({ data: batchUsers, skipDuplicates: true });
      
      const emails = batchUsers.map(u => u.email);
      const createdUsers = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { userId: true, email: true }
      });
      
      const emailToId = new Map(createdUsers.map(u => [u.email, u.userId]));
      const appsWithIds = batchApps.map((app, idx) => ({
        ...app,
        userId: emailToId.get(batchUsers[idx]?.email)
      })).filter(app => app.userId);
      
      if (appsWithIds.length) {
        await prisma.application.createMany({ data: appsWithIds, skipDuplicates: true });
      }
      
      cumulativeApps += batchUsers.length;
      console.log(`     ✅ ${cumulativeApps.toLocaleString()} apps created`);
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  console.log(`\n` + '='.repeat(50));
  console.log(`✅ SEEDING COMPLETE!`);
  console.log('='.repeat(50));
  console.log(`📊 Statistics:`);
  console.log(`   ├─ Total Applications: ${totalApps.toLocaleString()}`);
  console.log(`   ├─ Time taken: ${minutes}m ${seconds}s`);
  console.log(`   └─ Users created: ${await prisma.user.count().toLocaleString()}`);
  console.log('='.repeat(50) + '\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });