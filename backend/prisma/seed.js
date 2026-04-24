// backend/prisma/seed.js
// KaboDitsha - Complete Database Seeding Script: Realistic Botswana Land Data at 80% Scale

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// ========== CONFIGURATION ==========
// Scale factor: 0.8 means 80% of real-world numbers
const SCALE_FACTOR = 0.8;
const TOTAL_ADMINS = 3;

// ========== REALISTIC BACKLOG DATA (Scaled to 80%) ==========
const BOARD_BACKLOGS = {
  'Kgatleng Land Board': { 
    pending: Math.round(152498 * SCALE_FACTOR),  // ~122,000
    residential: Math.round(139644 * SCALE_FACTOR),
    agricultural: Math.round(12854 * SCALE_FACTOR),
    disqualificationRate: 0.25,
    avgWaitMonths: 60,
    region: 'Kgatleng'
  },
  'Ngwato Land Board': { 
    pending: Math.round(120000 * SCALE_FACTOR),   // ~96,000
    residential: Math.round(100000 * SCALE_FACTOR),
    agricultural: Math.round(20000 * SCALE_FACTOR),
    disqualificationRate: 0.22,
    avgWaitMonths: 54,
    region: 'Central'
  },
  'Kweneng Land Board': { 
    pending: Math.round(85000 * SCALE_FACTOR),    // ~68,000
    residential: Math.round(70000 * SCALE_FACTOR),
    agricultural: Math.round(15000 * SCALE_FACTOR),
    disqualificationRate: 0.20,
    avgWaitMonths: 48,
    region: 'Kweneng'
  },
  'Ngwaketse Land Board': { 
    pending: Math.round(65000 * SCALE_FACTOR),    // ~52,000
    residential: Math.round(55000 * SCALE_FACTOR),
    agricultural: Math.round(10000 * SCALE_FACTOR),
    disqualificationRate: 0.20,
    avgWaitMonths: 45,
    region: 'Southern'
  },
  'Tlokweng Land Board': { 
    pending: Math.round(45000 * SCALE_FACTOR),    // ~36,000
    residential: Math.round(40000 * SCALE_FACTOR),
    agricultural: Math.round(5000 * SCALE_FACTOR),
    disqualificationRate: 0.18,
    avgWaitMonths: 36,
    region: 'South-East'
  },
  'Tati Land Board': { 
    pending: Math.round(30000 * SCALE_FACTOR),    // ~24,000
    residential: Math.round(25000 * SCALE_FACTOR),
    agricultural: Math.round(5000 * SCALE_FACTOR),
    disqualificationRate: 0.15,
    avgWaitMonths: 30,
    region: 'North-East'
  },
  'North West Land Board': { 
    pending: Math.round(25000 * SCALE_FACTOR),    // ~20,000
    residential: Math.round(20000 * SCALE_FACTOR),
    agricultural: Math.round(5000 * SCALE_FACTOR),
    disqualificationRate: 0.12,
    avgWaitMonths: 18,
    region: 'North-West'
  },
  'Rolong Land Board': { 
    pending: Math.round(15000 * SCALE_FACTOR),    // ~12,000
    residential: Math.round(10000 * SCALE_FACTOR),
    agricultural: Math.round(5000 * SCALE_FACTOR),
    disqualificationRate: 0.12,
    avgWaitMonths: 21,
    region: 'Southern'
  },
  'Kgalagadi Land Board': { 
    pending: Math.round(12000 * SCALE_FACTOR),    // ~9,600
    residential: Math.round(8000 * SCALE_FACTOR),
    agricultural: Math.round(4000 * SCALE_FACTOR),
    disqualificationRate: 0.10,
    avgWaitMonths: 15,
    region: 'Kgalagadi'
  },
  'Ghanzi Land Board': { 
    pending: Math.round(10000 * SCALE_FACTOR),    // ~8,000
    residential: Math.round(7000 * SCALE_FACTOR),
    agricultural: Math.round(3000 * SCALE_FACTOR),
    disqualificationRate: 0.10,
    avgWaitMonths: 13,
    region: 'Ghanzi'
  },
  'Chobe Land Board': { 
    pending: Math.round(8000 * SCALE_FACTOR),     // ~6,400
    residential: Math.round(6000 * SCALE_FACTOR),
    agricultural: Math.round(2000 * SCALE_FACTOR),
    disqualificationRate: 0.08,
    avgWaitMonths: 9,
    region: 'Chobe'
  },
  'Malete Land Board': { 
    pending: Math.round(35000 * SCALE_FACTOR),    // ~28,000
    residential: Math.round(30000 * SCALE_FACTOR),
    agricultural: Math.round(5000 * SCALE_FACTOR),
    disqualificationRate: 0.15,
    avgWaitMonths: 27,
    region: 'South-East'
  },
};

// ========== OFFICIAL MAIN LAND BOARDS (12) ==========
const MAIN_LAND_BOARDS = [
  { name: 'Ngwato Land Board', region: 'Central', headquarters: 'Serowe', lat: -22.3875, lng: 26.7108 },
  { name: 'Kweneng Land Board', region: 'Kweneng', headquarters: 'Molepolole', lat: -24.4066, lng: 25.4951 },
  { name: 'Kgatleng Land Board', region: 'Kgatleng', headquarters: 'Mochudi', lat: -24.3822, lng: 26.1469 },
  { name: 'Ngwaketse Land Board', region: 'Southern', headquarters: 'Kanye', lat: -24.9855, lng: 25.3379 },
  { name: 'Rolong Land Board', region: 'Southern', headquarters: 'Goodhope', lat: -25.2245, lng: 25.6792 },
  { name: 'Tlokweng Land Board', region: 'South-East', headquarters: 'Tlokweng', lat: -24.6685, lng: 25.9659 },
  { name: 'Kgalagadi Land Board', region: 'Kgalagadi', headquarters: 'Tsabong', lat: -26.05, lng: 22.45 },
  { name: 'Chobe Land Board', region: 'Chobe', headquarters: 'Kasane', lat: -17.8018, lng: 25.1602 },
  { name: 'Ghanzi Land Board', region: 'Ghanzi', headquarters: 'Ghanzi', lat: -21.6979, lng: 21.6458 },
  { name: 'North West Land Board', region: 'North-West', headquarters: 'Maun', lat: -19.9966, lng: 23.4181 },
  { name: 'Tati Land Board', region: 'North-East', headquarters: 'Francistown', lat: -21.1702, lng: 27.5078 },
  { name: 'Malete Land Board', region: 'South-East', headquarters: 'Ramotswa', lat: -24.8715, lng: 25.8385 },
];

// ========== OFFICIAL SUBORDINATE LAND BOARDS (41) ==========
const SUBORDINATE_LAND_BOARDS = [
  // Central District - Ngwato Land Board (9)
  { name: 'Palapye Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Serowe Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Shoshong Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Tonota Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Sefhare Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Rakops Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Paje Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Bobonong Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Maunatlala Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  
  // Kweneng District (6)
  { name: 'Molepolole Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Mogoditshane Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Letlhakeng Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Lephephe Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Lentsweletau Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Motokwe Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  
  // Kgatleng District (4)
  { name: 'Mochudi Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Oodi Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Mathubudukwane Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Artesia Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  
  // Southern District - Ngwaketse (4)
  { name: 'Kanye Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Thamaga Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Moshupa Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Mmathethe Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  
  // Southern District - Rolong (2)
  { name: 'Goodhope Sub Land Board', parentBoard: 'Rolong Land Board', region: 'Southern' },
  { name: 'Phitshane-Molopo Sub Land Board', parentBoard: 'Rolong Land Board', region: 'Southern' },
  
  // South-East District - Malete (1)
  { name: 'Ramotswa Sub Land Board', parentBoard: 'Malete Land Board', region: 'South-East' },
  
  // North-East District - Tati (1)
  { name: 'Masunga Sub Land Board', parentBoard: 'Tati Land Board', region: 'North-East' },
  
  // Kgalagadi District (2)
  { name: 'Tsabong Sub Land Board', parentBoard: 'Kgalagadi Land Board', region: 'Kgalagadi' },
  { name: 'Hukuntsi Sub Land Board', parentBoard: 'Kgalagadi Land Board', region: 'Kgalagadi' },
  
  // Ghanzi District (1)
  { name: 'Charleshill Sub Land Board', parentBoard: 'Ghanzi Land Board', region: 'Ghanzi' },
  
  // North-West District (1)
  { name: 'Gumare Sub Land Board', parentBoard: 'North West Land Board', region: 'North-West' },
  
  // Chobe District (1)
  { name: 'Kasane Sub Land Board', parentBoard: 'Chobe Land Board', region: 'Chobe' },
];

// ========== HELPER FUNCTIONS ==========
let userCounter = 1;
let appCounter = 1;
let mainBoardCounter = 1;
let subBoardCounter = 1;

function generateUserNumber() {
  return `US${(userCounter++).toString().padStart(6, '0')}`;
}

function generateApplicationNumber(year = new Date().getFullYear()) {
  return `APP${year}${(appCounter++).toString().padStart(6, '0')}`;
}

const FIRST_NAMES = {
  male: ['Thabo', 'Kagiso', 'Boitsholo', 'Olebile', 'Mpho', 'Tumelo', 'Modisa', 'Kgosi', 'Lesego', 'Thato'],
  female: ['Keitumetse', 'Lorato', 'Bontle', 'Tshireletso', 'Goitsemang', 'Kelebogile', 'Masego', 'Boitumelo', 'Gofaone', 'Wame']
};

const LAST_NAMES = ['Molefe', 'Modise', 'Kelebeng', 'Raditladi', 'Mmusi', 'Kgafela', 'Sechele', 'Montsho', 'Tawana', 'Moroka'];

function generateOmang(gender) {
  const prefix = Math.floor(1000 + Math.random() * 9000).toString();
  const genderDigit = gender === 'male' ? '1' : '2';
  const suffix = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
  return parseInt(prefix + genderDigit + suffix);
}

function generateBotswanaMobile() {
  return `7${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
}

function generateEmail(firstName, lastName, index) {
  const domains = ['gmail.com', 'yahoo.com', 'botswana.co.bw', 'btc.bw'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@${domain}`;
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== MAIN SEEDING FUNCTION ==========
async function main() {
  console.log('\n🌱 KABODITSHA DATABASE SEEDING - REALISTIC BOTSWANA DATA (80% Scale)');
  console.log('===================================================================\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.$executeRaw`TRUNCATE TABLE "waiting_list_stats" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "audit_logs" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "status_history" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "notifications" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "documents" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "applications" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "land_boards" RESTART IDENTITY CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`;
    console.log('✅ All tables cleared\n');

    // Create Main Land Boards
    console.log('📍 Creating 12 Main Land Boards...');
    const mainBoardsMap = new Map();
    const allBoards = [];

    for (const board of MAIN_LAND_BOARDS) {
      const backlog = BOARD_BACKLOGS[board.name];
      const created = await prisma.landBoard.create({
        data: {
          boardNumber: `MLB${(mainBoardCounter++).toString().padStart(3, '0')}`,
          name: board.name,
          type: 'MAIN',
          region: board.region,
          jurisdiction: `${board.name} jurisdiction - ${board.region} District`,
          officeAddress: `Private Bag, ${board.headquarters}`,
          contactInfo: `Tel: +267 XXX XXXX | Email: ${board.name.toLowerCase().replace(/\s/g, '')}@gov.bw`,
          totalAllocations: backlog ? Math.round(backlog.pending * 0.15) : randomInt(1000, 5000),
          monthlyRate: backlog ? Math.round(backlog.pending * 0.005) : randomInt(50, 200),
        },
      });
      mainBoardsMap.set(board.name, created);
      allBoards.push(created);
      console.log(`  ✓ ${created.boardNumber} - ${board.name} (${board.region})`);
    }

    // Create Subordinate Land Boards
    console.log('\n📍 Creating 41 Subordinate Land Boards...');
    for (const subBoard of SUBORDINATE_LAND_BOARDS) {
      const parentBoard = mainBoardsMap.get(subBoard.parentBoard);
      if (!parentBoard) continue;
      
      const created = await prisma.landBoard.create({
        data: {
          boardNumber: `SLB${(subBoardCounter++).toString().padStart(3, '0')}`,
          name: subBoard.name,
          type: 'SUBORDINATE',
          parentBoardId: parentBoard.landBoardId,
          region: subBoard.region,
          jurisdiction: `${subBoard.name} jurisdiction`,
          officeAddress: `c/o ${parentBoard.officeAddress}`,
          contactInfo: `Tel: +267 XXX XXXX | Email: ${subBoard.name.toLowerCase().replace(/\s/g, '')}@gov.bw`,
          totalAllocations: randomInt(50, 500),
          monthlyRate: randomInt(5, 35),
        },
      });
      allBoards.push(created);
      console.log(`  ✓ ${created.boardNumber} - ${subBoard.name} (${subBoard.region})`);
    }
    
    console.log(`\n✅ Created ${allBoards.length} Land Boards (12 Main + ${allBoards.length - 12} Sub)\n`);

    // Create users and applications with realistic backlogs
    console.log('👥 Creating users and applications with realistic backlogs...');
    const hashedPassword = await bcrypt.hash('Password123', 10);
    const usedOmangs = new Set();
    const usedEmails = new Set();
    
    let totalUsers = 0;
    let totalApps = 0;
    const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];
    const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
    
    // Create applications for each main board based on realistic backlog
    for (const [boardName, backlog] of Object.entries(BOARD_BACKLOGS)) {
      const board = mainBoardsMap.get(boardName);
      if (!board) continue;
      
      console.log(`\n  📍 ${boardName}: Creating ${backlog.pending.toLocaleString()} applications...`);
      
      // Calculate distribution of statuses
      const approved = Math.round(backlog.pending * 0.15);
      const rejected = Math.round(backlog.pending * backlog.disqualificationRate);
      const withdrawn = Math.round(backlog.pending * 0.02);
      const active = backlog.pending - approved - rejected - withdrawn;
      
      // Distribute active statuses
      const submitted = Math.round(active * 0.45);
      const underReview = Math.round(active * 0.20);
      const documentsVerified = Math.round(active * 0.10);
      const otherActive = active - submitted - underReview - documentsVerified;
      
      // Create applications
      for (let i = 0; i < backlog.pending; i++) {
        // Determine status based on distribution
        let status;
        if (i < approved) status = 'APPROVED';
        else if (i < approved + rejected) status = 'REJECTED';
        else if (i < approved + rejected + withdrawn) status = 'WITHDRAWN';
        else if (i < approved + rejected + withdrawn + submitted) status = 'SUBMITTED';
        else if (i < approved + rejected + withdrawn + submitted + underReview) status = 'UNDER_REVIEW';
        else if (i < approved + rejected + withdrawn + submitted + underReview + documentsVerified) status = 'DOCUMENTS_VERIFIED';
        else status = 'SUBMITTED';
        
        // Determine settlement type (60% VILLAGE, 25% TOWN, 15% FARM)
        let settlementType;
        const rand = Math.random();
        if (rand < 0.6) settlementType = 'VILLAGE';
        else if (rand < 0.85) settlementType = 'TOWN';
        else settlementType = 'FARM';
        
        // Determine purpose
        let purpose;
        if (settlementType === 'FARM') purpose = 'Agricultural - Ploughing';
        else if (Math.random() < 0.8) purpose = 'Residential';
        else purpose = 'Commercial';
        
        // Create dates with proper ordering
        const submittedYear = randomInt(2005, 2026);
        const submittedAt = randomDate(2005, 2026);
        
        let approvedAt = null;
        let reviewedAt = null;
        let rejectionReason = null;
        
        if (status === 'APPROVED') {
          // Approval must be after submission
          const approvalDelay = randomInt(30, 730); // 1 month to 2 years
          approvedAt = new Date(submittedAt.getTime() + approvalDelay * 24 * 60 * 60 * 1000);
          reviewedAt = approvedAt;
        } else if (status === 'REJECTED') {
          const rejectionDelay = randomInt(30, 120);
          reviewedAt = new Date(submittedAt.getTime() + rejectionDelay * 24 * 60 * 60 * 1000);
          rejectionReason = 'Applicant already allocated a plot in this settlement type';
        } else if (status === 'WITHDRAWN') {
          const withdrawDelay = randomInt(30, 365);
          reviewedAt = new Date(submittedAt.getTime() + withdrawDelay * 24 * 60 * 60 * 1000);
          rejectionReason = 'Plot returned or applicant withdrew';
        } else if (status === 'UNDER_REVIEW' || status === 'DOCUMENTS_VERIFIED') {
          const reviewDelay = randomInt(30, 180);
          reviewedAt = new Date(submittedAt.getTime() + reviewDelay * 24 * 60 * 60 * 1000);
        }
        
        // Create user if needed (reuse existing or create new)
        const useExistingUser = Math.random() < 0.3 && totalUsers > 0;
        let userId;
        
        if (useExistingUser) {
          const existingUser = await prisma.user.findFirst({
            where: { role: 'APPLICANT' },
            skip: Math.floor(Math.random() * totalUsers)
          });
          if (existingUser) userId = existingUser.userId;
        }
        
        if (!userId) {
          const gender = Math.random() > 0.5 ? 'male' : 'female';
          const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
          const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          
          let omangNumber;
          do { omangNumber = generateOmang(gender); } while (usedOmangs.has(omangNumber));
          usedOmangs.add(omangNumber);
          
          let email;
          do { email = generateEmail(firstName, lastName, totalUsers); } while (usedEmails.has(email));
          usedEmails.add(email);
          
          const user = await prisma.user.create({
            data: {
              userNumber: generateUserNumber(),
              email,
              password: hashedPassword,
              fullName: `${firstName} ${lastName}`,
              omangNumber,
              phone: generateBotswanaMobile(),
              role: 'APPLICANT',
              emailVerified: true,
              createdAt: randomDate(2010, 2024),
            }
          });
          userId = user.userId;
          totalUsers++;
        }
        
        // Create application
        const applicationNumber = generateApplicationNumber(submittedAt.getFullYear());
        await prisma.application.create({
          data: {
            applicationNumber,
            referenceNumber: applicationNumber,
            userId,
            landBoardId: board.landBoardId,
            settlementType,
            status,
            purpose,
            submittedAt,
            reviewedAt,
            approvedAt,
            rejectionReason,
            queuePosition: 0,
          }
        });
        totalApps++;
        
        // Progress indicator
        if (totalApps % 10000 === 0) {
          console.log(`     Created ${totalApps.toLocaleString()} applications so far...`);
        }
      }
      console.log(`     ✅ Completed ${backlog.pending.toLocaleString()} applications for ${boardName}`);
    }
    
    console.log(`\n✅ Created ${totalUsers.toLocaleString()} users and ${totalApps.toLocaleString()} applications\n`);
    
    // Create staff, managers, admins
    console.log('👥 Creating staff, managers, and admins...');
    
    // Staff for each sub-board
    const subBoards = allBoards.filter(b => b.type === 'SUBORDINATE');
    for (let i = 0; i < subBoards.length; i++) {
      const board = subBoards[i];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      let omangNumber;
      do { omangNumber = generateOmang(gender); } while (usedOmangs.has(omangNumber));
      usedOmangs.add(omangNumber);
      let email;
      do { email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.staff${i}@landboard.gov.bw`; } while (usedEmails.has(email));
      usedEmails.add(email);
      
      await prisma.user.create({
        data: {
          userNumber: generateUserNumber(),
          email,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          omangNumber,
          phone: generateBotswanaMobile(),
          role: 'STAFF',
          emailVerified: true,
          landBoardId: board.landBoardId,
        }
      });
    }
    
    // Managers for each main board
    const mainBoardsList = allBoards.filter(b => b.type === 'MAIN');
    for (let i = 0; i < mainBoardsList.length; i++) {
      const board = mainBoardsList[i];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      let omangNumber;
      do { omangNumber = generateOmang(gender); } while (usedOmangs.has(omangNumber));
      usedOmangs.add(omangNumber);
      let email;
      do { email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.manager${i}@landboard.gov.bw`; } while (usedEmails.has(email));
      usedEmails.add(email);
      
      await prisma.user.create({
        data: {
          userNumber: generateUserNumber(),
          email,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          omangNumber,
          phone: generateBotswanaMobile(),
          role: 'MANAGER',
          emailVerified: true,
          landBoardId: board.landBoardId,
        }
      });
    }
    
    // Admins
    for (let i = 0; i < TOTAL_ADMINS; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      let omangNumber;
      do { omangNumber = generateOmang(gender); } while (usedOmangs.has(omangNumber));
      usedOmangs.add(omangNumber);
      let email;
      do { email = `admin${i}.${Math.floor(Math.random() * 10000)}@kaboditsha.gov.bw`; } while (usedEmails.has(email));
      usedEmails.add(email);
      
      await prisma.user.create({
        data: {
          userNumber: generateUserNumber(),
          email,
          password: hashedPassword,
          fullName: `${firstName} ${lastName}`,
          omangNumber,
          phone: generateBotswanaMobile(),
          role: 'ADMIN',
          emailVerified: true,
        }
      });
    }
    
    const finalUserCount = await prisma.user.count();
    console.log(`✅ Created ${finalUserCount.toLocaleString()} total users\n`);
    
    // Rebalance queue positions
    console.log('🔄 Rebalancing queue positions...');
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
        }
      }
    }
    console.log('✅ Queue positions updated\n');
    
    // Update waiting list stats
    console.log('📊 Updating waiting list statistics...');
    for (const board of allBoards) {
      for (const settlementType of settlementTypes) {
        const activeApps = await prisma.application.findMany({
          where: {
            landBoardId: board.landBoardId,
            settlementType,
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
          }
        });
        const oldestApp = activeApps[0];
        const backlog = BOARD_BACKLOGS[board.name];
        
        await prisma.waitingListStat.upsert({
          where: { landBoardId_settlementType: { landBoardId: board.landBoardId, settlementType } },
          update: {
            totalCount: activeApps.length,
            eligibleCount: Math.round(activeApps.length * (1 - (backlog?.disqualificationRate || 0.15))),
            oldestDate: oldestApp?.submittedAt || new Date(),
            averageWaitMonths: backlog?.avgWaitMonths || randomInt(12, 60),
          },
          create: {
            landBoardId: board.landBoardId,
            settlementType,
            totalCount: activeApps.length,
            eligibleCount: Math.round(activeApps.length * (1 - (backlog?.disqualificationRate || 0.15))),
            oldestDate: oldestApp?.submittedAt || new Date(),
            averageWaitMonths: backlog?.avgWaitMonths || randomInt(12, 60),
          }
        });
      }
    }
    console.log('✅ Waiting list stats updated\n');
    
    // Final summary
    console.log('==================================================');
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================\n');
    
    console.log('📊 DATABASE SUMMARY:');
    console.log(`   • Land Boards: ${allBoards.length} (12 Main + ${allBoards.length - 12} Sub)`);
    console.log(`   • Total Users: ${finalUserCount.toLocaleString()}`);
    console.log(`   • Total Applications: ${totalApps.toLocaleString()}`);
    console.log(`   • Settlement Types: TOWN, VILLAGE, FARM (CITY removed - state land)`);
    
    console.log('\n📈 REALISTIC BACKLOG TOTALS:');
    let totalBacklog = 0;
    for (const [name, backlog] of Object.entries(BOARD_BACKLOGS)) {
      totalBacklog += backlog.pending;
      console.log(`   • ${name}: ${backlog.pending.toLocaleString()} pending (${Math.round(backlog.disqualificationRate * 100)}% disqualification rate, ~${backlog.avgWaitMonths} months avg wait)`);
    }
    console.log(`\n   📊 NATIONAL TOTAL: ${totalBacklog.toLocaleString()} pending applications (80% of real-world scale)`);
    
    console.log('\n🔑 TEST CREDENTIALS (all use Password123):');
    console.log('   • Admin: admin0.xxxx@kaboditsha.gov.bw');
    console.log('   • Staff: any staff@landboard.gov.bw account');
    console.log('   • Manager: any manager@landboard.gov.bw account');
    console.log('   • Applicant: any generated email\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });