/**
 * AI Difficulty System
 * Defines difficulty modifiers and behavior adjustments for AI opponents
 * 
 * Validates Requirement 17.3:
 * - AI implements difficulty levels from Legacy_Code
 * - Adjusts AI reaction times and decision quality by difficulty
 * - Modifies resource generation and unit limits
 */

import { Difficulty } from '@/types/game';

/**
 * AI difficulty settings interface
 * Controls various aspects of AI behavior based on difficulty level
 */
export interface AIDifficultySettings {
  /** Seconds between AI unit spawn attempts */
  spawnInterval: number;
  
  /** Multiplier for AI resource generation (0.8 = 80%, 1.3 = 130%) */
  resourceMultiplier: number;
  
  /** AI aggressiveness level (0-1), affects targeting priority and attack decisions */
  aggressiveness: number;
  
  /** Maximum number of units AI can control simultaneously */
  unitLimit: number;
  
  /** Maximum distance AI will look for targets (in game units) */
  targetingRange: number;
  
  /** Reaction time delay in milliseconds before AI responds to threats */
  reactionTime: number;
  
  /** Decision quality (0-1), affects how optimal AI decisions are */
  decisionQuality: number;
  
  /** Probability (0-1) that AI will make the optimal strategic choice */
  strategicAccuracy: number;
  
  /** Multiplier for AI unit stats (attack, defense) */
  unitStatMultiplier: number;
}

/**
 * Difficulty-based AI settings configuration
 * 
 * Easy Mode:
 * - Slower spawn rate (15s intervals)
 * - Reduced resources (80% generation)
 * - Less aggressive (40% aggressiveness)
 * - Smaller army (15 unit limit)
 * - Shorter targeting range
 * - Slower reactions (1500ms delay)
 * - Lower decision quality (60%)
 * - Makes suboptimal choices more often (70% accuracy)
 * - Weaker units (90% stats)
 * 
 * Normal Mode:
 * - Moderate spawn rate (10s intervals)
 * - Standard resources (100% generation)
 * - Balanced aggression (60% aggressiveness)
 * - Medium army (25 unit limit)
 * - Standard targeting range
 * - Normal reactions (800ms delay)
 * - Good decision quality (80%)
 * - Usually makes good choices (85% accuracy)
 * - Standard units (100% stats)
 * 
 * Hard Mode:
 * - Fast spawn rate (7s intervals)
 * - Increased resources (130% generation)
 * - Highly aggressive (80% aggressiveness)
 * - Large army (35 unit limit)
 * - Extended targeting range
 * - Quick reactions (400ms delay)
 * - Excellent decision quality (95%)
 * - Almost always optimal (95% accuracy)
 * - Stronger units (110% stats)
 */
export const DIFFICULTY_SETTINGS: Record<Difficulty, AIDifficultySettings> = {
  [Difficulty.EASY]: {
    spawnInterval: 15,
    resourceMultiplier: 0.8,
    aggressiveness: 0.4,
    unitLimit: 15,
    targetingRange: 300,
    reactionTime: 1500,
    decisionQuality: 0.6,
    strategicAccuracy: 0.7,
    unitStatMultiplier: 0.9,
  },
  [Difficulty.NORMAL]: {
    spawnInterval: 10,
    resourceMultiplier: 1.0,
    aggressiveness: 0.6,
    unitLimit: 25,
    targetingRange: 400,
    reactionTime: 800,
    decisionQuality: 0.8,
    strategicAccuracy: 0.85,
    unitStatMultiplier: 1.0,
  },
  [Difficulty.HARD]: {
    spawnInterval: 7,
    resourceMultiplier: 1.3,
    aggressiveness: 0.8,
    unitLimit: 35,
    targetingRange: 500,
    reactionTime: 400,
    decisionQuality: 0.95,
    strategicAccuracy: 0.95,
    unitStatMultiplier: 1.1,
  },
};

/**
 * Get AI difficulty settings for a given difficulty level
 * 
 * @param difficulty - The difficulty level (easy, normal, hard)
 * @returns AI settings configuration for the specified difficulty
 * 
 * @example
 * ```typescript
 * const settings = getAIDifficultySettings(Difficulty.HARD);
 * console.log(settings.spawnInterval); // 7
 * console.log(settings.aggressiveness); // 0.8
 * ```
 */
export function getAIDifficultySettings(difficulty: Difficulty): AIDifficultySettings {
  return DIFFICULTY_SETTINGS[difficulty];
}

/**
 * Apply difficulty-based reaction time delay
 * Returns a promise that resolves after the reaction time for the given difficulty
 * 
 * This simulates AI "thinking time" and makes lower difficulties feel less robotic
 * 
 * @param difficulty - The difficulty level
 * @returns Promise that resolves after the reaction delay
 * 
 * @example
 * ```typescript
 * // AI waits before responding to player action
 * await applyReactionDelay(Difficulty.EASY); // Waits 1500ms
 * // Now execute AI response
 * ```
 */
export async function applyReactionDelay(difficulty: Difficulty): Promise<void> {
  const settings = getAIDifficultySettings(difficulty);
  return new Promise((resolve) => setTimeout(resolve, settings.reactionTime));
}

/**
 * Determine if AI should make the optimal decision based on difficulty
 * 
 * Lower difficulties have a chance to make suboptimal decisions,
 * making the AI feel more human and less perfect
 * 
 * @param difficulty - The difficulty level
 * @returns true if AI should make optimal decision, false for suboptimal
 * 
 * @example
 * ```typescript
 * if (shouldMakeOptimalDecision(Difficulty.EASY)) {
 *   // Make best strategic choice
 * } else {
 *   // Make a reasonable but suboptimal choice
 * }
 * ```
 */
export function shouldMakeOptimalDecision(difficulty: Difficulty): boolean {
  const settings = getAIDifficultySettings(difficulty);
  return Math.random() < settings.strategicAccuracy;
}

/**
 * Apply decision quality modifier to a calculated priority score
 * 
 * Lower difficulties reduce the accuracy of priority calculations,
 * making AI targeting and decision-making less precise
 * 
 * @param basePriority - The calculated priority score
 * @param difficulty - The difficulty level
 * @returns Modified priority score with quality factor applied
 * 
 * @example
 * ```typescript
 * const targetPriority = 100;
 * const adjustedPriority = applyDecisionQuality(targetPriority, Difficulty.EASY);
 * // adjustedPriority might be 60 (100 * 0.6)
 * ```
 */
export function applyDecisionQuality(basePriority: number, difficulty: Difficulty): number {
  const settings = getAIDifficultySettings(difficulty);
  return basePriority * settings.decisionQuality;
}

/**
 * Calculate AI resource generation rate based on difficulty
 * 
 * @param baseRate - The base resource generation rate per second
 * @param difficulty - The difficulty level
 * @returns Modified generation rate with difficulty multiplier applied
 * 
 * @example
 * ```typescript
 * const baseGoldRate = 10; // 10 gold per second
 * const easyRate = calculateResourceGeneration(baseGoldRate, Difficulty.EASY);
 * // easyRate = 8 (10 * 0.8)
 * 
 * const hardRate = calculateResourceGeneration(baseGoldRate, Difficulty.HARD);
 * // hardRate = 13 (10 * 1.3)
 * ```
 */
export function calculateResourceGeneration(
  baseRate: number,
  difficulty: Difficulty
): number {
  const settings = getAIDifficultySettings(difficulty);
  return baseRate * settings.resourceMultiplier;
}

/**
 * Apply difficulty modifier to AI unit stats
 * 
 * Adjusts unit attack, defense, and other stats based on difficulty level
 * Easy mode units are slightly weaker, hard mode units are slightly stronger
 * 
 * @param baseStat - The base stat value (attack, defense, etc.)
 * @param difficulty - The difficulty level
 * @returns Modified stat value with difficulty multiplier applied
 * 
 * @example
 * ```typescript
 * const baseAttack = 50;
 * const easyAttack = applyUnitStatModifier(baseAttack, Difficulty.EASY);
 * // easyAttack = 45 (50 * 0.9)
 * 
 * const hardAttack = applyUnitStatModifier(baseAttack, Difficulty.HARD);
 * // hardAttack = 55 (50 * 1.1)
 * ```
 */
export function applyUnitStatModifier(baseStat: number, difficulty: Difficulty): number {
  const settings = getAIDifficultySettings(difficulty);
  return Math.round(baseStat * settings.unitStatMultiplier);
}

/**
 * Check if AI should spawn a unit based on difficulty timing
 * 
 * @param lastSpawnTime - Timestamp of last unit spawn (in seconds)
 * @param currentTime - Current game time (in seconds)
 * @param difficulty - The difficulty level
 * @returns true if enough time has passed for next spawn
 * 
 * @example
 * ```typescript
 * const lastSpawn = 10; // 10 seconds ago
 * const now = 25; // current time
 * 
 * if (canSpawnUnit(lastSpawn, now, Difficulty.EASY)) {
 *   // 15 seconds have passed, can spawn
 * }
 * ```
 */
export function canSpawnUnit(
  lastSpawnTime: number,
  currentTime: number,
  difficulty: Difficulty
): boolean {
  const settings = getAIDifficultySettings(difficulty);
  const timeSinceLastSpawn = currentTime - lastSpawnTime;
  return timeSinceLastSpawn >= settings.spawnInterval;
}

/**
 * Get difficulty display information for UI
 * 
 * @param difficulty - The difficulty level
 * @returns Object with display name and description
 */
export function getDifficultyInfo(difficulty: Difficulty): {
  name: string;
  nameVietnamese: string;
  description: string;
  descriptionVietnamese: string;
} {
  const difficultyInfo = {
    [Difficulty.EASY]: {
      name: 'Easy',
      nameVietnamese: 'Dễ',
      description: 'Relaxed gameplay with slower, less aggressive AI',
      descriptionVietnamese: 'Chơi thoải mái với AI chậm hơn và ít hung hãn hơn',
    },
    [Difficulty.NORMAL]: {
      name: 'Normal',
      nameVietnamese: 'Bình thường',
      description: 'Balanced challenge with competent AI opponent',
      descriptionVietnamese: 'Thử thách cân bằng với đối thủ AI có năng lực',
    },
    [Difficulty.HARD]: {
      name: 'Hard',
      nameVietnamese: 'Khó',
      description: 'Intense challenge with aggressive, strategic AI',
      descriptionVietnamese: 'Thử thách khốc liệt với AI hung hãn và chiến lược',
    },
  };
  
  return difficultyInfo[difficulty];
}

/**
 * Validate difficulty level
 * 
 * @param difficulty - The difficulty value to validate
 * @returns true if valid difficulty level
 */
export function isValidDifficulty(difficulty: string): difficulty is Difficulty {
  return Object.values(Difficulty).includes(difficulty as Difficulty);
}
