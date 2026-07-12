import { useState } from 'react';
import { Modal } from './Modal';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'assignment' | 'mention' | 'approval' | 'comment' | 'alert';
  link?: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export function NotificationBell({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return '👤';
      case 'mention':
        return '@';
      case 'approval':
        return '✅';
      case 'comment':
        return '💬';
      case 'alert':
        return '⚠️';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return 'bg-indigo-50 border-indigo-200';
      case 'mention':
        return 'bg-purple-50 border-purple-200';
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'comment':
        return 'bg-gray-50 border-gray-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 z-20 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <div>No notifications</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() =>
                        !notification.read && onMarkAsRead(notification.id)
                      }
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        !notification.read ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border ${getTypeColor(notification.type)}`}
                        >
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p
                              className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="ml-2 w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
        type="warning"
        onConfirm={() => {
          onClearAll();
          setShowClearConfirm(false);
          setIsOpen(false);
        }}
        confirmText="Clear All"
        cancelText="Cancel"
      />
    </div>
  );
}
