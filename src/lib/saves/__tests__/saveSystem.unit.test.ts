/**
 * Comprehensive Save System Unit Tests
 * Tests the complete save system including serialization, validation, localStorage, auto-save, and import/export
 * **Validates: Requirements 27.4**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  serializeGameState,
  deserializeGameState,
  serializeForExport,
  deserializeFromImport,
  CURRENT_SAVE_VERSION,
  SerializationError,
  DeserializationError,
} from '../serialization';
import {
  validateGameState,
  validateSaveMetadata,
  checkGameStateIntegrity,
  sanitizeGameState,
  isDataCorrupted,
} from '../validation';
import {
  saveToSlot,
  loadFromSlot,
  getSaveMetadata,
  deleteSave,
  isSlotEmpty,
  getAllSaveMetadata,
  exportSave,
  importSave,
  importAndSaveToSlot,
  generateExportFilename,
  SaveSlotError,
} from '../local';
import type { GameState, SaveMetadata } from '@/schemas/save.schema';

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
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Helper to create valid game state
function createValidGameState(overrides?: Partial<GameState>): GameState {
  return {
    version: CURRENT_SAVE_VERSION,
    metadata: {
      slot: 0,
      timestamp: Date.now(),
      playerName: 'Test Player',
      progress: 50,
      level: 5,
      playTime: 3600,
    },
    game: {
      phase: 'playing',
      difficulty: 'normal',
      currentLevel: 5,
      elapsedTime: 1800,
    },
    hero: {
      selectedHero: 'tran-hung-dao',
      unlockedHeroes: ['tran-hung-dao', 'le-loi'],
    },
    combat: {
      units: ['unit-1', 'unit-2'],
      buildings: ['building-1'],
      activeEffects: [],
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
        armyPerSecond: 1,
      },
    },
    collection: {
      heroes: ['tran-hung-dao', 'le-loi'],
      items: ['item-1'],
      completionPercentage: 25,
    },
    profile: {
      name: 'Test Player',
      rank: 'Captain',
      level: 5,
      experience: 2500,
      wins: 10,
      losses: 3,
      achievements: ['first-win'],
      statistics: {
        totalPlayTime: 3600,
        unitsDefeated: 150,
        resourcesGathered: 50000,
        quizzesCompleted: 5,
      },
    },
    research: {
      completed: ['archery-1'],
      inProgress: 'fortification-1',
      progress: 60,
      available: ['siege-1'],
    },
    quiz: {
      questionsAnswered: 20,
      correctAnswers: 16,
      completedCategories: ['history'],
      rewards: ['hero-tran-quoc-tuan'],
    },
    ...overrides,
  };
}

describe('Save System - Serialization and Deserialization', () => {
  describe('Basic serialization', () => {
    it('should serialize game state with compression', () => {
      const state = createValidGameState();
      const result = serializeGameState(state, true);

      expect(result).toHaveProperty('version', CURRENT_SAVE_VERSION);
      expect(result).toHaveProperty('compressed', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('checksum');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should serialize game state without compression', () => {
      const state = createValidGameState();
      const result = serializeGameState(state, false);

      expect(result.compressed).toBe(false);
      expect(() => JSON.parse(result.data)).not.toThrow();
    });

    it('should generate consistent checksums', () => {
      const state = createValidGameState();
      const result1 = serializeGameState(state, false);
      const result2 = serializeGameState(state, false);

      expect(result1.checksum).toBe(result2.checksum);
    });
  });

  describe('Deserialization', () => {
    it('should deserialize compressed data', () => {
      const state = createValidGameState();
      const serialized = serializeGameState(state, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.metadata.playerName).toBe(state.metadata.playerName);
      expect(deserialized.resources.food).toBe(state.resources.food);
    });

    it('should validate checksum on deserialization', () => {
      const state = createValidGameState();
      const serialized = serializeGameState(state, false);
      serialized.checksum = 'invalid-checksum';

      expect(() => deserializeGameState(serialized)).toThrow(DeserializationError);
    });

    it('should detect corrupted data', () => {
      const state = createValidGameState();
      const serialized = serializeGameState(state, true);
      serialized.data = 'corrupted-data';

      expect(() => deserializeGameState(serialized)).toThrow(DeserializationError);
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve all data through serialize/deserialize cycle', () => {
      const original = createValidGameState();
      const serialized = serializeGameState(original, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.metadata.playerName).toBe(original.metadata.playerName);
      expect(deserialized.resources.food).toBe(original.resources.food);
      expect(deserialized.hero.selectedHero).toBe(original.hero.selectedHero);
      expect(deserialized.profile.wins).toBe(original.profile.wins);
    });

    it('should handle multiple serialize/deserialize cycles', () => {
      let state = createValidGameState();

      for (let i = 0; i < 5; i++) {
        const serialized = serializeGameState(state, true);
        state = deserializeGameState(serialized);
      }

      expect(state.metadata.playerName).toBe('Test Player');
    });
  });
});

describe('Save System - Data Validation', () => {
  describe('Valid data validation', () => {
    it('should validate correct game state', () => {
      const state = createValidGameState();
      const result = validateGameState(state);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(state);
    });

    it('should validate correct save metadata', () => {
      const metadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Test Player',
        progress: 50,
        resources: {
          food: 1000,
          gold: 500,
          army: 50,
        },
        level: 5,
        playTime: 3600,
        version: CURRENT_SAVE_VERSION,
      };

      const result = validateSaveMetadata(metadata);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid data validation', () => {
    it('should reject null data', () => {
      const result = validateGameState(null);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject empty object', () => {
      const result = validateGameState({});
      expect(result.success).toBe(false);
    });

    it('should reject invalid resource values', () => {
      const state = createValidGameState();
      state.resources.food = -100;

      const result = validateGameState(state);
      expect(result.success).toBe(false);
    });

    it('should reject invalid game phase', () => {
      const state = createValidGameState();
      (state.game.phase as any) = 'invalid-phase';

      const result = validateGameState(state);
      expect(result.success).toBe(false);
    });

    it('should reject invalid slot number in metadata', () => {
      const metadata: SaveMetadata = {
        slot: 10 as any,
        timestamp: Date.now(),
        playerName: 'Test',
        progress: 50,
        level: 5,
        playTime: 3600,
        version: CURRENT_SAVE_VERSION,
      };

      const result = validateSaveMetadata(metadata);
      expect(result.success).toBe(false);
    });
  });

  describe('Integrity checks', () => {
    it('should pass integrity check for valid state', () => {
      const state = createValidGameState();
      const result = checkGameStateIntegrity(state);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect resources exceeding caps', () => {
      const state = createValidGameState();
      state.resources.food = 3000;
      state.resources.foodCap = 2000;

      const result = checkGameStateIntegrity(state);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect invalid generation rates', () => {
      const state = createValidGameState();
      state.resources.generation.foodPerSecond = -10;

      const result = checkGameStateIntegrity(state);
      expect(result.valid).toBe(false);
    });
  });

  describe('Data sanitization', () => {
    it('should cap resources to limits', () => {
      const state = createValidGameState();
      state.resources.food = 3000;
      state.resources.foodCap = 2000;

      const sanitized = sanitizeGameState(state);
      expect(sanitized.resources.food).toBe(2000);
    });

    it('should clamp research progress', () => {
      const state = createValidGameState();
      state.research.progress = 150;

      const sanitized = sanitizeGameState(state);
      expect(sanitized.research.progress).toBe(100);
    });

    it('should remove duplicate heroes', () => {
      const state = createValidGameState();
      state.collection.heroes = ['hero-1', 'hero-1', 'hero-2'];

      const sanitized = sanitizeGameState(state);
      expect(sanitized.collection.heroes).toHaveLength(2);
    });
  });

  describe('Corruption detection', () => {
    it('should detect corrupted data', () => {
      expect(isDataCorrupted(null)).toBe(true);
      expect(isDataCorrupted(undefined)).toBe(true);
      expect(isDataCorrupted({})).toBe(true);
      expect(isDataCorrupted('string')).toBe(true);
    });

    it('should not flag valid data as corrupted', () => {
      const state = createValidGameState();
      expect(isDataCorrupted(state)).toBe(false);
    });
  });
});

describe('Save System - localStorage Operations', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Save operations', () => {
    it('should save game state to slot', async () => {
      const state = createValidGameState();
      await saveToSlot(0, state);

      expect(isSlotEmpty(0)).toBe(false);
    });

    it('should save to all valid slots (0-4)', async () => {
      const state = createValidGameState();

      for (let slot = 0; slot <= 4; slot++) {
        await saveToSlot(slot, state);
        expect(isSlotEmpty(slot)).toBe(false);
      }
    });

    it('should throw error for invalid slot numbers', async () => {
      const state = createValidGameState();

      await expect(saveToSlot(-1, state)).rejects.toThrow(SaveSlotError);
      await expect(saveToSlot(5, state)).rejects.toThrow(SaveSlotError);
    });

    it('should overwrite existing save', async () => {
      const state1 = createValidGameState({ metadata: { ...createValidGameState().metadata, playerName: 'Player 1' } });
      const state2 = createValidGameState({ metadata: { ...createValidGameState().metadata, playerName: 'Player 2' } });

      await saveToSlot(0, state1);
      await saveToSlot(0, state2);

      const metadata = getSaveMetadata(0);
      expect(metadata!.playerName).toBe('Player 2');
    });
  });

  describe('Load operations', () => {
    it('should load game state from slot', async () => {
      const original = createValidGameState();
      await saveToSlot(0, original);

      const loaded = await loadFromSlot(0);
      expect(loaded.profile.name).toBe(original.profile.name);
    });

    it('should throw error for empty slot', async () => {
      await expect(loadFromSlot(0)).rejects.toThrow(SaveSlotError);
    });

    it('should throw error for invalid slot', async () => {
      await expect(loadFromSlot(-1)).rejects.toThrow(SaveSlotError);
      await expect(loadFromSlot(5)).rejects.toThrow(SaveSlotError);
    });

    it('should restore complete game state', async () => {
      const original = createValidGameState();
      await saveToSlot(0, original);

      const loaded = await loadFromSlot(0);

      expect(loaded.game).toBeDefined();
      expect(loaded.hero).toBeDefined();
      expect(loaded.combat).toBeDefined();
      expect(loaded.resources).toBeDefined();
      expect(loaded.collection).toBeDefined();
      expect(loaded.profile).toBeDefined();
    });
  });

  describe('Metadata operations', () => {
    it('should retrieve save metadata', async () => {
      const state = createValidGameState();
      await saveToSlot(0, state);

      const metadata = getSaveMetadata(0);
      expect(metadata).not.toBeNull();
      expect(metadata!.playerName).toBe('Test Player');
    });

    it('should return null for empty slot', () => {
      const metadata = getSaveMetadata(0);
      expect(metadata).toBeNull();
    });

    it('should get all save metadata', async () => {
      const state = createValidGameState();
      await saveToSlot(0, state);
      await saveToSlot(2, state);

      const allMetadata = getAllSaveMetadata();
      expect(allMetadata).toHaveLength(5);
      expect(allMetadata[0]).not.toBeNull();
      expect(allMetadata[1]).toBeNull();
      expect(allMetadata[2]).not.toBeNull();
    });
  });

  describe('Delete operations', () => {
    it('should delete save from slot', async () => {
      const state = createValidGameState();
      await saveToSlot(0, state);

      await deleteSave(0);
      expect(isSlotEmpty(0)).toBe(true);
    });

    it('should not throw when deleting empty slot', async () => {
      await expect(deleteSave(0)).resolves.not.toThrow();
    });
  });

  describe('Save/Load round-trip', () => {
    it('should preserve all data through save/load cycle', async () => {
      const original = createValidGameState();
      await saveToSlot(0, original);
      const loaded = await loadFromSlot(0);

      expect(loaded.profile.name).toBe(original.profile.name);
      expect(loaded.resources.food).toBe(original.resources.food);
      expect(loaded.hero.selectedHero).toBe(original.hero.selectedHero);
    });

    it('should handle multiple save/load cycles', async () => {
      let state = createValidGameState();

      for (let i = 0; i < 5; i++) {
        await saveToSlot(0, state);
        state = await loadFromSlot(0);
        state.resources.food += 100;
      }

      expect(state.resources.food).toBe(1500);
    });
  });
});

describe('Save System - Import/Export File Handling', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Export functionality', () => {
    it('should export save as Blob', async () => {
      const state = createValidGameState();
      await saveToSlot(0, state);

      const blob = await exportSave(0);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should export valid JSON data', async () => {
      const state = createValidGameState();
      await saveToSlot(0, state);

      const blob = await exportSave(0);
      const text = await blob.text();
      const parsed = JSON.parse(text);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('checksum');
    });

    it('should throw error for empty slot', async () => {
      await expect(exportSave(0)).rejects.toThrow(SaveSlotError);
    });

    it('should throw error for invalid slot', async () => {
      await expect(exportSave(-1)).rejects.toThrow(SaveSlotError);
      await expect(exportSave(5)).rejects.toThrow(SaveSlotError);
    });
  });

  describe('Filename generation', () => {
    it('should generate filename with player name and timestamp', () => {
      const metadata: SaveMetadata = {
        slot: 0,
        timestamp: new Date('2024-01-15T10:30:00').getTime(),
        playerName: 'Test Player',
        progress: 50,
        level: 5,
        playTime: 3600,
        version: CURRENT_SAVE_VERSION,
      };

      const filename = generateExportFilename(metadata);
      expect(filename).toContain('game-save');
      expect(filename).toContain('Test-Player');
      expect(filename).toMatch(/\.json$/);
    });

    it('should sanitize special characters in filename', () => {
      const metadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Player@#$%',
        progress: 50,
        level: 5,
        playTime: 3600,
        version: CURRENT_SAVE_VERSION,
      };

      const filename = generateExportFilename(metadata);
      expect(filename).not.toContain('@');
      expect(filename).not.toContain('#');
    });
  });

  describe('Import functionality', () => {
    it('should import valid save file', async () => {
      const original = createValidGameState();
      await saveToSlot(0, original);

      const blob = await exportSave(0);
      const file = new File([blob], 'test-save.json', { type: 'application/json' });

      const imported = await importSave(file, 1);
      expect(imported.profile.name).toBe(original.profile.name);
    });

    it('should throw error for invalid JSON', async () => {
      const file = new File(['invalid json'], 'test.json', { type: 'application/json' });
      await expect(importSave(file, 0)).rejects.toThrow();
    });

    it('should throw error for corrupted data', async () => {
      const invalidData = JSON.stringify({ version: '1.0.0', data: 'corrupted', checksum: 'invalid' });
      const file = new File([invalidData], 'test.json', { type: 'application/json' });

      await expect(importSave(file, 0)).rejects.toThrow();
    });

    it('should throw error for invalid slot', async () => {
      const file = new File(['{}'], 'test.json', { type: 'application/json' });
      await expect(importSave(file, -1)).rejects.toThrow(SaveSlotError);
    });
  });

  describe('Import and save to slot', () => {
    it('should import and save to empty slot', async () => {
      const original = createValidGameState();
      await saveToSlot(0, original);

      const blob = await exportSave(0);
      const file = new File([blob], 'test.json', { type: 'application/json' });

      await importAndSaveToSlot(file, 1, false);
      const loaded = await loadFromSlot(1);

      expect(loaded.profile.name).toBe(original.profile.name);
    });

    it('should throw error when overwriting without confirmation', async () => {
      const state1 = createValidGameState();
      const state2 = createValidGameState({ profile: { ...state1.profile, name: 'Player 2' } });

      await saveToSlot(0, state1);
      await saveToSlot(1, state2);

      const blob = await exportSave(0);
      const file = new File([blob], 'test.json', { type: 'application/json' });

      await expect(importAndSaveToSlot(file, 1, false)).rejects.toThrow(SaveSlotError);
    });

    it('should overwrite with confirmation', async () => {
      const state1 = createValidGameState();
      const state2 = createValidGameState({ profile: { ...state1.profile, name: 'Player 2' } });

      await saveToSlot(0, state1);
      await saveToSlot(1, state2);

      const blob = await exportSave(0);
      const file = new File([blob], 'test.json', { type: 'application/json' });

      await importAndSaveToSlot(file, 1, true);
      const loaded = await loadFromSlot(1);

      expect(loaded.profile.name).toBe(state1.profile.name);
    });
  });

  describe('Export/Import round-trip', () => {
    it('should preserve all data through export/import cycle', async () => {
      const original = createValidGameState();
      await saveToSlot(0, original);

      const blob = await exportSave(0);
      const file = new File([blob], 'test.json', { type: 'application/json' });

      await importAndSaveToSlot(file, 1, false);
      const loaded = await loadFromSlot(1);

      expect(loaded.profile.name).toBe(original.profile.name);
      expect(loaded.resources.food).toBe(original.resources.food);
      expect(loaded.hero.selectedHero).toBe(original.hero.selectedHero);
    });
  });
});

describe('Save System - Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Complete workflow', () => {
    it('should handle complete save workflow: create -> save -> load -> modify -> save', async () => {
      // Create initial state
      const state = createValidGameState();

      // Save to slot
      await saveToSlot(0, state);

      // Load from slot
      const loaded = await loadFromSlot(0);
      expect(loaded.resources.food).toBe(1000);

      // Modify state
      loaded.resources.food = 1500;

      // Save modified state
      await saveToSlot(0, loaded);

      // Load again and verify
      const reloaded = await loadFromSlot(0);
      expect(reloaded.resources.food).toBe(1500);
    });

    it('should handle export/import workflow across slots', async () => {
      // Create and save
      const state = createValidGameState();
      await saveToSlot(0, state);

      // Export
      const blob = await exportSave(0);
      const file = new File([blob], 'backup.json', { type: 'application/json' });

      // Import to different slot
      await importAndSaveToSlot(file, 2, false);

      // Verify both slots have same data
      const slot0 = await loadFromSlot(0);
      const slot2 = await loadFromSlot(2);

      expect(slot0.profile.name).toBe(slot2.profile.name);
      expect(slot0.resources.food).toBe(slot2.resources.food);
    });

    it('should handle validation -> sanitization -> save workflow', async () => {
      // Create state with issues
      const state = createValidGameState();
      state.resources.food = 3000; // Exceeds cap
      state.collection.heroes = ['hero-1', 'hero-1', 'hero-2']; // Duplicates

      // Sanitize
      const sanitized = sanitizeGameState(state);
      expect(sanitized.resources.food).toBe(2000);
      expect(sanitized.collection.heroes).toHaveLength(2);

      // Validate
      const validation = validateGameState(sanitized);
      expect(validation.success).toBe(true);

      // Save
      await saveToSlot(0, sanitized);

      // Load and verify
      const loaded = await loadFromSlot(0);
      expect(loaded.resources.food).toBe(2000);
      expect(loaded.collection.heroes).toHaveLength(2);
    });
  });

  describe('Error recovery', () => {
    it('should handle corrupted save gracefully', async () => {
      // Save valid data
      const state = createValidGameState();
      await saveToSlot(0, state);

      // Corrupt the data
      localStorage.setItem('game-save-slot-0', 'corrupted data');

      // Attempt to load should throw
      await expect(loadFromSlot(0)).rejects.toThrow();

      // Slot should still be considered occupied
      expect(isSlotEmpty(0)).toBe(false);
    });

    it('should allow recovery by deleting corrupted save', async () => {
      // Save and corrupt
      const state = createValidGameState();
      await saveToSlot(0, state);
      localStorage.setItem('game-save-slot-0', 'corrupted');

      // Delete corrupted save
      await deleteSave(0);

      // Slot should now be empty
      expect(isSlotEmpty(0)).toBe(true);

      // Can save new data
      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);
      expect(loaded.profile.name).toBe(state.profile.name);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty arrays in game state', async () => {
      const state = createValidGameState({
        combat: { units: [], buildings: [], activeEffects: [] },
        collection: { heroes: [], items: [], completionPercentage: 0 },
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.combat.units).toEqual([]);
      expect(loaded.collection.heroes).toEqual([]);
    });

    it('should handle null values in optional fields', async () => {
      const state = createValidGameState({
        game: { phase: 'menu', difficulty: 'normal', currentLevel: 1, elapsedTime: 0 },
        hero: { selectedHero: null, unlockedHeroes: [] },
        research: { completed: [], inProgress: null, progress: 0, available: [] },
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.hero.selectedHero).toBeNull();
      expect(loaded.research.inProgress).toBeNull();
    });

    it('should handle maximum resource values', async () => {
      const state = createValidGameState({
        resources: {
          food: 999999,
          gold: 999999,
          army: 999999,
          foodCap: 1000000,
          goldCap: 1000000,
          armyCap: 1000000,
          generation: { foodPerSecond: 1000, goldPerSecond: 1000, armyPerSecond: 100 },
        },
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.resources.food).toBe(999999);
    });

    it('should handle special characters in player name', async () => {
      const state = createValidGameState({
        metadata: { ...createValidGameState().metadata, playerName: 'Trần Hưng Đạo 🇻🇳' },
        profile: { ...createValidGameState().profile, name: 'Trần Hưng Đạo 🇻🇳' },
      });

      await saveToSlot(0, state);
      const loaded = await loadFromSlot(0);

      expect(loaded.metadata.playerName).toBe('Trần Hưng Đạo 🇻🇳');
    });
  });
});
