# Resource Transaction UI Feedback System

This document describes the resource transaction UI feedback system implemented for task 8.5.

## Overview

The feedback system provides visual and interactive feedback for all resource transactions, including:
- Toast notifications for resource changes
- Floating text animations for gains/losses
- Error messages for insufficient resources
- Animated resource display updates

## Components

### 1. NotificationToast (`src/components/ui/NotificationToast.tsx`)

A toast notification system with enter/exit animations.

**Features:**
- Four notification types: success, error, warning, info
- Auto-dismiss after configurable duration
- Manual dismiss button
- Smooth enter/exit animations using Framer Motion
- Stacked layout for multiple notifications
- Color-coded by type

**Usage:**
```tsx
import { NotificationToast } from '@/components/ui/NotificationToast';
import { useStore } from '@/store';

function App() {
  const notifications = useStore((state) => state.ui.notifications);
  const removeNotification = useStore((state) => state.removeNotification);

  return (
    <NotificationToast
      notifications={notifications}
      onDismiss={removeNotification}
    />
  );
}
```

### 2. FloatingText (`src/components/ui/FloatingText.tsx`)

Animated floating text for resource gains/losses.

**Features:**
- Displays resource changes with icons
- Color-coded by resource type and gain/loss
- Smooth floating animation (upward movement with fade)
- Auto-cleanup after animation completes
- Supports custom positioning

**Usage:**
```tsx
import { FloatingText, useFloatingText } from '@/components/ui/FloatingText';
import { ResourceType } from '@/types/resource';

function MyComponent() {
  const { items, addFloatingText, removeFloatingText } = useFloatingText();

  const handleResourceChange = () => {
    addFloatingText('50', 'gain', ResourceType.FOOD, x, y);
  };

  return (
    <FloatingText items={items} onComplete={removeFloatingText} />
  );
}
```

### 3. useResourceFeedback Hook (`src/hooks/useResourceFeedback.ts`)

A custom hook providing resource transaction feedback functions.

**Functions:**
- `notifyResourceGain(resource, amount)`: Show success notification for gains
- `notifyResourceLoss(resource, amount, reason?)`: Show info notification for losses
- `notifyInsufficientResources(missing)`: Show error for insufficient resources
- `notifyLowResources(resource)`: Show warning for low resources
- `notifyResourceCapReached(resource)`: Show warning when cap is reached

**Usage:**
```tsx
import { useResourceFeedback } from '@/hooks/useResourceFeedback';
import { ResourceType } from '@/types/resource';

function PurchaseButton() {
  const { notifyResourceLoss, notifyInsufficientResources } = useResourceFeedback();
  const canAfford = useStore((state) => state.canAfford);
  const subtractResource = useStore((state) => state.subtractResource);

  const handlePurchase = () => {
    const cost = { [ResourceType.FOOD]: 100 };
    const affordability = canAfford(cost);

    if (!affordability.valid && affordability.missing) {
      notifyInsufficientResources(affordability.missing);
      return;
    }

    subtractResource(ResourceType.FOOD, 100);
    notifyResourceLoss(ResourceType.FOOD, 100, 'Purchase');
  };

  return <button onClick={handlePurchase}>Buy Item</button>;
}
```

### 4. Enhanced ResourceDisplay

The ResourceDisplay component now includes:
- Floating text integration
- Value change callbacks
- Animated counter with change detection

**New Props:**
- `enableFloatingText`: Enable/disable floating text animations (default: true)

## Integration with Store

### UI Slice

The notification system uses the `uiSlice` in the Zustand store:

```typescript
interface UISlice {
  ui: {
    notifications: Notification[];
    // ... other UI state
  };
  addNotification: (notification) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
```

**Notification Structure:**
```typescript
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  createdAt: number;
}
```

## Notification Types and Colors

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| Success | Green | ✓ | Resource gains, successful transactions |
| Error | Red | ✕ | Insufficient resources, failed transactions |
| Warning | Yellow | ⚠ | Low resources, resource cap reached |
| Info | Blue | ℹ | General resource information, losses |

## Animation Details

### Toast Notifications
- **Enter**: Fade in + slide down + scale up (spring animation)
- **Exit**: Fade out + slide right + scale down
- **Duration**: 3-5 seconds (configurable)
- **Layout**: Stacked vertically in top-right corner

### Floating Text
- **Enter**: Fade in + scale up from 0.5 to 1.2
- **Movement**: Float upward 80px
- **Exit**: Fade out + scale down to 0.8
- **Duration**: 2 seconds total
- **Timing**: [0, 0.2, 0.8, 1] for opacity keyframes

### Resource Counter
- **Transition**: Smooth easing over 0.5 seconds
- **Easing**: Cubic ease-out (1 - (1 - progress)³)
- **Frame-based**: Uses requestAnimationFrame for smooth updates

## Vietnamese Localization

All messages are in Vietnamese:
- "Lương thực" (Food)
- "Vàng" (Gold)
- "Quân đội" (Army)
- "Không đủ tài nguyên! Thiếu: ..." (Insufficient resources! Missing: ...)
- "... sắp hết!" (... running low!)
- "... đã đạt giới hạn tối đa" (... reached maximum limit)

## Requirements Validated

- ✅ **14.4**: Real-time resource display updates with animations
- ✅ **14.7**: Error messages for insufficient resources
- ✅ **23.3**: User-friendly error handling and loading states
- ✅ **6.5**: Animated resource changes and notifications

## Example Implementation

See `src/components/game/ResourceDisplay/ResourceDisplay.example.tsx` for a complete working example demonstrating:
- Resource display with floating text
- Toast notifications
- Resource transactions
- Error handling
- Low resource warnings

## Testing

To test the feedback system:

1. Run the example component
2. Click "Add Resources" buttons to see:
   - Floating text animations
   - Success notifications
   - Animated counter updates
3. Click "Spend Resources" to see:
   - Error notifications for insufficient resources
   - Info notifications for successful transactions
4. Click "Check Low Resources" to see warning notifications

## Performance Considerations

- Notifications auto-dismiss to prevent memory leaks
- Floating text items are cleaned up after animation
- Animations use GPU-accelerated properties (transform, opacity)
- Component uses React.memo patterns where appropriate
- Maximum notification queue size prevents overflow

## Accessibility

- Dismiss buttons have aria-labels
- Color is not the only indicator (icons + text)
- Animations can be disabled via prop
- Keyboard navigation supported
- Screen reader friendly notification messages
