/**
 * OrientationTransition Component
 * 
 * Displays a visual indicator during screen orientation changes.
 * Provides smooth feedback to users when rotating their device.
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface OrientationTransitionProps {
  /** Duration of the transition in ms (default: 300) */
  duration?: number;
  /** Show device rotation icon (default: true) */
  showIcon?: boolean;
  /** Custom message to display */
  message?: string;
}

export function OrientationTransition({
  duration = 300,
  showIcon = true,
  message = 'Đang điều chỉnh bố cục...',
}: OrientationTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-vietnamese p-6 flex flex-col items-center gap-4 max-w-xs mx-4"
      >
        {showIcon && (
          <motion.div
            animate={{ rotate: 90 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="text-blue-600"
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
        )}

        <p className="text-center text-gray-700 font-medium">
          {message}
        </p>

        {/* Loading indicator */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
