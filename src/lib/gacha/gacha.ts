/**
 * Gacha system for probability-based hero acquisition
 * Implements rarity tiers and drop rates
 */

import { Hero, HeroRarity } from '@/types/hero';
import { ALL_HEROES } from '@/constants/heroes';

/**
 * Drop rates for each rarity tier
 * Total: 100%
 */
export const DROP_RATES: Record<HeroRarity, number> = {
  [HeroRarity.LEGENDARY]: 1,
  [HeroRarity.EPIC]: 5,
  [HeroRarity.RARE]: 20,
  [HeroRarity.COMMON]: 74,
};

/**
 * Gacha pull result
 */
export interface GachaPullResult {
  hero: Hero;
  isDuplicate: boolean;
  rarity: HeroRarity;
}

/**
 * Gacha pull options
 */
export interface GachaPullOptions {
  ownedHeroIds?: string[];
  guaranteedRarity?: HeroRarity;
}

/**
 * Get heroes by rarity from the hero pool
 */
function getHeroesByRarity(rarity: HeroRarity): Hero[] {
  return ALL_HEROES.filter(hero => hero.rarity === rarity);
}

/**
 * Roll for a rarity tier based on drop rates
 */
export function rollRarity(guaranteedRarity?: HeroRarity): HeroRarity {
  if (guaranteedRarity) {
    return guaranteedRarity;
  }

  const roll = Math.random() * 100;
  let cumulative = 0;

  // Check from highest to lowest rarity
  const rarities: HeroRarity[] = [
    HeroRarity.LEGENDARY,
    HeroRarity.EPIC,
    HeroRarity.RARE,
    HeroRarity.COMMON,
  ];

  for (const rarity of rarities) {
    cumulative += DROP_RATES[rarity];
    if (roll < cumulative) {
      return rarity;
    }
  }

  // Fallback to common (should never reach here)
  return HeroRarity.COMMON;
}

/**
 * Select a random hero from a rarity tier
 */
export function selectHeroFromRarity(rarity: HeroRarity): Hero {
  const heroes = getHeroesByRarity(rarity);
  
  if (heroes.length === 0) {
    throw new Error(`No heroes available for rarity: ${rarity}`);
  }

  const randomIndex = Math.floor(Math.random() * heroes.length);
  return heroes[randomIndex];
}

/**
 * Perform a single gacha pull
 */
export function performGachaPull(options: GachaPullOptions = {}): GachaPullResult {
  const { ownedHeroIds = [], guaranteedRarity } = options;

  // Roll for rarity
  const rarity = rollRarity(guaranteedRarity);

  // Select hero from rarity tier
  const hero = selectHeroFromRarity(rarity);

  // Check if duplicate
  const isDuplicate = ownedHeroIds.includes(hero.id);

  return {
    hero,
    isDuplicate,
    rarity,
  };
}

/**
 * Perform multiple gacha pulls
 */
export function performMultiPull(
  count: number,
  options: GachaPullOptions = {}
): GachaPullResult[] {
  const results: GachaPullResult[] = [];

  for (let i = 0; i < count; i++) {
    results.push(performGachaPull(options));
  }

  return results;
}

/**
 * Calculate duplicate compensation
 * Converts duplicate heroes to resources or currency
 */
export interface DuplicateCompensation {
  gold: number;
  experience: number;
}

export function calculateDuplicateCompensation(rarity: HeroRarity): DuplicateCompensation {
  const compensationByRarity: Record<HeroRarity, DuplicateCompensation> = {
    [HeroRarity.COMMON]: { gold: 50, experience: 10 },
    [HeroRarity.RARE]: { gold: 150, experience: 30 },
    [HeroRarity.EPIC]: { gold: 500, experience: 100 },
    [HeroRarity.LEGENDARY]: { gold: 2000, experience: 500 },
  };

  return compensationByRarity[rarity];
}

/**
 * Get rarity color for UI display
 */
export function getRarityColor(rarity: HeroRarity): string {
  const colors: Record<HeroRarity, string> = {
    [HeroRarity.COMMON]: '#9CA3AF', // gray
    [HeroRarity.RARE]: '#3B82F6', // blue
    [HeroRarity.EPIC]: '#A855F7', // purple
    [HeroRarity.LEGENDARY]: '#F59E0B', // gold
  };

  return colors[rarity];
}

/**
 * Get rarity display name in Vietnamese
 */
export function getRarityNameVietnamese(rarity: HeroRarity): string {
  const names: Record<HeroRarity, string> = {
    [HeroRarity.COMMON]: 'Thường',
    [HeroRarity.RARE]: 'Hiếm',
    [HeroRarity.EPIC]: 'Sử Thi',
    [HeroRarity.LEGENDARY]: 'Huyền Thoại',
  };

  return names[rarity];
}
