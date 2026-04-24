// backend/controllers/application.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/email.service');
const { moveTempToApplication } = require('./tempDocument.controller');

// ========== APPLICATION CRUD ==========

// Get all applications for logged-in user
const getMyApplications = async (req, res) => {
  try {
    console.log('Fetching applications for user:', req.user?.userId);
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId },
      include: {
        landBoard: {
          select: {
            name: true,
            region: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    console.log(`Found ${applications.length} applications for user`);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Create new application
const createApplication = async (req, res) => {
  try {
    const { landBoardId, settlementType, purpose, tempDocIds } = req.body;
    const userId = req.user.userId;

    console.log('Creating application for user:', userId);

    // Check for existing active application
    const existing = await prisma.application.findFirst({
      where: {
        userId,
        settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED'] }
      }
    });

    if (existing) {
      return res.status(400).json({ 
        error: `You already have an active application for ${settlementType}` 
      });
    }

    // Generate application number
    const year = new Date().getFullYear();
    const count = await prisma.application.count();
    const applicationNumber = `APP${year}${(count + 1).toString().padStart(6, '0')}`;

    // Calculate queue position
    const queuePosition = await prisma.application.count({
      where: {
        landBoardId,
        settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      }
    }) + 1;

    // Create application
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        referenceNumber: applicationNumber,
        userId,
        landBoardId,
        settlementType,
        purpose,
        queuePosition,
        status: 'SUBMITTED'
      },
      include: {
        landBoard: {
          select: {
            name: true,
            region: true
          }
        }
      }
    });

    // Move temp documents to permanent
    if (tempDocIds && tempDocIds.length > 0) {
      for (const tempId of tempDocIds) {
        await moveTempToApplication(tempId, application.applicationId);
      }
    }

    // Rebalance queue positions
    await rebalanceQueuePositions(landBoardId, settlementType);

    // Get user details for email notification
    const user = await prisma.user.findUnique({
      where: { userId }
    });
    
    console.log('Sending email to:', user.email);
    try {
      await sendEmail(user.email, 'applicationSubmitted', { user, application });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

// Get single application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('Fetching application:', id, 'for user:', userId);

    const application = await prisma.application.findFirst({
      where: {
        applicationId: id,
        userId
      },
      include: {
        landBoard: true,
        documents: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

// Update application status (staff only)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.userId;

    console.log('Updating application:', id, 'to status:', status);

    const existingApp = await prisma.application.findUnique({
      where: { applicationId: id },
      include: { user: true }
    });

    if (!existingApp) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = await prisma.application.update({
      where: { applicationId: id },
      data: {
        status,
        notes,
        ...(status === 'UNDER_REVIEW' && { reviewedAt: new Date(), reviewedBy: userId }),
        ...(status === 'APPROVED' && { approvedAt: new Date(), approvedBy: userId }),
        ...(status === 'REJECTED' && { rejectionReason: notes })
      },
      include: {
        landBoard: true,
        user: true
      }
    });

    const activeStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'];
    const wasActive = activeStatuses.includes(existingApp.status);
    const isActive = activeStatuses.includes(status);

    if (wasActive !== isActive) {
      await rebalanceQueuePositions(existingApp.landBoardId, existingApp.settlementType);
      await refreshWaitingListStatsForBoard(existingApp.landBoardId, existingApp.settlementType);
    }

    // Send email notification for status change
    try {
      await sendEmail(application.user.email, 'statusUpdate', { user: application.user, application });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

// Recalculate queue positions for a specific board and settlement type
const rebalanceQueuePositions = async (landBoardId, settlementType) => {
  try {
    const activeApps = await prisma.application.findMany({
      where: {
        landBoardId,
        settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      },
      orderBy: { submittedAt: 'asc' }
    });

    for (let i = 0; i < activeApps.length; i++) {
      await prisma.application.update({
        where: { applicationId: activeApps[i].applicationId },
        data: { queuePosition: i + 1 }
      });
    }

    console.log(`Rebalanced ${activeApps.length} positions for ${landBoardId} - ${settlementType}`);
    return activeApps.length;
  } catch (error) {
    console.error('Error rebalancing queue positions:', error);
    throw error;
  }
};

// ========== DOCUMENT MANAGEMENT ==========

// Upload document for application
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF, JPEG, and PNG files are allowed' });
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationId: id,
        userId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const year = new Date().getFullYear();
    const count = await prisma.document.count();
    const documentNumber = `DOC${year}${(count + 1).toString().padStart(6, '0')}`;

    const document = await prisma.document.create({
      data: {
        documentNumber,
        applicationId: id,
        documentType: documentType,
        filename: file.originalname,
        filePath: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        verificationStatus: 'PENDING'
      }
    });
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document: ' + error.message });
  }
};

// Get documents for an application
const getApplicationDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await prisma.document.findMany({
      where: { applicationId: id },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({ where: { documentId: id } });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// ========== OPTIMIZED PUBLIC STATISTICS ==========

// Get aggregated monthly trends (fast - only returns 12 rows)
const getMonthlyTrends = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsToShow = parseInt(months);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToShow);
    
    const trends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', submitted_at) as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
        COUNT(CASE WHEN status IN ('SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED') THEN 1 END) as pending
      FROM applications
      WHERE submitted_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', submitted_at)
      ORDER BY month ASC
    `;
    
    const formattedTrends = trends.map(t => ({
      month: new Date(t.month).toLocaleString('default', { month: 'short' }),
      year: new Date(t.month).getFullYear(),
      submitted: Number(t.total),
      approved: Number(t.approved),
      rejected: Number(t.rejected),
      pending: Number(t.pending)
    }));
    
    res.json(formattedTrends);
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

// Get aggregated settlement stats (fast)
const getSettlementStats = async (req, res) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        settlement_type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        ROUND(COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as approval_rate
      FROM applications
      GROUP BY settlement_type
    `;
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching settlement stats:', error);
    res.status(500).json({ error: 'Failed to fetch settlement stats' });
  }
};

// Get gender stats (optimized)
const getGenderStatsOptimized = async (req, res) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN SUBSTRING(CAST(omang_number AS TEXT), 5, 1) = '1' THEN 1 END) as male,
        COUNT(CASE WHEN SUBSTRING(CAST(omang_number AS TEXT), 5, 1) = '2' THEN 1 END) as female
      FROM users
      WHERE role = 'APPLICANT'
    `;
    
    const total = Number(stats[0]?.male || 0) + Number(stats[0]?.female || 0);
    
    res.json({
      male: Number(stats[0]?.male || 0),
      female: Number(stats[0]?.female || 0),
      total
    });
  } catch (error) {
    console.error('Error fetching gender stats:', error);
    res.status(500).json({ error: 'Failed to fetch gender stats' });
  }
};

// Legacy getAllApplications - kept for backward compatibility but not recommended
const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      select: {
        applicationId: true,
        applicationNumber: true,
        settlementType: true,
        status: true,
        purpose: true,
        submittedAt: true,
        approvedAt: true,
        user: { select: { omangNumber: true } },
        landBoard: { select: { name: true, region: true } }
      }
    });
    
    console.log(`Fetched ${applications.length} applications for public stats`);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Legacy gender stats - kept for compatibility
const getGenderStats = async (req, res) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN SUBSTRING(CAST(omang_number AS TEXT), 5, 1) = '1' THEN 1 END) as male_count,
        COUNT(CASE WHEN SUBSTRING(CAST(omang_number AS TEXT), 5, 1) = '2' THEN 1 END) as female_count,
        COUNT(CASE 
          WHEN SUBSTRING(CAST(omang_number AS TEXT), 5, 1) NOT IN ('1', '2') 
          OR SUBSTRING(CAST(omang_number AS TEXT), 5, 1) IS NULL 
          THEN 1 END) as other_count
      FROM users
      WHERE role = 'APPLICANT'
    `;

    const perBoard = await prisma.$queryRaw`
      SELECT 
        lb.name as board,
        COUNT(CASE WHEN SUBSTRING(CAST(u.omang_number AS TEXT), 5, 1) = '1' THEN 1 END) as male,
        COUNT(CASE WHEN SUBSTRING(CAST(u.omang_number AS TEXT), 5, 1) = '2' THEN 1 END) as female
      FROM applications a
      JOIN users u ON a.user_id = u.user_id
      JOIN land_boards lb ON a.land_board_id = lb.land_board_id
      GROUP BY lb.name
    `;

    const formattedPerBoard = (perBoard || []).map(board => ({
      board: board.board,
      male: Number(board.male),
      female: Number(board.female)
    }));

    res.json({
      maleCount: Number(stats[0]?.male_count || 0),
      femaleCount: Number(stats[0]?.female_count || 0),
      otherCount: Number(stats[0]?.other_count || 0),
      perBoard: formattedPerBoard
    });
  } catch (error) {
    console.error('Error fetching gender stats:', error);
    res.status(500).json({ error: 'Failed to fetch gender statistics' });
  }
};

// Get application status distribution
const getStatusStats = async (req, res) => {
  try {
    const stats = await prisma.application.groupBy({
      by: ['status'],
      _count: true
    });

    const formattedStats = stats.map(stat => ({
      name: stat.status.replace('_', ' '),
      value: stat._count
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching status stats:', error);
    res.status(500).json({ error: 'Failed to fetch status statistics' });
  }
};

// Helper function to refresh stats for a specific board
const refreshWaitingListStatsForBoard = async (landBoardId, settlementType) => {
  try {
    const activeCount = await prisma.application.count({
      where: {
        landBoardId,
        settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      }
    });

    const oldestApp = await prisma.application.findFirst({
      where: {
        landBoardId,
        settlementType,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED'] }
      },
      orderBy: { submittedAt: 'asc' }
    });

    const avgWait = await calculateAverageWaitTime(landBoardId, settlementType);

    await prisma.waitingListStat.upsert({
      where: {
        landBoardId_settlementType: {
          landBoardId,
          settlementType: settlementType
        }
      },
      update: {
        totalCount: activeCount,
        eligibleCount: Math.floor(activeCount * 0.7),
        oldestDate: oldestApp?.submittedAt || new Date(),
        averageWaitMonths: Math.round(avgWait),
        updatedAt: new Date()
      },
      create: {
        landBoardId,
        settlementType,
        totalCount: activeCount,
        eligibleCount: Math.floor(activeCount * 0.7),
        oldestDate: oldestApp?.submittedAt || new Date(),
        averageWaitMonths: Math.round(avgWait)
      }
    });
  } catch (error) {
    console.error('Error refreshing stats:', error);
  }
};

async function calculateAverageWaitTime(landBoardId, settlementType) {
  const approvedApps = await prisma.application.findMany({
    where: {
      landBoardId,
      settlementType,
      status: 'APPROVED'
    },
    select: { submittedAt: true, approvedAt: true }
  });

  if (approvedApps.length === 0) return 0;
  
  const totalDays = approvedApps.reduce((sum, app) => {
    const days = (app.approvedAt - app.submittedAt) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  
  return totalDays / approvedApps.length;
}

// ========== EXPORTS ==========

module.exports = {
  // Application CRUD
  getMyApplications,
  createApplication,
  getApplicationById,
  updateStatus,
  rebalanceQueuePositions,
  
  // Document Management
  uploadDocument,
  getApplicationDocuments,
  deleteDocument,
  
  // Public Statistics (Optimized)
  getMonthlyTrends,
  getSettlementStats,
  getGenderStatsOptimized,
  
  // Legacy (kept for compatibility)
  getGenderStats,
  getStatusStats,
  getAllApplications,
  refreshWaitingListStatsForBoard
};