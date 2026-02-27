/**
 * Status Effect System Tests
 * Tests for status effect application, duration tracking, and periodic effects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyStatusEffect,
  updateStatusEffectDurations,
  applyStatusEffects,
  getEffectiveStats,
  isUnitStunned,
  removeStatusEffect,
  clearAllStatusEffects,
} from '../engine';
import { Unit, Direction, UnitType, UnitOwner, StatusEffect, StatusEffectType } from '@/types/unit';
import { CombatEventType } from '@/types/combat';

describe('Status Effect System', () => {
  let testUnit: Unit;

  beforeEach(() => {
    testUnit = {
      id: 'test-unit-1',
      type: UnitType.INFANTRY,
      faction: 'vietnamese',
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      attack: 50,
      defense: 40,
      speed: 30,
      direction: Direction.NORTH,
      status: [],
      owner: UnitOwner.PLAYER,
    };
  });

  describe('applyStatusEffect', () => {
    it('should add a new status effect to a unit', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const updatedUnit = applyStatusEffect(testUnit, stunEffect);

      expect(updatedUnit.status).toHaveLength(1);
      expect(updatedUnit.status[0]).toEqual(stunEffect);
    });

    it('should add multiple different status effects', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-2',
      };

      let updatedUnit = applyStatusEffect(testUnit, stunEffect);
      updatedUnit = applyStatusEffect(updatedUnit, poisonEffect);

      expect(updatedUnit.status).toHaveLength(2);
      expect(updatedUnit.status[0].type).toBe(StatusEffectType.STUN);
      expect(updatedUnit.status[1].type).toBe(StatusEffectType.POISON);
    });

    it('should refresh duration when applying same effect from same source', () => {
      const effect1: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 10,
        source: 'ability-1',
      };

      const effect2: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      let updatedUnit = applyStatusEffect(testUnit, effect1);
      expect(updatedUnit.status[0].duration).toBe(3);

      updatedUnit = applyStatusEffect(updatedUnit, effect2);
      expect(updatedUnit.status).toHaveLength(1);
      expect(updatedUnit.status[0].duration).toBe(5);
    });

    it('should allow same effect type from different sources', () => {
      const poison1: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 10,
        source: 'ability-1',
      };

      const poison2: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 15,
        source: 'ability-2',
      };

      let updatedUnit = applyStatusEffect(testUnit, poison1);
      updatedUnit = applyStatusEffect(updatedUnit, poison2);

      expect(updatedUnit.status).toHaveLength(2);
      expect(updatedUnit.status[0].source).toBe('ability-1');
      expect(updatedUnit.status[1].source).toBe('ability-2');
    });
  });

  describe('updateStatusEffectDurations', () => {
    it('should decrease effect durations by delta time', () => {
      const effect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 5,
        source: 'ability-1',
      };

      const unitWithEffect = applyStatusEffect(testUnit, effect);
      const updatedUnit = updateStatusEffectDurations(unitWithEffect, 1);

      expect(updatedUnit.status[0].duration).toBe(4);
    });

    it('should remove effects with duration <= 0', () => {
      const effect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 1,
        source: 'ability-1',
      };

      const unitWithEffect = applyStatusEffect(testUnit, effect);
      const updatedUnit = updateStatusEffectDurations(unitWithEffect, 1.5);

      expect(updatedUnit.status).toHaveLength(0);
    });

    it('should handle multiple effects with different durations', () => {
      const stun: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 2,
        source: 'ability-1',
      };

      const poison: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-2',
      };

      let unitWithEffects = applyStatusEffect(testUnit, stun);
      unitWithEffects = applyStatusEffect(unitWithEffects, poison);

      const updatedUnit = updateStatusEffectDurations(unitWithEffects, 3);

      expect(updatedUnit.status).toHaveLength(1);
      expect(updatedUnit.status[0].type).toBe(StatusEffectType.POISON);
      expect(updatedUnit.status[0].duration).toBe(2);
    });
  });

  describe('applyStatusEffects', () => {
    it('should apply poison damage over time', () => {
      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10, // 10 damage per second
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(testUnit, poisonEffect);
      const result = applyStatusEffects(unitWithPoison, 1); // 1 second

      expect(result.damage).toBe(10);
      expect(result.unit.health).toBe(90);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe(CombatEventType.DAMAGE);
      expect(result.events[0].value).toBe(10);
    });

    it('should apply poison damage proportional to delta time', () => {
      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(testUnit, poisonEffect);
      const result = applyStatusEffects(unitWithPoison, 0.5); // 0.5 seconds

      expect(result.damage).toBe(5);
      expect(result.unit.health).toBe(95);
    });

    it('should create death event when unit dies from poison', () => {
      const lowHealthUnit: Unit = {
        ...testUnit,
        health: 5,
      };

      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(lowHealthUnit, poisonEffect);
      const result = applyStatusEffects(unitWithPoison, 1);

      expect(result.unit.health).toBe(0);
      expect(result.events).toHaveLength(2); // Damage and death events
      expect(result.events[1].type).toBe(CombatEventType.DEATH);
    });

    it('should handle multiple poison effects', () => {
      const poison1: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const poison2: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 5,
        source: 'ability-2',
      };

      let unitWithPoisons = applyStatusEffect(testUnit, poison1);
      unitWithPoisons = applyStatusEffect(unitWithPoisons, poison2);

      const result = applyStatusEffects(unitWithPoisons, 1);

      expect(result.damage).toBe(15); // 10 + 5
      expect(result.unit.health).toBe(85);
    });

    it('should not apply damage for non-damaging effects', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const unitWithStun = applyStatusEffect(testUnit, stunEffect);
      const result = applyStatusEffects(unitWithStun, 1);

      expect(result.damage).toBe(0);
      expect(result.unit.health).toBe(100);
      expect(result.events).toHaveLength(0);
    });
  });

  describe('getEffectiveStats', () => {
    it('should return base stats when no effects are active', () => {
      const stats = getEffectiveStats(testUnit);

      expect(stats.attack).toBe(50);
      expect(stats.defense).toBe(40);
      expect(stats.speed).toBe(30);
    });

    it('should apply buff to increase stats', () => {
      const buffEffect: StatusEffect = {
        type: StatusEffectType.BUFF,
        duration: 5,
        value: 0.5, // 50% increase
        stat: 'attack',
        source: 'ability-1',
      };

      const unitWithBuff = applyStatusEffect(testUnit, buffEffect);
      const stats = getEffectiveStats(unitWithBuff);

      expect(stats.attack).toBe(75); // 50 * 1.5 = 75
      expect(stats.defense).toBe(40); // Unchanged
    });

    it('should apply debuff to decrease stats', () => {
      const debuffEffect: StatusEffect = {
        type: StatusEffectType.DEBUFF,
        duration: 5,
        value: 0.3, // 30% decrease
        stat: 'defense',
        source: 'ability-1',
      };

      const unitWithDebuff = applyStatusEffect(testUnit, debuffEffect);
      const stats = getEffectiveStats(unitWithDebuff);

      expect(stats.defense).toBe(28); // 40 * 0.7 = 28
      expect(stats.attack).toBe(50); // Unchanged
    });

    it('should apply slow to reduce speed', () => {
      const slowEffect: StatusEffect = {
        type: StatusEffectType.SLOW,
        duration: 5,
        value: 0.5, // 50% reduction
        stat: 'speed',
        source: 'ability-1',
      };

      const unitWithSlow = applyStatusEffect(testUnit, slowEffect);
      const stats = getEffectiveStats(unitWithSlow);

      expect(stats.speed).toBe(15); // 30 * 0.5 = 15
    });

    it('should apply haste to increase speed', () => {
      const hasteEffect: StatusEffect = {
        type: StatusEffectType.HASTE,
        duration: 5,
        value: 0.5, // 50% increase
        stat: 'speed',
        source: 'ability-1',
      };

      const unitWithHaste = applyStatusEffect(testUnit, hasteEffect);
      const stats = getEffectiveStats(unitWithHaste);

      expect(stats.speed).toBe(45); // 30 * 1.5 = 45
    });

    it('should apply multiple effects cumulatively', () => {
      const attackBuff: StatusEffect = {
        type: StatusEffectType.BUFF,
        duration: 5,
        value: 0.5,
        stat: 'attack',
        source: 'ability-1',
      };

      const defenseBuff: StatusEffect = {
        type: StatusEffectType.BUFF,
        duration: 5,
        value: 0.25,
        stat: 'defense',
        source: 'ability-2',
      };

      let unitWithBuffs = applyStatusEffect(testUnit, attackBuff);
      unitWithBuffs = applyStatusEffect(unitWithBuffs, defenseBuff);

      const stats = getEffectiveStats(unitWithBuffs);

      expect(stats.attack).toBe(75); // 50 * 1.5
      expect(stats.defense).toBe(50); // 40 * 1.25
    });

    it('should not allow stats to go below 0', () => {
      const massiveDebuff: StatusEffect = {
        type: StatusEffectType.DEBUFF,
        duration: 5,
        value: 2.0, // 200% decrease (more than 100%)
        stat: 'attack',
        source: 'ability-1',
      };

      const unitWithDebuff = applyStatusEffect(testUnit, massiveDebuff);
      const stats = getEffectiveStats(unitWithDebuff);

      expect(stats.attack).toBe(0); // Should be clamped to 0
    });
  });

  describe('isUnitStunned', () => {
    it('should return false when unit has no stun effect', () => {
      expect(isUnitStunned(testUnit)).toBe(false);
    });

    it('should return true when unit has stun effect', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const unitWithStun = applyStatusEffect(testUnit, stunEffect);
      expect(isUnitStunned(unitWithStun)).toBe(true);
    });

    it('should return false when unit has other effects but not stun', () => {
      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(testUnit, poisonEffect);
      expect(isUnitStunned(unitWithPoison)).toBe(false);
    });
  });

  describe('removeStatusEffect', () => {
    it('should remove effect by type', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const unitWithStun = applyStatusEffect(testUnit, stunEffect);
      const updatedUnit = removeStatusEffect(unitWithStun, StatusEffectType.STUN);

      expect(updatedUnit.status).toHaveLength(0);
    });

    it('should remove only effects from specific source', () => {
      const poison1: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const poison2: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 5,
        source: 'ability-2',
      };

      let unitWithPoisons = applyStatusEffect(testUnit, poison1);
      unitWithPoisons = applyStatusEffect(unitWithPoisons, poison2);

      const updatedUnit = removeStatusEffect(unitWithPoisons, StatusEffectType.POISON, 'ability-1');

      expect(updatedUnit.status).toHaveLength(1);
      expect(updatedUnit.status[0].source).toBe('ability-2');
    });

    it('should not remove effects of different types', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-2',
      };

      let unitWithEffects = applyStatusEffect(testUnit, stunEffect);
      unitWithEffects = applyStatusEffect(unitWithEffects, poisonEffect);

      const updatedUnit = removeStatusEffect(unitWithEffects, StatusEffectType.STUN);

      expect(updatedUnit.status).toHaveLength(1);
      expect(updatedUnit.status[0].type).toBe(StatusEffectType.POISON);
    });
  });

  describe('clearAllStatusEffects', () => {
    it('should remove all status effects', () => {
      const stun: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const poison: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-2',
      };

      let unitWithEffects = applyStatusEffect(testUnit, stun);
      unitWithEffects = applyStatusEffect(unitWithEffects, poison);

      const clearedUnit = clearAllStatusEffects(unitWithEffects);

      expect(clearedUnit.status).toHaveLength(0);
    });

    it('should work on unit with no effects', () => {
      const clearedUnit = clearAllStatusEffects(testUnit);
      expect(clearedUnit.status).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete status effect lifecycle', () => {
      // Apply poison effect
      const poisonEffect: StatusEffect = {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 10,
        source: 'ability-1',
      };

      let unit = applyStatusEffect(testUnit, poisonEffect);
      expect(unit.status).toHaveLength(1);

      // Apply damage over 1 second
      let result = applyStatusEffects(unit, 1);
      unit = result.unit;
      expect(unit.health).toBe(90);

      // Update durations
      unit = updateStatusEffectDurations(unit, 1);
      expect(unit.status[0].duration).toBe(2);

      // Apply more damage
      result = applyStatusEffects(unit, 1);
      unit = result.unit;
      expect(unit.health).toBe(80);

      // Update durations again
      unit = updateStatusEffectDurations(unit, 1);
      expect(unit.status[0].duration).toBe(1);

      // Final damage and expiration
      result = applyStatusEffects(unit, 1);
      unit = result.unit;
      expect(unit.health).toBe(70);

      unit = updateStatusEffectDurations(unit, 1);
      expect(unit.status).toHaveLength(0); // Effect expired
    });

    it('should handle buff affecting combat damage', () => {
      // Apply attack buff
      const attackBuff: StatusEffect = {
        type: StatusEffectType.BUFF,
        duration: 5,
        value: 0.5, // 50% increase
        stat: 'attack',
        source: 'ability-1',
      };

      const buffedUnit = applyStatusEffect(testUnit, attackBuff);
      const stats = getEffectiveStats(buffedUnit);

      expect(stats.attack).toBe(75); // 50 * 1.5
      expect(buffedUnit.attack).toBe(50); // Base stat unchanged
    });

    it('should handle stun preventing actions', () => {
      const stunEffect: StatusEffect = {
        type: StatusEffectType.STUN,
        duration: 2,
        source: 'ability-1',
      };

      const stunnedUnit = applyStatusEffect(testUnit, stunEffect);

      expect(isUnitStunned(stunnedUnit)).toBe(true);

      // After duration expires
      const updatedUnit = updateStatusEffectDurations(stunnedUnit, 2.5);
      expect(isUnitStunned(updatedUnit)).toBe(false);
    });
  });
});
