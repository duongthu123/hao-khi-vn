# AI Loop Hook

The `useAILoop` hook manages the AI opponent's update cycle in the game, running AI logic on a separate timing from UI rendering to ensure smooth gameplay.

## Features

- **Separate AI Timing**: AI updates run at 1-second intervals (configurable) to avoid blocking rendering
- **Resource Management**: AI generates and manages its own resources based on difficulty
- **Unit Spawning**: AI spawns units according to strategic decisions
- **Target Selection**: AI units select and pursue player targets
- **Difficulty Integration**: AI behavior adapts based on difficulty settings
- **Non-Blocking**: AI logic runs in intervals, not in the render loop

## Requirements Validated

- **17.7**: AI runs on separate execution cycle to avoid blocking UI
- **17.8**: AI logic maintains game balance and fairness

## Usage

### Basic Integration

```tsx
import { useAILoop } from '@/hooks/useAILoop';
import { useStore } from '@/store';

function GameComponent() {
  const isPaused = useStore((state) => state.game.isPaused);
  const isPlaying = useStore((state) => state.game.phase === 'playing');
  
  // Enable AI when game is playing and not paused
  useAILoop({ enabled: isPlaying && !isPaused });
  
  return <div>Game content</div>;
}
```

### With Custom Update Interval

```tsx
// Update AI every 2 seconds instead of default 1 second
useAILoop({ 
  enabled: true,
  updateInterval: 2000,
});
```

### Monitoring AI State

```tsx
import { useAIState, useAIMetrics } from '@/hooks/useAILoop';

function AIDebugPanel() {
  const aiState = useAIState();
  const metrics = useAIMetrics();
  
  return (
    <div>
      <h3>AI Status</h3>
      <p>Units: {metrics.unitCount} / {metrics.unitLimit}</p>
      <p>Food: {Math.floor(metrics.resources.food)}</p>
      <p>Gold: {Math.floor(metrics.resources.gold)}</p>
      <p>Last Spawn: {aiState.lastSpawnTime}s</p>
    </div>
  );
}
```

## How It Works

### AI Update Cycle

The AI loop runs every second (by default) and performs the following:

1. **Resource Generation**: AI gains resources based on difficulty multiplier
2. **Spawn Decision**: AI decides whether to spawn a new unit
3. **Target Selection**: Each AI unit selects a player target
4. **Movement**: AI units move towards their targets
5. **Resource Management**: AI manages its resource spending strategy

### Separation from Rendering

The AI loop uses `setInterval` instead of `requestAnimationFrame` to ensure:
- AI logic doesn't run 60 times per second (unnecessary)
- Rendering stays smooth even during heavy AI calculations
- AI updates are predictable and consistent

### State Management

AI state is stored in the combat slice:

```typescript
interface AIState {
  lastSpawnTime: number;        // When AI last spawned a unit
  lastUpdateTime: number;        // Last AI update timestamp
  resources: {                   // AI's resources
    food: number;
    gold: number;
    army: number;
  };
  fortressPosition: Vector2;     // AI fortress location
}
```

## Configuration Options

### UseAILoopOptions

```typescript
interface UseAILoopOptions {
  enabled?: boolean;           // Whether AI is active (default: true)
  updateInterval?: number;     // Update interval in ms (default: 1000)
}
```

## AI Decision Making

The AI loop integrates with the AI strategy system:

### Unit Spawning

```typescript
// AI decides what unit to spawn based on:
// - Game phase (early/mid/late)
// - Available resources
// - Current army composition
// - Player's army composition
const spawnDecision = decideUnitSpawn(context);
```

### Target Selection

```typescript
// AI selects targets based on:
// - Distance to target
// - Target health
// - Target type (prioritize siege units)
// - Proximity to fortress
const targetDecision = selectTarget(aiUnit, context);
```

### Resource Management

```typescript
// AI manages resources by:
// - Maintaining resource buffer
// - Prioritizing defense when under attack
// - Saving for expensive units when ahead
const resourceDecision = manageResources(context);
```

## Performance Considerations

### Update Frequency

- Default: 1000ms (1 second) between updates
- Recommended range: 500ms - 3000ms
- Lower intervals = more responsive AI but higher CPU usage
- Higher intervals = less responsive AI but better performance

### Non-Blocking Design

The AI loop is designed to never block rendering:
- Runs in `setInterval`, not `requestAnimationFrame`
- Updates happen between frames
- State updates trigger React re-renders efficiently
- No heavy calculations in render path

## Integration with Game Systems

### Combat System

AI units are added to the combat state and participate in combat:

```typescript
addUnit({
  id: 'ai-unit-123',
  type: UnitType.INFANTRY,
  owner: 'ai',
  // ... other properties
});
```

### Resource System

AI has its own resource pool managed separately from player:

```typescript
updateAIResources({
  food: newFood,
  gold: newGold,
});
```

### Difficulty System

AI behavior adapts based on difficulty:

```typescript
const settings = getAIDifficultySettings(difficulty);
// settings.spawnInterval
// settings.resourceMultiplier
// settings.aggressiveness
// settings.unitLimit
```

## Debugging

### Enable AI Metrics Display

```tsx
import { useAIMetrics } from '@/hooks/useAILoop';

function DebugOverlay() {
  const metrics = useAIMetrics();
  
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded">
      <h4>AI Debug</h4>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
```

### Monitor AI Updates

Check the combat log for AI events:

```typescript
const combatLog = useStore((state) => state.combat.combatLog);
const aiEvents = combatLog.filter(e => e.type === 'spawn');
```

## Examples

See `useAILoop.example.tsx` for complete working examples including:
- Basic AI loop integration
- AI metrics display
- Complete game with AI and player
- Custom update intervals

## Related

- `src/lib/ai/strategy.ts` - AI decision-making logic
- `src/lib/ai/difficulty.ts` - Difficulty settings
- `src/store/slices/combatSlice.ts` - Combat and AI state
- `src/hooks/useGameLoop.ts` - Main game loop for rendering
