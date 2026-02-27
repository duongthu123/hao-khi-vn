# CollectionView Component

Museum interface for viewing and managing the hero collection in "Đại Chiến Sử Việt - Hào Khí Đông A".

## Overview

The CollectionView component displays the player's hero collection with a grid layout showing all heroes (locked and unlocked), completion percentage, and a detailed museum interface for viewing hero information including stats, abilities, and historical context.

## Features

- **Hero Collection Grid**: Displays all heroes with visual indicators for unlock status
- **Completion Tracking**: Shows collection completion percentage with animated progress bar
- **Filtering System**: Filter heroes by faction (Vietnamese/Mongol) and rarity (Legendary/Epic/Rare/Common)
- **Museum Interface**: Detailed hero view with:
  - Hero portrait and basic information
  - Stats visualization using radar chart
  - Ability descriptions in Vietnamese
  - Historical context and lore
  - Unlock conditions for locked heroes
- **Responsive Design**: Adapts to different screen sizes with grid layout
- **Smooth Animations**: Framer Motion animations for transitions and interactions

## Usage

```tsx
import { CollectionView } from '@/components/game/CollectionView';

function MuseumPage() {
  return (
    <div className="h-screen">
      <CollectionView />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes to apply to the root element |

## State Management

The component uses Zustand store to access:

- `getCollectedHeroIds()`: Returns array of collected hero IDs
- `hasHero(heroId)`: Checks if a hero is unlocked
- `collection.completionPercentage`: Current collection completion percentage

## Hero Data

Heroes are loaded from `@/constants/heroes` which includes:

- Vietnamese heroes (Trần Hưng Đạo, Yết Kiêu, Trần Quốc Toản, etc.)
- Mongol heroes (Ô Mã Nhi, Toa Đô, etc.)
- Hero stats, abilities, portraits, and historical context

## Filtering

### Faction Filters
- **Tất cả** (All): Shows all heroes
- **Đại Việt** (Vietnamese): Shows only Vietnamese heroes
- **Mông Cổ** (Mongol): Shows only Mongol heroes

### Rarity Filters
- **Tất cả độ hiếm** (All Rarities): Shows all heroes
- **Huyền thoại** (Legendary): Gold/orange gradient
- **Sử thi** (Epic): Purple/pink gradient
- **Hiếm** (Rare): Blue/cyan gradient
- **Thường** (Common): Gray gradient

## Hero Detail Panel

When a hero is clicked, a side panel slides in showing:

1. **Hero Portrait**: Large hero image with rarity border
2. **Basic Info**: Vietnamese and English names, faction, rarity
3. **Description**: Brief description of the hero
4. **Stats Radar Chart**: Visual representation of 5 stats:
   - Tấn công (Attack)
   - Phòng thủ (Defense)
   - Tốc độ (Speed)
   - Lãnh đạo (Leadership)
   - Trí tuệ (Intelligence)
5. **Abilities**: List of hero abilities with cooldowns and costs
6. **Historical Context**: Educational information about the historical figure
7. **Unlock Condition**: Shows requirements for locked heroes

## Styling

The component uses Tailwind CSS with a dark theme:

- Background: Slate-900 to Slate-800 gradient
- Primary accent: Yellow-400 (Vietnamese cultural theme)
- Faction colors: Blue (Vietnamese), Red (Mongol)
- Rarity colors: Gold (Legendary), Purple (Epic), Blue (Rare), Gray (Common)

## Accessibility

- Keyboard navigation support
- Semantic HTML structure
- ARIA labels for screen readers
- Focus management in detail panel
- Color contrast ratios meet WCAG standards

## Performance

- Efficient filtering using array methods
- Conditional rendering for detail panel
- Optimized re-renders with Zustand selectors
- Smooth animations with Framer Motion

## Vietnamese Cultural Elements

All text is displayed in Vietnamese with English translations:

- Hero names in Vietnamese (e.g., "Trần Hưng Đạo")
- Historical context in Vietnamese
- UI labels in Vietnamese
- Preserves educational value about Vietnamese history

## Example: Full Implementation

```tsx
import { CollectionView } from '@/components/game/CollectionView';

export default function MuseumPage() {
  return (
    <div className="h-screen bg-slate-900">
      <header className="p-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-yellow-400">
          Bảo Tàng Anh Hùng
        </h1>
      </header>
      
      <main className="h-[calc(100vh-80px)]">
        <CollectionView />
      </main>
    </div>
  );
}
```

## Testing

The component includes comprehensive unit tests covering:

- Rendering and display
- Completion percentage calculation
- Hero filtering by faction and rarity
- Hero detail panel interactions
- Lock/unlock status display
- Historical context display
- Edge cases (empty collection, full collection)

Run tests with:

```bash
npm test src/components/game/CollectionView/CollectionView.test.tsx
```

## Related Components

- `RadarChart`: Used for stats visualization
- `HeroSelection`: Hero selection interface
- `GachaSystem`: Hero acquisition system

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **16.1**: Track unlocked heroes and items
- **16.3**: Display collection progress in a museum interface
- **16.6**: Display hero lore and historical information in Vietnamese
- **2.2**: Implement as discrete component module
- **2.3**: Single, well-defined responsibility

## Future Enhancements

Potential improvements for future versions:

- Hero comparison mode (side-by-side stats)
- Collection achievements and milestones
- Hero sorting options (by rarity, faction, unlock date)
- Search functionality
- Collection statistics and analytics
- Export collection as image
- Hero favorites/bookmarks
