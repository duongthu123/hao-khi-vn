# GachaSystem Component

## Overview

The `GachaSystem` component implements a probability-based hero acquisition system with animated gacha pulls. It provides an engaging way for players to obtain new heroes through a randomized reward system with rarity tiers.

## Features

- **Probability-Based Acquisition**: Heroes are obtained based on rarity drop rates
- **Rarity Tiers**: Legendary (1%), Epic (5%), Rare (20%), Common (74%)
- **Single and Multi-Pull**: Support for 1x and 10x pulls
- **Animated Reveals**: Smooth animations for pulling and revealing heroes
- **Duplicate Handling**: Converts duplicate heroes to gold and experience
- **Visual Feedback**: Rarity-based colors and glow effects
- **Vietnamese Localization**: Full Vietnamese language support

## Usage

```tsx
import { GachaSystem } from '@/components/game/GachaSystem';

function MyComponent() {
  const [showGacha, setShowGacha] = useState(false);

  return (
    <>
      <button onClick={() => setShowGacha(true)}>
        Open Gacha
      </button>

      {showGacha && (
        <GachaSystem onClose={() => setShowGacha(false)} />
      )}
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onClose` | `() => void` | No | Callback function when close button is clicked |

## States

The component manages four main states:

1. **Idle**: Initial state showing pull options
2. **Pulling**: Animation state during gacha pull
3. **Revealing**: Showing hero reveal with stats and rarity
4. **Complete**: All results viewed, ready to reset

## Integration

The component integrates with:

- **Collection Slice**: Adds new heroes to player collection
- **Resource Slice**: Deducts pull costs and adds duplicate compensation
- **Gacha Service**: Uses probability-based hero selection logic

## Animations

- Pull animation with rotating gift box
- Hero reveal with scale and rotation effects
- Rarity-based glow effects
- Smooth transitions between states

## Rarity System

| Rarity | Drop Rate | Color | Vietnamese Name |
|--------|-----------|-------|-----------------|
| Legendary | 1% | Gold (#F59E0B) | Huyền Thoại |
| Epic | 5% | Purple (#A855F7) | Sử Thi |
| Rare | 20% | Blue (#3B82F6) | Hiếm |
| Common | 74% | Gray (#9CA3AF) | Thường |

## Duplicate Compensation

When a duplicate hero is obtained, players receive:

| Rarity | Gold | Experience |
|--------|------|------------|
| Common | 50 | 10 |
| Rare | 150 | 30 |
| Epic | 500 | 100 |
| Legendary | 2000 | 500 |

## Cost

- Single Pull (1x): 100 Gold
- Multi Pull (10x): 900 Gold (10% discount)

## Requirements Satisfied

- **16.2**: Implements gacha mechanics with probability-based rewards
- **16.5**: Defines rarity tiers and drop rates
- **16.7**: Adds gacha pull animation
- **16.8**: Handles duplicate hero acquisition with compensation

## Testing

The component includes comprehensive unit tests covering:

- Rendering in different states
- Pull interactions
- Hero reveal display
- Duplicate detection
- Store integration
- Animation states

Run tests with:

```bash
npm test src/components/game/GachaSystem/GachaSystem.test.tsx
```

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- High contrast rarity colors
- Clear visual feedback

## Future Enhancements

- Pity system (guaranteed rare after X pulls)
- Banner system with rate-up heroes
- Pull history tracking
- Animation skip option
- Sound effects for pulls and reveals
