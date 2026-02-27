/**
 * Save data validation utilities
 * Demonstrates usage of Zod schemas for runtime validation
 */

import { GameStateSchema, SaveMetadataSchema } from '@/schemas';
import type { GameState, SaveMetadata } from '@/schemas';

/**
 * Validates game state data
 * @param data - Unknown data to validate
 * @returns Validated GameState or null if invalid
 */
export function validateGameState(data: unknown): GameState | null {
  try {
    return GameStateSchema.parse(data);
  } catch (error) {
    console.error('Game state validation failed:', error);
    return null;
  }
}

/**
 * Validates save metadata
 * @param data - Unknown data to validate
 * @returns Validated SaveMetadata or null if invalid
 */
export function validateSaveMetadata(data: unknown): SaveMetadata | null {
  try {
    return SaveMetadataSchema.parse(data);
  } catch (error) {
    console.error('Save metadata validation failed:', error);
    return null;
  }
}

/**
 * Safely validates game state with detailed error information
 * @param data - Unknown data to validate
 * @returns Result object with success status and data or errors
 */
export function safeValidateGameState(data: unknown): {
  success: boolean;
  data?: GameState;
  errors?: string[];
} {
  const result = GameStateSchema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
  };
}
