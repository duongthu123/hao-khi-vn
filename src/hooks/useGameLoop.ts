/**
 * Game Loop Hook
 * Manages game update loop with requestAnimationFrame for frame-independent updates
 * Validates Requirements 14.2 (resource generation), 21.7 (60 FPS performance)
 * 
 * OPTIMIZATIONS:
 * - Fixed time step with accumulator for consistent updates
 * - Frame skipping to maintain target FPS
 * - Callback ref to avoid recreation
 * - Spiral of death prevention with max delta time
 */

import { useEffect, useRef, useCallback } from 'react';
import { getGlobalProfiler } from '@/lib/utils/performanceProfiler';

/**
 * Game loop callback function type
 * @param deltaTime - Time elapsed since last frame in seconds
 */
export type GameLoopCallback = (deltaTime: number) => void;

/**
 * Options for configuring the game loop
 */
export interface UseGameLoopOptions {
  /**
   * Target frames per second (default: 60)
   */
  fps?: number;
  
  /**
   * Whether the game loop is active (default: true)
   */
  enabled?: boolean;
  
  /**
   * Maximum delta time to prevent spiral of death (default: 0.1 seconds)
   * If frame takes longer than this, deltaTime will be capped
   */
  maxDeltaTime?: number;
  
  /**
   * Enable performance profiling (default: false)
   */
  enableProfiling?: boolean;
}

/**
 * Custom hook for managing game update loop
 * 
 * Provides a stable game loop using requestAnimationFrame with:
 * - Frame-independent updates using delta time
 * - Target FPS management
 * - Automatic cleanup on unmount
 * - Pause/resume capability
 * 
 * @param callback - Function to call on each frame with deltaTime in seconds
 * @param options - Configuration options for the game loop
 * 
 * @example
 * ```tsx
 * useGameLoop((deltaTime) => {
 *   // Update game state based on deltaTime
 *   updateResources(deltaTime);
 *   updateUnits(deltaTime);
 * }, { fps: 60, enabled: !isPaused });
 * ```
 */
export function useGameLoop(
  callback: GameLoopCallback,
  options: UseGameLoopOptions = {}
): void {
  const {
    fps = 60,
    enabled = true,
    maxDeltaTime = 0.1, // 100ms max to prevent spiral of death
    enableProfiling = false,
  } = options;
  
  // Store callback in ref to avoid recreating animation frame on callback change
  const callbackRef = useRef<GameLoopCallback>(callback);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const accumulatorRef = useRef<number>(0);
  const profilerRef = useRef(enableProfiling ? getGlobalProfiler() : null);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Calculate frame time from target FPS
  const frameTime = 1 / fps;
  
  // Animation frame callback with profiling
  const animate = useCallback((currentTime: number) => {
    const frameStart = performance.now();
    
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = currentTime;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Calculate delta time in seconds
    const deltaTime = (currentTime - previousTimeRef.current) / 1000;
    previousTimeRef.current = currentTime;
    
    // Cap delta time to prevent spiral of death
    const cappedDeltaTime = Math.min(deltaTime, maxDeltaTime);
    
    // Accumulate time
    accumulatorRef.current += cappedDeltaTime;
    
    // Fixed time step updates
    let updateCount = 0;
    const maxUpdates = 5; // Prevent too many updates in one frame
    
    while (accumulatorRef.current >= frameTime && updateCount < maxUpdates) {
      // Profile update if enabled
      if (profilerRef.current) {
        profilerRef.current.profileUpdate(() => {
          callbackRef.current(frameTime);
        });
      } else {
        callbackRef.current(frameTime);
      }
      
      accumulatorRef.current -= frameTime;
      updateCount++;
    }
    
    // If we hit max updates, reset accumulator to prevent spiral
    if (updateCount >= maxUpdates) {
      accumulatorRef.current = 0;
    }
    
    // Profile frame if enabled
    if (profilerRef.current) {
      profilerRef.current.endFrame(frameStart);
    }
    
    // Continue the loop
    requestRef.current = requestAnimationFrame(animate);
  }, [frameTime, maxDeltaTime]);
  
  // Start/stop the game loop based on enabled state
  useEffect(() => {
    if (enabled) {
      // Reset timing on start
      previousTimeRef.current = undefined;
      accumulatorRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (requestRef.current !== undefined) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    } else {
      // Cancel animation frame if disabled
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    }
  }, [enabled, animate]);
}

/**
 * Hook for managing resource generation in the game loop
 * Integrates with the resource state slice to update resources over time
 * 
 * @param enabled - Whether resource generation is active
 * @param fps - Target frames per second (default: 60)
 * 
 * @example
 * ```tsx
 * import { useStore } from '@/store';
 * import { useResourceGeneration } from '@/hooks/useGameLoop';
 * 
 * function GameComponent() {
 *   const isPaused = useStore((state) => state.game.isPaused);
 *   useResourceGeneration(!isPaused);
 *   
 *   return <div>Game content</div>;
 * }
 * ```
 */
export function useResourceGeneration(
  enabled: boolean = true,
  fps: number = 60
): void {
  // This will be implemented when we integrate with the store
  // For now, we provide the hook structure
  useGameLoop(
    (deltaTime) => {
      // Resource generation will be implemented here
      // This is a placeholder that will be filled when integrating with store
      if (typeof window !== 'undefined' && (window as any).__updateResources) {
        (window as any).__updateResources(deltaTime);
      }
    },
    { fps, enabled }
  );
}

/**
 * Get current FPS for debugging/monitoring
 * 
 * @returns Current frames per second
 */
export function useFPSCounter(): number {
  const fpsRef = useRef<number>(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  
  useEffect(() => {
    let animationFrameId: number;
    
    const updateFPS = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Store last 60 frame times
      frameTimesRef.current.push(deltaTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
      
      // Calculate average FPS
      if (frameTimesRef.current.length > 0) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        fpsRef.current = Math.round(1000 / avgFrameTime);
      }
      
      animationFrameId = requestAnimationFrame(updateFPS);
    };
    
    animationFrameId = requestAnimationFrame(updateFPS);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return fpsRef.current;
}
