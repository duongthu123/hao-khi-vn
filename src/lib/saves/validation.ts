/**
 * Save data validation module
 * Provides integrity checks and validation for save data
 * **Implements: Requirements 7.6, 7.7, 24.2**
 */

import { GameStateSchema, SaveMetadataSchema, type GameState, type SaveMetadata } from '@/schemas/save.schema';
import { ZodError } from 'zod';

/**
 * Validation error types
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: string[],
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CorruptedDataError extends Error {
  constructor(
    message: string,
    public readonly reason: string,
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'CorruptedDataError';
  }
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

/**
 * Integrity check result
 */
export interface IntegrityCheckResult {
  valid: boolean;
  issues: IntegrityIssue[];
}

export interface IntegrityIssue {
  severity: 'error' | 'warning';
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validate game state data with comprehensive checks
 * **Implements: Requirement 7.6 - Validate save data integrity before loading**
 * **Implements: Requirement 24.2 - Validate save game data before loading**
 *
 * @param data - Unknown data to validate
 * @returns Validation result with data or errors
 */
export function validateGameState(data: unknown): ValidationResult<GameState> {
  try {
    // Schema validation
    const result = GameStateSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        errors: formatZodErrors(result.error)
      };
    }

    // Additional integrity checks
    const integrityResult = checkGameStateIntegrity(result.data);

    if (!integrityResult.valid) {
      const errors = integrityResult.issues
        .filter(issue => issue.severity === 'error')
        .map(issue => `${issue.field}: ${issue.message}`);

      const warnings = integrityResult.issues
        .filter(issue => issue.severity === 'warning')
        .map(issue => `${issue.field}: ${issue.message}`);

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined
        };
      }

      // Only warnings, still valid
      return {
        success: true,
        data: result.data,
        warnings
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Unexpected validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Validate save metadata
 * **Implements: Requirement 7.6 - Validate save data integrity**
 *
 * @param data - Unknown data to validate
 * @returns Validation result with metadata or errors
 */
export function validateSaveMetadata(data: unknown): ValidationResult<SaveMetadata> {
  try {
    const result = SaveMetadataSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        errors: formatZodErrors(result.error)
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Unexpected validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Perform comprehensive integrity checks on game state
 * **Implements: Requirement 7.6 - Implement integrity checks for save data**
 *
 * @param state - Game state to check
 * @returns Integrity check result with issues
 */
export function checkGameStateIntegrity(state: GameState): IntegrityCheckResult {
  const issues: IntegrityIssue[] = [];

  // Check resource consistency
  issues.push(...checkResourceIntegrity(state.resources));

  // Check profile consistency
  issues.push(...checkProfileIntegrity(state.profile));

  // Check research consistency
  issues.push(...checkResearchIntegrity(state.research));

  // Check collection consistency
  issues.push(...checkCollectionIntegrity(state.collection));

  // Check metadata consistency
  issues.push(...checkMetadataIntegrity(state.metadata, state));

  // Check game phase consistency
  issues.push(...checkGamePhaseIntegrity(state.game, state.hero));

  return {
    valid: !issues.some(issue => issue.severity === 'error'),
    issues
  };
}

/**
 * Check resource data integrity
 */
function checkResourceIntegrity(resources: GameState['resources']): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  // Resources should not exceed caps
  if (resources.food > resources.foodCap) {
    issues.push({
      severity: 'warning',
      field: 'resources.food',
      message: `Food (${resources.food}) exceeds cap (${resources.foodCap})`,
      value: resources.food
    });
  }

  if (resources.gold > resources.goldCap) {
    issues.push({
      severity: 'warning',
      field: 'resources.gold',
      message: `Gold (${resources.gold}) exceeds cap (${resources.goldCap})`,
      value: resources.gold
    });
  }

  if (resources.army > resources.armyCap) {
    issues.push({
      severity: 'warning',
      field: 'resources.army',
      message: `Army (${resources.army}) exceeds cap (${resources.armyCap})`,
      value: resources.army
    });
  }

  // Generation rates should be reasonable
  if (resources.generation.foodPerSecond < 0 || resources.generation.foodPerSecond > 1000) {
    issues.push({
      severity: 'error',
      field: 'resources.generation.foodPerSecond',
      message: `Invalid food generation rate: ${resources.generation.foodPerSecond}`,
      value: resources.generation.foodPerSecond
    });
  }

  if (resources.generation.goldPerSecond < 0 || resources.generation.goldPerSecond > 1000) {
    issues.push({
      severity: 'error',
      field: 'resources.generation.goldPerSecond',
      message: `Invalid gold generation rate: ${resources.generation.goldPerSecond}`,
      value: resources.generation.goldPerSecond
    });
  }

  return issues;
}

/**
 * Check profile data integrity
 */
function checkProfileIntegrity(profile: GameState['profile']): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  // Win/loss ratio should be reasonable
  const totalGames = profile.wins + profile.losses;
  if (totalGames < 0) {
    issues.push({
      severity: 'error',
      field: 'profile.wins/losses',
      message: 'Total games cannot be negative',
      value: totalGames
    });
  }

  // Experience should match level
  const expectedMinExp = (profile.level - 1) * 100;
  if (profile.experience < expectedMinExp) {
    issues.push({
      severity: 'warning',
      field: 'profile.experience',
      message: `Experience (${profile.experience}) seems low for level ${profile.level}`,
      value: profile.experience
    });
  }

  // Statistics should be non-negative
  if (profile.statistics.totalPlayTime < 0) {
    issues.push({
      severity: 'error',
      field: 'profile.statistics.totalPlayTime',
      message: 'Play time cannot be negative',
      value: profile.statistics.totalPlayTime
    });
  }

  return issues;
}

/**
 * Check research data integrity
 */
function checkResearchIntegrity(research: GameState['research']): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  // Progress should be 0-100
  if (research.progress < 0 || research.progress > 100) {
    issues.push({
      severity: 'error',
      field: 'research.progress',
      message: `Invalid research progress: ${research.progress}`,
      value: research.progress
    });
  }

  // In-progress research should have progress > 0
  if (research.inProgress && research.progress === 0) {
    issues.push({
      severity: 'warning',
      field: 'research.inProgress',
      message: 'Research in progress but progress is 0',
      value: research.inProgress
    });
  }

  // No in-progress research should have progress = 0
  if (!research.inProgress && research.progress > 0) {
    issues.push({
      severity: 'warning',
      field: 'research.progress',
      message: 'Research progress > 0 but no research in progress',
      value: research.progress
    });
  }

  // Check for duplicate research IDs
  const allResearch = [
    ...research.completed,
    ...(research.inProgress ? [research.inProgress] : []),
    ...research.available
  ];
  const uniqueResearch = new Set(allResearch);
  if (uniqueResearch.size !== allResearch.length) {
    issues.push({
      severity: 'error',
      field: 'research',
      message: 'Duplicate research IDs found',
      value: allResearch
    });
  }

  return issues;
}

/**
 * Check collection data integrity
 */
function checkCollectionIntegrity(collection: GameState['collection']): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  // Completion percentage should be 0-100
  if (collection.completionPercentage < 0 || collection.completionPercentage > 100) {
    issues.push({
      severity: 'error',
      field: 'collection.completionPercentage',
      message: `Invalid completion percentage: ${collection.completionPercentage}`,
      value: collection.completionPercentage
    });
  }

  // Check for duplicate hero IDs
  const uniqueHeroes = new Set(collection.heroes);
  if (uniqueHeroes.size !== collection.heroes.length) {
    issues.push({
      severity: 'warning',
      field: 'collection.heroes',
      message: 'Duplicate hero IDs found in collection',
      value: collection.heroes
    });
  }

  // Check for duplicate item IDs
  const uniqueItems = new Set(collection.items);
  if (uniqueItems.size !== collection.items.length) {
    issues.push({
      severity: 'warning',
      field: 'collection.items',
      message: 'Duplicate item IDs found in collection',
      value: collection.items
    });
  }

  return issues;
}

/**
 * Check metadata consistency with game state
 */
function checkMetadataIntegrity(
  metadata: GameState['metadata'],
  state: GameState
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  // Metadata level should match game level
  if (metadata.level !== state.game.currentLevel) {
    issues.push({
      severity: 'warning',
      field: 'metadata.level',
      message: `Metadata level (${metadata.level}) doesn't match game level (${state.game.currentLevel})`,
      value: metadata.level
    });
  }

  // Metadata play time should match profile play time
  if (Math.abs(metadata.playTime - state.profile.statistics.totalPlayTime) > 60) {
    issues.push({
      severity: 'warning',
      field: 'metadata.playTime',
      message: 'Metadata play time differs significantly from profile play time',
      value: metadata.playTime
    });
  }

  // Timestamp should be in the past
  if (metadata.timestamp > Date.now()) {
    issues.push({
      severity: 'error',
      field: 'metadata.timestamp',
      message: 'Save timestamp is in the future',
      value: metadata.timestamp
    });
  }

  return issues;
}

/**
 * Check game phase consistency
 */
function checkGamePhaseIntegrity(
  game: GameState['game'],
  hero: GameState['hero']
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  // If playing, should have a selected hero
  if (game.phase === 'playing' && !hero.selectedHero) {
    issues.push({
      severity: 'error',
      field: 'hero.selectedHero',
      message: 'Game is in playing phase but no hero is selected',
      value: null
    });
  }

  // Elapsed time should be reasonable
  if (game.elapsedTime < 0) {
    issues.push({
      severity: 'error',
      field: 'game.elapsedTime',
      message: 'Elapsed time cannot be negative',
      value: game.elapsedTime
    });
  }

  return issues;
}

/**
 * Format Zod validation errors into readable messages
 */
function formatZodErrors(error: ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.join('.');
    return `${path || 'root'}: ${issue.message}`;
  });
}

/**
 * Validate and throw if invalid
 * **Implements: Requirement 7.7 - Display error message and prevent loading if corrupted**
 *
 * @param data - Data to validate
 * @returns Validated game state
 * @throws {CorruptedDataError} If validation fails
 */
export function validateGameStateOrThrow(data: unknown): GameState {
  const result = validateGameState(data);

  if (!result.success) {
    throw new CorruptedDataError(
      'Save data is corrupted or invalid',
      'Validation failed',
      result.errors
    );
  }

  return result.data!;
}

/**
 * Validate game state and return sanitized version if needed
 * This is a convenience function that combines validation and sanitization
 *
 * @param data - Data to validate
 * @returns Validated and potentially sanitized game state
 * @throws {CorruptedDataError} If validation fails even after sanitization
 */
export function validateAndSanitizeOrThrow(data: unknown): GameState {
  const result = validateAndSanitize(data);

  if (!result.success) {
    throw new CorruptedDataError(
      'Save data is corrupted or invalid',
      'Validation failed',
      result.errors
    );
  }

  return result.data!;
}

/**
 * Check if save data appears to be corrupted
 * Performs quick checks without full validation
 *
 * @param data - Data to check
 * @returns True if data appears corrupted
 */
export function isDataCorrupted(data: unknown): boolean {
  // Basic type checks
  if (!data || typeof data !== 'object') {
    return true;
  }

  const obj = data as Record<string, unknown>;

  // Check for required top-level fields
  const requiredFields = ['version', 'metadata', 'game', 'resources', 'profile'];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return true;
    }
  }

  // Check for obviously invalid values
  if (typeof obj.version !== 'string' || obj.version.length === 0) {
    return true;
  }

  return false;
}

/**
 * Sanitize game state by fixing minor issues
 * Attempts to repair common problems in save data
 * **Implements: Requirement 7.7 - Handle corrupted save data gracefully**
 *
 * @param state - Game state to sanitize
 * @returns Sanitized game state
 */
export function sanitizeGameState(state: GameState): GameState {
  const sanitized = { ...state };

  // Cap resources to their limits
  sanitized.resources = {
    ...sanitized.resources,
    food: Math.min(sanitized.resources.food, sanitized.resources.foodCap),
    gold: Math.min(sanitized.resources.gold, sanitized.resources.goldCap),
    army: Math.min(sanitized.resources.army, sanitized.resources.armyCap)
  };

  // Clamp research progress
  sanitized.research = {
    ...sanitized.research,
    progress: Math.max(0, Math.min(100, sanitized.research.progress))
  };

  // Clamp collection completion
  sanitized.collection = {
    ...sanitized.collection,
    completionPercentage: Math.max(0, Math.min(100, sanitized.collection.completionPercentage))
  };

  // Remove duplicate heroes
  sanitized.collection.heroes = Array.from(new Set(sanitized.collection.heroes));

  // Remove duplicate items
  sanitized.collection.items = Array.from(new Set(sanitized.collection.items));

  // Ensure non-negative values
  sanitized.profile = {
    ...sanitized.profile,
    wins: Math.max(0, sanitized.profile.wins),
    losses: Math.max(0, sanitized.profile.losses),
    experience: Math.max(0, sanitized.profile.experience),
    statistics: {
      ...sanitized.profile.statistics,
      totalPlayTime: Math.max(0, sanitized.profile.statistics.totalPlayTime),
      unitsDefeated: Math.max(0, sanitized.profile.statistics.unitsDefeated),
      resourcesGathered: Math.max(0, sanitized.profile.statistics.resourcesGathered),
      quizzesCompleted: Math.max(0, sanitized.profile.statistics.quizzesCompleted)
    }
  };

  return sanitized;
}

/**
 * Get user-friendly error message for validation errors
 * **Implements: Requirement 7.7 - Display error message**
 *
 * @param errors - Array of error messages
 * @returns User-friendly error message in Vietnamese
 */
export function getValidationErrorMessage(errors: string[]): string {
  if (errors.length === 0) {
    return 'Dữ liệu lưu game không hợp lệ.';
  }

  if (errors.length === 1) {
    return `Lỗi dữ liệu lưu game: ${errors[0]}`;
  }

  return `Dữ liệu lưu game có ${errors.length} lỗi:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`;
}

/**
 * Validate save data with automatic sanitization attempt
 * **Implements: Requirement 7.7 - Handle corrupted save data gracefully**
 *
 * @param data - Data to validate
 * @returns Validation result with sanitized data if possible
 */
export function validateAndSanitize(data: unknown): ValidationResult<GameState> {
  // First attempt: validate as-is
  const result = validateGameState(data);

  if (!result.success) {
    // Validation failed, can't proceed
    return result;
  }

  // Check if there are any warnings (integrity issues)
  if (!result.warnings || result.warnings.length === 0) {
    // No issues, return as-is
    return result;
  }

  // Has warnings, try to sanitize
  try {
    const sanitized = sanitizeGameState(result.data!);
    const sanitizedResult = validateGameState(sanitized);

    if (sanitizedResult.success) {
      return {
        ...sanitizedResult,
        data: sanitized,
        warnings: [
          'Save data was automatically repaired'
        ]
      };
    }

    // Sanitization didn't help, return original result
    return result;
  } catch {
    // Sanitization failed, return original result
    return result;
  }
}
