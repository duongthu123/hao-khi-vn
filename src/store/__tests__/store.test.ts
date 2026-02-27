/**
 * Integration tests for the main Zustand store
 * Verifies all slices are properly integrated
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../index';

describe('GameStore Integration', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('should have all slices integrated', () => {
    const state = useGameStore.getState();

    // Verify all slices are present
    expect(state.game).toBeDefined();
    expect(state.hero).toBeDefined();
    expect(state.combat).toBeDefined();
    expect(state.resources).toBeDefined();
    expect(state.collection).toBeDefined();
    expect(state.profile).toBeDefined();
    expect(state.ui).toBeDefined();
  });

  it('should have game slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.game).toHaveProperty('phase');
    expect(state.game).toHaveProperty('difficulty');
    expect(state.game).toHaveProperty('currentLevel');
    expect(state.game).toHaveProperty('isPaused');
    expect(state.game).toHaveProperty('elapsedTime');
  });

  it('should have hero slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.hero).toHaveProperty('selectedHero');
    expect(state.hero).toHaveProperty('availableHeroes');
    expect(state.hero).toHaveProperty('unlockedHeroes');
  });

  it('should have combat slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.combat).toHaveProperty('units');
    expect(state.combat).toHaveProperty('buildings');
    expect(state.combat).toHaveProperty('activeEffects');
    expect(state.combat).toHaveProperty('combatLog');
  });

  it('should have resource slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.resources).toHaveProperty('food');
    expect(state.resources).toHaveProperty('gold');
    expect(state.resources).toHaveProperty('army');
    expect(state.resources).toHaveProperty('caps');
    expect(state.resources).toHaveProperty('generation');
  });

  it('should have collection slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.collection).toHaveProperty('heroes');
    expect(state.collection).toHaveProperty('items');
    expect(state.collection).toHaveProperty('completionPercentage');
  });

  it('should have profile slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.profile).toHaveProperty('playerName');
    expect(state.profile).toHaveProperty('rank');
    expect(state.profile).toHaveProperty('level');
    expect(state.profile).toHaveProperty('experience');
    expect(state.profile).toHaveProperty('wins');
    expect(state.profile).toHaveProperty('losses');
    expect(state.profile).toHaveProperty('achievements');
    expect(state.profile).toHaveProperty('statistics');
  });

  it('should have ui slice with correct structure', () => {
    const state = useGameStore.getState();

    expect(state.ui).toHaveProperty('activeModal');
    expect(state.ui).toHaveProperty('notifications');
    expect(state.ui).toHaveProperty('mapZoom');
    expect(state.ui).toHaveProperty('mapPosition');
  });

  it('should have all action methods available', () => {
    const state = useGameStore.getState();

    // Game actions
    expect(typeof state.setPhase).toBe('function');
    expect(typeof state.setDifficulty).toBe('function');
    expect(typeof state.pauseGame).toBe('function');
    expect(typeof state.resumeGame).toBe('function');

    // Hero actions
    expect(typeof state.selectHero).toBe('function');
    expect(typeof state.unlockHero).toBe('function');

    // Combat actions
    expect(typeof state.addUnit).toBe('function');
    expect(typeof state.removeUnit).toBe('function');
    expect(typeof state.updateUnit).toBe('function');

    // Resource actions
    expect(typeof state.addResource).toBe('function');
    expect(typeof state.subtractResource).toBe('function');
    expect(typeof state.canAfford).toBe('function');

    // Collection actions
    expect(typeof state.addHeroToCollection).toBe('function');
    expect(typeof state.addItemToCollection).toBe('function');

    // Profile actions
    expect(typeof state.updateProfile).toBe('function');
    expect(typeof state.addAchievement).toBe('function');

    // UI actions
    expect(typeof state.openModal).toBe('function');
    expect(typeof state.closeModal).toBe('function');
    expect(typeof state.addNotification).toBe('function');
  });
});
