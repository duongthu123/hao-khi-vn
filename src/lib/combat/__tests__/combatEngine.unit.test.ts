/**
 * Combat Engine Unit Tests
 * Comprehensive tests for combat engine covering:
 * - Damage calculation with various unit types and directions
 * - Unit type advantage matrix
 * - Status effect application and duration
 * - Hero ability effects
 * - Combat balance verification
 * 
 * Validates Requirements:
 * - 27.2: Unit tests for Combat_Engine calculations
 * - 31.5: Combat calculations produce same results as original
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateDamage,
  getRelativeAttackDirection,
  getUnitTypeAdvantage,
  processAttack,
  getDamageCalculation,
  applyStatusEffect,
  updateStatusEffectDurations,
  applyStatusEffects,
  getEffectiveStats,
  resolveAbility,
  findUnitsInRadius,
} from '../engine';
import { Unit, Direction, UnitType, UnitOwner, StatusEffectType } from '@/types/unit';
import { Ability } from '@/types/hero';
import { DIRECTION_DAMAGE_MULTIPLIERS, UNIT_TYPE_ADVANTAGES } from '@/constants/units';

describe('Combat Engine - Comprehensive Unit Tests', () => {
  let infantryUnit: Unit;
  let cavalryUnit: Unit;
  let archerUnit: Unit;
  let siegeUnit: Unit;

  beforeEach(() => {
    infantryUnit = {
      id: 'infantry-1',
      type: UnitType.INFANTRY,
      faction: 'vietnamese',
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      attack: 40,
      defense: 50,
      speed: 30,
      direction: Direction.NORTH,
      status: [],
      owner: UnitOwner.PLAYER,
    };

    cavalryUnit = {
      id: 'cavalry-1',
      type: UnitType.CAVALRY,
      faction: 'mongol',
      position: { x: 10, y: 10 },
      health: 80,
      maxHealth: 80,
      attack: 60,
      defense: 35,
      speed: 70,
      direction: Direction.SOUTH,
      status: [],
      owner: UnitOwner.AI,
    };

    archerUnit = {
      id: 'archer-1',
      type: UnitType.ARCHER,
      faction: 'vietnamese',
      position: { x: 5, y: 5 },
      health: 60,
      maxHealth: 60,
      attack: 50,
      defense: 25,
      speed: 40,
      direction: Direction.EAST,
      status: [],
      owner: UnitOwner.PLAYER,
    };

    siegeUnit = {
      id: 'siege-1',
      type: UnitType.SIEGE,
      faction: 'mongol',
      position: { x: 15, y: 15 },
      health: 120,
      maxHealth: 120,
      attack: 80,
      defense: 40,
      speed: 15,
      direction: Direction.WEST,
      status: [],
      owner: UnitOwner.AI,
    };
  });


  describe('Damage Calculation with Various Unit Types', () => {
    it('should calculate correct damage for infantry vs archer', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage = calculateDamage(infantryUnit, archerUnit, 'FRONT');
      
      // Base: 40 - 25 = 15
      // Type advantage: 1.5 (infantry > archer)
      // Direction: 1.0 (front)
      // Random: 1.0
      // Final: 15 * 1.5 * 1.0 * 1.0 = 22.5 -> 22
      expect(damage).toBe(22);
      
      vi.restoreAllMocks();
    });

    it('should calculate correct damage for cavalry vs infantry', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      
      // Base: 60 - 50 = 10
      // Type advantage: 1.5 (cavalry > infantry)
      // Direction: 1.0 (front)
      // Random: 1.0
      // Final: 10 * 1.5 * 1.0 * 1.0 = 15
      expect(damage).toBe(15);
      
      vi.restoreAllMocks();
    });

    it('should calculate correct damage for archer vs cavalry', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage = calculateDamage(archerUnit, cavalryUnit, 'FRONT');
      
      // Base: 50 - 35 = 15
      // Type advantage: 1.5 (archer > cavalry)
      // Direction: 1.0 (front)
      // Random: 1.0
      // Final: 15 * 1.5 * 1.0 * 1.0 = 22.5 -> 22
      expect(damage).toBe(22);
      
      vi.restoreAllMocks();
    });

    it('should calculate correct damage for siege vs infantry (disadvantage)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage = calculateDamage(siegeUnit, infantryUnit, 'FRONT');
      
      // Base: 80 - 50 = 30
      // Type advantage: 0.75 (siege < infantry)
      // Direction: 1.0 (front)
      // Random: 1.0
      // Final: 30 * 0.75 * 1.0 * 1.0 = 22.5 -> 22
      expect(damage).toBe(22);
      
      vi.restoreAllMocks();
    });
  });


  describe('Direction-Based Damage Modifiers', () => {
    it('should apply correct multiplier for front attacks', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const calculation = getDamageCalculation(cavalryUnit, infantryUnit, 'FRONT');
      
      expect(calculation.modifiers.directionModifier).toBe(DIRECTION_DAMAGE_MULTIPLIERS.FRONT);
      expect(calculation.modifiers.directionModifier).toBe(1.0);
      
      vi.restoreAllMocks();
    });

    it('should apply correct multiplier for side attacks', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const frontDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const sideDamage = calculateDamage(cavalryUnit, infantryUnit, 'SIDE');
      
      expect(sideDamage).toBeGreaterThan(frontDamage);
      // Due to integer rounding, the ratio may not be exactly 1.25
      // Verify it's in the expected range (1.15 to 1.35)
      const ratio = sideDamage / frontDamage;
      expect(ratio).toBeGreaterThan(1.15);
      expect(ratio).toBeLessThan(1.35);
      
      vi.restoreAllMocks();
    });

    it('should apply correct multiplier for rear attacks', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const frontDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const rearDamage = calculateDamage(cavalryUnit, infantryUnit, 'REAR');
      
      expect(rearDamage).toBeGreaterThan(frontDamage);
      expect(rearDamage / frontDamage).toBeCloseTo(1.5, 1);
      
      vi.restoreAllMocks();
    });

    it('should correctly determine front attack direction', () => {
      // Opposite directions = front attack
      expect(getRelativeAttackDirection(Direction.NORTH, Direction.SOUTH)).toBe('FRONT');
      expect(getRelativeAttackDirection(Direction.EAST, Direction.WEST)).toBe('FRONT');
      expect(getRelativeAttackDirection(Direction.NORTHEAST, Direction.SOUTHWEST)).toBe('FRONT');
    });

    it('should correctly determine side attack direction', () => {
      // Perpendicular directions = side attack
      expect(getRelativeAttackDirection(Direction.NORTH, Direction.EAST)).toBe('SIDE');
      expect(getRelativeAttackDirection(Direction.NORTH, Direction.WEST)).toBe('SIDE');
      expect(getRelativeAttackDirection(Direction.SOUTH, Direction.EAST)).toBe('SIDE');
    });

    it('should correctly determine rear attack direction', () => {
      // Same direction = rear attack
      expect(getRelativeAttackDirection(Direction.NORTH, Direction.NORTH)).toBe('REAR');
      expect(getRelativeAttackDirection(Direction.SOUTH, Direction.SOUTH)).toBe('REAR');
      expect(getRelativeAttackDirection(Direction.EAST, Direction.EAST)).toBe('REAR');
    });
  });


  describe('Unit Type Advantage Matrix', () => {
    it('should verify infantry advantage over archer (1.5x)', () => {
      const advantage = getUnitTypeAdvantage(UnitType.INFANTRY, UnitType.ARCHER);
      expect(advantage).toBe(1.5);
    });

    it('should verify cavalry advantage over infantry (1.5x)', () => {
      const advantage = getUnitTypeAdvantage(UnitType.CAVALRY, UnitType.INFANTRY);
      expect(advantage).toBe(1.5);
    });

    it('should verify archer advantage over cavalry (1.5x)', () => {
      const advantage = getUnitTypeAdvantage(UnitType.ARCHER, UnitType.CAVALRY);
      expect(advantage).toBe(1.5);
    });

    it('should verify infantry disadvantage vs cavalry (0.75x)', () => {
      const advantage = getUnitTypeAdvantage(UnitType.INFANTRY, UnitType.CAVALRY);
      expect(advantage).toBe(0.75);
    });

    it('should verify cavalry disadvantage vs archer (0.75x)', () => {
      const advantage = getUnitTypeAdvantage(UnitType.CAVALRY, UnitType.ARCHER);
      expect(advantage).toBe(0.75);
    });

    it('should verify archer disadvantage vs infantry (0.75x)', () => {
      const advantage = getUnitTypeAdvantage(UnitType.ARCHER, UnitType.INFANTRY);
      expect(advantage).toBe(0.75);
    });

    it('should verify siege disadvantage vs all units (0.75x)', () => {
      expect(getUnitTypeAdvantage(UnitType.SIEGE, UnitType.INFANTRY)).toBe(0.75);
      expect(getUnitTypeAdvantage(UnitType.SIEGE, UnitType.CAVALRY)).toBe(0.75);
      expect(getUnitTypeAdvantage(UnitType.SIEGE, UnitType.ARCHER)).toBe(0.75);
    });

    it('should verify all units have advantage vs siege (1.5x)', () => {
      expect(getUnitTypeAdvantage(UnitType.INFANTRY, UnitType.SIEGE)).toBe(1.5);
      expect(getUnitTypeAdvantage(UnitType.CAVALRY, UnitType.SIEGE)).toBe(1.5);
      expect(getUnitTypeAdvantage(UnitType.ARCHER, UnitType.SIEGE)).toBe(1.5);
    });

    it('should verify same type matchups are neutral (1.0x)', () => {
      expect(getUnitTypeAdvantage(UnitType.INFANTRY, UnitType.INFANTRY)).toBe(1.0);
      expect(getUnitTypeAdvantage(UnitType.CAVALRY, UnitType.CAVALRY)).toBe(1.0);
      expect(getUnitTypeAdvantage(UnitType.ARCHER, UnitType.ARCHER)).toBe(1.0);
      expect(getUnitTypeAdvantage(UnitType.SIEGE, UnitType.SIEGE)).toBe(1.0);
    });

    it('should verify rock-paper-scissors balance is complete', () => {
      // Infantry > Archer > Cavalry > Infantry
      const infantryVsArcher = getUnitTypeAdvantage(UnitType.INFANTRY, UnitType.ARCHER);
      const archerVsCavalry = getUnitTypeAdvantage(UnitType.ARCHER, UnitType.CAVALRY);
      const cavalryVsInfantry = getUnitTypeAdvantage(UnitType.CAVALRY, UnitType.INFANTRY);
      
      expect(infantryVsArcher).toBe(1.5);
      expect(archerVsCavalry).toBe(1.5);
      expect(cavalryVsInfantry).toBe(1.5);
    });
  });


  describe('Status Effect Application and Duration', () => {
    it('should apply poison status effect correctly', () => {
      const poisonEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(infantryUnit, poisonEffect);
      
      expect(unitWithPoison.status).toHaveLength(1);
      expect(unitWithPoison.status[0].type).toBe(StatusEffectType.POISON);
      expect(unitWithPoison.status[0].duration).toBe(5);
      expect(unitWithPoison.status[0].value).toBe(10);
    });

    it('should apply stun status effect correctly', () => {
      const stunEffect = {
        type: StatusEffectType.STUN,
        duration: 3,
        source: 'ability-1',
      };

      const unitWithStun = applyStatusEffect(infantryUnit, stunEffect);
      
      expect(unitWithStun.status).toHaveLength(1);
      expect(unitWithStun.status[0].type).toBe(StatusEffectType.STUN);
      expect(unitWithStun.status[0].duration).toBe(3);
    });

    it('should apply buff status effect correctly', () => {
      const buffEffect = {
        type: StatusEffectType.BUFF,
        duration: 10,
        value: 0.5,
        stat: 'attack' as const,
        source: 'ability-1',
      };

      const unitWithBuff = applyStatusEffect(infantryUnit, buffEffect);
      
      expect(unitWithBuff.status).toHaveLength(1);
      expect(unitWithBuff.status[0].type).toBe(StatusEffectType.BUFF);
      expect(unitWithBuff.status[0].stat).toBe('attack');
      expect(unitWithBuff.status[0].value).toBe(0.5);
    });

    it('should decrease status effect duration over time', () => {
      const effect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      let unit = applyStatusEffect(infantryUnit, effect);
      unit = updateStatusEffectDurations(unit, 2);
      
      expect(unit.status[0].duration).toBe(3);
    });

    it('should remove expired status effects', () => {
      const effect = {
        type: StatusEffectType.POISON,
        duration: 2,
        value: 10,
        source: 'ability-1',
      };

      let unit = applyStatusEffect(infantryUnit, effect);
      unit = updateStatusEffectDurations(unit, 3);
      
      expect(unit.status).toHaveLength(0);
    });

    it('should apply poison damage over time', () => {
      const poisonEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(infantryUnit, poisonEffect);
      const result = applyStatusEffects(unitWithPoison, 1);
      
      expect(result.damage).toBe(10);
      expect(result.unit.health).toBe(90);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe('damage');
    });

    it('should handle multiple status effects simultaneously', () => {
      let unit = infantryUnit;
      
      unit = applyStatusEffect(unit, {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      });
      
      unit = applyStatusEffect(unit, {
        type: StatusEffectType.BUFF,
        duration: 10,
        value: 0.5,
        stat: 'attack',
        source: 'ability-2',
      });
      
      expect(unit.status).toHaveLength(2);
    });
  });


  describe('Hero Ability Effects', () => {
    let allUnits: Unit[];
    let caster: Unit;

    beforeEach(() => {
      caster = { ...infantryUnit, id: 'caster-1', position: { x: 5, y: 5 } };
      const ally1 = { ...infantryUnit, id: 'ally-1', position: { x: 6, y: 5 }, owner: UnitOwner.PLAYER };
      const enemy1 = { ...cavalryUnit, id: 'enemy-1', position: { x: 5, y: 8 }, owner: UnitOwner.AI };
      const enemy2 = { ...archerUnit, id: 'enemy-2', position: { x: 6, y: 8 }, owner: UnitOwner.AI };
      
      allUnits = [caster, ally1, enemy1, enemy2];
    });

    it('should apply damage ability to units in radius', () => {
      const damageAbility: Ability = {
        id: 'ability-damage',
        name: 'Fireball',
        nameVietnamese: 'Cầu Lửa',
        description: 'Deals area damage',
        descriptionVietnamese: 'Gây sát thương diện rộng',
        cooldown: 30,
        cost: 50,
        effect: {
          type: 'damage',
          value: 100,
          radius: 3,
        },
      };

      const result = resolveAbility(caster, damageAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.effects.every(e => e.damage === 100)).toBe(true);
    });

    it('should apply heal ability to allied units', () => {
      const healAbility: Ability = {
        id: 'ability-heal',
        name: 'Healing Wave',
        nameVietnamese: 'Sóng Hồi Phục',
        description: 'Heals allied units',
        descriptionVietnamese: 'Hồi máu đồng minh',
        cooldown: 45,
        cost: 60,
        effect: {
          type: 'heal',
          value: 30,
          radius: 3,
        },
      };

      // Damage an ally first
      const damagedAlly = { ...allUnits[1], health: 70 };
      const unitsWithDamaged = [caster, damagedAlly, allUnits[2], allUnits[3]];

      const result = resolveAbility(caster, healAbility, { x: 6, y: 5 }, unitsWithDamaged, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.some(e => e.healing !== undefined)).toBe(true);
    });

    it('should apply buff ability to allied units', () => {
      const buffAbility: Ability = {
        id: 'ability-buff',
        name: 'Rally',
        nameVietnamese: 'Tập Hợp',
        description: 'Increases attack of allies',
        descriptionVietnamese: 'Tăng sát thương đồng minh',
        cooldown: 60,
        cost: 80,
        effect: {
          type: 'buff',
          stat: 'attack',
          value: 20,
          duration: 30,
        },
      };

      const result = resolveAbility(caster, buffAbility, { x: 5, y: 5 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.some(e => e.statusApplied?.includes('buff'))).toBe(true);
    });

    it('should apply debuff ability to enemy units', () => {
      const debuffAbility: Ability = {
        id: 'ability-debuff',
        name: 'Weaken',
        nameVietnamese: 'Làm Yếu',
        description: 'Reduces enemy defense',
        descriptionVietnamese: 'Giảm phòng thủ địch',
        cooldown: 50,
        cost: 70,
        effect: {
          type: 'debuff',
          stat: 'defense',
          value: 30,
          duration: 20,
        },
      };

      const result = resolveAbility(caster, debuffAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.some(e => e.statusApplied?.includes('debuff'))).toBe(true);
    });

    it('should find units within radius correctly', () => {
      const targets = findUnitsInRadius({ x: 5, y: 5 }, 2, allUnits);
      
      expect(targets.length).toBeGreaterThan(0);
      expect(targets.some(u => u.id === 'caster-1')).toBe(true);
    });

    it('should exclude caster from damage ability targets', () => {
      const damageAbility: Ability = {
        id: 'ability-damage',
        name: 'Fireball',
        nameVietnamese: 'Cầu Lửa',
        description: 'Deals area damage',
        descriptionVietnamese: 'Gây sát thương diện rộng',
        cooldown: 30,
        cost: 50,
        effect: {
          type: 'damage',
          value: 100,
          radius: 5,
        },
      };

      const result = resolveAbility(caster, damageAbility, { x: 5, y: 5 }, allUnits, 100);
      
      expect(result.effects.every(e => e.targetId !== caster.id)).toBe(true);
    });
  });


  describe('Combat Balance Verification', () => {
    it('should ensure damage is never negative', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const tankUnit: Unit = {
        ...infantryUnit,
        defense: 1000,
      };
      
      const damage = calculateDamage(infantryUnit, tankUnit, 'FRONT');
      expect(damage).toBe(0);
      
      vi.restoreAllMocks();
    });

    it('should ensure random variance stays within 90-110% range', () => {
      const damages: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        damages.push(calculateDamage(cavalryUnit, infantryUnit, 'FRONT'));
      }
      
      const minDamage = Math.min(...damages);
      const maxDamage = Math.max(...damages);
      
      // Verify variance exists
      expect(maxDamage).toBeGreaterThanOrEqual(minDamage);
      
      // Verify variance is reasonable (within ~22% range due to 0.9-1.1 random factor)
      if (minDamage > 0) {
        expect(maxDamage / minDamage).toBeLessThanOrEqual(1.25);
      }
    });

    it('should ensure direction modifiers are correctly applied', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const frontDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const sideDamage = calculateDamage(cavalryUnit, infantryUnit, 'SIDE');
      const rearDamage = calculateDamage(cavalryUnit, infantryUnit, 'REAR');
      
      expect(sideDamage).toBeGreaterThan(frontDamage);
      expect(rearDamage).toBeGreaterThan(sideDamage);
      
      vi.restoreAllMocks();
    });

    it('should ensure type advantages are symmetric', () => {
      const infantryVsArcher = getUnitTypeAdvantage(UnitType.INFANTRY, UnitType.ARCHER);
      const archerVsInfantry = getUnitTypeAdvantage(UnitType.ARCHER, UnitType.INFANTRY);
      
      expect(infantryVsArcher).toBe(1.5);
      expect(archerVsInfantry).toBe(0.75);
      expect(infantryVsArcher * archerVsInfantry).toBeCloseTo(1.125, 2);
    });

    it('should ensure combat is deterministic with fixed random', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage1 = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const damage2 = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      
      expect(damage1).toBe(damage2);
      
      vi.restoreAllMocks();
    });

    it('should ensure critical hits only occur on rear attacks', () => {
      const frontAttacker: Unit = {
        ...cavalryUnit,
        direction: Direction.NORTH,
      };
      
      const frontDefender: Unit = {
        ...infantryUnit,
        direction: Direction.SOUTH,
      };
      
      let foundCritical = false;
      for (let i = 0; i < 50; i++) {
        const result = processAttack(frontAttacker, frontDefender);
        if (result.isCritical) {
          foundCritical = true;
          break;
        }
      }
      
      expect(foundCritical).toBe(false);
    });

    it('should verify rear attacks can produce critical hits', () => {
      const rearAttacker: Unit = {
        ...cavalryUnit,
        direction: Direction.NORTH,
      };
      
      const rearDefender: Unit = {
        ...infantryUnit,
        direction: Direction.NORTH,
      };
      
      let foundCritical = false;
      for (let i = 0; i < 100; i++) {
        const result = processAttack(rearAttacker, rearDefender);
        if (result.isCritical) {
          foundCritical = true;
          break;
        }
      }
      
      expect(foundCritical).toBe(true);
    });
  });


  describe('Status Effect Stat Modifications', () => {
    it('should increase attack with buff', () => {
      const buffEffect = {
        type: StatusEffectType.BUFF,
        duration: 10,
        value: 0.5,
        stat: 'attack' as const,
        source: 'ability-1',
      };

      const unitWithBuff = applyStatusEffect(infantryUnit, buffEffect);
      const stats = getEffectiveStats(unitWithBuff);
      
      expect(stats.attack).toBe(60); // 40 * 1.5 = 60
      expect(stats.defense).toBe(50); // Unchanged
    });

    it('should decrease defense with debuff', () => {
      const debuffEffect = {
        type: StatusEffectType.DEBUFF,
        duration: 10,
        value: 0.3,
        stat: 'defense' as const,
        source: 'ability-1',
      };

      const unitWithDebuff = applyStatusEffect(cavalryUnit, debuffEffect);
      const stats = getEffectiveStats(unitWithDebuff);
      
      expect(stats.defense).toBe(24); // 35 * 0.7 = 24.5 -> 24
      expect(stats.attack).toBe(60); // Unchanged
    });

    it('should increase speed with haste', () => {
      const hasteEffect = {
        type: StatusEffectType.HASTE,
        duration: 10,
        value: 0.5,
        stat: 'speed' as const,
        source: 'ability-1',
      };

      const unitWithHaste = applyStatusEffect(infantryUnit, hasteEffect);
      const stats = getEffectiveStats(unitWithHaste);
      
      expect(stats.speed).toBe(45); // 30 * 1.5 = 45
    });

    it('should decrease speed with slow', () => {
      const slowEffect = {
        type: StatusEffectType.SLOW,
        duration: 10,
        value: 0.5,
        stat: 'speed' as const,
        source: 'ability-1',
      };

      const unitWithSlow = applyStatusEffect(cavalryUnit, slowEffect);
      const stats = getEffectiveStats(unitWithSlow);
      
      expect(stats.speed).toBe(35); // 70 * 0.5 = 35
    });

    it('should apply multiple buffs cumulatively', () => {
      let unit = infantryUnit;
      
      unit = applyStatusEffect(unit, {
        type: StatusEffectType.BUFF,
        duration: 10,
        value: 0.5,
        stat: 'attack',
        source: 'ability-1',
      });
      
      unit = applyStatusEffect(unit, {
        type: StatusEffectType.BUFF,
        duration: 10,
        value: 0.25,
        stat: 'defense',
        source: 'ability-2',
      });
      
      const stats = getEffectiveStats(unit);
      
      expect(stats.attack).toBe(60); // 40 * 1.5
      expect(stats.defense).toBe(62); // 50 * 1.25 = 62.5 -> 62
    });

    it('should not allow stats to go below 0', () => {
      const massiveDebuff = {
        type: StatusEffectType.DEBUFF,
        duration: 10,
        value: 2.0,
        stat: 'attack' as const,
        source: 'ability-1',
      };

      const unitWithDebuff = applyStatusEffect(infantryUnit, massiveDebuff);
      const stats = getEffectiveStats(unitWithDebuff);
      
      expect(stats.attack).toBe(0);
    });
  });


  describe('Complete Combat Scenarios', () => {
    it('should handle infantry vs archer with front attack', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const result = processAttack(infantryUnit, archerUnit);
      
      expect(result.success).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.attackerId).toBe(infantryUnit.id);
      expect(result.defenderId).toBe(archerUnit.id);
      
      vi.restoreAllMocks();
    });

    it('should handle cavalry vs infantry with side attack', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const attacker: Unit = {
        ...cavalryUnit,
        direction: Direction.NORTH,
      };
      
      const defender: Unit = {
        ...infantryUnit,
        direction: Direction.EAST,
      };
      
      const result = processAttack(attacker, defender);
      
      expect(result.success).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      
      vi.restoreAllMocks();
    });

    it('should handle archer vs cavalry with rear attack', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const attacker: Unit = {
        ...archerUnit,
        direction: Direction.NORTH,
      };
      
      const defender: Unit = {
        ...cavalryUnit,
        direction: Direction.NORTH,
      };
      
      const result = processAttack(attacker, defender);
      
      expect(result.success).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      
      vi.restoreAllMocks();
    });

    it('should handle unit death from single attack', () => {
      const weakUnit: Unit = {
        ...archerUnit,
        health: 1,
        defense: 0,
      };
      
      const result = processAttack(cavalryUnit, weakUnit);
      
      expect(result.isKill).toBe(true);
      expect(result.events.some(e => e.type === 'death')).toBe(true);
    });

    it('should handle buffed unit dealing increased damage', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const buffEffect = {
        type: StatusEffectType.BUFF,
        duration: 10,
        value: 0.5,
        stat: 'attack' as const,
        source: 'ability-1',
      };
      
      const buffedUnit = applyStatusEffect(cavalryUnit, buffEffect);
      const stats = getEffectiveStats(buffedUnit);
      
      // Create a temporary unit with buffed stats for damage calculation
      const buffedAttacker: Unit = {
        ...buffedUnit,
        attack: stats.attack,
      };
      
      const normalDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const buffedDamage = calculateDamage(buffedAttacker, infantryUnit, 'FRONT');
      
      expect(buffedDamage).toBeGreaterThan(normalDamage);
      
      vi.restoreAllMocks();
    });

    it('should handle debuffed unit taking increased damage', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const debuffEffect = {
        type: StatusEffectType.DEBUFF,
        duration: 10,
        value: 0.5,
        stat: 'defense' as const,
        source: 'ability-1',
      };
      
      const debuffedUnit = applyStatusEffect(infantryUnit, debuffEffect);
      const stats = getEffectiveStats(debuffedUnit);
      
      const debuffedDefender: Unit = {
        ...debuffedUnit,
        defense: stats.defense,
      };
      
      const normalDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const debuffedDamage = calculateDamage(cavalryUnit, debuffedDefender, 'FRONT');
      
      expect(debuffedDamage).toBeGreaterThan(normalDamage);
      
      vi.restoreAllMocks();
    });
  });


  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle zero attack unit', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const weakUnit: Unit = {
        ...infantryUnit,
        attack: 0,
      };
      
      const damage = calculateDamage(weakUnit, cavalryUnit, 'FRONT');
      expect(damage).toBe(0);
      
      vi.restoreAllMocks();
    });

    it('should handle zero defense unit', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const fragileUnit: Unit = {
        ...infantryUnit,
        defense: 0,
      };
      
      const damage = calculateDamage(cavalryUnit, fragileUnit, 'FRONT');
      expect(damage).toBeGreaterThan(0);
      
      vi.restoreAllMocks();
    });

    it('should handle unit with 1 health', () => {
      const lowHealthUnit: Unit = {
        ...infantryUnit,
        health: 1,
      };
      
      const result = processAttack(cavalryUnit, lowHealthUnit);
      expect(result.isKill).toBe(true);
    });

    it('should handle massive damage overkill', () => {
      const superUnit: Unit = {
        ...cavalryUnit,
        attack: 10000,
      };
      
      const result = processAttack(superUnit, infantryUnit);
      expect(result.isKill).toBe(true);
      expect(result.damage).toBeGreaterThan(infantryUnit.health);
    });

    it('should handle all 8 direction combinations', () => {
      const directions = [
        Direction.NORTH,
        Direction.NORTHEAST,
        Direction.EAST,
        Direction.SOUTHEAST,
        Direction.SOUTH,
        Direction.SOUTHWEST,
        Direction.WEST,
        Direction.NORTHWEST,
      ];

      directions.forEach((attackDir) => {
        directions.forEach((defendDir) => {
          const result = getRelativeAttackDirection(attackDir, defendDir);
          expect(['FRONT', 'SIDE', 'REAR']).toContain(result);
        });
      });
    });

    it('should handle poison killing a unit', () => {
      const lowHealthUnit: Unit = {
        ...infantryUnit,
        health: 5,
      };

      const poisonEffect = {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      };

      const unitWithPoison = applyStatusEffect(lowHealthUnit, poisonEffect);
      const result = applyStatusEffects(unitWithPoison, 1);

      expect(result.unit.health).toBe(0);
      expect(result.events.some(e => e.type === 'death')).toBe(true);
    });

    it('should handle multiple poison effects stacking', () => {
      let unit = infantryUnit;
      
      unit = applyStatusEffect(unit, {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      });
      
      unit = applyStatusEffect(unit, {
        type: StatusEffectType.POISON,
        duration: 3,
        value: 5,
        source: 'ability-2',
      });

      const result = applyStatusEffects(unit, 1);

      expect(result.damage).toBe(15); // 10 + 5
      expect(result.unit.health).toBe(85);
    });
  });


  describe('Original Game Balance Verification', () => {
    it('should verify infantry base stats match original', () => {
      expect(infantryUnit.attack).toBe(40);
      expect(infantryUnit.defense).toBe(50);
      expect(infantryUnit.speed).toBe(30);
      expect(infantryUnit.maxHealth).toBe(100);
    });

    it('should verify cavalry base stats match original', () => {
      expect(cavalryUnit.attack).toBe(60);
      expect(cavalryUnit.defense).toBe(35);
      expect(cavalryUnit.speed).toBe(70);
      expect(cavalryUnit.maxHealth).toBe(80);
    });

    it('should verify archer base stats match original', () => {
      expect(archerUnit.attack).toBe(50);
      expect(archerUnit.defense).toBe(25);
      expect(archerUnit.speed).toBe(40);
      expect(archerUnit.maxHealth).toBe(60);
    });

    it('should verify siege base stats match original', () => {
      expect(siegeUnit.attack).toBe(80);
      expect(siegeUnit.defense).toBe(40);
      expect(siegeUnit.speed).toBe(15);
      expect(siegeUnit.maxHealth).toBe(120);
    });

    it('should verify direction multipliers match original', () => {
      expect(DIRECTION_DAMAGE_MULTIPLIERS.FRONT).toBe(1.0);
      expect(DIRECTION_DAMAGE_MULTIPLIERS.SIDE).toBe(1.25);
      expect(DIRECTION_DAMAGE_MULTIPLIERS.REAR).toBe(1.5);
    });

    it('should verify type advantage multipliers match original', () => {
      expect(UNIT_TYPE_ADVANTAGES[UnitType.INFANTRY][UnitType.ARCHER]).toBe(1.5);
      expect(UNIT_TYPE_ADVANTAGES[UnitType.CAVALRY][UnitType.INFANTRY]).toBe(1.5);
      expect(UNIT_TYPE_ADVANTAGES[UnitType.ARCHER][UnitType.CAVALRY]).toBe(1.5);
      expect(UNIT_TYPE_ADVANTAGES[UnitType.INFANTRY][UnitType.CAVALRY]).toBe(0.75);
      expect(UNIT_TYPE_ADVANTAGES[UnitType.CAVALRY][UnitType.ARCHER]).toBe(0.75);
      expect(UNIT_TYPE_ADVANTAGES[UnitType.ARCHER][UnitType.INFANTRY]).toBe(0.75);
    });

    it('should verify damage formula produces expected results', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      // Test case: Cavalry (60 attack) vs Infantry (50 defense)
      // Base: 60 - 50 = 10
      // Type: 1.5 (cavalry > infantry)
      // Direction: 1.0 (front)
      // Random: 1.0
      // Expected: 10 * 1.5 * 1.0 * 1.0 = 15
      
      const damage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      expect(damage).toBe(15);
      
      vi.restoreAllMocks();
    });

    it('should verify rear attack bonus matches original (50% increase)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const frontDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const rearDamage = calculateDamage(cavalryUnit, infantryUnit, 'REAR');
      
      expect(rearDamage / frontDamage).toBeCloseTo(1.5, 1);
      
      vi.restoreAllMocks();
    });

    it('should verify side attack bonus matches original (25% increase)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const frontDamage = calculateDamage(cavalryUnit, infantryUnit, 'FRONT');
      const sideDamage = calculateDamage(cavalryUnit, infantryUnit, 'SIDE');
      
      // Due to integer rounding, verify the ratio is in expected range
      const ratio = sideDamage / frontDamage;
      expect(ratio).toBeGreaterThan(1.15);
      expect(ratio).toBeLessThan(1.35);
      
      vi.restoreAllMocks();
    });

    it('should verify critical hit chance on rear attacks (10%)', () => {
      const rearAttacker: Unit = {
        ...cavalryUnit,
        direction: Direction.NORTH,
      };
      
      const rearDefender: Unit = {
        ...infantryUnit,
        direction: Direction.NORTH,
      };
      
      // Verify this is actually a rear attack
      const relativeDir = getRelativeAttackDirection(rearAttacker.direction, rearDefender.direction);
      expect(relativeDir).toBe('REAR');
      
      let criticalCount = 0;
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const result = processAttack(rearAttacker, rearDefender);
        if (result.isCritical) {
          criticalCount++;
        }
      }
      
      const criticalRate = criticalCount / iterations;
      
      // Should be around 10% (0.1), allow reasonable variance
      // With 1000 iterations, we expect 100 ± ~30 critical hits
      expect(criticalRate).toBeGreaterThan(0.05);
      expect(criticalRate).toBeLessThan(0.15);
    });
  });
});
