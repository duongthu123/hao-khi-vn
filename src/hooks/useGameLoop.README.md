# useGameLoop Hook

## Overview

The `useGameLoop` hook provides a robust game update loop using `requestAnimationFrame` with frame-independent updates. It's designed to maintain consistent game logic execution regardless of frame rate variations.

## Features

- **Frame-independent updates**: Uses delta time for consistent behavior across different frame rates
- **Target FPS management**: Configure desired frames per second (default: 60 FPS)
- **Automatic cleanup**: Properly cancels animation frames on unmount
- **Pause/resume capability**: Enable or disable the loop dynamically
- **Spiral of death prevention**: Caps maximum delta time to prevent cascading slowdowns
- **Fixed time step**: Uses accumulator pattern for stable physics and game logic

## Requirements Validation

- **Requirement 14.2**: Resource generation over time
- **Requirement 21.7**: Maintain 60 FPS performance

## Usage

### Basic Usage

```tsx
import { useGameLoop } from '@/hooks/useGameLoop';

function GameComponent() {
  useGameLoop((deltaTime) => {
    // Update game state based on deltaTime (in seconds)
    console.log(`Frame took ${deltaTime}s`);
  });

  return <div>Game content</div>;
}
```

### With Options

```tsx
import { useGameLoop } from '@/hooks/useGameLoop';
import { useStore } from '@/store';

function GameComponent() {
  const isPaused = useStore((state) => state.game.isPaused);

  useGameLoop(
    (deltaTime) => {
      // Update resources
      updateResources(deltaTime);
      
      // Update units
      updateUnits(deltaTime);
      
      // Update AI
      updateAI(deltaTime);
    },
    {
      fps: 60,              // Target 60 FPS
      enabled: !isPaused,   // Pause when game is paused
      maxDeltaTime: 0.1,    // Cap at 100ms to prevent spiral of death
    }
  );

  return <div>Game content</div>;
}
```

### Resource Generation Integration

```tsx
import { useGameLoop } from '@/hooks/useGameLoop';
import { useStore } from '@/store';
import { generateResources } from '@/lib/resources/generation';

function GameComponent() {
  const resources = useStore((state) => state.resources);
  const setResource = useStore((state) => state.setResource);

  useGameLoop((deltaTime) => {
    // Generate resources based on elapsed time
    const newResources = generateResources(
      {
        food: resources.food,
        gold: resources.gold,
        army: resources.army,
      },
      resources.caps,
      resources.generation,
      deltaTime
    );

    // Update state
    setResource('food', newResources.food);
    setResource('gold', newResources.gold);
    setResource('army', newResources.army);
  }, { enabled: true });

  return <div>Game content</div>;
}
```

### FPS Counter

```tsx
import { useFPSCounter } from '@/hooks/useGameLoop';

function DebugOverlay() {
  const fps = useFPSCounter();

  return (
    <div className="fixed top-0 right-0 p-4 bg-black/50 text-white">
      FPS: {fps}
    </div>
  );
}
```

## API Reference

### useGameLoop

```typescript
function useGameLoop(
  callback: (deltaTime: number) => void,
  options?: UseGameLoopOptions
): void
```

#### Parameters

- **callback**: Function called on each frame
  - `deltaTime`: Time elapsed since last frame in seconds (fixed time step)
  
- **options**: Configuration object
  - `fps`: Target frames per second (default: 60)
  - `enabled`: Whether the loop is active (default: true)
  - `maxDeltaTime`: Maximum delta time cap in seconds (default: 0.1)

#### Returns

Nothing. The hook manages the loop internally.

### useResourceGeneration

```typescript
function useResourceGeneration(
  enabled?: boolean,
  fps?: number
): void
```

Convenience hook for resource generation. Currently a placeholder for future integration.

#### Parameters

- **enabled**: Whether resource generation is active (default: true)
- **fps**: Target frames per second (default: 60)

### useFPSCounter

```typescript
function useFPSCounter(): number
```

Returns the current frames per second for debugging and monitoring.

#### Returns

Current FPS as a number.

## Implementation Details

### Fixed Time Step

The hook uses a fixed time step with an accumulator pattern:

1. Calculate actual elapsed time (delta time)
2. Cap delta time to prevent spiral of death
3. Accumulate time
4. Execute updates in fixed time steps until accumulator is depleted

This ensures consistent game logic regardless of frame rate variations.

### Spiral of Death Prevention

When a frame takes too long to process, it can cause subsequent frames to take even longer, creating a "spiral of death". The hook prevents this by capping the maximum delta time (default: 100ms).

### Frame Independence

By providing delta time to the callback, game logic can scale appropriately:

```typescript
// Movement example
position.x += velocity.x * deltaTime;
position.y += velocity.y * deltaTime;

// Resource generation example
resources.food += generationRate.food * deltaTime;
```

## Performance Considerations

- The hook uses `requestAnimationFrame` for optimal browser rendering synchronization
- Callbacks are stored in refs to avoid recreating animation frames
- The loop automatically pauses when `enabled` is false
- Fixed time step prevents physics instability

## Testing

The hook includes comprehensive unit tests covering:

- Basic callback execution
- Fixed time step accuracy
- Enable/disable functionality
- Callback updates
- Delta time capping
- Cleanup on unmount
- Different FPS targets

Run tests with:

```bash
npm test -- src/hooks/__tests__/useGameLoop.test.ts
```

## Related

- [Resource Generation System](../lib/resources/generation.README.md)
- [Resource State Slice](../store/slices/resourceSlice.ts)
- [Game Configuration](../constants/config.ts)
