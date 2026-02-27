/**
 * Combat system types
 * Defines combat results, events, and battle-related interfaces
 */

import { Direction, Vector2 } from './unit';

/**
 * Combat event type enum
 */
export enum CombatEventType {
  ATTACK = 'attack',
  DAMAGE = 'damage',
  HEAL = 'heal',
  DEATH = 'death',
  ABILITY_USED = 'ability-used',
  STATUS_APPLIED = 'status-applied',
  STATUS_REMOVED = 'status-removed',
  UNIT_SPAWNED = 'unit-spawned',
  BUILDING_DESTROYED = 'building-destroyed'
}

/**
 * Combat event interface
 */
export interface CombatEvent {
  type: CombatEventType;
  timestamp: number;
  sourceId?: string;
  targetId?: string;
  value?: number;
  position?: Vector2;
  data?: Record<string, unknown>;
}

/**
 * Combat result interface
 */
export interface CombatResult {
  success: boolean;
  damage: number;
  attackerId: string;
  defenderId: string;
  attackDirection: Direction;
  defenseDirection: Direction;
  isCritical: boolean;
  isKill: boolean;
  events: CombatEvent[];
}

/**
 * Ability result interface
 */
export interface AbilityResult {
  success: boolean;
  abilityId: string;
  casterId: string;
  targetIds: string[];
  effects: {
    targetId: string;
    damage?: number;
    healing?: number;
    statusApplied?: string;
  }[];
  events: CombatEvent[];
}

/**
 * Damage calculation parameters
 */
export interface DamageCalculation {
  baseAttack: number;
  baseDefense: number;
  attackDirection: Direction;
  defenseDirection: Direction;
  attackerType: string;
  defenderType: string;
  modifiers: {
    directionModifier: number;
    typeModifier: number;
    randomFactor: number;
  };
  finalDamage: number;
}
