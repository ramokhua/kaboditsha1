// generate-sql-seed.js - Generate SQL INSERT statements for Supabase
const fs = require('fs');

const SCALE_FACTOR = 0.01; // 1% scale for Supabase
const BATCH_SIZE = 1000;

const BOARD_BACKLOGS = {
  'Kgatleng Land Board': { pending: Math.round(152498 * SCALE_FACTOR), boardId: 'cmnr87ulg0002p4xulbaty2cl' },
  'Ngwato Land Board': { pending: Math.round(120000 * SCALE_FACTOR), boardId: 'cmnr87ujm0000p4xukj6cq7jv' },
  'Kweneng Land Board': { pending: Math.round(85000 * SCALE_FACTOR), boardId: 'cmnr87ulb0001p4xunhkpqo21' },
  'Ngwaketse Land Board': { pending: Math.round(65000 * SCALE_FACTOR), boardId: 'cmnr87ull0003p4xu0ypyu5tz' },
  'Tlokweng Land Board': { pending: Math.round(45000 * SCALE_FACTOR), boardId: 'cmnr87ult0005p4xudifo6eap' },
  'Tati Land Board': { pending: Math.round(30000 * SCALE_FACTOR), boardId: 'cmnr87umo000ap4xujp2zgm8v' },
  'North West Land Board': { pending: Math.round(25000 * SCALE_FACTOR), boardId: 'cmnr87umc0009p4xuewuik4ot' },
  'Rolong Land Board': { pending: Math.round(15000 * SCALE_FACTOR), boardId: 'cmnr87ulq0004p4xuz417j41u' },
  'Kgalagadi Land Board': { pending: Math.round(12000 * SCALE_FACTOR), boardId: 'cmnr87ulx0006p4xuj5c8ln3j' },
  'Ghanzi Land Board': { pending: Math.round(10000 * SCALE_FACTOR), boardId: 'cmnr87um60008p4xu1bdokbun' },
  'Chobe Land Board': { pending: Math.round(8000 * SCALE_FACTOR), boardId: 'cmnr87um10007p4xuqft3h8di' },
  'Malete Land Board': { pending: Math.round(35000 * SCALE_FACTOR), boardId: 'cmnr87umv000bp4xuch47vj5z' },
};

const FIRST_NAMES = ['Thabo', 'Kagiso', 'Mpho', 'Tumelo', 'Kgosi', 'Keitumetse', 'Lorato', 'Bontle', 'Masego', 'Boitumelo'];
const LAST_NAMES = ['Molefe', 'Modise', 'Raditladi', 'Mmusi', 'Kgafela', 'Sechele', 'Montsho', 'Tawana', 'Moroka'];
const SETTLEMENT_TYPES = ['TOWN', 'VILLAGE', 'FARM'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(startYear, endYear) { return new Date(startYear + Math.random() * (endYear - startYear), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1); }

let appCounter = 1;
let userCounter = 1;
let sqlChunks = [];

sqlChunks.push(`-- KaboDitsha Supabase Seed (${SCALE_FACTOR * 100}% Scale)
-- Run this in Supabase SQL Editor
-- Total applications: ~${Object.values(BOARD_BACKLOGS).reduce((a,b) => a + b.pending, 0)}

BEGIN;

`);

// Generate users and applications for each board
for (const [boardName, backlog] of Object.entries(BOARD_BACKLOGS)) {
  console.log(`Generating SQL for ${boardName} (${backlog.pending} apps)...`);
  
  for (let i = 0; i < backlog.pending; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${userCounter}@test.com`;
    const omangNumber = 100000000 + Math.floor(Math.random() * 899999999);
    const phone = `71${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
    const settlementType = randomItem(SETTLEMENT_TYPES);
    const submittedAt = randomDate(2018, 2026);
    const submittedDate = submittedAt.toISOString().split('T')[0];
    const status = Math.random() > 0.7 ? 'APPROVED' : 'SUBMITTED';
    const purpose = settlementType === 'FARM' ? 'Agricultural' : 'Residential';
    const userNumber = `US${(100000 + userCounter).toString().padStart(6, '0')}`;
    const applicationNumber = `APP${submittedAt.getFullYear()}${(appCounter).toString().padStart(6, '0')}`;
    
    // User INSERT
    sqlChunks.push(`INSERT INTO users (user_number, email, password, full_name, omang_number, phone, role, email_verified, created_at) VALUES (
  '${userNumber}',
  '${email}',
  '$2b$10$hash1234567890123456789012345678901234567890',
  '${firstName} ${lastName}',
  ${omangNumber},
  '${phone}',
  'APPLICANT',
  true,
  '${submittedDate}'
) ON CONFLICT (user_number) DO NOTHING;\n`);
    
    // Get the user_id (will need to be looked up - for SQL we use a subquery)
    sqlChunks.push(`DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT user_id INTO user_id FROM users WHERE user_number = '${userNumber}';
  
  INSERT INTO applications (application_number, reference_number, user_id, land_board_id, settlement_type, status, purpose, submitted_at, queue_position) VALUES (
    '${applicationNumber}',
    '${applicationNumber}',
    user_id,
    '${backlog.boardId}',
    '${settlementType}',
    '${status}',
    '${purpose}',
    '${submittedDate}',
    0
  ) ON CONFLICT (application_number) DO NOTHING;
END $$;\n`);
    
    appCounter++;
    userCounter++;
    
    // Write in batches to avoid memory issues
    if (sqlChunks.length > 1000) {
      fs.appendFileSync('supabase-seed.sql', sqlChunks.join(''));
      sqlChunks = [];
      console.log(`  Written ${userCounter} records...`);
    }
  }
}

// Write remaining chunks
if (sqlChunks.length > 0) {
  fs.appendFileSync('supabase-seed.sql', sqlChunks.join(''));
}

sqlChunks = [];
sqlChunks.push(`COMMIT;

-- Verification queries
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_applications FROM applications;
SELECT land_board_id, COUNT(*) FROM applications GROUP BY land_board_id;
`);

fs.appendFileSync('supabase-seed.sql', sqlChunks.join(''));

console.log('\n✅ SQL seed file created: supabase-seed.sql');
console.log(`📊 Total users: ${userCounter - 1}`);
console.log(`📊 Total applications: ${appCounter - 1}`);