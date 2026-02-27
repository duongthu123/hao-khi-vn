/**
 * Unit data constants
 * Contains unit type definitions, stats, costs, build times, and combat advantages
 * Validates Requirements 13.1 (direction-based combat) and 13.8 (game balance)
 */

import { UnitType } from '@/types/unit';

/**
 * Unit statistics interface
 */
export interface UnitStats {
  attack: number;
  defense: number;
  speed: number;
  health: number;
  maxHealth: number;
}

/**
 * Unit cost interface
 */
export interface UnitCost {
  food: number;
  gold: number;
  army: number;
}

/**
 * Unit data interface
 */
export interface UnitData {
  type: UnitType;
  name: string;
  nameVietnamese: string;
  description: string;
  descriptionVietnamese: string;
  stats: UnitStats;
  cost: UnitCost;
  buildTime: number; // in seconds
  icon: string;
}

/**
 * Infantry unit data
 * Balanced melee unit with moderate stats
 */
export const INFANTRY_DATA: UnitData = {
  type: UnitType.INFANTRY,
  name: 'Infantry',
  nameVietnamese: 'Bộ Binh',
  description: 'Balanced melee unit, effective against archers',
  descriptionVietnamese: 'Đơn vị cận chiến cân bằng, hiệu quả chống cung thủ',
  stats: {
    attack: 40,
    defense: 50,
    speed: 30,
    health: 100,
    maxHealth: 100,
  },
  cost: {
    food: 50,
    gold: 25,
    army: 1,
  },
  buildTime: 5,
  icon: '/images/units/infantry.png',
};

/**
 * Cavalry unit data
 * Fast mobile unit with high attack, weak against archers
 */
export const CAVALRY_DATA: UnitData = {
  type: UnitType.CAVALRY,
  name: 'Cavalry',
  nameVietnamese: 'Kỵ Binh',
  description: 'Fast mobile unit with high attack, vulnerable to archers',
  descriptionVietnamese: 'Đơn vị cơ động nhanh với sức tấn công cao, yếu trước cung thủ',
  stats: {
    attack: 60,
    defense: 35,
    speed: 70,
    health: 80,
    maxHealth: 80,
  },
  cost: {
    food: 80,
    gold: 60,
    army: 2,
  },
  buildTime: 8,
  icon: '/images/units/cavalry.png',
};

/**
 * Archer unit data
 * Ranged unit effective against cavalry, weak against infantry
 */
export const ARCHER_DATA: UnitData = {
  type: UnitType.ARCHER,
  name: 'Archer',
  nameVietnamese: 'Cung Thủ',
  description: 'Ranged unit effective against cavalry, vulnerable to infantry',
  descriptionVietnamese: 'Đơn vị tầm xa hiệu quả chống kỵ binh, yếu trước bộ binh',
  stats: {
    attack: 50,
    defense: 25,
    speed: 40,
    health: 60,
    maxHealth: 60,
  },
  cost: {
    food: 60,
    gold: 40,
    army: 1,
  },
  buildTime: 6,
  icon: '/images/units/archer.png',
};

/**
 * Siege unit data
 * Heavy unit effective against buildings, slow and vulnerable
 */
export const SIEGE_DATA: UnitData = {
  type: UnitType.SIEGE,
  name: 'Siege Engine',
  nameVietnamese: 'Công Thành',
  description: 'Heavy siege unit effective against buildings, slow and vulnerable',
  descriptionVietnamese: 'Đơn vị công thành nặng hiệu quả phá công trình, chậm và dễ bị tấn công',
  stats: {
    attack: 80,
    defense: 40,
    speed: 15,
    health: 120,
    maxHealth: 120,
  },
  cost: {
    food: 100,
    gold: 120,
    army: 3,
  },
  buildTime: 15,
  icon: '/images/units/siege.png',
};

/**
 * All unit data by type
 */
export const UNIT_DATA: Record<UnitType, UnitData> = {
  [UnitType.INFANTRY]: INFANTRY_DATA,
  [UnitType.CAVALRY]: CAVALRY_DATA,
  [UnitType.ARCHER]: ARCHER_DATA,
  [UnitType.SIEGE]: SIEGE_DATA,
};

/**
 * Unit type advantages matrix
 * Represents combat effectiveness multipliers between unit types
 * 
 * Format: UNIT_TYPE_ADVANTAGES[attacker][defender] = multiplier
 * 
 * Values:
 * - 1.5: Strong advantage (50% bonus damage)
 * - 1.0: Neutral (no bonus or penalty)
 * - 0.75: Disadvantage (25% damage reduction)
 * 
 * Rock-Paper-Scissors balance:
 * - Infantry > Archer (infantry can close distance and overwhelm archers)
 * - Archer > Cavalry (archers can shoot down charging cavalry)
 * - Cavalry > Infantry (cavalry can flank and outmaneuver infantry)
 * - Siege is vulnerable to all unit types but strong against buildings
 */
export const UNIT_TYPE_ADVANTAGES: Record<UnitType, Record<UnitType, number>> = {
  [UnitType.INFANTRY]: {
    [UnitType.INFANTRY]: 1.0,
    [UnitType.CAVALRY]: 0.75,
    [UnitType.ARCHER]: 1.5,
    [UnitType.SIEGE]: 1.5,
  },
  [UnitType.CAVALRY]: {
    [UnitType.INFANTRY]: 1.5,
    [UnitType.CAVALRY]: 1.0,
    [UnitType.ARCHER]: 0.75,
    [UnitType.SIEGE]: 1.5,
  },
  [UnitType.ARCHER]: {
    [UnitType.INFANTRY]: 0.75,
    [UnitType.CAVALRY]: 1.5,
    [UnitType.ARCHER]: 1.0,
    [UnitType.SIEGE]: 1.5,
  },
  [UnitType.SIEGE]: {
    [UnitType.INFANTRY]: 0.75,
    [UnitType.CAVALRY]: 0.75,
    [UnitType.ARCHER]: 0.75,
    [UnitType.SIEGE]: 1.0,
  },
};

/**
 * Direction-based damage multipliers
 * Represents combat effectiveness based on attack direction
 * 
 * Values:
 * - 1.5: Rear attack (50% bonus damage)
 * - 1.25: Side attack (25% bonus damage)
 * - 1.0: Front attack (no bonus)
 */
export const DIRECTION_DAMAGE_MULTIPLIERS = {
  FRONT: 1.0,
  SIDE: 1.25,
  REAR: 1.5,
} as const;

/**
 * Get unit data by type
 */
export function getUnitData(type: UnitType): UnitData {
  return UNIT_DATA[type];
}

/**
 * Get unit type advantage multiplier
 */
export function getTypeAdvantage(attackerType: UnitType, defenderType: UnitType): number {
  return UNIT_TYPE_ADVANTAGES[attackerType][defenderType];
}

/**
 * Calculate total unit cost for multiple units
 */
export function calculateTotalCost(units: Array<{ type: UnitType; count: number }>): UnitCost {
  return units.reduce(
    (total, { type, count }) => {
      const unitData = getUnitData(type);
      return {
        food: total.food + unitData.cost.food * count,
        gold: total.gold + unitData.cost.gold * count,
        army: total.army + unitData.cost.army * count,
      };
    },
    { food: 0, gold: 0, army: 0 }
  );
}

/**
 * Get unit cost by type
 */
export function getUnitCost(type: UnitType): UnitCost {
  return UNIT_DATA[type].cost;
}

/**
 * Check if player has sufficient resources to build unit
 */
export function canAffordUnit(
  type: UnitType,
  availableResources: { food: number; gold: number; army: number }
): boolean {
  const unitData = getUnitData(type);
  return (
    availableResources.food >= unitData.cost.food &&
    availableResources.gold >= unitData.cost.gold &&
    availableResources.army >= unitData.cost.army
  );
}

/**
 * Get all unit types sorted by cost (cheapest first)
 */
export function getUnitTypesByCost(): UnitType[] {
  return Object.values(UnitType).sort((a, b) => {
    const costA = UNIT_DATA[a].cost.gold + UNIT_DATA[a].cost.food;
    const costB = UNIT_DATA[b].cost.gold + UNIT_DATA[b].cost.food;
    return costA - costB;
  });
}

/**
 * Get unit build time in milliseconds
 */
export function getUnitBuildTimeMs(type: UnitType): number {
  return UNIT_DATA[type].buildTime * 1000;
}
