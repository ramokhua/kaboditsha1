// backend/controllers/tempDocument.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Upload temporary document
const uploadTempDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    const file = req.file;
    const userId = req.user.userId;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }
    
    // Set expiry to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Create temp document record
    const tempDoc = await prisma.tempDocument.create({
      data: {
        documentType,
        filename: file.originalname,
        filePath: `/temp/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId,
        expiresAt
      }
    });
    
    res.status(201).json({
      tempId: tempDoc.tempId,
      documentType: tempDoc.documentType,
      filename: tempDoc.filename,
      fileSize: tempDoc.fileSize,
      mimeType: tempDoc.mimeType,
      uploadedAt: tempDoc.createdAt,
      isTemp: true
    });
    
  } catch (error) {
    console.error('Error uploading temp document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get temp document info
const getTempDocument = async (req, res) => {
  try {
    const { tempId } = req.params;
    const userId = req.user.userId;
    
    const tempDoc = await prisma.tempDocument.findFirst({
      where: {
        tempId,
        userId,
        expiresAt: { gt: new Date() }
      }
    });
    
    if (!tempDoc) {
      return res.status(404).json({ error: 'Document not found or expired' });
    }
    
    res.json(tempDoc);
  } catch (error) {
    console.error('Error fetching temp document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

// Move temp document to permanent application
const moveTempToApplication = async (tempId, applicationId) => {
  try {
    const tempDoc = await prisma.tempDocument.findUnique({
      where: { tempId }
    });
    
    if (!tempDoc) {
      throw new Error('Temp document not found');
    }
    
    // Generate document number
    const year = new Date().getFullYear();
    const count = await prisma.document.count();
    const documentNumber = `DOC${year}${(count + 1).toString().padStart(6, '0')}`;
    
    // Create permanent document
    const permanentDoc = await prisma.document.create({
      data: {
        documentNumber,
        applicationId,
        documentType: tempDoc.documentType,
        filename: tempDoc.filename,
        filePath: tempDoc.filePath,
        fileSize: tempDoc.fileSize,
        mimeType: tempDoc.mimeType,
        verificationStatus: 'PENDING'
      }
    });
    
    // Delete temp document record (but keep file)
    await prisma.tempDocument.delete({
      where: { tempId }
    });
    
    return permanentDoc;
  } catch (error) {
    console.error('Error moving temp to application:', error);
    throw error;
  }
};

// Clean up expired temp documents (run via cron job)
const cleanupExpiredTempDocuments = async () => {
  try {
    const expiredDocs = await prisma.tempDocument.findMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
    
    for (const doc of expiredDocs) {
      // Delete file from disk
      const filePath = path.join(__dirname, '../../uploads', path.basename(doc.filePath));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete record
      await prisma.tempDocument.delete({
        where: { tempId: doc.tempId }
      });
    }
    
    console.log(`Cleaned up ${expiredDocs.length} expired temp documents`);
  } catch (error) {
    console.error('Error cleaning up temp documents:', error);
  }
};

module.exports = {
  uploadTempDocument,
  getTempDocument,
  moveTempToApplication,
  cleanupExpiredTempDocuments
};