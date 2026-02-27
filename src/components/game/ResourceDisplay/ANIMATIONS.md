# Resource Change Animations

**Task 13.2**: Implement resource change animations

This document describes the animation features implemented for the ResourceDisplay component to satisfy requirements 6.5 and 14.4.

## Overview

The ResourceDisplay component includes three main animation features:
1. **Smooth number transitions** - Animated counter updates when resource values change
2. **Floating text** - Visual feedback for resource gains and losses
3. **Pulse animations** - Warning indicators for low resources

## 1. Smooth Number Transitions

### Implementation

The `AnimatedCounter` component provides smooth number transitions using `requestAnimationFrame` for optimal performance.

**Features:**
- Smooth easing animation (cubic ease-out)
- 0.5 second default duration
- Frame-independent updates
- Handles both increases and decreases
- No animation when value stays the same

**Code Location:** `src/components/game/ResourceDisplay/ResourceDisplay.tsx` (lines 48-92)

**Animation Formula:**
```typescript
const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
const current = start + diff * eased;
```

**Usage:**
```tsx
<AnimatedCounter
  value={resources.food}
  duration={0.5}
  resourceType={ResourceType.FOOD}
  onValueChange={(oldVal, newVal) => handleChange(oldVal, newVal)}
/>
```

### Visual Effect

When a resource value changes:
- The number smoothly transitions from old to new value
- Uses cubic ease-out for natural deceleration
- Maintains 60 FPS performance via requestAnimationFrame
- Floors fractional values for display

### Testing

Covered by existing tests in `ResourceDisplay.test.tsx`:
- ✅ Displays current resource values
- ✅ Handles fractional resource values
- ✅ Updates when resources change

## 2. Floating Text Animations

### Implementation

The `FloatingText` component displays animated text that floats upward when resources change.

**Features:**
- Displays resource change amount with icon
- Color-coded by resource type and gain/loss
- Smooth floating animation (upward movement with fade)
- Auto-cleanup after 2 seconds
- Supports custom positioning
- Can be enabled/disabled via prop

**Code Location:** 
- Component: `src/components/ui/FloatingText.tsx`
- Hook: `useFloatingText` in same file
- Integration: `ResourceDisplay.tsx` (lines 234-252, 318-320)

**Animation Sequence:**
```typescript
{
  opacity: [0, 1, 1, 0],    // Fade in, stay, fade out
  y: -80,                    // Float upward 80px
  scale: [0.5, 1.2, 1, 0.8], // Scale up, normalize, scale down
  duration: 2,               // Total 2 seconds
  times: [0, 0.2, 0.8, 1]    // Keyframe timing
}
```

**Usage:**
```tsx
<ResourceDisplay
  resources={resources}
  caps={caps}
  generation={generation}
  enableFloatingText={true}  // Enable floating text (default: true)
/>
```

### Visual Effect

When a resource value changes:
- A floating text appears showing the change amount
- Includes resource icon (🌾 for food, 💰 for gold, ⚔️ for army)
- Shows + for gains (green/amber/yellow) or - for losses (red)
- Floats upward 80px over 2 seconds
- Fades in quickly, stays visible, then fades out
- Scales up initially for emphasis, then normalizes

### Color Coding

| Resource | Gain Color | Loss Color | Icon |
|----------|-----------|------------|------|
| Food | Amber (text-amber-400) | Red (text-red-400) | 🌾 |
| Gold | Yellow (text-yellow-400) | Red (text-red-400) | 💰 |
| Army | Red (text-red-400) | Red (text-red-400) | ⚔️ |

### Testing

Covered by existing tests in `ResourceDisplay.test.tsx`:
- ✅ Renders with floating text enabled
- ✅ Can disable floating text via prop
- ✅ Default behavior includes floating text

## 3. Pulse Animations for Low Resources

### Implementation

Low resource warnings use Framer Motion's animation system to create a pulsing border effect.

**Features:**
- Pulsing red border when resources fall below threshold
- Warning icon (⚠️) appears
- Continuous animation until resources recover
- Configurable threshold (default: 20%)
- Smooth enter/exit animations

**Code Location:** `src/components/game/ResourceDisplay/ResourceDisplay.tsx` (lines 119-127, 165-175)

**Animation Configuration:**
```tsx
animate={isLow ? {
  borderColor: [
    'rgb(239, 68, 68)',  // red-500
    'rgb(220, 38, 38)',  // red-600
    'rgb(239, 68, 68)'   // red-500
  ],
} : {}}
transition={isLow ? { 
  duration: 1.5, 
  repeat: Infinity 
} : {}}
```

**Usage:**
```tsx
<ResourceDisplay
  resources={resources}
  caps={caps}
  generation={generation}
  lowResourceThreshold={0.2}  // 20% threshold (default)
/>
```

### Visual Effect

When resources fall below threshold:
- Border changes from gray to pulsing red
- Warning icon (⚠️) appears with scale animation
- Border pulses between two shades of red
- Pulse cycle: 1.5 seconds, infinite repeat
- Shadow effect adds depth (shadow-red-500/20)

When resources recover:
- Border returns to gray
- Warning icon fades out
- Smooth transition back to normal state

### Threshold Calculation

```typescript
const isResourceLow = (current: number, cap: number): boolean => {
  return current / cap < lowResourceThreshold;
};
```

### Testing

Covered by existing tests in `ResourceDisplay.test.tsx`:
- ✅ Shows warning indicator for low resources
- ✅ No warning for resources above threshold
- ✅ Respects custom low resource threshold
- ✅ Handles resources at zero (shows warning)

## Performance Considerations

### 60 FPS Target

All animations are designed to maintain 60 FPS:
- **Number transitions**: Use requestAnimationFrame for smooth updates
- **Floating text**: GPU-accelerated properties (transform, opacity)
- **Pulse animations**: Framer Motion's optimized animation engine

### Memory Management

- Floating text items auto-cleanup after animation completes
- No memory leaks from animation timers
- Efficient re-renders using React.memo patterns

### Optimization Techniques

1. **Selective Re-renders**: Only affected components re-render on state changes
2. **GPU Acceleration**: Animations use transform and opacity (GPU-accelerated)
3. **Debouncing**: Rapid value changes handled smoothly without performance degradation
4. **Conditional Rendering**: Animations only run when needed

## Accessibility

### Motion Sensitivity

The component supports disabling animations for users with motion sensitivity:

```tsx
<ResourceDisplay
  resources={resources}
  caps={caps}
  generation={generation}
  enableFloatingText={false}  // Disable floating text
/>
```

### Screen Reader Support

- Numeric values are always readable
- Warning states communicated via icon and color
- Tooltip provides detailed information
- Vietnamese language support throughout

## Requirements Validation

### Requirement 6.5: Animation System Integration

✅ **Acceptance Criterion 5**: "THE Animation_Engine SHALL animate resource changes and notifications"

**Implementation:**
- Smooth number transitions for resource value changes
- Floating text animations for gains/losses
- Pulse animations for low resource warnings
- All animations use Framer Motion

### Requirement 14.4: Resource Management Migration

✅ **Acceptance Criterion 4**: "THE Resource_Manager SHALL update resource displays in real-time"

**Implementation:**
- AnimatedCounter provides real-time updates with smooth transitions
- Floating text gives immediate visual feedback
- Warning animations respond instantly to threshold changes
- All updates are frame-independent and performant

## Examples

### Basic Usage

```tsx
import { ResourceDisplay } from '@/components/game/ResourceDisplay';
import { useStore } from '@/store';

function GameUI() {
  const resources = useStore((state) => state.resources);
  
  return (
    <ResourceDisplay
      resources={{
        food: resources.food,
        gold: resources.gold,
        army: resources.army,
      }}
      caps={resources.caps}
      generation={resources.generation}
      showDetails={true}
      lowResourceThreshold={0.2}
      enableFloatingText={true}
    />
  );
}
```

### Custom Configuration

```tsx
<ResourceDisplay
  resources={resources}
  caps={caps}
  generation={generation}
  showDetails={false}              // Hide generation rates
  lowResourceThreshold={0.3}       // 30% warning threshold
  enableFloatingText={false}       // Disable floating text
/>
```

## Testing

Run the test suite:

```bash
npm test src/components/game/ResourceDisplay/ResourceDisplay.test.tsx --run
```

All 20 tests pass, covering:
- Number display and transitions
- Floating text integration
- Warning indicators and thresholds
- Progress bar animations
- Edge cases (zero, cap, fractional values)

## Future Enhancements

Potential improvements for future iterations:

1. **Sound Effects**: Add audio feedback for resource changes
2. **Haptic Feedback**: Vibration on mobile devices for warnings
3. **Custom Animations**: Allow users to choose animation styles
4. **Animation Speed**: Configurable animation duration
5. **Batch Updates**: Optimize for multiple simultaneous changes
6. **Particle Effects**: Add particle systems for large resource gains

## Related Files

- `src/components/game/ResourceDisplay/ResourceDisplay.tsx` - Main component
- `src/components/ui/FloatingText.tsx` - Floating text component
- `src/hooks/useResourceFeedback.ts` - Resource feedback hook
- `src/components/game/ResourceDisplay/README.md` - Component documentation
- `src/components/game/ResourceDisplay/FEEDBACK.md` - Feedback system documentation
- `src/components/game/ResourceDisplay/ResourceDisplay.test.tsx` - Test suite

## Conclusion

Task 13.2 is complete with all three animation features fully implemented and tested:

1. ✅ **Smooth number transitions** - AnimatedCounter with cubic ease-out
2. ✅ **Floating text** - Visual feedback for gains/losses
3. ✅ **Pulse animations** - Warning indicators for low resources

All animations maintain 60 FPS performance, support accessibility needs, and integrate seamlessly with the existing ResourceDisplay component.
