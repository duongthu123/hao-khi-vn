/**
 * Save data serialization module
 * Handles conversion between game state and JSON with compression and versioning
 * **Implements: Requirements 7.2, 9.8**
 */

import LZString from 'lz-string';
import { GameStateSchema, type GameState } from '@/schemas/save.schema';

/**
 * Current save format version
 * Increment when making breaking changes to save format
 */
export const CURRENT_SAVE_VERSION = '1.0.0';

/**
 * Serialization error types
 */
export class SerializationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SerializationError';
  }
}

export class DeserializationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DeserializationError';
  }
}

export class VersionMismatchError extends Error {
  constructor(
    message: string,
    public readonly saveVersion: string,
    public readonly currentVersion: string
  ) {
    super(message);
    this.name = 'VersionMismatchError';
  }
}

/**
 * Serialized save data format
 */
export interface SerializedSave {
  version: string;
  compressed: boolean;
  data: string;
  checksum: string;
  timestamp: number;
}

/**
 * Serialize game state to JSON with compression
 * **Implements: Requirement 7.2 - Save to JSON format**
 * **Implements: Requirement 9.8 - Compress exported save files**
 *
 * @param state - Game state to serialize
 * @param compress - Whether to compress the data (default: true)
 * @returns Serialized save data with metadata
 * @throws {SerializationError} If serialization fails
 */
export function serializeGameState(
  state: GameState,
  compress: boolean = true
): SerializedSave {
  try {
    // Add version to state if not present
    const versionedState = {
      ...state,
      version: CURRENT_SAVE_VERSION,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(versionedState);

    // Compress if requested
    const data = compress
      ? LZString.compressToBase64(jsonString)
      : jsonString;

    // Generate checksum for integrity validation
    const checksum = generateChecksum(jsonString);

    return {
      version: CURRENT_SAVE_VERSION,
      compressed: compress,
      data,
      checksum,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new SerializationError(
      'Failed to serialize game state',
      error
    );
  }
}

/**
 * Deserialize game state from JSON with decompression
 * **Implements: Requirement 7.2 - Load from JSON format**
 * **Implements: Requirement 9.8 - Decompress imported save files**
 *
 * @param serialized - Serialized save data
 * @returns Restored game state
 * @throws {DeserializationError} If deserialization fails
 * @throws {VersionMismatchError} If save version is incompatible
 */
export function deserializeGameState(
  serialized: SerializedSave
): GameState {
  try {
    // Decompress if needed
    const jsonString = serialized.compressed
      ? LZString.decompressFromBase64(serialized.data)
      : serialized.data;

    if (!jsonString) {
      throw new DeserializationError('Failed to decompress save data');
    }

    // Verify checksum
    const calculatedChecksum = generateChecksum(jsonString);
    if (calculatedChecksum !== serialized.checksum) {
      throw new DeserializationError(
        'Save data checksum mismatch - data may be corrupted'
      );
    }

    // Parse JSON
    const parsed = JSON.parse(jsonString);

    // Check version compatibility
    const saveVersion = parsed.version || '0.0.0';
    if (!isVersionCompatible(saveVersion, CURRENT_SAVE_VERSION)) {
      // Attempt migration
      const migrated = migrateGameState(parsed, saveVersion);
      return validateAndReturn(migrated);
    }

    return validateAndReturn(parsed);
  } catch (error) {
    if (
      error instanceof DeserializationError ||
      error instanceof VersionMismatchError
    ) {
      throw error;
    }
    throw new DeserializationError(
      'Failed to deserialize game state',
      error
    );
  }
}

/**
 * Validate game state against schema and return
 * @param data - Parsed game state data
 * @returns Validated game state
 * @throws {DeserializationError} If validation fails
 */
function validateAndReturn(data: unknown): GameState {
  const result = GameStateSchema.safeParse(data);
  if (!result.success) {
    throw new DeserializationError(
      `Invalid save data format: ${result.error.message}`,
      result.error
    );
  }
  return result.data;
}

/**
 * Generate checksum for data integrity validation
 * Uses simple hash function for checksum generation
 *
 * @param data - String data to checksum
 * @returns Checksum string
 */
function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if save version is compatible with current version
 * Uses semantic versioning rules:
 * - Major version must match
 * - Minor version can be lower or equal
 * - Patch version is ignored
 *
 * @param saveVersion - Version from save file
 * @param currentVersion - Current application version
 * @returns True if compatible
 */
function isVersionCompatible(
  saveVersion: string,
  currentVersion: string
): boolean {
  const [saveMajor, saveMinor] = saveVersion.split('.').map(Number);
  const [currentMajor, currentMinor] = currentVersion.split('.').map(Number);

  // Major version must match
  if (saveMajor !== currentMajor) {
    return false;
  }

  // Minor version can be lower or equal
  if (saveMinor > currentMinor) {
    return false;
  }

  return true;
}

/**
 * Migrate game state from older version to current version
 * **Implements: Requirement 9.8 - Save versioning for backward compatibility**
 *
 * @param state - Old game state
 * @param fromVersion - Version to migrate from
 * @returns Migrated game state
 * @throws {VersionMismatchError} If migration is not possible
 */
function migrateGameState(state: unknown, fromVersion: string): unknown {
  const [major] = fromVersion.split('.').map(Number);
  const [currentMajor] = CURRENT_SAVE_VERSION.split('.').map(Number);

  // Cannot migrate across major versions
  if (major !== currentMajor) {
    throw new VersionMismatchError(
      `Cannot migrate save from version ${fromVersion} to ${CURRENT_SAVE_VERSION}. Major version mismatch.`,
      fromVersion,
      CURRENT_SAVE_VERSION
    );
  }

  // Apply migrations based on version
  let migrated = state;

  // Example migration from 1.0.x to 1.1.x
  // if (major === 1 && minor === 0) {
  //   migrated = migrateFrom1_0_to_1_1(migrated);
  // }

  // Add future migrations here as needed
  // Each migration should be idempotent and handle missing fields gracefully

  return migrated;
}

/**
 * Get compression ratio for a game state
 * Useful for debugging and optimization
 *
 * @param state - Game state to analyze
 * @returns Compression ratio (compressed size / original size)
 */
export function getCompressionRatio(state: GameState): number {
  const jsonString = JSON.stringify(state);
  const compressed = LZString.compressToBase64(jsonString);

  const originalSize = new Blob([jsonString]).size;
  const compressedSize = new Blob([compressed]).size;

  return compressedSize / originalSize;
}

/**
 * Estimate save file size in bytes
 *
 * @param state - Game state to estimate
 * @param compressed - Whether to estimate compressed size
 * @returns Estimated size in bytes
 */
export function estimateSaveSize(
  state: GameState,
  compressed: boolean = true
): number {
  const jsonString = JSON.stringify(state);

  if (!compressed) {
    return new Blob([jsonString]).size;
  }

  const compressedData = LZString.compressToBase64(jsonString);
  return new Blob([compressedData]).size;
}

/**
 * Serialize game state for export to file
 * Includes additional metadata for file exports
 * **Implements: Requirement 9.8 - Export save files**
 *
 * @param state - Game state to export
 * @returns Serialized save with export metadata
 */
export function serializeForExport(state: GameState): string {
  const serialized = serializeGameState(state, true);

  const exportData = {
    ...serialized,
    exportedAt: Date.now(),
    metadata: state.metadata,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Deserialize game state from imported file
 * **Implements: Requirement 9.8 - Import save files**
 *
 * @param fileContent - Content of imported save file
 * @returns Restored game state
 * @throws {DeserializationError} If import fails
 */
export function deserializeFromImport(fileContent: string): GameState {
  try {
    const exportData = JSON.parse(fileContent);

    // Validate export format
    if (!exportData.version || !exportData.data || !exportData.checksum) {
      throw new DeserializationError(
        'Invalid save file format - missing required fields'
      );
    }

    // Extract serialized save
    const serialized: SerializedSave = {
      version: exportData.version,
      compressed: exportData.compressed ?? true,
      data: exportData.data,
      checksum: exportData.checksum,
      timestamp: exportData.timestamp || exportData.exportedAt,
    };

    return deserializeGameState(serialized);
  } catch (error) {
    if (error instanceof DeserializationError) {
      throw error;
    }
    throw new DeserializationError(
      'Failed to import save file',
      error
    );
  }
}
