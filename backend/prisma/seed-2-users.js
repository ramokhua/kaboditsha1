// seed-2-users.js - Creates Staff, Managers, and Admins
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

function generateOmang(gender) { 
  const prefix = Math.floor(1000 + Math.random() * 9000); 
  const genderDigit = gender === 'male' ? 1 : 2; 
  const suffix = Math.floor(1000 + Math.random() * 9000); 
  return parseInt(`${prefix}${genderDigit}${suffix}`); 
}

const FIRST_NAMES = { male: ['Thabo', 'Kagiso', 'Mpho', 'Tumelo', 'Kgosi'], female: ['Keitumetse', 'Lorato', 'Bontle', 'Masego', 'Boitumelo'] };
const LAST_NAMES = ['Molefe', 'Modise', 'Raditladi', 'Mmusi', 'Kgafela'];

async function getNextUserNumber() {
  const lastUser = await prisma.user.findFirst({
    orderBy: { userNumber: 'desc' }
  });
  if (!lastUser || !lastUser.userNumber) return 'US000001';
  const lastNumber = parseInt(lastUser.userNumber.replace('US', ''));
  const nextNumber = lastNumber + 1;
  return `US${nextNumber.toString().padStart(6, '0')}`;
}

async function main() {
  console.log('\n��� PART 2: Creating Staff, Managers, and Admins...\n');
  
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const usedOmangs = new Set();
  const usedEmails = new Set();
  
  // Load existing users to avoid duplicates
  const existingUsers = await prisma.user.findMany({ select: { omangNumber: true, email: true, userNumber: true } });
  existingUsers.forEach(u => {
    usedOmangs.add(u.omangNumber);
    usedEmails.add(u.email);
  });
  
  // Get all boards
  const allBoards = await prisma.landBoard.findMany();
  const mainBoards = allBoards.filter(b => b.type === 'MAIN');
  const subBoards = allBoards.filter(b => b.type === 'SUBORDINATE');
  
  console.log(`Found ${mainBoards.length} Main Boards and ${subBoards.length} Subordinate Boards\n`);
  
  let createdCount = 0;
  
  // Create Staff for EACH main board (1 per main board)
  console.log('  Creating staff for MAIN boards...');
  for (const board of mainBoards) {
    const email = `staff.${board.name.toLowerCase().replace(/\s/g, '')}@landboard.gov.bw`;
    
    // Check if already exists
    if (usedEmails.has(email)) {
      console.log(`    ⏭️  Staff for ${board.name} already exists, skipping`);
      continue;
    }
    
    let omangNumber; 
    do { omangNumber = generateOmang('male'); } while (usedOmangs.has(omangNumber)); 
    usedOmangs.add(omangNumber);
    usedEmails.add(email);
    
    const userNumber = await getNextUserNumber();
    
    await prisma.user.create({
      data: {
        userNumber,
        email,
        password: hashedPassword,
        fullName: `Staff ${board.name}`,
        omangNumber,
        phone: `71${Math.random().toString().slice(2,9)}`,
        role: 'STAFF',
        emailVerified: true,
        landBoardId: board.landBoardId,
      }
    });
    createdCount++;
    console.log(`    ✓ Staff for ${board.name}`);
  }
  console.log(`  ✓ Created ${mainBoards.length} staff for main boards`);
  
  // Create Staff for each subordinate board
  console.log('\n  Creating staff for SUBORDINATE boards...');
  for (const board of subBoards) {
    const email = `staff.${board.name.toLowerCase().replace(/\s/g, '')}@landboard.gov.bw`;
    
    if (usedEmails.has(email)) {
      console.log(`    ⏭️  Staff for ${board.name} already exists, skipping`);
      continue;
    }
    
    let omangNumber; 
    do { omangNumber = generateOmang('male'); } while (usedOmangs.has(omangNumber)); 
    usedOmangs.add(omangNumber);
    usedEmails.add(email);
    
    const userNumber = await getNextUserNumber();
    
    await prisma.user.create({
      data: {
        userNumber,
        email,
        password: hashedPassword,
        fullName: `Staff ${board.name}`,
        omangNumber,
        phone: `71${Math.random().toString().slice(2,9)}`,
        role: 'STAFF',
        emailVerified: true,
        landBoardId: board.landBoardId,
      }
    });
    createdCount++;
  }
  console.log(`  ✓ Created ${subBoards.length} staff for subordinate boards`);
  
  // Create Managers for each main board
  console.log('\n  Creating managers...');
  for (const board of mainBoards) {
    const email = `manager.${board.name.toLowerCase().replace(/\s/g, '')}@landboard.gov.bw`;
    
    if (usedEmails.has(email)) {
      console.log(`    ⏭️  Manager for ${board.name} already exists, skipping`);
      continue;
    }
    
    let omangNumber; 
    do { omangNumber = generateOmang('female'); } while (usedOmangs.has(omangNumber)); 
    usedOmangs.add(omangNumber);
    usedEmails.add(email);
    
    const userNumber = await getNextUserNumber();
    
    await prisma.user.create({
      data: {
        userNumber,
        email,
        password: hashedPassword,
        fullName: `Manager ${board.name}`,
        omangNumber,
        phone: `72${Math.random().toString().slice(2,9)}`,
        role: 'MANAGER',
        emailVerified: true,
        landBoardId: board.landBoardId,
      }
    });
    createdCount++;
    console.log(`    ✓ Manager for ${board.name}`);
  }
  console.log(`  ✓ Created ${mainBoards.length} managers`);
  
  // Create Admins (only if less than 3 exist)
  console.log('\n  Creating admins...');
  const existingAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
  for (let i = existingAdmins; i < 3; i++) {
    const email = `admin${i}@kaboditsha.gov.bw`;
    
    let omangNumber; 
    do { omangNumber = generateOmang('male'); } while (usedOmangs.has(omangNumber)); 
    usedOmangs.add(omangNumber);
    usedEmails.add(email);
    
    const userNumber = await getNextUserNumber();
    
    await prisma.user.create({
      data: {
        userNumber,
        email,
        password: hashedPassword,
        fullName: `Admin ${i + 1}`,
        omangNumber,
        phone: `73${Math.random().toString().slice(2,9)}`,
        role: 'ADMIN',
        emailVerified: true,
      }
    });
    createdCount++;
    console.log(`    ✓ Admin: ${email}`);
  }
  console.log('  ✓ Created admins');
  
  // Summary
  const staffCount = await prisma.user.count({ where: { role: 'STAFF' } });
  const managerCount = await prisma.user.count({ where: { role: 'MANAGER' } });
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  
  console.log('\n✅ CREATION SUMMARY:');
  console.log(`   • New users created: ${createdCount}`);
  console.log(`   • Total Staff now: ${staffCount}`);
  console.log(`   • Total Managers now: ${managerCount}`);
  console.log(`   • Total Admins now: ${adminCount}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
