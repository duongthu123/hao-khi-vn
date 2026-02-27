/**
 * Touch Target Utilities
 * 
 * Utilities for ensuring WCAG 2.1 Level AA compliant touch targets.
 * Minimum touch target size: 44x44px
 * Recommended spacing between targets: 8px
 */

/**
 * Minimum touch target size in pixels (WCAG 2.1 Level AA)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Recommended spacing between touch targets in pixels
 */
export const TOUCH_TARGET_SPACING = 8;

/**
 * Touch target size classes for Tailwind CSS
 */
export const touchTargetClasses = {
  /** Minimum size (44x44px) */
  min: 'min-w-[44px] min-h-[44px]',
  /** Small size (44x44px) */
  sm: 'min-w-[44px] min-h-[44px] w-11 h-11',
  /** Medium size (48x48px) */
  md: 'min-w-[44px] min-h-[44px] w-12 h-12',
  /** Large size (56x56px) */
  lg: 'min-w-[44px] min-h-[44px] w-14 h-14',
  /** Extra large size (64x64px) */
  xl: 'min-w-[44px] min-h-[44px] w-16 h-16',
} as const;

/**
 * Touch target spacing classes for Tailwind CSS
 */
export const touchSpacingClasses = {
  /** Minimum spacing (8px) */
  min: 'gap-2',
  /** Comfortable spacing (12px) */
  comfortable: 'gap-3',
  /** Generous spacing (16px) */
  generous: 'gap-4',
} as const;

/**
 * Check if an element meets minimum touch target size requirements
 */
export function isTouchTargetCompliant(width: number, height: number): boolean {
  return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;
}

/**
 * Calculate the required padding to make an element touch-target compliant
 */
export function calculateTouchTargetPadding(
  contentWidth: number,
  contentHeight: number
): { paddingX: number; paddingY: number } {
  const paddingX = Math.max(0, (MIN_TOUCH_TARGET_SIZE - contentWidth) / 2);
  const paddingY = Math.max(0, (MIN_TOUCH_TARGET_SIZE - contentHeight) / 2);

  return { paddingX, paddingY };
}

/**
 * Get touch-friendly button classes based on size
 */
export function getTouchButtonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const baseClasses = 'inline-flex items-center justify-center transition-colors';
  const sizeClasses = touchTargetClasses[size];
  
  return `${baseClasses} ${sizeClasses}`;
}

/**
 * Get touch-friendly spacing classes for a container
 */
export function getTouchSpacingClasses(spacing: 'min' | 'comfortable' | 'generous' = 'comfortable'): string {
  return touchSpacingClasses[spacing];
}

/**
 * Validate touch target spacing between elements
 */
export function hasAdequateSpacing(
  element1: { x: number; y: number; width: number; height: number },
  element2: { x: number; y: number; width: number; height: number }
): boolean {
  // Calculate distance between element edges
  const horizontalDistance = Math.max(
    0,
    Math.max(element1.x, element2.x) - Math.min(element1.x + element1.width, element2.x + element2.width)
  );
  
  const verticalDistance = Math.max(
    0,
    Math.max(element1.y, element2.y) - Math.min(element1.y + element1.height, element2.y + element2.height)
  );

  // Check if spacing meets minimum requirement
  return horizontalDistance >= TOUCH_TARGET_SPACING || verticalDistance >= TOUCH_TARGET_SPACING;
}

/**
 * Mobile-optimized grid classes with proper spacing
 */
export const mobileGridClasses = {
  /** 2 columns with touch-friendly spacing */
  cols2: 'grid grid-cols-2 gap-3',
  /** 3 columns with touch-friendly spacing */
  cols3: 'grid grid-cols-3 gap-3',
  /** 4 columns with touch-friendly spacing */
  cols4: 'grid grid-cols-4 gap-2',
  /** Responsive grid: 2 cols mobile, 3 tablet, 4 desktop */
  responsive: 'grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3',
} as const;

/**
 * Touch-friendly list classes with proper spacing
 */
export const touchListClasses = {
  /** Vertical list with touch-friendly spacing */
  vertical: 'flex flex-col gap-2',
  /** Horizontal list with touch-friendly spacing */
  horizontal: 'flex flex-row gap-3',
  /** Wrapped list with touch-friendly spacing */
  wrapped: 'flex flex-wrap gap-3',
} as const;
