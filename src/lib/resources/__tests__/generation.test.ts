/**
 * Resource Generation System Tests
 * Tests for time-based generation, building bonuses, and cap enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGenerationRates,
  generateResources,
  calculateGeneratedAmount,
  isAtCap,
  getResourcesAtCap,
  timeUntilCap,
  timeUntilAllCaps,
  formatGenerationRate,
  formatAllGenerationRates,
  getEffectiveGenerationRates,
  calculateBuildingBonus,
  getGenerationBreakdown,
  BuildingCounts,
} from '../generation';
import { Resources, ResourceCaps, ResourceGeneration } from '@/types/resource';
import { BuildingType } from '@/constants/buildings';
import { RESOURCE_CONFIG } from '@/constants/config';

describe('Resource Generation System', () => {
  const baseGeneration: ResourceGeneration = {
    foodPerSecond: 1,
    goldPerSecond: 0.5,
    armyPerSecond: 0,
  };

  const mockResources: Resources = {
    food: 100,
    gold: 50,
    army: 10,
  };

  const mockCaps: ResourceCaps = {
    food: 1000,
    gold: 1000,
    army: 100,
  };

  describe('calculateGenerationRates', () => {
    it('should return base rates with no buildings', () => {
      const result = calculateGenerationRates(baseGeneration, {});
      
      expect(result.foodPerSecond).toBe(1);
      expect(result.goldPerSecond).toBe(0.5);
      expect(result.armyPerSecond).toBe(0);
    });

    it('should apply farm bonus to food generation', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 2,
      };
      
      const result = calculateGenerationRates(baseGeneration, buildings);
      
      // 2 farms * 0.5 bonus = 1.0 multiplier = 100% bonus
      // 1 * (1 + 1.0) = 2.0
      expect(result.foodPerSecond).toBe(2);
    });

    it('should apply mine bonus to gold generation', () => {
      const buildings: BuildingCounts = {
        [BuildingType.GOLD_MINE]: 3,
      };
      
      const result = calculateGenerationRates(baseGeneration, buildings);
      
      // 3 mines * 0.3 bonus = 0.9 multiplier = 90% bonus
      // 0.5 * (1 + 0.9) = 0.95
      expect(result.goldPerSecond).toBe(0.95);
    });

    it('should apply barracks bonus to army generation', () => {
      const buildings: BuildingCounts = {
        [BuildingType.BARRACKS]: 1,
      };
      
      const result = calculateGenerationRates(baseGeneration, buildings);
      
      // 1 barracks * 0.2 bonus = 0.2 multiplier = 20% bonus
      // 0 * (1 + 0.2) = 0 (base is 0)
      expect(result.armyPerSecond).toBe(0);
    });

    it('should apply multiple building bonuses simultaneously', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 2,
        [BuildingType.GOLD_MINE]: 1,
        [BuildingType.BARRACKS]: 1,
      };
      
      const result = calculateGenerationRates(baseGeneration, buildings);
      
      expect(result.foodPerSecond).toBe(2); // 1 * (1 + 2*0.5)
      expect(result.goldPerSecond).toBe(0.65); // 0.5 * (1 + 1*0.3)
      expect(result.armyPerSecond).toBe(0); // 0 * (1 + 1*0.2)
    });

    it('should handle zero buildings', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 0,
        [BuildingType.GOLD_MINE]: 0,
      };
      
      const result = calculateGenerationRates(baseGeneration, buildings);
      
      expect(result).toEqual(baseGeneration);
    });
  });

  describe('generateResources', () => {
    it('should generate resources over time', () => {
      const deltaTime = 10; // 10 seconds
      const result = generateResources(
        mockResources,
        mockCaps,
        baseGeneration,
        deltaTime
      );
      
      expect(result.food).toBe(110); // 100 + 1*10
      expect(result.gold).toBe(55); // 50 + 0.5*10
      expect(result.army).toBe(10); // 10 + 0*10
    });

    it('should enforce resource caps', () => {
      const resources: Resources = {
        food: 995,
        gold: 998,
        army: 99,
      };
      
      const deltaTime = 10;
      const result = generateResources(
        resources,
        mockCaps,
        baseGeneration,
        deltaTime
      );
      
      expect(result.food).toBe(1000); // Capped at 1000
      expect(result.gold).toBe(1000); // Capped at 1000
      expect(result.army).toBe(99); // No generation
    });

    it('should handle fractional time deltas', () => {
      const deltaTime = 0.5; // Half a second
      const result = generateResources(
        mockResources,
        mockCaps,
        baseGeneration,
        deltaTime
      );
      
      expect(result.food).toBe(100.5); // 100 + 1*0.5
      expect(result.gold).toBe(50.25); // 50 + 0.5*0.5
    });

    it('should handle zero delta time', () => {
      const result = generateResources(
        mockResources,
        mockCaps,
        baseGeneration,
        0
      );
      
      expect(result).toEqual(mockResources);
    });

    it('should not generate negative resources', () => {
      const negativeGeneration: ResourceGeneration = {
        foodPerSecond: -1,
        goldPerSecond: -0.5,
        armyPerSecond: 0,
      };
      
      const result = generateResources(
        mockResources,
        mockCaps,
        negativeGeneration,
        10
      );
      
      // Resources should decrease but not go below 0
      expect(result.food).toBe(90);
      expect(result.gold).toBe(45);
    });
  });

  describe('calculateGeneratedAmount', () => {
    it('should calculate total generation over time', () => {
      const result = calculateGeneratedAmount(baseGeneration, 60);
      
      expect(result.food).toBe(60); // 1 * 60
      expect(result.gold).toBe(30); // 0.5 * 60
      expect(result.army).toBe(0); // 0 * 60
    });

    it('should handle fractional time', () => {
      const result = calculateGeneratedAmount(baseGeneration, 1.5);
      
      expect(result.food).toBe(1.5);
      expect(result.gold).toBe(0.75);
      expect(result.army).toBe(0);
    });

    it('should handle zero time', () => {
      const result = calculateGeneratedAmount(baseGeneration, 0);
      
      expect(result.food).toBe(0);
      expect(result.gold).toBe(0);
      expect(result.army).toBe(0);
    });
  });

  describe('isAtCap', () => {
    it('should return true when at cap', () => {
      expect(isAtCap(1000, 1000)).toBe(true);
    });

    it('should return true when above cap', () => {
      expect(isAtCap(1001, 1000)).toBe(true);
    });

    it('should return false when below cap', () => {
      expect(isAtCap(999, 1000)).toBe(false);
    });

    it('should handle zero values', () => {
      expect(isAtCap(0, 0)).toBe(true);
      expect(isAtCap(0, 100)).toBe(false);
    });
  });

  describe('getResourcesAtCap', () => {
    it('should identify resources at cap', () => {
      const resources: Resources = {
        food: 1000,
        gold: 500,
        army: 100,
      };
      
      const result = getResourcesAtCap(resources, mockCaps);
      
      expect(result.food).toBe(true);
      expect(result.gold).toBe(false);
      expect(result.army).toBe(true);
    });

    it('should handle all resources below cap', () => {
      const result = getResourcesAtCap(mockResources, mockCaps);
      
      expect(result.food).toBe(false);
      expect(result.gold).toBe(false);
      expect(result.army).toBe(false);
    });

    it('should handle all resources at cap', () => {
      const resources: Resources = {
        food: 1000,
        gold: 1000,
        army: 100,
      };
      
      const result = getResourcesAtCap(resources, mockCaps);
      
      expect(result.food).toBe(true);
      expect(result.gold).toBe(true);
      expect(result.army).toBe(true);
    });
  });

  describe('timeUntilCap', () => {
    it('should calculate time to reach cap', () => {
      const result = timeUntilCap(100, 1000, 1);
      
      expect(result).toBe(900); // (1000 - 100) / 1
    });

    it('should return Infinity when already at cap', () => {
      const result = timeUntilCap(1000, 1000, 1);
      
      expect(result).toBe(Infinity);
    });

    it('should return Infinity when above cap', () => {
      const result = timeUntilCap(1001, 1000, 1);
      
      expect(result).toBe(Infinity);
    });

    it('should return Infinity when generation rate is zero', () => {
      const result = timeUntilCap(100, 1000, 0);
      
      expect(result).toBe(Infinity);
    });

    it('should return Infinity when generation rate is negative', () => {
      const result = timeUntilCap(100, 1000, -1);
      
      expect(result).toBe(Infinity);
    });

    it('should handle fractional generation rates', () => {
      const result = timeUntilCap(50, 100, 0.5);
      
      expect(result).toBe(100); // (100 - 50) / 0.5
    });
  });

  describe('timeUntilAllCaps', () => {
    it('should calculate time for all resources', () => {
      const result = timeUntilAllCaps(
        mockResources,
        mockCaps,
        baseGeneration
      );
      
      expect(result.food).toBe(900); // (1000 - 100) / 1
      expect(result.gold).toBe(1900); // (1000 - 50) / 0.5
      expect(result.army).toBe(Infinity); // No generation
    });

    it('should handle resources at cap', () => {
      const resources: Resources = {
        food: 1000,
        gold: 1000,
        army: 100,
      };
      
      const result = timeUntilAllCaps(
        resources,
        mockCaps,
        baseGeneration
      );
      
      expect(result.food).toBe(Infinity);
      expect(result.gold).toBe(Infinity);
      expect(result.army).toBe(Infinity);
    });
  });

  describe('formatGenerationRate', () => {
    it('should format positive rates', () => {
      expect(formatGenerationRate(1.5)).toBe('+1.5/s');
      expect(formatGenerationRate(0.5)).toBe('+0.5/s');
    });

    it('should format zero rate', () => {
      expect(formatGenerationRate(0)).toBe('0/s');
    });

    it('should respect precision parameter', () => {
      expect(formatGenerationRate(1.234, 2)).toBe('+1.23/s');
      expect(formatGenerationRate(1.234, 0)).toBe('+1/s');
    });

    it('should handle negative rates', () => {
      expect(formatGenerationRate(-1.5)).toBe('+-1.5/s');
    });
  });

  describe('formatAllGenerationRates', () => {
    it('should format all rates', () => {
      const result = formatAllGenerationRates(baseGeneration);
      
      expect(result.food).toBe('+1.0/s');
      expect(result.gold).toBe('+0.5/s');
      expect(result.army).toBe('0/s');
    });

    it('should respect precision parameter', () => {
      const result = formatAllGenerationRates(baseGeneration, 2);
      
      expect(result.food).toBe('+1.00/s');
      expect(result.gold).toBe('+0.50/s');
      expect(result.army).toBe('0/s');
    });
  });

  describe('getEffectiveGenerationRates', () => {
    it('should return full rates when below cap', () => {
      const result = getEffectiveGenerationRates(
        mockResources,
        mockCaps,
        baseGeneration
      );
      
      expect(result).toEqual(baseGeneration);
    });

    it('should return zero for resources at cap', () => {
      const resources: Resources = {
        food: 1000,
        gold: 500,
        army: 100,
      };
      
      const result = getEffectiveGenerationRates(
        resources,
        mockCaps,
        baseGeneration
      );
      
      expect(result.foodPerSecond).toBe(0);
      expect(result.goldPerSecond).toBe(0.5);
      expect(result.armyPerSecond).toBe(0);
    });

    it('should return zero for all when all at cap', () => {
      const resources: Resources = {
        food: 1000,
        gold: 1000,
        army: 100,
      };
      
      const result = getEffectiveGenerationRates(
        resources,
        mockCaps,
        baseGeneration
      );
      
      expect(result.foodPerSecond).toBe(0);
      expect(result.goldPerSecond).toBe(0);
      expect(result.armyPerSecond).toBe(0);
    });
  });

  describe('calculateBuildingBonus', () => {
    it('should calculate farm bonus', () => {
      const result = calculateBuildingBonus(BuildingType.FARM, 2);
      
      expect(result).toBe(1.0); // 2 * 0.5
    });

    it('should calculate mine bonus', () => {
      const result = calculateBuildingBonus(BuildingType.GOLD_MINE, 3);
      
      expect(result).toBeCloseTo(0.9, 10); // 3 * 0.3
    });

    it('should calculate barracks bonus', () => {
      const result = calculateBuildingBonus(BuildingType.BARRACKS, 1);
      
      expect(result).toBe(0.2); // 1 * 0.2
    });

    it('should return zero for zero buildings', () => {
      const result = calculateBuildingBonus(BuildingType.FARM, 0);
      
      expect(result).toBe(0);
    });

    it('should return zero for non-production buildings', () => {
      const result = calculateBuildingBonus(BuildingType.FORTRESS, 5);
      
      expect(result).toBe(0);
    });
  });

  describe('getGenerationBreakdown', () => {
    it('should provide detailed breakdown with no buildings', () => {
      const result = getGenerationBreakdown(baseGeneration, {});
      
      expect(result.food.base).toBe(1);
      expect(result.food.bonus).toBe(0);
      expect(result.food.total).toBe(1);
      
      expect(result.gold.base).toBe(0.5);
      expect(result.gold.bonus).toBe(0);
      expect(result.gold.total).toBe(0.5);
      
      expect(result.army.base).toBe(0);
      expect(result.army.bonus).toBe(0);
      expect(result.army.total).toBe(0);
    });

    it('should show building bonuses in breakdown', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 2,
        [BuildingType.GOLD_MINE]: 1,
      };
      
      const result = getGenerationBreakdown(baseGeneration, buildings);
      
      // Food: 2 farms * 0.5 = 1.0 bonus multiplier
      expect(result.food.base).toBe(1);
      expect(result.food.bonus).toBe(1); // 1 * 1.0
      expect(result.food.total).toBe(2); // 1 * (1 + 1.0)
      
      // Gold: 1 mine * 0.3 = 0.3 bonus multiplier
      expect(result.gold.base).toBe(0.5);
      expect(result.gold.bonus).toBe(0.15); // 0.5 * 0.3
      expect(result.gold.total).toBe(0.65); // 0.5 * (1 + 0.3)
    });

    it('should handle multiple buildings of same type', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 4,
      };
      
      const result = getGenerationBreakdown(baseGeneration, buildings);
      
      // 4 farms * 0.5 = 2.0 bonus multiplier = 200% bonus
      expect(result.food.base).toBe(1);
      expect(result.food.bonus).toBe(2); // 1 * 2.0
      expect(result.food.total).toBe(3); // 1 * (1 + 2.0)
    });
  });

  describe('Integration tests', () => {
    it('should correctly simulate resource generation over multiple ticks', () => {
      let resources = { ...mockResources };
      const generation = baseGeneration;
      const deltaTime = 1; // 1 second per tick
      
      // Simulate 10 ticks
      for (let i = 0; i < 10; i++) {
        resources = generateResources(resources, mockCaps, generation, deltaTime);
      }
      
      expect(resources.food).toBe(110); // 100 + 10*1
      expect(resources.gold).toBe(55); // 50 + 10*0.5
      expect(resources.army).toBe(10); // No change
    });

    it('should handle building bonuses with generation over time', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 1,
        [BuildingType.GOLD_MINE]: 2,
      };
      
      const modifiedGeneration = calculateGenerationRates(baseGeneration, buildings);
      const result = generateResources(
        mockResources,
        mockCaps,
        modifiedGeneration,
        10
      );
      
      // Food: 1 * (1 + 1*0.5) = 1.5/s * 10s = 15
      expect(result.food).toBe(115);
      
      // Gold: 0.5 * (1 + 2*0.3) = 0.8/s * 10s = 8
      expect(result.gold).toBe(58);
    });

    it('should stop generation when resources reach cap', () => {
      const resources: Resources = {
        food: 990,
        gold: 995,
        army: 95,
      };
      
      const generation: ResourceGeneration = {
        foodPerSecond: 2,
        goldPerSecond: 1,
        armyPerSecond: 1,
      };
      
      const result = generateResources(resources, mockCaps, generation, 10);
      
      // All should be capped
      expect(result.food).toBe(1000);
      expect(result.gold).toBe(1000);
      expect(result.army).toBe(100);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle zero generation rates', () => {
      const zeroGeneration: ResourceGeneration = {
        foodPerSecond: 0,
        goldPerSecond: 0,
        armyPerSecond: 0,
      };
      
      const result = generateResources(mockResources, mockCaps, zeroGeneration, 10);
      
      expect(result).toEqual(mockResources);
    });

    it('should handle very large delta time', () => {
      const result = generateResources(mockResources, mockCaps, baseGeneration, 10000);
      
      // Should be capped
      expect(result.food).toBe(1000);
      expect(result.gold).toBe(1000);
    });

    it('should handle very small delta time', () => {
      const result = generateResources(mockResources, mockCaps, baseGeneration, 0.001);
      
      expect(result.food).toBeCloseTo(100.001, 3);
      expect(result.gold).toBeCloseTo(50.0005, 4);
    });

    it('should handle resources at exactly zero', () => {
      const emptyResources: Resources = {
        food: 0,
        gold: 0,
        army: 0,
      };
      
      const result = generateResources(emptyResources, mockCaps, baseGeneration, 10);
      
      expect(result.food).toBe(10);
      expect(result.gold).toBe(5);
      expect(result.army).toBe(0);
    });

    it('should handle very high building counts', () => {
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 100,
        [BuildingType.GOLD_MINE]: 100,
        [BuildingType.BARRACKS]: 100,
      };
      
      const result = calculateGenerationRates(baseGeneration, buildings);
      
      // 100 farms * 0.5 = 50x multiplier
      expect(result.foodPerSecond).toBe(51); // 1 * (1 + 50)
      // 100 mines * 0.3 = 30x multiplier
      expect(result.goldPerSecond).toBe(15.5); // 0.5 * (1 + 30)
      // 100 barracks * 0.2 = 20x multiplier
      expect(result.armyPerSecond).toBe(0); // 0 * (1 + 20)
    });

    it('should handle negative time until cap when above cap', () => {
      const result = timeUntilCap(1100, 1000, 1);
      
      expect(result).toBe(Infinity);
    });

    it('should handle very slow generation rates', () => {
      const slowGeneration: ResourceGeneration = {
        foodPerSecond: 0.001,
        goldPerSecond: 0.0001,
        armyPerSecond: 0.00001,
      };
      
      const result = generateResources(mockResources, mockCaps, slowGeneration, 1);
      
      expect(result.food).toBeCloseTo(100.001, 3);
      expect(result.gold).toBeCloseTo(50.0001, 4);
      expect(result.army).toBeCloseTo(10.00001, 5);
    });

    it('should handle mixed positive and zero generation rates', () => {
      const mixedGeneration: ResourceGeneration = {
        foodPerSecond: 1,
        goldPerSecond: 0,
        armyPerSecond: 0.5,
      };
      
      const result = generateResources(mockResources, mockCaps, mixedGeneration, 10);
      
      expect(result.food).toBe(110);
      expect(result.gold).toBe(50); // No change
      expect(result.army).toBe(15);
    });

    it('should handle generation breakdown with zero base rates', () => {
      const zeroBaseGeneration: ResourceGeneration = {
        foodPerSecond: 0,
        goldPerSecond: 0,
        armyPerSecond: 0,
      };
      
      const buildings: BuildingCounts = {
        [BuildingType.FARM]: 5,
      };
      
      const result = getGenerationBreakdown(zeroBaseGeneration, buildings);
      
      expect(result.food.base).toBe(0);
      expect(result.food.bonus).toBe(0);
      expect(result.food.total).toBe(0);
    });

    it('should handle effective generation rates with partial caps', () => {
      const resources: Resources = {
        food: 1000, // At cap
        gold: 500,  // Below cap
        army: 50,   // Below cap
      };
      
      const generation: ResourceGeneration = {
        foodPerSecond: 1,
        goldPerSecond: 1,
        armyPerSecond: 1,
      };
      
      const result = getEffectiveGenerationRates(resources, mockCaps, generation);
      
      expect(result.foodPerSecond).toBe(0); // At cap
      expect(result.goldPerSecond).toBe(1); // Below cap
      expect(result.armyPerSecond).toBe(1); // Below cap
    });

    it('should handle time until cap with very fast generation', () => {
      const result = timeUntilCap(0, 1000, 1000);
      
      expect(result).toBe(1); // 1 second to fill
    });

    it('should format very small generation rates', () => {
      const result = formatGenerationRate(0.001, 3);
      
      expect(result).toBe('+0.001/s');
    });

    it('should format very large generation rates', () => {
      const result = formatGenerationRate(9999.99, 2);
      
      expect(result).toBe('+9999.99/s');
    });
  });
});
