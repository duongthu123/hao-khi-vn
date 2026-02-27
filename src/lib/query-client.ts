import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 * **Implements: Requirements 25.1, 25.2, 25.5, 25.7**
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for this duration
      gcTime: 1000 * 60 * 10, // 10 minutes - cache persists for this duration (formerly cacheTime)
      
      // Retry configuration for failed requests
      // **Implements: Requirement 25.5 - Configure retry logic**
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof Error && error.name === 'AuthenticationError') {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, capped at 30s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
      
      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      // Retry configuration for mutations
      // **Implements: Requirement 25.5 - Configure retry logic**
      retry: (failureCount, error) => {
        // Don't retry on authentication or conflict errors
        if (error instanceof Error) {
          if (
            error.name === 'AuthenticationError' ||
            error.name === 'SyncConflictError'
          ) {
            return false;
          }
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff for mutations
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
  },
});
