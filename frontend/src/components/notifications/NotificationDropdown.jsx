// frontend/src/components/notifications/NotificationDropdown.jsx
import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, loading, markAllAsRead } = useNotifications();
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPLICATION_UPDATE':
        return '📄';
      case 'STATUS_CHANGE':
        return '🔄';
      case 'DOCUMENT_VERIFIED':
        return '✅';
      case 'BROADCAST':
        return '📢';
      default:
        return '🔔';
    }
  };
  
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };
  
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {notifications.filter(n => !n.readAt).length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-[#B45F3A] hover:text-[#2C1810]"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl block mb-2">🔔</span>
            <p>No notifications yet</p>
            <p className="text-xs mt-1">You'll see updates here</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.notificationId}
              notification={notification}
              icon={getNotificationIcon(notification.type)}
              onClose={onClose}
            />
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 text-center">
        <button
          onClick={() => {
            window.location.href = '/notifications';
            onClose();
          }}
          className="text-xs text-gray-500 hover:text-[#B45F3A]"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;