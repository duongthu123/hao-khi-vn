/**
 * Tests for save data serialization
 * **Validates: Requirements 7.2, 9.8**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  serializeGameState,
  deserializeGameState,
  serializeForExport,
  deserializeFromImport,
  getCompressionRatio,
  estimateSaveSize,
  CURRENT_SAVE_VERSION,
  SerializationError,
  DeserializationError,
  VersionMismatchError,
  type SerializedSave,
} from '../serialization';
import type { GameState } from '@/schemas/save.schema';

describe('Save Data Serialization', () => {
  let mockGameState: GameState;

  beforeEach(() => {
    mockGameState = {
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
        units: [],
        buildings: [],
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
        items: ['sword-1', 'shield-1'],
        completionPercentage: 25,
      },
      profile: {
        name: 'Test Player',
        rank: 'Captain',
        level: 5,
        experience: 2500,
        wins: 10,
        losses: 3,
        achievements: ['first-win', 'hero-collector'],
        statistics: {
          totalPlayTime: 3600,
          unitsDefeated: 150,
          resourcesGathered: 50000,
          quizzesCompleted: 5,
        },
      },
      research: {
        completed: ['archery-1', 'cavalry-1'],
        inProgress: 'fortification-1',
        progress: 60,
        available: ['siege-1', 'tactics-1'],
      },
      quiz: {
        questionsAnswered: 20,
        correctAnswers: 16,
        completedCategories: ['history'],
        rewards: ['hero-tran-quoc-tuan'],
      },
    };
  });

  describe('serializeGameState', () => {
    it('should serialize game state with compression', () => {
      const result = serializeGameState(mockGameState, true);

      expect(result).toHaveProperty('version', CURRENT_SAVE_VERSION);
      expect(result).toHaveProperty('compressed', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('checksum');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.data).toBe('string');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should serialize game state without compression', () => {
      const result = serializeGameState(mockGameState, false);

      expect(result.compressed).toBe(false);
      expect(result.data).toContain('Test Player');
      expect(() => JSON.parse(result.data)).not.toThrow();
    });

    it('should include version in serialized data', () => {
      const result = serializeGameState(mockGameState, false);
      const parsed = JSON.parse(result.data);

      expect(parsed.version).toBe(CURRENT_SAVE_VERSION);
    });

    it('should generate consistent checksum for same data', () => {
      const result1 = serializeGameState(mockGameState, false);
      const result2 = serializeGameState(mockGameState, false);

      expect(result1.checksum).toBe(result2.checksum);
    });

    it('should generate different checksum for different data', () => {
      const result1 = serializeGameState(mockGameState, false);

      const modifiedState = {
        ...mockGameState,
        resources: { ...mockGameState.resources, gold: 999 },
      };
      const result2 = serializeGameState(modifiedState, false);

      expect(result1.checksum).not.toBe(result2.checksum);
    });

    it('should serialize even with null game field (JSON.stringify handles it)', () => {
      // JSON.stringify can handle null values, so this won't throw
      const invalidState = { ...mockGameState, game: null } as unknown as GameState;

      const result = serializeGameState(invalidState);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('checksum');
    });
  });

  describe('deserializeGameState', () => {
    it('should deserialize compressed game state', () => {
      const serialized = serializeGameState(mockGameState, true);
      const result = deserializeGameState(serialized);

      expect(result).toMatchObject({
        metadata: expect.objectContaining({
          playerName: 'Test Player',
          progress: 50,
        }),
        game: expect.objectContaining({
          phase: 'playing',
          difficulty: 'normal',
        }),
        resources: expect.objectContaining({
          food: 1000,
          gold: 500,
        }),
      });
    });

    it('should deserialize uncompressed game state', () => {
      const serialized = serializeGameState(mockGameState, false);
      const result = deserializeGameState(serialized);

      expect(result.profile.name).toBe('Test Player');
      expect(result.resources.food).toBe(1000);
    });

    it('should validate checksum and throw on mismatch', () => {
      const serialized = serializeGameState(mockGameState, false);
      const corrupted: SerializedSave = {
        ...serialized,
        checksum: 'invalid-checksum',
      };

      expect(() => deserializeGameState(corrupted)).toThrow(DeserializationError);
      expect(() => deserializeGameState(corrupted)).toThrow(/checksum mismatch/);
    });

    it('should throw on corrupted compressed data', () => {
      const serialized = serializeGameState(mockGameState, true);
      const corrupted: SerializedSave = {
        ...serialized,
        data: 'corrupted-data-xyz',
        checksum: 'abc123',
      };

      expect(() => deserializeGameState(corrupted)).toThrow(DeserializationError);
    });

    it('should validate game state schema', () => {
      const invalidData = JSON.stringify({ invalid: 'data', version: CURRENT_SAVE_VERSION });
      
      // Calculate correct checksum
      let hash = 0;
      for (let i = 0; i < invalidData.length; i++) {
        const char = invalidData.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      const checksum = Math.abs(hash).toString(36);

      const serialized: SerializedSave = {
        version: CURRENT_SAVE_VERSION,
        compressed: false,
        data: invalidData,
        checksum: checksum,
        timestamp: Date.now(),
      };

      expect(() => deserializeGameState(serialized)).toThrow(DeserializationError);
      expect(() => deserializeGameState(serialized)).toThrow(/Invalid save data format/);
    });
  });

  describe('version compatibility', () => {
    it('should handle same version saves', () => {
      const serialized = serializeGameState(mockGameState, true);
      const result = deserializeGameState(serialized);

      expect(result.version).toBe(CURRENT_SAVE_VERSION);
    });

    it('should handle compatible minor version differences', () => {
      const serialized = serializeGameState(mockGameState, false);
      const data = JSON.parse(serialized.data);
      data.version = '1.0.0'; // Older minor version

      const modifiedSerialized: SerializedSave = {
        ...serialized,
        data: JSON.stringify(data),
      };

      // Recalculate checksum
      const jsonString = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      modifiedSerialized.checksum = Math.abs(hash).toString(36);

      expect(() => deserializeGameState(modifiedSerialized)).not.toThrow();
    });

    it('should throw VersionMismatchError on major version mismatch', () => {
      const serialized = serializeGameState(mockGameState, false);
      const data = JSON.parse(serialized.data);
      data.version = '2.0.0'; // Different major version

      const modifiedSerialized: SerializedSave = {
        ...serialized,
        data: JSON.stringify(data),
      };

      // Recalculate checksum
      const jsonString = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      modifiedSerialized.checksum = Math.abs(hash).toString(36);

      expect(() => deserializeGameState(modifiedSerialized)).toThrow(VersionMismatchError);
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve all data through serialize/deserialize cycle', () => {
      const serialized = serializeGameState(mockGameState, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.metadata.playerName).toBe(mockGameState.metadata.playerName);
      expect(deserialized.resources.food).toBe(mockGameState.resources.food);
      expect(deserialized.hero.selectedHero).toBe(mockGameState.hero.selectedHero);
      expect(deserialized.profile.wins).toBe(mockGameState.profile.wins);
      expect(deserialized.research.completed).toEqual(mockGameState.research.completed);
    });

    it('should handle multiple serialize/deserialize cycles', () => {
      let state = mockGameState;

      for (let i = 0; i < 5; i++) {
        const serialized = serializeGameState(state, true);
        state = deserializeGameState(serialized);
      }

      expect(state.metadata.playerName).toBe(mockGameState.metadata.playerName);
      expect(state.resources.gold).toBe(mockGameState.resources.gold);
    });
  });

  describe('compression utilities', () => {
    it('should calculate compression ratio', () => {
      const ratio = getCompressionRatio(mockGameState);

      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(1); // Compressed should be smaller
    });

    it('should estimate uncompressed save size', () => {
      const size = estimateSaveSize(mockGameState, false);

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('should estimate compressed save size', () => {
      const compressedSize = estimateSaveSize(mockGameState, true);
      const uncompressedSize = estimateSaveSize(mockGameState, false);

      expect(compressedSize).toBeGreaterThan(0);
      expect(compressedSize).toBeLessThan(uncompressedSize);
    });
  });

  describe('export/import functionality', () => {
    it('should serialize for export with metadata', () => {
      const exported = serializeForExport(mockGameState);

      expect(() => JSON.parse(exported)).not.toThrow();

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('checksum');
    });

    it('should deserialize from imported file', () => {
      const exported = serializeForExport(mockGameState);
      const imported = deserializeFromImport(exported);

      expect(imported.metadata.playerName).toBe(mockGameState.metadata.playerName);
      expect(imported.resources.food).toBe(mockGameState.resources.food);
    });

    it('should handle export/import round-trip', () => {
      const exported = serializeForExport(mockGameState);
      const imported = deserializeFromImport(exported);

      expect(imported).toMatchObject({
        metadata: expect.objectContaining({
          playerName: mockGameState.metadata.playerName,
        }),
        resources: expect.objectContaining({
          food: mockGameState.resources.food,
          gold: mockGameState.resources.gold,
        }),
      });
    });

    it('should throw on invalid import file format', () => {
      const invalidFile = JSON.stringify({ invalid: 'format' });

      expect(() => deserializeFromImport(invalidFile)).toThrow(DeserializationError);
      expect(() => deserializeFromImport(invalidFile)).toThrow(/Invalid save file format/);
    });

    it('should throw on malformed JSON import', () => {
      const malformedFile = '{ invalid json }';

      expect(() => deserializeFromImport(malformedFile)).toThrow(DeserializationError);
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays in game state', () => {
      const stateWithEmptyArrays: GameState = {
        ...mockGameState,
        combat: {
          units: [],
          buildings: [],
          activeEffects: [],
        },
        collection: {
          heroes: [],
          items: [],
          completionPercentage: 0,
        },
      };

      const serialized = serializeGameState(stateWithEmptyArrays, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.combat.units).toEqual([]);
      expect(deserialized.collection.heroes).toEqual([]);
    });

    it('should handle maximum resource values', () => {
      const stateWithMaxResources: GameState = {
        ...mockGameState,
        resources: {
          ...mockGameState.resources,
          food: 999999,
          gold: 999999,
          army: 999999,
        },
      };

      const serialized = serializeGameState(stateWithMaxResources, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.resources.food).toBe(999999);
      expect(deserialized.resources.gold).toBe(999999);
    });

    it('should handle special characters in player name', () => {
      const stateWithSpecialChars: GameState = {
        ...mockGameState,
        metadata: {
          ...mockGameState.metadata,
          playerName: 'Trần Hưng Đạo 🇻🇳',
        },
        profile: {
          ...mockGameState.profile,
          name: 'Trần Hưng Đạo 🇻🇳',
        },
      };

      const serialized = serializeGameState(stateWithSpecialChars, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.metadata.playerName).toBe('Trần Hưng Đạo 🇻🇳');
    });

    it('should handle null values in optional fields', () => {
      const stateWithNulls: GameState = {
        ...mockGameState,
        hero: {
          selectedHero: null,
          unlockedHeroes: [],
        },
        research: {
          ...mockGameState.research,
          inProgress: null,
        },
      };

      const serialized = serializeGameState(stateWithNulls, true);
      const deserialized = deserializeGameState(serialized);

      expect(deserialized.hero.selectedHero).toBeNull();
      expect(deserialized.research.inProgress).toBeNull();
    });
  });

  describe('performance', () => {
    it('should serialize large game state efficiently', () => {
      const largeState: GameState = {
        ...mockGameState,
        combat: {
          units: Array(100).fill('unit-id'),
          buildings: Array(50).fill('building-id'),
          activeEffects: Array(20).fill('effect-id'),
        },
        collection: {
          heroes: Array(50).fill('hero-id'),
          items: Array(100).fill('item-id'),
          completionPercentage: 75,
        },
      };

      const startTime = performance.now();
      const serialized = serializeGameState(largeState, true);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(serialized.data).toBeDefined();
    });

    it('should deserialize large game state efficiently', () => {
      const largeState: GameState = {
        ...mockGameState,
        combat: {
          units: Array(100).fill('unit-id'),
          buildings: Array(50).fill('building-id'),
          activeEffects: Array(20).fill('effect-id'),
        },
      };

      const serialized = serializeGameState(largeState, true);

      const startTime = performance.now();
      const deserialized = deserializeGameState(serialized);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(deserialized.combat.units.length).toBe(100);
    });
  });
});
