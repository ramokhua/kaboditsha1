// frontend/src/components/notifications/NotificationItem.jsx
import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationItem = ({ notification, icon, onClose }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const isUnread = !notification.readAt;
  
  const handleClick = async () => {
    if (isUnread) {
      await markAsRead(notification.notificationId);
    }
    // Handle navigation if needed
    if (notification.link) {
      window.location.href = notification.link;
      onClose();
    }
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteNotification(notification.notificationId);
  };
  
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  };
  
  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isUnread ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.subject}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-400">
              {timeAgo(notification.sentAt)}
            </span>
            {isUnread && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;