# Network Error Handler

Comprehensive network error handling system with retry logic, offline detection, and Vietnamese error messages.

## Features

- **Network Error Detection**: Automatically detects and categorizes network errors
- **Retry Logic**: Exponential backoff retry mechanism for transient failures
- **Offline Mode Detection**: Real-time monitoring of online/offline status
- **Vietnamese Error Messages**: User-friendly error messages in Vietnamese
- **Type Safety**: Full TypeScript support with detailed error types
- **Integration**: Works seamlessly with error logging system

## Validates

- **Requirement 23.8**: WHEN network requests fail, THE Game_Application SHALL display retry options

## Usage

### Basic Error Handling with Retry

```typescript
import { withRetry } from '@/lib/utils/networkErrorHandler';

async function saveToCloud(data: GameState) {
  try {
    const result = await withRetry(
      async () => {
        const response = await fetch('/api/save', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw response;
        return response.json();
      },
      {
        retryConfig: {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        onRetry: (attempt) => {
          console.log(`Retry attempt ${attempt}`);
        },
        context: {
          component: 'SaveSystem',
          action: 'cloudSave',
        },
      }
    );
    
    return result;
  } catch (error) {
    // Handle final error after retries exhausted
    console.error('Save failed:', error);
  }
}
```

### Using the React Hook

```typescript
import { useNetworkError } from '@/hooks/useNetworkError';
import { NetworkErrorAlert } from '@/components/ui/NetworkErrorAlert';

function SaveButton() {
  const { 
    executeWithRetry, 
    error, 
    isRetrying, 
    retry, 
    clearError,
    isOnline 
  } = useNetworkError({
    retryConfig: { maxRetries: 3 },
    onRetry: (attempt) => console.log(`Retry ${attempt}`),
  });

  const handleSave = async () => {
    try {
      await executeWithRetry(async () => {
        const response = await fetch('/api/save', { method: 'POST' });
        if (!response.ok) throw response;
        return response.json();
      });
      
      // Success!
      console.log('Saved successfully');
    } catch (err) {
      // Error is already stored in state
    }
  };

  return (
    <div>
      <button onClick={handleSave} disabled={isRetrying || !isOnline}>
        {isRetrying ? 'Đang lưu...' : 'Lưu'}
      </button>
      
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
```

### Monitoring Online/Offline Status

```typescript
import { useOnlineStatus, useOnlineCallback } from '@/hooks/useNetworkError';

function App() {
  const isOnline = useOnlineStatus();
  
  // Trigger sync when coming back online
  useOnlineCallback(() => {
    console.log('Back online, syncing...');
    syncData();
  });

  return (
    <div>
      {!isOnline && (
        <div className="offline-banner">
          Bạn đang ngoại tuyến
        </div>
      )}
    </div>
  );
}
```

### Creating Network Errors

```typescript
import { createNetworkError, getErrorMessage } from '@/lib/utils/networkErrorHandler';

try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw createNetworkError(response);
  }
} catch (error) {
  const networkError = createNetworkError(error);
  console.log(networkError.type); // 'server_error', 'timeout', etc.
  console.log(networkError.retryable); // true/false
  console.log(getErrorMessage(networkError)); // Vietnamese message
}
```

## Error Types

The system recognizes the following error types:

| Type | Description | Retryable | Vietnamese Message |
|------|-------------|-----------|-------------------|
| `offline` | No network connection | ✅ Yes | Không có kết nối mạng |
| `timeout` | Request timed out (408, 504) | ✅ Yes | Yêu cầu hết thời gian chờ |
| `server_error` | Server error (500+) | ✅ Yes | Lỗi máy chủ |
| `rate_limit` | Too many requests (429) | ✅ Yes | Quá nhiều yêu cầu |
| `not_found` | Resource not found (404) | ❌ No | Không tìm thấy tài nguyên |
| `unauthorized` | Authentication required (401) | ❌ No | Bạn cần đăng nhập |
| `forbidden` | Access denied (403) | ❌ No | Bạn không có quyền truy cập |
| `unknown` | Unknown error | ❌ No | Đã xảy ra lỗi không xác định |

## Retry Configuration

```typescript
interface RetryConfig {
  maxRetries: number;           // Maximum number of retry attempts (default: 3)
  initialDelay: number;          // Initial delay in ms (default: 1000)
  maxDelay: number;              // Maximum delay in ms (default: 10000)
  backoffMultiplier: number;     // Exponential backoff multiplier (default: 2)
  retryableErrors: NetworkErrorType[]; // Which errors to retry
}
```

### Exponential Backoff

The retry delay increases exponentially:
- Attempt 1: `initialDelay` (1s)
- Attempt 2: `initialDelay * backoffMultiplier` (2s)
- Attempt 3: `initialDelay * backoffMultiplier²` (4s)
- Capped at `maxDelay` (10s)

## Components

### NetworkErrorAlert

Displays network errors with retry options:

```typescript
<NetworkErrorAlert
  error={error}
  onRetry={() => retry()}
  onDismiss={() => clearError()}
  showOfflineIndicator={true}
  className="my-4"
/>
```

### NetworkStatusIndicator

Small indicator shown when offline:

```typescript
<NetworkStatusIndicator />
```

## Hooks

### useNetworkError

Main hook for network error handling:

```typescript
const {
  error,              // Current error or null
  isOnline,           // Online status
  isRetrying,         // Whether currently retrying
  retryCount,         // Current retry attempt
  executeWithRetry,   // Execute operation with retry
  retry,              // Manually retry last operation
  clearError,         // Clear current error
} = useNetworkError(options);
```

### useOnlineStatus

Simple hook for online status:

```typescript
const isOnline = useOnlineStatus();
```

### useOnlineCallback

Execute callback when coming back online:

```typescript
useOnlineCallback(() => {
  syncData();
});
```

### useIsOffline

Check if currently offline:

```typescript
const offline = useIsOffline();
```

## Integration with Error Logger

Network errors are automatically logged to the error logging system:

```typescript
import { logError } from '@/lib/utils/errorLogger';

// Network errors are logged with context
withRetry(operation, {
  context: {
    component: 'SaveSystem',
    action: 'cloudSave',
    userId: user.id,
  },
});
```

## Best Practices

1. **Use Appropriate Retry Config**: Adjust retry settings based on operation criticality
2. **Provide Context**: Always include component and action context for debugging
3. **Handle Final Errors**: Always have a catch block for when retries are exhausted
4. **Show User Feedback**: Use NetworkErrorAlert to inform users of errors
5. **Monitor Online Status**: Disable network operations when offline
6. **Sync on Reconnect**: Use useOnlineCallback to sync when coming back online

## Example: Complete Save System Integration

```typescript
import { useNetworkError } from '@/hooks/useNetworkError';
import { NetworkErrorAlert } from '@/components/ui/NetworkErrorAlert';
import { logError } from '@/lib/utils/errorLogger';

function SaveLoadMenu() {
  const { 
    executeWithRetry, 
    error, 
    isRetrying, 
    retry, 
    clearError,
    isOnline 
  } = useNetworkError({
    retryConfig: {
      maxRetries: 3,
      initialDelay: 1000,
    },
    onRetry: (attempt) => {
      console.log(`Retrying save... Attempt ${attempt}`);
    },
    onMaxRetriesReached: () => {
      console.error('Failed to save after maximum retries');
    },
  });

  const handleCloudSave = async (saveData: GameState) => {
    try {
      const result = await executeWithRetry(
        async () => {
          const response = await fetch('/api/saves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saveData),
          });
          
          if (!response.ok) throw response;
          return response.json();
        },
        {
          context: {
            component: 'SaveLoadMenu',
            action: 'cloudSave',
            saveSlot: saveData.metadata.slot,
          },
        }
      );
      
      console.log('Save successful:', result);
      // Show success notification
    } catch (err) {
      // Error is already in state and logged
      logError(err as Error, {
        component: 'SaveLoadMenu',
        action: 'cloudSave',
      }, 'high');
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleCloudSave(gameState)} 
        disabled={isRetrying || !isOnline}
      >
        {isRetrying ? 'Đang lưu...' : 'Lưu lên Cloud'}
      </button>
      
      {!isOnline && (
        <div className="text-amber-600">
          Không có kết nối mạng. Lưu cloud không khả dụng.
        </div>
      )}
      
      {error && (
        <NetworkErrorAlert 
          error={error} 
          onRetry={retry} 
          onDismiss={clearError}
          showOfflineIndicator={true}
        />
      )}
    </div>
  );
}
```

## Testing

The network error handler includes comprehensive tests:

```bash
npm run test src/lib/utils/__tests__/networkErrorHandler.test.ts
npm run test src/components/ui/__tests__/NetworkErrorAlert.test.tsx
npm run test src/hooks/__tests__/useNetworkError.test.ts
```

## Related Files

- `src/lib/utils/networkErrorHandler.ts` - Core utility
- `src/components/ui/NetworkErrorAlert.tsx` - UI components
- `src/hooks/useNetworkError.ts` - React hooks
- `src/lib/utils/errorLogger.ts` - Error logging integration
