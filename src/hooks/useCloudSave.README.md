# Cloud Save React Query Hooks

React Query hooks for managing cloud save operations with optimistic updates, retry logic, and conflict resolution.

**Implements: Requirements 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7**

## Features

- ✅ Authentication checking
- ✅ Cloud save metadata queries
- ✅ Full cloud save data loading
- ✅ Sync mutations with optimistic updates
- ✅ Conflict detection and resolution
- ✅ Automatic retry logic with exponential backoff
- ✅ Query invalidation for stale data
- ✅ Prefetching for anticipated actions
- ✅ Offline mode handling

## Installation

The hooks are already configured with the React Query client in `src/lib/query-client.ts`.

## Usage

### Basic Cloud Save Operations

```typescript
import { useCloudSaveOperations } from '@/hooks/useCloudSave';

function SaveLoadMenu() {
  const {
    isAuthenticated,
    metadata,
    syncToCloud,
    isSyncing,
    syncError,
  } = useCloudSaveOperations();

  const handleSave = () => {
    if (!isAuthenticated) {
      alert('Please sign in to use cloud saves');
      return;
    }

    syncToCloud(gameState);
  };

  return (
    <div>
      <button onClick={handleSave} disabled={isSyncing}>
        {isSyncing ? 'Saving...' : 'Save to Cloud'}
      </button>
      {syncError && <p>Error: {syncError.message}</p>}
      {metadata && (
        <p>Last synced: {new Date(metadata.lastSyncedAt).toLocaleString()}</p>
      )}
    </div>
  );
}
```

### Individual Hooks

#### useCloudAuth

Check if user is authenticated for cloud saves.

```typescript
import { useCloudAuth } from '@/hooks/useCloudSave';

function CloudSaveButton() {
  const { data: isAuthenticated, isLoading } = useCloudAuth();

  if (isLoading) return <div>Checking authentication...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <button>Save to Cloud</button>;
}
```

#### useCloudMetadata

Load cloud save metadata without loading full game state.

```typescript
import { useCloudMetadata } from '@/hooks/useCloudSave';

function CloudSaveInfo() {
  const { data: metadata, isLoading, error } = useCloudMetadata();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!metadata) return <div>No cloud save found</div>;

  return (
    <div>
      <p>Player: {metadata.playerName}</p>
      <p>Level: {metadata.level}</p>
      <p>Progress: {metadata.progress}%</p>
      <p>Last synced: {new Date(metadata.lastSyncedAt).toLocaleString()}</p>
    </div>
  );
}
```

#### useCloudSave

Load full cloud save data.

```typescript
import { useCloudSave } from '@/hooks/useCloudSave';

function LoadCloudSave() {
  const [enabled, setEnabled] = useState(false);
  const { data: gameState, isLoading, error } = useCloudSave({ enabled });

  const handleLoad = () => setEnabled(true);

  if (isLoading) return <div>Loading save...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleLoad}>Load from Cloud</button>
      {gameState && <p>Loaded save for {gameState.metadata.playerName}</p>}
    </div>
  );
}
```

#### useSyncToCloud

Sync game state to cloud with optimistic updates.

```typescript
import { useSyncToCloud } from '@/hooks/useCloudSave';

function SaveButton() {
  const { mutate: syncToCloud, isPending, error } = useSyncToCloud();

  const handleSave = () => {
    syncToCloud(gameState, {
      onSuccess: (metadata) => {
        console.log('Saved successfully:', metadata);
      },
      onError: (error) => {
        console.error('Save failed:', error);
      },
    });
  };

  return (
    <div>
      <button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save to Cloud'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

#### useSyncWithConflictDetection

Sync with automatic conflict detection.

```typescript
import { useSyncWithConflictDetection } from '@/hooks/useCloudSave';
import { SyncConflictError } from '@/lib/saves/cloud';

function SmartSaveButton() {
  const { mutate: sync, isPending, error } = useSyncWithConflictDetection();
  const [conflict, setConflict] = useState(null);

  const handleSave = () => {
    sync(
      { state: gameState, autoResolve: false },
      {
        onSuccess: (result) => {
          if (result.hadConflict) {
            console.log('Conflict was resolved');
          }
        },
        onError: (error) => {
          if (error instanceof SyncConflictError) {
            setConflict(error.conflict);
          }
        },
      }
    );
  };

  if (conflict) {
    return <ConflictResolutionDialog conflict={conflict} />;
  }

  return <button onClick={handleSave}>Save</button>;
}
```

#### useResolveConflict

Manually resolve save conflicts.

```typescript
import { useResolveConflict } from '@/hooks/useCloudSave';
import { ConflictResolution } from '@/types/save';

function ConflictResolutionDialog({ conflict }) {
  const { mutate: resolve, isPending } = useResolveConflict();

  const handleResolve = (resolution: ConflictResolution) => {
    resolve({
      conflict,
      resolution,
      localState: gameState,
    });
  };

  return (
    <div>
      <h3>Save Conflict Detected</h3>
      <div>
        <h4>Local Save</h4>
        <p>Progress: {conflict.localMetadata.progress}%</p>
        <p>Time: {new Date(conflict.localMetadata.timestamp).toLocaleString()}</p>
        <button onClick={() => handleResolve(ConflictResolution.USE_LOCAL)}>
          Use Local
        </button>
      </div>
      <div>
        <h4>Cloud Save</h4>
        <p>Progress: {conflict.cloudMetadata.progress}%</p>
        <p>Time: {new Date(conflict.cloudMetadata.timestamp).toLocaleString()}</p>
        <button onClick={() => handleResolve(ConflictResolution.USE_CLOUD)}>
          Use Cloud
        </button>
      </div>
      <button onClick={() => handleResolve(ConflictResolution.MERGE)}>
        Merge (Use Higher Progress)
      </button>
    </div>
  );
}
```

#### usePrefetchCloudSave

Prefetch cloud save data for better UX.

```typescript
import { usePrefetchCloudSave } from '@/hooks/useCloudSave';

function SaveLoadMenu() {
  const { prefetchMetadata, prefetchData } = usePrefetchCloudSave();

  // Prefetch metadata when menu opens
  useEffect(() => {
    prefetchMetadata();
  }, []);

  // Prefetch full data when user hovers over load button
  const handleLoadHover = () => {
    prefetchData();
  };

  return (
    <div>
      <button onMouseEnter={handleLoadHover}>Load from Cloud</button>
    </div>
  );
}
```

#### useInvalidateCloudSave

Invalidate cached cloud save data.

```typescript
import { useInvalidateCloudSave } from '@/hooks/useCloudSave';

function RefreshButton() {
  const { invalidateAll } = useInvalidateCloudSave();

  const handleRefresh = async () => {
    await invalidateAll();
    console.log('Cloud save cache invalidated');
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

## Query Keys

The hooks use consistent query keys for caching:

```typescript
import { cloudSaveKeys } from '@/hooks/useCloudSave';

// All cloud save queries
cloudSaveKeys.all; // ['cloudSave']

// Specific queries
cloudSaveKeys.metadata(); // ['cloudSave', 'metadata']
cloudSaveKeys.data(); // ['cloudSave', 'data']
cloudSaveKeys.auth(); // ['cloudSave', 'auth']
```

## Configuration

### Cache Times

- **Metadata**: 2 minutes stale time, 5 minutes cache time
- **Full Data**: 5 minutes stale time, 10 minutes cache time
- **Auth**: 5 minutes stale time, 10 minutes cache time

### Retry Logic

- **Queries**: Up to 3 retries with exponential backoff
- **Mutations**: Up to 2 retries with exponential backoff
- **No retry** for authentication or conflict errors

### Optimistic Updates

The `useSyncToCloud` hook implements optimistic updates:

1. Immediately updates cache with new state
2. Shows loading state
3. On error, rolls back to previous state
4. On success, invalidates and refetches

## Error Handling

```typescript
import {
  CloudStorageError,
  AuthenticationError,
  SyncConflictError,
} from '@/lib/saves/cloud';

function SaveButton() {
  const { mutate: sync, error } = useSyncToCloud();

  const handleSave = () => {
    sync(gameState, {
      onError: (error) => {
        if (error instanceof AuthenticationError) {
          // Redirect to login
          router.push('/login');
        } else if (error instanceof SyncConflictError) {
          // Show conflict resolution dialog
          showConflictDialog(error.conflict);
        } else if (error instanceof CloudStorageError) {
          // Show generic error message
          toast.error('Failed to save to cloud');
        }
      },
    });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## Offline Mode

The cloud save system handles offline mode gracefully:

```typescript
import { syncWhenOnline, isOnline } from '@/lib/saves/cloud';

function AutoSyncButton() {
  const handleSave = async () => {
    if (!isOnline()) {
      toast.info('Offline - will sync when connection is restored');
    }

    // This will wait for connection if offline
    await syncWhenOnline(gameState);
    toast.success('Synced to cloud');
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## Best Practices

### 1. Check Authentication First

Always check authentication before attempting cloud operations:

```typescript
const { isAuthenticated } = useCloudAuth();

if (!isAuthenticated) {
  // Show login prompt
  return <LoginPrompt />;
}
```

### 2. Handle Conflicts Gracefully

Provide clear UI for conflict resolution:

```typescript
if (error instanceof SyncConflictError) {
  return <ConflictResolutionDialog conflict={error.conflict} />;
}
```

### 3. Use Optimistic Updates

The hooks automatically handle optimistic updates for better UX.

### 4. Prefetch Anticipated Data

Prefetch data when user is likely to need it:

```typescript
// Prefetch when hovering over load button
<button onMouseEnter={() => prefetch.prefetchData()}>Load</button>
```

### 5. Invalidate After External Changes

Invalidate cache after operations that might change cloud data:

```typescript
const { invalidateAll } = useInvalidateCloudSave();

// After manual sync from another device
await invalidateAll();
```

## Integration with Local Saves

Combine cloud saves with local saves for best experience:

```typescript
import { saveToSlot } from '@/lib/saves/local';
import { useSyncToCloud } from '@/hooks/useCloudSave';

function SaveButton() {
  const { mutate: syncToCloud } = useSyncToCloud();

  const handleSave = async () => {
    // Save locally first
    await saveToSlot(0, gameState);

    // Then sync to cloud
    syncToCloud(gameState, {
      onError: (error) => {
        // Local save succeeded, cloud failed
        toast.warning('Saved locally, but cloud sync failed');
      },
    });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## Testing

The hooks are fully tested. See `src/hooks/__tests__/useCloudSave.test.ts` for examples.

## Related

- [Cloud Save Module](../lib/saves/cloud.ts)
- [Local Save System](../lib/saves/local.ts)
- [Save Validation](../lib/saves/validation.ts)
- [React Query Client](../lib/query-client.ts)
