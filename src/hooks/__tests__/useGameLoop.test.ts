/**
 * Tests for useGameLoop hook
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameLoop, useFPSCounter } from '../useGameLoop';

describe('useGameLoop', () => {
  let rafCallbacks: ((time: number) => void)[] = [];
  let rafId = 0;
  let currentTime = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    currentTime = 0;

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });

    // Mock cancelAnimationFrame
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      // Simple implementation - just clear the callbacks
      rafCallbacks = [];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const runFrames = (count: number, timePerFrame: number = 16.67) => {
    for (let i = 0; i < count; i++) {
      currentTime += timePerFrame;
      const callbacks = [...rafCallbacks];
      rafCallbacks = [];
      callbacks.forEach(cb => cb(currentTime));
    }
  };

  it('should call callback with delta time', () => {
    const callback = vi.fn();
    
    renderHook(() => useGameLoop(callback, { fps: 60 }));
    
    // Run a few frames
    runFrames(5);
    
    expect(callback).toHaveBeenCalled();
    
    // Callback should be called with deltaTime as a number
    expect(callback.mock.calls[0][0]).toBeTypeOf('number');
  });

  it('should use fixed time step based on target FPS', () => {
    const callback = vi.fn();
    const targetFPS = 60;
    const expectedDeltaTime = 1 / targetFPS;
    
    renderHook(() => useGameLoop(callback, { fps: targetFPS }));
    
    runFrames(5);
    
    expect(callback).toHaveBeenCalled();
    
    // Check that deltaTime is approximately 1/60 seconds
    const deltaTime = callback.mock.calls[0][0];
    expect(deltaTime).toBeCloseTo(expectedDeltaTime, 3);
  });

  it('should not call callback when disabled', () => {
    const callback = vi.fn();
    
    renderHook(() => useGameLoop(callback, { enabled: false }));
    
    runFrames(5);
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should stop calling callback when disabled after being enabled', () => {
    const callback = vi.fn();
    
    const { rerender } = renderHook(
      ({ enabled }) => useGameLoop(callback, { enabled }),
      { initialProps: { enabled: true } }
    );
    
    runFrames(3);
    
    expect(callback).toHaveBeenCalled();
    
    const callCountBefore = callback.mock.calls.length;
    
    // Disable the loop
    rerender({ enabled: false });
    
    runFrames(3);
    
    // Call count should not increase
    expect(callback.mock.calls.length).toBe(callCountBefore);
  });

  it('should resume calling callback when re-enabled', () => {
    const callback = vi.fn();
    
    const { rerender } = renderHook(
      ({ enabled }) => useGameLoop(callback, { enabled }),
      { initialProps: { enabled: false } }
    );
    
    runFrames(3);
    
    expect(callback).not.toHaveBeenCalled();
    
    // Enable the loop
    rerender({ enabled: true });
    
    runFrames(3);
    
    expect(callback).toHaveBeenCalled();
  });

  it('should update callback when it changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const { rerender } = renderHook(
      ({ cb }) => useGameLoop(cb, { fps: 60 }),
      { initialProps: { cb: callback1 } }
    );
    
    runFrames(3);
    
    expect(callback1).toHaveBeenCalled();
    
    // Change callback
    rerender({ cb: callback2 });
    
    runFrames(3);
    
    expect(callback2).toHaveBeenCalled();
  });

  it('should cap delta time to prevent spiral of death', () => {
    const callback = vi.fn();
    const maxDeltaTime = 0.1; // 100ms
    
    renderHook(() => useGameLoop(callback, { maxDeltaTime }));
    
    // Simulate a very long frame (500ms)
    runFrames(1, 500);
    runFrames(5, 16.67);
    
    expect(callback).toHaveBeenCalled();
    
    // All deltaTime values should be <= maxDeltaTime
    callback.mock.calls.forEach(([deltaTime]) => {
      expect(deltaTime).toBeLessThanOrEqual(maxDeltaTime);
    });
  });

  it('should cleanup animation frame on unmount', () => {
    const callback = vi.fn();
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    
    const { unmount } = renderHook(() => useGameLoop(callback));
    
    unmount();
    
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should handle different FPS targets', () => {
    const callback30 = vi.fn();
    const callback120 = vi.fn();
    
    renderHook(() => useGameLoop(callback30, { fps: 30 }));
    renderHook(() => useGameLoop(callback120, { fps: 120 }));
    
    runFrames(5);
    
    expect(callback30).toHaveBeenCalled();
    expect(callback120).toHaveBeenCalled();
    
    // 30 FPS should have deltaTime of ~0.033s
    const deltaTime30 = callback30.mock.calls[0][0];
    expect(deltaTime30).toBeCloseTo(1 / 30, 2);
    
    // 120 FPS should have deltaTime of ~0.008s
    const deltaTime120 = callback120.mock.calls[0][0];
    expect(deltaTime120).toBeCloseTo(1 / 120, 2);
  });
});

describe('useFPSCounter', () => {
  let rafCallbacks: ((time: number) => void)[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      rafCallbacks = [];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial FPS value', () => {
    const { result } = renderHook(() => useFPSCounter());
    
    expect(result.current).toBe(60);
  });

  it('should cleanup animation frame on unmount', () => {
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    
    const { unmount } = renderHook(() => useFPSCounter());
    
    unmount();
    
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });
});
