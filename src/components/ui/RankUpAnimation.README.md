# Rank-Up Animation System

## Overview

The rank-up animation system provides celebratory visual and audio feedback when players achieve rank promotions. It consists of enhanced particle effects, confetti, light rays, and sound effects to create an engaging celebration experience.

**Validates Requirements:**
- 18.6: Award rank promotions based on performance
- 18.8: Update displays immediately

## Components

### RankUpAnimation

The main animation component that displays the celebration when a player ranks up.

**Features:**
- **Enhanced Particle System**: 40 colored particles exploding in a circular pattern
- **Confetti Effect**: 30 falling confetti pieces with random colors and rotations
- **Light Rays**: 12 animated rays emanating from the center
- **Rank Badge**: Large animated badge with rank icon and gradient colors
- **Multiple Glow Layers**: Enhanced glow effects with pulsing animations
- **Rotating Ring**: Animated border ring around the badge
- **Decorative Stars**: 8 stars arranged in a circular pattern
- **Sound Effect**: Plays triumphant rank-up sound

**Props:**
```typescript
interface RankUpAnimationProps {
  newRank: string;        // The new rank name (e.g., "Chiến Binh")
  onComplete?: () => void; // Callback when animation completes
  duration?: number;       // Animation duration in ms (default: 4000)
}
```

**Usage:**
```tsx
import { RankUpAnimation } from '@/components/ui';

<RankUpAnimation 
  newRank="Đại Tướng"
  onComplete={() => console.log('Animation complete')}
  duration={4000}
/>
```

### RankUpAnimationContainer

A container component that connects the animation to the Zustand store state.

**Features:**
- Automatically shows/hides based on store state
- Handles animation completion
- No props required - fully controlled by store

**Usage:**
```tsx
import { RankUpAnimationContainer } from '@/components/ui';

// In your app layout or game component
<RankUpAnimationContainer />
```

## Store Integration

### UI Slice State

The rank-up animation state is managed in the UI slice:

```typescript
ui: {
  rankUpAnimation: {
    isVisible: boolean;
    newRank: string | null;
  }
}
```

### Actions

**showRankUpAnimation(newRank: string)**
- Shows the rank-up animation with the specified rank
- Called automatically by the profile slice when rank changes

**hideRankUpAnimation()**
- Hides the rank-up animation
- Called automatically when animation completes

### Profile Slice Integration

The profile slice automatically triggers the rank-up animation when a player's rank changes:

```typescript
calculateRank: (addNotification) => {
  // ... rank calculation logic ...
  
  if (newRank !== oldRank) {
    // Update rank
    set((state) => ({
      profile: { ...state.profile, rank: newRank },
    }));
    
    // Trigger animation
    const fullState = get() as any;
    if (fullState.showRankUpAnimation) {
      fullState.showRankUpAnimation(newRank);
    }
  }
}
```

## Rank System

### Rank Thresholds

The game uses the following rank progression:

| Level | Rank Name | Icon | Color Gradient |
|-------|-----------|------|----------------|
| 1 | Tân Binh (Recruit) | 🎯 | Gray |
| 5 | Chiến Binh (Warrior) | 🎯 | Gray |
| 10 | Đội Trưởng (Squad Leader) | 🛡️ | Green |
| 15 | Tiểu Đội Trưởng (Platoon Leader) | 🛡️ | Green |
| 20 | Đại Đội Trưởng (Company Commander) | 🛡️ | Green |
| 25 | Tiểu Tướng (Junior General) | 🎖️ | Blue |
| 30 | Trung Tướng (Middle General) | 🎖️ | Blue |
| 35 | Đại Tướng (Senior General) | ⭐ | Purple |
| 40 | Nguyên Soái (Marshal) | 👑 | Gold/Red |

### Rank Icons

- **👑 Crown**: Nguyên Soái (highest rank)
- **⭐ Star**: Đại Tướng
- **🎖️ Medal**: Tướng ranks
- **🛡️ Shield**: Đội Trưởng ranks
- **🎯 Target**: Lower ranks

### Color Gradients

Each rank tier has a unique gradient:
- **Nguyên Soái**: Yellow → Orange → Red (most prestigious)
- **Đại Tướng**: Purple → Pink → Purple
- **Tướng**: Blue → Cyan → Blue
- **Đội Trưởng**: Green → Emerald → Green
- **Default**: Gray

## Animation Details

### Particle Effects

**Explosion Particles (40 particles)**:
- Radial explosion pattern
- 5 colors: yellow, orange, red, pink, purple
- 2-second duration with staggered delays
- Scale animation: 0 → 1.5 → 0

**Confetti (30 pieces)**:
- Fall from top to bottom
- Random horizontal positions
- Random rotation (up to 720°)
- 5 colors: yellow, blue, red, green, purple
- 2-3 second duration

### Light Rays

- 12 rays arranged in a circle
- Gradient from rank color to transparent
- Scale animation from center outward
- Staggered appearance

### Badge Animation

**Entry Animation**:
- Rotate from -180° to 0°
- Scale from 0 to 1
- Spring physics for natural motion

**Glow Effects**:
- Multiple blur layers (blur-xl, blur-2xl)
- Pulsing scale and opacity
- Infinite loop with different timings

**Rotating Ring**:
- Continuous 360° rotation
- Pulsing scale effect
- Semi-transparent white border

### Text Animations

**"THĂNG CẤP BẬC!" (Rank Up!)**:
- Scale bounce: 0.8 → 1.2 → 1
- Yellow color with drop shadow

**Rank Name**:
- Gradient text with rank colors
- Scale and fade-in animation
- Large, bold display

**Congratulations Message**:
- Simple fade-in
- Gray color for contrast

## Sound Effects

### Rank-Up Sound

**File**: `public/sounds/ui/rank-up.mp3`

**Specifications**:
- Duration: 2-3 seconds
- Type: Triumphant fanfare
- Volume: 0.8 (80%)
- Pool size: 1 (only one at a time)

**Recommendations**:
- Use traditional Vietnamese instruments (đàn tranh, đàn bầu)
- Celebratory and uplifting tone
- Clear, distinct sound that stands out
- Cultural authenticity for Vietnamese historical theme

### Implementation

The sound is played automatically when the animation mounts:

```typescript
useEffect(() => {
  soundManager.play(SoundEffect.RANK_UP);
  // ...
}, []);
```

## Accessibility

### Motion Sensitivity

The animation respects the user's animation preferences:

```typescript
const animationsEnabled = useGameStore(
  (state) => state.ui.settings.animationsEnabled
);

if (!animationsEnabled) {
  // Show simplified version or skip animation
}
```

### Screen Readers

The animation includes semantic HTML and ARIA labels for screen reader users.

## Performance Considerations

### Optimization Techniques

1. **Fixed Duration**: Animation auto-completes after 4 seconds
2. **Pointer Events**: `pointer-events-none` prevents interaction blocking
3. **GPU Acceleration**: Transform and opacity animations use GPU
4. **Cleanup**: Automatic cleanup on unmount
5. **Single Instance**: Only one animation can play at a time

### Frame Rate

The animation is designed to maintain 60 FPS on modern devices:
- Uses CSS transforms (GPU-accelerated)
- Framer Motion optimizations
- Reasonable particle counts

## Testing

### Unit Tests

Tests cover:
- Rendering with different ranks
- Sound effect playback
- Icon and gradient selection
- Particle and confetti rendering
- Animation completion callback
- Store integration

**Run tests:**
```bash
npm test -- src/components/ui/__tests__/RankUpAnimation.test.tsx
npm test -- src/components/ui/__tests__/RankUpAnimationContainer.test.tsx
```

## Integration Example

### In Game Layout

Add the container to your main game layout:

```tsx
import { RankUpAnimationContainer } from '@/components/ui';

export default function GameLayout({ children }) {
  return (
    <div>
      {children}
      <RankUpAnimationContainer />
    </div>
  );
}
```

### Triggering Rank-Up

The animation is triggered automatically when experience is added:

```tsx
import { useRankProgression } from '@/hooks/useRankProgression';

function GameComponent() {
  const { addExperience, addWin } = useRankProgression();
  
  const handleVictory = () => {
    addWin(); // Adds experience and checks for rank-up
  };
  
  return <button onClick={handleVictory}>Win Battle</button>;
}
```

## Future Enhancements

Potential improvements:
- Rank-specific sound effects
- More elaborate particle systems for higher ranks
- Achievement integration
- Replay animation option
- Screenshot/share functionality
- Localization for English version

## Vietnamese Cultural Context

The rank names reflect Vietnamese military hierarchy during the Trần Dynasty:
- **Nguyên Soái**: Supreme military commander
- **Đại Tướng**: Senior general
- **Tướng**: General ranks
- **Đội Trưởng**: Squad/unit leaders

The animation celebrates Vietnamese military tradition and honors the player's progression through historical ranks.
