'use client';

/**
 * SwipeableDrawer Component
 * 
 * A mobile-friendly drawer that can be opened/closed with swipe gestures.
 * Useful for navigation menus, settings panels, and side content.
 * 
 * Features:
 * - Swipe to open/close
 * - Touch-friendly interactions
 * - Smooth animations
 * - Backdrop overlay
 * - Keyboard accessible
 */

import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { cn } from '@/lib/utils';

export interface SwipeableDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Callback when drawer should open */
  onOpen?: () => void;
  /** Drawer content */
  children: ReactNode;
  /** Position of the drawer */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** Custom className for the drawer */
  className?: string;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
  /** Whether backdrop click closes drawer */
  closeOnBackdropClick?: boolean;
  /** Swipe threshold in pixels */
  swipeThreshold?: number;
}

/**
 * Swipeable drawer component for mobile navigation
 */
export function SwipeableDrawer({
  isOpen,
  onClose,
  onOpen,
  children,
  position = 'left',
  className = '',
  showBackdrop = true,
  closeOnBackdropClick = true,
  swipeThreshold = 50,
}: SwipeableDrawerProps) {
  // Configure swipe gestures based on drawer position
  const swipeConfig = {
    threshold: swipeThreshold,
    onSwipeLeft: position === 'right' && onOpen ? onOpen : position === 'left' ? onClose : undefined,
    onSwipeRight: position === 'left' && onOpen ? onOpen : position === 'right' ? onClose : undefined,
    onSwipeUp: position === 'bottom' && onOpen ? onOpen : position === 'top' ? onClose : undefined,
    onSwipeDown: position === 'top' && onOpen ? onOpen : position === 'bottom' ? onClose : undefined,
  };

  const swipeHandlers = useSwipeGesture(swipeConfig);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Animation variants based on position
  const getDrawerVariants = () => {
    const variants = {
      left: {
        hidden: { x: '-100%' },
        visible: { x: 0 },
      },
      right: {
        hidden: { x: '100%' },
        visible: { x: 0 },
      },
      top: {
        hidden: { y: '-100%' },
        visible: { y: 0 },
      },
      bottom: {
        hidden: { y: '100%' },
        visible: { y: 0 },
      },
    };

    return variants[position];
  };

  // Position-specific styles
  const getPositionStyles = () => {
    const styles = {
      left: 'left-0 top-0 bottom-0 w-80 max-w-[85vw]',
      right: 'right-0 top-0 bottom-0 w-80 max-w-[85vw]',
      top: 'top-0 left-0 right-0 h-auto max-h-[85vh]',
      bottom: 'bottom-0 left-0 right-0 h-auto max-h-[85vh]',
    };

    return styles[position];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeOnBackdropClick ? onClose : undefined}
              aria-hidden="true"
            />
          )}

          {/* Drawer */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={getDrawerVariants()}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className={cn(
              'fixed z-50 bg-white shadow-2xl overflow-auto',
              getPositionStyles(),
              className
            )}
            {...swipeHandlers}
            role="dialog"
            aria-modal="true"
          >
            {/* Swipe indicator */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
