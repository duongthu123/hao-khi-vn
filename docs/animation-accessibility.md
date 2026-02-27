# Animation Accessibility Feature

## Overview

This document describes the animation disable feature implemented to meet accessibility requirements 6.8 and 22.6. The feature allows users to disable animations for motion sensitivity or performance reasons, while ensuring all game features remain fully functional.

## Requirements Validated

- **Requirement 6.8**: THE Animation_Engine SHALL allow animations to be disabled for accessibility or performance
- **Requirement 22.6**: THE Game_Application SHALL allow disabling animations for motion sensitivity

## Implementation

### 1. User Settings

Users can control animations through the Settings Menu (Cài đặt):

- **Location**: Settings Menu → Visual Settings (Hình ảnh)
- **Control**: "Hiệu ứng chuyển động / Animations" checkbox
- **Default**: Enabled (checked)

### 2. Browser Preference Support

The system automatically respects the browser's `prefers-reduced-motion` media query:

- If the user's operating system or browser is set to prefer reduced motion, animations will be disabled automatically
- This works in conjunction with the user setting (both must allow animations for them to be enabled)

### 3. Technical Implementation

#### Core Hook: `useAnimations()`

Located in `src/hooks/useAnimations.ts`, this hook combines user settings and browser preferences:

```typescript
export function useAnimations(): boolean {
  const animationsEnabled = useGameStore((state) => state.ui.settings.animationsEnabled);
  const prefersReducedMotion = useReducedMotion();
  
  // Animations are enabled only if:
  // 1. User has enabled animations in settings
  // 2. Browser does not prefer reduced motion
  return animationsEnabled && !prefersReducedMotion;
}
```

#### Global Configuration

The `Providers` component configures Framer Motion globally:

```typescript
<MotionConfig
  reducedMotion={animationsEnabled ? "user" : "always"}
  transition={
    animationsEnabled
      ? { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }
      : { duration: 0 }
  }
>
```

### 4. Component Integration

All animated components respect the animation setting:

#### CombatAnimations
- Uses `useAnimations()` hook
- Returns `null` when animations are disabled
- All combat events still process correctly

#### FloatingText
- Uses `useAnimations()` hook
- Returns `null` when animations are disabled
- Resource changes still update correctly

#### RankUpAnimation
- Uses `useAnimations()` hook
- Shows static celebration screen when animations are disabled
- All text and information remains visible
- Sound effects still play

#### Other Components
- All components using Framer Motion automatically respect the global `MotionConfig`
- Transitions become instant (duration: 0) when animations are disabled

## Feature Guarantees

### 1. Full Functionality Without Animations

All game features work identically with or without animations:

- ✅ Resource management and updates
- ✅ Combat system and unit interactions
- ✅ Hero selection and management
- ✅ Quiz and training modes
- ✅ Collection and gacha system
- ✅ Profile and rank progression
- ✅ Save/load functionality
- ✅ Research and upgrades
- ✅ AI opponent behavior

### 2. Accessibility Compliance

The implementation ensures:

- Users with motion sensitivity can disable all animations
- Browser preferences are automatically respected
- Static alternatives are provided for important visual feedback
- Screen reader compatibility is maintained
- All information remains accessible without animations

### 3. Performance Benefits

Disabling animations can improve performance on:

- Lower-end devices
- Mobile devices with limited resources
- Systems with many concurrent processes
- Situations with poor graphics performance

## User Experience

### With Animations Enabled (Default)

- Smooth transitions between screens
- Animated combat effects and damage numbers
- Floating text for resource changes
- Celebration animations for achievements
- Particle effects and visual polish

### With Animations Disabled

- Instant transitions (no delay)
- Static display of combat results
- Immediate resource updates
- Simple notification displays
- All information clearly visible

## Testing

Comprehensive tests verify the feature:

### Unit Tests

- `src/hooks/__tests__/useAnimations.test.ts` - Hook behavior
- `src/components/game/__tests__/SettingsMenu.test.tsx` - Settings UI
- `src/components/ui/__tests__/FloatingText.test.tsx` - Component behavior
- `src/components/ui/__tests__/RankUpAnimation.accessibility.test.tsx` - Accessibility

### Integration Tests

- `src/__tests__/animation-accessibility.integration.test.tsx` - End-to-end functionality

All tests verify:
- User can toggle animations
- Browser preferences are respected
- All features work without animations
- Settings persist correctly

## Browser Support

The feature works across all modern browsers:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

The `prefers-reduced-motion` media query is supported in:
- Chrome 74+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Configuration

### Default Settings

```typescript
{
  animationsEnabled: true,  // Animations on by default
  // ... other settings
}
```

### Changing Defaults

To change the default animation setting, modify `src/store/slices/uiSlice.ts`:

```typescript
const initialUIState = {
  settings: {
    animationsEnabled: false,  // Change to false to disable by default
    // ...
  },
};
```

## Future Enhancements

Potential improvements for future versions:

1. **Granular Control**: Allow users to disable specific animation types (e.g., combat only, UI only)
2. **Performance Mode**: Automatic animation reduction based on detected frame rate
3. **Animation Speed**: Allow users to adjust animation speed rather than just on/off
4. **Per-Component Settings**: Fine-grained control over individual animation features

## Related Files

### Core Implementation
- `src/hooks/useAnimations.ts` - Main hook
- `src/components/providers/Providers.tsx` - Global configuration
- `src/store/slices/uiSlice.ts` - Settings state

### Component Updates
- `src/components/game/CombatAnimations/CombatAnimations.tsx`
- `src/components/ui/FloatingText.tsx`
- `src/components/ui/RankUpAnimation.tsx`
- `src/components/game/SettingsMenu.tsx`

### Tests
- `src/hooks/__tests__/useAnimations.test.ts`
- `src/components/game/__tests__/SettingsMenu.test.tsx`
- `src/components/ui/__tests__/FloatingText.test.tsx`
- `src/components/ui/__tests__/RankUpAnimation.accessibility.test.tsx`
- `src/__tests__/animation-accessibility.integration.test.tsx`

## Conclusion

The animation accessibility feature provides a robust, user-friendly way to control animations while maintaining full game functionality. It respects both user preferences and browser settings, ensuring an accessible experience for all players.
