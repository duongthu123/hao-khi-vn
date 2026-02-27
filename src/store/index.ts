/**
 * Main Zustand store with slice pattern
 * Combines all game state slices with devtools and persistence
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createGameSlice, GameSlice } from './slices/gameSlice';
import { createHeroSlice, HeroSlice } from './slices/heroSlice';
import { createCombatSlice, CombatSlice } from './slices/combatSlice';
import { createResourceSlice, ResourceSlice } from './slices/resourceSlice';
import { createCollectionSlice, CollectionSlice } from './slices/collectionSlice';
import { createProfileSlice, ProfileSlice } from './slices/profileSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createQuizSlice, QuizSlice } from './slices/quizSlice';
import { createResearchSlice, ResearchSlice } from './slices/researchSlice';

/**
 * Combined store type with all slices
 */
export type GameStore = GameSlice &
  HeroSlice &
  CombatSlice &
  ResourceSlice &
  CollectionSlice &
  ProfileSlice &
  UISlice &
  QuizSlice &
  ResearchSlice;

/**
 * Main game store with all slices combined
 * Uses devtools for debugging and persist for state persistence
 */
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createGameSlice(...args),
        ...createHeroSlice(...args),
        ...createCombatSlice(...args),
        ...createResourceSlice(...args),
        ...createCollectionSlice(...args),
        ...createProfileSlice(...args),
        ...createUISlice(...args),
        ...createQuizSlice(...args),
        ...createResearchSlice(...args),
      }),
      {
        name: 'game-storage',
        // Persist only critical state, exclude transient UI state
        partialize: (state) => ({
          game: state.game,
          hero: {
            selectedHero: state.hero.selectedHero,
            unlockedHeroes: state.hero.unlockedHeroes,
          },
          resources: state.resources,
          collection: state.collection,
          profile: state.profile,
          quiz: state.quiz,
          research: state.research,
          // Exclude: combat (transient), ui (transient), hero.availableHeroes (loaded from constants)
        }),
        // Deep merge persisted state with initial state so excluded fields
        // (like hero.availableHeroes) are preserved from the initial state
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<GameStore>;
          return {
            ...currentState,
            ...persisted,
            resources: {
              ...currentState.resources,
              ...(persisted.resources || {}),
              // Ensure peasants always has a default value for old saves
              peasants: persisted.resources?.peasants ?? currentState.resources.peasants,
            },
            hero: {
              ...currentState.hero,
              ...(persisted.hero || {}),
              // Always keep availableHeroes from initial state (loaded from constants)
              availableHeroes: currentState.hero.availableHeroes,
            },
          };
        },
      }
    ),
    {
      name: 'GameStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for optimized component subscriptions
 */

// Game selectors
export const useGamePhase = () => useGameStore((state) => state.game.phase);
export const useGameDifficulty = () => useGameStore((state) => state.game.difficulty);
export const useIsPaused = () => useGameStore((state) => state.game.isPaused);

// Hero selectors
export const useSelectedHero = () => useGameStore((state) => state.hero.selectedHero);
export const useUnlockedHeroes = () => useGameStore((state) => state.hero.unlockedHeroes);

// Resource selectors
export const useResources = () => useGameStore((state) => ({
  food: state.resources.food,
  gold: state.resources.gold,
  army: state.resources.army,
}));
export const useResourceCaps = () => useGameStore((state) => state.resources.caps);
export const useResourceGeneration = () => useGameStore((state) => state.resources.generation);

// Combat selectors
export const useUnits = () => useGameStore((state) => state.combat.units);
export const useBuildings = () => useGameStore((state) => state.combat.buildings);
export const useCombatLog = () => useGameStore((state) => state.combat.combatLog);

// Collection selectors
export const useCollection = () => useGameStore((state) => state.collection);
export const useCompletionPercentage = () =>
  useGameStore((state) => state.collection.completionPercentage);

// Profile selectors
export const useProfile = () => useGameStore((state) => state.profile);
export const usePlayerName = () => useGameStore((state) => state.profile.playerName);
export const usePlayerRank = () => useGameStore((state) => state.profile.rank);

// UI selectors
export const useActiveModal = () => useGameStore((state) => state.ui.activeModal);
export const useNotifications = () => useGameStore((state) => state.ui.notifications);
export const useMapView = () => useGameStore((state) => ({
  zoom: state.ui.mapZoom,
  position: state.ui.mapPosition,
}));

// Quiz selectors
export const useQuizProgress = () => useGameStore((state) => state.quiz);
export const useQuizAccuracy = () => useGameStore((state) => state.getAccuracy());
export const useQuizRewards = () => useGameStore((state) => state.quiz.rewards);

// Research selectors
export const useResearch = () => useGameStore((state) => state.research);
export const useCompletedResearch = () => useGameStore((state) => state.research.completed);
export const useInProgressResearch = () => useGameStore((state) => state.research.inProgress);
export const useResearchProgress = () => useGameStore((state) => state.research.progress);
export const useAvailableResearch = () => useGameStore((state) => state.getAvailableResearchNodes());

