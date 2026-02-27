/**
 * Direction-Based Combat Mechanics
 * Implements direction calculation, facing, rotation, and direction modifiers
 * 
 * Validates Requirements:
 * - 13.1: Direction-based combat calculations
 * - 13.3: Direction modifier system (front, side, rear attack bonuses)
 */

import { Direction, Vector2, Unit } from '@/types/unit';
import { DIRECTION_DAMAGE_MULTIPLIERS } from '@/constants/units';

/**
 * Direction angles in degrees for calculations
 * North is 0°, angles increase clockwise
 */
export const DIRECTION_ANGLES: Record<Direction, number> = {
  [Direction.NORTH]: 0,
  [Direction.NORTHEAST]: 45,
  [Direction.EAST]: 90,
  [Direction.SOUTHEAST]: 135,
  [Direction.SOUTH]: 180,
  [Direction.SOUTHWEST]: 225,
  [Direction.WEST]: 270,
  [Direction.NORTHWEST]: 315,
};

/**
 * Reverse mapping from angle to direction
 */
const ANGLE_TO_DIRECTION: Record<number, Direction> = {
  0: Direction.NORTH,
  45: Direction.NORTHEAST,
  90: Direction.EAST,
  135: Direction.SOUTHEAST,
  180: Direction.SOUTH,
  225: Direction.SOUTHWEST,
  270: Direction.WEST,
  315: Direction.NORTHWEST,
};

/**
 * Calculate the direction from one position to another
 * 
 * In screen coordinates:
 * - Positive X goes right (East)
 * - Positive Y goes down (South)
 * - North is up (negative Y)
 * 
 * @param from - Starting position
 * @param to - Target position
 * @returns Direction enum value representing the direction from 'from' to 'to'
 */
export function calculateDirectionBetweenPositions(from: Vector2, to: Vector2): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Handle same position
  if (dx === 0 && dy === 0) {
    return Direction.NORTH; // Default direction
  }

  // In screen coordinates, Y increases downward, but we want North to be "up"
  // So we negate dy to convert to standard mathematical coordinates
  const angleRad = Math.atan2(-dy, dx);
  let angleDeg = (angleRad * 180) / Math.PI;

  // atan2 gives: East = 0°, North = 90°, West = 180°/-180°, South = -90°
  // We want: North = 0°, East = 90°, South = 180°, West = 270°
  // Formula: ourAngle = (90 - atan2Angle) normalized to 0-360
  angleDeg = 90 - angleDeg;

  // Normalize to 0-360 range
  if (angleDeg < 0) {
    angleDeg += 360;
  }
  angleDeg = angleDeg % 360;

  // Round to nearest 45-degree increment
  const roundedAngle = Math.round(angleDeg / 45) * 45;
  const normalizedAngle = roundedAngle % 360;

  return ANGLE_TO_DIRECTION[normalizedAngle] || Direction.NORTH;
}

/**
 * Calculate the direction from attacker to defender
 * 
 * @param attacker - The attacking unit
 * @param defender - The defending unit
 * @returns Direction from attacker to defender
 */
export function calculateAttackDirection(attacker: Unit, defender: Unit): Direction {
  return calculateDirectionBetweenPositions(attacker.position, defender.position);
}

/**
 * Calculate the relative attack direction (FRONT, SIDE, or REAR)
 * based on attacker's position and defender's facing
 * 
 * This determines the direction modifier for damage calculation:
 * - FRONT: Attacker is in front of defender (defender facing attacker)
 * - SIDE: Attacker is to the side of defender
 * - REAR: Attacker is behind defender (attacking from behind)
 * 
 * @param attackerPosition - Position of the attacker
 * @param defenderPosition - Position of the defender
 * @param defenderFacing - Direction the defender is facing
 * @returns 'FRONT', 'SIDE', or 'REAR' classification
 */
export function getRelativeAttackDirection(
  attackerPosition: Vector2,
  defenderPosition: Vector2,
  defenderFacing: Direction
): keyof typeof DIRECTION_DAMAGE_MULTIPLIERS {
  // Calculate direction from defender to attacker
  const attackDirection = calculateDirectionBetweenPositions(defenderPosition, attackerPosition);
  
  // Get angles
  const attackAngle = DIRECTION_ANGLES[attackDirection];
  const defenderAngle = DIRECTION_ANGLES[defenderFacing];

  // Calculate angle difference
  let angleDiff = Math.abs(attackAngle - defenderAngle);
  
  // Normalize to 0-180 range
  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff;
  }

  // Classify based on angle difference:
  // - 0-45°: Attacker is in front (FRONT attack)
  // - 45-135°: Attacker is to the side (SIDE attack)
  // - 135-180°: Attacker is behind (REAR attack)
  if (angleDiff <= 45) {
    return 'FRONT';
  } else if (angleDiff <= 135) {
    return 'SIDE';
  } else {
    return 'REAR';
  }
}

/**
 * Get the direction modifier for damage calculation
 * 
 * @param relativeDirection - The relative attack direction (FRONT, SIDE, or REAR)
 * @returns Damage multiplier (1.0 for front, 1.25 for side, 1.5 for rear)
 */
export function getDirectionModifier(
  relativeDirection: keyof typeof DIRECTION_DAMAGE_MULTIPLIERS
): number {
  return DIRECTION_DAMAGE_MULTIPLIERS[relativeDirection];
}

/**
 * Rotate a direction by a specified number of 45-degree increments
 * 
 * @param currentDirection - The current direction
 * @param increments - Number of 45° increments to rotate (positive = clockwise, negative = counter-clockwise)
 * @returns New direction after rotation
 */
export function rotateDirection(currentDirection: Direction, increments: number): Direction {
  const currentAngle = DIRECTION_ANGLES[currentDirection];
  const rotationDegrees = increments * 45;
  let newAngle = currentAngle + rotationDegrees;

  // Normalize to 0-360 range
  newAngle = ((newAngle % 360) + 360) % 360;

  return ANGLE_TO_DIRECTION[newAngle] || currentDirection;
}

/**
 * Rotate a unit to face a specific direction
 * 
 * @param unit - The unit to rotate
 * @param newDirection - The direction to face
 * @returns Updated unit with new facing direction
 */
export function rotateUnitToDirection(unit: Unit, newDirection: Direction): Unit {
  return {
    ...unit,
    direction: newDirection,
  };
}

/**
 * Rotate a unit to face a target position
 * 
 * @param unit - The unit to rotate
 * @param targetPosition - The position to face
 * @returns Updated unit facing the target position
 */
export function rotateUnitToFacePosition(unit: Unit, targetPosition: Vector2): Unit {
  const newDirection = calculateDirectionBetweenPositions(unit.position, targetPosition);
  return rotateUnitToDirection(unit, newDirection);
}

/**
 * Rotate a unit to face another unit
 * 
 * @param unit - The unit to rotate
 * @param target - The target unit to face
 * @returns Updated unit facing the target unit
 */
export function rotateUnitToFaceTarget(unit: Unit, target: Unit): Unit {
  return rotateUnitToFacePosition(unit, target.position);
}

/**
 * Get the opposite direction (180° rotation)
 * 
 * @param direction - The current direction
 * @returns The opposite direction
 */
export function getOppositeDirection(direction: Direction): Direction {
  return rotateDirection(direction, 4); // 4 * 45° = 180°
}

/**
 * Check if two directions are opposite (facing each other)
 * 
 * @param direction1 - First direction
 * @param direction2 - Second direction
 * @returns True if directions are opposite
 */
export function areDirectionsOpposite(direction1: Direction, direction2: Direction): boolean {
  return getOppositeDirection(direction1) === direction2;
}

/**
 * Calculate the angle difference between two directions
 * 
 * @param direction1 - First direction
 * @param direction2 - Second direction
 * @returns Angle difference in degrees (0-180)
 */
export function getAngleDifference(direction1: Direction, direction2: Direction): number {
  const angle1 = DIRECTION_ANGLES[direction1];
  const angle2 = DIRECTION_ANGLES[direction2];
  
  let diff = Math.abs(angle1 - angle2);
  
  // Normalize to 0-180 range
  if (diff > 180) {
    diff = 360 - diff;
  }
  
  return diff;
}

/**
 * Get all adjacent directions (45° away)
 * 
 * @param direction - The current direction
 * @returns Array of two adjacent directions
 */
export function getAdjacentDirections(direction: Direction): [Direction, Direction] {
  const clockwise = rotateDirection(direction, 1);
  const counterClockwise = rotateDirection(direction, -1);
  return [clockwise, counterClockwise];
}

/**
 * Check if a direction is cardinal (N, S, E, W)
 * 
 * @param direction - The direction to check
 * @returns True if direction is cardinal
 */
export function isCardinalDirection(direction: Direction): boolean {
  return [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST].includes(direction);
}

/**
 * Check if a direction is diagonal (NE, SE, SW, NW)
 * 
 * @param direction - The direction to check
 * @returns True if direction is diagonal
 */
export function isDiagonalDirection(direction: Direction): boolean {
  return [
    Direction.NORTHEAST,
    Direction.SOUTHEAST,
    Direction.SOUTHWEST,
    Direction.NORTHWEST,
  ].includes(direction);
}

/**
 * Get the shortest rotation direction to face a target
 * 
 * @param currentDirection - Current facing direction
 * @param targetDirection - Desired facing direction
 * @returns Object with rotation direction ('clockwise' or 'counterclockwise') and number of 45° increments
 */
export function getShortestRotation(
  currentDirection: Direction,
  targetDirection: Direction
): { direction: 'clockwise' | 'counterclockwise'; increments: number } {
  const currentAngle = DIRECTION_ANGLES[currentDirection];
  const targetAngle = DIRECTION_ANGLES[targetDirection];

  // Calculate clockwise and counterclockwise differences
  let clockwiseDiff = targetAngle - currentAngle;
  if (clockwiseDiff < 0) {
    clockwiseDiff += 360;
  }

  let counterClockwiseDiff = currentAngle - targetAngle;
  if (counterClockwiseDiff < 0) {
    counterClockwiseDiff += 360;
  }

  // Choose the shorter rotation
  if (clockwiseDiff <= counterClockwiseDiff) {
    return {
      direction: 'clockwise',
      increments: clockwiseDiff / 45,
    };
  } else {
    return {
      direction: 'counterclockwise',
      increments: counterClockwiseDiff / 45,
    };
  }
}

/**
 * Calculate combat advantage based on positioning
 * Returns a descriptive string and the damage multiplier
 * 
 * @param attackerPosition - Position of the attacker
 * @param defenderPosition - Position of the defender
 * @param defenderFacing - Direction the defender is facing
 * @returns Object with advantage description and multiplier
 */
export function calculateCombatAdvantage(
  attackerPosition: Vector2,
  defenderPosition: Vector2,
  defenderFacing: Direction
): { advantage: string; multiplier: number; description: string } {
  const relativeDirection = getRelativeAttackDirection(
    attackerPosition,
    defenderPosition,
    defenderFacing
  );
  const multiplier = getDirectionModifier(relativeDirection);

  const advantages = {
    FRONT: {
      advantage: 'None',
      description: 'Attacking from the front - no bonus damage',
    },
    SIDE: {
      advantage: 'Flanking',
      description: 'Attacking from the side - 25% bonus damage',
    },
    REAR: {
      advantage: 'Backstab',
      description: 'Attacking from behind - 50% bonus damage',
    },
  };

  return {
    ...advantages[relativeDirection],
    multiplier,
  };
}
