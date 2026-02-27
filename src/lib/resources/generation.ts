/**
 * Resource Generation System
 * Handles time-based resource generation with building bonuses and cap enforcement
 * Validates Requirements 14.2 (resource generation), 14.5 (resource caps)
 */

import { Resources, ResourceCaps, ResourceGeneration } from '@/types/resource';
import { BuildingType } from '@/constants/buildings';
import { RESOURCE_CONFIG } from '@/constants/config';

/**
 * Building count interface for generation bonuses
 */
export interface BuildingCounts {
  [BuildingType.FARM]?: number;
  [BuildingType.GOLD_MINE]?: number;
  [BuildingType.BARRACKS]?: number;
  [key: string]: number | undefined;
}

/**
 * Calculate resource generation rates based on base rates and building bonuses
 * 
 * @param baseGeneration - Base generation rates per second
 * @param buildings - Count of each building type
 * @returns Modified generation rates with building bonuses applied
 */
export function calculateGenerationRates(
  baseGeneration: ResourceGeneration,
  buildings: BuildingCounts = {}
): ResourceGeneration {
  const farmCount = buildings[BuildingType.FARM] || 0;
  const mineCount = buildings[BuildingType.GOLD_MINE] || 0;
  const barracksCount = buildings[BuildingType.BARRACKS] || 0;
  
  // Apply building bonuses from config
  const farmBonus = farmCount * RESOURCE_CONFIG.buildingBonus.farm;
  const mineBonus = mineCount * RESOURCE_CONFIG.buildingBonus.mine;
  const barracksBonus = barracksCount * RESOURCE_CONFIG.buildingBonus.barracks;
  
  return {
    foodPerSecond: baseGeneration.foodPerSecond * (1 + farmBonus),
    goldPerSecond: baseGeneration.goldPerSecond * (1 + mineBonus),
    armyPerSecond: baseGeneration.armyPerSecond * (1 + barracksBonus),
  };
}

/**
 * Generate resources based on elapsed time
 * 
 * @param current - Current resource amounts
 * @param caps - Resource caps
 * @param generation - Generation rates per second
 * @param deltaTime - Time elapsed in seconds
 * @returns New resource amounts with caps enforced
 */
export function generateResources(
  current: Resources,
  caps: ResourceCaps,
  generation: ResourceGeneration,
  deltaTime: number
): Resources {
  // Calculate raw generation amounts
  const foodGenerated = generation.foodPerSecond * deltaTime;
  const goldGenerated = generation.goldPerSecond * deltaTime;
  const armyGenerated = generation.armyPerSecond * deltaTime;
  
  // Apply generation with cap enforcement
  return {
    food: Math.min(current.food + foodGenerated, caps.food),
    gold: Math.min(current.gold + goldGenerated, caps.gold),
    army: Math.min(current.army + armyGenerated, caps.army),
  };
}

/**
 * Calculate resources generated over a time period
 * Useful for displaying generation rates or calculating offline gains
 * 
 * @param generation - Generation rates per second
 * @param timeInSeconds - Time period in seconds
 * @returns Total resources that would be generated (without caps)
 */
export function calculateGeneratedAmount(
  generation: ResourceGeneration,
  timeInSeconds: number
): Resources {
  return {
    food: generation.foodPerSecond * timeInSeconds,
    gold: generation.goldPerSecond * timeInSeconds,
    army: generation.armyPerSecond * timeInSeconds,
  };
}

/**
 * Check if a resource is at its cap
 * 
 * @param current - Current resource amount
 * @param cap - Resource cap
 * @returns True if resource is at or above cap
 */
export function isAtCap(current: number, cap: number): boolean {
  return current >= cap;
}

/**
 * Check which resources are at their caps
 * 
 * @param current - Current resource amounts
 * @param caps - Resource caps
 * @returns Object indicating which resources are at cap
 */
export function getResourcesAtCap(
  current: Resources,
  caps: ResourceCaps
): { food: boolean; gold: boolean; army: boolean } {
  return {
    food: isAtCap(current.food, caps.food),
    gold: isAtCap(current.gold, caps.gold),
    army: isAtCap(current.army, caps.army),
  };
}

/**
 * Calculate time until a resource reaches its cap
 * 
 * @param current - Current resource amount
 * @param cap - Resource cap
 * @param generationRate - Generation rate per second
 * @returns Time in seconds until cap is reached, or Infinity if already at cap or no generation
 */
export function timeUntilCap(
  current: number,
  cap: number,
  generationRate: number
): number {
  if (current >= cap || generationRate <= 0) {
    return Infinity;
  }
  
  return (cap - current) / generationRate;
}

/**
 * Calculate time until all resources reach their caps
 * 
 * @param current - Current resource amounts
 * @param caps - Resource caps
 * @param generation - Generation rates per second
 * @returns Time in seconds for each resource to reach cap
 */
export function timeUntilAllCaps(
  current: Resources,
  caps: ResourceCaps,
  generation: ResourceGeneration
): { food: number; gold: number; army: number } {
  return {
    food: timeUntilCap(current.food, caps.food, generation.foodPerSecond),
    gold: timeUntilCap(current.gold, caps.gold, generation.goldPerSecond),
    army: timeUntilCap(current.army, caps.army, generation.armyPerSecond),
  };
}

/**
 * Format generation rate for display
 * 
 * @param rate - Generation rate per second
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted string with rate per second
 */
export function formatGenerationRate(rate: number, precision: number = 1): string {
  if (rate === 0) {
    return '0/s';
  }
  
  return `+${rate.toFixed(precision)}/s`;
}

/**
 * Format all generation rates for display
 * 
 * @param generation - Generation rates per second
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted object with all rates
 */
export function formatAllGenerationRates(
  generation: ResourceGeneration,
  precision: number = 1
): { food: string; gold: string; army: string } {
  return {
    food: formatGenerationRate(generation.foodPerSecond, precision),
    gold: formatGenerationRate(generation.goldPerSecond, precision),
    army: formatGenerationRate(generation.armyPerSecond, precision),
  };
}

/**
 * Calculate the effective generation rate considering caps
 * If a resource is at cap, effective rate is 0
 * 
 * @param current - Current resource amounts
 * @param caps - Resource caps
 * @param generation - Generation rates per second
 * @returns Effective generation rates (0 if at cap)
 */
export function getEffectiveGenerationRates(
  current: Resources,
  caps: ResourceCaps,
  generation: ResourceGeneration
): ResourceGeneration {
  return {
    foodPerSecond: isAtCap(current.food, caps.food) ? 0 : generation.foodPerSecond,
    goldPerSecond: isAtCap(current.gold, caps.gold) ? 0 : generation.goldPerSecond,
    armyPerSecond: isAtCap(current.army, caps.army) ? 0 : generation.armyPerSecond,
  };
}

/**
 * Calculate building bonus contribution to generation
 * 
 * @param buildingType - Type of building
 * @param count - Number of buildings
 * @returns Bonus multiplier (e.g., 0.5 = +50%)
 */
export function calculateBuildingBonus(
  buildingType: BuildingType,
  count: number
): number {
  // Map building types to config keys
  const bonusMap: Record<string, keyof typeof RESOURCE_CONFIG.buildingBonus> = {
    [BuildingType.FARM]: 'farm',
    [BuildingType.GOLD_MINE]: 'mine',
    [BuildingType.BARRACKS]: 'barracks',
  };
  
  const configKey = bonusMap[buildingType];
  const bonusPerBuilding = configKey ? RESOURCE_CONFIG.buildingBonus[configKey] : 0;
  return count * bonusPerBuilding;
}

/**
 * Get detailed generation breakdown showing base and bonus rates
 * 
 * @param baseGeneration - Base generation rates
 * @param buildings - Building counts
 * @returns Detailed breakdown of generation sources
 */
export function getGenerationBreakdown(
  baseGeneration: ResourceGeneration,
  buildings: BuildingCounts = {}
): {
  food: { base: number; bonus: number; total: number };
  gold: { base: number; bonus: number; total: number };
  army: { base: number; bonus: number; total: number };
} {
  const farmCount = buildings[BuildingType.FARM] || 0;
  const mineCount = buildings[BuildingType.GOLD_MINE] || 0;
  const barracksCount = buildings[BuildingType.BARRACKS] || 0;
  
  const farmBonus = calculateBuildingBonus(BuildingType.FARM, farmCount);
  const mineBonus = calculateBuildingBonus(BuildingType.GOLD_MINE, mineCount);
  const barracksBonus = calculateBuildingBonus(BuildingType.BARRACKS, barracksCount);
  
  return {
    food: {
      base: baseGeneration.foodPerSecond,
      bonus: baseGeneration.foodPerSecond * farmBonus,
      total: baseGeneration.foodPerSecond * (1 + farmBonus),
    },
    gold: {
      base: baseGeneration.goldPerSecond,
      bonus: baseGeneration.goldPerSecond * mineBonus,
      total: baseGeneration.goldPerSecond * (1 + mineBonus),
    },
    army: {
      base: baseGeneration.armyPerSecond,
      bonus: baseGeneration.armyPerSecond * barracksBonus,
      total: baseGeneration.armyPerSecond * (1 + barracksBonus),
    },
  };
}
