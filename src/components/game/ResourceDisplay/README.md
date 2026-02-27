# ResourceDisplay Component

A React component that displays real-time resource tracking with animated counters, resource caps, generation rates, warning indicators, and detailed tooltips.

## Features

- **Animated Counters**: Smooth number transitions when resource values change
- **Resource Caps**: Visual progress bars showing current vs maximum capacity
- **Generation Rates**: Display of resource generation per second
- **Low Resource Warnings**: Visual indicators when resources fall below threshold
- **Detailed Tooltips**: Hover to see comprehensive resource breakdown including:
  - Current amount
  - Maximum capacity
  - Percentage filled
  - Generation rate
  - Time until cap is reached
- **Vietnamese Localization**: All labels and text in Vietnamese

## Usage

```tsx
import { ResourceDisplay } from '@/components/game/ResourceDisplay';
import { useStore } from '@/store';

function GameUI() {
  const resources = useStore((state) => state.resources);
  
  return (
    <ResourceDisplay
      resources={{
        food: resources.food,
        gold: resources.gold,
        army: resources.army,
      }}
      caps={resources.caps}
      generation={resources.generation}
      showDetails={true}
      lowResourceThreshold={0.2}
    />
  );
}
```

## Props

### `resources` (required)
Type: `Resources`

Current resource amounts:
```typescript
{
  food: number;
  gold: number;
  army: number;
}
```

### `caps` (required)
Type: `ResourceCaps`

Maximum capacity for each resource:
```typescript
{
  food: number;
  gold: number;
  army: number;
}
```

### `generation` (required)
Type: `ResourceGeneration`

Generation rates per second:
```typescript
{
  foodPerSecond: number;
  goldPerSecond: number;
  armyPerSecond: number;
}
```

### `showDetails` (optional)
Type: `boolean`
Default: `true`

Whether to show generation rates and detailed tooltips on hover.

### `lowResourceThreshold` (optional)
Type: `number`
Default: `0.2` (20%)

Percentage threshold below which resources are considered "low" and warning indicators appear.

## Resource Types

The component displays three resource types:

1. **Food (Lương thực)** 🌾
   - Color: Amber
   - Used for unit maintenance and production

2. **Gold (Vàng)** 💰
   - Color: Yellow
   - Used for buildings and upgrades

3. **Army (Quân đội)** ⚔️
   - Color: Red
   - Represents military capacity

## Visual States

### Normal State
- Standard border and colors
- Progress bar shows current percentage
- Generation rate displayed

### Low Resource State
- Red pulsing border
- Warning icon (⚠️) displayed
- Increased visual prominence

### At Cap State
- Progress bar at 100%
- Generation continues but resources don't exceed cap

## Animations

- **Counter Animation**: Smooth easing when values change (0.5s duration)
- **Progress Bar**: Animated width transitions (0.5s ease-out)
- **Warning Pulse**: Continuous border color animation for low resources
- **Tooltip**: Fade and slide animation on hover

## Accessibility

- Hover tooltips provide detailed information
- Color-coded visual indicators
- Clear numerical displays
- Vietnamese language support

## Requirements Validated

- **Requirement 14.4**: Real-time resource display updates
- **Requirement 2.2**: Component modularization
- **Requirement 2.3**: Single responsibility principle

## Testing

The component includes comprehensive unit tests covering:
- Rendering of all resource types
- Display of current values and caps
- Generation rate visibility
- Warning indicators for low resources
- Tooltip structure
- Edge cases (zero, cap, fractional values)

Run tests:
```bash
npm test -- src/components/game/ResourceDisplay/ResourceDisplay.test.tsx
```

## Dependencies

- React
- Framer Motion (animations)
- Tailwind CSS (styling)
- @/types/resource (type definitions)
- @/lib/resources/generation (utility functions)
