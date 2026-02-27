/**
 * Unit tests for resource state slice
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createResourceSlice, ResourceSlice } from '../resourceSlice';
import { ResourceType } from '@/types/resource';

describe('resourceSlice', () => {
  let store: ReturnType<typeof create<ResourceSlice>>;

  beforeEach(() => {
    store = create<ResourceSlice>()(createResourceSlice);
  });

  describe('initial state', () => {
    it('should have correct initial resource values', () => {
      const state = store.getState();
      expect(state.resources.food).toBe(100);
      expect(state.resources.gold).toBe(100);
      expect(state.resources.army).toBe(0);
    });

    it('should have correct initial caps', () => {
      const state = store.getState();
      expect(state.resources.caps.food).toBe(1000);
      expect(state.resources.caps.gold).toBe(1000);
      expect(state.resources.caps.army).toBe(100);
    });

    it('should have correct initial generation rates', () => {
      const state = store.getState();
      expect(state.resources.generation.foodPerSecond).toBe(1);
      expect(state.resources.generation.goldPerSecond).toBe(0.5);
      expect(state.resources.generation.armyPerSecond).toBe(0);
    });
  });

  describe('addResource', () => {
    it('should add resources correctly', () => {
      const result = store.getState().addResource(ResourceType.FOOD, 50);
      expect(result).toBe(true);
      expect(store.getState().resources.food).toBe(150);
    });

    it('should respect resource caps', () => {
      store.getState().addResource(ResourceType.FOOD, 1000);
      expect(store.getState().resources.food).toBe(1000); // Capped at 1000
    });

    it('should return false when at cap', () => {
      store.getState().addResource(ResourceType.FOOD, 1000);
      const result = store.getState().addResource(ResourceType.FOOD, 10);
      expect(result).toBe(false);
      expect(store.getState().resources.food).toBe(1000);
    });

    it('should handle partial additions when near cap', () => {
      store.getState().setResource(ResourceType.GOLD, 950);
      const result = store.getState().addResource(ResourceType.GOLD, 100);
      expect(result).toBe(true);
      expect(store.getState().resources.gold).toBe(1000); // Capped
    });
  });

  describe('subtractResource', () => {
    it('should subtract resources correctly', () => {
      const result = store.getState().subtractResource(ResourceType.FOOD, 50);
      expect(result).toBe(true);
      expect(store.getState().resources.food).toBe(50);
    });

    it('should return false when insufficient resources', () => {
      const result = store.getState().subtractResource(ResourceType.FOOD, 200);
      expect(result).toBe(false);
      expect(store.getState().resources.food).toBe(100); // Unchanged
    });

    it('should handle exact amount subtraction', () => {
      const result = store.getState().subtractResource(ResourceType.FOOD, 100);
      expect(result).toBe(true);
      expect(store.getState().resources.food).toBe(0);
    });

    it('should not allow negative resources', () => {
      store.getState().setResource(ResourceType.ARMY, 10);
      const result = store.getState().subtractResource(ResourceType.ARMY, 20);
      expect(result).toBe(false);
      expect(store.getState().resources.army).toBe(10);
    });
  });

  describe('setResource', () => {
    it('should set resource to specific value', () => {
      store.getState().setResource(ResourceType.GOLD, 500);
      expect(store.getState().resources.gold).toBe(500);
    });

    it('should clamp to cap', () => {
      store.getState().setResource(ResourceType.FOOD, 2000);
      expect(store.getState().resources.food).toBe(1000);
    });

    it('should clamp to zero', () => {
      store.getState().setResource(ResourceType.GOLD, -100);
      expect(store.getState().resources.gold).toBe(0);
    });
  });

  describe('resource validation', () => {
    beforeEach(() => {
      store.getState().setResource(ResourceType.FOOD, 100);
      store.getState().setResource(ResourceType.GOLD, 50);
      store.getState().setResource(ResourceType.ARMY, 10);
    });

    it('should validate sufficient resources', () => {
      const result = store.getState().hasResources({
        food: 50,
        gold: 25,
      });
      expect(result).toBe(true);
    });

    it('should detect insufficient resources', () => {
      const result = store.getState().hasResources({
        food: 150,
        gold: 25,
      });
      expect(result).toBe(false);
    });

    it('should handle empty cost', () => {
      const result = store.getState().hasResources({});
      expect(result).toBe(true);
    });

    describe('canAfford', () => {
      it('should return valid when can afford', () => {
        const result = store.getState().canAfford({
          food: 50,
          gold: 25,
        });
        expect(result.valid).toBe(true);
        expect(result.missing).toBeUndefined();
      });

      it('should return missing resources when cannot afford', () => {
        const result = store.getState().canAfford({
          food: 150,
          gold: 75,
          army: 20,
        });
        expect(result.valid).toBe(false);
        expect(result.missing).toEqual({
          food: 50,
          gold: 25,
          army: 10,
        });
      });

      it('should handle partial missing resources', () => {
        const result = store.getState().canAfford({
          food: 50,
          gold: 100,
        });
        expect(result.valid).toBe(false);
        expect(result.missing).toEqual({
          gold: 50,
        });
      });
    });
  });

  describe('generation and caps', () => {
    it('should update generation rates', () => {
      store.getState().setGeneration({
        foodPerSecond: 2,
        goldPerSecond: 1.5,
      });
      expect(store.getState().resources.generation.foodPerSecond).toBe(2);
      expect(store.getState().resources.generation.goldPerSecond).toBe(1.5);
      expect(store.getState().resources.generation.armyPerSecond).toBe(0); // Unchanged
    });

    it('should update resource caps', () => {
      store.getState().updateCaps({
        food: 2000,
        gold: 1500,
      });
      expect(store.getState().resources.caps.food).toBe(2000);
      expect(store.getState().resources.caps.gold).toBe(1500);
      expect(store.getState().resources.caps.army).toBe(100); // Unchanged
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      store.getState().setResource(ResourceType.FOOD, 500);
      store.getState().updateCaps({ food: 1000 });
      store.getState().setGeneration({ foodPerSecond: 2 });
    });

    it('should get resource value', () => {
      expect(store.getState().getResource(ResourceType.FOOD)).toBe(500);
    });

    it('should get resource cap', () => {
      expect(store.getState().getResourceCap(ResourceType.FOOD)).toBe(1000);
    });

    it('should get generation rate', () => {
      expect(store.getState().getGenerationRate(ResourceType.FOOD)).toBe(2);
    });

    it('should check if resource is at cap', () => {
      expect(store.getState().isResourceAtCap(ResourceType.FOOD)).toBe(false);
      store.getState().setResource(ResourceType.FOOD, 1000);
      expect(store.getState().isResourceAtCap(ResourceType.FOOD)).toBe(true);
    });
  });

  describe('resetResources', () => {
    it('should reset all resources to initial state', () => {
      // Modify state
      store.getState().setResource(ResourceType.FOOD, 500);
      store.getState().setResource(ResourceType.GOLD, 750);
      store.getState().updateCaps({ food: 2000 });
      store.getState().setGeneration({ foodPerSecond: 5 });

      // Reset
      store.getState().resetResources();

      // Verify reset
      const state = store.getState();
      expect(state.resources.food).toBe(100);
      expect(state.resources.gold).toBe(100);
      expect(state.resources.army).toBe(0);
      expect(state.resources.caps.food).toBe(1000);
      expect(state.resources.generation.foodPerSecond).toBe(1);
    });
  });

  describe('immutability', () => {
    it('should not mutate state directly', () => {
      const initialState = store.getState().resources;
      store.getState().addResource(ResourceType.FOOD, 50);
      const newState = store.getState().resources;

      expect(initialState).not.toBe(newState);
      expect(initialState.food).toBe(100);
      expect(newState.food).toBe(150);
    });
  });
});
