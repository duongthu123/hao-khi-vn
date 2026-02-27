/**
 * Hero system Zod validation schemas
 * Provides runtime validation for hero data
 */

import { z } from 'zod';

/**
 * Hero faction schema
 */
export const HeroFactionSchema = z.enum(['vietnamese', 'mongol']);

/**
 * Hero rarity schema
 */
export const HeroRaritySchema = z.enum(['common', 'rare', 'epic', 'legendary']);

/**
 * Hero statistics schema
 */
export const HeroStatsSchema = z.object({
  attack: z.number().int().min(0).max(100),
  defense: z.number().int().min(0).max(100),
  speed: z.number().int().min(0).max(100),
  leadership: z.number().int().min(0).max(100),
  intelligence: z.number().int().min(0).max(100)
});

/**
 * Ability effect schema (discriminated union)
 * **Validates: Requirements 24.5**
 */
export const AbilityEffectSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('damage'),
    value: z.number().positive(),
    radius: z.number().nonnegative()
  }),
  z.object({
    type: z.literal('heal'),
    value: z.number().positive(),
    radius: z.number().nonnegative()
  }),
  z.object({
    type: z.literal('buff'),
    stat: z.enum(['attack', 'defense', 'speed', 'leadership', 'intelligence']),
    value: z.number(),
    duration: z.number().positive()
  }),
  z.object({
    type: z.literal('debuff'),
    stat: z.enum(['attack', 'defense', 'speed', 'leadership', 'intelligence']),
    value: z.number(),
    duration: z.number().positive()
  })
]);

/**
 * Hero ability schema
 * **Validates: Requirements 24.5**
 */
export const AbilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameVietnamese: z.string().min(1),
  description: z.string(),
  descriptionVietnamese: z.string(),
  cooldown: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  effect: AbilityEffectSchema
});

/**
 * Unlock condition schema
 */
export const UnlockConditionSchema = z.object({
  type: z.enum(['level', 'achievement', 'quest', 'gacha']),
  requirement: z.union([z.string(), z.number()])
});

/**
 * Hero schema
 * **Validates: Requirements 24.5**
 */
export const HeroSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameVietnamese: z.string().min(1),
  faction: HeroFactionSchema,
  rarity: HeroRaritySchema,
  stats: HeroStatsSchema,
  abilities: z.array(AbilitySchema),
  portrait: z.string().min(1),
  description: z.string(),
  descriptionVietnamese: z.string(),
  historicalContext: z.string(),
  historicalContextVietnamese: z.string(),
  unlockCondition: UnlockConditionSchema.optional()
});

// Type inference exports
export type HeroFaction = z.infer<typeof HeroFactionSchema>;
export type HeroRarity = z.infer<typeof HeroRaritySchema>;
export type HeroStats = z.infer<typeof HeroStatsSchema>;
export type AbilityEffect = z.infer<typeof AbilityEffectSchema>;
export type Ability = z.infer<typeof AbilitySchema>;
export type UnlockCondition = z.infer<typeof UnlockConditionSchema>;
export type Hero = z.infer<typeof HeroSchema>;
