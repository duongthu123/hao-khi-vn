/**
 * React Query hooks for cloud save operations
 * **Implements: Requirements 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7**
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GameState } from '@/schemas/save.schema';
import {
  syncToCloud,
  loadFromCloud,
  getCloudMetadata,
  deleteCloudSave,
  syncWithConflictDetection,
  isCloudAuthenticatedAsync,
  CloudSaveMetadata,
  SyncConflictError,
  CloudSaveConflict,
} from '@/lib/saves/cloud';
import { ConflictResolution } from '@/types/save';

/**
 * Query keys for cloud save operations
 */
export const cloudSaveKeys = {
  all: ['cloudSave'] as const,
  metadata: () => [...cloudSaveKeys.all, 'metadata'] as const,
  data: () => [...cloudSaveKeys.all, 'data'] as const,
  auth: () => [...cloudSaveKeys.all, 'auth'] as const,
};

/**
 * Hook to check cloud authentication status
 * **Implements: Requirement 25.1 - Use React Query for cloud saves**
 */
export function useCloudAuth() {
  return useQuery({
    queryKey: cloudSaveKeys.auth(),
    queryFn: isCloudAuthenticatedAsync,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to load cloud save metadata
 * **Implements: Requirement 25.1 - Create queries for loading cloud saves**
 */
export function useCloudMetadata() {
  return useQuery({
    queryKey: cloudSaveKeys.metadata(),
    queryFn: getCloudMetadata,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: true, // Always enabled, will return null if not authenticated
  });
}

/**
 * Hook to load full cloud save data
 * **Implements: Requirement 25.1 - Create queries for loading cloud saves**
 */
export function useCloudSave(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cloudSaveKeys.data(),
    queryFn: loadFromCloud,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled: options?.enabled ?? false, // Disabled by default, enable when needed
  });
}

/**
 * Hook to sync save to cloud
 * **Implements: Requirement 25.2 - Create mutations for saving to cloud**
 * **Implements: Requirement 25.4 - Add optimistic updates for better UX**
 * **Implements: Requirement 25.5 - Configure retry logic for failed requests**
 */
export function useSyncToCloud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncToCloud,
    
    // Optimistic update
    onMutate: async (newState: GameState) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cloudSaveKeys.data() });
      await queryClient.cancelQueries({ queryKey: cloudSaveKeys.metadata() });

      // Snapshot previous values
      const previousData = queryClient.getQueryData<GameState>(cloudSaveKeys.data());
      const previousMetadata = queryClient.getQueryData<CloudSaveMetadata>(
        cloudSaveKeys.metadata()
      );

      // Optimistically update cache
      queryClient.setQueryData(cloudSaveKeys.data(), newState);
      queryClient.setQueryData(cloudSaveKeys.metadata(), {
        ...newState.metadata,
        lastSyncedAt: Date.now(),
      });

      return { previousData, previousMetadata };
    },

    // Rollback on error
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cloudSaveKeys.data(), context.previousData);
      }
      if (context?.previousMetadata) {
        queryClient.setQueryData(cloudSaveKeys.metadata(), context.previousMetadata);
      }
    },

    // Invalidate and refetch on success
    onSuccess: (data) => {
      queryClient.setQueryData(cloudSaveKeys.metadata(), data);
      queryClient.invalidateQueries({ queryKey: cloudSaveKeys.all });
    },

    // Retry configuration
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to sync with conflict detection
 * **Implements: Requirement 25.2 - Create mutations for saving to cloud**
 * **Implements: Requirement 25.5 - Configure retry logic for failed requests**
 */
export function useSyncWithConflictDetection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      state,
      autoResolve = false,
    }: {
      state: GameState;
      autoResolve?: boolean;
    }) => {
      return syncWithConflictDetection(state, autoResolve);
    },

    onSuccess: (result) => {
      // Update cache with resolved state
      queryClient.setQueryData(cloudSaveKeys.data(), result.state);
      queryClient.invalidateQueries({ queryKey: cloudSaveKeys.all });
    },

    retry: (failureCount, error) => {
      // Don't retry on conflict errors (need user input)
      if (error instanceof SyncConflictError) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to delete cloud save
 * **Implements: Requirement 25.2 - Create mutations for cloud operations**
 */
export function useDeleteCloudSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCloudSave,

    onSuccess: () => {
      // Invalidate all cloud save queries
      queryClient.invalidateQueries({ queryKey: cloudSaveKeys.all });
      
      // Clear cache
      queryClient.setQueryData(cloudSaveKeys.data(), null);
      queryClient.setQueryData(cloudSaveKeys.metadata(), null);
    },

    retry: 2,
  });
}

/**
 * Hook to resolve save conflict
 * **Implements: Requirement 25.2 - Create mutations for conflict resolution**
 */
export function useResolveConflict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conflict,
      resolution,
      localState,
      cloudState,
    }: {
      conflict: CloudSaveConflict;
      resolution: ConflictResolution;
      localState?: GameState;
      cloudState?: GameState;
    }) => {
      const { resolveConflict } = await import('@/lib/saves/cloud');
      return resolveConflict(conflict, resolution, localState, cloudState);
    },

    onSuccess: (resolvedState) => {
      // Update cache with resolved state
      queryClient.setQueryData(cloudSaveKeys.data(), resolvedState);
      queryClient.invalidateQueries({ queryKey: cloudSaveKeys.all });
    },

    retry: 2,
  });
}

/**
 * Hook to prefetch cloud save data
 * **Implements: Requirement 25.6 - Implement prefetching for anticipated actions**
 */
export function usePrefetchCloudSave() {
  const queryClient = useQueryClient();

  return {
    prefetchMetadata: () => {
      return queryClient.prefetchQuery({
        queryKey: cloudSaveKeys.metadata(),
        queryFn: getCloudMetadata,
        staleTime: 1000 * 60 * 2,
      });
    },
    prefetchData: () => {
      return queryClient.prefetchQuery({
        queryKey: cloudSaveKeys.data(),
        queryFn: loadFromCloud,
        staleTime: 1000 * 60 * 5,
      });
    },
  };
}

/**
 * Hook to invalidate cloud save queries
 * **Implements: Requirement 25.3 - Implement query invalidation for stale data**
 */
export function useInvalidateCloudSave() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      return queryClient.invalidateQueries({ queryKey: cloudSaveKeys.all });
    },
    invalidateMetadata: () => {
      return queryClient.invalidateQueries({ queryKey: cloudSaveKeys.metadata() });
    },
    invalidateData: () => {
      return queryClient.invalidateQueries({ queryKey: cloudSaveKeys.data() });
    },
  };
}

/**
 * Combined hook for cloud save operations
 * Provides all cloud save functionality in one hook
 */
export function useCloudSaveOperations() {
  const auth = useCloudAuth();
  const metadata = useCloudMetadata();
  const syncMutation = useSyncToCloud();
  const syncWithConflict = useSyncWithConflictDetection();
  const deleteMutation = useDeleteCloudSave();
  const resolveConflictMutation = useResolveConflict();
  const prefetch = usePrefetchCloudSave();
  const invalidate = useInvalidateCloudSave();

  return {
    // Auth
    isAuthenticated: auth.data ?? false,
    isCheckingAuth: auth.isLoading,
    authError: auth.error,

    // Metadata
    metadata: metadata.data,
    isLoadingMetadata: metadata.isLoading,
    metadataError: metadata.error,

    // Mutations
    syncToCloud: syncMutation.mutate,
    syncToCloudAsync: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,

    syncWithConflictDetection: syncWithConflict.mutate,
    syncWithConflictDetectionAsync: syncWithConflict.mutateAsync,
    isSyncingWithConflict: syncWithConflict.isPending,
    syncConflictError: syncWithConflict.error,

    deleteCloudSave: deleteMutation.mutate,
    deleteCloudSaveAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    resolveConflict: resolveConflictMutation.mutate,
    resolveConflictAsync: resolveConflictMutation.mutateAsync,
    isResolvingConflict: resolveConflictMutation.isPending,
    resolveError: resolveConflictMutation.error,

    // Utilities
    prefetch,
    invalidate,
  };
}
