# useAutoSave Hook

Auto-save hook that provides automatic game state persistence at regular intervals and on critical events.

**Implements Requirements**: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7, 8.8

## Features

- ✅ Automatic game state saving at configurable intervals (default: 5 minutes)
- ✅ Event-based auto-save triggers (level completion, hero acquisition, achievements)
- ✅ Dedicated auto-save slot (slot 0 by default)
- ✅ Combat debouncing - skips auto-save during active combat
- ✅ Animation detection - prevents auto-save during animations
- ✅ Non-intrusive notifications with event context
- ✅ Settings integration for enable/disable toggle
- ✅ Manual trigger support for critical events
- ✅ Game phase validation (only saves during gameplay)

## Usage

### Basic Usage

```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

function GameComponent() {
  // Use with default settings (5 minute interval, enabled)
  useAutoSave();

  return <div>Game content...</div>;
}
```

### Custom Configuration

```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

function GameComponent() {
  const { triggerAutoSave, lastSaveTime, isEnabled, markAnimationStart, markAnimationEnd } = useAutoSave({
    interval: 3 * 60 * 1000, // 3 minutes
    enabled: true,
    autoSaveSlot: 0, // Use slot 0 for auto-saves
    combatDebounce: 30 * 1000, // 30 seconds
    enableEventTriggers: true, // Enable critical event triggers
  });

  // Manually trigger auto-save on critical events
  const handleLevelComplete = () => {
    triggerAutoSave('hoàn thành cấp độ');
  };
  
  // Mark animations to prevent auto-save during them
  const handleAnimation = () => {
    markAnimationStart();
    // ... animation code ...
    setTimeout(() => {
      markAnimationEnd();
    }, 1000);
  };

  return (
    <div>
      <p>Auto-save enabled: {isEnabled ? 'Yes' : 'No'}</p>
      <p>Last save: {getTimeSinceLastSave(lastSaveTime)}</p>
      <button onClick={handleLevelComplete}>Complete Level</button>
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | `number` | `300000` (5 min) | Auto-save interval in milliseconds |
| `enabled` | `boolean` | `true` | Whether auto-save is enabled |
| `autoSaveSlot` | `number` | `0` | Dedicated slot for auto-saves (0-4) |
| `combatDebounce` | `number` | `30000` (30 sec) | Debounce duration during combat |
| `enableEventTriggers` | `boolean` | `true` | Enable auto-save on critical events |

## Return Value

The hook returns an object with:

- `triggerAutoSave`: Function to manually trigger an auto-save (accepts optional reason string)
- `lastSaveTime`: Timestamp of the last successful auto-save
- `isEnabled`: Boolean indicating if auto-save is currently enabled
- `markAnimationStart`: Function to mark that an animation has started
- `markAnimationEnd`: Function to mark that an animation has ended

## Behavior

### Auto-save Triggers

Auto-save will trigger:
- ✅ At regular intervals (configurable)
- ✅ When manually triggered via `triggerAutoSave()`
- ✅ On level completion (when currentLevel increases)
- ✅ On hero acquisition (when collection.heroes count increases)
- ✅ On achievement unlock (when unlocked achievement count increases)
- ✅ Only during `playing` or `paused` game phases

### Auto-save Skips

Auto-save will NOT trigger when:
- ❌ Game is in `menu` or `hero-selection` phase
- ❌ Combat is active (units present on battlefield)
- ❌ Within debounce window after combat ends
- ❌ Animations are currently playing
- ❌ Auto-save is disabled in settings
- ❌ Event triggers are disabled (for event-based saves)

### Notifications

- **Success**: Shows brief info notification (2 seconds) with context
  - Regular: "💾 Tự động lưu game thành công"
  - Level completion: "💾 Tự động lưu game (hoàn thành cấp độ)"
  - Hero acquisition: "💾 Tự động lưu game (nhận tướng mới)"
  - Achievement: "💾 Tự động lưu game (đạt thành tựu)"
- **Failure**: Shows warning notification (3 seconds)
- All notifications are non-intrusive and don't interrupt gameplay

## Settings Integration

The hook integrates with the game settings stored in the UI slice:

```tsx
// In SettingsMenu component
const updateSettings = useGameStore((state) => state.updateSettings);

// Toggle auto-save
updateSettings({ autoSaveEnabled: !settings.autoSaveEnabled });

// Change interval
updateSettings({ autoSaveInterval: 10 * 60 * 1000 }); // 10 minutes
```

## Examples

### Example 1: Basic Integration

```tsx
function Game() {
  useAutoSave(); // That's it!
  
  return <GameContent />;
}
```

### Example 2: With Manual Triggers

```tsx
function Game() {
  const { triggerAutoSave } = useAutoSave();
  
  const handleCriticalEvent = async () => {
    // Do something important
    await completeMission();
    
    // Trigger immediate auto-save with reason
    await triggerAutoSave('hoàn thành nhiệm vụ');
  };
  
  return <GameContent onMissionComplete={handleCriticalEvent} />;
}
```

### Example 3: Animation Integration

```tsx
function Game() {
  const { markAnimationStart, markAnimationEnd } = useAutoSave();
  
  const playHeroAcquisitionAnimation = () => {
    // Mark animation start to prevent auto-save
    markAnimationStart();
    
    // Play animation
    animateHeroReveal().then(() => {
      // Mark animation end to allow auto-save
      markAnimationEnd();
    });
  };
  
  return <GameContent onHeroAcquired={playHeroAcquisitionAnimation} />;
}
```

### Example 4: Display Last Save Time

```tsx
import { useAutoSave, getTimeSinceLastSave } from '@/hooks/useAutoSave';

function GameHeader() {
  const { lastSaveTime, isEnabled } = useAutoSave();
  
  return (
    <header>
      <h1>Game Title</h1>
      {isEnabled && (
        <p className="text-sm text-gray-500">
          Last auto-save: {getTimeSinceLastSave(lastSaveTime)}
        </p>
      )}
    </header>
  );
}
```

## Implementation Details

### Save Data Structure

The hook saves complete game state including:
- Game phase, difficulty, level
- Selected hero and unlocked heroes
- Combat units and buildings
- Resources and generation rates
- Collection progress
- Profile and statistics
- Research progress
- Quiz progress

### Error Handling

- Catches and logs all save errors
- Shows user-friendly error notifications
- Doesn't interrupt gameplay on failure
- Continues attempting saves at next interval

### Performance

- Uses dedicated auto-save slot to avoid conflicts
- Compresses save data using LZ-string
- Debounces during combat to avoid performance impact
- Prevents saves during animations to avoid interrupting user experience
- Event-based triggers use 2-second delay to allow animations to complete
- Minimal overhead on game loop

## Critical Event Detection

The hook automatically monitors for these critical events:

### Level Completion
- Detects when `game.currentLevel` increases
- Waits 2 seconds for completion animations
- Triggers auto-save with reason "hoàn thành cấp độ"

### Hero Acquisition
- Detects when `collection.heroes.length` increases
- Waits 2 seconds for acquisition animations
- Triggers auto-save with reason "nhận tướng mới"

### Achievement Unlock
- Detects when unlocked achievement count increases
- Waits 2 seconds for unlock animations
- Triggers auto-save with reason "đạt thành tựu"

All event-based triggers respect the animation prevention system to ensure smooth user experience.

## Testing

The hook includes comprehensive tests covering:
- Basic initialization and configuration
- Interval-based auto-save triggers
- Combat debouncing logic
- Game phase validation
- Notification display
- Manual trigger functionality
- Save data structure validation

Run tests with:
```bash
npm test -- src/hooks/__tests__/useAutoSave.test.ts
```

## Related

- `src/lib/saves/local.ts` - Local storage save system
- `src/lib/saves/serialization.ts` - Save data serialization
- `src/store/slices/uiSlice.ts` - UI settings including auto-save config
- `src/components/game/SettingsMenu.tsx` - Settings UI with auto-save toggle
