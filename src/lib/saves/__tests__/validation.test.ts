/**
 * Tests for save data validation module
 * **Validates: Requirements 7.6, 7.7, 24.2**
 */

import { describe, it, expect } from 'vitest';
import {
  validateGameState,
  validateSaveMetadata,
  checkGameStateIntegrity,
  validateGameStateOrThrow,
  isDataCorrupted,
  sanitizeGameState,
  getValidationErrorMessage,
  validateAndSanitize,
  CorruptedDataError,
  type ValidationResult,
  type IntegrityCheckResult
} from '../validation';
import type { GameState, SaveMetadata } from '@/schemas/save.schema';

// Helper to create valid game state
function createValidGameState(): GameState {
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
      selectedHero: 'hero-1',
      unlockedHeroes: ['hero-1', 'hero-2']
    },
    combat: {
      units: ['unit-1', 'unit-2'],
      buildings: ['building-1'],
      activeEffects: []
    },
    resources: {
      food: 500,
      gold: 300,
      army: 50,
      foodCap: 1000,
      goldCap: 1000,
      armyCap: 100,
      generation: {
        foodPerSecond: 5,
        goldPerSecond: 3,
        armyPerSecond: 0.5
      }
    },
    collection: {
      heroes: ['hero-1', 'hero-2'],
      items: ['item-1'],
      completionPercentage: 25
    },
    profile: {
      name: 'Test Player',
      rank: 'Soldier',
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
    }
  };
}

// Helper to create valid save metadata
function createValidSaveMetadata(): SaveMetadata {
  return {
    slot: 0,
    timestamp: Date.now(),
    playerName: 'Test Player',
    progress: 50,
    resources: {
      food: 500,
      gold: 300,
      army: 50
    },
    level: 5,
    playTime: 3600,
    version: '1.0.0'
  };
}

describe('validateGameState', () => {
  it('should validate correct game state', () => {
    const state = createValidGameState();
    const result = validateGameState(state);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(state);
    expect(result.errors).toBeUndefined();
  });

  it('should reject null data', () => {
    const result = validateGameState(null);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should reject undefined data', () => {
    const result = validateGameState(undefined);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject empty object', () => {
    const result = validateGameState({});

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should reject missing required fields', () => {
    const state = createValidGameState();
    const { version, ...incomplete } = state;

    const result = validateGameState(incomplete);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid resource values', () => {
    const state = createValidGameState();
    state.resources.food = -100;

    const result = validateGameState(state);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid game phase', () => {
    const state = createValidGameState();
    (state.game.phase as any) = 'invalid-phase';

    const result = validateGameState(state);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid difficulty', () => {
    const state = createValidGameState();
    (state.game.difficulty as any) = 'impossible';

    const result = validateGameState(state);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should include warnings for non-critical issues', () => {
    const state = createValidGameState();
    // Resources exceeding caps (warning, not error)
    state.resources.food = 1500;
    state.resources.foodCap = 1000;

    // Direct integrity check shows warnings
    const integrityResult = checkGameStateIntegrity(state);
    expect(integrityResult.valid).toBe(true);
    expect(integrityResult.issues.length).toBeGreaterThan(0);
    expect(integrityResult.issues[0].severity).toBe('warning');

    // Validation still passes
    const result = validateGameState(state);
    expect(result.success).toBe(true);
  });
});

describe('validateSaveMetadata', () => {
  it('should validate correct metadata', () => {
    const metadata = createValidSaveMetadata();
    const result = validateSaveMetadata(metadata);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(metadata);
  });

  it('should reject invalid slot number', () => {
    const metadata = createValidSaveMetadata();
    (metadata.slot as any) = 10;

    const result = validateSaveMetadata(metadata);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject negative timestamp', () => {
    const metadata = createValidSaveMetadata();
    metadata.timestamp = -1;

    const result = validateSaveMetadata(metadata);

    expect(result.success).toBe(false);
  });

  it('should reject invalid progress percentage', () => {
    const metadata = createValidSaveMetadata();
    metadata.progress = 150;

    const result = validateSaveMetadata(metadata);

    expect(result.success).toBe(false);
  });

  it('should reject invalid version format', () => {
    const metadata = createValidSaveMetadata();
    metadata.version = 'invalid';

    const result = validateSaveMetadata(metadata);

    expect(result.success).toBe(false);
  });
});

describe('checkGameStateIntegrity', () => {
  it('should pass integrity check for valid state', () => {
    const state = createValidGameState();
    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect resources exceeding caps', () => {
    const state = createValidGameState();
    state.resources.food = 1500;
    state.resources.foodCap = 1000;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(true); // Warning, not error
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].severity).toBe('warning');
    expect(result.issues[0].field).toContain('food');
  });

  it('should detect invalid generation rates', () => {
    const state = createValidGameState();
    state.resources.generation.foodPerSecond = -10;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.severity === 'error')).toBe(true);
  });

  it('should detect negative play time', () => {
    const state = createValidGameState();
    state.profile.statistics.totalPlayTime = -100;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.field.includes('totalPlayTime'))).toBe(true);
  });

  it('should detect invalid research progress', () => {
    const state = createValidGameState();
    state.research.progress = 150;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.field.includes('research.progress'))).toBe(true);
  });

  it('should detect research inconsistency', () => {
    const state = createValidGameState();
    state.research.inProgress = 'research-2';
    state.research.progress = 0;

    const result = checkGameStateIntegrity(state);

    expect(result.issues.some(i => i.field.includes('research'))).toBe(true);
  });

  it('should detect duplicate heroes in collection', () => {
    const state = createValidGameState();
    state.collection.heroes = ['hero-1', 'hero-1', 'hero-2'];

    const result = checkGameStateIntegrity(state);

    expect(result.issues.some(i => i.field.includes('heroes'))).toBe(true);
  });

  it('should detect invalid completion percentage', () => {
    const state = createValidGameState();
    state.collection.completionPercentage = 150;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(false);
  });

  it('should detect metadata inconsistency', () => {
    const state = createValidGameState();
    state.metadata.level = 10;
    state.game.currentLevel = 5;

    const result = checkGameStateIntegrity(state);

    expect(result.issues.some(i => i.field.includes('metadata.level'))).toBe(true);
  });

  it('should detect future timestamp', () => {
    const state = createValidGameState();
    state.metadata.timestamp = Date.now() + 100000;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.field.includes('timestamp'))).toBe(true);
  });

  it('should detect missing hero in playing phase', () => {
    const state = createValidGameState();
    state.game.phase = 'playing';
    state.hero.selectedHero = null;

    const result = checkGameStateIntegrity(state);

    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.field.includes('selectedHero'))).toBe(true);
  });
});

describe('validateGameStateOrThrow', () => {
  it('should return valid game state', () => {
    const state = createValidGameState();
    const result = validateGameStateOrThrow(state);

    expect(result).toEqual(state);
  });

  it('should throw CorruptedDataError for invalid data', () => {
    expect(() => {
      validateGameStateOrThrow({});
    }).toThrow(CorruptedDataError);
  });

  it('should include error details in exception', () => {
    try {
      validateGameStateOrThrow({ invalid: 'data' });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(CorruptedDataError);
      const corruptedError = error as CorruptedDataError;
      expect(corruptedError.details).toBeDefined();
      expect(corruptedError.details!.length).toBeGreaterThan(0);
    }
  });
});

describe('isDataCorrupted', () => {
  it('should return false for valid data', () => {
    const state = createValidGameState();
    expect(isDataCorrupted(state)).toBe(false);
  });

  it('should return true for null', () => {
    expect(isDataCorrupted(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isDataCorrupted(undefined)).toBe(true);
  });

  it('should return true for non-object', () => {
    expect(isDataCorrupted('string')).toBe(true);
    expect(isDataCorrupted(123)).toBe(true);
    expect(isDataCorrupted(true)).toBe(true);
  });

  it('should return true for missing required fields', () => {
    expect(isDataCorrupted({})).toBe(true);
    expect(isDataCorrupted({ version: '1.0.0' })).toBe(true);
  });

  it('should return true for invalid version', () => {
    const state = createValidGameState();
    (state as any).version = '';
    expect(isDataCorrupted(state)).toBe(true);
  });
});

describe('sanitizeGameState', () => {
  it('should cap resources to limits', () => {
    const state = createValidGameState();
    state.resources.food = 1500;
    state.resources.foodCap = 1000;

    const sanitized = sanitizeGameState(state);

    expect(sanitized.resources.food).toBe(1000);
  });

  it('should clamp research progress', () => {
    const state = createValidGameState();
    state.research.progress = 150;

    const sanitized = sanitizeGameState(state);

    expect(sanitized.research.progress).toBe(100);
  });

  it('should clamp negative research progress', () => {
    const state = createValidGameState();
    state.research.progress = -10;

    const sanitized = sanitizeGameState(state);

    expect(sanitized.research.progress).toBe(0);
  });

  it('should remove duplicate heroes', () => {
    const state = createValidGameState();
    state.collection.heroes = ['hero-1', 'hero-1', 'hero-2'];

    const sanitized = sanitizeGameState(state);

    expect(sanitized.collection.heroes).toHaveLength(2);
    expect(sanitized.collection.heroes).toContain('hero-1');
    expect(sanitized.collection.heroes).toContain('hero-2');
  });

  it('should ensure non-negative profile values', () => {
    const state = createValidGameState();
    state.profile.wins = -5;
    state.profile.statistics.totalPlayTime = -100;

    const sanitized = sanitizeGameState(state);

    expect(sanitized.profile.wins).toBe(0);
    expect(sanitized.profile.statistics.totalPlayTime).toBe(0);
  });

  it('should not modify valid state', () => {
    const state = createValidGameState();
    const sanitized = sanitizeGameState(state);

    expect(sanitized).toEqual(state);
  });
});

describe('getValidationErrorMessage', () => {
  it('should return generic message for empty errors', () => {
    const message = getValidationErrorMessage([]);

    expect(message).toContain('không hợp lệ');
  });

  it('should return single error message', () => {
    const message = getValidationErrorMessage(['Invalid field']);

    expect(message).toContain('Invalid field');
  });

  it('should return multiple error messages', () => {
    const errors = ['Error 1', 'Error 2', 'Error 3'];
    const message = getValidationErrorMessage(errors);

    expect(message).toContain('3 lỗi');
    expect(message).toContain('Error 1');
    expect(message).toContain('Error 2');
    expect(message).toContain('Error 3');
  });

  it('should truncate long error lists', () => {
    const errors = ['Error 1', 'Error 2', 'Error 3', 'Error 4', 'Error 5'];
    const message = getValidationErrorMessage(errors);

    expect(message).toContain('5 lỗi');
    expect(message).toContain('...');
  });
});

describe('validateAndSanitize', () => {
  it('should return valid state without sanitization', () => {
    const state = createValidGameState();
    const result = validateAndSanitize(state);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(state);
    expect(result.warnings).toBeUndefined();
  });

  it('should use sanitizeGameState for manual sanitization', () => {
    const state = createValidGameState();
    // Duplicate heroes
    state.collection.heroes = ['hero-1', 'hero-1', 'hero-2'];

    // Manual sanitization
    const sanitized = sanitizeGameState(state);
    expect(sanitized.collection.heroes).toHaveLength(2);

    // Then validate
    const result = validateGameState(sanitized);
    expect(result.success).toBe(true);
  });

  it('should return errors for unfixable issues', () => {
    const result = validateAndSanitize({ invalid: 'data' });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should handle schema validation failures', () => {
    const state = createValidGameState();
    // Invalid research progress (fails schema validation)
    state.research.progress = -10;

    const result = validateAndSanitize(state);

    // Should fail validation
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe('Integration: Full validation workflow', () => {
  it('should validate, check integrity, and sanitize in sequence', () => {
    const state = createValidGameState();
    state.resources.food = 1500;
    state.resources.foodCap = 1000;
    state.collection.heroes = ['hero-1', 'hero-1', 'hero-2'];

    // Step 1: Validate (passes with warnings in integrity check)
    const validationResult = validateGameState(state);
    expect(validationResult.success).toBe(true);

    // Step 2: Check integrity (shows warnings)
    const integrityResult = checkGameStateIntegrity(state);
    expect(integrityResult.valid).toBe(true);
    expect(integrityResult.issues.length).toBeGreaterThan(0);

    // Step 3: Sanitize
    const sanitized = sanitizeGameState(state);
    expect(sanitized.resources.food).toBe(1000);
    expect(sanitized.collection.heroes).toHaveLength(2);

    // Step 4: Validate sanitized
    const finalValidation = validateGameState(sanitized);
    expect(finalValidation.success).toBe(true);
  });

  it('should handle completely corrupted data', () => {
    const corrupted = { random: 'data', with: 'no', valid: 'fields' };

    expect(isDataCorrupted(corrupted)).toBe(true);

    const validationResult = validateGameState(corrupted);
    expect(validationResult.success).toBe(false);

    expect(() => validateGameStateOrThrow(corrupted)).toThrow(CorruptedDataError);
  });
});
