/**
 * Hero Ability System Tests
 * Tests for ability resolution, cooldown tracking, cost validation, and AoE targeting
 * 
 * Validates Requirements:
 * - 11.2: Hero abilities
 * - 13.5: Status effect integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveAbility,
  getAbilityCooldown,
  setAbilityCooldown,
  updateAbilityCooldowns,
  clearAbilityCooldowns,
  findUnitsInRadius,
  validateAbilityCast,
} from '../engine';
import { Unit, UnitType, Direction, UnitOwner } from '@/types/unit';
import { Ability } from '@/types/hero';

describe('Hero Ability System', () => {
  let caster: Unit;
  let ally1: Unit;
  let ally2: Unit;
  let enemy1: Unit;
  let enemy2: Unit;
  let allUnits: Unit[];

  beforeEach(() => {
    // Create test units
    caster = {
      id: 'caster-1',
      type: UnitType.INFANTRY,
      faction: 'vietnamese',
      position: { x: 5, y: 5 },
      health: 100,
      maxHealth: 100,
      attack: 50,
      defense: 30,
      speed: 40,
      direction: Direction.NORTH,
      status: [],
      owner: UnitOwner.PLAYER,
    };

    ally1 = {
      id: 'ally-1',
      type: UnitType.INFANTRY,
      faction: 'vietnamese',
      position: { x: 6, y: 5 },
      health: 80,
      maxHealth: 100,
      attack: 40,
      defense: 25,
      speed: 35,
      direction: Direction.NORTH,
      status: [],
      owner: UnitOwner.PLAYER,
    };

    ally2 = {
      id: 'ally-2',
      type: UnitType.ARCHER,
      faction: 'vietnamese',
      position: { x: 7, y: 5 },
      health: 60,
      maxHealth: 80,
      attack: 45,
      defense: 20,
      speed: 50,
      direction: Direction.NORTH,
      status: [],
      owner: UnitOwner.PLAYER,
    };

    enemy1 = {
      id: 'enemy-1',
      type: UnitType.CAVALRY,
      faction: 'mongol',
      position: { x: 5, y: 8 },
      health: 90,
      maxHealth: 100,
      attack: 55,
      defense: 35,
      speed: 60,
      direction: Direction.SOUTH,
      status: [],
      owner: UnitOwner.AI,
    };

    enemy2 = {
      id: 'enemy-2',
      type: UnitType.INFANTRY,
      faction: 'mongol',
      position: { x: 6, y: 8 },
      health: 100,
      maxHealth: 100,
      attack: 50,
      defense: 30,
      speed: 40,
      direction: Direction.SOUTH,
      status: [],
      owner: UnitOwner.AI,
    };

    allUnits = [caster, ally1, ally2, enemy1, enemy2];

    // Clear cooldowns before each test
    clearAbilityCooldowns(caster.id);
  });

  describe('Cooldown Tracking', () => {
    it('should initialize with no cooldowns', () => {
      expect(getAbilityCooldown(caster.id, 'ability-1')).toBe(0);
    });

    it('should set and retrieve cooldowns', () => {
      setAbilityCooldown(caster.id, 'ability-1', 60);
      expect(getAbilityCooldown(caster.id, 'ability-1')).toBe(60);
    });

    it('should update cooldowns over time', () => {
      setAbilityCooldown(caster.id, 'ability-1', 60);
      updateAbilityCooldowns(caster.id, 10);
      expect(getAbilityCooldown(caster.id, 'ability-1')).toBe(50);
    });

    it('should remove cooldowns when they reach zero', () => {
      setAbilityCooldown(caster.id, 'ability-1', 5);
      updateAbilityCooldowns(caster.id, 10);
      expect(getAbilityCooldown(caster.id, 'ability-1')).toBe(0);
    });

    it('should track multiple cooldowns per caster', () => {
      setAbilityCooldown(caster.id, 'ability-1', 60);
      setAbilityCooldown(caster.id, 'ability-2', 45);
      expect(getAbilityCooldown(caster.id, 'ability-1')).toBe(60);
      expect(getAbilityCooldown(caster.id, 'ability-2')).toBe(45);
    });

    it('should clear all cooldowns for a caster', () => {
      setAbilityCooldown(caster.id, 'ability-1', 60);
      setAbilityCooldown(caster.id, 'ability-2', 45);
      clearAbilityCooldowns(caster.id);
      expect(getAbilityCooldown(caster.id, 'ability-1')).toBe(0);
      expect(getAbilityCooldown(caster.id, 'ability-2')).toBe(0);
    });
  });

  describe('Area-of-Effect Targeting', () => {
    it('should find units within radius', () => {
      const targets = findUnitsInRadius({ x: 5, y: 5 }, 2, allUnits);
      expect(targets).toHaveLength(3); // caster, ally1, ally2
      expect(targets.map((u) => u.id)).toContain('caster-1');
      expect(targets.map((u) => u.id)).toContain('ally-1');
      expect(targets.map((u) => u.id)).toContain('ally-2');
    });

    it('should exclude specified unit from results', () => {
      const targets = findUnitsInRadius({ x: 5, y: 5 }, 2, allUnits, 'caster-1');
      expect(targets).toHaveLength(2); // ally1, ally2
      expect(targets.map((u) => u.id)).not.toContain('caster-1');
    });

    it('should find no units when radius is zero', () => {
      const targets = findUnitsInRadius({ x: 5, y: 5 }, 0, allUnits, 'caster-1');
      expect(targets).toHaveLength(0);
    });

    it('should find all units with large radius', () => {
      const targets = findUnitsInRadius({ x: 5, y: 5 }, 10, allUnits);
      expect(targets).toHaveLength(5);
    });

    it('should calculate distance correctly', () => {
      // Enemy1 is at (5, 8), distance from (5, 5) is 3
      const targets = findUnitsInRadius({ x: 5, y: 5 }, 3, allUnits);
      expect(targets.map((u) => u.id)).toContain('enemy-1');
    });
  });

  describe('Ability Cost Validation', () => {
    it('should validate successful cast', () => {
      const result = validateAbilityCast('caster-1', 'ability-1', 50, 60, 100);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject cast when on cooldown', () => {
      setAbilityCooldown('caster-1', 'ability-1', 30);
      const result = validateAbilityCast('caster-1', 'ability-1', 50, 60, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cooldown');
    });

    it('should reject cast with insufficient resources', () => {
      const result = validateAbilityCast('caster-1', 'ability-1', 50, 60, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient resources');
    });

    it('should allow cast with exact resource cost', () => {
      const result = validateAbilityCast('caster-1', 'ability-1', 50, 60, 50);
      expect(result.valid).toBe(true);
    });
  });

  describe('Damage Ability', () => {
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

    it('should apply damage to units in radius', () => {
      const result = resolveAbility(caster, damageAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects).toHaveLength(2); // enemy1 and enemy2
      expect(result.effects.every((e) => e.damage === 100)).toBe(true);
    });

    it('should generate damage events', () => {
      const result = resolveAbility(caster, damageAbility, { x: 5, y: 8 }, allUnits, 100);
      
      const damageEvents = result.events.filter((e) => e.type === 'damage');
      expect(damageEvents).toHaveLength(2);
    });

    it('should generate death events for killed units', () => {
      // Create a low-health enemy
      const weakEnemy: Unit = {
        ...enemy1,
        health: 50,
      };
      const unitsWithWeak = [caster, ally1, ally2, weakEnemy, enemy2];
      
      const result = resolveAbility(caster, damageAbility, { x: 5, y: 8 }, unitsWithWeak, 100);
      
      const deathEvents = result.events.filter((e) => e.type === 'death');
      expect(deathEvents.length).toBeGreaterThan(0);
    });

    it('should set ability on cooldown after use', () => {
      resolveAbility(caster, damageAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(getAbilityCooldown(caster.id, damageAbility.id)).toBe(30);
    });

    it('should not affect caster', () => {
      const result = resolveAbility(caster, damageAbility, { x: 5, y: 5 }, allUnits, 100);
      
      expect(result.effects.every((e) => e.targetId !== caster.id)).toBe(true);
    });
  });

  describe('Heal Ability', () => {
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

    it('should heal allied units in radius', () => {
      const result = resolveAbility(caster, healAbility, { x: 6, y: 5 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.effects.every((e) => e.healing !== undefined)).toBe(true);
    });

    it('should only heal allies, not enemies', () => {
      const result = resolveAbility(caster, healAbility, { x: 5, y: 8 }, allUnits, 100);
      
      const healedIds = result.effects.map((e) => e.targetId);
      expect(healedIds).not.toContain('enemy-1');
      expect(healedIds).not.toContain('enemy-2');
    });

    it('should not overheal units', () => {
      // Ally1 has 80/100 health, healing 30 should give 30
      const result = resolveAbility(caster, healAbility, { x: 6, y: 5 }, allUnits, 100);
      
      const ally1Effect = result.effects.find((e) => e.targetId === 'ally-1');
      expect(ally1Effect?.healing).toBeLessThanOrEqual(30);
    });

    it('should generate heal events', () => {
      const result = resolveAbility(caster, healAbility, { x: 6, y: 5 }, allUnits, 100);
      
      const healEvents = result.events.filter((e) => e.type === 'heal');
      expect(healEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Buff Ability', () => {
    const buffAbility: Ability = {
      id: 'ability-buff',
      name: 'Rally',
      nameVietnamese: 'Tập Hợp',
      description: 'Increases speed of allies',
      descriptionVietnamese: 'Tăng tốc độ đồng minh',
      cooldown: 60,
      cost: 80,
      effect: {
        type: 'buff',
        stat: 'speed',
        value: 20,
        duration: 30,
      },
    };

    it('should apply buff to allied units', () => {
      const result = resolveAbility(caster, buffAbility, { x: 5, y: 5 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.effects.every((e) => e.statusApplied?.includes('buff'))).toBe(true);
    });

    it('should only buff allies, not enemies', () => {
      const result = resolveAbility(caster, buffAbility, { x: 5, y: 5 }, allUnits, 100);
      
      const buffedIds = result.effects.map((e) => e.targetId);
      expect(buffedIds).not.toContain('enemy-1');
      expect(buffedIds).not.toContain('enemy-2');
    });

    it('should generate status applied events', () => {
      const result = resolveAbility(caster, buffAbility, { x: 5, y: 5 }, allUnits, 100);
      
      const statusEvents = result.events.filter((e) => e.type === 'status-applied');
      expect(statusEvents.length).toBeGreaterThan(0);
      expect(statusEvents.every((e) => e.data?.statusType === 'buff')).toBe(true);
    });

    it('should include duration and stat in event data', () => {
      const result = resolveAbility(caster, buffAbility, { x: 5, y: 5 }, allUnits, 100);
      
      const statusEvent = result.events.find((e) => e.type === 'status-applied');
      expect(statusEvent?.data?.duration).toBe(30);
      expect(statusEvent?.data?.stat).toBe('speed');
      expect(statusEvent?.data?.value).toBe(20);
    });
  });

  describe('Debuff Ability', () => {
    const debuffAbility: Ability = {
      id: 'ability-debuff',
      name: 'Weaken',
      nameVietnamese: 'Làm Yếu',
      description: 'Reduces enemy attack',
      descriptionVietnamese: 'Giảm sát thương địch',
      cooldown: 50,
      cost: 70,
      effect: {
        type: 'debuff',
        stat: 'attack',
        value: 30,
        duration: 20,
      },
    };

    it('should apply debuff to enemy units', () => {
      const result = resolveAbility(caster, debuffAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(result.success).toBe(true);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.effects.every((e) => e.statusApplied?.includes('debuff'))).toBe(true);
    });

    it('should only debuff enemies, not allies', () => {
      const result = resolveAbility(caster, debuffAbility, { x: 5, y: 5 }, allUnits, 100);
      
      const debuffedIds = result.effects.map((e) => e.targetId);
      expect(debuffedIds).not.toContain('caster-1');
      expect(debuffedIds).not.toContain('ally-1');
      expect(debuffedIds).not.toContain('ally-2');
    });

    it('should generate status applied events', () => {
      const result = resolveAbility(caster, debuffAbility, { x: 5, y: 8 }, allUnits, 100);
      
      const statusEvents = result.events.filter((e) => e.type === 'status-applied');
      expect(statusEvents.length).toBeGreaterThan(0);
      expect(statusEvents.every((e) => e.data?.statusType === 'debuff')).toBe(true);
    });
  });

  describe('Ability Validation Failures', () => {
    const testAbility: Ability = {
      id: 'ability-test',
      name: 'Test',
      nameVietnamese: 'Thử Nghiệm',
      description: 'Test ability',
      descriptionVietnamese: 'Kỹ năng thử nghiệm',
      cooldown: 30,
      cost: 50,
      effect: {
        type: 'damage',
        value: 100,
        radius: 3,
      },
    };

    it('should fail when on cooldown', () => {
      setAbilityCooldown(caster.id, testAbility.id, 15);
      const result = resolveAbility(caster, testAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(result.success).toBe(false);
      expect(result.effects).toHaveLength(0);
      expect(result.events[0].data?.error).toContain('cooldown');
    });

    it('should fail with insufficient resources', () => {
      const result = resolveAbility(caster, testAbility, { x: 5, y: 8 }, allUnits, 30);
      
      expect(result.success).toBe(false);
      expect(result.effects).toHaveLength(0);
      expect(result.events[0].data?.error).toContain('Insufficient resources');
    });

    it('should not set cooldown on failed cast', () => {
      resolveAbility(caster, testAbility, { x: 5, y: 8 }, allUnits, 30);
      
      expect(getAbilityCooldown(caster.id, testAbility.id)).toBe(0);
    });
  });

  describe('Ability Event Generation', () => {
    const testAbility: Ability = {
      id: 'ability-test',
      name: 'Test',
      nameVietnamese: 'Thử Nghiệm',
      description: 'Test ability',
      descriptionVietnamese: 'Kỹ năng thử nghiệm',
      cooldown: 30,
      cost: 50,
      effect: {
        type: 'damage',
        value: 100,
        radius: 3,
      },
    };

    it('should generate ability used event', () => {
      const result = resolveAbility(caster, testAbility, { x: 5, y: 8 }, allUnits, 100);
      
      const abilityEvent = result.events.find((e) => e.type === 'ability-used');
      expect(abilityEvent).toBeDefined();
      expect(abilityEvent?.sourceId).toBe(caster.id);
      expect(abilityEvent?.data?.abilityId).toBe(testAbility.id);
    });

    it('should include target position in ability event', () => {
      const targetPos = { x: 5, y: 8 };
      const result = resolveAbility(caster, testAbility, targetPos, allUnits, 100);
      
      const abilityEvent = result.events.find((e) => e.type === 'ability-used');
      expect(abilityEvent?.position).toEqual(targetPos);
    });

    it('should include all affected target IDs in result', () => {
      const result = resolveAbility(caster, testAbility, { x: 5, y: 8 }, allUnits, 100);
      
      expect(result.targetIds.length).toBeGreaterThan(0);
      expect(result.targetIds).toContain('enemy-1');
      expect(result.targetIds).toContain('enemy-2');
    });
  });
});
