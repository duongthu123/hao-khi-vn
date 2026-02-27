'use client';

/**
 * NotificationToast Component
 * Toast notification system with enter/exit animations
 * 
 * Validates Requirements 6.5 (animate resource changes and notifications)
 * Validates Requirements 23.3 (error handling and loading states)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/store/slices/uiSlice';
import { useAnimations } from '@/hooks/useAnimations';

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

export type { NotificationToastProps };

/**
 * Get notification styling based on type
 */
const getNotificationStyle = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        icon: '✓',
        bgColor: 'bg-green-500/90',
        borderColor: 'border-green-400',
        iconBg: 'bg-green-600',
        ariaLabel: 'Success notification',
      };
    case 'error':
      return {
        icon: '✕',
        bgColor: 'bg-red-500/90',
        borderColor: 'border-red-400',
        iconBg: 'bg-red-600',
        ariaLabel: 'Error notification',
      };
    case 'warning':
      return {
        icon: '⚠',
        bgColor: 'bg-yellow-500/90',
        borderColor: 'border-yellow-400',
        iconBg: 'bg-yellow-600',
        ariaLabel: 'Warning notification',
      };
    case 'info':
      return {
        icon: 'ℹ',
        bgColor: 'bg-blue-500/90',
        borderColor: 'border-blue-400',
        iconBg: 'bg-blue-600',
        ariaLabel: 'Information notification',
      };
  }
};

/**
 * Single toast notification with progress indicator
 */
const Toast: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const style = getNotificationStyle(notification.type);
  const [progress, setProgress] = useState(100);
  const shouldAnimate = useAnimations();

  // Animate progress bar for auto-dismiss
  useEffect(() => {
    if (!notification.duration || notification.duration <= 0) {
      return;
    }

    const startTime = Date.now();
    const endTime = notification.createdAt + notification.duration;
    const totalDuration = notification.duration;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - notification.createdAt;
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / totalDuration) * 100;

      setProgress(newProgress);

      if (newProgress > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [notification.createdAt, notification.duration]);

  return (
    <motion.div
      layout
      initial={shouldAnimate ? { opacity: 0, y: -50, scale: 0.8, x: 100 } : false}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={shouldAnimate ? { 
        opacity: 0, 
        x: 100, 
        scale: 0.8,
        transition: { duration: 0.2, ease: 'easeIn' }
      } : { opacity: 0 }}
      transition={shouldAnimate ? {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      } : { duration: 0 }}
      className={`
        relative overflow-hidden
        flex items-center gap-3 min-w-[300px] max-w-[400px]
        ${style.bgColor} backdrop-blur-sm
        border ${style.borderColor}
        rounded-lg shadow-xl
        p-4
      `}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      aria-label={style.ariaLabel}
    >
      {/* Progress bar */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30"
          initial={{ width: '100%' }}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      )}

      {/* Icon with pulse animation for errors */}
      <motion.div
        className={`
          flex items-center justify-center
          w-8 h-8 rounded-full
          ${style.iconBg}
          text-white font-bold text-lg
          flex-shrink-0
        `}
        initial={shouldAnimate ? { scale: 0 } : false}
        animate={shouldAnimate ? { 
          scale: 1,
          ...(notification.type === 'error' && {
            rotate: [0, -10, 10, -10, 10, 0],
          })
        } : { scale: 1 }}
        transition={shouldAnimate ? { 
          scale: { type: 'spring', stiffness: 500, damping: 20 },
          rotate: { duration: 0.5, ease: 'easeInOut' }
        } : { duration: 0 }}
      >
        {style.icon}
      </motion.div>

      {/* Message */}
      <div className="flex-1 text-white font-medium text-sm">
        {notification.message}
      </div>

      {/* Dismiss Button */}
      <motion.button
        onClick={() => onDismiss(notification.id)}
        className="
          flex items-center justify-center
          w-6 h-6 rounded-full
          hover:bg-white/20
          text-white text-lg
          transition-colors
          flex-shrink-0
        "
        whileHover={shouldAnimate ? { scale: 1.1 } : undefined}
        whileTap={shouldAnimate ? { scale: 0.9 } : undefined}
        aria-label="Dismiss notification"
      >
        ×
      </motion.button>
    </motion.div>
  );
};

/**
 * NotificationToast container with queue management
 * Limits visible notifications and provides smooth animations
 */
export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  maxVisible = 5,
}) => {
  const shouldAnimate = useAnimations();
  
  // Limit visible notifications to prevent overflow
  const visibleNotifications = notifications.slice(-maxVisible);
  const hiddenCount = notifications.length - visibleNotifications.length;

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Hidden notifications indicator */}
      {hiddenCount > 0 && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldAnimate ? { opacity: 0, scale: 0.8 } : { opacity: 0 }}
          transition={shouldAnimate ? undefined : { duration: 0 }}
          className="
            pointer-events-auto
            text-center text-sm text-white/80 
            bg-gray-800/80 backdrop-blur-sm
            px-3 py-1 rounded-full
            border border-gray-600
          "
        >
          +{hiddenCount} more notification{hiddenCount > 1 ? 's' : ''}
        </motion.div>
      )}

      {/* Notification stack */}
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast notification={notification} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
