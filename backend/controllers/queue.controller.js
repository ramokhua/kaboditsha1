// backend/controllers/queue.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get queue position changes (for polling)
const getQueueUpdates = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lastCheck } = req.query;
    
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 60000); // Last minute
    
    // Get applications that had status or queue position changes
    const applications = await prisma.application.findMany({
      where: {
        userId,
        OR: [
          { updatedAt: { gt: lastCheckDate } },
          { statusHistory: { some: { changedAt: { gt: lastCheckDate } } } }
        ]
      },
      include: {
        landBoard: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1
        }
      }
    });
    
    const updates = applications.map(app => ({
      applicationId: app.applicationId,
      applicationNumber: app.applicationNumber,
      status: app.status,
      queuePosition: app.queuePosition,
      landBoardName: app.landBoard.name,
      settlementType: app.settlementType,
      lastUpdate: app.updatedAt,
      latestStatusChange: app.statusHistory[0]?.changedAt || app.updatedAt
    }));
    
    res.json({ updates, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting queue updates:', error);
    res.status(500).json({ error: 'Failed to get queue updates' });
  }
};

// Get queue statistics for a specific board
const getQueueStats = async (req, res) => {
  try {
    const { landBoardId } = req.params;
    
    const stats = await prisma.waitingListStat.findMany({
      where: { landBoardId },
      include: { landBoard: true }
    });
    
    // Get position distribution
    const activeApps = await prisma.application.findMany({
      where: {
        landBoardId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      },
      orderBy: { queuePosition: 'asc' },
      select: {
        queuePosition: true,
        settlementType: true,
        status: true,
        submittedAt: true
      }
    });
    
    // Calculate percentiles
    const total = activeApps.length;
    const medianPos = total > 0 ? activeApps[Math.floor(total / 2)]?.queuePosition : null;
    
    res.json({
      boardName: stats[0]?.landBoard?.name,
      stats,
      queueInfo: {
        totalActive: total,
        medianQueuePosition: medianPos,
        bySettlementType: activeApps.reduce((acc, app) => {
          if (!acc[app.settlementType]) acc[app.settlementType] = 0;
          acc[app.settlementType]++;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
};

module.exports = {
  getQueueUpdates,
  getQueueStats
};