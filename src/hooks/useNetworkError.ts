'use client';

/**
 * useNetworkError Hook
 * 
 * Custom hook for handling network errors with retry logic
 * Provides state management for network errors and online/offline status
 * 
 * Validates: Requirements 23.8
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type NetworkError,
  type NetworkErrorHandlerOptions,
  withRetry,
  getNetworkErrorHandler,
  isOffline as checkOffline,
} from '@/lib/utils/networkErrorHandler';

export interface UseNetworkErrorOptions {
  retryConfig?: NetworkErrorHandlerOptions['retryConfig'];
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
  autoRetry?: boolean;
}

export interface UseNetworkErrorReturn {
  error: NetworkError | null;
  isOnline: boolean;
  isRetrying: boolean;
  retryCount: number;
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    options?: NetworkErrorHandlerOptions
  ) => Promise<T>;
  retry: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing network errors with retry logic
 * 
 * @example
 * ```typescript
 * function SaveButton() {
 *   const { executeWithRetry, error, isRetrying, retry, clearError } = useNetworkError({
 *     retryConfig: { maxRetries: 3 },
 *     onRetry: (attempt) => console.log(`Retry ${attempt}`),
 *   });
 * 
 *   const handleSave = async () => {
 *     try {
 *       await executeWithRetry(async () => {
 *         const response = await fetch('/api/save', { method: 'POST' });
 *         if (!response.ok) throw response;
 *         return response.json();
 *       });
 *     } catch (err) {
 *       // Error is already stored in state
 *     }
 *   };
 * 
 *   return (
 *     <>
 *       <button onClick={handleSave} disabled={isRetrying}>
 *         {isRetrying ? 'Đang lưu...' : 'Lưu'}
 *       </button>
 *       {error && <NetworkErrorAlert error={error} onRetry={retry} onDismiss={clearError} />}
 *     </>
 *   );
 * }
 * ```
 */
export function useNetworkError(
  options: UseNetworkErrorOptions = {}
): UseNetworkErrorReturn {
  const [error, setError] = useState<NetworkError | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const lastOperationRef = useRef<(() => Promise<unknown>) | null>(null);
  const networkHandler = useRef(getNetworkErrorHandler());

  // Subscribe to online/offline status
  useEffect(() => {
    const unsubscribe = networkHandler.current.subscribe((online) => {
      setIsOnline(online);
      
      // Clear error when coming back online
      if (online && error?.type === 'offline') {
        setError(null);
      }
    });

    return unsubscribe;
  }, [error]);

  /**
   * Execute an operation with retry logic
   */
  const executeWithRetry = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      executeOptions?: NetworkErrorHandlerOptions
    ): Promise<T> => {
      // Store operation for manual retry
      lastOperationRef.current = operation as () => Promise<unknown>;
      
      setIsRetrying(true);
      setError(null);
      setRetryCount(0);

      try {
        const result = await withRetry(operation, {
          retryConfig: options.retryConfig,
          ...executeOptions,
          onRetry: (attempt, err) => {
            setRetryCount(attempt);
            if (options.onRetry) {
              options.onRetry(attempt);
            }
            if (executeOptions?.onRetry) {
              executeOptions.onRetry(attempt, err);
            }
          },
          onMaxRetriesReached: (err) => {
            setError(err);
            if (options.onMaxRetriesReached) {
              options.onMaxRetriesReached();
            }
            if (executeOptions?.onMaxRetriesReached) {
              executeOptions.onMaxRetriesReached(err);
            }
          },
        });

        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        setIsRetrying(false);
        setError(err as NetworkError);
        throw err;
      }
    },
    [options]
  );

  /**
   * Manually retry the last operation
   */
  const retry = useCallback(async () => {
    if (!lastOperationRef.current) {
      console.warn('No operation to retry');
      return;
    }

    try {
      await executeWithRetry(lastOperationRef.current as () => Promise<unknown>);
    } catch (err) {
      // Error is already handled in executeWithRetry
    }
  }, [executeWithRetry]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    error,
    isOnline,
    isRetrying,
    retryCount,
    executeWithRetry,
    retry,
    clearError,
  };
}

/**
 * Hook for monitoring online/offline status
 * 
 * @example
 * ```typescript
 * function App() {
 *   const isOnline = useOnlineStatus();
 *   
 *   return (
 *     <div>
 *       {!isOnline && <div>Bạn đang ngoại tuyến</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  const networkHandler = useRef(getNetworkErrorHandler());

  useEffect(() => {
    const unsubscribe = networkHandler.current.subscribe(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

/**
 * Hook for detecting when the app comes back online
 * Useful for triggering sync operations
 * 
 * @example
 * ```typescript
 * function SyncManager() {
 *   useOnlineCallback(() => {
 *     console.log('Back online, syncing...');
 *     syncData();
 *   });
 * }
 * ```
 */
export function useOnlineCallback(callback: () => void): void {
  const callbackRef = useRef(callback);
  const networkHandler = useRef(getNetworkErrorHandler());
  const wasOfflineRef = useRef(false);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = networkHandler.current.subscribe((isOnline) => {
      // Trigger callback when transitioning from offline to online
      if (isOnline && wasOfflineRef.current) {
        callbackRef.current();
      }
      wasOfflineRef.current = !isOnline;
    });

    return unsubscribe;
  }, []);
}

/**
 * Hook for checking if currently offline
 * Simple wrapper around isOffline for React components
 */
export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(checkOffline());

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return offline;
}
