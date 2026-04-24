const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/email.service');
const { createAuditLog } = require('./admin.controller');

// ========== STATISTICS ==========

// Get manager dashboard statistics
const getStats = async (req, res) => {
  try {
    console.log('========== MANAGER STATS DEBUG ==========');
    console.log('Manager user ID:', req.user.userId);
    
    // Get manager's assigned board
    const manager = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: {
        assignedBoard: true
      }
    });

    console.log('Manager assigned board:', manager?.assignedBoard);

    if (!manager?.assignedBoard) {
      console.log('ERROR: Manager not assigned to any board');
      return res.status(400).json({ error: 'Manager not assigned to any land board' });
    }

    // Get the region
    let region = manager.assignedBoard.region;
    console.log('Initial region from assigned board:', region);
    
    // If assigned to subordinate board, find the main board's region
    if (manager.assignedBoard.type === 'SUBORDINATE' && manager.assignedBoard.parentBoardId) {
      const mainBoard = await prisma.landBoard.findUnique({
        where: { landBoardId: manager.assignedBoard.parentBoardId }
      });
      if (mainBoard) {
        region = mainBoard.region;
        console.log('Region from main board:', region);
      }
    }

    // Get all land boards in the region
    const regionBoards = await prisma.landBoard.findMany({
      where: { region: region },
      select: { landBoardId: true, name: true, type: true }
    });
    
    const boardIds = regionBoards.map(b => b.landBoardId);
    console.log(`Region ${region} has ${boardIds.length} boards:`, regionBoards.map(b => ({ name: b.name, id: b.landBoardId })));

    // Get counts by status for the region
    const pending = await prisma.application.count({ where: { landBoardId: { in: boardIds }, status: 'SUBMITTED' } });
    const underReview = await prisma.application.count({ where: { landBoardId: { in: boardIds }, status: 'UNDER_REVIEW' } });
    const verified = await prisma.application.count({ where: { landBoardId: { in: boardIds }, status: 'DOCUMENTS_VERIFIED' } });
    const approved = await prisma.application.count({ where: { landBoardId: { in: boardIds }, status: 'APPROVED' } });
    const rejected = await prisma.application.count({ where: { landBoardId: { in: boardIds }, status: 'REJECTED' } });

    console.log('Counts:', { pending, underReview, verified, approved, rejected });

    // Get staff counts per board
    const staffByBoard = await prisma.user.groupBy({
      by: ['landBoardId'],
      where: {
        role: { in: ['STAFF', 'MANAGER'] },
        landBoardId: { in: boardIds }
      },
      _count: true
    });

    const response = {
      pending,
      underReview,
      verified,
      approved,
      rejected,
      total: pending + underReview + verified + approved + rejected,
      region: region,
      boardsCount: regionBoards.length,
      staffCount: staffByBoard.reduce((sum, s) => sum + s._count, 0),
      boards: regionBoards
    };
    
    console.log('Response:', response);
    console.log('========================================');
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// ========== REGION PERFORMANCE ==========

// Get region performance metrics with real data for analytics
const getRegionPerformance = async (req, res) => {
  try {
    const { range = '6months' } = req.query;
    
    const manager = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: { assignedBoard: true }
    });

    if (!manager?.assignedBoard) {
      return res.status(400).json({ error: 'Manager not assigned to any land board' });
    }

    // Get region from main board if subordinate
    let region = manager.assignedBoard.region;
    if (manager.assignedBoard.type === 'SUBORDINATE' && manager.assignedBoard.parentBoardId) {
      const mainBoard = await prisma.landBoard.findUnique({
        where: { landBoardId: manager.assignedBoard.parentBoardId }
      });
      if (mainBoard) region = mainBoard.region;
    }

    // Get all boards in region
    const regionBoards = await prisma.landBoard.findMany({
      where: { region: region },
      include: {
        _count: {
          select: { applications: true, staff: true }
        }
      }
    });

    const boardIds = regionBoards.map(b => b.landBoardId);

    // Determine date range
    let startDate = new Date();
    if (range === '3months') startDate.setMonth(startDate.getMonth() - 3);
    else if (range === '6months') startDate.setMonth(startDate.getMonth() - 6);
    else if (range === '1year') startDate.setFullYear(startDate.getFullYear() - 1);

    // Monthly trends for the selected range
    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', submitted_at) as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'DOCUMENTS_VERIFIED' THEN 1 END) as verified,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
      FROM applications
      WHERE land_board_id IN (${boardIds.join(',')})
        AND submitted_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', submitted_at)
      ORDER BY month ASC
    `;

    // Format monthly trends
    const formattedTrends = monthlyTrends.map(t => ({
      month: new Date(t.month).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      total: Number(t.total),
      submitted: Number(t.submitted),
      underReview: Number(t.under_review),
      verified: Number(t.verified),
      approved: Number(t.approved),
      rejected: Number(t.rejected)
    }));

    // Performance by board with efficiency
    const boardPerformance = await Promise.all(regionBoards.map(async (board) => {
      const statusCounts = await prisma.application.groupBy({
        by: ['status'],
        where: { landBoardId: board.landBoardId },
        _count: true
      });
      
      const counts = {};
      statusCounts.forEach(s => { counts[s.status] = s._count; });
      
      return {
        id: board.landBoardId,
        name: board.name,
        type: board.type,
        totalApplications: board._count.applications,
        staffCount: board._count.staff,
        efficiency: board._count.staff > 0 ? Math.round(board._count.applications / board._count.staff) : 0,
        submitted: counts.SUBMITTED || 0,
        underReview: counts.UNDER_REVIEW || 0,
        verified: counts.DOCUMENTS_VERIFIED || 0,
        approved: counts.APPROVED || 0,
        rejected: counts.REJECTED || 0
      };
    }));

    // Calculate region totals
    const regionTotals = boardPerformance.reduce((acc, board) => ({
      totalApplications: acc.totalApplications + board.totalApplications,
      approved: acc.approved + board.approved,
      pending: acc.pending + board.submitted,
      underReview: acc.underReview + board.underReview
    }), { totalApplications: 0, approved: 0, pending: 0, underReview: 0 });

    // Get applications by settlement type
    const settlementDistribution = await prisma.$queryRaw`
      SELECT 
        settlement_type,
        COUNT(*) as count
      FROM applications
      WHERE land_board_id IN (${boardIds.join(',')})
      GROUP BY settlement_type
    `;

    // Status distribution for line chart
    const statusDistribution = [
      { name: 'Submitted', value: regionTotals.pending },
      { name: 'Under Review', value: regionTotals.underReview },
      { name: 'Documents Verified', value: boardPerformance.reduce((sum, b) => sum + b.verified, 0) },
      { name: 'Approved', value: regionTotals.approved },
      { name: 'Rejected', value: boardPerformance.reduce((sum, b) => sum + b.rejected, 0) }
    ];

    res.json({
      region,
      regionTotals,
      boards: boardPerformance,
      monthlyTrends: formattedTrends,
      settlementDistribution: settlementDistribution.map(s => ({
        name: s.settlement_type,
        count: Number(s.count)
      })),
      statusDistribution: statusDistribution,
      totalBoards: regionBoards.length,
      totalStaff: regionBoards.reduce((sum, b) => sum + b._count.staff, 0),
      totalApplications: regionTotals.totalApplications,
      verified: boardPerformance.reduce((sum, b) => sum + b.verified, 0),
      rejected: boardPerformance.reduce((sum, b) => sum + b.rejected, 0)
    });
  } catch (error) {
    console.error('Error fetching region performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

// Get region applications with filters
const getRegionApplications = async (req, res) => {
  try {
    const manager = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: { assignedBoard: true }
    });

    if (!manager?.assignedBoard) {
      return res.status(400).json({ error: 'Manager not assigned to any land board' });
    }

    // Get region
    let region = manager.assignedBoard.region;
    if (manager.assignedBoard.type === 'SUBORDINATE' && manager.assignedBoard.parentBoardId) {
      const mainBoard = await prisma.landBoard.findUnique({
        where: { landBoardId: manager.assignedBoard.parentBoardId }
      });
      if (mainBoard) region = mainBoard.region;
    }

    // Get all boards in region
    const regionBoards = await prisma.landBoard.findMany({
      where: { region: region },
      select: { landBoardId: true }
    });
    const boardIds = regionBoards.map(b => b.landBoardId);

    const { status, board, search, settlementType } = req.query;

    const where = {
      landBoardId: { in: boardIds }
    };

    if (status) where.status = status;
    if (board) where.landBoardId = board;
    if (settlementType) where.settlementType = settlementType;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { omangNumber: { equals: parseInt(search) || undefined } } },
        { applicationNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            omangNumber: true,
            phone: true,
            email: true
          }
        },
        landBoard: {
          select: {
            name: true,
            region: true,
            type: true
          }
        },
        documents: {
          select: {
            documentId: true,
            documentType: true,
            filename: true,
            verificationStatus: true,
            uploadedAt: true
          },
          take: 3
        },
        _count: {
          select: { documents: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { submittedAt: 'desc' }
      ]
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching region applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get application details
const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: { assignedBoard: true }
    });

    if (!manager?.assignedBoard) {
      return res.status(400).json({ error: 'Manager not assigned to any land board' });
    }

    // Get region
    let region = manager.assignedBoard.region;
    if (manager.assignedBoard.type === 'SUBORDINATE' && manager.assignedBoard.parentBoardId) {
      const mainBoard = await prisma.landBoard.findUnique({
        where: { landBoardId: manager.assignedBoard.parentBoardId }
      });
      if (mainBoard) region = mainBoard.region;
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationId: id,
        landBoard: {
          region: region
        }
      },
      include: {
        user: {
          select: {
            fullName: true,
            omangNumber: true,
            phone: true,
            email: true,
            createdAt: true
          }
        },
        landBoard: {
          select: {
            name: true,
            region: true,
            type: true,
            officeAddress: true,
            contactInfo: true
          }
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'Failed to fetch application details' });
  }
};

// Update application status (Manager approval)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const manager = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: { assignedBoard: true }
    });

    if (!manager?.assignedBoard) {
      return res.status(400).json({ error: 'Manager not assigned to any land board' });
    }

    // Get region
    let region = manager.assignedBoard.region;
    if (manager.assignedBoard.type === 'SUBORDINATE' && manager.assignedBoard.parentBoardId) {
      const mainBoard = await prisma.landBoard.findUnique({
        where: { landBoardId: manager.assignedBoard.parentBoardId }
      });
      if (mainBoard) region = mainBoard.region;
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationId: id,
        landBoard: {
          region: region
        }
      },
      include: {
        user: true,
        landBoard: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const oldStatus = application.status;

    const updated = await prisma.application.update({
      where: { applicationId: id },
      data: {
        status,
        notes,
        ...(status === 'APPROVED' && { approvedAt: new Date(), approvedBy: req.user.userId }),
        ...(status === 'REJECTED' && { rejectionReason: notes })
      }
    });

    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        status,
        notes: notes || `Manager ${status} application`,
        changedBy: req.user.userId,
        changedAt: new Date()
      }
    });

    await createAuditLog(
      req.user.userId,
      `Manager ${status} application ${application.applicationNumber} in ${application.landBoard.name}`,
      req.ip
    );

    if (oldStatus !== status) {
      try {
        await sendEmail(
          application.user.email,
          'statusUpdated',
          [application.user, updated, oldStatus, status]
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

// Get audit logs for manager's region (staff actions only)
const getRegionAuditLogs = async (req, res) => {
  try {
    console.log('========== MANAGER AUDIT LOGS ==========');
    
    // Get manager's assigned board
    const manager = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: { assignedBoard: true }
    });

    if (!manager?.assignedBoard) {
      return res.status(400).json({ error: 'Manager not assigned to any land board' });
    }

    // Get the region
    let region = manager.assignedBoard.region;
    console.log('Manager region:', region);
    
    // If assigned to subordinate board, find the main board's region
    if (manager.assignedBoard.type === 'SUBORDINATE' && manager.assignedBoard.parentBoardId) {
      const mainBoard = await prisma.landBoard.findUnique({
        where: { landBoardId: manager.assignedBoard.parentBoardId }
      });
      if (mainBoard) {
        region = mainBoard.region;
        console.log('Region from main board:', region);
      }
    }

    // Get all land boards in the region
    const regionBoards = await prisma.landBoard.findMany({
      where: { region: region },
      select: { landBoardId: true, name: true }
    });
    
    const boardIds = regionBoards.map(b => b.landBoardId);
    console.log(`Found ${boardIds.length} boards in region:`, regionBoards.map(b => b.name));

    // Get all STAFF and MANAGER users in these boards (excluding the current manager if you want only staff)
    const staffInRegion = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'MANAGER'] },
        landBoardId: { in: boardIds }
      },
      select: { userId: true, fullName: true, email: true, landBoardId: true }
    });

    const staffIds = staffInRegion.map(s => s.userId);
    console.log(`Found ${staffIds.length} staff/managers in region`);

    // Build a map of userId to board name for quick lookup
    const staffBoardMap = {};
    staffInRegion.forEach(staff => {
      const board = regionBoards.find(b => b.landBoardId === staff.landBoardId);
      staffBoardMap[staff.userId] = board?.name || 'Unknown';
    });

    // Get audit logs for those staff users
    const logs = await prisma.auditLog.findMany({
      where: {
        userld: { in: staffIds }
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 500
    });

    console.log(`Found ${logs.length} audit logs for region ${region}`);

    // Add board name to each log
    const logsWithBoard = logs.map(log => ({
      ...log,
      landBoard: staffBoardMap[log.userld] || 'N/A'
    }));

    res.json(logsWithBoard);
  } catch (error) {
    console.error('Error fetching region audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

module.exports = {
  getStats,
  getRegionApplications,
  getApplicationDetails,
  updateApplicationStatus,
  getRegionPerformance,
  getRegionAuditLogs
};