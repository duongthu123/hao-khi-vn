/**
 * Unit tests for building constants
 */

import { describe, it, expect } from 'vitest';
import {
  BuildingType,
  BUILDING_DATA,
  getBuildingData,
  getProductionBuildings,
  getMilitaryBuildings,
  getDefensiveBuildings,
  canAffordBuilding,
  calculateTotalBuildingCost,
  getBuildingBuildTimeMs,
  BARRACKS_DATA,
  FARM_DATA,
  FORTRESS_DATA,
} from '../buildings';

describe('Building Constants', () => {
  describe('Building Data', () => {
    it('should have data for all building types', () => {
      const buildingTypes = Object.values(BuildingType);
      buildingTypes.forEach((type) => {
        expect(BUILDING_DATA[type]).toBeDefined();
        expect(BUILDING_DATA[type].type).toBe(type);
      });
    });

    it('should have valid costs for all buildings', () => {
      Object.values(BUILDING_DATA).forEach((building) => {
        expect(building.cost.food).toBeGreaterThanOrEqual(0);
        expect(building.cost.gold).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid health values', () => {
      Object.values(BUILDING_DATA).forEach((building) => {
        expect(building.health).toBeGreaterThan(0);
        expect(building.maxHealth).toBeGreaterThan(0);
        expect(building.health).toBe(building.maxHealth);
      });
    });

    it('should have valid build times', () => {
      Object.values(BUILDING_DATA).forEach((building) => {
        expect(building.buildTime).toBeGreaterThan(0);
      });
    });

    it('should have Vietnamese translations', () => {
      Object.values(BUILDING_DATA).forEach((building) => {
        expect(building.nameVietnamese).toBeTruthy();
        expect(building.descriptionVietnamese).toBeTruthy();
      });
    });
  });

  describe('getBuildingData', () => {
    it('should return correct building data', () => {
      const barracks = getBuildingData(BuildingType.BARRACKS);
      expect(barracks).toBe(BARRACKS_DATA);
      expect(barracks.type).toBe(BuildingType.BARRACKS);
    });

    it('should return data for all building types', () => {
      Object.values(BuildingType).forEach((type) => {
        const data = getBuildingData(type);
        expect(data).toBeDefined();
        expect(data.type).toBe(type);
      });
    });
  });

  describe('getProductionBuildings', () => {
    it('should return only buildings with production', () => {
      const productionBuildings = getProductionBuildings();
      expect(productionBuildings.length).toBeGreaterThan(0);
      
      productionBuildings.forEach((building) => {
        expect(building.production).toBeDefined();
        expect(building.production?.resourceType).toBeDefined();
        expect(building.production?.amount).toBeGreaterThan(0);
        expect(building.production?.interval).toBeGreaterThan(0);
      });
    });

    it('should include farm and gold mine', () => {
      const productionBuildings = getProductionBuildings();
      const types = productionBuildings.map((b) => b.type);
      
      expect(types).toContain(BuildingType.FARM);
      expect(types).toContain(BuildingType.GOLD_MINE);
    });
  });

  describe('getMilitaryBuildings', () => {
    it('should return military buildings', () => {
      const militaryBuildings = getMilitaryBuildings();
      expect(militaryBuildings.length).toBe(4);
      
      const types = militaryBuildings.map((b) => b.type);
      expect(types).toContain(BuildingType.BARRACKS);
      expect(types).toContain(BuildingType.ARCHERY_RANGE);
      expect(types).toContain(BuildingType.STABLE);
      expect(types).toContain(BuildingType.SIEGE_WORKSHOP);
    });
  });

  describe('getDefensiveBuildings', () => {
    it('should return defensive buildings', () => {
      const defensiveBuildings = getDefensiveBuildings();
      expect(defensiveBuildings.length).toBe(3);
      
      const types = defensiveBuildings.map((b) => b.type);
      expect(types).toContain(BuildingType.FORTRESS);
      expect(types).toContain(BuildingType.WALL);
      expect(types).toContain(BuildingType.TOWER);
    });

    it('should have high health values', () => {
      const defensiveBuildings = getDefensiveBuildings();
      defensiveBuildings.forEach((building) => {
        expect(building.health).toBeGreaterThanOrEqual(600);
      });
    });
  });

  describe('canAffordBuilding', () => {
    it('should return true when resources are sufficient', () => {
      const resources = { food: 1000, gold: 1000 };
      const canAfford = canAffordBuilding(BuildingType.BARRACKS, resources);
      expect(canAfford).toBe(true);
    });

    it('should return false when food is insufficient', () => {
      const resources = { food: 50, gold: 1000 };
      const canAfford = canAffordBuilding(BuildingType.BARRACKS, resources);
      expect(canAfford).toBe(false);
    });

    it('should return false when gold is insufficient', () => {
      const resources = { food: 1000, gold: 50 };
      const canAfford = canAffordBuilding(BuildingType.BARRACKS, resources);
      expect(canAfford).toBe(false);
    });

    it('should return true when resources exactly match cost', () => {
      const barracks = getBuildingData(BuildingType.BARRACKS);
      const resources = { food: barracks.cost.food, gold: barracks.cost.gold };
      const canAfford = canAffordBuilding(BuildingType.BARRACKS, resources);
      expect(canAfford).toBe(true);
    });
  });

  describe('calculateTotalBuildingCost', () => {
    it('should calculate cost for single building', () => {
      const buildings = [{ type: BuildingType.FARM, count: 1 }];
      const totalCost = calculateTotalBuildingCost(buildings);
      
      expect(totalCost.food).toBe(FARM_DATA.cost.food);
      expect(totalCost.gold).toBe(FARM_DATA.cost.gold);
    });

    it('should calculate cost for multiple buildings of same type', () => {
      const buildings = [{ type: BuildingType.FARM, count: 3 }];
      const totalCost = calculateTotalBuildingCost(buildings);
      
      expect(totalCost.food).toBe(FARM_DATA.cost.food * 3);
      expect(totalCost.gold).toBe(FARM_DATA.cost.gold * 3);
    });

    it('should calculate cost for multiple building types', () => {
      const buildings = [
        { type: BuildingType.FARM, count: 2 },
        { type: BuildingType.BARRACKS, count: 1 },
      ];
      const totalCost = calculateTotalBuildingCost(buildings);
      
      const expectedFood = FARM_DATA.cost.food * 2 + BARRACKS_DATA.cost.food;
      const expectedGold = FARM_DATA.cost.gold * 2 + BARRACKS_DATA.cost.gold;
      
      expect(totalCost.food).toBe(expectedFood);
      expect(totalCost.gold).toBe(expectedGold);
    });

    it('should return zero for empty array', () => {
      const totalCost = calculateTotalBuildingCost([]);
      expect(totalCost.food).toBe(0);
      expect(totalCost.gold).toBe(0);
    });
  });

  describe('getBuildingBuildTimeMs', () => {
    it('should convert seconds to milliseconds', () => {
      const buildTimeMs = getBuildingBuildTimeMs(BuildingType.FARM);
      expect(buildTimeMs).toBe(FARM_DATA.buildTime * 1000);
    });

    it('should return correct time for all buildings', () => {
      Object.values(BuildingType).forEach((type) => {
        const buildTimeMs = getBuildingBuildTimeMs(type);
        const buildingData = getBuildingData(type);
        expect(buildTimeMs).toBe(buildingData.buildTime * 1000);
      });
    });
  });

  describe('Building Balance', () => {
    it('should have fortress as most expensive building', () => {
      const fortressCost = FORTRESS_DATA.cost.food + FORTRESS_DATA.cost.gold;
      
      Object.values(BUILDING_DATA).forEach((building) => {
        if (building.type !== BuildingType.FORTRESS) {
          const buildingCost = building.cost.food + building.cost.gold;
          expect(buildingCost).toBeLessThanOrEqual(fortressCost);
        }
      });
    });

    it('should have fortress with highest health', () => {
      Object.values(BUILDING_DATA).forEach((building) => {
        if (building.type !== BuildingType.FORTRESS) {
          expect(building.health).toBeLessThanOrEqual(FORTRESS_DATA.health);
        }
      });
    });

    it('should have production buildings cheaper than military buildings', () => {
      const productionBuildings = getProductionBuildings();
      const militaryBuildings = getMilitaryBuildings();
      
      const avgProductionCost = productionBuildings.reduce(
        (sum, b) => sum + b.cost.food + b.cost.gold,
        0
      ) / productionBuildings.length;
      
      const avgMilitaryCost = militaryBuildings.reduce(
        (sum, b) => sum + b.cost.food + b.cost.gold,
        0
      ) / militaryBuildings.length;
      
      expect(avgProductionCost).toBeLessThan(avgMilitaryCost);
    });
  });
});
