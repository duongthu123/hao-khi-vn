/**
 * Resource state slice
 * Manages food, gold, army resources with caps and generation rates
 */

import { StateCreator } from 'zustand';
import { Resources, ResourceCaps, ResourceGeneration, ResourceType } from '@/types/resource';

export interface ResourceSlice {
  resources: Resources & {
    peasants: number;
    caps: ResourceCaps;
    generation: ResourceGeneration;
  };
  
  // Actions
  addResource: (resource: ResourceType, amount: number) => boolean;
  subtractResource: (resource: ResourceType, amount: number) => boolean;
  setResource: (resource: ResourceType, amount: number) => void;
  setGeneration: (generation: Partial<ResourceGeneration>) => void;
  updateCaps: (caps: Partial<ResourceCaps>) => void;
  addPeasants: (amount: number) => void;
  resetResources: () => void;
  
  // Validation
  hasResources: (cost: Partial<Resources>) => boolean;
  canAfford: (cost: Partial<Resources>) => { valid: boolean; missing?: Partial<Resources> };
  
  // Selectors
  getResource: (resource: ResourceType) => number;
  getResourceCap: (resource: ResourceType) => number;
  getGenerationRate: (resource: ResourceType) => number;
  isResourceAtCap: (resource: ResourceType) => boolean;
}

const initialResourceState = {
  food: 100,
  gold: 100,
  army: 0,
  peasants: 0,
  caps: {
    food: 1000,
    gold: 1000,
    army: 100,
  },
  generation: {
    foodPerSecond: 1,
    goldPerSecond: 0.5,
    armyPerSecond: 0,
  },
};

export const createResourceSlice: StateCreator<ResourceSlice> = (set, get) => ({
  resources: initialResourceState,
  
  addResource: (resource, amount) => {
    const state = get();
    const currentAmount = state.resources[resource];
    const cap = state.resources.caps[resource];
    const newAmount = Math.min(currentAmount + amount, cap);
    
    set((state) => ({
      resources: {
        ...state.resources,
        [resource]: newAmount,
      },
    }));
    
    return newAmount > currentAmount;
  },
  
  subtractResource: (resource, amount) => {
    const state = get();
    const currentAmount = state.resources[resource];
    
    if (currentAmount < amount) {
      return false;
    }
    
    set((state) => ({
      resources: {
        ...state.resources,
        [resource]: currentAmount - amount,
      },
    }));
    
    return true;
  },
  
  setResource: (resource, amount) => {
    const state = get();
    const cap = state.resources.caps[resource];
    const clampedAmount = Math.max(0, Math.min(amount, cap));
    
    set((state) => ({
      resources: {
        ...state.resources,
        [resource]: clampedAmount,
      },
    }));
  },
  
  setGeneration: (generation) =>
    set((state) => ({
      resources: {
        ...state.resources,
        generation: {
          ...state.resources.generation,
          ...generation,
        },
      },
    })),
  
  updateCaps: (caps) =>
    set((state) => ({
      resources: {
        ...state.resources,
        caps: {
          ...state.resources.caps,
          ...caps,
        },
      },
    })),
  
  addPeasants: (amount) =>
    set((state) => ({
      resources: {
        ...state.resources,
        peasants: state.resources.peasants + amount,
      },
    })),
  
  resetResources: () =>
    set(() => ({
      resources: initialResourceState,
    })),
  
  // Validation
  hasResources: (cost) => {
    const state = get();
    return Object.entries(cost).every(([resource, amount]) => {
      const key = resource as ResourceType;
      return state.resources[key] >= (amount || 0);
    });
  },
  
  canAfford: (cost) => {
    const state = get();
    const missing: Partial<Resources> = {};
    let valid = true;
    
    Object.entries(cost).forEach(([resource, amount]) => {
      const key = resource as ResourceType;
      const current = state.resources[key];
      const required = amount || 0;
      
      if (current < required) {
        valid = false;
        missing[key] = required - current;
      }
    });
    
    return valid ? { valid: true } : { valid: false, missing };
  },
  
  // Selectors
  getResource: (resource) => {
    const state = get();
    return state.resources[resource];
  },
  
  getResourceCap: (resource) => {
    const state = get();
    return state.resources.caps[resource];
  },
  
  getGenerationRate: (resource) => {
    const state = get();
    const rateKey = `${resource}PerSecond` as keyof ResourceGeneration;
    return state.resources.generation[rateKey];
  },
  
  isResourceAtCap: (resource) => {
    const state = get();
    return state.resources[resource] >= state.resources.caps[resource];
  },
});
