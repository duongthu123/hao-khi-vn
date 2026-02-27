/**
 * Unit tests for profile state slice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createProfileSlice, ProfileSlice, Achievement } from '../profileSlice';

describe('profileSlice', () => {
  let store: ReturnType<typeof create<ProfileSlice>>;

  beforeEach(() => {
    store = create<ProfileSlice>()(createProfileSlice);
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = store.getState();
      expect(state.profile.playerName).toBe('Người Chơi');
      expect(state.profile.rank).toBe('Tân Binh');
      expect(state.profile.level).toBe(1);
      expect(state.profile.experience).toBe(0);
      expect(state.profile.wins).toBe(0);
      expect(state.profile.losses).toBe(0);
      expect(state.profile.achievements).toEqual([]);
      expect(state.profile.statistics.totalPlayTime).toBe(0);
    });
  });

  describe('setPlayerName', () => {
    it('should update player name', () => {
      store.getState().setPlayerName('Trần Hưng Đạo');
      expect(store.getState().profile.playerName).toBe('Trần Hưng Đạo');
    });
  });

  describe('experience and leveling', () => {
    it('should add experience', () => {
      store.getState().addExperience(500);
      expect(store.getState().profile.experience).toBe(500);
    });

    it('should level up at 1000 experience', () => {
      store.getState().addExperience(1000);
      expect(store.getState().profile.level).toBe(2);
      expect(store.getState().profile.experience).toBe(1000);
    });

    it('should handle multiple level ups', () => {
      store.getState().addExperience(3500);
      expect(store.getState().profile.level).toBe(4);
      expect(store.getState().profile.experience).toBe(3500);
    });

    it('should accumulate experience correctly', () => {
      store.getState().addExperience(500);
      store.getState().addExperience(300);
      store.getState().addExperience(200);
      expect(store.getState().profile.experience).toBe(1000);
      expect(store.getState().profile.level).toBe(2);
    });
  });

  describe('rank calculation', () => {
    it('should start at Tân Binh rank', () => {
      expect(store.getState().profile.rank).toBe('Tân Binh');
    });

    it('should promote to Chiến Binh at level 5', () => {
      store.getState().addExperience(4000); // Level 5
      expect(store.getState().profile.rank).toBe('Chiến Binh');
    });

    it('should promote to Đội Trưởng at level 10', () => {
      store.getState().addExperience(9000); // Level 10
      expect(store.getState().profile.rank).toBe('Đội Trưởng');
    });

    it('should promote to Tiểu Đội Trưởng at level 15', () => {
      store.getState().addExperience(14000); // Level 15
      expect(store.getState().profile.rank).toBe('Tiểu Đội Trưởng');
    });

    it('should promote to Đại Đội Trưởng at level 20', () => {
      store.getState().addExperience(19000); // Level 20
      expect(store.getState().profile.rank).toBe('Đại Đội Trưởng');
    });

    it('should promote to Tiểu Tướng at level 25', () => {
      store.getState().addExperience(24000); // Level 25
      expect(store.getState().profile.rank).toBe('Tiểu Tướng');
    });

    it('should promote to Trung Tướng at level 30', () => {
      store.getState().addExperience(29000); // Level 30
      expect(store.getState().profile.rank).toBe('Trung Tướng');
    });

    it('should promote to Đại Tướng at level 35', () => {
      store.getState().addExperience(34000); // Level 35
      expect(store.getState().profile.rank).toBe('Đại Tướng');
    });

    it('should promote to Nguyên Soái at level 40', () => {
      store.getState().addExperience(39000); // Level 40
      expect(store.getState().profile.rank).toBe('Nguyên Soái');
    });

    it('should stay at highest rank after level 40', () => {
      store.getState().addExperience(50000); // Level 51
      expect(store.getState().profile.rank).toBe('Nguyên Soái');
    });
  });

  describe('wins and losses', () => {
    it('should increment wins', () => {
      store.getState().addWin();
      expect(store.getState().profile.wins).toBe(1);
    });

    it('should increment losses', () => {
      store.getState().addLoss();
      expect(store.getState().profile.losses).toBe(1);
    });

    it('should track multiple games', () => {
      store.getState().addWin();
      store.getState().addWin();
      store.getState().addLoss();
      store.getState().addWin();
      expect(store.getState().profile.wins).toBe(3);
      expect(store.getState().profile.losses).toBe(1);
    });
  });

  describe('win rate calculation', () => {
    it('should return 0 for no games', () => {
      expect(store.getState().getWinRate()).toBe(0);
    });

    it('should calculate win rate correctly', () => {
      store.getState().addWin();
      store.getState().addWin();
      store.getState().addWin();
      store.getState().addLoss();
      expect(store.getState().getWinRate()).toBe(75);
    });

    it('should return 100 for all wins', () => {
      store.getState().addWin();
      store.getState().addWin();
      expect(store.getState().getWinRate()).toBe(100);
    });

    it('should return 0 for all losses', () => {
      store.getState().addLoss();
      store.getState().addLoss();
      expect(store.getState().getWinRate()).toBe(0);
    });
  });

  describe('achievements', () => {
    const mockAchievement: Achievement = {
      id: 'first-win',
      name: 'First Victory',
      description: 'Win your first battle',
      icon: 'trophy',
      unlocked: false,
    };

    it('should add achievement', () => {
      store.getState().addAchievement(mockAchievement);
      expect(store.getState().profile.achievements).toHaveLength(1);
      expect(store.getState().profile.achievements[0].id).toBe('first-win');
    });

    it('should not add duplicate achievements', () => {
      store.getState().addAchievement(mockAchievement);
      store.getState().addAchievement(mockAchievement);
      expect(store.getState().profile.achievements).toHaveLength(1);
    });

    it('should unlock achievement', () => {
      store.getState().addAchievement(mockAchievement);
      store.getState().unlockAchievement('first-win');
      const achievement = store.getState().profile.achievements[0];
      expect(achievement.unlocked).toBe(true);
      expect(achievement.unlockedAt).toBeDefined();
    });

    it('should check if achievement is unlocked', () => {
      store.getState().addAchievement(mockAchievement);
      expect(store.getState().hasAchievement('first-win')).toBe(false);
      store.getState().unlockAchievement('first-win');
      expect(store.getState().hasAchievement('first-win')).toBe(true);
    });

    it('should get unlocked achievements', () => {
      const achievement1: Achievement = { ...mockAchievement, id: 'ach1' };
      const achievement2: Achievement = { ...mockAchievement, id: 'ach2' };
      const achievement3: Achievement = { ...mockAchievement, id: 'ach3' };

      store.getState().addAchievement(achievement1);
      store.getState().addAchievement(achievement2);
      store.getState().addAchievement(achievement3);

      store.getState().unlockAchievement('ach1');
      store.getState().unlockAchievement('ach3');

      const unlocked = store.getState().getUnlockedAchievements();
      expect(unlocked).toHaveLength(2);
      expect(unlocked.map((a) => a.id)).toEqual(['ach1', 'ach3']);
    });
  });

  describe('statistics', () => {
    it('should increment play time', () => {
      store.getState().incrementStats('totalPlayTime', 60);
      expect(store.getState().profile.statistics.totalPlayTime).toBe(60);
    });

    it('should increment units defeated', () => {
      store.getState().incrementStats('unitsDefeated', 10);
      expect(store.getState().profile.statistics.unitsDefeated).toBe(10);
    });

    it('should increment resources gathered', () => {
      store.getState().incrementStats('resourcesGathered', 500);
      expect(store.getState().profile.statistics.resourcesGathered).toBe(500);
    });

    it('should increment quizzes completed', () => {
      store.getState().incrementStats('quizzesCompleted', 1);
      expect(store.getState().profile.statistics.quizzesCompleted).toBe(1);
    });

    it('should accumulate statistics', () => {
      store.getState().incrementStats('unitsDefeated', 5);
      store.getState().incrementStats('unitsDefeated', 3);
      store.getState().incrementStats('unitsDefeated', 7);
      expect(store.getState().profile.statistics.unitsDefeated).toBe(15);
    });
  });

  describe('updateProfile', () => {
    it('should update multiple profile fields', () => {
      store.getState().updateProfile({
        playerName: 'Test Player',
        level: 10,
        wins: 5,
      });
      expect(store.getState().profile.playerName).toBe('Test Player');
      expect(store.getState().profile.level).toBe(10);
      expect(store.getState().profile.wins).toBe(5);
    });
  });

  describe('getTotalGames', () => {
    it('should return total games played', () => {
      store.getState().addWin();
      store.getState().addWin();
      store.getState().addLoss();
      expect(store.getState().getTotalGames()).toBe(3);
    });
  });

  describe('immutability', () => {
    it('should not mutate state directly', () => {
      const initialState = store.getState().profile;
      store.getState().addWin();
      const newState = store.getState().profile;

      expect(initialState).not.toBe(newState);
      expect(initialState.wins).toBe(0);
      expect(newState.wins).toBe(1);
    });
  });
});
