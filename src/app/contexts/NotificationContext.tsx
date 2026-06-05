import { createContext, useContext, ReactNode } from 'react';
import { useNotifications, type NotificationType } from '../hooks/useNotifications';

interface NotificationContextType {
  addNotification: (notification: {
    type: NotificationType;
    title: string;
    message: string;
    relatedItem?: string;
    actionUrl?: string;
    link?: string;
  }) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotifications();

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}
