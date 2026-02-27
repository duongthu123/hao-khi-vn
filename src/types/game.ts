/**
 * Core game types and enums
 * Defines the fundamental game state, phases, and difficulty levels
 */

/**
 * Game phase enum representing different states of the game
 */
export enum GamePhase {
  MENU = 'menu',
  HERO_SELECTION = 'hero-selection',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game-over'
}

/**
 * Difficulty level enum
 */
export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

/**
 * Complete game state interface
 */
export interface GameState {
  version: string;
  metadata: {
    slot: number;
    timestamp: number;
    playerName: string;
    progress: number;
    level: number;
    playTime: number;
  };
  game: {
    phase: GamePhase;
    difficulty: Difficulty;
    currentLevel: number;
    elapsedTime: number;
  };
  hero: {
    selectedHero: string | null;
    unlockedHeroes: string[];
  };
  combat: {
    units: string[];
    buildings: string[];
    activeEffects: string[];
  };
  resources: {
    food: number;
    gold: number;
    army: number;
    foodCap: number;
    goldCap: number;
    armyCap: number;
    generation: {
      foodPerSecond: number;
      goldPerSecond: number;
      armyPerSecond: number;
    };
  };
  collection: {
    heroes: string[];
    items: string[];
    completionPercentage: number;
  };
  profile: {
    name: string;
    rank: string;
    level: number;
    experience: number;
    wins: number;
    losses: number;
    achievements: string[];
    statistics: {
      totalPlayTime: number;
      unitsDefeated: number;
      resourcesGathered: number;
      quizzesCompleted: number;
    };
  };
  research: {
    completed: string[];
    inProgress: string | null;
    progress: number;
    available: string[];
  };
  quiz: {
    questionsAnswered: number;
    correctAnswers: number;
    completedCategories: string[];
    rewards: string[];
  };
}
