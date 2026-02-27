# Hero Ability System

## Overview

The hero ability system allows heroes to use special abilities during combat. Each hero has unique abilities defined in the hero data (`src/constants/heroes.ts`). The system handles ability resolution, cooldown tracking, resource cost validation, and area-of-effect targeting.

## Architecture

### Core Components

1. **Ability Resolution** (`resolveAbility`)
   - Main function that processes ability casting
   - Validates ability can be cast (cooldown and cost)
   - Applies ability effects to targets
   - Generates combat events for animations and UI

2. **Cooldown Tracking**
   - Per-unit/hero cooldown management
   - Automatic cooldown reduction over time
   - Prevents ability spam

3. **Cost Validation**
   - Validates resource availability before casting
   - Prevents casting with insufficient resources
   - Returns descriptive error messages

4. **Area-of-Effect Targeting**
   - Finds all units within ability radius
   - Supports filtering by owner (ally/enemy)
   - Efficient distance-based calculations

## Ability Types

### Damage Abilities

Deals damage to all units within a radius.

```typescript
{
  type: 'damage',
  value: 150,      // Damage amount
  radius: 3        // Area of effect radius
}
```

**Behavior:**
- Affects all units except the caster
- Generates damage events for each target
- Generates death events for killed units
- Does not distinguish between allies and enemies

**Example:** Yết Kiêu's "Water Monster" ability

### Heal Abilities

Heals allied units within a radius.

```typescript
{
  type: 'heal',
  value: 50,       // Healing amount
  radius: 3        // Area of effect radius
}
```

**Behavior:**
- Only affects allied units (same owner as caster)
- Cannot overheal (caps at maxHealth)
- Generates heal events for each target

### Buff Abilities

Increases stats of allied units.

```typescript
{
  type: 'buff',
  stat: 'speed',   // Stat to buff (attack, defense, speed)
  value: 20,       // Percentage increase
  duration: 30     // Duration in seconds
}
```

**Behavior:**
- Only affects allied units
- Applies status effect with specified duration
- Value is percentage (20 = 20% increase)
- Integrates with status effect system
- Large radius (affects all allies on battlefield)

**Example:** Trần Hưng Đạo's "Rally the Troops" ability

### Debuff Abilities

Decreases stats of enemy units.

```typescript
{
  type: 'debuff',
  stat: 'attack',  // Stat to debuff
  value: 30,       // Percentage decrease
  duration: 20     // Duration in seconds
}
```

**Behavior:**
- Only affects enemy units (different owner than caster)
- Applies status effect with specified duration
- Value is percentage (30 = 30% decrease)
- Integrates with status effect system
- Large radius (affects all enemies on battlefield)

## API Reference

### resolveAbility

Main function to cast and resolve an ability.

```typescript
function resolveAbility(
  caster: Unit,
  ability: Ability,
  targetPosition: Vector2,
  allUnits: Unit[],
  availableResources: number
): AbilityResult
```

**Parameters:**
- `caster`: The unit/hero casting the ability
- `ability`: The ability being cast
- `targetPosition`: Target position for the ability (center of AoE)
- `allUnits`: Array of all units on the battlefield
- `availableResources`: Current available resources (e.g., mana, energy)

**Returns:** `AbilityResult` containing:
- `success`: Whether the ability was successfully cast
- `abilityId`: ID of the ability
- `casterId`: ID of the caster
- `targetIds`: Array of affected unit IDs
- `effects`: Array of effects applied to each target
- `events`: Array of combat events generated

**Example:**
```typescript
const result = resolveAbility(
  hero,
  hero.abilities[0],
  { x: 10, y: 15 },
  allUnits,
  100
);

if (result.success) {
  // Apply effects to units
  result.effects.forEach(effect => {
    const unit = findUnit(effect.targetId);
    if (effect.damage) {
      unit.health -= effect.damage;
    }
    if (effect.healing) {
      unit.health = Math.min(unit.maxHealth, unit.health + effect.healing);
    }
    if (effect.statusApplied) {
      // Apply status effect to unit
    }
  });
  
  // Trigger animations from events
  result.events.forEach(event => {
    triggerAnimation(event);
  });
}
```

### Cooldown Management

#### getAbilityCooldown

Get the remaining cooldown for an ability.

```typescript
function getAbilityCooldown(casterId: string, abilityId: string): number
```

**Returns:** Remaining cooldown in seconds (0 if ready)

#### setAbilityCooldown

Set the cooldown for an ability (called automatically by `resolveAbility`).

```typescript
function setAbilityCooldown(casterId: string, abilityId: string, cooldown: number): void
```

#### updateAbilityCooldowns

Update cooldowns for a caster (call each frame with delta time).

```typescript
function updateAbilityCooldowns(casterId: string, deltaTime: number): void
```

**Example:**
```typescript
// In game loop
function update(deltaTime: number) {
  allUnits.forEach(unit => {
    updateAbilityCooldowns(unit.id, deltaTime);
  });
}
```

#### clearAbilityCooldowns

Clear all cooldowns for a caster (useful when unit dies).

```typescript
function clearAbilityCooldowns(casterId: string): void
```

### Targeting

#### findUnitsInRadius

Find all units within a radius of a target position.

```typescript
function findUnitsInRadius(
  targetPosition: Vector2,
  radius: number,
  allUnits: Unit[],
  excludeId?: string
): Unit[]
```

**Parameters:**
- `targetPosition`: Center position
- `radius`: Radius in grid units
- `allUnits`: Array of all units to check
- `excludeId`: Optional unit ID to exclude from results

**Returns:** Array of units within the radius

### Validation

#### validateAbilityCast

Validate if an ability can be cast.

```typescript
function validateAbilityCast(
  casterId: string,
  abilityId: string,
  abilityCost: number,
  abilityCooldown: number,
  availableResources: number
): { valid: boolean; error?: string }
```

**Returns:** Object with validation result and error message if invalid

**Example:**
```typescript
const validation = validateAbilityCast(
  hero.id,
  ability.id,
  ability.cost,
  ability.cooldown,
  currentMana
);

if (!validation.valid) {
  showError(validation.error);
  return;
}
```

## Integration with Game Systems

### Combat System

The ability system integrates with the combat engine:
- Uses existing status effect system for buffs/debuffs
- Generates combat events for animations
- Respects unit ownership (player vs AI)

### Resource System

Abilities consume resources (typically mana or energy):
- Validate resource availability before casting
- Deduct resources after successful cast
- Display resource costs in UI

### Animation System

Combat events trigger animations:
- `ABILITY_USED`: Ability cast animation
- `DAMAGE`: Damage numbers and hit effects
- `HEAL`: Healing effects
- `STATUS_APPLIED`: Buff/debuff visual indicators
- `DEATH`: Death animations

### UI System

Display ability information:
- Ability icons with cooldown overlays
- Resource cost indicators
- Tooltip with ability description
- Hotkeys for quick casting

## Usage Example

```typescript
import { resolveAbility, updateAbilityCooldowns, getAbilityCooldown } from '@/lib/combat/engine';

// In combat component
function castAbility(hero: Unit, abilityIndex: number, targetPos: Vector2) {
  const ability = hero.abilities[abilityIndex];
  
  // Check if ability is ready
  const cooldown = getAbilityCooldown(hero.id, ability.id);
  if (cooldown > 0) {
    showMessage(`Ability on cooldown: ${cooldown.toFixed(1)}s`);
    return;
  }
  
  // Cast ability
  const result = resolveAbility(
    hero,
    ability,
    targetPos,
    allUnits,
    currentMana
  );
  
  if (!result.success) {
    showError(result.events[0].data?.error);
    return;
  }
  
  // Deduct resource cost
  currentMana -= ability.cost;
  
  // Apply effects to units
  result.effects.forEach(effect => {
    const unit = allUnits.find(u => u.id === effect.targetId);
    if (!unit) return;
    
    if (effect.damage) {
      unit.health -= effect.damage;
    }
    if (effect.healing) {
      unit.health = Math.min(unit.maxHealth, unit.health + effect.healing);
    }
    if (effect.statusApplied) {
      // Status effects are applied internally by resolveAbility
      // Just need to update UI indicators
      updateStatusIndicator(unit);
    }
  });
  
  // Trigger animations
  result.events.forEach(event => {
    animationSystem.trigger(event);
  });
  
  // Remove dead units
  allUnits = allUnits.filter(u => u.health > 0);
}

// In game loop
function gameLoop(deltaTime: number) {
  // Update cooldowns
  allUnits.forEach(unit => {
    updateAbilityCooldowns(unit.id, deltaTime);
  });
  
  // Update UI cooldown displays
  updateAbilityUI();
}
```

## Testing

Comprehensive tests are provided in `src/lib/combat/__tests__/abilities.test.ts`:

- Cooldown tracking and updates
- Area-of-effect targeting
- Cost validation
- Damage abilities
- Heal abilities
- Buff abilities
- Debuff abilities
- Validation failures
- Event generation

Run tests with:
```bash
npm test -- src/lib/combat/__tests__/abilities.test.ts
```

## Performance Considerations

1. **Cooldown Storage**: Uses Map for O(1) lookups
2. **AoE Targeting**: Simple distance calculation, consider spatial indexing for large unit counts
3. **Event Generation**: Events are created but not stored permanently
4. **Status Effects**: Integrated with existing status effect system

## Future Enhancements

Potential improvements:
- Ability targeting modes (self, ally, enemy, ground)
- Ability chains and combos
- Ability upgrades and modifications
- Ability resource types (mana, energy, rage)
- Ability casting time and channeling
- Ability interruption mechanics
- Ability visual effects customization

## Requirements Validation

This implementation validates:
- **Requirement 11.2**: Hero abilities with stats and effects
- **Requirement 13.5**: Status effect integration for buffs/debuffs

The system provides complete hero ability functionality including:
- ✅ Ability resolution with multiple effect types
- ✅ Cooldown tracking per unit/hero
- ✅ Resource cost validation
- ✅ Area-of-effect targeting
- ✅ Integration with status effect system
- ✅ Combat event generation
- ✅ Comprehensive test coverage
