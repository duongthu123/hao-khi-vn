/**
 * Unit system types
 * Defines units, directions, status effects, and positioning
 */

/**
 * Unit type enum
 */
export enum UnitType {
  INFANTRY = 'infantry',
  CAVALRY = 'cavalry',
  ARCHER = 'archer',
  SIEGE = 'siege'
}

/**
 * Direction enum for unit facing and combat
 */
export enum Direction {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
  NORTHEAST = 'northeast',
  NORTHWEST = 'northwest',
  SOUTHEAST = 'southeast',
  SOUTHWEST = 'southwest'
}

/**
 * 2D vector for positioning
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Unit statistics interface
 */
export interface UnitStats {
  attack: number;
  defense: number;
  speed: number;
  health: number;
  maxHealth: number;
}

/**
 * Status effect types
 */
export enum StatusEffectType {
  STUN = 'stun',
  POISON = 'poison',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SLOW = 'slow',
  HASTE = 'haste'
}

/**
 * Status effect interface
 */
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value?: number;
  stat?: keyof UnitStats;
  source?: string;
}

/**
 * Unit owner enum
 */
export enum UnitOwner {
  PLAYER = 'player',
  AI = 'ai'
}

/**
 * Unit interface
 */
export interface Unit {
  id: string;
  type: UnitType;
  faction: 'vietnamese' | 'mongol';
  position: Vector2;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  direction: Direction;
  status: StatusEffect[];
  owner: UnitOwner;
}
