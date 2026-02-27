# Combat Sound Effects System

This module implements the combat sound effects system using Web Audio API with sound pooling for optimal performance during intense combat scenarios.

## Features

- **Web Audio API**: Low-latency sound playback using modern Web Audio API
- **Sound Pooling**: Prevents audio glitches by limiting concurrent sounds per effect type
- **Volume Controls**: Master volume control and per-sound volume adjustment
- **Mute Functionality**: Global mute/unmute with state persistence
- **Playback Rate Control**: Variable speed playback for sound variety
- **Automatic Cleanup**: Proper resource management and memory cleanup

## Sound Effect Types

The system supports the following combat sound effects:

- `ATTACK_MELEE` - Melee weapon attacks (swords, spears)
- `ATTACK_RANGED` - Ranged weapon attacks (bows, crossbows)
- `HIT_LIGHT` - Light damage impacts
- `HIT_HEAVY` - Heavy damage impacts
- `DEATH` - Unit death sounds
- `ABILITY_CAST` - Hero ability activation
- `ABILITY_IMPACT` - Ability impact/effect sounds
- `HEAL` - Healing effects
- `BUFF` - Positive status effects
- `DEBUFF` - Negative status effects

## Usage

### Basic Usage

```typescript
import { soundManager, SoundEffect } from '@/lib/audio/soundManager';

// Initialize (must be called after user interaction)
await soundManager.initialize();

// Play a sound
soundManager.play(SoundEffect.ATTACK_MELEE);

// Play with custom volume (0-1)
soundManager.play(SoundEffect.HIT_HEAVY, 0.7);

// Play with custom playback rate (0.5-2)
soundManager.play(SoundEffect.DEATH, 1, 1.2);
```

### Using the React Hook

```typescript
import { useSoundManager } from '@/hooks/useSoundManager';

function CombatComponent() {
  const { play, setMasterVolume, toggleMute, isMuted } = useSoundManager();

  const handleAttack = () => {
    play(SoundEffect.ATTACK_MELEE);
  };

  return (
    <div>
      <button onClick={handleAttack}>Attack</button>
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
      />
    </div>
  );
}
```

### Combat Event Integration

```typescript
import { useCombatSounds } from '@/hooks/useSoundManager';

function CombatView() {
  const { onAttack, onHit, onDeath, onAbility } = useCombatSounds(true);

  const processCombatEvent = (event: CombatEvent) => {
    switch (event.type) {
      case CombatEventType.ATTACK:
        onAttack(event.data.isMelee);
        break;
      case CombatEventType.DAMAGE:
        onHit(event.value, 100);
        break;
      case CombatEventType.DEATH:
        onDeath();
        break;
      case CombatEventType.ABILITY_USED:
        onAbility();
        break;
    }
  };

  // ... rest of component
}
```

### Helper Function

```typescript
import { playCombatSound } from '@/lib/audio/soundManager';

// Play melee attack
playCombatSound('attack', { isMelee: true });

// Play ranged attack
playCombatSound('attack', { isMelee: false });

// Play heavy hit
playCombatSound('hit', { isHeavy: true });

// Play with custom volume
playCombatSound('death', { volume: 0.8 });
```

## Sound Pooling

The system implements sound pooling to prevent audio glitches during intense combat:

- Each sound effect type has a configurable pool size
- When the pool is full, the oldest sound is stopped to make room
- Default pool sizes are optimized for typical combat scenarios:
  - Attack sounds: 5 concurrent
  - Hit sounds: 6-8 concurrent
  - Death sounds: 4 concurrent
  - Ability sounds: 3-4 concurrent

## Volume Control

### Master Volume

```typescript
// Set master volume (0-1)
soundManager.setMasterVolume(0.7);

// Get current master volume
const volume = soundManager.getMasterVolume();
```

### Per-Sound Volume

```typescript
// Play at 50% of configured volume
soundManager.play(SoundEffect.ATTACK_MELEE, 0.5);
```

The final volume is: `configuredVolume * masterVolume * playVolume`

## Mute Functionality

```typescript
// Mute all sounds
soundManager.mute();

// Unmute
soundManager.unmute();

// Toggle mute state
soundManager.toggleMute();

// Check mute state
const isMuted = soundManager.isMuted();
```

## Audio Context Management

The system automatically manages the audio context lifecycle:

```typescript
// Resume audio context (e.g., after page becomes visible)
await soundManager.resume();

// Suspend audio context (e.g., when game is paused)
await soundManager.suspend();
```

## Browser Compatibility

The sound manager uses Web Audio API which is supported in all modern browsers:

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires user interaction to initialize)
- Mobile browsers: Supported with autoplay restrictions

### Autoplay Policy

Due to browser autoplay policies, the sound manager must be initialized after a user interaction:

```typescript
// In a click/touch event handler
button.addEventListener('click', async () => {
  await soundManager.initialize();
  // Now sounds can play
});
```

## Adding New Sounds

To add a new sound effect:

1. Add the sound file to `public/sounds/combat/`
2. Add a new entry to the `SoundEffect` enum:
   ```typescript
   export enum SoundEffect {
     // ... existing effects
     NEW_EFFECT = 'new-effect',
   }
   ```
3. Add configuration to `SOUND_CONFIGS`:
   ```typescript
   [SoundEffect.NEW_EFFECT]: {
     path: 'combat/new-effect.mp3',
     volume: 0.6,
     poolSize: 4,
   }
   ```

## Performance Considerations

- Sound files should be optimized (compressed MP3 or OGG)
- Keep individual sound files under 100KB when possible
- Use appropriate pool sizes to balance audio quality and memory usage
- The system automatically cleans up finished sounds to prevent memory leaks

## Testing

Run the test suite:

```bash
npm run test src/lib/audio/__tests__/soundManager.test.ts
```

The tests cover:
- Initialization
- Volume controls
- Mute functionality
- Sound playback
- Audio context management
- Helper functions

## Troubleshooting

### Sounds not playing

1. Ensure `initialize()` was called after user interaction
2. Check that sounds are not muted
3. Verify sound files exist in `public/sounds/combat/`
4. Check browser console for loading errors

### Audio glitches during combat

1. Adjust pool sizes in `SOUND_CONFIGS`
2. Reduce master volume to prevent clipping
3. Optimize sound file sizes

### Memory issues

1. Ensure `stopAll()` is called when leaving combat
2. Check that audio context is suspended when not needed
3. Verify sound files are not excessively large

## Requirements Validation

This implementation validates **Requirement 13.7**:
- ✅ Uses Web Audio API for sound playback
- ✅ Implements attack, hit, death, and ability sound effects
- ✅ Includes sound effect pooling for performance
- ✅ Provides volume controls and mute option
