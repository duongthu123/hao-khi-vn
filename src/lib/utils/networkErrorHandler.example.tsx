'use client';

/**
 * Network Error Handler Usage Examples
 * 
 * Demonstrates various use cases for network error handling
 */

import { useState } from 'react';
import { useNetworkError, useOnlineStatus, useOnlineCallback } from '@/hooks/useNetworkError';
import { NetworkErrorAlert, NetworkStatusIndicator } from '@/components/ui/NetworkErrorAlert';
import { withRetry } from '@/lib/utils/networkErrorHandler';

/**
 * Example 1: Basic Save Button with Network Error Handling
 */
export function SaveButtonExample() {
  const { 
    executeWithRetry, 
    error, 
    isRetrying, 
    retry, 
    clearError,
    isOnline 
  } = useNetworkError({
    retryConfig: { maxRetries: 3 },
  });

  const handleSave = async () => {
    try {
      await executeWithRetry(async () => {
        const response = await fetch('/api/save', {
          method: 'POST',
          body: JSON.stringify({ data: 'game state' }),
        });
        
        if (!response.ok) throw response;
        return response.json();
      });
      
      alert('Lưu thành công!');
    } catch (err) {
      // Error is already stored in state
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSave}
        disabled={isRetrying || !isOnline}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isRetrying ? 'Đang lưu...' : 'Lưu Game'}
      </button>
      
      {!isOnline && (
        <p className="text-amber-600">
          Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.
        </p>
      )}
      
      {error && (
        <NetworkErrorAlert 
          error={error} 
          onRetry={retry} 
          onDismiss={clearError} 
        />
      )}
    </div>
  );
}

/**
 * Example 2: Cloud Sync with Auto-Retry on Reconnect
 */
export function CloudSyncExample() {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  const syncData = async () => {
    setIsSyncing(true);
    try {
      await withRetry(
        async () => {
          const response = await fetch('/api/sync', { method: 'POST' });
          if (!response.ok) throw response;
          return response.json();
        },
        {
          retryConfig: { maxRetries: 3 },
          context: { component: 'CloudSync', action: 'sync' },
        }
      );
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when coming back online
  useOnlineCallback(() => {
    console.log('Back online, syncing...');
    syncData();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
      </div>
      
      {lastSyncTime && (
        <p className="text-sm text-gray-600">
          Đồng bộ lần cuối: {lastSyncTime.toLocaleTimeString('vi-VN')}
        </p>
      )}
      
      <button
        onClick={syncData}
        disabled={isSyncing || !isOnline}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
      </button>
    </div>
  );
}

/**
 * Example 3: Load Game with Error Handling
 */
export function LoadGameExample() {
  const [gameData, setGameData] = useState<any>(null);
  const { 
    executeWithRetry, 
    error, 
    isRetrying, 
    retry, 
    clearError 
  } = useNetworkError({
    retryConfig: {
      maxRetries: 3,
      initialDelay: 1000,
    },
    onRetry: (attempt) => {
      console.log(`Đang thử lại... Lần thử ${attempt}`);
    },
  });

  const loadGame = async (saveId: string) => {
    try {
      const data = await executeWithRetry(async () => {
        const response = await fetch(`/api/saves/${saveId}`);
        if (!response.ok) throw response;
        return response.json();
      });
      
      setGameData(data);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((slot) => (
          <button
            key={slot}
            onClick={() => loadGame(`save-${slot}`)}
            disabled={isRetrying}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Slot {slot}
          </button>
        ))}
      </div>
      
      {isRetrying && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span>Đang tải...</span>
        </div>
      )}
      
      {error && (
        <NetworkErrorAlert 
          error={error} 
          onRetry={retry} 
          onDismiss={clearError} 
        />
      )}
      
      {gameData && (
        <div className="p-4 bg-green-100 rounded">
          <p>Tải game thành công!</p>
          <pre className="text-xs mt-2">{JSON.stringify(gameData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Multiple Operations with Shared Error State
 */
export function MultiOperationExample() {
  const { 
    executeWithRetry, 
    error, 
    isRetrying, 
    retry, 
    clearError,
    retryCount 
  } = useNetworkError({
    retryConfig: { maxRetries: 3 },
  });

  const operations = {
    save: async () => {
      await executeWithRetry(async () => {
        const response = await fetch('/api/save', { method: 'POST' });
        if (!response.ok) throw response;
        return response.json();
      });
    },
    load: async () => {
      await executeWithRetry(async () => {
        const response = await fetch('/api/load');
        if (!response.ok) throw response;
        return response.json();
      });
    },
    delete: async () => {
      await executeWithRetry(async () => {
        const response = await fetch('/api/delete', { method: 'DELETE' });
        if (!response.ok) throw response;
        return response.json();
      });
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={operations.save}
          disabled={isRetrying}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Lưu
        </button>
        <button
          onClick={operations.load}
          disabled={isRetrying}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Tải
        </button>
        <button
          onClick={operations.delete}
          disabled={isRetrying}
          className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
        >
          Xóa
        </button>
      </div>
      
      {isRetrying && (
        <div className="text-sm text-gray-600">
          Đang thử lại... (Lần {retryCount})
        </div>
      )}
      
      {error && (
        <NetworkErrorAlert 
          error={error} 
          onRetry={retry} 
          onDismiss={clearError} 
        />
      )}
    </div>
  );
}

/**
 * Example 5: App with Global Network Status Indicator
 */
export function AppWithNetworkIndicator({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <NetworkStatusIndicator />
    </div>
  );
}

/**
 * Example 6: Custom Retry Logic
 */
export function CustomRetryExample() {
  const { 
    executeWithRetry, 
    error, 
    isRetrying, 
    clearError 
  } = useNetworkError();

  const saveWithCustomRetry = async () => {
    try {
      await executeWithRetry(
        async () => {
          const response = await fetch('/api/save', { method: 'POST' });
          if (!response.ok) throw response;
          return response.json();
        },
        {
          retryConfig: {
            maxRetries: 5,
            initialDelay: 500,
            maxDelay: 5000,
            backoffMultiplier: 1.5,
          },
          onRetry: (attempt, error) => {
            console.log(`Retry ${attempt}: ${error.type}`);
          },
          onMaxRetriesReached: (error) => {
            console.error('Max retries reached:', error);
            alert('Không thể lưu sau nhiều lần thử. Vui lòng thử lại sau.');
          },
          context: {
            component: 'CustomRetryExample',
            action: 'save',
          },
        }
      );
    } catch (err) {
      // Error handled
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={saveWithCustomRetry}
        disabled={isRetrying}
        className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
      >
        {isRetrying ? 'Đang lưu...' : 'Lưu với Retry Tùy Chỉnh'}
      </button>
      
      {error && (
        <NetworkErrorAlert 
          error={error} 
          onDismiss={clearError} 
        />
      )}
    </div>
  );
}

/**
 * Example 7: Offline Mode with Queue
 */
export function OfflineQueueExample() {
  const [queue, setQueue] = useState<string[]>([]);
  const isOnline = useOnlineStatus();

  const addToQueue = (operation: string) => {
    setQueue(prev => [...prev, operation]);
  };

  const processQueue = async () => {
    for (const operation of queue) {
      try {
        await withRetry(
          async () => {
            const response = await fetch('/api/operation', {
              method: 'POST',
              body: JSON.stringify({ operation }),
            });
            if (!response.ok) throw response;
            return response.json();
          },
          { retryConfig: { maxRetries: 3 } }
        );
        
        // Remove from queue on success
        setQueue(prev => prev.filter(op => op !== operation));
      } catch (error) {
        console.error('Failed to process:', operation);
        break; // Stop processing on error
      }
    }
  };

  // Auto-process queue when coming back online
  useOnlineCallback(() => {
    if (queue.length > 0) {
      console.log('Processing queued operations...');
      processQueue();
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
      </div>
      
      {queue.length > 0 && (
        <div className="p-4 bg-amber-100 rounded">
          <p className="font-medium">Hàng đợi: {queue.length} thao tác</p>
          <ul className="text-sm mt-2 space-y-1">
            {queue.map((op, i) => (
              <li key={i}>• {op}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={() => addToQueue(`Operation ${Date.now()}`)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Thêm Thao Tác
      </button>
      
      {isOnline && queue.length > 0 && (
        <button
          onClick={processQueue}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Xử Lý Hàng Đợi
        </button>
      )}
    </div>
  );
}
