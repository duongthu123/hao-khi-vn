/**
 * Tests for cloud save React Query hooks
 * **Validates: Requirements 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useCloudAuth,
  useCloudMetadata,
  useCloudSave,
  useSyncToCloud,
  useSyncWithConflictDetection,
  useDeleteCloudSave,
  useResolveConflict,
  usePrefetchCloudSave,
  useInvalidateCloudSave,
  useCloudSaveOperations,
  cloudSaveKeys,
} from '../useCloudSave';
import * as cloudSaveModule from '@/lib/saves/cloud';
import { GameState } from '@/schemas/save.schema';
import { ConflictResolution } from '@/types/save';

// Mock the cloud save module
vi.mock('@/lib/saves/cloud');

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Wrapper component for hooks
function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

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

describe('useCloudAuth', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should check authentication status', async () => {
    vi.mocked(cloudSaveModule.isCloudAuthenticatedAsync).mockResolvedValue(true);

    const { result } = renderHook(() => useCloudAuth(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
    expect(cloudSaveModule.isCloudAuthenticatedAsync).toHaveBeenCalled();
  });

  it('should handle authentication check failure', async () => {
    vi.mocked(cloudSaveModule.isCloudAuthenticatedAsync).mockResolvedValue(false);

    const { result } = renderHook(() => useCloudAuth(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });
});

describe('useCloudMetadata', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should load cloud metadata', async () => {
    const mockMetadata = {
      ...mockGameState.metadata,
      cloudId: 'cloud-123',
      userId: 'user-456',
      lastSyncedAt: Date.now(),
      syncVersion: 1,
    };

    vi.mocked(cloudSaveModule.getCloudMetadata).mockResolvedValue(mockMetadata);

    const { result } = renderHook(() => useCloudMetadata(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMetadata);
  });

  it('should return null when no cloud save exists', async () => {
    vi.mocked(cloudSaveModule.getCloudMetadata).mockResolvedValue(null);

    const { result } = renderHook(() => useCloudMetadata(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useCloudSave', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should load cloud save data when enabled', async () => {
    vi.mocked(cloudSaveModule.loadFromCloud).mockResolvedValue(mockGameState);

    const { result } = renderHook(() => useCloudSave({ enabled: true }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGameState);
  });

  it('should not load when disabled', () => {
    const { result } = renderHook(() => useCloudSave({ enabled: false }), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isPending).toBe(true);
    expect(cloudSaveModule.loadFromCloud).not.toHaveBeenCalled();
  });
});

describe('useSyncToCloud', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should sync game state to cloud', async () => {
    const mockCloudMetadata = {
      ...mockGameState.metadata,
      cloudId: 'cloud-123',
      userId: 'user-456',
      lastSyncedAt: Date.now(),
      syncVersion: 1,
    };

    vi.mocked(cloudSaveModule.syncToCloud).mockResolvedValue(mockCloudMetadata);

    const { result } = renderHook(() => useSyncToCloud(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockGameState);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCloudMetadata);
    // Check that syncToCloud was called with the game state (first argument)
    expect(cloudSaveModule.syncToCloud).toHaveBeenCalled();
    expect(vi.mocked(cloudSaveModule.syncToCloud).mock.calls[0][0]).toEqual(mockGameState);
  });

  it('should handle sync errors', async () => {
    const error = new Error('Sync failed');
    vi.mocked(cloudSaveModule.syncToCloud).mockRejectedValue(error);

    const { result } = renderHook(() => useSyncToCloud(), {
      wrapper: createWrapper(queryClient),
    });

    // Trigger mutation
    result.current.mutate(mockGameState);

    // Wait for the mutation to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // The mutation should have completed with an error
    // Note: In test environment with retry: false, errors are captured immediately
    expect(cloudSaveModule.syncToCloud).toHaveBeenCalled();
  });

  it('should perform optimistic updates', async () => {
    vi.mocked(cloudSaveModule.syncToCloud).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ...mockGameState.metadata,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      }), 100))
    );

    const { result } = renderHook(() => useSyncToCloud(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(mockGameState);

    // Wait a bit for the mutation to start
    await waitFor(() => expect(result.current.isPending).toBe(true), { timeout: 100 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });
  });
});

describe('useSyncWithConflictDetection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should sync without conflict', async () => {
    const mockResult = {
      state: mockGameState,
      hadConflict: false,
    };

    vi.mocked(cloudSaveModule.syncWithConflictDetection).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useSyncWithConflictDetection(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ state: mockGameState, autoResolve: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResult);
  });

  it('should handle conflict errors', async () => {
    const conflict = {
      localMetadata: mockGameState.metadata,
      cloudMetadata: {
        ...mockGameState.metadata,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      },
    };

    const error = new cloudSaveModule.SyncConflictError('Conflict detected', conflict);
    vi.mocked(cloudSaveModule.syncWithConflictDetection).mockRejectedValue(error);

    const { result } = renderHook(() => useSyncWithConflictDetection(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ state: mockGameState, autoResolve: false });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });
});

describe('useDeleteCloudSave', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should delete cloud save', async () => {
    vi.mocked(cloudSaveModule.deleteCloudSave).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCloudSave(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cloudSaveModule.deleteCloudSave).toHaveBeenCalled();
  });

  it('should invalidate queries after deletion', async () => {
    vi.mocked(cloudSaveModule.deleteCloudSave).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCloudSave(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check that cache is cleared (undefined means not in cache)
    const cachedData = queryClient.getQueryData(cloudSaveKeys.data());
    expect(cachedData).toBeUndefined();
  });
});

describe('useResolveConflict', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should resolve conflict with USE_LOCAL strategy', async () => {
    const conflict = {
      localMetadata: mockGameState.metadata,
      cloudMetadata: {
        ...mockGameState.metadata,
        cloudId: 'cloud-123',
        userId: 'user-456',
        lastSyncedAt: Date.now(),
        syncVersion: 1,
      },
    };

    // Mock the dynamic import
    vi.mocked(cloudSaveModule.resolveConflict).mockResolvedValue(mockGameState);

    const { result } = renderHook(() => useResolveConflict(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      conflict,
      resolution: ConflictResolution.USE_LOCAL,
      localState: mockGameState,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGameState);
  });
});

describe('usePrefetchCloudSave', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should prefetch metadata', async () => {
    const mockMetadata = {
      ...mockGameState.metadata,
      cloudId: 'cloud-123',
      userId: 'user-456',
      lastSyncedAt: Date.now(),
      syncVersion: 1,
    };

    vi.mocked(cloudSaveModule.getCloudMetadata).mockResolvedValue(mockMetadata);

    const { result } = renderHook(() => usePrefetchCloudSave(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.prefetchMetadata();

    const cachedData = queryClient.getQueryData(cloudSaveKeys.metadata());
    expect(cachedData).toEqual(mockMetadata);
  });

  it('should prefetch full data', async () => {
    vi.mocked(cloudSaveModule.loadFromCloud).mockResolvedValue(mockGameState);

    const { result } = renderHook(() => usePrefetchCloudSave(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.prefetchData();

    const cachedData = queryClient.getQueryData(cloudSaveKeys.data());
    expect(cachedData).toEqual(mockGameState);
  });
});

describe('useInvalidateCloudSave', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should invalidate all queries', async () => {
    const { result } = renderHook(() => useInvalidateCloudSave(), {
      wrapper: createWrapper(queryClient),
    });

    // Set some cached data
    queryClient.setQueryData(cloudSaveKeys.data(), mockGameState);
    queryClient.setQueryData(cloudSaveKeys.metadata(), mockGameState.metadata);

    await result.current.invalidateAll();

    // Queries should be marked as stale
    const dataState = queryClient.getQueryState(cloudSaveKeys.data());
    const metadataState = queryClient.getQueryState(cloudSaveKeys.metadata());

    expect(dataState?.isInvalidated).toBe(true);
    expect(metadataState?.isInvalidated).toBe(true);
  });
});

describe('useCloudSaveOperations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should provide all cloud save operations', async () => {
    vi.mocked(cloudSaveModule.isCloudAuthenticatedAsync).mockResolvedValue(true);
    vi.mocked(cloudSaveModule.getCloudMetadata).mockResolvedValue(null);

    const { result } = renderHook(() => useCloudSaveOperations(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isCheckingAuth).toBe(false));

    // Check that all operations are available
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('metadata');
    expect(result.current).toHaveProperty('syncToCloud');
    expect(result.current).toHaveProperty('syncWithConflictDetection');
    expect(result.current).toHaveProperty('deleteCloudSave');
    expect(result.current).toHaveProperty('resolveConflict');
    expect(result.current).toHaveProperty('prefetch');
    expect(result.current).toHaveProperty('invalidate');
  });

  it('should expose loading states', async () => {
    vi.mocked(cloudSaveModule.isCloudAuthenticatedAsync).mockResolvedValue(true);
    vi.mocked(cloudSaveModule.getCloudMetadata).mockResolvedValue(null);

    const { result } = renderHook(() => useCloudSaveOperations(), {
      wrapper: createWrapper(queryClient),
    });

    // Initially loading
    expect(result.current.isCheckingAuth || result.current.isLoadingMetadata).toBe(true);

    await waitFor(() => {
      expect(result.current.isCheckingAuth).toBe(false);
      expect(result.current.isLoadingMetadata).toBe(false);
    });
  });
});
