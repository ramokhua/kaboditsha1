const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const managerController = require('../controllers/manager.controller');

// All manager routes require authentication and MANAGER role
router.use(authenticate);
router.use(authorize('MANAGER', 'ADMIN'));

// Dashboard
router.get('/stats', managerController.getStats);
router.get('/applications', managerController.getRegionApplications);
router.get('/applications/:id', managerController.getApplicationDetails);
router.put('/applications/:id/status', managerController.updateApplicationStatus);

// Performance
router.get('/performance', managerController.getRegionPerformance);

// Audit Logs for Manager's Region
router.get('/audit-logs', managerController.getRegionAuditLogs);

module.exports = router;