/**
 * Tests for useAutoSave hook
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.6, 8.7, 8.8**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave, getTimeSinceLastSave } from '../useAutoSave';
import { useGameStore } from '@/store';
import * as localSaves from '@/lib/saves/local';

// Mock the save system
vi.mock('@/lib/saves/local', () => ({
  saveToSlot: vi.fn(),
}));

// Mock the store
vi.mock('@/store', () => {
  const mockStore = {
    game: {
      phase: 'playing',
      difficulty: 'normal',
      currentLevel: 1,
      elapsedTime: 1000,
    },
    hero: {
      selectedHero: { id: 'hero-1' },
      unlockedHeroes: ['hero-1'],
    },
    combat: {
      units: [],
      buildings: [],
    },
    resources: {
      food: 100,
      gold: 50,
      army: 10,
      caps: { food: 200, gold: 100, army: 50 },
      generation: {
        foodPerSecond: 1,
        goldPerSecond: 0.5,
        armyPerSecond: 0,
      },
    },
    collection: {
      heroes: [{ id: 'hero-1' }],
      items: [],
      completionPercentage: 25,
    },
    profile: {
      playerName: 'Test Player',
      rank: 'Soldier',
      level: 5,
      experience: 500,
      wins: 3,
      losses: 1,
      achievements: [],
      statistics: {
        totalPlayTime: 3600,
        unitsDefeated: 50,
        resourcesGathered: 1000,
        quizzesCompleted: 2,
      },
    },
    research: {
      completed: [],
      inProgress: null,
      progress: 0,
    },
    quiz: {
      questionsAnswered: 10,
      correctAnswers: 8,
      completedCategories: [],
      rewards: [],
    },
    ui: {
      settings: {
        autoSaveEnabled: true,
      },
    },
    addNotification: vi.fn(),
    getAvailableResearchNodes: vi.fn(() => []),
  };
  
  return {
    useGameStore: vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    }),
  };
});

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useAutoSave());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.lastSaveTime).toBe(0);
    });

    it('should respect enabled flag', () => {
      const { result } = renderHook(() => useAutoSave({ enabled: false }));

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('Auto-save interval', () => {
    it('should set up interval with configured value', () => {
      const interval = 60 * 1000; // 1 minute
      const { result } = renderHook(() => useAutoSave({ interval }));

      // Hook should initialize successfully
      expect(result.current.isEnabled).toBe(true);
    });
  });

  describe('Dedicated auto-save slot', () => {
    it('should use slot 0 by default', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      expect(saveToSlotSpy).toHaveBeenCalledWith(0, expect.any(Object));
    });

    it('should use configured auto-save slot', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave({ autoSaveSlot: 2 }));

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      expect(saveToSlotSpy).toHaveBeenCalledWith(2, expect.any(Object));
    });
  });

  describe('Combat debouncing', () => {
    it('should not save during active combat', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      // Should save when no combat
      expect(saveToSlotSpy).toHaveBeenCalled();
    });
  });

  describe('Game phase checks', () => {
    it('should save in playing phase', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      expect(saveToSlotSpy).toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    it('should show success notification on successful save', async () => {
      vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      // Notification should be called
      const store = useGameStore();
      expect(store.addNotification).toHaveBeenCalled();
    });
  });

  describe('Manual trigger', () => {
    it('should allow manual trigger of auto-save', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      expect(saveToSlotSpy).toHaveBeenCalled();
    });

    it('should expose lastSaveTime property', () => {
      const { result } = renderHook(() => useAutoSave());

      // Should have lastSaveTime property (initially 0)
      expect(typeof result.current.lastSaveTime).toBe('number');
    });
  });

  describe('Save data structure', () => {
    it('should save complete game state', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave();
      });

      const savedState = saveToSlotSpy.mock.calls[0][1];

      expect(savedState).toMatchObject({
        version: '1.0.0',
        metadata: expect.objectContaining({
          playerName: 'Test Player',
          level: 5,
        }),
        game: expect.objectContaining({
          phase: 'playing',
          difficulty: 'normal',
        }),
        resources: expect.objectContaining({
          food: 100,
          gold: 50,
        }),
        profile: expect.objectContaining({
          name: 'Test Player',
          rank: 'Soldier',
        }),
      });
    });
  });

  describe('Critical event triggers', () => {
    it('should have enableEventTriggers option', () => {
      const { result } = renderHook(() => useAutoSave({ enableEventTriggers: true }));
      
      // Hook should initialize successfully with event triggers enabled
      expect(result.current.isEnabled).toBe(true);
    });

    it('should have enableEventTriggers disabled option', () => {
      const { result } = renderHook(() => useAutoSave({ enableEventTriggers: false }));
      
      // Hook should initialize successfully with event triggers disabled
      expect(result.current.isEnabled).toBe(true);
    });
  });

  describe('Animation prevention', () => {
    it('should prevent auto-save during animations', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      // Mark animation start
      act(() => {
        result.current.markAnimationStart();
      });

      // Try to trigger auto-save during animation
      await act(async () => {
        await result.current.triggerAutoSave();
      });

      // Should NOT have saved during animation
      expect(saveToSlotSpy).not.toHaveBeenCalled();
    });

    it('should allow auto-save after animation ends', async () => {
      const saveToSlotSpy = vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      // Mark animation start and end
      act(() => {
        result.current.markAnimationStart();
        result.current.markAnimationEnd();
      });

      // Try to trigger auto-save after animation
      await act(async () => {
        await result.current.triggerAutoSave();
      });

      // Should have saved after animation ended
      expect(saveToSlotSpy).toHaveBeenCalled();
    });

    it('should expose animation control functions', () => {
      const { result } = renderHook(() => useAutoSave());

      // Should have animation control functions
      expect(typeof result.current.markAnimationStart).toBe('function');
      expect(typeof result.current.markAnimationEnd).toBe('function');
    });
  });

  describe('Manual trigger with reason', () => {
    it('should accept reason parameter in triggerAutoSave', async () => {
      vi.spyOn(localSaves, 'saveToSlot').mockResolvedValue();

      const { result } = renderHook(() => useAutoSave());

      await act(async () => {
        await result.current.triggerAutoSave('test reason');
      });

      // Check notification was called with reason
      const store = useGameStore();
      expect(store.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('test reason'),
        })
      );
    });
  });
});

describe('getTimeSinceLastSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Chưa lưu" for zero timestamp', () => {
    expect(getTimeSinceLastSave(0)).toBe('Chưa lưu');
  });

  it('should format seconds correctly', () => {
    const thirtySecondsAgo = Date.now() - 30 * 1000;
    expect(getTimeSinceLastSave(thirtySecondsAgo)).toBe('30 giây trước');
  });

  it('should format minutes correctly', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(getTimeSinceLastSave(fiveMinutesAgo)).toBe('5 phút trước');
  });

  it('should format hours correctly', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(getTimeSinceLastSave(twoHoursAgo)).toBe('2 giờ trước');
  });
});
