# Combat Animations System

## Overview

The Combat Animations system provides visual feedback for combat events in the game, including unit attacks, damage numbers, death animations, and ability effects. The system is built with Framer Motion and optimized for 60 FPS performance.

## Features

### 1. Attack Animations
- Flash effect at the point of impact
- Different colors for normal (orange) and critical (red) attacks
- Smooth scale and fade-out animation

### 2. Damage Number Animations
- Floating damage numbers that rise and fade
- Color-coded:
  - **Orange**: Normal damage
  - **Red**: Critical damage (with exclamation mark)
  - **Green**: Healing (with plus sign)
- Larger text for critical hits
- Text shadow and glow effects for visibility

### 3. Death Animations
- Skull emoji marker
- Rotating and shrinking effect
- Expanding ring effect for emphasis
- Red color scheme

### 4. Ability Effect Animations
- Purple burst effect with expanding rings
- Multiple concentric rings for visual impact
- Ability name display (if provided)
- Smooth fade-out

## Usage

### Basic Integration

```tsx
import { CombatAnimations } from '@/components/game/CombatAnimations';
import { CombatEvent } from '@/types/combat';

function CombatView() {
  const [combatLog, setCombatLog] = useState<CombatEvent[]>([]);

  return (
    <div className="relative">
      <CombatAnimations 
        events={combatLog}
        enabled={true}
        scale={1}
        offset={{ x: 0, y: 0 }}
      />
      {/* Your combat UI */}
    </div>
  );
}
```

### With Map Integration

```tsx
<CombatAnimations 
  events={combatLog}
  enabled={animationsEnabled}
  scale={mapZoom}
  offset={mapOffset}
  onAnimationComplete={(eventId) => {
    console.log('Animation completed:', eventId);
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `CombatEvent[]` | Required | Array of combat events to animate |
| `enabled` | `boolean` | `true` | Enable/disable animations |
| `scale` | `number` | `1` | Scale factor for positioning (useful for map zoom) |
| `offset` | `Vector2` | `{ x: 0, y: 0 }` | Offset for positioning (useful for map pan) |
| `onAnimationComplete` | `(eventId: string) => void` | - | Callback when animation completes |

## Combat Event Types

The system handles the following combat event types:

### ATTACK
Displays a flash effect at the attack location.

```typescript
{
  type: CombatEventType.ATTACK,
  timestamp: Date.now(),
  position: { x: 100, y: 100 },
  data: { isCritical: false }
}
```

### DAMAGE
Shows floating damage numbers.

```typescript
{
  type: CombatEventType.DAMAGE,
  timestamp: Date.now(),
  position: { x: 100, y: 100 },
  value: 50,
  data: { isCritical: false }
}
```

### HEAL
Displays healing numbers in green.

```typescript
{
  type: CombatEventType.HEAL,
  timestamp: Date.now(),
  position: { x: 100, y: 100 },
  value: 30
}
```

### DEATH
Shows death animation with skull marker.

```typescript
{
  type: CombatEventType.DEATH,
  timestamp: Date.now(),
  position: { x: 100, y: 100 }
}
```

### ABILITY_USED
Displays ability effect with optional name.

```typescript
{
  type: CombatEventType.ABILITY_USED,
  timestamp: Date.now(),
  position: { x: 100, y: 100 },
  data: { abilityName: 'Thunder Strike' }
}
```

## Performance Considerations

### 60 FPS Target
The animation system is designed to maintain 60 FPS:

1. **Efficient Rendering**: Uses Framer Motion's optimized animation engine
2. **AnimatePresence**: Properly manages component lifecycle
3. **Minimal Re-renders**: Only updates when new events are added
4. **Automatic Cleanup**: Removes completed animations from the DOM

### Reduced Motion Support
The system respects the user's `prefers-reduced-motion` setting:

```typescript
const shouldReduceMotion = useReducedMotion();
const animationsEnabled = enabled && !shouldReduceMotion;
```

### Memory Management
- Animations are automatically cleaned up after completion
- Event arrays are filtered to remove completed animations
- No memory leaks from lingering animation state

## Accessibility

### Motion Preferences
- Automatically detects and respects `prefers-reduced-motion`
- Can be manually disabled via the `enabled` prop
- Provides visual feedback even without animations

### Visual Clarity
- High contrast colors for damage types
- Text shadows for readability
- Large, bold text for important information
- Color-coded feedback (red = damage, green = heal, purple = ability)

## Customization

### Styling
All animations use Tailwind CSS classes and can be customized by modifying the component:

```tsx
// Example: Custom damage number color
<div className="text-custom-red-500">
  -{value}
</div>
```

### Animation Timing
Adjust animation durations in the component:

```tsx
transition={{ duration: 0.3, ease: 'easeOut' }}
```

### Visual Effects
Modify blur, glow, and shadow effects:

```tsx
className="blur-xl" // Adjust blur intensity
style={{ textShadow: '0 0 10px rgba(...)' }} // Custom glow
```

## Integration with Combat Engine

The combat animations work seamlessly with the combat engine:

```typescript
// In your combat logic
const result = processAttack(attacker, defender);

// Add events to combat log
setCombatLog(prev => [...prev, ...result.events]);

// Animations will automatically render based on events
```

## Testing

The component includes comprehensive tests:

```bash
npm test CombatAnimations.test.tsx
```

Tests cover:
- All animation types
- Critical hits and healing
- Multiple simultaneous animations
- Position transformations
- Animation completion callbacks
- Reduced motion support
- Edge cases (missing data, no position, etc.)

## Requirements Validation

This component validates the following requirements:

- **6.2**: Combat interaction animations
- **6.3**: Damage effect animations  
- **6.7**: 60 FPS performance
- **13.5**: Combat animations and effects

## Future Enhancements

Potential improvements:

1. **Particle Effects**: Add particle systems for more dramatic effects
2. **Sound Integration**: Sync animations with sound effects
3. **Custom Animation Curves**: More varied easing functions
4. **Animation Queuing**: Better handling of rapid events
5. **3D Effects**: CSS 3D transforms for depth
6. **Trail Effects**: Motion trails for fast-moving projectiles
