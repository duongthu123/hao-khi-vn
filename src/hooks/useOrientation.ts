/**
 * useOrientation Hook
 * 
 * Custom React hook for detecting and responding to screen orientation changes.
 * Provides current orientation state and handles orientation change events.
 * 
 * @example
 * ```tsx
 * const { orientation, isPortrait, isLandscape } = useOrientation({
 *   onChange: (orientation) => console.log('Orientation changed to:', orientation)
 * });
 * 
 * return (
 *   <div className={isPortrait ? 'portrait-layout' : 'landscape-layout'}>
 *     Current orientation: {orientation}
 *   </div>
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export type OrientationType = 'portrait' | 'landscape';

export interface OrientationConfig {
  /** Callback fired when orientation changes */
  onChange?: (orientation: OrientationType) => void;
  /** Debounce delay in ms to prevent rapid firing (default: 100) */
  debounceDelay?: number;
}

export interface OrientationState {
  /** Current orientation type */
  orientation: OrientationType;
  /** True if device is in portrait mode */
  isPortrait: boolean;
  /** True if device is in landscape mode */
  isLandscape: boolean;
  /** Angle of the screen orientation (0, 90, 180, 270) */
  angle: number;
}

/**
 * Determines orientation type from window dimensions
 */
function getOrientationType(): OrientationType {
  // Check if window is available (SSR safety)
  if (typeof window === 'undefined') {
    return 'portrait';
  }

  // Use screen.orientation API if available
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
  }

  // Fallback to window dimensions
  return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Gets the orientation angle
 */
function getOrientationAngle(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  // Use screen.orientation API if available
  if (window.screen?.orientation?.angle !== undefined) {
    return window.screen.orientation.angle;
  }

  // Fallback to deprecated window.orientation
  if (typeof window.orientation === 'number') {
    return window.orientation;
  }

  return 0;
}

/**
 * Hook for detecting and responding to screen orientation changes
 */
export function useOrientation(config: OrientationConfig = {}): OrientationState {
  const { onChange, debounceDelay = 100 } = config;

  const [orientation, setOrientation] = useState<OrientationType>(() => getOrientationType());
  const [angle, setAngle] = useState<number>(() => getOrientationAngle());

  /**
   * Handle orientation change event
   */
  const handleOrientationChange = useCallback(() => {
    const newOrientation = getOrientationType();
    const newAngle = getOrientationAngle();

    setOrientation(newOrientation);
    setAngle(newAngle);

    // Trigger callback if provided
    if (onChange) {
      onChange(newOrientation);
    }
  }, [onChange]);

  useEffect(() => {
    // Skip if not in browser
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    /**
     * Debounced handler to prevent rapid firing during rotation
     */
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleOrientationChange, debounceDelay);
    };

    // Listen for orientation change events
    // Modern API
    if (window.screen?.orientation?.addEventListener) {
      window.screen.orientation.addEventListener('change', debouncedHandler);
    }

    // Fallback for older browsers
    window.addEventListener('orientationchange', debouncedHandler);

    // Also listen to resize as a fallback
    window.addEventListener('resize', debouncedHandler);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);

      if (window.screen?.orientation?.removeEventListener) {
        window.screen.orientation.removeEventListener('change', debouncedHandler);
      }

      window.removeEventListener('orientationchange', debouncedHandler);
      window.removeEventListener('resize', debouncedHandler);
    };
  }, [handleOrientationChange, debounceDelay]);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    angle,
  };
}
