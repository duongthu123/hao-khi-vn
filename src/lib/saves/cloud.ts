/**
 * Cloud save system
 * Provides interface for saving/loading game state to cloud storage
 * **Implements: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 25.7**
 */

import { serializeGameState, deserializeGameState, type SerializedSave } from './serialization';
import { validateGameStateOrThrow } from './validation';
import type { GameState } from '@/schemas/save.schema';
import { ConflictResolution } from '@/types/save';

/**
 * Minimal metadata needed for conflict detection
 */
type GameMetadata = GameState['metadata'];

/**
 * Save conflict between local and cloud saves
 */
export interface CloudSaveConflict {
  localMetadata: GameMetadata;
  cloudMetadata: CloudSaveMetadata;
}

/**
 * Cloud storage error types
 */
export class CloudStorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'CloudStorageError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class SyncConflictError extends Error {
  constructor(
    message: string,
    public readonly conflict: CloudSaveConflict
  ) {
    super(message);
    this.name = 'SyncConflictError';
  }
}

/**
 * Cloud save metadata with sync information
 */
export interface CloudSaveMetadata {
  slot: number;
  timestamp: number;
  playerName: string;
  progress: number;
  level: number;
  playTime: number;
  cloudId: string;
  userId: string;
  lastSyncedAt: number;
  syncVersion: number;
}

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'conflict';

/**
 * Cloud storage provider interface
 * This is a placeholder - actual implementation depends on chosen provider (Supabase/Firebase)
 */
interface CloudStorageProvider {
  isAuthenticated(): Promise<boolean>;
  getUserId(): Promise<string>;
  uploadSave(userId: string, data: string): Promise<string>;
  downloadSave(userId: string): Promise<string | null>;
  deleteSave(userId: string): Promise<void>;
  getMetadata(userId: string): Promise<CloudSaveMetadata | null>;
}

/**
 * Mock cloud storage provider for development
 * Replace with actual Supabase/Firebase implementation
 */
class MockCloudStorageProvider implements CloudStorageProvider {
  private storage = new Map<string, string>();
  private metadata = new Map<string, CloudSaveMetadata>();

  async isAuthenticated(): Promise<boolean> {
    // Mock: always authenticated in development
    return true;
  }

  async getUserId(): Promise<string> {
    // Mock: return a test user ID
    return 'test-user-123';
  }

  async uploadSave(userId: string, data: string): Promise<string> {
    const cloudId = `cloud-save-${userId}-${Date.now()}`;
    this.storage.set(userId, data);
    return cloudId;
  }

  async downloadSave(userId: string): Promise<string | null> {
    return this.storage.get(userId) || null;
  }

  async deleteSave(userId: string): Promise<void> {
    this.storage.delete(userId);
    this.metadata.delete(userId);
  }

  async getMetadata(userId: string): Promise<CloudSaveMetadata | null> {
    return this.metadata.get(userId) || null;
  }
}

// Initialize provider (replace with actual provider in production)
let cloudProvider: CloudStorageProvider = new MockCloudStorageProvider();

/**
 * Set cloud storage provider
 * Use this to inject Supabase or Firebase provider
 */
export function setCloudStorageProvider(provider: CloudStorageProvider): void {
  cloudProvider = provider;
}

/**
 * Check if user is authenticated for cloud saves
 * **Implements: Requirement 10.2 - Require player authentication**
 */
export async function isCloudAuthenticatedAsync(): Promise<boolean> {
  try {
    return await cloudProvider.isAuthenticated();
  } catch (error) {
    console.error('Failed to check authentication:', error);
    return false;
  }
}

/**
 * Encrypt save data before uploading
 * **Implements: Requirement 10.6 - Encrypt save data before uploading**
 * 
 * Note: This is a placeholder. In production, use proper encryption like AES-256
 */
function encryptSaveData(data: string): string {
  // TODO: Implement proper encryption
  // For now, just base64 encode as a placeholder
  return btoa(data);
}

/**
 * Decrypt save data after downloading
 */
function decryptSaveData(encryptedData: string): string {
  // TODO: Implement proper decryption
  // For now, just base64 decode as a placeholder
  return atob(encryptedData);
}

/**
 * Sync game state to cloud storage
 * **Implements: Requirement 10.3 - Sync local saves to Storage_Provider**
 * **Implements: Requirement 10.6 - Encrypt save data before uploading**
 */
export async function syncToCloud(state: GameState): Promise<CloudSaveMetadata> {
  // Check authentication
  const isAuthenticated = await cloudProvider.isAuthenticated();
  if (!isAuthenticated) {
    throw new AuthenticationError('User must be authenticated to sync to cloud');
  }

  try {
    // Get user ID
    const userId = await cloudProvider.getUserId();

    // Serialize game state
    const serialized = serializeGameState(state, true);
    const serializedJson = JSON.stringify(serialized);

    // Encrypt data
    const encrypted = encryptSaveData(serializedJson);

    // Upload to cloud
    const cloudId = await cloudProvider.uploadSave(userId, encrypted);

    // Create cloud metadata
    const cloudMetadata: CloudSaveMetadata = {
      ...state.metadata,
      cloudId,
      userId,
      lastSyncedAt: Date.now(),
      syncVersion: 1,
    };

    return cloudMetadata;
  } catch (error) {
    throw new CloudStorageError(
      'Failed to sync save to cloud',
      error
    );
  }
}

/**
 * Load game state from cloud storage
 * **Implements: Requirement 10.3 - Load saves from Storage_Provider**
 */
export async function loadFromCloud(): Promise<GameState> {
  // Check authentication
  const isAuthenticated = await cloudProvider.isAuthenticated();
  if (!isAuthenticated) {
    throw new AuthenticationError('User must be authenticated to load from cloud');
  }

  try {
    // Get user ID
    const userId = await cloudProvider.getUserId();

    // Download from cloud
    const encrypted = await cloudProvider.downloadSave(userId);

    if (!encrypted) {
      throw new CloudStorageError('No cloud save found for user');
    }

    // Decrypt data
    const serializedJson = decryptSaveData(encrypted);

    // Parse and deserialize
    const serialized: SerializedSave = JSON.parse(serializedJson);
    const gameState = deserializeGameState(serialized);

    // Validate
    const validatedState = validateGameStateOrThrow(gameState);

    return validatedState;
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof CloudStorageError) {
      throw error;
    }
    throw new CloudStorageError(
      'Failed to load save from cloud',
      error
    );
  }
}

/**
 * Get cloud save metadata without loading full game state
 */
export async function getCloudMetadata(): Promise<CloudSaveMetadata | null> {
  const isAuthenticated = await cloudProvider.isAuthenticated();
  if (!isAuthenticated) {
    return null;
  }

  try {
    const userId = await cloudProvider.getUserId();
    return await cloudProvider.getMetadata(userId);
  } catch (error) {
    console.error('Failed to get cloud metadata:', error);
    return null;
  }
}

/**
 * Delete cloud save
 */
export async function deleteCloudSave(): Promise<void> {
  const isAuthenticated = await cloudProvider.isAuthenticated();
  if (!isAuthenticated) {
    throw new AuthenticationError('User must be authenticated to delete cloud save');
  }

  try {
    const userId = await cloudProvider.getUserId();
    await cloudProvider.deleteSave(userId);
  } catch (error) {
    throw new CloudStorageError(
      'Failed to delete cloud save',
      error
    );
  }
}

/**
 * Detect conflicts between local and cloud saves
 * **Implements: Requirement 10.4 - Detect conflicts between local and cloud saves**
 */
export function detectSaveConflict(
  localMetadata: GameMetadata,
  cloudMetadata: CloudSaveMetadata
): CloudSaveConflict | null {
  // No conflict if timestamps match
  if (localMetadata.timestamp === cloudMetadata.timestamp) {
    return null;
  }

  // Conflict exists
  return {
    localMetadata,
    cloudMetadata,
  };
}

/**
 * Resolve save conflict based on strategy
 * **Implements: Requirement 10.5 - Allow players to choose which save to keep**
 */
export async function resolveConflict(
  _conflict: CloudSaveConflict,
  resolution: ConflictResolution,
  localState?: GameState,
  cloudState?: GameState
): Promise<GameState> {
  switch (resolution) {
    case ConflictResolution.USE_LOCAL:
      if (!localState) {
        throw new CloudStorageError('Local state required for USE_LOCAL resolution');
      }
      // Upload local to cloud
      await syncToCloud(localState);
      return localState;

    case ConflictResolution.USE_CLOUD:
      if (!cloudState) {
        // Load from cloud
        cloudState = await loadFromCloud();
      }
      return cloudState;

    case ConflictResolution.MERGE:
      // Merge strategy: use the save with more progress
      if (!localState || !cloudState) {
        throw new CloudStorageError('Both states required for MERGE resolution');
      }
      
      const useLocal = localState.metadata.progress >= cloudState.metadata.progress;
      const mergedState = useLocal ? localState : cloudState;
      
      // Sync merged state to cloud
      await syncToCloud(mergedState);
      return mergedState;

    case ConflictResolution.CANCEL:
      throw new CloudStorageError('Conflict resolution cancelled by user');

    default:
      throw new CloudStorageError(`Unknown conflict resolution strategy: ${resolution}`);
  }
}

/**
 * Sync with conflict detection and resolution
 * **Implements: Requirement 10.4 - Detect conflicts**
 * **Implements: Requirement 10.5 - Allow conflict resolution**
 */
export async function syncWithConflictDetection(
  localState: GameState,
  autoResolve: boolean = false
): Promise<{ state: GameState; hadConflict: boolean }> {
  try {
    // Get cloud metadata
    const cloudMetadata = await getCloudMetadata();

    // No cloud save exists, just upload
    if (!cloudMetadata) {
      await syncToCloud(localState);
      return { state: localState, hadConflict: false };
    }

    // Check for conflicts
    const conflict = detectSaveConflict(localState.metadata, cloudMetadata);

    // No conflict, just sync
    if (!conflict) {
      await syncToCloud(localState);
      return { state: localState, hadConflict: false };
    }

    // Conflict detected
    if (autoResolve) {
      // Auto-resolve using merge strategy
      const cloudState = await loadFromCloud();
      const resolved = await resolveConflict(
        conflict,
        ConflictResolution.MERGE,
        localState,
        cloudState
      );
      return { state: resolved, hadConflict: true };
    }

    // Throw conflict error for manual resolution
    throw new SyncConflictError('Save conflict detected', conflict);
  } catch (error) {
    if (error instanceof SyncConflictError) {
      throw error;
    }
    throw new CloudStorageError('Failed to sync with conflict detection', error);
  }
}

/**
 * Check if device is online
 * **Implements: Requirement 10.7 - Handle offline mode gracefully**
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Wait for online connection
 * **Implements: Requirement 10.7 - Sync on reconnection**
 */
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
}

/**
 * Sync when connection is restored
 * **Implements: Requirement 10.7 - Handle offline mode with sync on reconnection**
 */
export async function syncWhenOnline(state: GameState): Promise<void> {
  if (!isOnline()) {
    // Wait for connection
    await waitForOnline();
  }

  // Sync to cloud
  await syncToCloud(state);
}
