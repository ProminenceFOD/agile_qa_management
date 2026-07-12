import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getData, setData } from '../utils/supabaseStorage';

export type NotificationType =
  | 'assignment'
  | 'signoff'
  | 'bug'
  | 'blocked'
  | 'info'
  | 'mention'
  | 'approval'
  | 'comment'
  | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  relatedItem?: string;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user?.email) {
      await Promise.resolve();
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const savedNotifications = await getData(
        `aqms_notifications_${user.email}`
      );
      if (savedNotifications && Array.isArray(savedNotifications)) {
        const parsedNotifications = savedNotifications.map((n: Record<string, unknown>) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(parsedNotifications);
      } else {
        // Initialize with empty array
        setNotifications([]);
        await setData(`aqms_notifications_${user.email}`, []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, [loadNotifications]);

  const saveNotifications = useCallback(
    async (updatedNotifications: Notification[]) => {
      if (!user?.email) return;

      try {
        await setData(`aqms_notifications_${user.email}`, updatedNotifications);
        setNotifications(updatedNotifications);
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    },
    [user]
  );

  const addNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      if (!user?.email) return;

      const newNotification: Notification = {
        ...notification,
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      const updated = [newNotification, ...notifications];
      await saveNotifications(updated);
    },
    [notifications, saveNotifications, user]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback(
    async (id: string) => {
      const updated = notifications.filter((n) => n.id !== id);
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const clearAll = useCallback(async () => {
    await saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications: loadNotifications,
  };
}
