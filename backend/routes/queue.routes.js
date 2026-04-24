// backend/routes/queue.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getQueueUpdates, getQueueStats } = require('../controllers/queue.controller');

// Protected routes
router.get('/updates', authenticate, getQueueUpdates);
router.get('/stats/:landBoardId', authenticate, getQueueStats);

module.exports = router;