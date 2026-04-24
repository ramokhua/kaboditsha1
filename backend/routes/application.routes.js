// backend/routes/application.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../config/multer');
const applicationController = require('../controllers/application.controller');

// ========== PUBLIC ROUTES (No authentication required) ==========
// Optimized endpoints for homepage (fast - only aggregated data)
router.get('/trends', applicationController.getMonthlyTrends);
router.get('/settlement-stats', applicationController.getSettlementStats);
router.get('/gender-stats', applicationController.getGenderStatsOptimized);

// Legacy public endpoints (kept for compatibility)
router.get('/stats/gender', applicationController.getGenderStats);
router.get('/stats/status', applicationController.getStatusStats);
router.get('/all', applicationController.getAllApplications);

// ========== PROTECTED ROUTES (Authentication required) ==========
router.use(authenticate);

// Application CRUD
router.get('/my', applicationController.getMyApplications);
router.post('/',
  [
    body('landBoardId').notEmpty().withMessage('Land board is required'),
    body('settlementType').isIn(['TOWN', 'VILLAGE', 'FARM']).withMessage('Invalid settlement type'),
    body('purpose').notEmpty().withMessage('Purpose is required')
  ],
  applicationController.createApplication
);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id/status', applicationController.updateStatus);

// Document routes
router.post('/:id/documents', upload.single('document'), applicationController.uploadDocument);
router.get('/:id/documents', applicationController.getApplicationDocuments);
router.delete('/documents/:id', applicationController.deleteDocument);

module.exports = router;