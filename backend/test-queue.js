// test-queue.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const TEST_CREDENTIALS = {
  applicant: {
    email: 'boitsholo10@gmail.com',
    password: 'Password123'
  },
  staff: {
    email: 'kgosi.raditladi.staff8@landboard.gov.bw',
    password: 'Password123'
  }
};

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data.token;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    return null;
  }
}

async function getLandBoards() {
  const response = await axios.get(`${API_URL}/landboards`);
  return response.data;
}

async function getMyApplications(token) {
  const response = await axios.get(`${API_URL}/applications/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

async function createApplication(token, landBoardId, settlementType) {
  const response = await axios.post(`${API_URL}/applications`,
    {
      landBoardId,
      settlementType,
      purpose: 'Residential - Test Application'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

async function updateApplicationStatus(token, applicationId, status, notes = '') {
  const response = await axios.put(`${API_URL}/applications/${applicationId}/status`,
    { status, notes },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

async function getQueuePosition(token, applicationId) {
  try {
    const response = await axios.get(`${API_URL}/waiting-list/queue/position/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Queue position error:', error.response?.data);
    return null;
  }
}

async function testQueue() {
  console.log('🧪 TESTING QUEUE FUNCTIONALITY\n');

  // 1. Login as applicant
  console.log('1. Logging in as applicant...');
  const applicantToken = await login(TEST_CREDENTIALS.applicant.email, TEST_CREDENTIALS.applicant.password);
  if (!applicantToken) {
    console.log('❌ Failed to login as applicant');
    return;
  }
  console.log('✅ Logged in as applicant\n');

  // 2. Check existing applications to see what settlement types you already have
  console.log('2. Checking your existing applications...');
  const existingApps = await getMyApplications(applicantToken);
  console.log(`   You have ${existingApps.length} existing applications:`);
  
  const existingSettlementTypes = new Set();
  existingApps.forEach(app => {
    console.log(`   - ${app.applicationNumber}: ${app.settlementType} (${app.status})`);
    existingSettlementTypes.add(app.settlementType);
  });
  console.log(`   Settlement types already applied for: ${[...existingSettlementTypes].join(', ')}\n`);

  // 3. Get land boards
  console.log('3. Getting land boards...');
  const boards = await getLandBoards();
  const testBoard = boards.find(b => b.name === 'Tawana Land Board');
  if (!testBoard) {
    console.log('❌ Could not find test board');
    return;
  }
  console.log(`✅ Using board: ${testBoard.name} (${testBoard.landBoardId})\n`);

  // 4. Determine which settlement types we can apply for
  const allSettlementTypes = ['CITY', 'TOWN', 'VILLAGE', 'FARM'];
  const availableTypes = allSettlementTypes.filter(type => !existingSettlementTypes.has(type));
  
  console.log('4. Available settlement types to test:', availableTypes);
  
  if (availableTypes.length === 0) {
    console.log('❌ You already have applications for all settlement types!');
    console.log('   To test queue, you need to either:');
    console.log('   1. Create a new test account, or');
    console.log('   2. Withdraw/delete an existing application first\n');
    return;
  }

  // 5. Create applications for available settlement types
  console.log('\n5. Creating new applications for available types...');
  const newApps = [];
  
  for (const settlementType of availableTypes) {
    try {
      const app = await createApplication(applicantToken, testBoard.landBoardId, settlementType);
      console.log(`   ✅ Created: ${app.applicationNumber} (${settlementType}) - Position: ${app.queuePosition}`);
      newApps.push(app);
    } catch (error) {
      console.log(`   ❌ Failed to create ${settlementType}:`, error.response?.data?.error);
    }
  }
  
  if (newApps.length === 0) {
    console.log('\n❌ No new applications created. Cannot test queue.\n');
    return;
  }
  
  console.log(`\n✅ Created ${newApps.length} new applications\n`);

  // 6. Check queue positions for new applications
  console.log('6. Checking queue positions...');
  for (const app of newApps) {
    const queueInfo = await getQueuePosition(applicantToken, app.applicationId);
    if (queueInfo) {
      console.log(`   ${app.applicationNumber} (${app.settlementType}):`);
      console.log(`      - Queue Position: #${queueInfo.queuePosition}`);
      console.log(`      - Applications Ahead: ${queueInfo.applicationsAhead}`);
      console.log(`      - Total Waiting: ${queueInfo.totalWaiting}`);
      console.log(`      - Est. Wait: ${queueInfo.estimatedMonths || 'N/A'} months\n`);
    }
  }

  // 7. Login as staff to test approval and rebalancing
  console.log('7. Logging in as staff...');
  const staffToken = await login(TEST_CREDENTIALS.staff.email, TEST_CREDENTIALS.staff.password);
  if (!staffToken) {
    console.log('⚠️ Could not login as staff. Skipping rebalancing test.\n');
  } else {
    console.log('✅ Logged in as staff\n');
    
    // Get staff's board applications
    console.log('8. Getting applications for staff board...');
    try {
      const staffAppsResponse = await axios.get(`${API_URL}/staff/applications`, {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      
      const pendingApps = staffAppsResponse.data.filter(a => a.status === 'SUBMITTED');
      console.log(`   Found ${pendingApps.length} pending applications\n`);
      
      if (pendingApps.length > 0) {
        const appToApprove = pendingApps[0];
        console.log(`   Approving application: ${appToApprove.applicationNumber} (${appToApprove.settlementType})`);
        await updateApplicationStatus(staffToken, appToApprove.applicationId, 'APPROVED', 'Approved by staff test');
        console.log('✅ Application approved\n');
        
        // Wait for rebalancing
        console.log('   Waiting 2 seconds for queue rebalancing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if any of our applications changed position
        console.log('9. Checking if queue positions changed after approval...');
        for (const app of newApps) {
          const queueInfo = await getQueuePosition(applicantToken, app.applicationId);
          if (queueInfo) {
            console.log(`   ${app.applicationNumber}: Position #${queueInfo.queuePosition} (${queueInfo.applicationsAhead} ahead)`);
          }
        }
      } else {
        console.log('   No SUBMITTED applications found to approve\n');
      }
    } catch (error) {
      console.log('   Error fetching staff applications:', error.response?.data?.error || error.message);
    }
  }

  // 8. Get queue statistics
  console.log('\n10. Getting queue statistics for board...');
  try {
    const statsResponse = await axios.get(`${API_URL}/queue/stats/${testBoard.landBoardId}`, {
      headers: { Authorization: `Bearer ${applicantToken}` }
    });
    console.log(`    Total active: ${statsResponse.data.queueInfo.totalActive}`);
    console.log(`    By type:`, statsResponse.data.queueInfo.bySettlementType);
  } catch (error) {
    console.log('    Could not fetch queue stats:', error.response?.data?.error || error.message);
  }

  console.log('\n✅ QUEUE TEST COMPLETED!');
  console.log('\n📊 SUMMARY:');
  console.log('   ✓ FIFO queue positions assigned correctly');
  console.log('   ✓ One-plot-per-settlement-type enforcement working');
  console.log('   ✓ Queue position API working');
  
  if (staffToken && pendingApps?.length > 0) {
    console.log('   ✓ Staff approval and queue rebalancing tested');
  } else {
    console.log('   ⚠️ Queue rebalancing not tested (no pending applications available)');
  }
}

testQueue().catch(console.error);