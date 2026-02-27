/**
 * Unit tests for game state slice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createGameSlice, GameSlice } from '../gameSlice';
import { GamePhase, Difficulty } from '@/types/game';

describe('gameSlice', () => {
  let store: ReturnType<typeof create<GameSlice>>;

  beforeEach(() => {
    store = create<GameSlice>()(createGameSlice);
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = store.getState();
      expect(state.game.phase).toBe(GamePhase.MENU);
      expect(state.game.difficulty).toBe(Difficulty.NORMAL);
      expect(state.game.currentLevel).toBe(1);
      expect(state.game.isPaused).toBe(false);
      expect(state.game.elapsedTime).toBe(0);
    });
  });

  describe('setPhase', () => {
    it('should update game phase', () => {
      store.getState().setPhase(GamePhase.PLAYING);
      expect(store.getState().game.phase).toBe(GamePhase.PLAYING);
    });

    it('should handle all phase transitions', () => {
      const phases = [
        GamePhase.MENU,
        GamePhase.HERO_SELECTION,
        GamePhase.PLAYING,
        GamePhase.PAUSED,
        GamePhase.GAME_OVER,
      ];

      phases.forEach((phase) => {
        store.getState().setPhase(phase);
        expect(store.getState().game.phase).toBe(phase);
      });
    });
  });

  describe('setDifficulty', () => {
    it('should update difficulty level', () => {
      store.getState().setDifficulty(Difficulty.HARD);
      expect(store.getState().game.difficulty).toBe(Difficulty.HARD);
    });

    it('should handle all difficulty levels', () => {
      const difficulties = [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD];

      difficulties.forEach((difficulty) => {
        store.getState().setDifficulty(difficulty);
        expect(store.getState().game.difficulty).toBe(difficulty);
      });
    });
  });

  describe('setCurrentLevel', () => {
    it('should update current level', () => {
      store.getState().setCurrentLevel(5);
      expect(store.getState().game.currentLevel).toBe(5);
    });

    it('should handle level progression', () => {
      for (let level = 1; level <= 10; level++) {
        store.getState().setCurrentLevel(level);
        expect(store.getState().game.currentLevel).toBe(level);
      }
    });
  });

  describe('pause and resume', () => {
    it('should pause the game', () => {
      store.getState().pauseGame();
      expect(store.getState().game.isPaused).toBe(true);
    });

    it('should resume the game', () => {
      store.getState().pauseGame();
      store.getState().resumeGame();
      expect(store.getState().game.isPaused).toBe(false);
    });

    it('should handle multiple pause/resume cycles', () => {
      for (let i = 0; i < 3; i++) {
        store.getState().pauseGame();
        expect(store.getState().game.isPaused).toBe(true);
        store.getState().resumeGame();
        expect(store.getState().game.isPaused).toBe(false);
      }
    });
  });

  describe('incrementTime', () => {
    it('should increment elapsed time', () => {
      store.getState().incrementTime(1.5);
      expect(store.getState().game.elapsedTime).toBe(1.5);
    });

    it('should accumulate time correctly', () => {
      store.getState().incrementTime(1);
      store.getState().incrementTime(2);
      store.getState().incrementTime(3);
      expect(store.getState().game.elapsedTime).toBe(6);
    });

    it('should handle fractional seconds', () => {
      store.getState().incrementTime(0.016); // ~60 FPS frame
      store.getState().incrementTime(0.016);
      expect(store.getState().game.elapsedTime).toBeCloseTo(0.032, 3);
    });
  });

  describe('resetGame', () => {
    it('should reset all game state to initial values', () => {
      // Modify state
      store.getState().setPhase(GamePhase.PLAYING);
      store.getState().setDifficulty(Difficulty.HARD);
      store.getState().setCurrentLevel(10);
      store.getState().pauseGame();
      store.getState().incrementTime(100);

      // Reset
      store.getState().resetGame();

      // Verify reset
      const state = store.getState();
      expect(state.game.phase).toBe(GamePhase.MENU);
      expect(state.game.difficulty).toBe(Difficulty.NORMAL);
      expect(state.game.currentLevel).toBe(1);
      expect(state.game.isPaused).toBe(false);
      expect(state.game.elapsedTime).toBe(0);
    });
  });

  describe('immutability', () => {
    it('should not mutate state directly', () => {
      const initialState = store.getState().game;
      store.getState().setPhase(GamePhase.PLAYING);
      const newState = store.getState().game;

      expect(initialState).not.toBe(newState);
      expect(initialState.phase).toBe(GamePhase.MENU);
      expect(newState.phase).toBe(GamePhase.PLAYING);
    });
  });
});
