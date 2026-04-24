// seed-1-boards.js - Creates all Land Boards (12 Main + 41 Sub)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const SUBORDINATE_LAND_BOARDS = [
  { name: 'Palapye Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Serowe Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Shoshong Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Tonota Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Sefhare Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Rakops Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Paje Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Bobonong Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Maunatlala Sub Land Board', parentBoard: 'Ngwato Land Board', region: 'Central' },
  { name: 'Molepolole Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Mogoditshane Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Letlhakeng Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Lephephe Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Lentsweletau Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Motokwe Sub Land Board', parentBoard: 'Kweneng Land Board', region: 'Kweneng' },
  { name: 'Mochudi Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Oodi Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Mathubudukwane Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Artesia Sub Land Board', parentBoard: 'Kgatleng Land Board', region: 'Kgatleng' },
  { name: 'Kanye Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Thamaga Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Moshupa Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Mmathethe Sub Land Board', parentBoard: 'Ngwaketse Land Board', region: 'Southern' },
  { name: 'Goodhope Sub Land Board', parentBoard: 'Rolong Land Board', region: 'Southern' },
  { name: 'Phitshane-Molopo Sub Land Board', parentBoard: 'Rolong Land Board', region: 'Southern' },
  { name: 'Ramotswa Sub Land Board', parentBoard: 'Malete Land Board', region: 'South-East' },
  { name: 'Masunga Sub Land Board', parentBoard: 'Tati Land Board', region: 'North-East' },
  { name: 'Tsabong Sub Land Board', parentBoard: 'Kgalagadi Land Board', region: 'Kgalagadi' },
  { name: 'Hukuntsi Sub Land Board', parentBoard: 'Kgalagadi Land Board', region: 'Kgalagadi' },
  { name: 'Charleshill Sub Land Board', parentBoard: 'Ghanzi Land Board', region: 'Ghanzi' },
  { name: 'Gumare Sub Land Board', parentBoard: 'North West Land Board', region: 'North-West' },
  { name: 'Kasane Sub Land Board', parentBoard: 'Chobe Land Board', region: 'Chobe' },
];

let mainBoardCounter = 1;
let subBoardCounter = 1;

async function main() {
  console.log('\ní¼± PART 1: Creating Land Boards...\n');
  
  const mainBoardsMap = new Map();
  
  // Create Main Boards
  for (const board of MAIN_LAND_BOARDS) {
    const created = await prisma.landBoard.create({
      data: {
        boardNumber: `MLB${(mainBoardCounter++).toString().padStart(3, '0')}`,
        name: board.name,
        type: 'MAIN',
        region: board.region,
        officeAddress: `Private Bag, ${board.headquarters}`,
        contactInfo: `Email: ${board.name.toLowerCase().replace(/\s/g, '')}@gov.bw`,
      },
    });
    mainBoardsMap.set(board.name, created);
    console.log(`  âœ“ ${created.boardNumber} - ${board.name}`);
  }
  
  // Create Subordinate Boards
  for (const sub of SUBORDINATE_LAND_BOARDS) {
    const parent = mainBoardsMap.get(sub.parentBoard);
    if (!parent) continue;
    await prisma.landBoard.create({
      data: {
        boardNumber: `SLB${(subBoardCounter++).toString().padStart(3, '0')}`,
        name: sub.name,
        type: 'SUBORDINATE',
        parentBoardId: parent.landBoardId,
        region: sub.region,
      },
    });
  }
  
  const boardCount = await prisma.landBoard.count();
  console.log(`\nâœ… Created ${boardCount} Land Boards (12 Main + ${boardCount - 12} Sub)\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
