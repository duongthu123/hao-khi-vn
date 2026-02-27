# useSwipeGesture Hook

## Overview

Custom React hook for detecting swipe gestures on touch devices. Supports horizontal and vertical swipes with configurable thresholds and duration limits.

## Features

- ✅ Detects left, right, up, and down swipes
- ✅ Configurable swipe threshold (minimum distance)
- ✅ Maximum duration check to distinguish swipes from drags
- ✅ Prioritizes dominant direction for diagonal swipes
- ✅ Optional preventDefault for touch events
- ✅ TypeScript support with full type definitions
- ✅ Lightweight with no dependencies

## Installation

The hook is already included in the project at `src/hooks/useSwipeGesture.ts`.

## Basic Usage

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function MyComponent() {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => console.log('Swiped left!'),
    onSwipeRight: () => console.log('Swiped right!'),
    threshold: 50,
  });

  return (
    <div {...swipeHandlers}>
      Swipe me!
    </div>
  );
}
```

## API Reference

### Parameters

The hook accepts a configuration object with the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `onSwipeLeft` | `() => void` | `undefined` | Callback fired when user swipes left |
| `onSwipeRight` | `() => void` | `undefined` | Callback fired when user swipes right |
| `onSwipeUp` | `() => void` | `undefined` | Callback fired when user swipes up |
| `onSwipeDown` | `() => void` | `undefined` | Callback fired when user swipes down |
| `threshold` | `number` | `50` | Minimum distance in pixels to trigger a swipe |
| `maxDuration` | `number` | `300` | Maximum time in ms for a swipe gesture |
| `preventDefault` | `boolean` | `false` | Prevent default touch behavior |

### Return Value

Returns an object with three touch event handlers:

```typescript
{
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: (event: TouchEvent) => void;
}
```

Spread these handlers onto your component to enable swipe detection.

## Examples

### Navigation with Swipe

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useRouter } from 'next/navigation';

function ImageGallery({ images, currentIndex, setCurrentIndex }) {
  const router = useRouter();
  
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      // Next image
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipeRight: () => {
      // Previous image
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    threshold: 75, // Require 75px swipe
  });

  return (
    <div {...swipeHandlers} className="relative">
      <img src={images[currentIndex]} alt="Gallery" />
    </div>
  );
}
```

### Dismissible Card

```tsx
import { useState } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function DismissibleCard({ onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);
  
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      setIsVisible(false);
      onDismiss?.();
    },
    onSwipeRight: () => {
      setIsVisible(false);
      onDismiss?.();
    },
    threshold: 100, // Require significant swipe to dismiss
    maxDuration: 500, // Allow slower swipes
  });

  if (!isVisible) return null;

  return (
    <div {...swipeHandlers} className="card">
      <p>Swipe left or right to dismiss</p>
    </div>
  );
}
```

### Vertical Scrolling Menu

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function VerticalMenu({ onOpen, onClose }) {
  const swipeHandlers = useSwipeGesture({
    onSwipeUp: onOpen,
    onSwipeDown: onClose,
    threshold: 60,
    maxDuration: 400,
  });

  return (
    <div {...swipeHandlers} className="menu-trigger">
      <p>Swipe up to open menu</p>
    </div>
  );
}
```

### All Directions

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function GameController() {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => movePlayer('left'),
    onSwipeRight: () => movePlayer('right'),
    onSwipeUp: () => movePlayer('up'),
    onSwipeDown: () => movePlayer('down'),
    threshold: 40, // Sensitive for game controls
    maxDuration: 200, // Quick swipes only
  });

  return (
    <div {...swipeHandlers} className="game-area">
      {/* Game content */}
    </div>
  );
}
```

### With preventDefault

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function FullscreenViewer() {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: nextImage,
    onSwipeRight: previousImage,
    preventDefault: true, // Prevent browser navigation
    threshold: 50,
  });

  return (
    <div {...swipeHandlers} className="fullscreen">
      {/* Viewer content */}
    </div>
  );
}
```

## How It Works

### Swipe Detection Algorithm

1. **Touch Start**: Records initial touch position and timestamp
2. **Touch Move**: Updates current touch position
3. **Touch End**: Calculates swipe distance and duration
4. **Validation**: Checks if swipe meets threshold and duration requirements
5. **Direction**: Determines dominant direction (horizontal vs vertical)
6. **Callback**: Fires appropriate callback based on direction

### Direction Prioritization

When a swipe has both horizontal and vertical components, the hook prioritizes the dominant direction:

```typescript
const absDeltaX = Math.abs(deltaX);
const absDeltaY = Math.abs(deltaY);

if (absDeltaX > absDeltaY) {
  // Horizontal swipe
  if (deltaX > 0) onSwipeRight();
  else onSwipeLeft();
} else {
  // Vertical swipe
  if (deltaY > 0) onSwipeDown();
  else onSwipeUp();
}
```

### Threshold Check

A swipe must exceed the threshold distance to be recognized:

```typescript
const isHorizontalSwipe = absDeltaX >= threshold && absDeltaX > absDeltaY;
const isVerticalSwipe = absDeltaY >= threshold && absDeltaY > absDeltaX;
```

### Duration Check

Swipes must complete within the maximum duration to avoid triggering on slow drags:

```typescript
const duration = Date.now() - startTime;
if (duration > maxDuration) return; // Too slow, ignore
```

## Best Practices

### Do's ✅

1. **Set appropriate thresholds**: Use 50-75px for most cases
2. **Provide visual feedback**: Show swipe direction or progress
3. **Test on real devices**: Emulators don't capture touch nuances
4. **Consider accessibility**: Provide alternative keyboard/button controls
5. **Use preventDefault carefully**: Only when necessary to avoid conflicts

### Don'ts ❌

1. **Don't use very low thresholds**: < 30px can trigger accidentally
2. **Don't rely solely on swipes**: Always provide button alternatives
3. **Don't forget edge cases**: Handle first/last items in lists
4. **Don't block scrolling**: Be careful with preventDefault
5. **Don't use for critical actions**: Swipes can be accidental

## Accessibility Considerations

Swipe gestures are not accessible to all users. Always provide alternative methods:

```tsx
function AccessibleGallery() {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: nextImage,
    onSwipeRight: previousImage,
  });

  return (
    <div>
      {/* Swipe-enabled area */}
      <div {...swipeHandlers}>
        <img src={currentImage} alt="Gallery" />
      </div>
      
      {/* Alternative button controls */}
      <div className="controls">
        <button onClick={previousImage} aria-label="Previous image">
          ← Previous
        </button>
        <button onClick={nextImage} aria-label="Next image">
          Next →
        </button>
      </div>
    </div>
  );
}
```

## Performance

The hook is optimized for performance:

- **Minimal re-renders**: Uses refs to store touch data
- **No dependencies**: Callbacks are memoized with useCallback
- **Lightweight**: < 2KB minified
- **No memory leaks**: Properly cleans up on unmount

## Browser Support

Works on all modern browsers with touch support:

- ✅ iOS Safari 10+
- ✅ Android Chrome 60+
- ✅ Samsung Internet 8+
- ✅ Firefox Mobile 60+

## Testing

The hook includes comprehensive unit tests:

```bash
npm test -- src/hooks/__tests__/useSwipeGesture.test.ts
```

Tests cover:
- All four swipe directions
- Threshold validation
- Duration validation
- Direction prioritization
- preventDefault option
- Consecutive swipes

## Related Components

- `SwipeableDrawer`: Drawer component using this hook
- `MobileNavigation`: Navigation with swipe support
- `GameMap`: Map with touch pan/zoom

## License

Part of the Vietnamese Historical Strategy Game project.

