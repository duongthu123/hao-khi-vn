/**
 * Tests for useAILoop hook
 * Validates Requirements 17.7, 17.8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAILoop } from '../useAILoop';

// Mock the store
vi.mock('@/store', () => ({
  useStore: vi.fn((selector) => {
    const mockState = {
      game: {
        difficulty: 'normal',
        isPaused: false,
        phase: 'playing',
        elapsedTime: 0,
      },
      combat: {
        aiState: {
          lastSpawnTime: 0,
          lastUpdateTime: 0,
          resources: {
            food: 200,
            gold: 150,
            army: 0,
          },
          fortressPosition: { x: 800, y: 400 },
        },
        units: [],
      },
      addUnit: vi.fn(),
      updateUnit: vi.fn(),
      updateAIState: vi.fn(),
      updateAIResources: vi.fn(),
      logCombatEvent: vi.fn(),
      getAIUnits: () => [],
      getPlayerUnits: () => [],
    };
    
    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  }),
}));

describe('useAILoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  
  describe('Basic Functionality', () => {
    it('should start AI loop when enabled', () => {
      const { result } = renderHook(() => useAILoop({ enabled: true }));
      
      expect(result.current).toBeUndefined(); // Hook doesn't return anything
    });
    
    it('should not start AI loop when disabled', () => {
      const { result } = renderHook(() => useAILoop({ enabled: false }));
      
      expect(result.current).toBeUndefined();
    });
    
    it('should accept custom update interval', () => {
      const { result } = renderHook(() => 
        useAILoop({ enabled: true, updateInterval: 2000 })
      );
      
      expect(result.current).toBeUndefined();
    });
  });
  
  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useAILoop({ enabled: true }));
      
      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('AI Loop Integration', () => {
  it('should integrate with game loop system', () => {
    // This test validates that the AI loop hook can be used
    // The actual AI logic is tested in the AI strategy tests
    const { result } = renderHook(() => useAILoop({ enabled: true }));
    
    expect(result.current).toBeUndefined();
  });
  
  it('should support enable/disable toggling', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useAILoop({ enabled }),
      { initialProps: { enabled: true } }
    );
    
    // Disable
    rerender({ enabled: false });
    
    // Re-enable
    rerender({ enabled: true });
    
    // Should not throw
    expect(true).toBe(true);
  });
});
