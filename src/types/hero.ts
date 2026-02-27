/**
 * Hero system types
 * Defines heroes, abilities, and hero-related interfaces
 */

/**
 * Hero faction enum
 */
export enum HeroFaction {
  VIETNAMESE = 'vietnamese',
  MONGOL = 'mongol'
}

/**
 * Hero rarity enum
 */
export enum HeroRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

/**
 * Hero statistics interface
 */
export interface HeroStats {
  attack: number;
  defense: number;
  speed: number;
  leadership: number;
  intelligence: number;
}

/**
 * Ability effect types
 */
export type AbilityEffect =
  | {
      type: 'damage';
      value: number;
      radius: number;
    }
  | {
      type: 'heal';
      value: number;
      radius: number;
    }
  | {
      type: 'buff';
      stat: keyof HeroStats;
      value: number;
      duration: number;
    }
  | {
      type: 'debuff';
      stat: keyof HeroStats;
      value: number;
      duration: number;
    };

/**
 * Hero ability interface
 */
export interface Ability {
  id: string;
  name: string;
  nameVietnamese: string;
  description: string;
  descriptionVietnamese: string;
  cooldown: number;
  cost: number;
  effect: AbilityEffect;
}

/**
 * Unlock condition for heroes
 */
export interface UnlockCondition {
  type: 'level' | 'achievement' | 'quest' | 'gacha';
  requirement: string | number;
}

/**
 * Hero interface
 */
export interface Hero {
  id: string;
  name: string;
  nameVietnamese: string;
  faction: HeroFaction;
  rarity: HeroRarity;
  stats: HeroStats;
  abilities: Ability[];
  portrait: string;
  description: string;
  descriptionVietnamese: string;
  historicalContext: string;
  historicalContextVietnamese: string;
  unlockCondition?: UnlockCondition;
}
