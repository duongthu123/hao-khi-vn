# Unit Rendering System

## Overview

The GameMap component now includes a comprehensive unit rendering system with visual representation, selection mechanics, and status indicators. This document describes the features implemented in task 6.7.

## Features

### 1. Unit Visual Representation

Units are rendered on the map canvas with the following visual elements:

- **Unit Circle**: Color-coded by owner (blue for player, red for AI)
- **Unit Type Icon**: Visual indicator showing unit type (⚔ infantry, 🐎 cavalry, 🏹 archer, 🎯 siege)
- **Direction Indicator**: Arrow showing which direction the unit is facing
- **Health Bar**: Color-coded bar showing current health (green > 50%, yellow 25-50%, red < 25%)

### 2. Unit Selection

Users can select units by clicking on them:

- **Selection Ring**: Golden ring appears around selected units with a glow effect
- **Persistent Selection**: Selected unit remains highlighted until another unit is selected or empty space is clicked
- **Unit Stats Display**: When a unit is selected and zoom level is >= 1, attack and defense stats are shown below the unit
- **Click Callback**: `onUnitClick` callback is triggered when a unit is selected

### 3. Unit Highlighting

Units are highlighted when the mouse hovers over them:

- **Hover Ring**: Gray ring appears around hovered units
- **Smooth Transitions**: Hover state updates smoothly as the mouse moves
- **No Interference**: Hover highlighting works independently of selection

### 4. Status Effect Indicators

Units with active status effects display colored dots below the health bar:

- **Stun**: Yellow dot
- **Poison**: Purple dot
- **Buff**: Green dot
- **Debuff**: Red dot
- **Slow**: Blue dot
- **Haste**: Orange dot

Multiple status effects are displayed side-by-side.

### 5. Health Bars

Each unit displays a health bar above it:

- **Background**: Semi-transparent black background
- **Health Fill**: Color changes based on health percentage
  - Green: > 50% health
  - Yellow: 25-50% health
  - Red: < 25% health
- **Border**: White semi-transparent border for clarity

## Usage Example

```tsx
import { GameMap } from '@/components/game/GameMap/GameMap';
import { useGameStore } from '@/store';

function BattleView() {
  const units = useGameStore((state) => state.combat.units);
  const buildings = useGameStore((state) => state.combat.buildings);

  const handleUnitClick = (unit) => {
    console.log('Selected unit:', unit);
    // Handle unit selection (e.g., show unit details, enable commands)
  };

  const handleTileClick = (x, y) => {
    console.log('Clicked tile:', x, y);
    // Handle tile click (e.g., move selected unit)
  };

  return (
    <GameMap
      units={units}
      buildings={buildings}
      onUnitClick={handleUnitClick}
      onTileClick={handleTileClick}
      width={800}
      height={600}
      enablePanZoom={true}
    />
  );
}
```

## Implementation Details

### Rendering Optimization

- **Dirty Flags**: Only re-renders layers when they change
- **Viewport Culling**: Uses quadtree spatial indexing to render only visible units
- **Frame Rate Management**: Maintains 60 FPS target

### Selection State Management

Selection and hover states are managed internally using React state:

```tsx
const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
```

### Event Handling

- **Click Events**: Detect unit clicks using distance calculation from click position to unit position
- **Mouse Move Events**: Track mouse position to update hover state
- **Pan Prevention**: Selection and hover are disabled during panning to avoid accidental clicks

## Testing

Comprehensive unit tests cover:

- Unit rendering with different health levels
- Unit rendering with status effects
- Unit selection on click
- Unit deselection on empty space click
- Unit highlighting on hover
- Different unit types with appropriate icons
- Player vs AI unit color differentiation
- Unit stats display for selected units
- Multiple status effects rendering
- Direction indicator rendering
- Health bar color based on health percentage

Run tests with:

```bash
npm test -- GameMap.test.tsx --run
```

## Future Enhancements

Potential improvements for future tasks:

1. **Multi-select**: Allow selecting multiple units with Shift+Click or drag selection
2. **Unit Animations**: Animate unit movement and combat actions
3. **Formation Indicators**: Show unit formation and group membership
4. **Range Indicators**: Display attack range when unit is selected
5. **Path Preview**: Show movement path when hovering over destination
6. **Unit Tooltips**: Display detailed unit information on hover

## Requirements Satisfied

This implementation satisfies:

- **Requirement 12.4**: Display units, buildings, and terrain from Game_State
- **Requirement 13.5**: Trigger combat animations through Animation_Engine (foundation for future animation integration)

## Related Files

- `src/components/game/GameMap/GameMap.tsx` - Main component implementation
- `src/components/game/GameMap/GameMap.test.tsx` - Unit tests
- `src/types/unit.ts` - Unit type definitions
- `src/store/slices/combatSlice.ts` - Combat state management
