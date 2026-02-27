/**
 * Game state slice
 * Manages core game state including phase, difficulty, level, and timing
 */

import { StateCreator } from 'zustand';
import { GamePhase, Difficulty } from '@/types/game';

export interface GameSlice {
  game: {
    phase: GamePhase;
    difficulty: Difficulty;
    currentLevel: number;
    isPaused: boolean;
    elapsedTime: number;
  };
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setCurrentLevel: (level: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  incrementTime: (deltaSeconds: number) => void;
  resetGame: () => void;
}

const initialGameState = {
  phase: GamePhase.MENU,
  difficulty: Difficulty.NORMAL,
  currentLevel: 1,
  isPaused: false,
  elapsedTime: 0,
};

export const createGameSlice: StateCreator<GameSlice> = (set) => ({
  game: initialGameState,
  
  setPhase: (phase) =>
    set((state) => ({
      game: { ...state.game, phase },
    })),
  
  setDifficulty: (difficulty) =>
    set((state) => ({
      game: { ...state.game, difficulty },
    })),
  
  setCurrentLevel: (level) =>
    set((state) => ({
      game: { ...state.game, currentLevel: level },
    })),
  
  pauseGame: () =>
    set((state) => ({
      game: { ...state.game, isPaused: true },
    })),
  
  resumeGame: () =>
    set((state) => ({
      game: { ...state.game, isPaused: false },
    })),
  
  incrementTime: (deltaSeconds) =>
    set((state) => ({
      game: { ...state.game, elapsedTime: state.game.elapsedTime + deltaSeconds },
    })),
  
  resetGame: () =>
    set(() => ({
      game: initialGameState,
    })),
});
