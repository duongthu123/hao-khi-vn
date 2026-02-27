/**
 * Tests for cloud save system
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  syncToCloud,
  loadFromCloud,
  getCloudMetadata,
  deleteCloudSave,
  detectSaveConflict,
  resolveConflict,
  syncWithConflictDetection,
  isOnline,
  waitForOnline,
  syncWhenOnline,
  CloudStorageError,
  AuthenticationError,
  SyncConflictError,
  setCloudStorageProvider,
} from '../cloud';
import { GameState } from '@/schemas/save.schema';
import { ConflictResolution } from '@/types/save';

// Mock game state
const mockGameState: GameState = {
  version: '1.0.0',
  metadata: {
    slot: 0,
    timestamp: Date.now(),
    playerName: 'Test Player',
    progress: 50,
    level: 5,
    playTime: 3600,
  },
  game: {
    phase: 'menu',
    difficulty: 'normal',
    currentLevel: 5,
    elapsedTime: 3600,
  },
  hero: {
    selectedHero: null,
    unlockedHeroes: [],
  },
  combat: {
    units: [],
    buildings: [],
    activeEffects: [],
  },
  resources: {
    food: 100,
    gold: 200,
    army: 50,
    foodCap: 1000,
    goldCap: 2000,
    armyCap: 500,
    generation: {
      foodPerSecond: 1,
      goldPerSecond: 2,
      armyPerSecond: 0.1,
    },
  },
  collection: {
    heroes: [],
    items: [],
    completionPercentage: 0,
  },
  profile: {
    name: 'Test Player',
    rank: 'Soldier',
    level: 5,
    experience: 500,
    wins: 10,
    losses: 5,
    achievements: [],
    statistics: {
      totalPlayTime: 3600,
      unitsDefeated: 100,
      resourcesGathered: 5000,
      quizzesCompleted: 10,
    },
  },
  research: {
    completed: [],
    inProgress: null,
    progress: 0,
    available: [],
  },
  quiz: {
    questionsAnswered: 10,
    correctAnswers: 8,
    completedCategories: [],
    rewards: [],
  },
};

/**
 * Helper: creates a mock provider with in-memory storage that persists data across sync/load
 */
function createPersistentMockProvider() {
  const storage = new Map<string, string>();
  return {
    isAuthenticated: vi.fn().mockResolvedValue(true),
    getUserId: vi.fn().mockResolvedValue('user-123'),
    uploadSave: vi.fn().mockImplementation(async (userId: string, data: string) => {
      storage.set(userId, data);
      return `cloud-save-${userId}-${Date.now()}`;
    }),
    downloadSave: vi.fn().mockImplementation(async (userId: string) => {
      return storage.get(userId) || null;
    }),
    deleteSave: vi.fn().mockImplementation(async (userId: string) => {
      storage.delete(userId);
    }),
    getMetadata: vi.fn().mockResolvedValue(null),
  };
}

describe('Cloud Save System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to a fresh persistent mock provider before each test
    setCloudStorageProvider(createPersistentMockProvider());
  });

  describe('syncToCloud', () => {
    it('should sync game state to cloud', async () => {
      const result = await syncToCloud(mockGameState);

      expect(result).toHaveProperty('cloudId');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('lastSyncedAt');
      expect(result).toHaveProperty('syncVersion');
      expect(result.slot).toBe(mockGameState.metadata.slot);
    });

    it('should throw AuthenticationError when not authenticated', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        getUserId: vi.fn(),
        uploadSave: vi.fn(),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn(),
      };

      setCloudStorageProvider(mockProvider);

      await expect(syncToCloud(mockGameState)).rejects.toThrow(AuthenticationError);
      expect(mockProvider.isAuthenticated).toHaveBeenCalled();
      expect(mockProvider.uploadSave).not.toHaveBeenCalled();
    });

    it('should encrypt data before uploading', async () => {
      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      await syncToCloud(mockGameState);

      expect(mockProvider.uploadSave).toHaveBeenCalled();
      const uploadedData = mockProvider.uploadSave.mock.calls[0][1];
      
      // Data should be encrypted (base64 encoded in our mock implementation)
      expect(typeof uploadedData).toBe('string');
      expect(uploadedData.length).toBeGreaterThan(0);
    });
  });

  describe('loadFromCloud', () => {
    it('should load and decrypt game state from cloud', async () => {
      // Use a persistent provider so sync data is available for load
      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      // First sync to cloud
      await syncToCloud(mockGameState);

      // Then load from cloud
      const loaded = await loadFromCloud();

      expect(loaded).toMatchObject({
        version: mockGameState.version,
        metadata: expect.objectContaining({
          playerName: mockGameState.metadata.playerName,
          level: mockGameState.metadata.level,
        }),
      });
    });

    it('should throw AuthenticationError when not authenticated', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        getUserId: vi.fn(),
        uploadSave: vi.fn(),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn(),
      };

      setCloudStorageProvider(mockProvider);

      await expect(loadFromCloud()).rejects.toThrow(AuthenticationError);
    });

    it('should throw CloudStorageError when no save exists', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        getUserId: vi.fn().mockResolvedValue('user-123'),
        uploadSave: vi.fn(),
        downloadSave: vi.fn().mockResolvedValue(null),
        deleteSave: vi.fn(),
        getMetadata: vi.fn(),
      };

      setCloudStorageProvider(mockProvider);

      await expect(loadFromCloud()).rejects.toThrow(CloudStorageError);
      await expect(loadFromCloud()).rejects.toThrow('No cloud save found');
    });
  });

  describe('getCloudMetadata', () => {
    it('should return null when not authenticated', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        getUserId: vi.fn(),
        uploadSave: vi.fn(),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn(),
      };

      setCloudStorageProvider(mockProvider);

      const metadata = await getCloudMetadata();
      expect(metadata).toBeNull();
    });

    it('should return metadata when available', async () => {
      const mockMetadata = {
        ...mockGameState.metadata,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      };

      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        getUserId: vi.fn().mockResolvedValue('user-456'),
        uploadSave: vi.fn(),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn().mockResolvedValue(mockMetadata),
      };

      setCloudStorageProvider(mockProvider);

      const metadata = await getCloudMetadata();
      expect(metadata).toEqual(mockMetadata);
    });
  });

  describe('deleteCloudSave', () => {
    it('should delete cloud save', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        getUserId: vi.fn().mockResolvedValue('user-123'),
        uploadSave: vi.fn(),
        downloadSave: vi.fn(),
        deleteSave: vi.fn().mockResolvedValue(undefined),
        getMetadata: vi.fn(),
      };

      setCloudStorageProvider(mockProvider);

      await deleteCloudSave();

      expect(mockProvider.deleteSave).toHaveBeenCalledWith('user-123');
    });

    it('should throw AuthenticationError when not authenticated', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(false),
        getUserId: vi.fn(),
        uploadSave: vi.fn(),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn(),
      };

      setCloudStorageProvider(mockProvider);

      await expect(deleteCloudSave()).rejects.toThrow(AuthenticationError);
    });
  });

  describe('detectSaveConflict', () => {
    it('should return null when timestamps match', () => {
      const timestamp = Date.now();
      const localMetadata = {
        ...mockGameState.metadata,
        timestamp,
      };
      const cloudMetadata = {
        ...localMetadata,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      };

      const conflict = detectSaveConflict(localMetadata, cloudMetadata);
      expect(conflict).toBeNull();
    });

    it('should detect conflict when timestamps differ', () => {
      const localMetadata = {
        ...mockGameState.metadata,
        timestamp: Date.now(),
      };
      const cloudMetadata = {
        ...mockGameState.metadata,
        timestamp: Date.now() - 10000, // 10 seconds earlier
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      };

      const conflict = detectSaveConflict(localMetadata, cloudMetadata);
      expect(conflict).not.toBeNull();
      expect(conflict?.localMetadata).toEqual(localMetadata);
      expect(conflict?.cloudMetadata).toEqual(cloudMetadata);
    });
  });

  describe('resolveConflict', () => {
    const localMetadata = {
      ...mockGameState.metadata,
      timestamp: Date.now(),
      progress: 60,
    };

    const cloudMetadata = {
      ...mockGameState.metadata,
      timestamp: Date.now() - 10000,
      progress: 50,
      cloudId: 'cloud-123',
      userId: 'user-456',
      lastSyncedAt: Date.now(),
      syncVersion: 1,
    };

    const conflict = {
      localMetadata,
      cloudMetadata,
    };

    it('should resolve with USE_LOCAL strategy', async () => {
      // resolveConflict(USE_LOCAL) calls syncToCloud internally, so we need a persistent provider
      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      const result = await resolveConflict(
        conflict,
        ConflictResolution.USE_LOCAL,
        mockGameState
      );

      expect(result).toEqual(mockGameState);
    });

    it('should resolve with USE_CLOUD strategy', async () => {
      // Need a persistent provider so sync then load works
      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      // First sync a state to cloud
      await syncToCloud(mockGameState);

      const result = await resolveConflict(
        conflict,
        ConflictResolution.USE_CLOUD
      );

      expect(result).toBeDefined();
      expect(result.version).toBe(mockGameState.version);
    });

    it('should resolve with MERGE strategy using higher progress', async () => {
      // resolveConflict(MERGE) calls syncToCloud internally
      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      const localState = {
        ...mockGameState,
        metadata: { ...mockGameState.metadata, progress: 60 },
      };
      const cloudState = {
        ...mockGameState,
        metadata: { ...mockGameState.metadata, progress: 50 },
      };

      const result = await resolveConflict(
        conflict,
        ConflictResolution.MERGE,
        localState,
        cloudState
      );

      // Should use local state since it has higher progress
      expect(result.metadata.progress).toBe(60);
    });

    it('should throw error with CANCEL strategy', async () => {
      await expect(
        resolveConflict(conflict, ConflictResolution.CANCEL)
      ).rejects.toThrow(CloudStorageError);
    });
  });

  describe('syncWithConflictDetection', () => {
    it('should sync without conflict when no cloud save exists', async () => {
      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        getUserId: vi.fn().mockResolvedValue('user-123'),
        uploadSave: vi.fn().mockResolvedValue('cloud-id-123'),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn().mockResolvedValue(null),
      };

      setCloudStorageProvider(mockProvider);

      const result = await syncWithConflictDetection(mockGameState);

      expect(result.hadConflict).toBe(false);
      expect(result.state).toEqual(mockGameState);
    });

    it('should auto-resolve conflicts when enabled', async () => {
      // Create a persistent provider that has cloud data and returns conflicting metadata
      const storage = new Map<string, string>();
      const cloudMetadata = {
        ...mockGameState.metadata,
        timestamp: Date.now() - 10000,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      };

      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        getUserId: vi.fn().mockResolvedValue('user-456'),
        uploadSave: vi.fn().mockImplementation(async (userId: string, data: string) => {
          storage.set(userId, data);
          return 'cloud-id-123';
        }),
        downloadSave: vi.fn().mockImplementation(async (userId: string) => {
          return storage.get(userId) || null;
        }),
        deleteSave: vi.fn(),
        getMetadata: vi.fn().mockResolvedValue(cloudMetadata),
      };

      setCloudStorageProvider(mockProvider);

      // First sync to create cloud save data that can be loaded
      await syncToCloud(mockGameState);

      const result = await syncWithConflictDetection(mockGameState, true);

      expect(result.hadConflict).toBe(true);
      expect(result.state).toBeDefined();
    });

    it('should throw SyncConflictError when conflict exists and auto-resolve is disabled', async () => {
      const cloudMetadata = {
        ...mockGameState.metadata,
        timestamp: Date.now() - 10000,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      };

      const mockProvider = {
        isAuthenticated: vi.fn().mockResolvedValue(true),
        getUserId: vi.fn().mockResolvedValue('user-456'),
        uploadSave: vi.fn().mockResolvedValue('cloud-id-123'),
        downloadSave: vi.fn(),
        deleteSave: vi.fn(),
        getMetadata: vi.fn().mockResolvedValue(cloudMetadata),
      };

      setCloudStorageProvider(mockProvider);

      await expect(
        syncWithConflictDetection(mockGameState, false)
      ).rejects.toThrow(SyncConflictError);
    });
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOnline()).toBe(false);
    });
  });

  describe('waitForOnline', () => {
    it('should resolve immediately when already online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const start = Date.now();
      await waitForOnline();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should wait for online event when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const promise = waitForOnline();

      // Simulate going online after a delay
      setTimeout(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      }, 100);

      await promise;
      expect(isOnline()).toBe(true);
    });
  });

  describe('syncWhenOnline', () => {
    it('should sync immediately when online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      await syncWhenOnline(mockGameState);

      // Should have called uploadSave
      expect(mockProvider.uploadSave).toHaveBeenCalled();
    });

    it('should wait for connection before syncing when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const mockProvider = createPersistentMockProvider();
      setCloudStorageProvider(mockProvider);

      const promise = syncWhenOnline(mockGameState);

      // Simulate going online
      setTimeout(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      }, 100);

      await promise;

      // Should have called uploadSave after going online
      expect(mockProvider.uploadSave).toHaveBeenCalled();
    });
  });
});
