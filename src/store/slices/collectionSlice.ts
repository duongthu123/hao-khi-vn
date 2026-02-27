/**
 * Collection state slice
 * Manages hero collection, items, and completion tracking
 */

import { StateCreator } from 'zustand';

export interface CollectedHero {
  id: string;
  acquiredAt: number;
  level: number;
}

export interface CollectedItem {
  id: string;
  acquiredAt: number;
  quantity: number;
}

export interface CollectionSlice {
  collection: {
    heroes: CollectedHero[];
    items: CollectedItem[];
    completionPercentage: number;
  };
  
  // Actions
  addHeroToCollection: (heroId: string) => void;
  addItemToCollection: (itemId: string, quantity?: number) => void;
  updateHeroLevel: (heroId: string, level: number) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateCompletion: (percentage: number) => void;
  calculateCompletion: (totalHeroes: number, totalItems: number) => void;
  
  // Selectors
  hasHero: (heroId: string) => boolean;
  hasItem: (itemId: string) => boolean;
  getHeroLevel: (heroId: string) => number;
  getItemQuantity: (itemId: string) => number;
  getCollectedHeroIds: () => string[];
}

const initialCollectionState = {
  heroes: [],
  items: [],
  completionPercentage: 0,
};

export const createCollectionSlice: StateCreator<CollectionSlice> = (set, get) => ({
  collection: initialCollectionState,
  
  addHeroToCollection: (heroId) =>
    set((state) => {
      const exists = state.collection.heroes.some((h) => h.id === heroId);
      if (exists) return state;
      
      return {
        collection: {
          ...state.collection,
          heroes: [
            ...state.collection.heroes,
            { id: heroId, acquiredAt: Date.now(), level: 1 },
          ],
        },
      };
    }),
  
  addItemToCollection: (itemId, quantity = 1) =>
    set((state) => {
      const existingItem = state.collection.items.find((i) => i.id === itemId);
      
      if (existingItem) {
        return {
          collection: {
            ...state.collection,
            items: state.collection.items.map((i) =>
              i.id === itemId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          },
        };
      }
      
      return {
        collection: {
          ...state.collection,
          items: [
            ...state.collection.items,
            { id: itemId, acquiredAt: Date.now(), quantity },
          ],
        },
      };
    }),
  
  updateHeroLevel: (heroId, level) =>
    set((state) => ({
      collection: {
        ...state.collection,
        heroes: state.collection.heroes.map((h) =>
          h.id === heroId ? { ...h, level } : h
        ),
      },
    })),
  
  updateItemQuantity: (itemId, quantity) =>
    set((state) => ({
      collection: {
        ...state.collection,
        items: state.collection.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      },
    })),
  
  updateCompletion: (percentage) =>
    set((state) => ({
      collection: {
        ...state.collection,
        completionPercentage: Math.max(0, Math.min(100, percentage)),
      },
    })),
  
  calculateCompletion: (totalHeroes, totalItems) => {
    const state = get();
    const collectedHeroes = state.collection.heroes.length;
    const collectedItems = state.collection.items.length;
    const total = totalHeroes + totalItems;
    const collected = collectedHeroes + collectedItems;
    const percentage = total > 0 ? (collected / total) * 100 : 0;
    
    set((state) => ({
      collection: {
        ...state.collection,
        completionPercentage: Math.round(percentage * 100) / 100,
      },
    }));
  },
  
  // Selectors
  hasHero: (heroId) => {
    const state = get();
    return state.collection.heroes.some((h) => h.id === heroId);
  },
  
  hasItem: (itemId) => {
    const state = get();
    return state.collection.items.some((i) => i.id === itemId);
  },
  
  getHeroLevel: (heroId) => {
    const state = get();
    const hero = state.collection.heroes.find((h) => h.id === heroId);
    return hero?.level || 0;
  },
  
  getItemQuantity: (itemId) => {
    const state = get();
    const item = state.collection.items.find((i) => i.id === itemId);
    return item?.quantity || 0;
  },
  
  getCollectedHeroIds: () => {
    const state = get();
    return state.collection.heroes.map((h) => h.id);
  },
});
