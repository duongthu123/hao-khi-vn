/**
 * Local storage save system tests
 * Tests save/load operations, metadata management, and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveToSlot,
  loadFromSlot,
  getSaveMetadata,
  deleteSave,
  isSlotEmpty,
  getAllSaveMetadata,
  getUsedSlotCount,
  findEmptySlot,
  getStorageUsage,
  clearAllSaves,
  isLocalStorageAvailable,
  SAVE_SLOT_COUNT,
  MIN_SLOT,
  MAX_SLOT,
  SaveSlotError
} from '../local';
import type { GameState } from '@/schemas/save.schema';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

// Replace global localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Helper function to create mock game state
function createMockGameState(overrides?: Partial<GameState>): GameState {
  return {
    version: '1.0.0',
    metadata: {
      slot: 0,
      timestamp: Date.now(),
      playerName: 'Test Player',
      progress: 50,
      level: 5,
      playTime: 3600
    },
    game: {
      phase: 'playing',
      difficulty: 'normal',
      currentLevel: 5,
      elapsedTime: 1800
    },
    hero: {
      selectedHero: 'tran-hung-dao',
      unlockedHeroes: ['tran-hung-dao', 'le-loi']
    },
    combat: {
      units: ['unit-1', 'unit-2'],
      buildings: ['building-1'],
      activeEffects: []
    },
    resources: {
      food: 1000,
      gold: 500,
      army: 50,
      foodCap: 2000,
      goldCap: 1000,
      armyCap: 100,
      generation: {
        foodPerSecond: 10,
        goldPerSecond: 5,
        armyPerSecond: 0
      }
    },
    collection: {
      heroes: ['tran-hung-dao', 'le-loi'],
      items: ['item-1'],
      completionPercentage: 25
    },
    profile: {
      name: 'Test Player',
      rank: 'Captain',
      level: 5,
      experience: 500,
      wins: 10,
      losses: 5,
      achievements: ['achievement-1'],
      statistics: {
        totalPlayTime: 3600,
        unitsDefeated: 100,
        resourcesGathered: 5000,
        quizzesCompleted: 10
      }
    },
    research: {
      completed: ['research-1'],
      inProgress: 'research-2',
      progress: 50,
      available: ['research-3', 'research-4']
    },
    quiz: {
      questionsAnswered: 20,
      correctAnswers: 15,
      completedCategories: ['history'],
      rewards: ['reward-1']
    },
    ...overrides
  };
}

describe('Local Storage Save System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  describe('saveToSlot', () => {
    it('should save game state to a valid slot', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      // Verify save data exists
      const saveKey = 'game-save-slot-0';
      const savedData = localStorage.getItem(saveKey);
      expect(savedData).not.toBeNull();

      // Verify metadata exists
      const metadataKey = 'game-save-metadata-0';
      const metadataData = localStorage.getItem(metadataKey);
      expect(metadataData).not.toBeNull();
    });

    it('should save to all valid slots (0-4)', async () => {
      const state = createMockGameState();

      for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
        await saveToSlot(slot, state);
        expect(isSlotEmpty(slot)).toBe(false);
      }
    });

    it('should update metadata with correct slot number', async () => {
      const state = createMockGameState();
      await saveToSlot(2, state);

      const metadata = getSaveMetadata(2);
      expect(metadata).not.toBeNull();
      expect(metadata!.slot).toBe(2);
    });

    it('should update timestamp on save', async () => {
      const state = createMockGameState();
      const beforeSave = Date.now();

      await saveToSlot(0, state);

      const metadata = getSaveMetadata(0);
      expect(metadata).not.toBeNull();
      expect(metadata!.timestamp).toBeGreaterThanOrEqual(beforeSave);
    });

    it('should throw SaveSlotError for invalid slot numbers', async () => {
      const state = createMockGameState();

      await expect(saveToSlot(-1, state)).rejects.toThrow(SaveSlotError);
      await expect(saveToSlot(5, state)).rejects.toThrow(SaveSlotError);
      await expect(saveToSlot(10, state)).rejects.toThrow(SaveSlotError);
      await expect(saveToSlot(1.5, state)).rejects.toThrow(SaveSlotError);
    });

    it('should overwrite existing save in slot', async () => {
      const state1 = createMockGameState({ metadata: { ...createMockGameState().metadata, playerName: 'Player 1' } });
      const state2 = createMockGameState({ metadata: { ...createMockGameState().metadata, playerName: 'Player 2' } });

      await saveToSlot(0, state1);
      await saveToSlot(0, state2);

      const metadata = getSaveMetadata(0);
      expect(metadata!.playerName).toBe('Player 2');
    });

    it('should compress save data', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      const saveKey = 'game-save-slot-0';
      const savedData = localStorage.getItem(saveKey);
      const serialized = JSON.parse(savedData!);

      expect(serialized.compressed).toBe(true);
    });
  });

  describe('loadFromSlot', () => {
    it('should load game state from a valid slot', async () => {
      const originalState = createMockGameState();
      await saveToSlot(0, originalState);

      const loadedState = await loadFromSlot(0);

      expect(loadedState).toBeDefined();
      expect(loadedState.profile.name).toBe(originalState.profile.name);
      expect(loadedState.resources.food).toBe(originalState.resources.food);
    });

    it('should load from all valid slots', async () => {
      const state = createMockGameState();

      for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
        await saveToSlot(slot, state);
        const loaded = await loadFromSlot(slot);
        expect(loaded).toBeDefined();
      }
    });

    it('should throw SaveSlotError for invalid slot numbers', async () => {
      await expect(loadFromSlot(-1)).rejects.toThrow(SaveSlotError);
      await expect(loadFromSlot(5)).rejects.toThrow(SaveSlotError);
      await expect(loadFromSlot(10)).rejects.toThrow(SaveSlotError);
    });

    it('should throw SaveSlotError for empty slot', async () => {
      await expect(loadFromSlot(0)).rejects.toThrow(SaveSlotError);
      await expect(loadFromSlot(0)).rejects.toThrow('empty');
    });

    it('should restore complete game state', async () => {
      const originalState = createMockGameState();
      await saveToSlot(0, originalState);

      const loadedState = await loadFromSlot(0);

      // Verify all major sections
      expect(loadedState.game).toBeDefined();
      expect(loadedState.hero).toBeDefined();
      expect(loadedState.combat).toBeDefined();
      expect(loadedState.resources).toBeDefined();
      expect(loadedState.collection).toBeDefined();
      expect(loadedState.profile).toBeDefined();
      expect(loadedState.research).toBeDefined();
      expect(loadedState.quiz).toBeDefined();
    });

    it('should validate loaded data', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      // Corrupt the save data
      const saveKey = 'game-save-slot-0';
      localStorage.setItem(saveKey, '{"invalid": "data"}');

      await expect(loadFromSlot(0)).rejects.toThrow();
    });
  });

  describe('getSaveMetadata', () => {
    it('should return metadata for saved slot', () => {
      const state = createMockGameState();
      saveToSlot(0, state);

      const metadata = getSaveMetadata(0);

      expect(metadata).not.toBeNull();
      expect(metadata!.playerName).toBe('Test Player');
      expect(metadata!.level).toBe(5);
      expect(metadata!.progress).toBe(50);
    });

    it('should return null for empty slot', () => {
      const metadata = getSaveMetadata(0);
      expect(metadata).toBeNull();
    });

    it('should throw SaveSlotError for invalid slot numbers', () => {
      expect(() => getSaveMetadata(-1)).toThrow(SaveSlotError);
      expect(() => getSaveMetadata(5)).toThrow(SaveSlotError);
    });

    it('should include timestamp and resources', () => {
      const state = createMockGameState();
      saveToSlot(0, state);

      const metadata = getSaveMetadata(0);

      expect(metadata).not.toBeNull();
      expect(metadata!.timestamp).toBeGreaterThan(0);
      expect(metadata!.playTime).toBe(3600);
    });

    it('should return null for corrupted metadata', () => {
      const metadataKey = 'game-save-metadata-0';
      localStorage.setItem(metadataKey, 'invalid json');

      const metadata = getSaveMetadata(0);
      expect(metadata).toBeNull();
    });
  });

  describe('deleteSave', () => {
    it('should delete save from slot', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      expect(isSlotEmpty(0)).toBe(false);

      await deleteSave(0);

      expect(isSlotEmpty(0)).toBe(true);
    });

    it('should delete both save data and metadata', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      await deleteSave(0);

      const saveKey = 'game-save-slot-0';
      const metadataKey = 'game-save-metadata-0';

      expect(localStorage.getItem(saveKey)).toBeNull();
      expect(localStorage.getItem(metadataKey)).toBeNull();
    });

    it('should throw SaveSlotError for invalid slot numbers', async () => {
      await expect(deleteSave(-1)).rejects.toThrow(SaveSlotError);
      await expect(deleteSave(5)).rejects.toThrow(SaveSlotError);
    });

    it('should not throw error when deleting empty slot', async () => {
      await expect(deleteSave(0)).resolves.not.toThrow();
    });
  });

  describe('isSlotEmpty', () => {
    it('should return true for empty slot', () => {
      expect(isSlotEmpty(0)).toBe(true);
    });

    it('should return false for occupied slot', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      expect(isSlotEmpty(0)).toBe(false);
    });

    it('should throw SaveSlotError for invalid slot numbers', () => {
      expect(() => isSlotEmpty(-1)).toThrow(SaveSlotError);
      expect(() => isSlotEmpty(5)).toThrow(SaveSlotError);
    });
  });

  describe('getAllSaveMetadata', () => {
    it('should return array of 5 elements', () => {
      const allMetadata = getAllSaveMetadata();
      expect(allMetadata).toHaveLength(SAVE_SLOT_COUNT);
    });

    it('should return null for empty slots', () => {
      const allMetadata = getAllSaveMetadata();
      expect(allMetadata.every(m => m === null)).toBe(true);
    });

    it('should return metadata for occupied slots', async () => {
      const state1 = createMockGameState({ metadata: { ...createMockGameState().metadata, playerName: 'Player 1' } });
      const state2 = createMockGameState({ metadata: { ...createMockGameState().metadata, playerName: 'Player 2' } });

      await saveToSlot(0, state1);
      await saveToSlot(2, state2);

      const allMetadata = getAllSaveMetadata();

      expect(allMetadata[0]).not.toBeNull();
      expect(allMetadata[0]!.playerName).toBe('Player 1');
      expect(allMetadata[1]).toBeNull();
      expect(allMetadata[2]).not.toBeNull();
      expect(allMetadata[2]!.playerName).toBe('Player 2');
      expect(allMetadata[3]).toBeNull();
      expect(allMetadata[4]).toBeNull();
    });
  });

  describe('getUsedSlotCount', () => {
    it('should return 0 when no slots are used', () => {
      expect(getUsedSlotCount()).toBe(0);
    });

    it('should return correct count of used slots', async () => {
      const state = createMockGameState();

      await saveToSlot(0, state);
      expect(getUsedSlotCount()).toBe(1);

      await saveToSlot(2, state);
      expect(getUsedSlotCount()).toBe(2);

      await saveToSlot(4, state);
      expect(getUsedSlotCount()).toBe(3);
    });

    it('should return 5 when all slots are used', async () => {
      const state = createMockGameState();

      for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
        await saveToSlot(slot, state);
      }

      expect(getUsedSlotCount()).toBe(SAVE_SLOT_COUNT);
    });
  });

  describe('findEmptySlot', () => {
    it('should return first slot when all are empty', () => {
      expect(findEmptySlot()).toBe(0);
    });

    it('should return first empty slot', async () => {
      const state = createMockGameState();

      await saveToSlot(0, state);
      expect(findEmptySlot()).toBe(1);

      await saveToSlot(1, state);
      expect(findEmptySlot()).toBe(2);

      await saveToSlot(2, state);
      expect(findEmptySlot()).toBe(3);
    });

    it('should return null when all slots are full', async () => {
      const state = createMockGameState();

      for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
        await saveToSlot(slot, state);
      }

      expect(findEmptySlot()).toBeNull();
    });
  });

  describe('getStorageUsage', () => {
    it('should return 0 when no saves exist', () => {
      expect(getStorageUsage()).toBe(0);
    });

    it('should return positive value when saves exist', async () => {
      const state = createMockGameState();
      await saveToSlot(0, state);

      const usage = getStorageUsage();
      expect(usage).toBeGreaterThan(0);
    });

    it('should increase with more saves', async () => {
      const state = createMockGameState();

      await saveToSlot(0, state);
      const usage1 = getStorageUsage();

      await saveToSlot(1, state);
      const usage2 = getStorageUsage();

      expect(usage2).toBeGreaterThan(usage1);
    });
  });

  describe('clearAllSaves', () => {
    it('should clear all saves', async () => {
      const state = createMockGameState();

      // Create saves in all slots
      for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
        await saveToSlot(slot, state);
      }

      expect(getUsedSlotCount()).toBe(SAVE_SLOT_COUNT);

      const clearedCount = await clearAllSaves();

      expect(clearedCount).toBe(SAVE_SLOT_COUNT);
      expect(getUsedSlotCount()).toBe(0);
    });

    it('should return 0 when no saves exist', async () => {
      const clearedCount = await clearAllSaves();
      expect(clearedCount).toBe(0);
    });

    it('should return correct count of cleared saves', async () => {
      const state = createMockGameState();

      await saveToSlot(0, state);
      await saveToSlot(2, state);

      const clearedCount = await clearAllSaves();
      expect(clearedCount).toBe(2);
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage not available');
      };

      expect(isLocalStorageAvailable()).toBe(false);

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Save/Load Round Trip', () => {
    it('should preserve all data through save/load cycle', async () => {
      const originalState = createMockGameState();

      await saveToSlot(0, originalState);
      const loadedState = await loadFromSlot(0);

      // Deep comparison of key fields
      expect(loadedState.profile.name).toBe(originalState.profile.name);
      expect(loadedState.profile.wins).toBe(originalState.profile.wins);
      expect(loadedState.resources.food).toBe(originalState.resources.food);
      expect(loadedState.resources.gold).toBe(originalState.resources.gold);
      expect(loadedState.hero.selectedHero).toBe(originalState.hero.selectedHero);
      expect(loadedState.hero.unlockedHeroes).toEqual(originalState.hero.unlockedHeroes);
      expect(loadedState.research.completed).toEqual(originalState.research.completed);
      expect(loadedState.collection.heroes).toEqual(originalState.collection.heroes);
    });

    it('should handle multiple save/load cycles', async () => {
      let state = createMockGameState();

      for (let i = 0; i < 5; i++) {
        await saveToSlot(0, state);
        state = await loadFromSlot(0);

        // Modify state
        state.resources.food += 100;
        state.profile.wins += 1;
      }

      expect(state.resources.food).toBe(1500); // 1000 + 5*100
      expect(state.profile.wins).toBe(15); // 10 + 5
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays in game state', async () => {
      const state = createMockGameState({
        combat: {
          units: [],
          buildings: [],
          activeEffects: []
        },
        collection: {
          heroes: [],
          items: [],
          completionPercentage: 0
        }
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.combat.units).toEqual([]);
      expect(loaded.collection.heroes).toEqual([]);
    });

    it('should handle null values in game state', async () => {
      const state = createMockGameState({
        game: {
          phase: 'menu', // Use menu phase so null hero is valid
          difficulty: 'normal',
          currentLevel: 1,
          elapsedTime: 0
        },
        hero: {
          selectedHero: null,
          unlockedHeroes: []
        },
        research: {
          completed: [],
          inProgress: null,
          progress: 0,
          available: []
        }
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.hero.selectedHero).toBeNull();
      expect(loaded.research.inProgress).toBeNull();
    });

    it('should handle maximum resource values', async () => {
      const state = createMockGameState({
        resources: {
          food: 999999,
          gold: 999999,
          army: 999999,
          foodCap: 1000000,
          goldCap: 1000000,
          armyCap: 1000000,
          generation: {
            foodPerSecond: 1000,
            goldPerSecond: 1000,
            armyPerSecond: 100
          }
        }
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.resources.food).toBe(999999);
      expect(loaded.resources.gold).toBe(999999);
    });
  });
});

  describe('Export/Import Functionality', () => {
    describe('exportSave', () => {
      it('should export save as Blob', async () => {
        const state = createMockGameState();
        await saveToSlot(0, state);

        const { exportSave } = await import('../local');
        const blob = await exportSave(0);

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/json');
        expect(blob.size).toBeGreaterThan(0);
      });

      it('should throw error for invalid slot', async () => {
        const { exportSave } = await import('../local');

        await expect(exportSave(-1)).rejects.toThrow(SaveSlotError);
        await expect(exportSave(5)).rejects.toThrow(SaveSlotError);
        await expect(exportSave(10)).rejects.toThrow(SaveSlotError);
      });

      it('should throw error for empty slot', async () => {
        // Ensure slot is empty
        await deleteSave(0).catch(() => {});
        
        const { exportSave, SaveSlotError } = await import('../local');

        await expect(exportSave(0)).rejects.toThrow(SaveSlotError);
      });

      it('should export valid JSON data', async () => {
        const state = createMockGameState();
        await saveToSlot(0, state);

        const { exportSave } = await import('../local');
        const blob = await exportSave(0);

        // Read blob content
        const text = await blob.text();
        const parsed = JSON.parse(text);

        expect(parsed).toHaveProperty('version');
        expect(parsed).toHaveProperty('data');
        expect(parsed).toHaveProperty('checksum');
        expect(parsed).toHaveProperty('metadata');
      });
    });

    describe('generateExportFilename', () => {
      it('should generate filename with player name and timestamp', async () => {
        const { generateExportFilename } = await import('../local');
        const metadata = {
          slot: 0 as const,
          timestamp: new Date('2024-01-15T10:30:00').getTime(),
          playerName: 'Test Player',
          progress: 50,
          resources: { food: 1000, gold: 500, army: 50 },
          level: 5,
          playTime: 3600,
          version: '1.0.0'
        };

        const filename = generateExportFilename(metadata);

        expect(filename).toContain('game-save');
        expect(filename).toContain('Test-Player');
        expect(filename).toContain('2024-01-15');
        expect(filename).toMatch(/\.json$/);
      });

      it('should sanitize player name in filename', async () => {
        const { generateExportFilename } = await import('../local');
        const metadata = {
          slot: 0 as const,
          timestamp: Date.now(),
          playerName: 'Player@#$%Name!!!',
          progress: 50,
          resources: { food: 1000, gold: 500, army: 50 },
          level: 5,
          playTime: 3600,
          version: '1.0.0'
        };

        const filename = generateExportFilename(metadata);

        expect(filename).not.toContain('@');
        expect(filename).not.toContain('#');
        expect(filename).not.toContain('!');
        expect(filename).toMatch(/^game-save-[a-zA-Z0-9-]+-\d{4}-\d{2}-\d{2}-\d{6}\.json$/);
      });

      it('should truncate long player names', async () => {
        const { generateExportFilename } = await import('../local');
        const metadata = {
          slot: 0 as const,
          timestamp: Date.now(),
          playerName: 'A'.repeat(50),
          progress: 50,
          resources: { food: 1000, gold: 500, army: 50 },
          level: 5,
          playTime: 3600,
          version: '1.0.0'
        };

        const filename = generateExportFilename(metadata);
        const namepart = filename.split('-')[2]; // Extract name part

        expect(namepart.length).toBeLessThanOrEqual(20);
      });
    });

    describe('importSave', () => {
      it('should import valid save file', async () => {
        // Create and export a save
        const originalState = createMockGameState();
        await saveToSlot(0, originalState);

        const { exportSave, importSave } = await import('../local');
        const blob = await exportSave(0);

        // Create File from Blob
        const file = new File([blob], 'test-save.json', { type: 'application/json' });

        // Import the file
        const importedState = await importSave(file, 1);

        expect(importedState.profile.name).toBe(originalState.profile.name);
        expect(importedState.resources.food).toBe(originalState.resources.food);
      });

      it('should throw error for invalid slot', async () => {
        const { importSave } = await import('../local');
        const file = new File(['{}'], 'test.json', { type: 'application/json' });

        await expect(importSave(file, -1)).rejects.toThrow(SaveSlotError);
        await expect(importSave(file, 5)).rejects.toThrow(SaveSlotError);
      });

      it('should throw error for empty file', async () => {
        const { importSave } = await import('../local');
        const file = new File([''], 'test.json', { type: 'application/json' });

        await expect(importSave(file, 0)).rejects.toThrow();
      });

      it('should throw error for invalid JSON', async () => {
        const { importSave } = await import('../local');
        const file = new File(['not valid json'], 'test.json', { type: 'application/json' });

        await expect(importSave(file, 0)).rejects.toThrow();
      });

      it('should throw error for corrupted save data', async () => {
        const { importSave } = await import('../local');
        const invalidData = JSON.stringify({
          version: '1.0.0',
          data: 'corrupted',
          checksum: 'invalid'
        });
        const file = new File([invalidData], 'test.json', { type: 'application/json' });

        await expect(importSave(file, 0)).rejects.toThrow();
      });
    });

    describe('importAndSaveToSlot', () => {
      it('should import and save to empty slot', async () => {
        // Create and export a save
        const originalState = createMockGameState();
        await saveToSlot(0, originalState);

        const { exportSave, importAndSaveToSlot } = await import('../local');
        const blob = await exportSave(0);
        const file = new File([blob], 'test-save.json', { type: 'application/json' });

        // Import to empty slot
        const importedState = await importAndSaveToSlot(file, 1, false);

        expect(importedState.profile.name).toBe(originalState.profile.name);

        // Verify it was saved
        const loaded = await loadFromSlot(1);
        expect(loaded.profile.name).toBe(originalState.profile.name);
      });

      it('should throw error when overwriting without confirmation', async () => {
        // Create saves in both slots
        const state1 = createMockGameState();
        const state2 = createMockGameState({ profile: { ...state1.profile, name: 'Player 2' } });

        await saveToSlot(0, state1);
        await saveToSlot(1, state2);

        const { exportSave, importAndSaveToSlot } = await import('../local');
        const blob = await exportSave(0);
        const file = new File([blob], 'test-save.json', { type: 'application/json' });

        // Try to import to occupied slot without overwrite flag
        await expect(importAndSaveToSlot(file, 1, false)).rejects.toThrow(SaveSlotError);
      });

      it('should overwrite when confirmation is provided', async () => {
        // Create saves in both slots
        const state1 = createMockGameState();
        const state2 = createMockGameState({ profile: { ...state1.profile, name: 'Player 2' } });

        await saveToSlot(0, state1);
        await saveToSlot(1, state2);

        const { exportSave, importAndSaveToSlot } = await import('../local');
        const blob = await exportSave(0);
        const file = new File([blob], 'test-save.json', { type: 'application/json' });

        // Import with overwrite flag
        await importAndSaveToSlot(file, 1, true);

        // Verify slot 1 now has state1 data
        const loaded = await loadFromSlot(1);
        expect(loaded.profile.name).toBe(state1.profile.name);
      });
    });

    describe('Export/Import Round Trip', () => {
      it('should preserve all data through export/import cycle', async () => {
        const originalState = createMockGameState();
        await saveToSlot(0, originalState);

        const { exportSave, importAndSaveToSlot } = await import('../local');

        // Export
        const blob = await exportSave(0);
        const file = new File([blob], 'test-save.json', { type: 'application/json' });

        // Clear slot 1 to ensure it's empty
        await deleteSave(1).catch(() => {});

        // Import to different slot
        await importAndSaveToSlot(file, 1, false);

        // Load and compare
        const loadedState = await loadFromSlot(1);

        expect(loadedState.profile.name).toBe(originalState.profile.name);
        expect(loadedState.profile.wins).toBe(originalState.profile.wins);
        expect(loadedState.resources.food).toBe(originalState.resources.food);
        expect(loadedState.hero.selectedHero).toBe(originalState.hero.selectedHero);
        expect(loadedState.collection.heroes).toEqual(originalState.collection.heroes);
      });

      it('should handle multiple export/import cycles', async () => {
        let state = createMockGameState();
        await saveToSlot(0, state);

        const { exportSave, importAndSaveToSlot } = await import('../local');

        for (let i = 1; i <= 3; i++) {
          // Export from previous slot
          const blob = await exportSave(i - 1);
          const file = new File([blob], `save-${i}.json`, { type: 'application/json' });

          // Clear target slot to ensure it's empty
          await deleteSave(i).catch(() => {});

          // Import to next slot
          state = await importAndSaveToSlot(file, i, false);

          // Modify state
          state.resources.food += 100;
          
          // Save modified state back
          await saveToSlot(i, state);
        }

        // Verify final state
        const finalState = await loadFromSlot(3);
        expect(finalState.resources.food).toBe(1300); // 1000 + 3*100
      });
    });
  });
