# NotificationToast Component

A polished toast notification system with smooth animations, queue management, and auto-dismiss functionality.

## Features

- **Smooth Animations**: Spring-based enter/exit animations with Framer Motion
- **Multiple Types**: Success, error, warning, and info notifications with distinct styling
- **Auto-Dismiss**: Configurable duration with visual progress indicator
- **Queue Management**: Limits visible notifications to prevent overflow
- **Accessibility**: ARIA labels, live regions, and keyboard support
- **Manual Dismiss**: Click to dismiss any notification
- **Responsive**: Works on all screen sizes

## Usage

### Basic Usage

```tsx
import { NotificationToast } from '@/components/ui/NotificationToast';
import { useGameStore } from '@/store';

function MyComponent() {
  const notifications = useGameStore((state) => state.ui.notifications);
  const removeNotification = useGameStore((state) => state.removeNotification);

  return (
    <NotificationToast 
      notifications={notifications} 
      onDismiss={removeNotification}
    />
  );
}
```

### Using the Hook

The `useNotifications` hook provides a convenient API:

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Game saved successfully!');
    } catch (error) {
      showError('Failed to save game');
    }
  };

  return <button onClick={handleSave}>Save Game</button>;
}
```

### Custom Duration

```tsx
// Show notification for 10 seconds
showSuccess('Important message', 10000);

// Show persistent notification (no auto-dismiss)
showInfo('Persistent notification', 0);
```

### Custom Notification

```tsx
const { showNotification } = useNotifications();

showNotification({
  message: 'Custom notification',
  type: 'warning',
  duration: 5000,
});
```

## Props

### NotificationToast

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `Notification[]` | required | Array of notifications to display |
| `onDismiss` | `(id: string) => void` | required | Callback when notification is dismissed |
| `maxVisible` | `number` | `5` | Maximum number of visible notifications |

### Notification Type

```typescript
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // milliseconds, 0 for persistent
  createdAt: number;
}
```

## Notification Types

### Success
- **Icon**: ✓
- **Color**: Green
- **Use**: Successful operations, confirmations
- **Example**: "Game saved successfully"

### Error
- **Icon**: ✕
- **Color**: Red
- **Use**: Errors, failures
- **Example**: "Failed to load save file"
- **Note**: Has shake animation on icon

### Warning
- **Icon**: ⚠
- **Color**: Yellow
- **Use**: Warnings, cautions
- **Example**: "Low resources"

### Info
- **Icon**: ℹ
- **Color**: Blue
- **Use**: General information
- **Example**: "Auto-save enabled"

## Animation Details

### Enter Animation
- Slides in from top-right
- Scales from 0.8 to 1.0
- Spring physics for natural motion
- Duration: ~300ms

### Exit Animation
- Slides out to the right
- Scales down to 0.8
- Fades out
- Duration: 200ms

### Progress Bar
- Animated countdown for auto-dismiss
- Smooth linear animation
- Located at bottom of toast

### Icon Animation
- Scales in with spring physics
- Error icons shake on entry
- Duration: ~500ms

## Queue Management

When more notifications exist than `maxVisible`:
- Shows the most recent notifications
- Displays a counter: "+X more notifications"
- Older notifications are hidden but not removed
- As notifications dismiss, hidden ones become visible

## Accessibility

- **ARIA Roles**: Each notification has `role="alert"`
- **Live Regions**: 
  - Error notifications: `aria-live="assertive"`
  - Other types: `aria-live="polite"`
- **Labels**: Descriptive labels for icons and dismiss buttons
- **Keyboard**: Dismiss button is keyboard accessible

## Best Practices

1. **Keep messages concise**: Aim for one line of text
2. **Use appropriate types**: Match the notification type to the message severity
3. **Set reasonable durations**: 
   - Success: 3-5 seconds
   - Error: 5-7 seconds (users need time to read)
   - Warning: 5-7 seconds
   - Info: 3-5 seconds
4. **Avoid notification spam**: Debounce rapid notifications
5. **Provide context**: Include enough information for users to understand

## Examples

### Save System Integration

```tsx
function SaveLoadMenu() {
  const { showSuccess, showError } = useNotifications();

  const handleSave = async (slot: number) => {
    try {
      await saveGame(slot);
      showSuccess(`Game saved to slot ${slot}`);
    } catch (error) {
      showError('Failed to save game. Please try again.');
    }
  };

  return <button onClick={() => handleSave(1)}>Save</button>;
}
```

### Resource System Integration

```tsx
function ResourceManager() {
  const { showWarning } = useNotifications();
  const resources = useResources();

  useEffect(() => {
    if (resources.food < 100) {
      showWarning('Food running low!', 7000);
    }
  }, [resources.food, showWarning]);

  return <ResourceDisplay />;
}
```

### Combat System Integration

```tsx
function CombatView() {
  const { showInfo, showSuccess } = useNotifications();

  const handleVictory = () => {
    showSuccess('Victory! You defeated the enemy!', 5000);
  };

  const handleAbilityUsed = (abilityName: string) => {
    showInfo(`${abilityName} activated!`, 3000);
  };

  return <CombatInterface />;
}
```

## Styling

The component uses Tailwind CSS with custom colors:
- Success: `bg-green-500/90`
- Error: `bg-red-500/90`
- Warning: `bg-yellow-500/90`
- Info: `bg-blue-500/90`

All notifications have:
- Backdrop blur for depth
- Border for definition
- Shadow for elevation
- Rounded corners for polish

## Performance

- Uses `AnimatePresence` with `mode="popLayout"` for smooth list animations
- Progress bar uses `requestAnimationFrame` for 60 FPS
- Notifications are memoized to prevent unnecessary re-renders
- Auto-dismiss uses native `setTimeout` for efficiency

## Requirements Validation

This component validates:
- **Requirement 6.5**: Animate resource changes and notifications
- **Requirement 23.3**: Error handling and loading states with user feedback
