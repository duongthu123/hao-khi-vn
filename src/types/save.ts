/**
 * Save system types
 * Defines save metadata, save slots, and save-related interfaces
 */

import { Resources } from './resource';

/**
 * Save slot number type (0-4 for 5 slots)
 */
export type SaveSlotNumber = 0 | 1 | 2 | 3 | 4;

/**
 * Save metadata interface
 */
export interface SaveMetadata {
  slot: SaveSlotNumber;
  timestamp: number;
  playerName: string;
  progress: number; // 0-100
  resources: Resources;
  level: number;
  playTime: number; // seconds
  version: string;
}

/**
 * Save slot interface
 */
export interface SaveSlot {
  slot: SaveSlotNumber;
  metadata: SaveMetadata | null;
  isEmpty: boolean;
  lastModified?: number;
}

/**
 * Save operation result
 */
export interface SaveOperationResult {
  success: boolean;
  slot?: SaveSlotNumber;
  error?: string;
  timestamp?: number;
}

/**
 * Load operation result
 */
export interface LoadOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: SaveMetadata;
}

/**
 * Save conflict resolution strategy
 */
export enum ConflictResolution {
  USE_LOCAL = 'use-local',
  USE_CLOUD = 'use-cloud',
  MERGE = 'merge',
  CANCEL = 'cancel'
}

/**
 * Save conflict interface
 */
export interface SaveConflict {
  localMetadata: SaveMetadata;
  cloudMetadata: SaveMetadata;
  resolution?: ConflictResolution;
}

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // seconds
  slot: SaveSlotNumber;
  skipDuringCombat: boolean;
}

/**
 * Export/Import file format
 */
export interface SaveFileExport {
  version: string;
  exportedAt: number;
  metadata: SaveMetadata;
  data: string; // compressed JSON
  checksum: string;
}
