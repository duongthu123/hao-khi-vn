# Animation Accessibility Implementation

## Overview

This document describes the animation accessibility system implemented for the Next.js Game Migration project. The system allows users to disable animations for accessibility or performance reasons, and respects browser preferences for reduced motion.

## Requirements Validated

- **Requirement 6.8**: Allow animations to be disabled for accessibility or performance
- **Requirement 22.6**: Allow disabling animations for motion sensitivity

## Architecture

### 1. User Settings

Animation preferences are stored in the global game state via Zustand:

```typescript
// src/store/slices/uiSlice.ts
interface Settings {
  animationsEnabled: boolean;
  // ... other settings
}
```

Users can toggle animations via the Settings Menu:
- Vietnamese: "Hiệu ứng chuyển động"
- English: "Animations"

### 2. Animation Hook

The `useAnimations` hook combines user settings with browser preferences:

```typescript
// src/hooks/useAnimations.ts
export function useAnimations(): boolean {
  const animationsEnabled = useGameStore((state) => state.ui.settings.animationsEnabled);
  const prefersReducedMotion = useReducedMotion(); // From Framer Motion
  
  // Animations enabled only if:
  // 1. User has enabled animations in settings
  // 2. Browser does not prefer reduced motion
  return animationsEnabled && !prefersReducedMotion;
}
```

### 3. Global Configuration

The `Providers` component configures Framer Motion globally:

```typescript
// src/components/providers/Providers.tsx
<MotionConfig
  reducedMotion={animationsEnabled ? "user" : "always"}
  transition={
    animationsEnabled
      ? { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }
      : { duration: 0 }
  }
>
  {children}
</MotionConfig>
```

## Component Implementation

### Components with Animation Accessibility

The following components have been updated to respect animation settings:

#### Core UI Components
1. **NotificationToast** - Toast notifications with enter/exit animations
2. **Modal** - Modal dialogs with overlay and content animations
3. **FloatingText** - Resource change indicators
4. **RankUpAnimation** - Rank progression celebrations

#### Game Components
5. **ResourceDisplay** - Resource counters and progress bars
6. **StatusEffectIndicator** - Status effect icons with pulsing animations
7. **CombatAnimations** - Combat visual effects

### Implementation Pattern

All components follow this pattern:

```typescript
import { useAnimations } from '@/hooks/useAnimations';

export function MyComponent() {
  const shouldAnimate = useAnimations();
  
  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={shouldAnimate ? { opacity: 0, scale: 0.8 } : { opacity: 0 }}
      transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
    >
      {/* Content */}
    </motion.div>
  );
}
```

Key points:
- `initial={shouldAnimate ? {...} : false}` - No initial animation when disabled
- `exit={shouldAnimate ? {...} : { opacity: 0 }}` - Instant exit when disabled
- `transition={shouldAnimate ? {...} : { duration: 0 }}` - Zero duration when disabled
- `whileHover={shouldAnimate ? {...} : undefined}` - No hover animations when disabled

## Feature Functionality Without Animations

All game features work correctly with animations disabled:

### Resource Management
- Resource counters update instantly
- Progress bars fill immediately
- Low resource warnings still appear
- Tooltips display without animation

### Combat System
- Combat calculations execute normally
- Unit health updates immediately
- Status effects apply without animation
- Combat log updates in real-time

### Rank Progression
- Rank increases are processed
- Experience points are awarded
- Notifications appear instantly
- Profile updates immediately

### Notifications
- Toasts appear instantly
- Messages are readable
- Dismiss functionality works
- Queue management functions

### Save/Load System
- Save operations complete
- Load operations restore state
- Auto-save triggers normally
- Import/export functions work

## Browser Preference Detection

The system automatically detects the browser's `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  /* User prefers reduced motion */
}
```

Framer Motion's `useReducedMotion()` hook handles this detection, and the `useAnimations` hook respects it.

## Testing

### Unit Tests

**src/hooks/__tests__/useAnimations.test.ts**
- Tests animation enable/disable logic
- Tests browser preference detection
- Tests animation config generation

### Integration Tests

**src/__tests__/animation-accessibility.integration.test.tsx**
- Tests user settings control
- Tests browser preference respect
- Tests feature functionality without animations
- Tests settings persistence
- Tests accessibility compliance

### Component Tests

Each component with animations has tests verifying:
- Animations work when enabled
- Components function without animations
- Settings are respected
- No errors occur when animations are disabled

## User Experience

### With Animations Enabled
- Smooth spring-based transitions
- 60 FPS performance target
- Natural motion feel
- Visual feedback for actions

### With Animations Disabled
- Instant state changes
- Zero animation duration
- Immediate visual feedback
- Reduced CPU/GPU usage
- Better for motion sensitivity
- Better for low-end devices

## Performance Considerations

### Animation Disabled Benefits
- Reduced CPU usage (no animation calculations)
- Reduced GPU usage (no transform animations)
- Lower battery consumption on mobile
- Faster perceived performance
- Better for accessibility

### Implementation Efficiency
- Global configuration via MotionConfig
- Single hook for all components
- No unnecessary re-renders
- Conditional animation props
- Zero-duration transitions instead of removing elements

## Accessibility Compliance

### WCAG 2.1 Guidelines

**Success Criterion 2.3.3 Animation from Interactions (Level AAA)**
- Motion animation triggered by interaction can be disabled
- User has control via settings
- Browser preferences are respected

**Success Criterion 2.2.2 Pause, Stop, Hide (Level A)**
- Animations can be disabled globally
- No auto-playing animations when disabled
- User control is provided

### Best Practices
- Settings are persistent across sessions
- Clear labeling in Vietnamese and English
- Immediate effect when toggled
- No page reload required
- Works with screen readers

## Future Enhancements

### Potential Improvements
1. **Granular Control**: Separate settings for different animation types
   - UI animations (modals, menus)
   - Game animations (combat, effects)
   - Notification animations

2. **Performance Mode**: Auto-disable animations on low-end devices

3. **Animation Speed**: Allow users to adjust animation speed (slow, normal, fast)

4. **Per-Component Control**: Advanced settings for power users

5. **Animation Presets**: 
   - Full animations
   - Reduced animations
   - Essential only
   - None

## Maintenance

### Adding New Animated Components

When creating new components with animations:

1. Import the hook:
   ```typescript
   import { useAnimations } from '@/hooks/useAnimations';
   ```

2. Use the hook:
   ```typescript
   const shouldAnimate = useAnimations();
   ```

3. Apply conditionally:
   ```typescript
   initial={shouldAnimate ? { opacity: 0 } : false}
   transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
   ```

4. Test both states:
   - With animations enabled
   - With animations disabled
   - With browser preference set

### Code Review Checklist

- [ ] Component imports `useAnimations` hook
- [ ] All motion props are conditional
- [ ] Component functions without animations
- [ ] Tests cover both animation states
- [ ] No console errors when animations disabled
- [ ] Performance is acceptable in both modes

## Conclusion

The animation accessibility system provides a robust, user-friendly way to control animations throughout the application. It respects user preferences, browser settings, and accessibility requirements while maintaining full functionality in all modes.

The implementation is:
- **Accessible**: Respects WCAG guidelines and user preferences
- **Performant**: Reduces resource usage when disabled
- **Maintainable**: Simple pattern for developers
- **Testable**: Comprehensive test coverage
- **User-friendly**: Clear controls and immediate effect
