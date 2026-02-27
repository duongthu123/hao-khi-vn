'use client';

import { ReactNode } from 'react';

export interface LiveRegionProps {
  children: ReactNode;
  /** 
   * Politeness level for screen reader announcements
   * - 'polite': Wait for current speech to finish (default)
   * - 'assertive': Interrupt current speech
   * - 'off': Don't announce
   */
  politeness?: 'polite' | 'assertive' | 'off';
  /** 
   * Whether the entire region should be announced or just changes
   * - 'additions': Only announce new content (default)
   * - 'all': Announce entire region content
   */
  relevant?: 'additions' | 'all';
  /** Whether to make the region visible or screen-reader only */
  visible?: boolean;
  className?: string;
}

/**
 * LiveRegion component for announcing dynamic content updates to screen readers
 * 
 * Use cases:
 * - Game state changes (resource updates, combat results)
 * - Notifications and alerts
 * - Form validation messages
 * - Loading states
 * 
 * @example
 * ```tsx
 * <LiveRegion politeness="polite">
 *   {notification}
 * </LiveRegion>
 * ```
 */
export function LiveRegion({ 
  children, 
  politeness = 'polite', 
  relevant = 'additions',
  visible = false,
  className 
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-relevant={relevant}
      aria-atomic={relevant === 'all'}
      className={
        visible 
          ? className 
          : 'sr-only' // Screen reader only - visually hidden but accessible
      }
    >
      {children}
    </div>
  );
}

/**
 * AlertRegion component for important announcements
 * Uses assertive politeness to interrupt screen readers
 */
export function AlertRegion({ children, visible = false, className }: Omit<LiveRegionProps, 'politeness' | 'relevant'>) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={visible ? className : 'sr-only'}
    >
      {children}
    </div>
  );
}
