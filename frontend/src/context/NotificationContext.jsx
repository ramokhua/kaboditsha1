// frontend/src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=50');
      setNotifications(response.data.notifications || []);
      const unread = (response.data.notifications || []).filter(n => !n.readAt).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return;
    
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notificationId
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!user) return;
    
    try {
      await api.delete(`/notifications/${notificationId}`);
      const deletedNotif = notifications.find(n => n.notificationId === notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
      if (deletedNotif && !deletedNotif.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [user, notifications]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Poll for new notifications
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    
    fetchUnreadCount();
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [user, authLoading, fetchUnreadCount, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
