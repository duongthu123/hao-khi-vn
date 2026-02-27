/**
 * Local storage save system
 * Provides interface for saving/loading game state to browser localStorage
 * **Implements: Requirements 7.1, 7.3, 7.4, 7.5**
 */

import { serializeGameState, deserializeGameState, type SerializedSave } from './serialization';
import { validateGameStateOrThrow } from './validation';
import type { GameState, SaveMetadata } from '@/schemas/save.schema';

/**
 * Local storage error types
 */
export class LocalStorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LocalStorageError';
  }
}

export class SaveSlotError extends Error {
  constructor(
    message: string,
    public readonly slot: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SaveSlotError';
  }
}

export class QuotaExceededError extends Error {
  constructor(message: string, public readonly requiredSpace?: number) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Number of save slots available (0-4 for 5 slots)
 */
export const SAVE_SLOT_COUNT = 5;
export const MIN_SLOT = 0;
export const MAX_SLOT = 4;

/**
 * Local storage key prefix
 */
const SAVE_KEY_PREFIX = 'game-save-slot-';
const METADATA_KEY_PREFIX = 'game-save-metadata-';

/**
 * Save game state to a specific slot in localStorage
 * **Implements: Requirement 7.1 - Provide 3 to 5 save slots**
 * **Implements: Requirement 7.3 - Store save data in browser localStorage**
 *
 * @param slot - Save slot number (0-4)
 * @param state - Game state to save
 * @throws {SaveSlotError} If slot number is invalid
 * @throws {LocalStorageError} If save operation fails
 * @throws {QuotaExceededError} If localStorage quota is exceeded
 */
export async function saveToSlot(slot: number, state: GameState): Promise<void> {
  // Validate slot number
  if (!isValidSlot(slot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      slot
    );
  }

  try {
    // Serialize game state with compression
    const serialized = serializeGameState(state, true);

    // Generate storage keys
    const saveKey = getSaveKey(slot);
    const metadataKey = getMetadataKey(slot);

    // Update metadata with current slot
    const metadata: SaveMetadata = {
      ...state.metadata,
      slot: slot as 0 | 1 | 2 | 3 | 4,
      timestamp: Date.now(),
      version: state.version,
      resources: {
        food: state.resources.food,
        gold: state.resources.gold,
        army: state.resources.army,
      },
    };

    // Save to localStorage
    try {
      localStorage.setItem(saveKey, JSON.stringify(serialized));
      localStorage.setItem(metadataKey, JSON.stringify(metadata));
    } catch (error) {
      // Check if quota exceeded
      if (isQuotaExceededError(error)) {
        const estimatedSize = JSON.stringify(serialized).length;
        throw new QuotaExceededError(
          'localStorage quota exceeded. Cannot save game.',
          estimatedSize
        );
      }
      throw error;
    }
  } catch (error) {
    if (
      error instanceof SaveSlotError ||
      error instanceof QuotaExceededError
    ) {
      throw error;
    }
    throw new LocalStorageError(
      `Failed to save game to slot ${slot}`,
      error
    );
  }
}

/**
 * Load game state from a specific slot in localStorage
 * **Implements: Requirement 7.1 - Load from save slots**
 * **Implements: Requirement 7.3 - Load save data from browser localStorage**
 * **Implements: Requirement 7.5 - Deserialize and restore complete Game_State**
 *
 * @param slot - Save slot number (0-4)
 * @returns Restored game state
 * @throws {SaveSlotError} If slot number is invalid or slot is empty
 * @throws {LocalStorageError} If load operation fails
 */
export async function loadFromSlot(slot: number): Promise<GameState> {
  // Validate slot number
  if (!isValidSlot(slot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      slot
    );
  }

  try {
    // Get storage key
    const saveKey = getSaveKey(slot);

    // Load from localStorage
    const savedData = localStorage.getItem(saveKey);

    if (!savedData) {
      throw new SaveSlotError(
        `Save slot ${slot} is empty`,
        slot
      );
    }

    // Parse serialized save
    const serialized: SerializedSave = JSON.parse(savedData);

    // Deserialize and validate
    const gameState = deserializeGameState(serialized);
    const validatedState = validateGameStateOrThrow(gameState);

    return validatedState;
  } catch (error) {
    if (error instanceof SaveSlotError) {
      throw error;
    }
    throw new LocalStorageError(
      `Failed to load game from slot ${slot}`,
      error
    );
  }
}

/**
 * Get save metadata without loading full game state
 * **Implements: Requirement 7.4 - Include metadata with each save**
 * **Implements: Requirement 7.8 - Display save slot information**
 *
 * @param slot - Save slot number (0-4)
 * @returns Save metadata or null if slot is empty
 * @throws {SaveSlotError} If slot number is invalid
 */
export function getSaveMetadata(slot: number): SaveMetadata | null {
  // Validate slot number
  if (!isValidSlot(slot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      slot
    );
  }

  try {
    // Get metadata key
    const metadataKey = getMetadataKey(slot);

    // Load metadata from localStorage
    const metadataData = localStorage.getItem(metadataKey);

    if (!metadataData) {
      return null;
    }

    // Parse and return metadata
    const metadata: SaveMetadata = JSON.parse(metadataData);
    return metadata;
  } catch (error) {
    // If metadata is corrupted, return null
    console.error(`Failed to load metadata for slot ${slot}:`, error);
    return null;
  }
}

/**
 * Delete save data from a specific slot
 * **Implements: Requirement 7.1 - Manage save slots**
 *
 * @param slot - Save slot number (0-4)
 * @throws {SaveSlotError} If slot number is invalid
 */
export async function deleteSave(slot: number): Promise<void> {
  // Validate slot number
  if (!isValidSlot(slot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      slot
    );
  }

  try {
    // Get storage keys
    const saveKey = getSaveKey(slot);
    const metadataKey = getMetadataKey(slot);

    // Remove from localStorage
    localStorage.removeItem(saveKey);
    localStorage.removeItem(metadataKey);
  } catch (error) {
    throw new LocalStorageError(
      `Failed to delete save from slot ${slot}`,
      error
    );
  }
}

/**
 * Check if a save slot is empty
 * **Implements: Requirement 7.1 - Check save slot status**
 *
 * @param slot - Save slot number (0-4)
 * @returns True if slot is empty
 * @throws {SaveSlotError} If slot number is invalid
 */
export function isSlotEmpty(slot: number): boolean {
  // Validate slot number
  if (!isValidSlot(slot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      slot
    );
  }

  const saveKey = getSaveKey(slot);
  return localStorage.getItem(saveKey) === null;
}

/**
 * Get all save slot metadata
 * **Implements: Requirement 7.8 - Display save slot information**
 *
 * @returns Array of metadata for all slots (null for empty slots)
 */
export function getAllSaveMetadata(): (SaveMetadata | null)[] {
  const metadata: (SaveMetadata | null)[] = [];

  for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
    metadata.push(getSaveMetadata(slot));
  }

  return metadata;
}

/**
 * Get the number of used save slots
 *
 * @returns Count of non-empty save slots
 */
export function getUsedSlotCount(): number {
  let count = 0;

  for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
    if (!isSlotEmpty(slot)) {
      count++;
    }
  }

  return count;
}

/**
 * Find the first empty save slot
 *
 * @returns First empty slot number or null if all slots are full
 */
export function findEmptySlot(): number | null {
  for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
    if (isSlotEmpty(slot)) {
      return slot;
    }
  }

  return null;
}

/**
 * Get estimated localStorage usage for saves
 *
 * @returns Estimated size in bytes
 */
export function getStorageUsage(): number {
  let totalSize = 0;

  for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
    const saveKey = getSaveKey(slot);
    const metadataKey = getMetadataKey(slot);

    const saveData = localStorage.getItem(saveKey);
    const metadataData = localStorage.getItem(metadataKey);

    if (saveData) {
      totalSize += new Blob([saveData]).size;
    }

    if (metadataData) {
      totalSize += new Blob([metadataData]).size;
    }
  }

  return totalSize;
}

/**
 * Clear all save data from localStorage
 * **WARNING**: This will delete all saves permanently
 *
 * @returns Number of slots cleared
 */
export async function clearAllSaves(): Promise<number> {
  let clearedCount = 0;

  for (let slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {
    if (!isSlotEmpty(slot)) {
      await deleteSave(slot);
      clearedCount++;
    }
  }

  return clearedCount;
}

/**
 * Check if localStorage is available
 *
 * @returns True if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate slot number
 */
function isValidSlot(slot: number): boolean {
  return Number.isInteger(slot) && slot >= MIN_SLOT && slot <= MAX_SLOT;
}

/**
 * Get localStorage key for save data
 */
function getSaveKey(slot: number): string {
  return `${SAVE_KEY_PREFIX}${slot}`;
}

/**
 * Get localStorage key for metadata
 */
function getMetadataKey(slot: number): string {
  return `${METADATA_KEY_PREFIX}${slot}`;
}

/**
 * Check if error is a quota exceeded error
 */
function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    // Check for quota exceeded error codes
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    );
  }
  return false;
}

/**
 * Export save data from a slot as a downloadable JSON file
 * **Implements: Requirement 9.1 - Export function that downloads Game_State as JSON file**
 * **Implements: Requirement 9.2 - Name exported files with timestamp and player identifier**
 *
 * @param slot - Save slot number (0-4)
 * @returns Blob containing the exported save data
 * @throws {SaveSlotError} If slot number is invalid or slot is empty
 * @throws {LocalStorageError} If export operation fails
 */
export async function exportSave(slot: number): Promise<Blob> {
  // Validate slot number
  if (!isValidSlot(slot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${slot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      slot
    );
  }

  try {
    // Load game state from slot
    const gameState = await loadFromSlot(slot);
    
    // Serialize for export (includes compression and metadata)
    const { serializeForExport } = await import('./serialization');
    const exportData = serializeForExport(gameState);
    
    // Create blob with JSON data
    const blob = new Blob([exportData], { type: 'application/json' });
    
    return blob;
  } catch (error) {
    if (error instanceof SaveSlotError) {
      throw error;
    }
    throw new LocalStorageError(
      `Failed to export save from slot ${slot}`,
      error
    );
  }
}

/**
 * Generate filename for exported save
 * **Implements: Requirement 9.2 - Name exported files with timestamp and player identifier**
 *
 * @param metadata - Save metadata
 * @returns Filename string
 */
export function generateExportFilename(metadata: SaveMetadata): string {
  // Format: game-save-PlayerName-YYYY-MM-DD-HHmmss.json
  const date = new Date(metadata.timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Sanitize player name for filename
  const sanitizedName = metadata.playerName
    .replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20);
  
  return `game-save-${sanitizedName}-${year}-${month}-${day}-${hours}${minutes}${seconds}.json`;
}

/**
 * Import save data from a JSON file
 * **Implements: Requirement 9.3 - Import function that accepts JSON save files**
 * **Implements: Requirement 9.4 - Validate file format and data integrity**
 * **Implements: Requirement 9.6 - Allow importing to any available save slot**
 *
 * @param file - File object containing save data
 * @param targetSlot - Target save slot number (0-4)
 * @returns Imported game state (for preview before saving)
 * @throws {SaveSlotError} If slot number is invalid
 * @throws {LocalStorageError} If import operation fails
 */
export async function importSave(file: File, targetSlot: number): Promise<GameState> {
  // Validate slot number
  if (!isValidSlot(targetSlot)) {
    throw new SaveSlotError(
      `Invalid save slot: ${targetSlot}. Must be between ${MIN_SLOT} and ${MAX_SLOT}`,
      targetSlot
    );
  }

  try {
    // Read file content
    const fileContent = await readFileAsText(file);
    
    // Validate file is not empty
    if (!fileContent || fileContent.trim().length === 0) {
      throw new LocalStorageError('File is empty or unreadable');
    }
    
    // Deserialize and validate
    const { deserializeFromImport } = await import('./serialization');
    const gameState = deserializeFromImport(fileContent);
    
    // Additional validation
    const { validateGameStateOrThrow } = await import('./validation');
    const validatedState = validateGameStateOrThrow(gameState);
    
    return validatedState;
  } catch (error) {
    if (error instanceof SaveSlotError) {
      throw error;
    }
    throw new LocalStorageError(
      `Failed to import save file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    );
  }
}

/**
 * Import and save to slot in one operation
 * **Implements: Requirement 9.6 - Allow importing to any available save slot**
 * **Implements: Requirement 9.7 - Warn before overwriting existing saves**
 *
 * @param file - File object containing save data
 * @param targetSlot - Target save slot number (0-4)
 * @param overwrite - Whether to overwrite existing save (must be true if slot is not empty)
 * @returns Imported and saved game state
 * @throws {SaveSlotError} If slot is not empty and overwrite is false
 * @throws {LocalStorageError} If import or save operation fails
 */
export async function importAndSaveToSlot(
  file: File,
  targetSlot: number,
  overwrite: boolean = false
): Promise<GameState> {
  // Check if slot is empty
  const slotEmpty = isSlotEmpty(targetSlot);
  
  // If slot is not empty and overwrite is not confirmed, throw error
  if (!slotEmpty && !overwrite) {
    throw new SaveSlotError(
      `Save slot ${targetSlot} is not empty. Overwrite confirmation required.`,
      targetSlot
    );
  }
  
  // Import the save data
  const gameState = await importSave(file, targetSlot);
  
  // Save to the target slot
  await saveToSlot(targetSlot, gameState);
  
  return gameState;
}

/**
 * Read file as text
 * Helper function for file reading
 *
 * @param file - File to read
 * @returns File content as string
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    reader.readAsText(file);
  });
}
