# CombatView Component

The CombatView component is the main interface for combat interactions in the game. It provides a comprehensive UI for managing units, viewing combat events, and activating hero abilities.

## Features

- **Combat Log**: Real-time display of combat events (attacks, damage, deaths, abilities)
- **Unit Selection**: Interactive unit cards showing health, stats, and status effects
- **Unit Controls**: Attack, move, and defend commands for player units
- **Hero Abilities**: Visual panel for activating hero abilities with targeting
- **Status Effects**: Visual indicators for active buffs, debuffs, and other effects
- **Targeting Mode**: Interactive targeting system for attacks and abilities
- **Responsive Layout**: Three-panel layout (log, units, abilities) that adapts to content

## Usage

```tsx
import { CombatView } from '@/components/game/CombatView';
import { useStore } from '@/store';

function GameScreen() {
  const units = useStore((state) => state.combat.units);
  const combatLog = useStore((state) => state.combat.combatLog);
  const selectedHero = useStore((state) => state.hero.selectedHero);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleAttack = (unitId, targetId) => {
    // Process attack using combat engine
    const result = processAttack(unitId, targetId);
    // Update state with results
  };

  return (
    <CombatView
      units={units}
      combatLog={combatLog}
      selectedUnit={selectedUnit}
      selectedHero={selectedHero}
      onUnitSelect={setSelectedUnit}
      onAttack={handleAttack}
      onMove={handleMove}
      onDefend={handleDefend}
      onAbilityActivate={handleAbilityActivate}
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `units` | `Unit[]` | Array of all units in combat (player and AI) |
| `combatLog` | `CombatEvent[]` | Array of combat events to display in the log |
| `selectedUnit` | `Unit \| null` | Currently selected unit (or null if none) |
| `selectedHero` | `Hero \| null` | Selected hero with abilities (or null if none) |
| `onUnitSelect` | `(unit: Unit \| null) => void` | Callback when a unit is selected or deselected |
| `onAttack` | `(unitId: string, targetId: string) => void` | Callback when attack command is issued |
| `onMove` | `(unitId: string, x: number, y: number) => void` | Callback when move command is issued |
| `onDefend` | `(unitId: string) => void` | Callback when defend command is issued |
| `onAbilityActivate` | `(abilityId: string, targetX: number, targetY: number) => void` | Callback when an ability is activated |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxLogEntries` | `number` | `50` | Maximum number of combat log entries to display |
| `showDetailedStats` | `boolean` | `true` | Whether to show detailed unit stats (attack, defense, speed) |

## Component Structure

```
CombatView
├── Header (title bar)
├── Left Panel (Combat Log)
│   └── Scrollable list of combat events
├── Center Panel (Unit Selection & Controls)
│   ├── Selected Unit Info
│   │   ├── Health bar
│   │   ├── Stats (if showDetailedStats)
│   │   ├── Status effects
│   │   └── Unit controls (for player units)
│   ├── Targeting Mode Indicator
│   └── Unit Lists
│       ├── Player Units
│       └── AI Units
└── Right Panel (Hero Abilities)
    └── Ability cards with details
```

## Combat Log Events

The combat log displays various event types with color coding:

- **Attack** (orange): Unit initiates an attack
- **Damage** (red): Damage is dealt to a unit
- **Heal** (green): Health is restored to a unit
- **Death** (dark red, bold): A unit is killed
- **Ability Used** (purple): A hero ability is activated
- **Status Applied** (blue): A status effect is applied
- **Unit Spawned** (gray): A new unit enters combat

## Targeting System

The component supports two targeting modes:

1. **Attack Mode**: Activated by clicking the "Tấn công" (Attack) button
   - User selects an enemy unit to attack
   - Calls `onAttack(unitId, targetId)`

2. **Ability Mode**: Activated by clicking a hero ability
   - User selects a target position (unit location)
   - Calls `onAbilityActivate(abilityId, x, y)`

Both modes can be cancelled by clicking the "Hủy" (Cancel) button.

## Integration with Combat Engine

The CombatView component is designed to work with the combat engine functions:

```tsx
import { processAttack, resolveAbility } from '@/lib/combat/engine';

const handleAttack = (unitId: string, targetId: string) => {
  const attacker = units.find(u => u.id === unitId);
  const defender = units.find(u => u.id === targetId);
  
  if (!attacker || !defender) return;
  
  // Process attack
  const result = processAttack(attacker, defender);
  
  // Update state
  updateUnit(targetId, { health: defender.health - result.damage });
  
  // Log events
  result.events.forEach(event => logCombatEvent(event));
  
  // Handle death
  if (result.isKill) {
    removeUnit(targetId);
  }
};

const handleAbilityActivate = (abilityId: string, x: number, y: number) => {
  const ability = selectedHero?.abilities.find(a => a.id === abilityId);
  if (!ability || !selectedUnit) return;
  
  // Resolve ability
  const result = resolveAbility(
    selectedUnit,
    ability,
    { x, y },
    units,
    availableResources
  );
  
  // Apply effects
  result.effects.forEach(effect => {
    if (effect.damage) {
      updateUnit(effect.targetId, { 
        health: getUnit(effect.targetId).health - effect.damage 
      });
    }
    if (effect.statusApplied) {
      applyStatusEffect(effect.targetId, effect.statusApplied);
    }
  });
  
  // Log events
  result.events.forEach(event => logCombatEvent(event));
};
```

## Styling

The component uses Tailwind CSS with custom Vietnamese theme colors:

- Primary gradient: `bg-gradient-vietnamese`
- Border colors: `border-vietnam-600`
- Player units: Blue theme (`border-blue-500`, `bg-blue-900/30`)
- AI units: Red theme (`border-red-500`, `bg-red-900/30`)
- Abilities: Purple theme (`border-purple-500`, `bg-purple-900/30`)

## Animations

The component uses Framer Motion for smooth animations:

- Combat log entries fade in from the left
- Unit selection highlights with scale animation
- Health bars animate width changes
- Status effects pulse with opacity animation
- Targeting mode indicator slides down from top

## Accessibility

- All interactive elements are keyboard accessible
- Color coding is supplemented with icons and text
- Health bars include text values for screen readers
- Buttons have clear Vietnamese labels
- Status effects include tooltips with descriptions

## Vietnamese Language

All UI text is in Vietnamese:

- "Giao diện chiến đấu" - Combat Interface
- "Nhật ký chiến đấu" - Combat Log
- "Đơn vị của bạn" - Your Units
- "Đơn vị đối thủ" - Enemy Units
- "Kỹ năng anh hùng" - Hero Abilities
- "Tấn công" - Attack
- "Phòng thủ" - Defend
- "Hủy" - Cancel

## Testing

The component includes comprehensive tests covering:

- Rendering with different props
- Unit selection and deselection
- Combat log display and formatting
- Unit controls (attack, defend)
- Hero ability activation
- Targeting mode activation and cancellation
- Status effect display
- Health bar rendering
- Event callbacks

Run tests with:

```bash
npm test -- src/components/game/CombatView/CombatView.test.tsx
```

## Requirements Validation

This component validates the following requirements:

- **Requirement 2.2**: Component modularization - CombatView is a discrete, well-defined component
- **Requirement 13.5**: Combat interface with unit controls, combat log, and ability activation

## Future Enhancements

Potential improvements for future versions:

- Drag-and-drop unit positioning
- Mini-map integration
- Combat statistics and analytics
- Replay functionality
- Sound effects for combat events
- Customizable UI layout
- Keyboard shortcuts for commands
- Unit formation controls
- Batch unit selection
- Combat speed controls (pause, slow, fast)
