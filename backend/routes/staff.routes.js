const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const staffController = require('../controllers/staff.controller');

// All staff routes require authentication and STAFF role
router.use(authenticate);
router.use(authorize('STAFF', 'MANAGER', 'ADMIN'));

// Get staff dashboard stats
router.get('/stats', staffController.getStats);

// Get applications for staff's land board
router.get('/applications', staffController.getBoardApplications);

// Get single application details for review
router.get('/applications/:id', staffController.getApplicationDetails);

// Update application status
router.put('/applications/:id/status', staffController.updateApplicationStatus);

// Verify document
router.put('/documents/:id/verify', staffController.verifyDocument);

// Add note to application
router.post('/applications/:id/notes', staffController.addNote);

module.exports = router;