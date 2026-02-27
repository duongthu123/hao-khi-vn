# Combat Sound Files

This directory should contain the combat sound effect files used by the sound manager.

## Required Sound Files

Place the following sound files in the `combat/` subdirectory:

### Attack Sounds
- `combat/attack-melee.mp3` - Melee weapon attack sounds (sword swing, spear thrust)
- `combat/attack-ranged.mp3` - Ranged weapon attack sounds (bow release, crossbow shot)

### Hit Sounds
- `combat/hit-light.mp3` - Light damage impact sounds
- `combat/hit-heavy.mp3` - Heavy damage impact sounds

### Death Sounds
- `combat/death.mp3` - Unit death/defeat sounds

### Ability Sounds
- `combat/ability-cast.mp3` - Hero ability activation sounds
- `combat/ability-impact.mp3` - Ability impact/effect sounds

### Status Effect Sounds
- `combat/heal.mp3` - Healing effect sounds
- `combat/buff.mp3` - Positive status effect sounds
- `combat/debuff.mp3` - Negative status effect sounds

### UI Sounds
Place the following sound files in the `ui/` subdirectory:

- `ui/rank-up.mp3` - Rank promotion celebration sound (triumphant fanfare)
- `ui/level-up.mp3` - Level up notification sound (positive chime)

## File Format Recommendations

- **Format**: MP3 or OGG Vorbis
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Rate**: 128-192 kbps (good balance of quality and file size)
- **Duration**: 0.5-2 seconds for most effects
- **File Size**: Keep under 100KB per file when possible

## Sound Design Guidelines

### Attack Sounds
- Should be punchy and immediate
- Melee: Metal clashing, weapon swoosh
- Ranged: Bow string release, projectile whoosh

### Hit Sounds
- Light: Quick, sharp impact
- Heavy: Deep, resonant impact with more bass

### Death Sounds
- Should be distinct and final
- Can include falling/collapse sounds
- Avoid being too graphic or disturbing

### Ability Sounds
- Cast: Magical/mystical activation sound
- Impact: Powerful effect sound matching ability type

### Status Effects
- Heal: Gentle, positive chime or sparkle
- Buff: Uplifting, empowering sound
- Debuff: Negative, weakening sound

### UI Sounds
- Rank-up: Triumphant fanfare with celebratory feel (2-3 seconds)
- Level-up: Positive achievement chime (0.5-1 second)

## Sourcing Sound Files

You can obtain sound files from:

1. **Free Resources**:
   - [Freesound.org](https://freesound.org/) - Creative Commons licensed sounds
   - [OpenGameArt.org](https://opengameart.org/) - Game-specific sound effects
   - [Zapsplat.com](https://www.zapsplat.com/) - Free sound effects library

2. **Commercial Libraries**:
   - [AudioJungle](https://audiojungle.net/)
   - [Soundsnap](https://www.soundsnap.com/)
   - [Epidemic Sound](https://www.epidemicsound.com/)

3. **Custom Recording**:
   - Record and edit your own sounds
   - Use tools like Audacity (free) or Adobe Audition

## License Considerations

Ensure all sound files have appropriate licenses for your use case:
- Check Creative Commons license terms
- Verify commercial use is allowed if applicable
- Provide attribution where required
- Keep license documentation for all sound files

## Testing Without Sound Files

The sound manager will gracefully handle missing sound files:
- Warnings will be logged to console
- Game will continue to function without audio
- No errors will be thrown

For development, you can:
1. Use placeholder/temporary sounds
2. Test with muted audio
3. Add proper sounds before production release

## Directory Structure

```
public/sounds/
├── combat/
│   ├── attack-melee.mp3
│   ├── attack-ranged.mp3
│   ├── hit-light.mp3
│   ├── hit-heavy.mp3
│   ├── death.mp3
│   ├── ability-cast.mp3
│   ├── ability-impact.mp3
│   ├── heal.mp3
│   ├── buff.mp3
│   └── debuff.mp3
├── ui/
│   ├── rank-up.mp3
│   └── level-up.mp3
└── SOUND_FILES.md (this file)
```

## Vietnamese Cultural Considerations

For this Vietnamese historical game, consider:
- Traditional Vietnamese instruments for ability sounds (đàn tranh, đàn bầu)
- Historical weapon sounds appropriate to the Trần Dynasty period
- Cultural sensitivity in death/combat sounds
- Authentic period-appropriate sound design where possible
