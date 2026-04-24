// frontend/src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, loading, fetchNotifications, markAllAsRead, markAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.readAt;
    if (filter === 'read') return notif.readAt;
    return true;
  });
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED': return '���';
      case 'STATUS_CHANGE': return '���';
      case 'DOCUMENT_VERIFIED': return '✅';
      case 'APPLICATION_APPROVED': return '���';
      case 'APPLICATION_REJECTED': return '❌';
      case 'BROADCAST': return '���';
      default: return '���';
    }
  };
  
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };
  
  const handleNotificationClick = async (notification) => {
    if (!notification.readAt) {
      await markAsRead(notification.notificationId);
    }
    if (notification.applicationId) {
      navigate(`/applications/${notification.applicationId}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F5E6D3] py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#2C1810]">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Stay updated on your applications
              </p>
            </div>
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#B45F3A] hover:text-[#2C1810]"
            >
              Mark all as read
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2 mt-4">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === f
                    ? 'bg-[#B45F3A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && notifications.filter(n => !n.readAt).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {notifications.filter(n => !n.readAt).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-6xl block mb-4">���</span>
              <p className="text-lg">No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' 
                  ? "You've read all your notifications" 
                  : "You'll see updates here when they arrive"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.notificationId}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.readAt ? 'bg-[#F5E6D3]/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium ${!notification.readAt ? 'text-[#2C1810]' : 'text-gray-700'}`}>
                        {notification.subject}
                      </h3>
                      {!notification.readAt && (
                        <span className="w-2 h-2 bg-[#B45F3A] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notification.sentAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;