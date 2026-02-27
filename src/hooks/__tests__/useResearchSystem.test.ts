/**
 * Tests for useResearchSystem hook
 * Validates Requirements: 19.2, 19.4, 19.5, 19.8
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResearchSystem } from '../useResearchSystem';
import { useGameStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

// Mock research constants
vi.mock('@/constants/research', () => ({
  getResearchById: vi.fn((id: string) => {
    if (id === 'research-improved-farming') {
      return {
        id: 'research-improved-farming',
        name: 'Improved Farming',
        nameVietnamese: 'Cải Tiến Nông Nghiệp',
        cost: { food: 200, gold: 150 },
        duration: 30,
        effects: [
          {
            type: 'resource-generation',
            target: 'food',
            value: 25,
            descriptionVietnamese: '+25% sản xuất lương thực',
          },
        ],
      };
    }
    return null;
  }),
  getResearchDurationMs: vi.fn((id: string) => {
    if (id === 'research-improved-farming') return 30000; // 30 seconds
    return 0;
  }),
}));

describe('useResearchSystem', () => {
  let mockStore: any;

  beforeEach(() => {
    vi.useFakeTimers();

    mockStore = {
      research: {
        completed: [],
        inProgress: null,
        progress: 0,
        progressStartTime: null,
      },
      resources: {
        food: 500,
        gold: 500,
        generation: {
          foodPerSecond: 1,
          goldPerSecond: 0.5,
        },
      },
      startResearch: vi.fn((id: string) => {
        mockStore.research.inProgress = id;
        mockStore.research.progressStartTime = Date.now();
      }),
      updateResearchProgress: vi.fn((progress: number) => {
        mockStore.research.progress = progress;
      }),
      completeResearch: vi.fn(() => {
        if (mockStore.research.inProgress) {
          mockStore.research.completed.push(mockStore.research.inProgress);
          mockStore.research.inProgress = null;
          mockStore.research.progress = 0;
          mockStore.research.progressStartTime = null;
        }
      }),
      cancelResearch: vi.fn(() => {
        mockStore.research.inProgress = null;
        mockStore.research.progress = 0;
        mockStore.research.progressStartTime = null;
      }),
      subtractResource: vi.fn((resource: string, amount: number) => {
        if (mockStore.resources[resource] >= amount) {
          mockStore.resources[resource] -= amount;
          return true;
        }
        return false;
      }),
      addNotification: vi.fn(),
      setGeneration: vi.fn((updates: any) => {
        mockStore.resources.generation = {
          ...mockStore.resources.generation,
          ...updates,
        };
      }),
    };

    (useGameStore as any).mockImplementation((selector: any) => selector(mockStore));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('startResearch', () => {
    it('should validate and start research with sufficient resources', () => {
      const { result } = renderHook(() => useResearchSystem());

      act(() => {
        const success = result.current.startResearch('research-improved-farming');
        expect(success).toBe(true);
      });

      expect(mockStore.subtractResource).toHaveBeenCalledWith('food', 200);
      expect(mockStore.subtractResource).toHaveBeenCalledWith('gold', 150);
      expect(mockStore.startResearch).toHaveBeenCalledWith('research-improved-farming');
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: expect.stringContaining('Cải Tiến Nông Nghiệp'),
        })
      );
    });

    it('should reject research with insufficient resources', () => {
      mockStore.resources.food = 100; // Not enough
      const { result } = renderHook(() => useResearchSystem());

      act(() => {
        const success = result.current.startResearch('research-improved-farming');
        expect(success).toBe(false);
      });

      expect(mockStore.startResearch).not.toHaveBeenCalled();
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('Không đủ tài nguyên'),
        })
      );
    });

    it('should reject research if already researching', () => {
      mockStore.research.inProgress = 'research-mining-techniques';
      const { result } = renderHook(() => useResearchSystem());

      act(() => {
        const success = result.current.startResearch('research-improved-farming');
        expect(success).toBe(false);
      });

      expect(mockStore.startResearch).not.toHaveBeenCalled();
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('đang tiến hành'),
        })
      );
    });

    it('should reject already completed research', () => {
      mockStore.research.completed = ['research-improved-farming'];
      const { result } = renderHook(() => useResearchSystem());

      act(() => {
        const success = result.current.startResearch('research-improved-farming');
        expect(success).toBe(false);
      });

      expect(mockStore.startResearch).not.toHaveBeenCalled();
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          message: expect.stringContaining('đã hoàn thành'),
        })
      );
    });
  });

  describe('cancelResearch', () => {
    it('should cancel in-progress research', () => {
      mockStore.research.inProgress = 'research-improved-farming';
      const { result } = renderHook(() => useResearchSystem());

      act(() => {
        result.current.cancelResearch();
      });

      expect(mockStore.cancelResearch).toHaveBeenCalled();
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          message: expect.stringContaining('Đã hủy'),
        })
      );
    });
  });

  describe('progress tracking', () => {
    it('should track research progress over time', async () => {
      const { result, rerender } = renderHook(() => useResearchSystem());

      // Start research
      act(() => {
        result.current.startResearch('research-improved-farming');
      });

      // Force re-render to trigger useEffect
      rerender();

      // Advance time by 15 seconds (50% of 30 seconds)
      await act(async () => {
        vi.advanceTimersByTime(15000);
        await Promise.resolve();
      });

      expect(mockStore.updateResearchProgress).toHaveBeenCalled();
      // Progress should be around 50%
      const lastCall = mockStore.updateResearchProgress.mock.calls.slice(-1)[0];
      expect(lastCall[0]).toBeGreaterThan(45);
      expect(lastCall[0]).toBeLessThan(55);
    }, 10000);

    it('should complete research and apply effects when progress reaches 100%', async () => {
      const { result, rerender } = renderHook(() => useResearchSystem());

      // Start research
      act(() => {
        result.current.startResearch('research-improved-farming');
      });

      // Force re-render to trigger useEffect
      rerender();

      // Advance time to completion (30 seconds)
      await act(async () => {
        vi.advanceTimersByTime(30100); // Slightly more to ensure completion
        await Promise.resolve();
      });

      expect(mockStore.completeResearch).toHaveBeenCalled();
      expect(mockStore.setGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          foodPerSecond: expect.any(Number),
        })
      );
      expect(mockStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: expect.stringContaining('Hoàn thành nghiên cứu'),
        })
      );
    }, 10000);

    it('should apply resource generation effects correctly', async () => {
      const { result, rerender } = renderHook(() => useResearchSystem());

      // Start research
      act(() => {
        result.current.startResearch('research-improved-farming');
      });

      // Force re-render to trigger useEffect
      rerender();

      // Complete research
      await act(async () => {
        vi.advanceTimersByTime(30100);
        await Promise.resolve();
      });

      expect(mockStore.setGeneration).toHaveBeenCalled();
      const generationCall = mockStore.setGeneration.mock.calls[0][0];
      // Should increase food generation by 25%
      expect(generationCall.foodPerSecond).toBe(1.25); // 1 + (1 * 0.25)
    }, 10000);
  });

  describe('currentResearch', () => {
    it('should return current research node when in progress', () => {
      mockStore.research.inProgress = 'research-improved-farming';
      const { result } = renderHook(() => useResearchSystem());

      expect(result.current.currentResearch).toBeDefined();
      expect(result.current.currentResearch?.id).toBe('research-improved-farming');
    });

    it('should return null when no research in progress', () => {
      const { result } = renderHook(() => useResearchSystem());

      expect(result.current.currentResearch).toBeNull();
    });
  });

  describe('progress property', () => {
    it('should return current progress value', () => {
      mockStore.research.progress = 75;
      const { result } = renderHook(() => useResearchSystem());

      expect(result.current.progress).toBe(75);
    });
  });
});
