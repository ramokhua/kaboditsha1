// backend/controllers/staff.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/email.service');
const { createAuditLog } = require('./admin.controller');

// Get staff dashboard statistics
const getStats = async (req, res) => {
  try {
    const staff = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { landBoardId: true }
    });

    if (!staff.landBoardId) {
      return res.status(400).json({ error: 'Staff not assigned to any land board' });
    }

    const pending = await prisma.application.count({
      where: { landBoardId: staff.landBoardId, status: 'SUBMITTED' }
    });

    const underReview = await prisma.application.count({
      where: { landBoardId: staff.landBoardId, status: 'UNDER_REVIEW' }
    });

    const verified = await prisma.application.count({
      where: { landBoardId: staff.landBoardId, status: 'DOCUMENTS_VERIFIED' }
    });

    const approved = await prisma.application.count({
      where: { landBoardId: staff.landBoardId, status: 'APPROVED' }
    });

    const rejected = await prisma.application.count({
      where: { landBoardId: staff.landBoardId, status: 'REJECTED' }
    });

    const pendingDocuments = await prisma.document.count({
      where: {
        application: { landBoardId: staff.landBoardId },
        verificationStatus: 'PENDING'
      }
    });

    res.json({
      pending,
      underReview,
      verified,
      approved,
      rejected,
      pendingDocuments,
      total: pending + underReview + verified + approved + rejected
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get applications for staff's land board
const getBoardApplications = async (req, res) => {
  try {
    const staff = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { landBoardId: true }
    });

    if (!staff.landBoardId) {
      return res.status(400).json({ error: 'Staff not assigned to any land board' });
    }

    const { status, settlementType, search } = req.query;

    const where = { landBoardId: staff.landBoardId };
    if (status) where.status = status;
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
        user: { select: { fullName: true, omangNumber: true, phone: true, email: true } },
        landBoard: { select: { name: true, region: true } },
        documents: { select: { documentId: true, documentType: true, filename: true, verificationStatus: true, uploadedAt: true } },
        _count: { select: { documents: true } }
      },
      orderBy: [{ status: 'asc' }, { submittedAt: 'asc' }]
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching board applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get single application details for review
const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { landBoardId: true, fullName: true }
    });

    if (!staff?.landBoardId) {
      return res.status(400).json({ error: 'Staff not assigned to any land board' });
    }

    const application = await prisma.application.findFirst({
      where: { applicationId: id, landBoardId: staff.landBoardId },
      include: {
        user: { select: { fullName: true, omangNumber: true, phone: true, email: true, createdAt: true } },
        landBoard: { select: { name: true, region: true, officeAddress: true, contactInfo: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'desc' }, include: { user: { select: { fullName: true } } } }
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

// Helper function to create notification
const createInAppNotification = async (userId, subject, message, applicationId = null) => {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.notification.count();
    const notificationNumber = `NOT${year}${(count + 1).toString().padStart(6, '0')}`;

    await prisma.notification.create({
      data: {
        notificationNumber,
        userId,
        type: 'IN_APP',
        subject,
        message,
        sentAt: new Date()
      }
    });
    console.log(`In-app notification created for user ${userId}`);
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const staff = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { landBoardId: true, fullName: true }
    });

    const application = await prisma.application.findFirst({
      where: { applicationId: id, landBoardId: staff.landBoardId },
      include: { user: true, landBoard: true }
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
        ...(status === 'UNDER_REVIEW' && { reviewedAt: new Date(), reviewedBy: req.user.userId }),
        ...(status === 'APPROVED' && { approvedAt: new Date(), approvedBy: req.user.userId }),
        ...(status === 'REJECTED' && { rejectionReason: notes })
      }
    });

    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        status,
        notes: notes || `Status updated to ${status}`,
        changedBy: req.user.userId,
        changedAt: new Date()
      }
    });

    await createAuditLog(
      req.user.userId,
      `Updated application ${application.applicationNumber} status from ${oldStatus} to ${status}`,
      req.ip
    );

    // Create in-app notification for applicant
    let notificationSubject = '';
    let notificationMessage = '';
    
    switch (status) {
      case 'UNDER_REVIEW':
        notificationSubject = 'Application Under Review';
        notificationMessage = `Your application ${application.applicationNumber} is now under review.`;
        break;
      case 'APPROVED':
        notificationSubject = 'Application Approved! 🎉';
        notificationMessage = `Congratulations! Your application ${application.applicationNumber} has been approved.`;
        break;
      case 'REJECTED':
        notificationSubject = 'Application Update';
        notificationMessage = `Your application ${application.applicationNumber} has been reviewed. Please check your dashboard for details.`;
        break;
      default:
        notificationSubject = 'Application Status Updated';
        notificationMessage = `Your application ${application.applicationNumber} status has been updated to ${status.replace('_', ' ')}.`;
    }
    
    await createInAppNotification(
      application.user.userId,
      notificationSubject,
      notificationMessage,
      application.applicationId
    );

    // Send email notification on status change
    if (oldStatus !== status) {
      console.log('Status changed from', oldStatus, 'to', status);
      console.log('Sending email to:', application.user.email);
      try {
        await sendEmail(
          application.user.email,
          'statusUpdate',
          [application.user, updated]
        );
        console.log('Status update email sent successfully');
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

// Verify document
const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const document = await prisma.document.findUnique({
      where: { documentId: id },
      include: { 
        application: {
          include: { documents: true, user: true, landBoard: true }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const staff = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { landBoardId: true, fullName: true }
    });

    if (document.application.landBoardId !== staff.landBoardId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.document.update({
      where: { documentId: id },
      data: {
        verificationStatus: status,
        verifiedBy: req.user.userId,
        verifiedAt: new Date(),
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    await prisma.statusHistory.create({
      data: {
        applicationId: document.applicationId,
        status: document.application.status,
        notes: `Document ${document.documentType} ${status.toLowerCase()} by ${staff.fullName}`,
        changedBy: req.user.userId,
        changedAt: new Date()
      }
    });

    await createAuditLog(
      req.user.userId,
      `Verified document ${document.documentType} for application ${document.application.applicationNumber} as ${status}`,
      req.ip
    );

    // Create in-app notification for document verification
    const docStatusMessage = status === 'APPROVED' ? 'approved' : 'needs revision';
    await createInAppNotification(
      document.application.user.userId,
      `Document ${status === 'APPROVED' ? 'Verified' : 'Action Required'}`,
      `Your ${document.documentType} document has been ${docStatusMessage}.`,
      document.applicationId
    );

    // Send email for document verification
    try {
      await sendEmail(
        document.application.user.email,
        'statusUpdate',
        [document.application.user, { 
          ...document.application, 
          status: status === 'APPROVED' ? 'DOCUMENTS_VERIFIED' : 'ACTION_REQUIRED',
          applicationNumber: document.application.applicationNumber 
        }]
      );
      console.log('Document verification email sent');
    } catch (emailError) {
      console.error('Failed to send document verification email:', emailError);
    }

    // Check if all documents are verified
    const allDocs = await prisma.document.findMany({
      where: { applicationId: document.applicationId }
    });

    const allVerified = allDocs.every(doc => doc.verificationStatus === 'APPROVED');
    const anyRejected = allDocs.some(doc => doc.verificationStatus === 'REJECTED');
    
    let newStatus = null;
    
    if (allVerified) {
      newStatus = 'DOCUMENTS_VERIFIED';
    } else if (anyRejected && document.application.status !== 'REJECTED') {
      newStatus = 'UNDER_REVIEW';
    }

    if (newStatus) {
      await prisma.application.update({
        where: { applicationId: document.applicationId },
        data: { 
          status: newStatus,
          notes: `Status updated to ${newStatus} after document verification`
        }
      });

      await prisma.statusHistory.create({
        data: {
          applicationId: document.applicationId,
          status: newStatus,
          notes: `Application status updated after document verification`,
          changedBy: req.user.userId,
          changedAt: new Date()
        }
      });
      
      await createAuditLog(
        req.user.userId,
        `Auto-updated application ${document.application.applicationNumber} status to ${newStatus}`,
        req.ip
      );
      
      // Send email about status change
      try {
        await sendEmail(
          document.application.user.email,
          'statusUpdate',
          [document.application.user, { 
            ...document.application, 
            status: newStatus,
            applicationNumber: document.application.applicationNumber 
          }]
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    res.json({
      ...updated,
      applicationStatus: newStatus || document.application.status
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
};

// Add note to application
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const staff = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { landBoardId: true, fullName: true }
    });

    const application = await prisma.application.findFirst({
      where: { applicationId: id, landBoardId: staff.landBoardId }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = await prisma.application.update({
      where: { applicationId: id },
      data: {
        notes: application.notes 
          ? `${application.notes}\n[${new Date().toLocaleString()}] ${staff.fullName}: ${note}`
          : `[${new Date().toLocaleString()}] ${staff.fullName}: ${note}`
      }
    });

    await createAuditLog(
      req.user.userId,
      `Added note to application ${application.applicationNumber}`,
      req.ip
    );

    res.json(updated);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

module.exports = {
  getStats,
  getBoardApplications,
  getApplicationDetails,
  updateApplicationStatus,
  verifyDocument,
  addNote
};