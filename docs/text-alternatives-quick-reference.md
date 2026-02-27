# Text Alternatives Quick Reference

Quick guide for implementing text alternatives in the game.

## For Images and Visual Content

### Hero Portraits
```tsx
<div
  role="img"
  aria-label={`Chân dung ${hero.nameVietnamese}, ${getFactionName(hero.faction)}, độ hiếm ${hero.rarity}`}
>
  {/* Visual content */}
</div>
```

### Canvas Elements (Charts, Maps)
```tsx
<canvas
  ref={canvasRef}
  role="img"
  aria-label={generateTextDescription()}
/>
<div className="sr-only">
  {generateTextDescription()}
</div>
```

### Decorative Images
```tsx
<span aria-hidden="true">
  {/* Decorative content */}
</span>
```

## For Audio Content

### Using Audio Captions
```tsx
import { useAudioCaption } from '@/components/ui/AudioCaption';

const { displayCaption } = useAudioCaption();

// When playing sound
displayCaption('Âm thanh tấn công cận chiến', 3000);
```

### Sound Manager Integration
```tsx
import { soundManager } from '@/lib/audio/soundManager';

// Enable captions globally
soundManager.enableCaptions((caption) => {
  displayCaption(caption);
});

// Play sound (caption will auto-display if enabled)
soundManager.play(SoundEffect.ATTACK_MELEE);
```

## For Game Map Information

### Map State Description
```tsx
import { generateMapDescription } from '@/components/game/GameMap/GameMapAccessibility';

const description = generateMapDescription(units, buildings);
// "Bản đồ chiến trường. Quân ta: 5 đơn vị, 2 công trình. Quân địch: 3 đơn vị, 1 công trình."
```

### Unit Description
```tsx
import { generateUnitDescription } from '@/components/game/GameMap/GameMapAccessibility';

const description = generateUnitDescription(unit);
// "Quân ta: Bộ binh. Máu: 80%. Hướng: Bắc. Tấn công: 50, Phòng thủ: 40, Tốc độ: 30."
```

### Combat Events
```tsx
import { generateCombatEventDescription } from '@/components/game/GameMap/GameMapAccessibility';

const description = generateCombatEventDescription('attack', {
  attackerType: 'infantry',
  defenderType: 'cavalry',
  damage: 25,
});
// "Bộ binh tấn công Kỵ binh, gây 25 sát thương."
```

## For Dynamic Announcements

### Using Live Regions
```tsx
import { useMapAnnouncements } from '@/components/game/GameMap/GameMapAccessibility';

const { announce } = useMapAnnouncements();

// Announce important events
announce('Quân ta đã chiếm được thành trì địch');
```

### Manual Live Region
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

## Accessibility Settings

### Check User Preferences
```tsx
import { useAccessibilityPreferences } from '@/components/game/AccessibilitySettings';

const preferences = useAccessibilityPreferences();

if (preferences.audioCaptions) {
  // Show captions
}

if (preferences.visualDescriptions) {
  // Provide detailed descriptions
}
```

## Common Patterns

### Progress Bars
```tsx
<div
  role="progressbar"
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label={`${label}: ${current} trên ${max}`}
>
  {/* Visual progress bar */}
</div>
```

### Status Indicators
```tsx
<div
  role="status"
  aria-live="polite"
  aria-label={`Trạng thái: ${statusText}`}
>
  {/* Visual indicator */}
</div>
```

### Interactive Elements
```tsx
<button
  aria-label={`${action} ${itemName}`}
  aria-describedby="description-id"
>
  {/* Icon or short text */}
</button>
<div id="description-id" className="sr-only">
  Detailed description
</div>
```

## Screen Reader Only Content

### Using sr-only Class
```tsx
<span className="sr-only">
  Text only for screen readers
</span>
```

### CSS for sr-only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Testing Checklist

- [ ] All images have alt text or aria-label
- [ ] Canvas elements have role="img" and descriptions
- [ ] Audio content has text captions
- [ ] Visual game information has text alternatives
- [ ] Dynamic content uses ARIA live regions
- [ ] Decorative content is marked aria-hidden
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Verify descriptions are meaningful and concise

## Vietnamese Translations

Common terms for descriptions:

| English | Vietnamese |
|---------|-----------|
| Attack | Tấn công |
| Defense | Phòng thủ |
| Speed | Tốc độ |
| Leadership | Lãnh đạo |
| Intelligence | Trí tuệ |
| Health | Máu |
| Infantry | Bộ binh |
| Cavalry | Kỵ binh |
| Archer | Cung thủ |
| Fortress | Thành trì |
| Player | Quân ta |
| Enemy | Quân địch |
| Victory | Chiến thắng |
| Defeat | Thất bại |

## Resources

- [WCAG 2.1 - Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM - Alternative Text](https://webaim.org/techniques/alttext/)
