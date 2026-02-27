/**
 * Rank Progression System Tests
 * Tests rank calculation, automatic promotions, and experience-based progression
 * 
 * Validates Requirements 18.2 (implement ranking system)
 * Validates Requirements 18.6 (award rank promotions)
 */

import { describe, it, expect, vi } from 'vitest';
import { createProfileSlice, ProfileSlice } from '../profileSlice';

describe('Rank Progression System', () => {
  // Helper to create a test store that properly simulates Zustand
  const createTestStore = () => {
    let state: ProfileSlice;
    
    const set = (fn: any) => {
      const updates = typeof fn === 'function' ? fn(state) : fn;
      state = { ...state, ...updates };
    };
    
    const get = () => state;
    
    state = createProfileSlice(set as any, get as any, {} as any);
    
    return { state: () => state, set, get };
  };

  describe('Rank Calculation', () => {
    it('should start with Tân Binh rank at level 1', () => {
      const { state } = createTestStore();
      
      expect(state().profile.rank).toBe('Tân Binh');
      expect(state().profile.level).toBe(1);
    });

    it('should calculate correct rank for level 5', () => {
      const { state } = createTestStore();
      
      const rank = state().getRankForLevel(5);
      expect(rank).toBe('Chiến Binh');
    });

    it('should calculate correct rank for level 10', () => {
      const { state } = createTestStore();
      
      const rank = state().getRankForLevel(10);
      expect(rank).toBe('Đội Trưởng');
    });

    it('should calculate correct rank for level 40', () => {
      const { state } = createTestStore();
      
      const rank = state().getRankForLevel(40);
      expect(rank).toBe('Nguyên Soái');
    });

    it('should maintain highest rank below threshold', () => {
      const { state } = createTestStore();
      
      // Level 9 should still be Chiến Binh (not Đội Trưởng which requires level 10)
      const rank = state().getRankForLevel(9);
      expect(rank).toBe('Chiến Binh');
    });
  });

  describe('Experience and Level Progression', () => {
    it('should add experience correctly', () => {
      const { state } = createTestStore();
      
      state().addExperience(500);
      
      expect(state().profile.experience).toBe(500);
      expect(state().profile.level).toBe(1); // Still level 1 (need 1000 XP for level 2)
    });

    it('should level up when reaching experience threshold', () => {
      const { state } = createTestStore();
      
      state().addExperience(1000);
      
      expect(state().profile.experience).toBe(1000);
      expect(state().profile.level).toBe(2);
    });

    it('should level up multiple times with large experience gain', () => {
      const { state } = createTestStore();
      
      state().addExperience(5000);
      
      expect(state().profile.experience).toBe(5000);
      expect(state().profile.level).toBe(6); // 5000 / 1000 = 5, +1 base level
    });

    it('should trigger rank calculation on level up', () => {
      const { state } = createTestStore();
      
      // Add enough experience to reach level 5 (Chiến Binh rank)
      state().addExperience(4000);
      
      expect(state().profile.level).toBe(5);
      expect(state().profile.rank).toBe('Chiến Binh');
    });
  });

  describe('Rank Promotion', () => {
    it('should promote to Chiến Binh at level 5', () => {
      const { state } = createTestStore();
      
      state().addExperience(4000); // Level 5
      
      expect(state().profile.rank).toBe('Chiến Binh');
    });

    it('should promote to Đội Trưởng at level 10', () => {
      const { state } = createTestStore();
      
      state().addExperience(9000); // Level 10
      
      expect(state().profile.rank).toBe('Đội Trưởng');
    });

    it('should promote to Nguyên Soái at level 40', () => {
      const { state } = createTestStore();
      
      state().addExperience(39000); // Level 40
      
      expect(state().profile.rank).toBe('Nguyên Soái');
    });

    it('should call notification callback on rank promotion', () => {
      const { state } = createTestStore();
      const mockNotification = vi.fn();
      
      // Start at level 1, add enough XP to reach level 5 (rank promotion)
      state().addExperience(4000, mockNotification);
      
      // Should be called for rank promotion
      expect(mockNotification).toHaveBeenCalled();
      expect(mockNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: expect.stringContaining('Chiến Binh'),
        })
      );
    });

    it('should not call notification callback when rank does not change', () => {
      const { state } = createTestStore();
      const mockNotification = vi.fn();
      
      // Add small amount of XP (no level up)
      state().addExperience(100, mockNotification);
      
      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe('Next Rank Threshold', () => {
    it('should return next rank threshold for level 1', () => {
      const { state } = createTestStore();
      
      const nextRank = state().getNextRankThreshold();
      
      expect(nextRank).toEqual({
        level: 5,
        rank: 'Chiến Binh',
      });
    });

    it('should return next rank threshold for level 5', () => {
      const { state } = createTestStore();
      
      state().addExperience(4000); // Level 5
      const nextRank = state().getNextRankThreshold();
      
      expect(nextRank).toEqual({
        level: 10,
        rank: 'Đội Trưởng',
      });
    });

    it('should return null when at max rank', () => {
      const { state } = createTestStore();
      
      state().addExperience(39000); // Level 40 (max rank)
      const nextRank = state().getNextRankThreshold();
      
      expect(nextRank).toBeNull();
    });
  });

  describe('Win/Loss Integration', () => {
    it('should increment wins', () => {
      const { state } = createTestStore();
      
      state().addWin();
      
      expect(state().profile.wins).toBe(1);
    });

    it('should increment losses', () => {
      const { state } = createTestStore();
      
      state().addLoss();
      
      expect(state().profile.losses).toBe(1);
    });

    it('should calculate win rate correctly', () => {
      const { state } = createTestStore();
      
      state().addWin();
      state().addWin();
      state().addLoss();
      
      const winRate = state().getWinRate();
      expect(winRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero experience', () => {
      const { state } = createTestStore();
      
      state().addExperience(0);
      
      expect(state().profile.experience).toBe(0);
      expect(state().profile.level).toBe(1);
    });

    it('should handle negative experience gracefully', () => {
      const { state } = createTestStore();
      
      state().addExperience(-100);
      
      // Negative experience results in level 0, but system should handle it
      expect(state().profile.experience).toBe(-100);
      expect(state().profile.level).toBe(0);
    });

    it('should handle very large experience values', () => {
      const { state } = createTestStore();
      
      state().addExperience(100000);
      
      expect(state().profile.level).toBe(101);
      expect(state().profile.rank).toBe('Nguyên Soái'); // Max rank
    });
  });
});
