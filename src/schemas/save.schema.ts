/**
 * Save system Zod validation schemas
 * Provides runtime validation for save data
 */

import { z } from 'zod';

/**
 * Resources schema (inline to avoid circular dependency)
 */
const ResourcesSchema = z.object({
  food: z.number().nonnegative(),
  gold: z.number().nonnegative(),
  army: z.number().nonnegative()
});

/**
 * Save slot number schema (0-4 for 5 slots)
 */
export const SaveSlotNumberSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4)
]);

/**
 * Save metadata schema
 * **Validates: Requirements 24.1, 24.2**
 */
export const SaveMetadataSchema = z.object({
  slot: SaveSlotNumberSchema,
  timestamp: z.number().int().positive(),
  playerName: z.string().min(1).max(50),
  progress: z.number().min(0).max(100),
  resources: ResourcesSchema,
  level: z.number().int().positive(),
  playTime: z.number().int().nonnegative(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/)
});

/**
 * Game state schema
 * **Validates: Requirements 24.1, 24.2**
 */
export const GameStateSchema = z.object({
  version: z.string(),
  metadata: z.object({
    slot: z.number().int().min(0).max(4),
    timestamp: z.number().int().positive(),
    playerName: z.string().min(1).max(50),
    progress: z.number().min(0).max(100),
    level: z.number().int().positive(),
    playTime: z.number().int().nonnegative()
  }),
  game: z.object({
    phase: z.enum(['menu', 'hero-selection', 'playing', 'paused', 'game-over']),
    difficulty: z.enum(['easy', 'normal', 'hard']),
    currentLevel: z.number().int().positive(),
    elapsedTime: z.number().nonnegative()
  }),
  hero: z.object({
    selectedHero: z.string().nullable(),
    unlockedHeroes: z.array(z.string())
  }),
  combat: z.object({
    units: z.array(z.string()),
    buildings: z.array(z.string()),
    activeEffects: z.array(z.string())
  }),
  resources: z.object({
    food: z.number().nonnegative(),
    gold: z.number().nonnegative(),
    army: z.number().nonnegative(),
    foodCap: z.number().positive(),
    goldCap: z.number().positive(),
    armyCap: z.number().positive(),
    generation: z.object({
      foodPerSecond: z.number().nonnegative(),
      goldPerSecond: z.number().nonnegative(),
      armyPerSecond: z.number().nonnegative()
    })
  }),
  collection: z.object({
    heroes: z.array(z.string()),
    items: z.array(z.string()),
    completionPercentage: z.number().min(0).max(100)
  }),
  profile: z.object({
    name: z.string().min(1).max(50),
    rank: z.string(),
    level: z.number().int().positive(),
    experience: z.number().int().nonnegative(),
    wins: z.number().int().nonnegative(),
    losses: z.number().int().nonnegative(),
    achievements: z.array(z.string()),
    statistics: z.object({
      totalPlayTime: z.number().int().nonnegative(),
      unitsDefeated: z.number().int().nonnegative(),
      resourcesGathered: z.number().int().nonnegative(),
      quizzesCompleted: z.number().int().nonnegative()
    })
  }),
  research: z.object({
    completed: z.array(z.string()),
    inProgress: z.string().nullable(),
    progress: z.number().min(0).max(100),
    available: z.array(z.string())
  }),
  quiz: z.object({
    questionsAnswered: z.number().int().nonnegative(),
    correctAnswers: z.number().int().nonnegative(),
    completedCategories: z.array(z.string()),
    rewards: z.array(z.string())
  })
});

/**
 * Save slot schema
 */
export const SaveSlotSchema = z.object({
  slot: SaveSlotNumberSchema,
  metadata: SaveMetadataSchema.nullable(),
  isEmpty: z.boolean(),
  lastModified: z.number().int().positive().optional()
});

/**
 * Save operation result schema
 */
export const SaveOperationResultSchema = z.object({
  success: z.boolean(),
  slot: SaveSlotNumberSchema.optional(),
  error: z.string().optional(),
  timestamp: z.number().int().positive().optional()
});

/**
 * Load operation result schema
 */
export const LoadOperationResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  metadata: SaveMetadataSchema.optional()
});

/**
 * Conflict resolution strategy schema
 */
export const ConflictResolutionSchema = z.enum([
  'use-local',
  'use-cloud',
  'merge',
  'cancel'
]);

/**
 * Save conflict schema
 */
export const SaveConflictSchema = z.object({
  localMetadata: SaveMetadataSchema,
  cloudMetadata: SaveMetadataSchema,
  resolution: ConflictResolutionSchema.optional()
});

/**
 * Auto-save configuration schema
 */
export const AutoSaveConfigSchema = z.object({
  enabled: z.boolean(),
  interval: z.number().int().positive(),
  slot: SaveSlotNumberSchema,
  skipDuringCombat: z.boolean()
});

/**
 * Export/Import file format schema
 */
export const SaveFileExportSchema = z.object({
  version: z.string(),
  exportedAt: z.number().int().positive(),
  metadata: SaveMetadataSchema,
  data: z.string(),
  checksum: z.string()
});

// Type inference exports
export type SaveMetadata = z.infer<typeof SaveMetadataSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type SaveSlot = z.infer<typeof SaveSlotSchema>;
export type SaveOperationResult = z.infer<typeof SaveOperationResultSchema>;
export type LoadOperationResult = z.infer<typeof LoadOperationResultSchema>;
export type ConflictResolution = z.infer<typeof ConflictResolutionSchema>;
export type SaveConflict = z.infer<typeof SaveConflictSchema>;
export type AutoSaveConfig = z.infer<typeof AutoSaveConfigSchema>;
export type SaveFileExport = z.infer<typeof SaveFileExportSchema>;
