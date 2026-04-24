const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function fix() {
  console.log('Ì¥ê Fixing passwords...');
  
  const hash = await bcrypt.hash('Password123', 10);
  console.log('Hash generated:', hash.substring(0, 30) + '...');
  
  const result = await prisma.user.updateMany({
    data: { 
      password: hash,
      emailVerified: true 
    }
  });
  
  console.log(`‚úÖ Updated ${result.count} users`);
  
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    console.log('\nÌ¥ë TEST CREDENTIALS:');
    console.log(`   Admin: ${admin.email}`);
    console.log('   Password: Password123');
  }
  
  await prisma.$disconnect();
}

fix().catch(console.error);
