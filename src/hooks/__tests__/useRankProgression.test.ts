/**
 * useRankProgression Hook Tests
 * Tests rank progression hook with notification integration
 * 
 * Validates Requirements 18.2 (implement ranking system)
 * Validates Requirements 18.6 (award rank promotions)
 * Validates Requirements 18.8 (update displays immediately)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRankProgression } from '../useRankProgression';
import { useGameStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

describe('useRankProgression', () => {
  let mockStore: any;

  beforeEach(() => {
    mockStore = {
      profile: {
        rank: 'Tân Binh',
        level: 1,
        experience: 0,
        wins: 0,
        losses: 0,
      },
      addExperience: vi.fn(),
      addWin: vi.fn(),
      addLoss: vi.fn(),
      addNotification: vi.fn(),
      getNextRankThreshold: vi.fn(() => ({ level: 5, rank: 'Chiến Binh' })),
      getRankForLevel: vi.fn((level: number) => {
        if (level >= 40) return 'Nguyên Soái';
        if (level >= 35) return 'Đại Tướng';
        if (level >= 30) return 'Trung Tướng';
        if (level >= 25) return 'Tiểu Tướng';
        if (level >= 20) return 'Đại Đội Trưởng';
        if (level >= 15) return 'Tiểu Đội Trưởng';
        if (level >= 10) return 'Đội Trưởng';
        if (level >= 5) return 'Chiến Binh';
        return 'Tân Binh';
      }),
    };

    (useGameStore as any).mockImplementation((selector: any) => {
      return selector(mockStore);
    });
  });

  it('should return current rank and level', () => {
    const { result } = renderHook(() => useRankProgression());

    expect(result.current.currentRank).toBe('Tân Binh');
    expect(result.current.currentLevel).toBe(1);
    expect(result.current.experience).toBe(0);
  });

  it('should return next rank threshold', () => {
    const { result } = renderHook(() => useRankProgression());

    expect(result.current.nextRankThreshold).toEqual({
      level: 5,
      rank: 'Chiến Binh',
    });
  });

  it('should add experience with notification', () => {
    const { result } = renderHook(() => useRankProgression());

    act(() => {
      result.current.addExperience(500);
    });

    expect(mockStore.addExperience).toHaveBeenCalledWith(
      500,
      expect.any(Function)
    );
  });

  it('should add win with experience and notification', () => {
    const { result } = renderHook(() => useRankProgression());

    act(() => {
      result.current.addWin();
    });

    expect(mockStore.addWin).toHaveBeenCalled();
    expect(mockStore.addExperience).toHaveBeenCalledWith(
      500,
      expect.any(Function)
    );
    expect(mockStore.addNotification).toHaveBeenCalledWith({
      type: 'success',
      message: expect.stringContaining('Chiến thắng'),
    });
  });

  it('should add loss with smaller experience and notification', () => {
    const { result } = renderHook(() => useRankProgression());

    act(() => {
      result.current.addLoss();
    });

    expect(mockStore.addLoss).toHaveBeenCalled();
    expect(mockStore.addExperience).toHaveBeenCalledWith(
      100,
      expect.any(Function)
    );
    expect(mockStore.addNotification).toHaveBeenCalledWith({
      type: 'info',
      message: expect.stringContaining('Tiếp tục cố gắng'),
    });
  });

  it('should provide getRankForLevel function', () => {
    const { result } = renderHook(() => useRankProgression());

    const rank5 = result.current.getRankForLevel(5);
    const rank10 = result.current.getRankForLevel(10);
    const rank40 = result.current.getRankForLevel(40);

    expect(rank5).toBe('Chiến Binh');
    expect(rank10).toBe('Đội Trưởng');
    expect(rank40).toBe('Nguyên Soái');
  });

  it('should handle multiple wins correctly', () => {
    const { result } = renderHook(() => useRankProgression());

    act(() => {
      result.current.addWin();
      result.current.addWin();
      result.current.addWin();
    });

    expect(mockStore.addWin).toHaveBeenCalledTimes(3);
    expect(mockStore.addNotification).toHaveBeenCalledTimes(3);
  });

  it('should handle mixed wins and losses', () => {
    const { result } = renderHook(() => useRankProgression());

    act(() => {
      result.current.addWin();
      result.current.addLoss();
      result.current.addWin();
    });

    expect(mockStore.addWin).toHaveBeenCalledTimes(2);
    expect(mockStore.addLoss).toHaveBeenCalledTimes(1);
  });

  it('should handle null next rank threshold (max rank)', () => {
    mockStore.getNextRankThreshold = vi.fn(() => null);
    mockStore.profile.level = 40;
    mockStore.profile.rank = 'Nguyên Soái';

    const { result } = renderHook(() => useRankProgression());

    expect(result.current.nextRankThreshold).toBeNull();
  });
});
