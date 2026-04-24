const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth.routes');
const applicationRoutes = require('./routes/application.routes');
const notificationRoutes = require('./routes/notification.routes');
const landBoardRoutes = require('./routes/landboard.routes'); 
const waitingListRoutes = require('./routes/waitinglist.routes');
const path = require('path');
const fs = require('fs');
const staffRoutes = require('./routes/staff.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const managerRoutes = require('./routes/manager.routes');
const queueRoutes = require('./routes/queue.routes');
const tempDocumentRoutes = require('./routes/tempDocument.routes');

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/temp', 'uploads/documents'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// ========== IMPROVED CORS CONFIGURATION ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://kaboditsha.vercel.app',
  'https://kaboditsha-git-main.vercel.app',
  'https://kaboditsha.vercel.app'
];

// CORS middleware with better handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all origins for now (for testing)
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Alternative: Use cors middleware as fallback
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow all origins temporarily for debugging
    return callback(null, true);
    
    // Restrict later:
    // if (allowedOrigins.indexOf(origin) !== -1) {
    //   callback(null, true);
    // } else {
    //   console.log('Blocked origin:', origin);
    //   callback(new Error('Not allowed by CORS'));
    // }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/landboards', landBoardRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/staff', staffRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/temp-documents', tempDocumentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to KaboDitsha API',
    endpoints: {
      health: '/api/health',
      landboards: '/api/landboards',
      statistics: '/api/statistics',
      landboardById: '/api/landboards/:id'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Get all land boards
app.get('/api/landboards', async (req, res) => {
  try {
    const landBoards = await prisma.landBoard.findMany({
      include: {
        subBoards: true,
        waitingListStats: true
      }
    });
    res.json(landBoards);
  } catch (error) {
    console.error('Error fetching land boards:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get waiting list statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = await prisma.waitingListStat.findMany({
      include: {
        landBoard: true
      }
    });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single land board by ID
app.get('/api/landboards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const landBoard = await prisma.landBoard.findUnique({
      where: { land_board_id: id },
      include: {
        subBoards: true,
        waitingListStats: true
      }
    });
    if (!landBoard) {
      return res.status(404).json({ error: 'Land board not found' });
    }
    res.json(landBoard);
  } catch (error) {
    console.error('Error fetching land board:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Prisma Studio: npx prisma studio`);
  console.log(`📁 Upload directories: ${uploadDirs.join(', ')}`);
  console.log(`🔍 Test endpoints:`);
  console.log(`   - Root: http://localhost:${PORT}/`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Land Boards: http://localhost:${PORT}/api/landboards`);
  console.log(`   - Statistics: http://localhost:${PORT}/api/statistics`);
});

// Cleanup expired temp documents every 24 hours
const { cleanupExpiredTempDocuments } = require('./controllers/tempDocument.controller');

// Run initial cleanup after server starts (optional)
setTimeout(async () => {
  console.log('🧹 Running initial temp document cleanup...');
  await cleanupExpiredTempDocuments();
}, 5000);

// Run cleanup every 24 hours
setInterval(async () => {
  console.log('🧹 Running scheduled temp document cleanup...');
  await cleanupExpiredTempDocuments();
}, 24 * 60 * 60 * 1000);