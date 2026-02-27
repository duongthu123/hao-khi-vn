/**
 * useSwipeGesture Hook
 * 
 * Custom React hook for detecting swipe gestures on touch devices.
 * Supports horizontal and vertical swipes with configurable thresholds.
 * 
 * @example
 * ```tsx
 * const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGesture({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   threshold: 50,
 * });
 * 
 * return <div {...{ onTouchStart, onTouchMove, onTouchEnd }}>Swipe me!</div>;
 * ```
 */

import { useRef, useCallback, TouchEvent } from 'react';

export interface SwipeGestureConfig {
  /** Callback fired when user swipes left */
  onSwipeLeft?: () => void;
  /** Callback fired when user swipes right */
  onSwipeRight?: () => void;
  /** Callback fired when user swipes up */
  onSwipeUp?: () => void;
  /** Callback fired when user swipes down */
  onSwipeDown?: () => void;
  /** Minimum distance in pixels to trigger a swipe (default: 50) */
  threshold?: number;
  /** Maximum time in ms for a swipe gesture (default: 300) */
  maxDuration?: number;
  /** Prevent default touch behavior (default: false) */
  preventDefault?: boolean;
}

export interface SwipeGestureHandlers {
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: (event: TouchEvent) => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

/**
 * Hook for detecting swipe gestures on touch devices
 */
export function useSwipeGesture(config: SwipeGestureConfig): SwipeGestureHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    maxDuration = 300,
    preventDefault = false,
  } = config;

  const touchDataRef = useRef<TouchData | null>(null);

  /**
   * Handle touch start - record initial position
   */
  const onTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    if (!touch) return;

    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
    };
  }, [preventDefault]);

  /**
   * Handle touch move - update current position
   */
  const onTouchMove = useCallback((event: TouchEvent) => {
    if (!touchDataRef.current) return;

    const touch = event.touches[0];
    if (!touch) return;

    touchDataRef.current.currentX = touch.clientX;
    touchDataRef.current.currentY = touch.clientY;
  }, []);

  /**
   * Handle touch end - detect swipe direction and trigger callback
   */
  const onTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchDataRef.current) return;

    const { startX, startY, startTime, currentX, currentY } = touchDataRef.current;
    const duration = Date.now() - startTime;

    // Reset touch data
    touchDataRef.current = null;

    // Check if gesture was too slow
    if (duration > maxDuration) return;

    // Calculate deltas
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if swipe threshold was met
    const isHorizontalSwipe = absDeltaX >= threshold && absDeltaX > absDeltaY;
    const isVerticalSwipe = absDeltaY >= threshold && absDeltaY > absDeltaX;

    // Trigger appropriate callback
    if (isHorizontalSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (isVerticalSwipe) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  }, [threshold, maxDuration, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
