# Status Effect System

## Overview

The status effect system manages temporary effects on units during combat. Status effects can modify unit stats, deal damage over time, or prevent units from acting.

## Status Effect Types

### 1. Stun
Prevents a unit from acting for a duration.

```typescript
const stunEffect: StatusEffect = {
  type: StatusEffectType.STUN,
  duration: 3, // seconds
  source: 'hero-ability-1',
};
```

### 2. Poison
Deals damage over time to the affected unit.

```typescript
const poisonEffect: StatusEffect = {
  type: StatusEffectType.POISON,
  duration: 5, // seconds
  value: 10, // damage per second
  source: 'poison-arrow',
};
```

### 3. Buff
Temporarily increases a unit's stat.

```typescript
const attackBuff: StatusEffect = {
  type: StatusEffectType.BUFF,
  duration: 10, // seconds
  value: 0.5, // 50% increase
  stat: 'attack',
  source: 'battle-cry',
};
```

### 4. Debuff
Temporarily decreases a unit's stat.

```typescript
const defenseDebuff: StatusEffect = {
  type: StatusEffectType.DEBUFF,
  duration: 8, // seconds
  value: 0.3, // 30% decrease
  stat: 'defense',
  source: 'armor-break',
};
```

### 5. Slow
Reduces unit movement speed.

```typescript
const slowEffect: StatusEffect = {
  type: StatusEffectType.SLOW,
  duration: 4, // seconds
  value: 0.5, // 50% speed reduction
  stat: 'speed',
  source: 'ice-trap',
};
```

### 6. Haste
Increases unit movement speed.

```typescript
const hasteEffect: StatusEffect = {
  type: StatusEffectType.HASTE,
  duration: 6, // seconds
  value: 0.5, // 50% speed increase
  stat: 'speed',
  source: 'wind-blessing',
};
```

## Core Functions

### Applying Status Effects

```typescript
import { applyStatusEffect } from '@/lib/combat/engine';

// Apply a status effect to a unit
const updatedUnit = applyStatusEffect(unit, poisonEffect);
```

### Updating Effect Durations

```typescript
import { updateStatusEffectDurations } from '@/lib/combat/engine';

// Update effect durations (call this every game tick)
const updatedUnit = updateStatusEffectDurations(unit, deltaTime);
```

### Applying Periodic Effects

```typescript
import { applyStatusEffects } from '@/lib/combat/engine';

// Apply periodic effects like poison damage
const result = applyStatusEffects(unit, deltaTime);
console.log(`Damage dealt: ${result.damage}`);
console.log(`Unit health: ${result.unit.health}`);
console.log(`Events:`, result.events);
```

### Getting Effective Stats

```typescript
import { getEffectiveStats } from '@/lib/combat/engine';

// Get unit stats with all buffs/debuffs applied
const effectiveStats = getEffectiveStats(unit);
console.log(`Effective attack: ${effectiveStats.attack}`);
console.log(`Effective defense: ${effectiveStats.defense}`);
```

### Checking Unit Status

```typescript
import { isUnitStunned } from '@/lib/combat/engine';

// Check if a unit is stunned
if (isUnitStunned(unit)) {
  console.log('Unit cannot act!');
}
```

### Removing Status Effects

```typescript
import { removeStatusEffect, clearAllStatusEffects } from '@/lib/combat/engine';

// Remove a specific effect type
const cleansedUnit = removeStatusEffect(unit, StatusEffectType.POISON);

// Remove effect from a specific source
const cleansedUnit2 = removeStatusEffect(unit, StatusEffectType.POISON, 'poison-arrow');

// Clear all effects
const fullyCleanedUnit = clearAllStatusEffects(unit);
```

## Visual Indicators

Use the `StatusEffectIndicator` component to display active status effects:

```tsx
import { StatusEffectIndicator } from '@/components/game/StatusEffectIndicator';

function UnitDisplay({ unit }: { unit: Unit }) {
  return (
    <div>
      <div>Unit: {unit.id}</div>
      <StatusEffectIndicator 
        effects={unit.status}
        size="md"
        showDuration={true}
      />
    </div>
  );
}
```

### Component Props

- `effects`: Array of status effects to display
- `size`: Size of indicators ('sm' | 'md' | 'lg')
- `showDuration`: Whether to show remaining duration

## Game Loop Integration

Here's how to integrate the status effect system into your game loop:

```typescript
function gameLoop(deltaTime: number) {
  // For each unit in the game
  units.forEach((unit) => {
    // 1. Apply periodic effects (poison damage, etc.)
    const effectResult = applyStatusEffects(unit, deltaTime);
    unit = effectResult.unit;
    
    // Log combat events
    effectResult.events.forEach((event) => {
      combatLog.push(event);
    });
    
    // 2. Update effect durations
    unit = updateStatusEffectDurations(unit, deltaTime);
    
    // 3. Check if unit can act
    if (isUnitStunned(unit)) {
      // Skip this unit's turn
      return;
    }
    
    // 4. Get effective stats for combat calculations
    const stats = getEffectiveStats(unit);
    
    // Use stats for combat, movement, etc.
    processCombat(unit, stats);
  });
}
```

## Combat Integration

When calculating damage, use effective stats instead of base stats:

```typescript
import { calculateDamage, getEffectiveStats } from '@/lib/combat/engine';

function attackUnit(attacker: Unit, defender: Unit) {
  // Get effective stats with all buffs/debuffs
  const attackerStats = getEffectiveStats(attacker);
  const defenderStats = getEffectiveStats(defender);
  
  // Create temporary units with effective stats for damage calculation
  const effectiveAttacker = { ...attacker, ...attackerStats };
  const effectiveDefender = { ...defender, ...defenderStats };
  
  // Calculate damage
  const damage = calculateDamage(effectiveAttacker, effectiveDefender, 'FRONT');
  
  // Apply damage
  defender.health -= damage;
}
```

## Best Practices

1. **Source Tracking**: Always provide a `source` identifier for status effects to track where they came from and allow targeted removal.

2. **Duration Management**: Update effect durations every game tick to ensure effects expire correctly.

3. **Stat Calculation**: Always use `getEffectiveStats()` when calculating combat damage or movement to account for active buffs/debuffs.

4. **Stun Checks**: Check `isUnitStunned()` before allowing a unit to perform actions.

5. **Effect Stacking**: The system allows multiple effects of the same type from different sources. Effects from the same source will refresh the duration.

6. **Visual Feedback**: Always display status effect indicators on units so players can see what effects are active.

7. **Event Logging**: Process and display combat events generated by status effects to provide feedback to players.

## Example: Hero Ability with Status Effect

```typescript
function castPoisonCloud(caster: Unit, targets: Unit[]): AbilityResult {
  const events: CombatEvent[] = [];
  const effects: Array<{ targetId: string; statusApplied: string }> = [];
  
  // Create poison effect
  const poisonEffect: StatusEffect = {
    type: StatusEffectType.POISON,
    duration: 6,
    value: 15, // 15 damage per second
    source: `${caster.id}-poison-cloud`,
  };
  
  // Apply to all targets
  targets.forEach((target) => {
    const updatedTarget = applyStatusEffect(target, poisonEffect);
    
    // Create event
    events.push({
      type: CombatEventType.STATUS_APPLIED,
      timestamp: Date.now(),
      sourceId: caster.id,
      targetId: target.id,
      data: { effectType: 'poison' },
    });
    
    effects.push({
      targetId: target.id,
      statusApplied: 'poison',
    });
    
    // Update target in game state
    updateUnit(updatedTarget);
  });
  
  return {
    success: true,
    abilityId: 'poison-cloud',
    casterId: caster.id,
    targetIds: targets.map((t) => t.id),
    effects,
    events,
  };
}
```

## Vietnamese Translations

The `StatusEffectIndicator` component uses Vietnamese labels:

- Stun: "Choáng"
- Poison: "Độc"
- Buff: "Tăng cường"
- Debuff: "Suy yếu"
- Slow: "Chậm"
- Haste: "Nhanh"

These can be customized in the component's `getEffectDisplay` function.
