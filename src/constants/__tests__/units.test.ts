/**
 * Unit constants tests
 * Tests unit data, type advantages, and utility functions
 */

import { describe, it, expect } from 'vitest';
import { UnitType } from '@/types/unit';
import {
  INFANTRY_DATA,
  CAVALRY_DATA,
  ARCHER_DATA,
  SIEGE_DATA,
  UNIT_DATA,
  UNIT_TYPE_ADVANTAGES,
  DIRECTION_DAMAGE_MULTIPLIERS,
  getUnitData,
  getTypeAdvantage,
  calculateTotalCost,
  canAffordUnit,
  getUnitTypesByCost,
  getUnitBuildTimeMs,
} from '../units';

describe('Unit Data Constants', () => {
  it('should have complete data for all unit types', () => {
    expect(INFANTRY_DATA).toBeDefined();
    expect(CAVALRY_DATA).toBeDefined();
    expect(ARCHER_DATA).toBeDefined();
    expect(SIEGE_DATA).toBeDefined();
  });

  it('should have all required fields for each unit', () => {
    const units = [INFANTRY_DATA, CAVALRY_DATA, ARCHER_DATA, SIEGE_DATA];
    
    units.forEach(unit => {
      expect(unit.type).toBeDefined();
      expect(unit.name).toBeDefined();
      expect(unit.nameVietnamese).toBeDefined();
      expect(unit.description).toBeDefined();
      expect(unit.descriptionVietnamese).toBeDefined();
      expect(unit.stats).toBeDefined();
      expect(unit.cost).toBeDefined();
      expect(unit.buildTime).toBeGreaterThan(0);
      expect(unit.icon).toBeDefined();
    });
  });

  it('should have valid stats for each unit', () => {
    const units = [INFANTRY_DATA, CAVALRY_DATA, ARCHER_DATA, SIEGE_DATA];
    
    units.forEach(unit => {
      expect(unit.stats.attack).toBeGreaterThan(0);
      expect(unit.stats.defense).toBeGreaterThan(0);
      expect(unit.stats.speed).toBeGreaterThan(0);
      expect(unit.stats.health).toBeGreaterThan(0);
      expect(unit.stats.maxHealth).toBe(unit.stats.health);
    });
  });

  it('should have valid costs for each unit', () => {
    const units = [INFANTRY_DATA, CAVALRY_DATA, ARCHER_DATA, SIEGE_DATA];
    
    units.forEach(unit => {
      expect(unit.cost.food).toBeGreaterThan(0);
      expect(unit.cost.gold).toBeGreaterThan(0);
      expect(unit.cost.army).toBeGreaterThan(0);
    });
  });

  it('should have infantry as balanced unit', () => {
    expect(INFANTRY_DATA.stats.defense).toBeGreaterThan(INFANTRY_DATA.stats.attack);
    expect(INFANTRY_DATA.stats.speed).toBeLessThan(INFANTRY_DATA.stats.attack);
  });

  it('should have cavalry as fast unit', () => {
    expect(CAVALRY_DATA.stats.speed).toBeGreaterThan(INFANTRY_DATA.stats.speed);
    expect(CAVALRY_DATA.stats.speed).toBeGreaterThan(ARCHER_DATA.stats.speed);
    expect(CAVALRY_DATA.stats.speed).toBeGreaterThan(SIEGE_DATA.stats.speed);
  });

  it('should have archer as ranged unit with lower defense', () => {
    expect(ARCHER_DATA.stats.defense).toBeLessThan(INFANTRY_DATA.stats.defense);
    expect(ARCHER_DATA.stats.health).toBeLessThan(INFANTRY_DATA.stats.health);
  });

  it('should have siege as slow heavy unit', () => {
    expect(SIEGE_DATA.stats.speed).toBeLessThan(INFANTRY_DATA.stats.speed);
    expect(SIEGE_DATA.stats.attack).toBeGreaterThan(INFANTRY_DATA.stats.attack);
    expect(SIEGE_DATA.stats.health).toBeGreaterThan(INFANTRY_DATA.stats.health);
  });
});

describe('Unit Type Advantages Matrix', () => {
  it('should have advantages defined for all unit type combinations', () => {
    const unitTypes = Object.values(UnitType);
    
    unitTypes.forEach(attacker => {
      unitTypes.forEach(defender => {
        expect(UNIT_TYPE_ADVANTAGES[attacker][defender]).toBeDefined();
        expect(UNIT_TYPE_ADVANTAGES[attacker][defender]).toBeGreaterThan(0);
      });
    });
  });

  it('should have neutral advantage when same unit types fight', () => {
    expect(UNIT_TYPE_ADVANTAGES[UnitType.INFANTRY][UnitType.INFANTRY]).toBe(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.CAVALRY][UnitType.CAVALRY]).toBe(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.ARCHER][UnitType.ARCHER]).toBe(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.SIEGE][UnitType.SIEGE]).toBe(1.0);
  });

  it('should implement rock-paper-scissors balance', () => {
    // Infantry > Archer
    expect(UNIT_TYPE_ADVANTAGES[UnitType.INFANTRY][UnitType.ARCHER]).toBeGreaterThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.ARCHER][UnitType.INFANTRY]).toBeLessThan(1.0);
    
    // Archer > Cavalry
    expect(UNIT_TYPE_ADVANTAGES[UnitType.ARCHER][UnitType.CAVALRY]).toBeGreaterThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.CAVALRY][UnitType.ARCHER]).toBeLessThan(1.0);
    
    // Cavalry > Infantry
    expect(UNIT_TYPE_ADVANTAGES[UnitType.CAVALRY][UnitType.INFANTRY]).toBeGreaterThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.INFANTRY][UnitType.CAVALRY]).toBeLessThan(1.0);
  });

  it('should have siege vulnerable to all unit types', () => {
    expect(UNIT_TYPE_ADVANTAGES[UnitType.SIEGE][UnitType.INFANTRY]).toBeLessThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.SIEGE][UnitType.CAVALRY]).toBeLessThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.SIEGE][UnitType.ARCHER]).toBeLessThan(1.0);
  });

  it('should have all units strong against siege', () => {
    expect(UNIT_TYPE_ADVANTAGES[UnitType.INFANTRY][UnitType.SIEGE]).toBeGreaterThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.CAVALRY][UnitType.SIEGE]).toBeGreaterThan(1.0);
    expect(UNIT_TYPE_ADVANTAGES[UnitType.ARCHER][UnitType.SIEGE]).toBeGreaterThan(1.0);
  });
});

describe('Direction Damage Multipliers', () => {
  it('should have all direction multipliers defined', () => {
    expect(DIRECTION_DAMAGE_MULTIPLIERS.FRONT).toBeDefined();
    expect(DIRECTION_DAMAGE_MULTIPLIERS.SIDE).toBeDefined();
    expect(DIRECTION_DAMAGE_MULTIPLIERS.REAR).toBeDefined();
  });

  it('should have rear attack as strongest', () => {
    expect(DIRECTION_DAMAGE_MULTIPLIERS.REAR).toBeGreaterThan(DIRECTION_DAMAGE_MULTIPLIERS.SIDE);
    expect(DIRECTION_DAMAGE_MULTIPLIERS.REAR).toBeGreaterThan(DIRECTION_DAMAGE_MULTIPLIERS.FRONT);
  });

  it('should have side attack stronger than front', () => {
    expect(DIRECTION_DAMAGE_MULTIPLIERS.SIDE).toBeGreaterThan(DIRECTION_DAMAGE_MULTIPLIERS.FRONT);
  });

  it('should have front attack as baseline', () => {
    expect(DIRECTION_DAMAGE_MULTIPLIERS.FRONT).toBe(1.0);
  });
});

describe('getUnitData', () => {
  it('should return correct data for each unit type', () => {
    expect(getUnitData(UnitType.INFANTRY)).toEqual(INFANTRY_DATA);
    expect(getUnitData(UnitType.CAVALRY)).toEqual(CAVALRY_DATA);
    expect(getUnitData(UnitType.ARCHER)).toEqual(ARCHER_DATA);
    expect(getUnitData(UnitType.SIEGE)).toEqual(SIEGE_DATA);
  });
});

describe('getTypeAdvantage', () => {
  it('should return correct advantage multiplier', () => {
    expect(getTypeAdvantage(UnitType.INFANTRY, UnitType.ARCHER)).toBe(1.5);
    expect(getTypeAdvantage(UnitType.ARCHER, UnitType.CAVALRY)).toBe(1.5);
    expect(getTypeAdvantage(UnitType.CAVALRY, UnitType.INFANTRY)).toBe(1.5);
  });

  it('should return neutral for same types', () => {
    expect(getTypeAdvantage(UnitType.INFANTRY, UnitType.INFANTRY)).toBe(1.0);
    expect(getTypeAdvantage(UnitType.CAVALRY, UnitType.CAVALRY)).toBe(1.0);
  });

  it('should return disadvantage for reverse matchups', () => {
    expect(getTypeAdvantage(UnitType.ARCHER, UnitType.INFANTRY)).toBe(0.75);
    expect(getTypeAdvantage(UnitType.CAVALRY, UnitType.ARCHER)).toBe(0.75);
    expect(getTypeAdvantage(UnitType.INFANTRY, UnitType.CAVALRY)).toBe(0.75);
  });
});

describe('calculateTotalCost', () => {
  it('should calculate cost for single unit type', () => {
    const cost = calculateTotalCost([{ type: UnitType.INFANTRY, count: 5 }]);
    
    expect(cost.food).toBe(INFANTRY_DATA.cost.food * 5);
    expect(cost.gold).toBe(INFANTRY_DATA.cost.gold * 5);
    expect(cost.army).toBe(INFANTRY_DATA.cost.army * 5);
  });

  it('should calculate cost for multiple unit types', () => {
    const cost = calculateTotalCost([
      { type: UnitType.INFANTRY, count: 3 },
      { type: UnitType.CAVALRY, count: 2 },
    ]);
    
    const expectedFood = INFANTRY_DATA.cost.food * 3 + CAVALRY_DATA.cost.food * 2;
    const expectedGold = INFANTRY_DATA.cost.gold * 3 + CAVALRY_DATA.cost.gold * 2;
    const expectedArmy = INFANTRY_DATA.cost.army * 3 + CAVALRY_DATA.cost.army * 2;
    
    expect(cost.food).toBe(expectedFood);
    expect(cost.gold).toBe(expectedGold);
    expect(cost.army).toBe(expectedArmy);
  });

  it('should return zero cost for empty array', () => {
    const cost = calculateTotalCost([]);
    
    expect(cost.food).toBe(0);
    expect(cost.gold).toBe(0);
    expect(cost.army).toBe(0);
  });
});

describe('canAffordUnit', () => {
  it('should return true when resources are sufficient', () => {
    const resources = { food: 100, gold: 100, army: 5 };
    
    expect(canAffordUnit(UnitType.INFANTRY, resources)).toBe(true);
    expect(canAffordUnit(UnitType.CAVALRY, resources)).toBe(true);
  });

  it('should return false when food is insufficient', () => {
    const resources = { food: 10, gold: 100, army: 5 };
    
    expect(canAffordUnit(UnitType.INFANTRY, resources)).toBe(false);
  });

  it('should return false when gold is insufficient', () => {
    const resources = { food: 100, gold: 10, army: 5 };
    
    expect(canAffordUnit(UnitType.CAVALRY, resources)).toBe(false);
  });

  it('should return false when army is insufficient', () => {
    const resources = { food: 100, gold: 100, army: 0 };
    
    expect(canAffordUnit(UnitType.INFANTRY, resources)).toBe(false);
  });

  it('should return true when resources exactly match cost', () => {
    const resources = {
      food: INFANTRY_DATA.cost.food,
      gold: INFANTRY_DATA.cost.gold,
      army: INFANTRY_DATA.cost.army,
    };
    
    expect(canAffordUnit(UnitType.INFANTRY, resources)).toBe(true);
  });
});

describe('getUnitTypesByCost', () => {
  it('should return all unit types', () => {
    const types = getUnitTypesByCost();
    
    expect(types).toHaveLength(4);
    expect(types).toContain(UnitType.INFANTRY);
    expect(types).toContain(UnitType.CAVALRY);
    expect(types).toContain(UnitType.ARCHER);
    expect(types).toContain(UnitType.SIEGE);
  });

  it('should sort units by total cost (cheapest first)', () => {
    const types = getUnitTypesByCost();
    
    for (let i = 0; i < types.length - 1; i++) {
      const currentCost = UNIT_DATA[types[i]].cost.food + UNIT_DATA[types[i]].cost.gold;
      const nextCost = UNIT_DATA[types[i + 1]].cost.food + UNIT_DATA[types[i + 1]].cost.gold;
      
      expect(currentCost).toBeLessThanOrEqual(nextCost);
    }
  });

  it('should have infantry as cheapest unit', () => {
    const types = getUnitTypesByCost();
    expect(types[0]).toBe(UnitType.INFANTRY);
  });

  it('should have siege as most expensive unit', () => {
    const types = getUnitTypesByCost();
    expect(types[types.length - 1]).toBe(UnitType.SIEGE);
  });
});

describe('getUnitBuildTimeMs', () => {
  it('should return build time in milliseconds', () => {
    expect(getUnitBuildTimeMs(UnitType.INFANTRY)).toBe(INFANTRY_DATA.buildTime * 1000);
    expect(getUnitBuildTimeMs(UnitType.CAVALRY)).toBe(CAVALRY_DATA.buildTime * 1000);
    expect(getUnitBuildTimeMs(UnitType.ARCHER)).toBe(ARCHER_DATA.buildTime * 1000);
    expect(getUnitBuildTimeMs(UnitType.SIEGE)).toBe(SIEGE_DATA.buildTime * 1000);
  });

  it('should return positive values', () => {
    const unitTypes = Object.values(UnitType);
    
    unitTypes.forEach(type => {
      expect(getUnitBuildTimeMs(type)).toBeGreaterThan(0);
    });
  });
});
