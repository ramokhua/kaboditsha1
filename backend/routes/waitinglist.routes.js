// backend/routes/waiting-list.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const waitingListController = require('../controllers/waitinglist.controller');

// ========== PUBLIC ROUTES (No authentication required) ==========
// These are used on the homepage
router.get('/stats', waitingListController.getAllWaitingListStats);
router.get('/', waitingListController.getWaitingList);

// ========== PROTECTED ROUTES (Authentication required) ==========
router.get('/queue/position/:applicationId', authenticate, waitingListController.getQueuePositionDetails);
router.get('/my-queue', authenticate, waitingListController.getMyQueuePosition);

// Admin route to refresh statistics
router.post('/refresh', authenticate, authorize('ADMIN'), waitingListController.refreshWaitingListStats);

module.exports = router;