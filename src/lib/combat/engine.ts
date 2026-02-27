/**
 * Combat Engine Core
 * Implements direction-based combat calculations, unit type advantages, and combat processing
 * 
 * Validates Requirements:
 * - 13.1: Direction-based combat calculations
 * - 13.2: Unit interactions (attack, defend, move)
 * - 13.3: Damage calculation with stats, direction, and modifiers
 * - 13.5: Status effect system
 * - 13.6: Unit death handling
 * - 13.8: Game balance maintenance
 */

import { Unit, Direction, UnitType, StatusEffect, StatusEffectType, UnitStats, Vector2 } from '@/types/unit';
import { CombatResult, CombatEvent, CombatEventType, DamageCalculation, AbilityResult } from '@/types/combat';
import { UNIT_TYPE_ADVANTAGES, DIRECTION_DAMAGE_MULTIPLIERS } from '@/constants/units';
import { Ability, AbilityEffect } from '@/types/hero';

/**
 * Calculate the relative attack direction based on attacker and defender facing
 * 
 * The logic determines if the attacker is hitting the defender from the front, side, or rear
 * based on the angle between the attacker's facing direction and the defender's facing direction.
 * 
 * - FRONT: Attacker and defender are facing each other (opposite directions) or similar angles
 * - SIDE: Attacker is attacking from the side (perpendicular)
 * - REAR: Attacker is attacking from behind (same direction as defender)
 * 
 * @param attackerDirection - Direction the attacker is facing
 * @param defenderDirection - Direction the defender is facing
 * @returns 'FRONT', 'SIDE', or 'REAR' attack classification
 */
export function getRelativeAttackDirection(
  attackerDirection: Direction,
  defenderDirection: Direction
): keyof typeof DIRECTION_DAMAGE_MULTIPLIERS {
  // Map directions to angles for calculation
  const directionAngles: Record<Direction, number> = {
    [Direction.NORTH]: 0,
    [Direction.NORTHEAST]: 45,
    [Direction.EAST]: 90,
    [Direction.SOUTHEAST]: 135,
    [Direction.SOUTH]: 180,
    [Direction.SOUTHWEST]: 225,
    [Direction.WEST]: 270,
    [Direction.NORTHWEST]: 315,
  };

  const attackerAngle = directionAngles[attackerDirection];
  const defenderAngle = directionAngles[defenderDirection];

  // Calculate the angle difference
  let angleDiff = Math.abs(attackerAngle - defenderAngle);
  
  // Normalize to 0-180 range
  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff;
  }

  // Classify attack direction based on angle difference:
  // - 0-45 degrees: Same direction (REAR attack - attacker behind defender)
  // - 45-135 degrees: Perpendicular (SIDE attack)
  // - 135-180 degrees: Opposite directions (FRONT attack - facing each other)
  if (angleDiff >= 135) {
    return 'FRONT'; // Facing each other
  } else if (angleDiff >= 45) {
    return 'SIDE'; // Perpendicular
  } else {
    return 'REAR'; // Same direction (behind)
  }
}

/**
 * Calculate damage for an attack with direction-based modifiers
 * 
 * Implements Requirements 13.1, 13.3, 13.8
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @param attackDirection - Direction classification ('FRONT', 'SIDE', or 'REAR')
 * @returns Calculated damage amount
 */
export function calculateDamage(
  attacker: Unit,
  defender: Unit,
  attackDirection: keyof typeof DIRECTION_DAMAGE_MULTIPLIERS = 'FRONT'
): number {
  // Base damage calculation: attacker's attack minus defender's defense
  const baseDamage = Math.max(0, attacker.attack - defender.defense);

  // Get direction-based modifier
  const directionModifier = DIRECTION_DAMAGE_MULTIPLIERS[attackDirection];

  // Get unit type advantage modifier
  const typeModifier = UNIT_TYPE_ADVANTAGES[attacker.type][defender.type];

  // Random factor for combat variance (90% to 110%)
  const randomFactor = 0.9 + Math.random() * 0.2;

  // Calculate final damage
  const finalDamage = Math.floor(baseDamage * directionModifier * typeModifier * randomFactor);

  return Math.max(0, finalDamage);
}

/**
 * Get unit type advantage multiplier
 * 
 * Implements Requirement 13.8 (game balance)
 * 
 * @param attackerType - Type of the attacking unit
 * @param defenderType - Type of the defending unit
 * @returns Damage multiplier based on unit type matchup
 */
export function getUnitTypeAdvantage(attackerType: UnitType, defenderType: UnitType): number {
  return UNIT_TYPE_ADVANTAGES[attackerType][defenderType];
}

/**
 * Process an attack between two units
 * 
 * Implements Requirements 13.2, 13.3
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @returns Combat result with damage, events, and outcome
 */
export function processAttack(attacker: Unit, defender: Unit): CombatResult {
  const timestamp = Date.now();
  const events: CombatEvent[] = [];

  // Determine relative attack direction
  const relativeDirection = getRelativeAttackDirection(attacker.direction, defender.direction);

  // Calculate damage
  const damage = calculateDamage(attacker, defender, relativeDirection);

  // Check for critical hit (10% chance for rear attacks)
  const isCritical = relativeDirection === 'REAR' && Math.random() < 0.1;
  const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;

  // Create attack event
  events.push({
    type: CombatEventType.ATTACK,
    timestamp,
    sourceId: attacker.id,
    targetId: defender.id,
    data: {
      attackDirection: relativeDirection,
      isCritical,
    },
  });

  // Create damage event
  events.push({
    type: CombatEventType.DAMAGE,
    timestamp,
    sourceId: attacker.id,
    targetId: defender.id,
    value: finalDamage,
    position: defender.position,
  });

  // Apply damage to defender (note: this doesn't mutate the original unit)
  const newHealth = Math.max(0, defender.health - finalDamage);
  const isKill = newHealth === 0;

  // Create death event if unit is killed
  if (isKill) {
    events.push({
      type: CombatEventType.DEATH,
      timestamp,
      targetId: defender.id,
      position: defender.position,
    });
  }

  return {
    success: true,
    damage: finalDamage,
    attackerId: attacker.id,
    defenderId: defender.id,
    attackDirection: attacker.direction,
    defenseDirection: defender.direction,
    isCritical,
    isKill,
    events,
  };
}

/**
 * Check if a unit is dead
 * 
 * Implements Requirement 13.6
 * 
 * @param unit - The unit to check
 * @returns True if the unit's health is 0 or below
 */
export function checkUnitDeath(unit: Unit): boolean {
  return unit.health <= 0;
}

/**
 * Get detailed damage calculation breakdown for debugging/display
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @param attackDirection - Direction classification
 * @returns Detailed damage calculation with all modifiers
 */
export function getDamageCalculation(
  attacker: Unit,
  defender: Unit,
  attackDirection: keyof typeof DIRECTION_DAMAGE_MULTIPLIERS = 'FRONT'
): DamageCalculation {
  const baseAttack = attacker.attack;
  const baseDefense = defender.defense;
  const directionModifier = DIRECTION_DAMAGE_MULTIPLIERS[attackDirection];
  const typeModifier = UNIT_TYPE_ADVANTAGES[attacker.type][defender.type];
  const randomFactor = 0.9 + Math.random() * 0.2;

  const baseDamage = Math.max(0, baseAttack - baseDefense);
  const finalDamage = Math.floor(baseDamage * directionModifier * typeModifier * randomFactor);

  return {
    baseAttack,
    baseDefense,
    attackDirection: attacker.direction,
    defenseDirection: defender.direction,
    attackerType: attacker.type,
    defenderType: defender.type,
    modifiers: {
      directionModifier,
      typeModifier,
      randomFactor,
    },
    finalDamage: Math.max(0, finalDamage),
  };
}

/**
 * Apply a status effect to a unit
 * 
 * Implements Requirement 13.5 (status effect system)
 * 
 * @param unit - The unit to apply the effect to
 * @param effect - The status effect to apply
 * @returns Updated unit with the new status effect
 */
export function applyStatusEffect(unit: Unit, effect: StatusEffect): Unit {
  // Check if the unit already has this type of effect from the same source
  const existingEffectIndex = unit.status.findIndex(
    (e) => e.type === effect.type && e.source === effect.source
  );

  let newStatus: StatusEffect[];
  
  if (existingEffectIndex !== -1) {
    // Refresh the duration if the effect already exists
    newStatus = [...unit.status];
    newStatus[existingEffectIndex] = effect;
  } else {
    // Add new effect
    newStatus = [...unit.status, effect];
  }

  return {
    ...unit,
    status: newStatus,
  };
}

/**
 * Update status effect durations and remove expired effects
 * 
 * Implements Requirement 13.5 (status effect duration tracking)
 * 
 * @param unit - The unit to update
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns Updated unit with decremented effect durations
 */
export function updateStatusEffectDurations(unit: Unit, deltaTime: number): Unit {
  const updatedStatus = unit.status
    .map((effect) => ({
      ...effect,
      duration: effect.duration - deltaTime,
    }))
    .filter((effect) => effect.duration > 0);

  return {
    ...unit,
    status: updatedStatus,
  };
}

/**
 * Apply periodic status effects (like poison damage)
 * 
 * Implements Requirement 13.5 (periodic status effects)
 * 
 * @param unit - The unit to apply effects to
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns Object containing updated unit, damage dealt, and events
 */
export function applyStatusEffects(
  unit: Unit,
  deltaTime: number
): {
  unit: Unit;
  damage: number;
  events: CombatEvent[];
} {
  let updatedUnit = { ...unit };
  let totalDamage = 0;
  const events: CombatEvent[] = [];
  const timestamp = Date.now();

  // Process each status effect
  for (const effect of unit.status) {
    switch (effect.type) {
      case StatusEffectType.POISON:
        // Poison deals damage over time
        if (effect.value) {
          const poisonDamage = Math.floor(effect.value * deltaTime);
          totalDamage += poisonDamage;
          updatedUnit.health = Math.max(0, updatedUnit.health - poisonDamage);

          events.push({
            type: CombatEventType.DAMAGE,
            timestamp,
            targetId: unit.id,
            value: poisonDamage,
            position: unit.position,
            data: { source: 'poison' },
          });
        }
        break;

      case StatusEffectType.STUN:
        // Stun prevents unit from acting (handled by game logic, not here)
        break;

      case StatusEffectType.BUFF:
      case StatusEffectType.DEBUFF:
        // Buffs and debuffs modify stats (applied when calculating stats)
        break;

      case StatusEffectType.SLOW:
      case StatusEffectType.HASTE:
        // Speed modifiers (applied when calculating stats)
        break;
    }
  }

  // Check if unit died from status effects
  if (updatedUnit.health <= 0) {
    events.push({
      type: CombatEventType.DEATH,
      timestamp,
      targetId: unit.id,
      position: unit.position,
      data: { source: 'status-effect' },
    });
  }

  return {
    unit: updatedUnit,
    damage: totalDamage,
    events,
  };
}

/**
 * Get the effective stats of a unit after applying all status effects
 * 
 * Implements Requirement 13.5 (stat modification from buffs/debuffs)
 * 
 * @param unit - The unit to calculate stats for
 * @returns Effective stats with all modifiers applied
 */
export function getEffectiveStats(unit: Unit): UnitStats {
  let stats: UnitStats = {
    attack: unit.attack,
    defense: unit.defense,
    speed: unit.speed,
    health: unit.health,
    maxHealth: unit.maxHealth,
  };

  // Apply all status effect modifiers
  for (const effect of unit.status) {
    if (effect.stat && effect.value) {
      const modifier = effect.value;

      switch (effect.type) {
        case StatusEffectType.BUFF:
          // Buffs increase stats
          stats[effect.stat] = Math.floor(stats[effect.stat] * (1 + modifier));
          break;

        case StatusEffectType.DEBUFF:
          // Debuffs decrease stats
          stats[effect.stat] = Math.floor(stats[effect.stat] * (1 - modifier));
          break;

        case StatusEffectType.SLOW:
          // Slow reduces speed
          if (effect.stat === 'speed') {
            stats.speed = Math.floor(stats.speed * (1 - modifier));
          }
          break;

        case StatusEffectType.HASTE:
          // Haste increases speed
          if (effect.stat === 'speed') {
            stats.speed = Math.floor(stats.speed * (1 + modifier));
          }
          break;
      }
    }
  }

  // Ensure stats don't go below 0
  stats.attack = Math.max(0, stats.attack);
  stats.defense = Math.max(0, stats.defense);
  stats.speed = Math.max(0, stats.speed);

  return stats;
}

/**
 * Check if a unit is stunned
 * 
 * @param unit - The unit to check
 * @returns True if the unit has an active stun effect
 */
export function isUnitStunned(unit: Unit): boolean {
  return unit.status.some((effect) => effect.type === StatusEffectType.STUN);
}

/**
 * Remove a specific status effect from a unit
 * 
 * @param unit - The unit to remove the effect from
 * @param effectType - The type of effect to remove
 * @param source - Optional source identifier to remove only effects from a specific source
 * @returns Updated unit with the effect removed
 */
export function removeStatusEffect(
  unit: Unit,
  effectType: StatusEffectType,
  source?: string
): Unit {
  const newStatus = unit.status.filter((effect) => {
    if (effect.type !== effectType) return true;
    if (source && effect.source !== source) return true;
    return false;
  });

  return {
    ...unit,
    status: newStatus,
  };
}

/**
 * Clear all status effects from a unit
 * 
 * @param unit - The unit to clear effects from
 * @returns Updated unit with no status effects
 */
export function clearAllStatusEffects(unit: Unit): Unit {
  return {
    ...unit,
    status: [],
  };
}

/**
 * Ability cooldown tracking
 * Maps unit/hero ID to ability ID to cooldown remaining (in seconds)
 */
const abilityCooldowns = new Map<string, Map<string, number>>();

/**
 * Get the remaining cooldown for an ability
 * 
 * @param casterId - ID of the unit/hero casting the ability
 * @param abilityId - ID of the ability
 * @returns Remaining cooldown in seconds (0 if ready)
 */
export function getAbilityCooldown(casterId: string, abilityId: string): number {
  const casterCooldowns = abilityCooldowns.get(casterId);
  if (!casterCooldowns) return 0;
  return casterCooldowns.get(abilityId) || 0;
}

/**
 * Set the cooldown for an ability
 * 
 * @param casterId - ID of the unit/hero casting the ability
 * @param abilityId - ID of the ability
 * @param cooldown - Cooldown duration in seconds
 */
export function setAbilityCooldown(casterId: string, abilityId: string, cooldown: number): void {
  let casterCooldowns = abilityCooldowns.get(casterId);
  if (!casterCooldowns) {
    casterCooldowns = new Map();
    abilityCooldowns.set(casterId, casterCooldowns);
  }
  casterCooldowns.set(abilityId, cooldown);
}

/**
 * Update ability cooldowns for a caster
 * 
 * @param casterId - ID of the unit/hero
 * @param deltaTime - Time elapsed since last update (in seconds)
 */
export function updateAbilityCooldowns(casterId: string, deltaTime: number): void {
  const casterCooldowns = abilityCooldowns.get(casterId);
  if (!casterCooldowns) return;

  for (const [abilityId, cooldown] of casterCooldowns.entries()) {
    const newCooldown = Math.max(0, cooldown - deltaTime);
    if (newCooldown === 0) {
      casterCooldowns.delete(abilityId);
    } else {
      casterCooldowns.set(abilityId, newCooldown);
    }
  }

  // Clean up empty maps
  if (casterCooldowns.size === 0) {
    abilityCooldowns.delete(casterId);
  }
}

/**
 * Clear all cooldowns for a caster (useful when unit dies or game resets)
 * 
 * @param casterId - ID of the unit/hero
 */
export function clearAbilityCooldowns(casterId: string): void {
  abilityCooldowns.delete(casterId);
}

/**
 * Find all units within a radius of a target position
 * 
 * @param targetPosition - Center position for area-of-effect
 * @param radius - Radius in grid units
 * @param allUnits - Array of all units to check
 * @param excludeId - Optional unit ID to exclude from results
 * @returns Array of units within the radius
 */
export function findUnitsInRadius(
  targetPosition: Vector2,
  radius: number,
  allUnits: Unit[],
  excludeId?: string
): Unit[] {
  return allUnits.filter((unit) => {
    if (excludeId && unit.id === excludeId) return false;
    
    const dx = unit.position.x - targetPosition.x;
    const dy = unit.position.y - targetPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= radius;
  });
}

/**
 * Validate if an ability can be cast
 * 
 * @param casterId - ID of the unit/hero casting the ability
 * @param abilityId - ID of the ability
 * @param abilityCost - Resource cost of the ability
 * @param abilityCooldown - Cooldown duration of the ability
 * @param availableResources - Current available resources (e.g., mana, energy)
 * @returns Object with validation result and error message if invalid
 */
export function validateAbilityCast(
  casterId: string,
  abilityId: string,
  abilityCost: number,
  abilityCooldown: number,
  availableResources: number
): { valid: boolean; error?: string } {
  // Check cooldown
  const remainingCooldown = getAbilityCooldown(casterId, abilityId);
  if (remainingCooldown > 0) {
    return {
      valid: false,
      error: `Ability on cooldown for ${remainingCooldown.toFixed(1)}s`,
    };
  }

  // Check resource cost
  if (availableResources < abilityCost) {
    return {
      valid: false,
      error: `Insufficient resources (need ${abilityCost}, have ${availableResources})`,
    };
  }

  return { valid: true };
}

/**
 * Resolve a hero ability and apply its effects
 * 
 * Implements Requirements 11.2, 13.5 (hero ability system)
 * 
 * @param caster - The unit/hero casting the ability
 * @param ability - The ability being cast
 * @param targetPosition - Target position for the ability
 * @param allUnits - Array of all units on the battlefield
 * @param availableResources - Current available resources for cost validation
 * @returns Ability result with effects applied and events generated
 */
export function resolveAbility(
  caster: Unit,
  ability: Ability,
  targetPosition: Vector2,
  allUnits: Unit[],
  availableResources: number
): AbilityResult {
  const timestamp = Date.now();
  const events: CombatEvent[] = [];
  const effects: AbilityResult['effects'] = [];

  // Validate ability can be cast
  const validation = validateAbilityCast(
    caster.id,
    ability.id,
    ability.cost,
    ability.cooldown,
    availableResources
  );

  if (!validation.valid) {
    return {
      success: false,
      abilityId: ability.id,
      casterId: caster.id,
      targetIds: [],
      effects: [],
      events: [
        {
          type: CombatEventType.ABILITY_USED,
          timestamp,
          sourceId: caster.id,
          data: {
            abilityId: ability.id,
            error: validation.error,
          },
        },
      ],
    };
  }

  // Set ability on cooldown
  setAbilityCooldown(caster.id, ability.id, ability.cooldown);

  // Create ability used event
  events.push({
    type: CombatEventType.ABILITY_USED,
    timestamp,
    sourceId: caster.id,
    position: targetPosition,
    data: {
      abilityId: ability.id,
      abilityName: ability.name,
    },
  });

  // Apply ability effect based on type
  const effect = ability.effect;

  switch (effect.type) {
    case 'damage': {
      // Find all units in radius
      const targets = findUnitsInRadius(targetPosition, effect.radius, allUnits, caster.id);

      for (const target of targets) {
        // Apply damage
        const damage = effect.value;

        effects.push({
          targetId: target.id,
          damage,
        });

        events.push({
          type: CombatEventType.DAMAGE,
          timestamp,
          sourceId: caster.id,
          targetId: target.id,
          value: damage,
          position: target.position,
          data: { source: 'ability', abilityId: ability.id },
        });

        // Check for death
        if (target.health - damage <= 0) {
          events.push({
            type: CombatEventType.DEATH,
            timestamp,
            targetId: target.id,
            position: target.position,
            data: { source: 'ability', abilityId: ability.id },
          });
        }
      }

      break;
    }

    case 'heal': {
      // Find all allied units in radius
      const targets = findUnitsInRadius(targetPosition, effect.radius, allUnits);
      const alliedTargets = targets.filter((unit) => unit.owner === caster.owner);

      for (const target of alliedTargets) {
        // Apply healing
        const healing = Math.min(effect.value, target.maxHealth - target.health);

        effects.push({
          targetId: target.id,
          healing,
        });

        events.push({
          type: CombatEventType.HEAL,
          timestamp,
          sourceId: caster.id,
          targetId: target.id,
          value: healing,
          position: target.position,
          data: { source: 'ability', abilityId: ability.id },
        });
      }

      break;
    }

    case 'buff': {
      // Find all allied units in radius (buffs only affect allies)
      const targets = findUnitsInRadius(targetPosition, 999, allUnits); // Large radius for buffs
      const alliedTargets = targets.filter((unit) => unit.owner === caster.owner);

      for (const target of alliedTargets) {
        // Create status effect for buff
        const statusEffect: StatusEffect = {
          type: StatusEffectType.BUFF,
          duration: effect.duration,
          stat: effect.stat as keyof UnitStats,
          value: effect.value / 100, // Convert percentage to decimal
          source: ability.id,
        };

        effects.push({
          targetId: target.id,
          statusApplied: `buff-${effect.stat}`,
        });

        events.push({
          type: CombatEventType.STATUS_APPLIED,
          timestamp,
          sourceId: caster.id,
          targetId: target.id,
          position: target.position,
          data: {
            statusType: 'buff',
            stat: effect.stat,
            value: effect.value,
            duration: effect.duration,
            abilityId: ability.id,
          },
        });
      }

      break;
    }

    case 'debuff': {
      // Find all enemy units in radius
      const targets = findUnitsInRadius(targetPosition, 999, allUnits, caster.id); // Large radius for debuffs
      const enemyTargets = targets.filter((unit) => unit.owner !== caster.owner);

      for (const target of enemyTargets) {
        // Create status effect for debuff
        const statusEffect: StatusEffect = {
          type: StatusEffectType.DEBUFF,
          duration: effect.duration,
          stat: effect.stat as keyof UnitStats,
          value: effect.value / 100, // Convert percentage to decimal
          source: ability.id,
        };

        effects.push({
          targetId: target.id,
          statusApplied: `debuff-${effect.stat}`,
        });

        events.push({
          type: CombatEventType.STATUS_APPLIED,
          timestamp,
          sourceId: caster.id,
          targetId: target.id,
          position: target.position,
          data: {
            statusType: 'debuff',
            stat: effect.stat,
            value: effect.value,
            duration: effect.duration,
            abilityId: ability.id,
          },
        });
      }

      break;
    }
  }

  return {
    success: true,
    abilityId: ability.id,
    casterId: caster.id,
    targetIds: effects.map((e) => e.targetId),
    effects,
    events,
  };
}
