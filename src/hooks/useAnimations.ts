/**
 * useAnimations Hook
 * Combines user settings and browser prefers-reduced-motion preference
 * to determine if animations should be enabled
 * 
 * Validates Requirements:
 * - 6.8: Allow animations to be disabled for accessibility or performance
 * - 22.6: Allow disabling animations for motion sensitivity
 */

import { useReducedMotion } from 'framer-motion';
import { useGameStore } from '@/store';

/**
 * Hook to determine if animations should be enabled
 * Respects both user settings and browser prefers-reduced-motion preference
 * 
 * @returns boolean - true if animations should be enabled
 */
export function useAnimations(): boolean {
  const animationsEnabled = useGameStore((state) => state.ui.settings.animationsEnabled);
  const prefersReducedMotion = useReducedMotion();
  
  // Animations are enabled only if:
  // 1. User has enabled animations in settings
  // 2. Browser does not prefer reduced motion
  return animationsEnabled && !prefersReducedMotion;
}

/**
 * Hook to get animation configuration for Framer Motion
 * Returns appropriate animation variants based on animation preferences
 * 
 * @returns object with animation configuration
 */
export function useAnimationConfig() {
  const shouldAnimate = useAnimations();
  
  return {
    shouldAnimate,
    // Return instant transitions when animations are disabled
    transition: shouldAnimate ? undefined : { duration: 0 },
    // Return no initial state when animations are disabled
    initial: shouldAnimate ? undefined : false,
  };
}
