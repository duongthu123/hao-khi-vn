# useResearchSystem Hook

## Overview

The `useResearchSystem` hook manages the research system logic for the game, including resource validation, progress tracking, effect application, and notifications.

**Validates Requirements:** 19.2, 19.4, 19.5, 19.8

## Features

### 1. Resource Cost Validation (Requirement 19.2)

Before starting research, the hook validates that the player has sufficient resources:

```typescript
const { startResearch } = useResearchSystem();

// Automatically validates resources before starting
const success = startResearch('research-improved-farming');
```

The validation checks:
- Food cost vs available food
- Gold cost vs available gold
- Shows error notification if insufficient resources

### 2. Progress Tracking Over Time (Requirement 19.4)

Research progress is tracked automatically using a timer:

```typescript
const { progress, currentResearch } = useResearchSystem();

// Progress updates every 100ms
console.log(`Current progress: ${progress}%`);
console.log(`Researching: ${currentResearch?.nameVietnamese}`);
```

The hook:
- Updates progress every 100ms
- Calculates progress based on elapsed time vs duration
- Automatically completes research when progress reaches 100%

### 3. Research Effect Application (Requirement 19.5)

When research completes, effects are automatically applied:

```typescript
// Effects are applied automatically on completion
// No manual intervention needed
```

Supported effect types:
- **resource-generation**: Increases resource generation rates
- **unit-stat**: Increases unit statistics (handled passively)
- **building-stat**: Increases building statistics (handled passively)
- **unlock-unit**: Unlocks new unit types (handled passively)
- **unlock-ability**: Unlocks new abilities (handled passively)
- **cost-reduction**: Reduces costs (handled passively)

### 4. Completion Notifications (Requirement 19.5)

The hook shows notifications for:
- Research started
- Research completed
- Individual effects applied
- Errors (insufficient resources, already researching, etc.)

### 5. State Persistence (Requirement 19.8)

Research state is automatically persisted through the Zustand store:
- Completed research list
- In-progress research ID
- Progress percentage
- Progress start time

## API

### Return Values

```typescript
interface UseResearchSystemReturn {
  startResearch: (researchId: string) => boolean;
  cancelResearch: () => void;
  currentResearch: ResearchNode | null;
  progress: number;
}
```

#### `startResearch(researchId: string): boolean`

Starts a research project with full validation.

**Parameters:**
- `researchId`: The ID of the research to start

**Returns:**
- `true` if research started successfully
- `false` if validation failed

**Validation checks:**
- Research exists
- No other research in progress
- Research not already completed
- Sufficient resources available

**Side effects:**
- Deducts resources
- Starts progress tracking
- Shows notification

#### `cancelResearch(): void`

Cancels the current research in progress.

**Side effects:**
- Stops progress tracking
- Clears in-progress state
- Shows notification
- **Note:** Resources are NOT refunded

#### `currentResearch: ResearchNode | null`

The currently researching node, or `null` if no research in progress.

#### `progress: number`

Current research progress as a percentage (0-100).

## Usage Example

```typescript
import { useResearchSystem } from '@/hooks/useResearchSystem';

function ResearchPanel() {
  const { startResearch, cancelResearch, currentResearch, progress } = useResearchSystem();

  const handleStart = () => {
    const success = startResearch('research-improved-farming');
    if (success) {
      console.log('Research started!');
    }
  };

  const handleCancel = () => {
    cancelResearch();
  };

  return (
    <div>
      {currentResearch ? (
        <div>
          <h3>Researching: {currentResearch.nameVietnamese}</h3>
          <progress value={progress} max={100} />
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <button onClick={handleStart}>Start Research</button>
      )}
    </div>
  );
}
```

## Integration with ResearchTree Component

The `ResearchTree` component uses this hook to manage all research operations:

```typescript
import { useResearchSystem } from '@/hooks/useResearchSystem';

export function ResearchTree() {
  const { startResearch, cancelResearch } = useResearchSystem();

  // Component automatically handles UI and delegates logic to the hook
  return (
    <ResearchNodeCard
      onStartResearch={startResearch}
      onCancelResearch={cancelResearch}
    />
  );
}
```

## Implementation Details

### Progress Tracking

The hook uses a `setInterval` that runs every 100ms to update progress:

```typescript
useEffect(() => {
  if (!research.inProgress) return;

  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed / duration) * 100;
    updateResearchProgress(progress);

    if (progress >= 100) {
      completeResearch();
      applyResearchEffects(researchId);
    }
  }, 100);

  return () => clearInterval(interval);
}, [research.inProgress]);
```

### Effect Application

Resource generation effects are applied immediately:

```typescript
const applyResearchEffects = (researchId: string) => {
  node.effects.forEach((effect) => {
    if (effect.type === 'resource-generation') {
      const currentRate = resources.generation[`${effect.target}PerSecond`];
      const increase = (currentRate * effect.value) / 100;
      setGeneration({
        [`${effect.target}PerSecond`]: currentRate + increase,
      });
    }
  });
};
```

Other effects (unit stats, unlocks, etc.) are checked passively by other systems when needed.

## Testing

The hook is fully tested with 11 test cases covering:
- Resource validation
- Starting research
- Canceling research
- Progress tracking
- Effect application
- Edge cases (insufficient resources, already researching, etc.)

Run tests:
```bash
npm test -- src/hooks/__tests__/useResearchSystem.test.ts
```

## Related Files

- `src/hooks/useResearchSystem.ts` - Hook implementation
- `src/hooks/__tests__/useResearchSystem.test.ts` - Tests
- `src/components/game/ResearchTree/ResearchTree.tsx` - UI component
- `src/store/slices/researchSlice.ts` - State management
- `src/constants/research.ts` - Research data
