/**
 * Building data constants
 * Contains building definitions with costs, build times, and production capabilities
 * Validates Requirements 19.1 (research tree), 19.2 (resource requirements), 19.6 (research options)
 */

/**
 * Building type enumeration
 */
export enum BuildingType {
  BARRACKS = 'barracks',
  ARCHERY_RANGE = 'archery-range',
  STABLE = 'stable',
  SIEGE_WORKSHOP = 'siege-workshop',
  FARM = 'farm',
  GOLD_MINE = 'gold-mine',
  FORTRESS = 'fortress',
  RESEARCH_CENTER = 'research-center',
  WALL = 'wall',
  TOWER = 'tower',
}

/**
 * Building cost interface
 */
export interface BuildingCost {
  food: number;
  gold: number;
}

/**
 * Building production interface
 */
export interface BuildingProduction {
  resourceType: 'food' | 'gold' | 'army';
  amount: number;
  interval: number; // in seconds
}

/**
 * Building data interface
 */
export interface BuildingData {
  type: BuildingType;
  name: string;
  nameVietnamese: string;
  description: string;
  descriptionVietnamese: string;
  cost: BuildingCost;
  buildTime: number; // in seconds
  health: number;
  maxHealth: number;
  production?: BuildingProduction;
  icon: string;
}

/**
 * Barracks - Trains infantry units
 */
export const BARRACKS_DATA: BuildingData = {
  type: BuildingType.BARRACKS,
  name: 'Barracks',
  nameVietnamese: 'Doanh Trại',
  description: 'Trains infantry units for your army',
  descriptionVietnamese: 'Huấn luyện bộ binh cho quân đội',
  cost: {
    food: 200,
    gold: 150,
  },
  buildTime: 30,
  health: 500,
  maxHealth: 500,
  icon: '/images/buildings/barracks.png',
};

/**
 * Archery Range - Trains archer units
 */
export const ARCHERY_RANGE_DATA: BuildingData = {
  type: BuildingType.ARCHERY_RANGE,
  name: 'Archery Range',
  nameVietnamese: 'Trường Bắn',
  description: 'Trains archer units for ranged combat',
  descriptionVietnamese: 'Huấn luyện cung thủ cho chiến đấu tầm xa',
  cost: {
    food: 180,
    gold: 200,
  },
  buildTime: 35,
  health: 450,
  maxHealth: 450,
  icon: '/images/buildings/archery-range.png',
};

/**
 * Stable - Trains cavalry units
 */
export const STABLE_DATA: BuildingData = {
  type: BuildingType.STABLE,
  name: 'Stable',
  nameVietnamese: 'Chuồng Ngựa',
  description: 'Trains cavalry units for mobile warfare',
  descriptionVietnamese: 'Huấn luyện kỵ binh cho chiến tranh cơ động',
  cost: {
    food: 250,
    gold: 300,
  },
  buildTime: 40,
  health: 550,
  maxHealth: 550,
  icon: '/images/buildings/stable.png',
};

/**
 * Siege Workshop - Builds siege engines
 */
export const SIEGE_WORKSHOP_DATA: BuildingData = {
  type: BuildingType.SIEGE_WORKSHOP,
  name: 'Siege Workshop',
  nameVietnamese: 'Xưởng Công Thành',
  description: 'Constructs siege engines for attacking fortifications',
  descriptionVietnamese: 'Chế tạo công thành để tấn công công sự',
  cost: {
    food: 300,
    gold: 400,
  },
  buildTime: 50,
  health: 600,
  maxHealth: 600,
  icon: '/images/buildings/siege-workshop.png',
};

/**
 * Farm - Generates food resources
 */
export const FARM_DATA: BuildingData = {
  type: BuildingType.FARM,
  name: 'Farm',
  nameVietnamese: 'Nông Trại',
  description: 'Produces food for your population',
  descriptionVietnamese: 'Sản xuất lương thực cho dân chúng',
  cost: {
    food: 100,
    gold: 50,
  },
  buildTime: 20,
  health: 300,
  maxHealth: 300,
  production: {
    resourceType: 'food',
    amount: 10,
    interval: 5,
  },
  icon: '/images/buildings/farm.png',
};

/**
 * Gold Mine - Generates gold resources
 */
export const GOLD_MINE_DATA: BuildingData = {
  type: BuildingType.GOLD_MINE,
  name: 'Gold Mine',
  nameVietnamese: 'Mỏ Vàng',
  description: 'Extracts gold for your treasury',
  descriptionVietnamese: 'Khai thác vàng cho kho bạc',
  cost: {
    food: 150,
    gold: 100,
  },
  buildTime: 25,
  health: 400,
  maxHealth: 400,
  production: {
    resourceType: 'gold',
    amount: 8,
    interval: 5,
  },
  icon: '/images/buildings/gold-mine.png',
};

/**
 * Fortress - Main defensive structure
 */
export const FORTRESS_DATA: BuildingData = {
  type: BuildingType.FORTRESS,
  name: 'Fortress',
  nameVietnamese: 'Thành Trì',
  description: 'Main defensive structure, losing it means defeat',
  descriptionVietnamese: 'Công trình phòng thủ chính, mất nó đồng nghĩa thất bại',
  cost: {
    food: 1000,
    gold: 1000,
  },
  buildTime: 120,
  health: 2000,
  maxHealth: 2000,
  icon: '/images/buildings/fortress.png',
};

/**
 * Research Center - Unlocks technology upgrades
 */
export const RESEARCH_CENTER_DATA: BuildingData = {
  type: BuildingType.RESEARCH_CENTER,
  name: 'Research Center',
  nameVietnamese: 'Trung Tâm Nghiên Cứu',
  description: 'Unlocks technology upgrades and improvements',
  descriptionVietnamese: 'Mở khóa nâng cấp công nghệ và cải tiến',
  cost: {
    food: 300,
    gold: 350,
  },
  buildTime: 45,
  health: 500,
  maxHealth: 500,
  icon: '/images/buildings/research-center.png',
};

/**
 * Wall - Defensive structure
 */
export const WALL_DATA: BuildingData = {
  type: BuildingType.WALL,
  name: 'Wall',
  nameVietnamese: 'Tường Thành',
  description: 'Defensive wall to protect your base',
  descriptionVietnamese: 'Tường thành bảo vệ căn cứ',
  cost: {
    food: 80,
    gold: 100,
  },
  buildTime: 15,
  health: 800,
  maxHealth: 800,
  icon: '/images/buildings/wall.png',
};

/**
 * Tower - Defensive tower with attack capability
 */
export const TOWER_DATA: BuildingData = {
  type: BuildingType.TOWER,
  name: 'Tower',
  nameVietnamese: 'Tháp Canh',
  description: 'Defensive tower that attacks nearby enemies',
  descriptionVietnamese: 'Tháp canh tấn công kẻ địch gần đó',
  cost: {
    food: 150,
    gold: 200,
  },
  buildTime: 30,
  health: 600,
  maxHealth: 600,
  icon: '/images/buildings/tower.png',
};

/**
 * All building data by type
 */
export const BUILDING_DATA: Record<BuildingType, BuildingData> = {
  [BuildingType.BARRACKS]: BARRACKS_DATA,
  [BuildingType.ARCHERY_RANGE]: ARCHERY_RANGE_DATA,
  [BuildingType.STABLE]: STABLE_DATA,
  [BuildingType.SIEGE_WORKSHOP]: SIEGE_WORKSHOP_DATA,
  [BuildingType.FARM]: FARM_DATA,
  [BuildingType.GOLD_MINE]: GOLD_MINE_DATA,
  [BuildingType.FORTRESS]: FORTRESS_DATA,
  [BuildingType.RESEARCH_CENTER]: RESEARCH_CENTER_DATA,
  [BuildingType.WALL]: WALL_DATA,
  [BuildingType.TOWER]: TOWER_DATA,
};

/**
 * Get building data by type
 */
export function getBuildingData(type: BuildingType): BuildingData {
  return BUILDING_DATA[type];
}

/**
 * Get all production buildings
 */
export function getProductionBuildings(): BuildingData[] {
  return Object.values(BUILDING_DATA).filter((building) => building.production !== undefined);
}

/**
 * Get all military buildings (unit training)
 */
export function getMilitaryBuildings(): BuildingData[] {
  return [
    BARRACKS_DATA,
    ARCHERY_RANGE_DATA,
    STABLE_DATA,
    SIEGE_WORKSHOP_DATA,
  ];
}

/**
 * Get all defensive buildings
 */
export function getDefensiveBuildings(): BuildingData[] {
  return [
    FORTRESS_DATA,
    WALL_DATA,
    TOWER_DATA,
  ];
}

/**
 * Check if player has sufficient resources to build
 */
export function canAffordBuilding(
  type: BuildingType,
  availableResources: { food: number; gold: number }
): boolean {
  const buildingData = getBuildingData(type);
  return (
    availableResources.food >= buildingData.cost.food &&
    availableResources.gold >= buildingData.cost.gold
  );
}

/**
 * Calculate total building cost for multiple buildings
 */
export function calculateTotalBuildingCost(
  buildings: Array<{ type: BuildingType; count: number }>
): BuildingCost {
  return buildings.reduce(
    (total, { type, count }) => {
      const buildingData = getBuildingData(type);
      return {
        food: total.food + buildingData.cost.food * count,
        gold: total.gold + buildingData.cost.gold * count,
      };
    },
    { food: 0, gold: 0 }
  );
}

/**
 * Get building build time in milliseconds
 */
export function getBuildingBuildTimeMs(type: BuildingType): number {
  return BUILDING_DATA[type].buildTime * 1000;
}
