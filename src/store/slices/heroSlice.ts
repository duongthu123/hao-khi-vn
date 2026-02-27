/**
 * Hero state slice
 * Manages hero selection, available heroes, and unlocked heroes
 */

import { StateCreator } from 'zustand';
import { Hero } from '@/types/hero';

export interface HeroSlice {
  hero: {
    selectedHero: Hero | null;
    availableHeroes: Hero[];
    unlockedHeroes: string[];
  };
  
  // Actions
  selectHero: (hero: Hero | null) => void;
  unlockHero: (heroId: string) => void;
  loadHeroes: (heroes: Hero[]) => void;
  
  // Selectors
  getHeroById: (heroId: string) => Hero | undefined;
  getUnlockedHeroes: () => Hero[];
  isHeroUnlocked: (heroId: string) => boolean;
}

const initialHeroState = {
  selectedHero: null,
  availableHeroes: [],
  unlockedHeroes: [],
};

export const createHeroSlice: StateCreator<HeroSlice> = (set, get) => ({
  hero: initialHeroState,
  
  selectHero: (hero) =>
    set((state) => ({
      hero: { ...state.hero, selectedHero: hero },
    })),
  
  unlockHero: (heroId) =>
    set((state) => ({
      hero: {
        ...state.hero,
        unlockedHeroes: state.hero.unlockedHeroes.includes(heroId)
          ? state.hero.unlockedHeroes
          : [...state.hero.unlockedHeroes, heroId],
      },
    })),
  
  loadHeroes: (heroes) =>
    set((state) => ({
      hero: { ...state.hero, availableHeroes: heroes },
    })),
  
  // Selectors
  getHeroById: (heroId) => {
    const state = get();
    return state.hero.availableHeroes.find((h) => h.id === heroId);
  },
  
  getUnlockedHeroes: () => {
    const state = get();
    return state.hero.availableHeroes.filter((h) =>
      state.hero.unlockedHeroes.includes(h.id)
    );
  },
  
  isHeroUnlocked: (heroId) => {
    const state = get();
    return state.hero.unlockedHeroes.includes(heroId);
  },
});
