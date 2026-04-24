// backend/controllers/waitinglist.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get waiting list for a specific land board and settlement type
const getWaitingList = async (req, res) => {
  try {
    const { landBoardId, settlementType } = req.query;
    
    const where = {};
    if (landBoardId) where.landBoardId = landBoardId;
    if (settlementType) where.settlementType = settlementType;

    // Get active applications (not approved or rejected)
    const waitingApplications = await prisma.application.findMany({
      where: {
        ...where,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      },
      include: {
        user: {
          select: {
            fullName: true,
            omangNumber: true
          }
        },
        landBoard: {
          select: {
            name: true,
            region: true
          }
        }
      },
      orderBy: [
        { queuePosition: 'asc' },
        { submittedAt: 'asc' }
      ]
    });

    // Calculate statistics
    const totalWaiting = waitingApplications.length;
    const averageWaitTime = await calculateAverageWaitTime(landBoardId, settlementType);
    const oldestApplication = waitingApplications[0]?.submittedAt || null;

    // Calculate estimated wait time based on monthly allocation rate
    const monthlyRate = await getMonthlyAllocationRate(landBoardId, settlementType);
    const estimatedMonths = monthlyRate > 0 ? Math.ceil(totalWaiting / monthlyRate) : null;

    res.json({
      applications: waitingApplications.map(app => ({
        position: app.queuePosition,
        referenceNumber: app.applicationNumber,
        applicantName: app.user.fullName,
        submittedAt: app.submittedAt,
        status: app.status,
        settlementType: app.settlementType
      })),
      statistics: {
        totalWaiting,
        averageWaitTime: Math.round(averageWaitTime),
        estimatedMonths,
        oldestApplication,
        monthlyAllocationRate: monthlyRate
      },
      filters: {
        landBoardId: landBoardId || 'all',
        settlementType: settlementType || 'all'
      }
    });
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    res.status(500).json({ error: 'Failed to fetch waiting list' });
  }
};

// Get waiting list statistics for all boards (for homepage map)
const getAllWaitingListStats = async (req, res) => {
  try {
    // Get all land boards with their waiting list statistics
    const boards = await prisma.landBoard.findMany({
      include: {
        waitingListStats: true
      }
    });

    const stats = boards.map(board => ({
      landBoardId: board.landBoardId,
      boardName: board.name,
      region: board.region,
      totalWaiting: board.waitingListStats.reduce((sum, stat) => sum + stat.totalCount, 0),
      bySettlementType: board.waitingListStats.map(stat => ({
        settlementType: stat.settlementType,
        totalCount: stat.totalCount,
        eligibleCount: stat.eligibleCount,
        oldestDate: stat.oldestDate,
        averageWaitMonths: stat.averageWaitMonths
      }))
    }));

    // Get actual pending applications count for verification
    const pendingApps = await prisma.application.groupBy({
      by: ['landBoardId'],
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      },
      _count: true
    });

    // Create a map for quick lookup
    const pendingMap = {};
    pendingApps.forEach(app => {
      pendingMap[app.landBoardId] = app._count;
    });

    // Update stats with actual pending counts
    const enhancedStats = stats.map(stat => ({
      ...stat,
      totalWaiting: stat.totalWaiting || pendingMap[stat.landBoardId] || 0,
      pendingCount: pendingMap[stat.landBoardId] || 0
    }));

    res.json(enhancedStats);
  } catch (error) {
    console.error('Error fetching waiting list stats:', error);
    res.status(500).json({ error: 'Failed to fetch waiting list statistics' });
  }
};

// Get detailed queue position with estimated wait time
const getQueuePositionDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    
    const application = await prisma.application.findFirst({
      where: {
        applicationId,
        userId
      },
      include: {
        landBoard: true
      }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Calculate monthly allocation rate
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const approvedLast6Months = await prisma.application.count({
      where: {
        landBoardId: application.landBoardId,
        settlementType: application.settlementType,
        status: 'APPROVED',
        approvedAt: { gte: sixMonthsAgo }
      }
    });
    
    const monthlyRate = Math.round(approvedLast6Months / 6);
    const estimatedMonths = monthlyRate > 0 ? Math.ceil(application.queuePosition / monthlyRate) : null;
    
    // Get total waiting for this board/type
    const totalWaiting = await prisma.application.count({
      where: {
        landBoardId: application.landBoardId,
        settlementType: application.settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      }
    });
    
    // Get applications ahead
    const applicationsAhead = application.queuePosition - 1;
    
    // Calculate percentage through queue
    const percentThrough = totalWaiting > 0 ? Math.round((applicationsAhead / totalWaiting) * 100) : 0;
    
    // Get estimated date (if monthly rate available)
    let estimatedDate = null;
    if (estimatedMonths) {
      estimatedDate = new Date();
      estimatedDate.setMonth(estimatedDate.getMonth() + estimatedMonths);
    }
    
    res.json({
      applicationId: application.applicationId,
      applicationNumber: application.applicationNumber,
      queuePosition: application.queuePosition,
      totalWaiting,
      applicationsAhead,
      percentThrough,
      estimatedMonths,
      estimatedDate,
      monthlyAllocationRate: monthlyRate || null,
      landBoard: application.landBoard.name,
      settlementType: application.settlementType,
      status: application.status,
      submittedAt: application.submittedAt,
      queueDisplay: `${application.queuePosition} out of ${totalWaiting.toLocaleString()} applicants`,
      progressDisplay: `${percentThrough}% through the queue`
    });
  } catch (error) {
    console.error('Error getting queue position details:', error);
    res.status(500).json({ error: 'Failed to get queue position details' });
  }
};

// Get queue position for a specific applicant
const getMyQueuePosition = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const applications = await prisma.application.findMany({
      where: {
        userId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      },
      include: {
        landBoard: true
      },
      orderBy: { submittedAt: 'asc' }
    });

    const positions = await Promise.all(applications.map(async app => ({
      applicationId: app.applicationId,
      applicationNumber: app.applicationNumber,
      landBoard: app.landBoard.name,
      settlementType: app.settlementType,
      queuePosition: app.queuePosition,
      estimatedWaitMonths: await calculateEstimatedWait(app.landBoardId, app.settlementType, app.queuePosition),
      submittedAt: app.submittedAt
    })));

    res.json(positions);
  } catch (error) {
    console.error('Error fetching queue positions:', error);
    res.status(500).json({ error: 'Failed to fetch queue positions' });
  }
};

// Refresh waiting list statistics (admin only)
const refreshWaitingListStats = async (req, res) => {
  try {
    const boards = await prisma.landBoard.findMany();
    // Updated settlement types - removed CITY
    const settlementTypes = ['TOWN', 'VILLAGE', 'FARM'];
    
    for (const board of boards) {
      for (const settlementType of settlementTypes) {
        // Count active applications for this board and settlement type
        const activeApps = await prisma.application.count({
          where: {
            landBoardId: board.landBoardId,
            settlementType,
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
          }
        });
        
        // Find oldest application
        const oldestApp = await prisma.application.findFirst({
          where: {
            landBoardId: board.landBoardId,
            settlementType,
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
          },
          orderBy: { submittedAt: 'asc' }
        });
        
        // Calculate average wait time from approved applications
        const avgWait = await calculateAverageWaitTime(board.landBoardId, settlementType);
        
        // Update or create waiting list stat
        await prisma.waitingListStat.upsert({
          where: {
            landBoardId_settlementType: {
              landBoardId: board.landBoardId,
              settlementType: settlementType
            }
          },
          update: {
            totalCount: activeApps,
            eligibleCount: Math.floor(activeApps * 0.7),
            oldestDate: oldestApp?.submittedAt || new Date(),
            averageWaitMonths: Math.round(avgWait),
            updatedAt: new Date()
          },
          create: {
            landBoardId: board.landBoardId,
            settlementType: settlementType,
            totalCount: activeApps,
            eligibleCount: Math.floor(activeApps * 0.7),
            oldestDate: oldestApp?.submittedAt || new Date(),
            averageWaitMonths: Math.round(avgWait)
          }
        });
      }
    }
    
    res.json({ message: 'Waiting list statistics refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing waiting list stats:', error);
    res.status(500).json({ error: 'Failed to refresh statistics' });
  }
};

// Helper functions
async function calculateAverageWaitTime(landBoardId, settlementType) {
  const where = {};
  if (landBoardId) where.landBoardId = landBoardId;
  if (settlementType) where.settlementType = settlementType;
  
  const approvedApps = await prisma.application.findMany({
    where: {
      ...where,
      status: 'APPROVED'
    },
    select: {
      submittedAt: true,
      approvedAt: true
    }
  });

  if (approvedApps.length === 0) return 0;
  
  const totalDays = approvedApps.reduce((sum, app) => {
    const days = (app.approvedAt - app.submittedAt) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  
  return totalDays / approvedApps.length;
}

async function getMonthlyAllocationRate(landBoardId, settlementType) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const approvedLast6Months = await prisma.application.count({
    where: {
      landBoardId,
      settlementType,
      status: 'APPROVED',
      approvedAt: { gte: sixMonthsAgo }
    }
  });
  
  return Math.round(approvedLast6Months / 6);
}

async function calculateEstimatedWait(landBoardId, settlementType, queuePosition) {
  const monthlyRate = await getMonthlyAllocationRate(landBoardId, settlementType);
  if (monthlyRate === 0) return null;
  return Math.ceil(queuePosition / monthlyRate);
}

module.exports = {
  getWaitingList,
  getAllWaitingListStats,
  getMyQueuePosition,
  refreshWaitingListStats,
  getQueuePositionDetails
};