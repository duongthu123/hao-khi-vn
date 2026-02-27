# useOrientation Hook

## Overview

The `useOrientation` hook detects and responds to screen orientation changes on mobile and tablet devices. It provides the current orientation state and triggers callbacks when the orientation changes, enabling responsive layout adaptations for portrait and landscape modes.

**Validates Requirement 20.7**: Handle screen orientation changes

## Features

- ✅ Detects portrait and landscape orientations
- ✅ Provides orientation angle (0°, 90°, 180°, 270°)
- ✅ Triggers callbacks on orientation change
- ✅ Debounced event handling to prevent rapid firing
- ✅ SSR-safe (works with Next.js server-side rendering)
- ✅ Supports modern Screen Orientation API and legacy fallbacks
- ✅ Maintains game state during orientation changes

## API

### Parameters

```typescript
interface OrientationConfig {
  /** Callback fired when orientation changes */
  onChange?: (orientation: OrientationType) => void;
  /** Debounce delay in ms to prevent rapid firing (default: 100) */
  debounceDelay?: number;
}
```

### Return Value

```typescript
interface OrientationState {
  /** Current orientation type */
  orientation: OrientationType; // 'portrait' | 'landscape'
  /** True if device is in portrait mode */
  isPortrait: boolean;
  /** True if device is in landscape mode */
  isLandscape: boolean;
  /** Angle of the screen orientation (0, 90, 180, 270) */
  angle: number;
}
```

## Usage Examples

### Basic Usage

```tsx
import { useOrientation } from '@/hooks/useOrientation';

function MyComponent() {
  const { orientation, isPortrait, isLandscape } = useOrientation();

  return (
    <div>
      <p>Current orientation: {orientation}</p>
      <p>Is portrait: {isPortrait ? 'Yes' : 'No'}</p>
      <p>Is landscape: {isLandscape ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### With Callback

```tsx
import { useOrientation } from '@/hooks/useOrientation';

function GameComponent() {
  const { orientation } = useOrientation({
    onChange: (newOrientation) => {
      console.log('Orientation changed to:', newOrientation);
      // Adapt game layout, pause game, etc.
    }
  });

  return (
    <div className={orientation === 'portrait' ? 'portrait-layout' : 'landscape-layout'}>
      {/* Game content */}
    </div>
  );
}
```

### Conditional Rendering

```tsx
import { useOrientation } from '@/hooks/useOrientation';

function ResponsiveGame() {
  const { isPortrait, isLandscape } = useOrientation();

  return (
    <div>
      {isPortrait && (
        <div className="flex flex-col">
          {/* Portrait layout: stacked vertically */}
          <GameMap />
          <GameControls />
        </div>
      )}
      
      {isLandscape && (
        <div className="flex flex-row">
          {/* Landscape layout: side by side */}
          <GameMap />
          <GameControls />
        </div>
      )}
    </div>
  );
}
```

### With Custom Debounce

```tsx
import { useOrientation } from '@/hooks/useOrientation';

function SensitiveComponent() {
  // Increase debounce delay for less frequent updates
  const { orientation } = useOrientation({
    debounceDelay: 300,
    onChange: (orientation) => {
      // This will only fire 300ms after orientation stabilizes
      performExpensiveOperation(orientation);
    }
  });

  return <div>{/* Component content */}</div>;
}
```

### Orientation-Specific Styling

```tsx
import { useOrientation } from '@/hooks/useOrientation';
import { cn } from '@/lib/utils';

function StyledComponent() {
  const { isPortrait } = useOrientation();

  return (
    <div className={cn(
      'game-container',
      isPortrait ? 'h-screen w-full' : 'h-full w-screen',
      isPortrait ? 'flex-col' : 'flex-row'
    )}>
      {/* Content adapts to orientation */}
    </div>
  );
}
```

## Implementation Details

### Detection Strategy

The hook uses a multi-layered approach to detect orientation:

1. **Modern API**: Uses `window.screen.orientation.type` if available
2. **Dimension Fallback**: Compares `window.innerHeight` vs `window.innerWidth`
3. **Angle Detection**: Uses `window.screen.orientation.angle` or legacy `window.orientation`

### Event Handling

The hook listens to multiple events for maximum compatibility:

- `screen.orientation.change` (modern browsers)
- `orientationchange` (legacy browsers)
- `resize` (universal fallback)

### Debouncing

Orientation changes trigger multiple events in rapid succession. The hook debounces these events to:

- Prevent unnecessary re-renders
- Avoid layout thrashing
- Ensure stable orientation state

Default debounce delay: 100ms (configurable)

### SSR Safety

The hook is safe to use with Next.js server-side rendering:

- Returns default values during SSR
- Checks for `window` availability
- Only attaches event listeners in browser

## Browser Support

| Feature | Support |
|---------|---------|
| Screen Orientation API | Modern browsers (Chrome 38+, Firefox 43+, Safari 16.4+) |
| Legacy orientationchange | All mobile browsers |
| Resize fallback | Universal |

The hook gracefully degrades to fallback methods in older browsers.

## Performance Considerations

### Debouncing

The default 100ms debounce prevents excessive re-renders during orientation transitions. Adjust based on your needs:

- **Lower delay (50ms)**: More responsive, more re-renders
- **Higher delay (200-300ms)**: Less responsive, fewer re-renders

### Event Listeners

The hook efficiently manages event listeners:

- Attaches listeners only once
- Properly cleans up on unmount
- Uses passive event listeners where possible

### Re-render Optimization

The hook only triggers re-renders when orientation actually changes, not on every resize event.

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useOrientation } from './useOrientation';

test('detects portrait orientation', () => {
  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', { value: 375 });
  Object.defineProperty(window, 'innerHeight', { value: 667 });

  const { result } = renderHook(() => useOrientation());

  expect(result.current.orientation).toBe('portrait');
  expect(result.current.isPortrait).toBe(true);
  expect(result.current.isLandscape).toBe(false);
});

test('detects landscape orientation', () => {
  Object.defineProperty(window, 'innerWidth', { value: 667 });
  Object.defineProperty(window, 'innerHeight', { value: 375 });

  const { result } = renderHook(() => useOrientation());

  expect(result.current.orientation).toBe('landscape');
  expect(result.current.isPortrait).toBe(false);
  expect(result.current.isLandscape).toBe(true);
});

test('calls onChange callback', () => {
  const onChange = jest.fn();
  renderHook(() => useOrientation({ onChange }));

  // Simulate orientation change
  act(() => {
    window.dispatchEvent(new Event('orientationchange'));
  });

  expect(onChange).toHaveBeenCalled();
});
```

### Manual Testing

1. Open the app on a mobile device or use browser DevTools device emulation
2. Rotate the device between portrait and landscape
3. Verify layout adapts smoothly
4. Check that game state is preserved
5. Ensure no visual glitches during transition

## Integration with GameLayout

The `GameLayout` component uses this hook to adapt its layout:

```tsx
import { useOrientation } from '@/hooks/useOrientation';

export function GameLayout({ children }) {
  const { isPortrait, isLandscape } = useOrientation({
    onChange: (orientation) => {
      console.log('Layout adapting to:', orientation);
    }
  });

  return (
    <div className={isPortrait ? 'portrait-mode' : 'landscape-mode'}>
      {children}
    </div>
  );
}
```

## Best Practices

### 1. Use Conditional Rendering Sparingly

Avoid completely re-rendering components on orientation change. Instead, use CSS classes:

```tsx
// ❌ Bad: Re-renders entire component tree
{isPortrait ? <PortraitLayout /> : <LandscapeLayout />}

// ✅ Good: Same component, different styles
<Layout className={isPortrait ? 'portrait' : 'landscape'} />
```

### 2. Preserve State

Ensure game state persists during orientation changes:

```tsx
const { orientation } = useOrientation({
  onChange: () => {
    // Don't reset state here!
    // Just adapt layout
  }
});
```

### 3. Provide Visual Feedback

Show a brief transition indicator during orientation changes:

```tsx
const [isTransitioning, setIsTransitioning] = useState(false);

const { orientation } = useOrientation({
  onChange: () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  }
});

if (isTransitioning) {
  return <OrientationTransition />;
}
```

### 4. Test on Real Devices

Orientation behavior can differ between:
- Browser DevTools emulation
- iOS devices
- Android devices

Always test on real hardware when possible.

## Related Hooks

- `useSwipeGesture`: Touch gesture detection
- `useMediaQuery`: Responsive breakpoint detection
- `useWindowSize`: Window dimension tracking

## References

- [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)
- [Managing screen orientation](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Managing_screen_orientation)
- [Responsive design best practices](https://web.dev/responsive-web-design-basics/)

## Conclusion

The `useOrientation` hook provides a robust, performant solution for handling screen orientation changes in the Vietnamese Historical Strategy Game. It ensures the game adapts gracefully to portrait and landscape modes while maintaining game state and providing a smooth user experience.
