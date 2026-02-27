/**
 * Zod validation schemas index
 * Central export point for all validation schemas
 */

// Save schemas
export {
  SaveSlotNumberSchema,
  SaveMetadataSchema,
  GameStateSchema,
  SaveSlotSchema,
  SaveOperationResultSchema,
  LoadOperationResultSchema,
  ConflictResolutionSchema,
  SaveConflictSchema,
  AutoSaveConfigSchema,
  SaveFileExportSchema,
  type SaveMetadata,
  type GameState,
  type SaveSlot,
  type SaveOperationResult,
  type LoadOperationResult,
  type ConflictResolution,
  type SaveConflict,
  type AutoSaveConfig,
  type SaveFileExport
} from './save.schema';

// Hero schemas
export {
  HeroFactionSchema,
  HeroRaritySchema,
  HeroStatsSchema,
  AbilityEffectSchema,
  AbilitySchema,
  UnlockConditionSchema,
  HeroSchema,
  type HeroFaction,
  type HeroRarity,
  type HeroStats,
  type AbilityEffect,
  type Ability,
  type UnlockCondition,
  type Hero
} from './hero.schema';

// Quiz schemas
export {
  QuizDifficultySchema,
  QuizCategorySchema,
  QuizQuestionSchema,
  RewardTypeSchema,
  RewardSchema,
  QuizProgressSchema,
  QuizAnswerSubmissionSchema,
  QuizSessionSchema,
  type QuizDifficulty,
  type QuizCategory,
  type QuizQuestion,
  type RewardType,
  type Reward,
  type QuizProgress,
  type QuizAnswerSubmission,
  type QuizSession
} from './quiz.schema';

// Resource schemas
export {
  ResourceTypeSchema,
  ResourcesSchema,
  ResourceCapsSchema,
  ResourceGenerationSchema,
  ResourceTransactionTypeSchema,
  ResourceTransactionSchema,
  ResourceCostSchema,
  ResourceValidationSchema,
  type ResourceType,
  type Resources,
  type ResourceCaps,
  type ResourceGeneration,
  type ResourceTransactionType,
  type ResourceTransaction,
  type ResourceCost,
  type ResourceValidation
} from './resource.schema';
