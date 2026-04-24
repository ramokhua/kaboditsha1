// seed-historical-data.js - Populate historical data for last 12 months with BATCH mode
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SCALE_FACTOR = 0.10;
const BATCH_SIZE = 500;

let userCounter = 1;
let usedOmangs = new Set();
let usedEmails = new Set();

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

function generateReferenceNumber() {
  return `HIST${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
}

function randomDate(startYear, endYear) { 
  return new Date(startYear + Math.random() * (endYear - startYear), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1); 
}

function randomInt(min, max) { 
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

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

const FIRST_NAMES = { 
  male: ['Thabo', 'Kagiso', 'Boitsholo', 'Olebile', 'Mpho', 'Tumelo', 'Modisa', 'Kgosi', 'Lesego', 'Thato'], 
  female: ['Keitumetse', 'Lorato', 'Bontle', 'Tshireletso', 'Goitsemang', 'Kelebogile', 'Masego', 'Boitumelo', 'Gofaone', 'Wame'] 
};
const LAST_NAMES = ['Molefe', 'Modise', 'Kelebeng', 'Raditladi', 'Mmusi', 'Kgafela', 'Sechele', 'Montsho', 'Tawana', 'Moroka'];

async function getNextUserNumber() {
  return `USH${(userCounter++).toString().padStart(6, '0')}`;
}

async function main() {
  console.log('\n📜 POPULATING HISTORICAL DATA FOR LAST 12 MONTHS (TURNAROUND TIME IN DAYS)\n');
  
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Load existing OMANGs
  const existing = await prisma.user.findMany({ select: { omangNumber: true, email: true } });
  existing.forEach(u => {
    if (u.omangNumber) usedOmangs.add(u.omangNumber);
    if (u.email) usedEmails.add(u.email);
  });
  
  // Get last user number
  const lastUser = await prisma.user.findFirst({ orderBy: { userNumber: 'desc' } });
  if (lastUser?.userNumber) {
    const match = lastUser.userNumber.match(/\d+/);
    if (match) userCounter = parseInt(match[0]) + 1;
  }
  
  // Get all main boards
  const boards = await prisma.landBoard.findMany({
    where: { type: 'MAIN' }
  });
  
  let totalApps = 0;
  let cumulativeApps = 0;
  const startTime = Date.now();
  
  for (const board of boards) {
    console.log(`\n📌 ${board.name}...`);
    
    const batchUsers = [];
    const batchApps = [];
    
    // Add data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      // Turnaround time in DAYS (improving over time)
      let baseTurnaroundDays;
      if (i >= 9) baseTurnaroundDays = 90 + Math.floor(Math.random() * 40);     // 90-130 days (older)
      else if (i >= 6) baseTurnaroundDays = 60 + Math.floor(Math.random() * 30); // 60-90 days
      else if (i >= 3) baseTurnaroundDays = 35 + Math.floor(Math.random() * 25); // 35-60 days
      else baseTurnaroundDays = 20 + Math.floor(Math.random() * 15);             // 20-35 days (recent)
      
      // Applications per month per board
      const appsPerMonth = 30 + Math.floor(Math.random() * 40); // 30-70 apps per month
      
      console.log(`    ${monthName} ${year}: ${appsPerMonth} apps (avg turnaround: ${baseTurnaroundDays} days)`);
      
      for (let j = 0; j < appsPerMonth; j++) {
        const randomDay = Math.floor(Math.random() * 25) + 1;
        const submittedAt = new Date(year, month - 1, randomDay);
        
        // 80% approved, 20% still pending
        const isApproved = Math.random() < 0.8;
        
        let approvedAt = null;
        let turnaroundDays = null;
        let status = isApproved ? 'APPROVED' : 'SUBMITTED';
        
        if (isApproved) {
          // Add variance to turnaround time (±15 days)
          const variance = Math.floor(Math.random() * 30) - 15;
          turnaroundDays = Math.max(7, baseTurnaroundDays + variance);
          approvedAt = new Date(submittedAt.getTime() + (turnaroundDays * 24 * 60 * 60 * 1000));
        }
        
        // Generate user
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const omangNumber = generateUniqueOmang(gender);
        const userNumber = await getNextUserNumber();
        const uniqueSuffix = `${Date.now()}${Math.random().toString(36).substring(2, 6)}${j}`;
        
        const settlementType = ['TOWN', 'VILLAGE', 'FARM'][Math.floor(Math.random() * 3)];
        const purpose = getPurpose(settlementType);
        
        batchUsers.push({
          userNumber,
          email: `hist.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueSuffix}@example.com`,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          omangNumber,
          phone: `7${Math.random().toString().slice(2, 9)}`,
          role: 'APPLICANT',
          emailVerified: true,
          createdAt: randomDate(2015, 2024),
        });
        
        batchApps.push({
          applicationNumber: generateReferenceNumber(),
          referenceNumber: generateReferenceNumber(),
          userId: null, // Will fill after user creation
          landBoardId: board.landBoardId,
          settlementType,
          status,
          purpose,
          submittedAt,
          approvedAt,
          queuePosition: 0,
          notes: `Historical data - Turnaround: ${turnaroundDays || 'N/A'} days`,
        });
        
        totalApps++;
        
        // Execute batch
        if (batchUsers.length >= BATCH_SIZE) {
          // Insert users
          await prisma.user.createMany({ data: batchUsers, skipDuplicates: true });
          
          // Fetch created users
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
          console.log(`       ✅ ${cumulativeApps.toLocaleString()} historical apps created`);
          
          batchUsers.length = 0;
          batchApps.length = 0;
        }
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
      console.log(`       ✅ ${cumulativeApps.toLocaleString()} historical apps created`);
    }
  }
  
  // Rebalance queue positions
  console.log('\n🔄 Rebalancing queue positions...');
  const allBoards = await prisma.landBoard.findMany();
  const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];
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
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ HISTORICAL DATA SEEDING COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 Statistics:`);
  console.log(`   ├─ Historical Applications: ${totalApps.toLocaleString()}`);
  console.log(`   ├─ Turnaround Time: In DAYS (20-130 days range)`);
  console.log(`   ├─ Time taken: ${minutes}m ${seconds}s`);
  console.log(`   └─ Total Applications Now: ${await prisma.application.count().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });