// backend/routes/notification.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// User routes
router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Admin only routes - with proper role check
router.post('/broadcast', 
  authenticate, 
  (req, res, next) => {
    console.log('Broadcast route - User role:', req.user?.role);
    next();
  },
  authorize('ADMIN'), // Pass as string, not array
  notificationController.broadcastNotification
);

router.post('/send-to-role', 
  authenticate, 
  authorize('ADMIN'), // Pass as string, not array
  notificationController.sendToRole
);

module.exports = router;