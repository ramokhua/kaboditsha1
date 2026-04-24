const { sendEmail } = require('./services/email.service');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email service...\n');
  
  // Mock user and application data
  const mockUser = {
    fullName: 'Test User',
    email: 'admissions.tktsystem@gmail.com'
  };
  
  const mockApplication = {
    applicationNumber: 'TEST-001',
    landBoard: { name: 'Test Land Board' },
    settlementType: 'CITY',
    queuePosition: 42
  };
  
  const result = await sendEmail(
    'admissions.tktsystem@gmail.com',
    'applicationSubmitted',
    [mockUser, mockApplication]
  );
  
  console.log('\nResult:', result);
}

testEmail();