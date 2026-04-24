const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Statistics
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Land Board Management
router.get('/landboards', adminController.getLandBoards);
router.post('/landboards', adminController.createLandBoard);
router.put('/landboards/:id', adminController.updateLandBoard);
router.delete('/landboards/:id', adminController.deleteLandBoard);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;