/**
 * useNotifications Hook
 * Convenient hook for managing notifications
 * 
 * Validates Requirements 6.5 (animate resource changes and notifications)
 * Validates Requirements 23.3 (error handling and loading states)
 */

import { useCallback } from 'react';
import { useGameStore } from '@/store';
import { Notification } from '@/store/slices/uiSlice';

export interface NotificationOptions {
  message: string;
  type?: Notification['type'];
  duration?: number;
}

/**
 * Hook for managing notifications
 * Provides convenient methods to show different types of notifications
 */
export function useNotifications() {
  const addNotification = useGameStore((state) => state.addNotification);
  const removeNotification = useGameStore((state) => state.removeNotification);
  const clearNotifications = useGameStore((state) => state.clearNotifications);
  const notifications = useGameStore((state) => state.ui.notifications);

  const showNotification = useCallback(
    (options: NotificationOptions) => {
      return addNotification({
        message: options.message,
        type: options.type || 'info',
        duration: options.duration,
      });
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      return addNotification({
        message,
        type: 'success',
        duration,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      return addNotification({
        message,
        type: 'error',
        duration,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      return addNotification({
        message,
        type: 'warning',
        duration,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      return addNotification({
        message,
        type: 'info',
        duration,
      });
    },
    [addNotification]
  );

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
}
