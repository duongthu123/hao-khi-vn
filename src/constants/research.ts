/**
 * Research tree data constants
 * Contains research nodes with prerequisites, costs, durations, and effects
 * Validates Requirements 19.1 (research tree), 19.2 (resource requirements), 19.6 (research options)
 */

/**
 * Research effect types
 */
export type ResearchEffectType =
  | 'unit-stat'
  | 'resource-generation'
  | 'unlock-unit'
  | 'unlock-ability'
  | 'building-stat'
  | 'cost-reduction';

/**
 * Research effect interface
 */
export interface ResearchEffect {
  type: ResearchEffectType;
  target?: string; // unit type, building type, or ability id
  stat?: string; // attack, defense, speed, etc.
  value: number; // percentage or absolute value
  description: string;
  descriptionVietnamese: string;
}

/**
 * Research cost interface
 */
export interface ResearchCost {
  food: number;
  gold: number;
}

/**
 * Research node interface
 */
export interface ResearchNode {
  id: string;
  name: string;
  nameVietnamese: string;
  description: string;
  descriptionVietnamese: string;
  cost: ResearchCost;
  duration: number; // in seconds
  prerequisites: string[]; // research IDs that must be completed first
  effects: ResearchEffect[];
  icon: string;
  tier: number; // 1, 2, or 3 (difficulty/advancement level)
}

/**
 * Tier 1 Research - Basic improvements
 */

export const IMPROVED_FARMING: ResearchNode = {
  id: 'research-improved-farming',
  name: 'Improved Farming',
  nameVietnamese: 'Cải Tiến Nông Nghiệp',
  description: 'Increases food production by 25%',
  descriptionVietnamese: 'Tăng sản xuất lương thực 25%',
  cost: {
    food: 200,
    gold: 150,
  },
  duration: 30,
  prerequisites: [],
  effects: [
    {
      type: 'resource-generation',
      target: 'food',
      value: 25,
      description: '+25% food production',
      descriptionVietnamese: '+25% sản xuất lương thực',
    },
  ],
  icon: '/images/research/farming.png',
  tier: 1,
};

export const MINING_TECHNIQUES: ResearchNode = {
  id: 'research-mining-techniques',
  name: 'Mining Techniques',
  nameVietnamese: 'Kỹ Thuật Khai Mỏ',
  description: 'Increases gold production by 25%',
  descriptionVietnamese: 'Tăng khai thác vàng 25%',
  cost: {
    food: 150,
    gold: 200,
  },
  duration: 30,
  prerequisites: [],
  effects: [
    {
      type: 'resource-generation',
      target: 'gold',
      value: 25,
      description: '+25% gold production',
      descriptionVietnamese: '+25% khai thác vàng',
    },
  ],
  icon: '/images/research/mining.png',
  tier: 1,
};

export const BASIC_TRAINING: ResearchNode = {
  id: 'research-basic-training',
  name: 'Basic Training',
  nameVietnamese: 'Huấn Luyện Cơ Bản',
  description: 'Increases infantry attack by 10%',
  descriptionVietnamese: 'Tăng sức tấn công bộ binh 10%',
  cost: {
    food: 250,
    gold: 200,
  },
  duration: 40,
  prerequisites: [],
  effects: [
    {
      type: 'unit-stat',
      target: 'infantry',
      stat: 'attack',
      value: 10,
      description: '+10% infantry attack',
      descriptionVietnamese: '+10% tấn công bộ binh',
    },
  ],
  icon: '/images/research/training.png',
  tier: 1,
};

export const ARCHERY_MASTERY: ResearchNode = {
  id: 'research-archery-mastery',
  name: 'Archery Mastery',
  nameVietnamese: 'Tinh Thông Cung Thuật',
  description: 'Increases archer attack by 15%',
  descriptionVietnamese: 'Tăng sức tấn công cung thủ 15%',
  cost: {
    food: 300,
    gold: 250,
  },
  duration: 45,
  prerequisites: [],
  effects: [
    {
      type: 'unit-stat',
      target: 'archer',
      stat: 'attack',
      value: 15,
      description: '+15% archer attack',
      descriptionVietnamese: '+15% tấn công cung thủ',
    },
  ],
  icon: '/images/research/archery.png',
  tier: 1,
};

export const HORSE_BREEDING: ResearchNode = {
  id: 'research-horse-breeding',
  name: 'Horse Breeding',
  nameVietnamese: 'Thuần Hóa Ngựa',
  description: 'Increases cavalry speed by 20%',
  descriptionVietnamese: 'Tăng tốc độ kỵ binh 20%',
  cost: {
    food: 350,
    gold: 300,
  },
  duration: 50,
  prerequisites: [],
  effects: [
    {
      type: 'unit-stat',
      target: 'cavalry',
      stat: 'speed',
      value: 20,
      description: '+20% cavalry speed',
      descriptionVietnamese: '+20% tốc độ kỵ binh',
    },
  ],
  icon: '/images/research/horses.png',
  tier: 1,
};

/**
 * Tier 2 Research - Advanced improvements
 */

export const ADVANCED_FARMING: ResearchNode = {
  id: 'research-advanced-farming',
  name: 'Advanced Farming',
  nameVietnamese: 'Nông Nghiệp Tiên Tiến',
  description: 'Further increases food production by 35%',
  descriptionVietnamese: 'Tăng thêm sản xuất lương thực 35%',
  cost: {
    food: 400,
    gold: 300,
  },
  duration: 60,
  prerequisites: ['research-improved-farming'],
  effects: [
    {
      type: 'resource-generation',
      target: 'food',
      value: 35,
      description: '+35% food production',
      descriptionVietnamese: '+35% sản xuất lương thực',
    },
  ],
  icon: '/images/research/farming-advanced.png',
  tier: 2,
};

export const GOLD_REFINING: ResearchNode = {
  id: 'research-gold-refining',
  name: 'Gold Refining',
  nameVietnamese: 'Tinh Luyện Vàng',
  description: 'Further increases gold production by 35%',
  descriptionVietnamese: 'Tăng thêm khai thác vàng 35%',
  cost: {
    food: 300,
    gold: 400,
  },
  duration: 60,
  prerequisites: ['research-mining-techniques'],
  effects: [
    {
      type: 'resource-generation',
      target: 'gold',
      value: 35,
      description: '+35% gold production',
      descriptionVietnamese: '+35% khai thác vàng',
    },
  ],
  icon: '/images/research/refining.png',
  tier: 2,
};

export const IRON_WEAPONS: ResearchNode = {
  id: 'research-iron-weapons',
  name: 'Iron Weapons',
  nameVietnamese: 'Vũ Khí Sắt',
  description: 'Increases all unit attack by 15%',
  descriptionVietnamese: 'Tăng sức tấn công mọi đơn vị 15%',
  cost: {
    food: 500,
    gold: 450,
  },
  duration: 70,
  prerequisites: ['research-basic-training'],
  effects: [
    {
      type: 'unit-stat',
      target: 'all',
      stat: 'attack',
      value: 15,
      description: '+15% attack for all units',
      descriptionVietnamese: '+15% tấn công cho mọi đơn vị',
    },
  ],
  icon: '/images/research/iron-weapons.png',
  tier: 2,
};

export const STEEL_ARMOR: ResearchNode = {
  id: 'research-steel-armor',
  name: 'Steel Armor',
  nameVietnamese: 'Giáp Thép',
  description: 'Increases all unit defense by 20%',
  descriptionVietnamese: 'Tăng phòng thủ mọi đơn vị 20%',
  cost: {
    food: 450,
    gold: 500,
  },
  duration: 70,
  prerequisites: ['research-basic-training'],
  effects: [
    {
      type: 'unit-stat',
      target: 'all',
      stat: 'defense',
      value: 20,
      description: '+20% defense for all units',
      descriptionVietnamese: '+20% phòng thủ cho mọi đơn vị',
    },
  ],
  icon: '/images/research/steel-armor.png',
  tier: 2,
};

export const SIEGE_ENGINEERING: ResearchNode = {
  id: 'research-siege-engineering',
  name: 'Siege Engineering',
  nameVietnamese: 'Kỹ Thuật Công Thành',
  description: 'Increases siege unit attack by 30%',
  descriptionVietnamese: 'Tăng sức tấn công công thành 30%',
  cost: {
    food: 600,
    gold: 550,
  },
  duration: 80,
  prerequisites: [],
  effects: [
    {
      type: 'unit-stat',
      target: 'siege',
      stat: 'attack',
      value: 30,
      description: '+30% siege attack',
      descriptionVietnamese: '+30% tấn công công thành',
    },
  ],
  icon: '/images/research/siege.png',
  tier: 2,
};

export const FORTIFICATION: ResearchNode = {
  id: 'research-fortification',
  name: 'Fortification',
  nameVietnamese: 'Công Sự Phòng Thủ',
  description: 'Increases building health by 25%',
  descriptionVietnamese: 'Tăng máu công trình 25%',
  cost: {
    food: 400,
    gold: 450,
  },
  duration: 65,
  prerequisites: [],
  effects: [
    {
      type: 'building-stat',
      target: 'all',
      stat: 'health',
      value: 25,
      description: '+25% building health',
      descriptionVietnamese: '+25% máu công trình',
    },
  ],
  icon: '/images/research/fortification.png',
  tier: 2,
};

/**
 * Tier 3 Research - Elite improvements
 */

export const MASTER_FARMING: ResearchNode = {
  id: 'research-master-farming',
  name: 'Master Farming',
  nameVietnamese: 'Nông Nghiệp Bậc Thầy',
  description: 'Maximizes food production with +50% bonus',
  descriptionVietnamese: 'Tối đa hóa sản xuất lương thực với +50%',
  cost: {
    food: 800,
    gold: 600,
  },
  duration: 100,
  prerequisites: ['research-advanced-farming'],
  effects: [
    {
      type: 'resource-generation',
      target: 'food',
      value: 50,
      description: '+50% food production',
      descriptionVietnamese: '+50% sản xuất lương thực',
    },
  ],
  icon: '/images/research/farming-master.png',
  tier: 3,
};

export const MASTER_MINING: ResearchNode = {
  id: 'research-master-mining',
  name: 'Master Mining',
  nameVietnamese: 'Khai Mỏ Bậc Thầy',
  description: 'Maximizes gold production with +50% bonus',
  descriptionVietnamese: 'Tối đa hóa khai thác vàng với +50%',
  cost: {
    food: 600,
    gold: 800,
  },
  duration: 100,
  prerequisites: ['research-gold-refining'],
  effects: [
    {
      type: 'resource-generation',
      target: 'gold',
      value: 50,
      description: '+50% gold production',
      descriptionVietnamese: '+50% khai thác vàng',
    },
  ],
  icon: '/images/research/mining-master.png',
  tier: 3,
};

export const LEGENDARY_WEAPONS: ResearchNode = {
  id: 'research-legendary-weapons',
  name: 'Legendary Weapons',
  nameVietnamese: 'Vũ Khí Huyền Thoại',
  description: 'Grants all units +30% attack power',
  descriptionVietnamese: 'Tăng sức tấn công mọi đơn vị +30%',
  cost: {
    food: 1000,
    gold: 900,
  },
  duration: 120,
  prerequisites: ['research-iron-weapons'],
  effects: [
    {
      type: 'unit-stat',
      target: 'all',
      stat: 'attack',
      value: 30,
      description: '+30% attack for all units',
      descriptionVietnamese: '+30% tấn công cho mọi đơn vị',
    },
  ],
  icon: '/images/research/legendary-weapons.png',
  tier: 3,
};

export const LEGENDARY_ARMOR: ResearchNode = {
  id: 'research-legendary-armor',
  name: 'Legendary Armor',
  nameVietnamese: 'Giáp Huyền Thoại',
  description: 'Grants all units +35% defense',
  descriptionVietnamese: 'Tăng phòng thủ mọi đơn vị +35%',
  cost: {
    food: 900,
    gold: 1000,
  },
  duration: 120,
  prerequisites: ['research-steel-armor'],
  effects: [
    {
      type: 'unit-stat',
      target: 'all',
      stat: 'defense',
      value: 35,
      description: '+35% defense for all units',
      descriptionVietnamese: '+35% phòng thủ cho mọi đơn vị',
    },
  ],
  icon: '/images/research/legendary-armor.png',
  tier: 3,
};

export const ELITE_TRAINING: ResearchNode = {
  id: 'research-elite-training',
  name: 'Elite Training',
  nameVietnamese: 'Huấn Luyện Tinh Nhuệ',
  description: 'Reduces unit training time by 30%',
  descriptionVietnamese: 'Giảm thời gian huấn luyện 30%',
  cost: {
    food: 700,
    gold: 700,
  },
  duration: 90,
  prerequisites: ['research-basic-training'],
  effects: [
    {
      type: 'cost-reduction',
      target: 'unit-training-time',
      value: 30,
      description: '-30% unit training time',
      descriptionVietnamese: '-30% thời gian huấn luyện',
    },
  ],
  icon: '/images/research/elite-training.png',
  tier: 3,
};

export const RAPID_CONSTRUCTION: ResearchNode = {
  id: 'research-rapid-construction',
  name: 'Rapid Construction',
  nameVietnamese: 'Xây Dựng Nhanh',
  description: 'Reduces building construction time by 25%',
  descriptionVietnamese: 'Giảm thời gian xây dựng 25%',
  cost: {
    food: 650,
    gold: 650,
  },
  duration: 85,
  prerequisites: ['research-fortification'],
  effects: [
    {
      type: 'cost-reduction',
      target: 'building-time',
      value: 25,
      description: '-25% building construction time',
      descriptionVietnamese: '-25% thời gian xây dựng',
    },
  ],
  icon: '/images/research/construction.png',
  tier: 3,
};

export const BACH_DANG_TACTICS: ResearchNode = {
  id: 'research-bach-dang-tactics',
  name: 'Bach Dang Tactics',
  nameVietnamese: 'Chiến Thuật Bạch Đằng',
  description: 'Unlocks special ability: Wooden Stakes Trap',
  descriptionVietnamese: 'Mở khóa kỹ năng đặc biệt: Bẫy Cọc Ngầm',
  cost: {
    food: 1200,
    gold: 1200,
  },
  duration: 150,
  prerequisites: ['research-fortification', 'research-siege-engineering'],
  effects: [
    {
      type: 'unlock-ability',
      target: 'ability-wooden-stakes',
      value: 1,
      description: 'Unlocks Wooden Stakes Trap ability',
      descriptionVietnamese: 'Mở khóa kỹ năng Bẫy Cọc Ngầm',
    },
  ],
  icon: '/images/research/bach-dang.png',
  tier: 3,
};

/**
 * All research nodes
 */
export const ALL_RESEARCH: ResearchNode[] = [
  // Tier 1
  IMPROVED_FARMING,
  MINING_TECHNIQUES,
  BASIC_TRAINING,
  ARCHERY_MASTERY,
  HORSE_BREEDING,
  // Tier 2
  ADVANCED_FARMING,
  GOLD_REFINING,
  IRON_WEAPONS,
  STEEL_ARMOR,
  SIEGE_ENGINEERING,
  FORTIFICATION,
  // Tier 3
  MASTER_FARMING,
  MASTER_MINING,
  LEGENDARY_WEAPONS,
  LEGENDARY_ARMOR,
  ELITE_TRAINING,
  RAPID_CONSTRUCTION,
  BACH_DANG_TACTICS,
];

/**
 * Research lookup by ID
 */
export const RESEARCH_BY_ID: Record<string, ResearchNode> = ALL_RESEARCH.reduce(
  (acc, research) => {
    acc[research.id] = research;
    return acc;
  },
  {} as Record<string, ResearchNode>
);

/**
 * Research by tier
 */
export const RESEARCH_BY_TIER: Record<number, ResearchNode[]> = {
  1: ALL_RESEARCH.filter((r) => r.tier === 1),
  2: ALL_RESEARCH.filter((r) => r.tier === 2),
  3: ALL_RESEARCH.filter((r) => r.tier === 3),
};

/**
 * Get research node by ID
 */
export function getResearchById(id: string): ResearchNode | undefined {
  return RESEARCH_BY_ID[id];
}

/**
 * Get research nodes by tier
 */
export function getResearchByTier(tier: number): ResearchNode[] {
  return RESEARCH_BY_TIER[tier] || [];
}

/**
 * Check if research prerequisites are met
 */
export function arePrerequisitesMet(
  researchId: string,
  completedResearch: string[]
): boolean {
  const research = getResearchById(researchId);
  if (!research) return false;

  return research.prerequisites.every((prereqId) =>
    completedResearch.includes(prereqId)
  );
}

/**
 * Get available research (prerequisites met, not yet completed)
 */
export function getAvailableResearch(completedResearch: string[]): ResearchNode[] {
  return ALL_RESEARCH.filter(
    (research) =>
      !completedResearch.includes(research.id) &&
      arePrerequisitesMet(research.id, completedResearch)
  );
}

/**
 * Check if player has sufficient resources for research
 */
export function canAffordResearch(
  researchId: string,
  availableResources: { food: number; gold: number }
): boolean {
  const research = getResearchById(researchId);
  if (!research) return false;

  return (
    availableResources.food >= research.cost.food &&
    availableResources.gold >= research.cost.gold
  );
}

/**
 * Get research duration in milliseconds
 */
export function getResearchDurationMs(researchId: string): number {
  const research = getResearchById(researchId);
  return research ? research.duration * 1000 : 0;
}

/**
 * Calculate total research cost for a path
 */
export function calculateResearchPathCost(researchIds: string[]): ResearchCost {
  return researchIds.reduce(
    (total, id) => {
      const research = getResearchById(id);
      if (research) {
        return {
          food: total.food + research.cost.food,
          gold: total.gold + research.cost.gold,
        };
      }
      return total;
    },
    { food: 0, gold: 0 }
  );
}

/**
 * Get all research that unlock when a specific research completes
 */
export function getUnlockedByResearch(
  completedResearchId: string,
  currentCompleted: string[]
): ResearchNode[] {
  const newCompleted = [...currentCompleted, completedResearchId];
  return ALL_RESEARCH.filter(
    (research) =>
      !newCompleted.includes(research.id) &&
      research.prerequisites.includes(completedResearchId) &&
      arePrerequisitesMet(research.id, newCompleted)
  );
}
