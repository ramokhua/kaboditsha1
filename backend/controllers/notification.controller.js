// backend/controllers/notification.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's notifications with pagination
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      userId: req.user.userId,
      ...(unreadOnly === 'true' && { readAt: null })
    };
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where })
    ]);
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.userId,
        readAt: null
      }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { 
        notificationId: id,
        userId: req.user.userId
      },
      data: { readAt: new Date() }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.userId,
        readAt: null
      },
      data: { readAt: new Date() }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// Create notification (internal use)
const createNotification = async (userId, type, subject, message) => {
  try {
    const year = new Date().getFullYear();
    const count = await prisma.notification.count();
    const notificationNumber = `NOT${year}${(count + 1).toString().padStart(6, '0')}`;
    
    const notification = await prisma.notification.create({
      data: {
        notificationNumber,
        userId,
        type,
        subject,
        message,
        sentAt: new Date()
      }
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Broadcast notification to all users (admin only)
const broadcastNotification = async (req, res) => {
  try {
    const { subject, message, type = 'IN_APP' } = req.body;
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { userId: true }
    });
    
    // Create notification for each user
    const notifications = [];
    for (const user of users) {
      const notification = await createNotification(
        user.userId,
        type,
        subject,
        message
      );
      notifications.push(notification);
    }
    
    res.json({
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
};

// Send notification to specific role (admin only)
const sendToRole = async (req, res) => {
  try {
    const { role, subject, message, type = 'IN_APP' } = req.body;
    
    const users = await prisma.user.findMany({
      where: { role },
      select: { userId: true }
    });
    
    const notifications = [];
    for (const user of users) {
      const notification = await createNotification(
        user.userId,
        type,
        subject,
        message
      );
      notifications.push(notification);
    }
    
    res.json({
      message: `Sent to ${notifications.length} ${role} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error sending to role:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({
      where: { 
        notificationId: id,
        userId: req.user.userId
      }
    });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
  sendToRole,
  deleteNotification,
  createNotification
};