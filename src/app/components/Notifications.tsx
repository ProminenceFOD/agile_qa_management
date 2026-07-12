import { useState } from 'react';
import {
  useNotifications,
  type NotificationType,
} from '../hooks/useNotifications';

export function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    loading,
  } = useNotifications();

  const [filterType, setFilterType] = useState<'all' | NotificationType>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>(
    'all'
  );

  const handleCreateTestNotification = async () => {
    const testTypes: NotificationType[] = [
      'assignment',
      'signoff',
      'bug',
      'blocked',
      'info',
    ];
    const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];

    const testMessages = {
      assignment: {
        title: 'New Assignment',
        message:
          'You have been assigned to story US-' +
          Math.floor(Math.random() * 1000),
      },
      signoff: {
        title: 'Sign-Off Required',
        message: 'Story requires your QA approval',
      },
      bug: {
        title: 'Bug Reported',
        message: 'A new bug has been assigned to you',
      },
      blocked: {
        title: 'Story Blocked',
        message: 'Your story is blocked and needs attention',
      },
      info: {
        title: 'System Update',
        message: 'AQMS system has been updated successfully',
      },
    };

    await addNotification({
      type: randomType,
      title: testMessages[randomType as keyof typeof testMessages].title,
      message: testMessages[randomType as keyof typeof testMessages].message,
      relatedItem:
        randomType === 'assignment' || randomType === 'bug'
          ? `US-${Math.floor(Math.random() * 1000)}`
          : undefined,
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'read' && n.read) ||
      (filterRead === 'unread' && !n.read);
    return matchesType && matchesRead;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'assignment':
        return '👤';
      case 'signoff':
        return '✍️';
      case 'bug':
        return '🐛';
      case 'blocked':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'mention':
        return '@';
      case 'approval':
        return '✅';
      case 'comment':
        return '💬';
      case 'alert':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'assignment':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'signoff':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'bug':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'mention':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approval':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'comment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'alert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateTestNotification}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + Test Notification
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as typeof filterType)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="assignment">Assignments</option>
              <option value="signoff">Sign-Off Required</option>
              <option value="bug">Bugs</option>
              <option value="blocked">Blocked Items</option>
              <option value="info">Information</option>
              <option value="mention">Mentions</option>
              <option value="approval">Approvals</option>
              <option value="comment">Comments</option>
              <option value="alert">Alerts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Status</label>
            <select
              value={filterRead}
              onChange={(e) =>
                setFilterRead(e.target.value as typeof filterRead)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-xl text-gray-900 mb-2">
              Loading notifications...
            </h3>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
                notif.read
                  ? 'border-gray-200'
                  : 'border-indigo-300 bg-indigo-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-3xl">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-gray-700">{notif.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-xs ${getTypeColor(notif.type)}`}
                      >
                        {notif.type.charAt(0).toUpperCase() +
                          notif.type.slice(1)}
                      </span>
                      {!notif.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-500 text-white text-xs">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      {notif.relatedItem && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          {notif.relatedItem}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
