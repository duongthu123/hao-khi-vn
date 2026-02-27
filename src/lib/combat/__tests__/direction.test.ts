/**
 * Unit tests for direction-based combat mechanics
 * Tests direction calculation, rotation, and combat advantage calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDirectionBetweenPositions,
  calculateAttackDirection,
  getRelativeAttackDirection,
  getDirectionModifier,
  rotateDirection,
  rotateUnitToDirection,
  rotateUnitToFacePosition,
  rotateUnitToFaceTarget,
  getOppositeDirection,
  areDirectionsOpposite,
  getAngleDifference,
  getAdjacentDirections,
  isCardinalDirection,
  isDiagonalDirection,
  getShortestRotation,
  calculateCombatAdvantage,
  DIRECTION_ANGLES,
} from '../direction';
import { Direction, Unit, UnitType, UnitOwner } from '@/types/unit';

// Helper function to create a test unit
function createTestUnit(
  id: string,
  position: { x: number; y: number },
  direction: Direction = Direction.NORTH
): Unit {
  return {
    id,
    type: UnitType.INFANTRY,
    faction: 'vietnamese',
    position,
    health: 100,
    maxHealth: 100,
    attack: 40,
    defense: 30,
    speed: 30,
    direction,
    status: [],
    owner: UnitOwner.PLAYER,
  };
}

describe('Direction Angles', () => {
  it('should have correct angle mappings', () => {
    expect(DIRECTION_ANGLES[Direction.NORTH]).toBe(0);
    expect(DIRECTION_ANGLES[Direction.NORTHEAST]).toBe(45);
    expect(DIRECTION_ANGLES[Direction.EAST]).toBe(90);
    expect(DIRECTION_ANGLES[Direction.SOUTHEAST]).toBe(135);
    expect(DIRECTION_ANGLES[Direction.SOUTH]).toBe(180);
    expect(DIRECTION_ANGLES[Direction.SOUTHWEST]).toBe(225);
    expect(DIRECTION_ANGLES[Direction.WEST]).toBe(270);
    expect(DIRECTION_ANGLES[Direction.NORTHWEST]).toBe(315);
  });
});

describe('calculateDirectionBetweenPositions', () => {
  it('should calculate north direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 0, y: -10 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.NORTH);
  });

  it('should calculate south direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 0, y: 10 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.SOUTH);
  });

  it('should calculate east direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 10, y: 0 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.EAST);
  });

  it('should calculate west direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: -10, y: 0 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.WEST);
  });

  it('should calculate northeast direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 10, y: -10 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.NORTHEAST);
  });

  it('should calculate southeast direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 10, y: 10 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.SOUTHEAST);
  });

  it('should calculate southwest direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: -10, y: 10 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.SOUTHWEST);
  });

  it('should calculate northwest direction', () => {
    const from = { x: 0, y: 0 };
    const to = { x: -10, y: -10 };
    expect(calculateDirectionBetweenPositions(from, to)).toBe(Direction.NORTHWEST);
  });

  it('should return north for same position', () => {
    const pos = { x: 5, y: 5 };
    expect(calculateDirectionBetweenPositions(pos, pos)).toBe(Direction.NORTH);
  });
});

describe('calculateAttackDirection', () => {
  it('should calculate direction from attacker to defender', () => {
    const attacker = createTestUnit('attacker', { x: 0, y: 0 });
    const defender = createTestUnit('defender', { x: 10, y: 0 });
    
    expect(calculateAttackDirection(attacker, defender)).toBe(Direction.EAST);
  });

  it('should work with different positions', () => {
    const attacker = createTestUnit('attacker', { x: 5, y: 5 });
    const defender = createTestUnit('defender', { x: 5, y: 0 });
    
    expect(calculateAttackDirection(attacker, defender)).toBe(Direction.NORTH);
  });
});

describe('getRelativeAttackDirection', () => {
  it('should return FRONT when attacker is in front of defender', () => {
    const attackerPos = { x: 0, y: -10 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTH;
    
    expect(getRelativeAttackDirection(attackerPos, defenderPos, defenderFacing)).toBe('FRONT');
  });

  it('should return REAR when attacker is behind defender', () => {
    const attackerPos = { x: 0, y: 10 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTH;
    
    expect(getRelativeAttackDirection(attackerPos, defenderPos, defenderFacing)).toBe('REAR');
  });

  it('should return SIDE when attacker is to the side', () => {
    const attackerPos = { x: 10, y: 0 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTH;
    
    expect(getRelativeAttackDirection(attackerPos, defenderPos, defenderFacing)).toBe('SIDE');
  });

  it('should handle diagonal facing correctly', () => {
    const attackerPos = { x: 10, y: 0 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTHEAST;
    
    const result = getRelativeAttackDirection(attackerPos, defenderPos, defenderFacing);
    expect(['FRONT', 'SIDE']).toContain(result);
  });
});

describe('getDirectionModifier', () => {
  it('should return 1.0 for front attacks', () => {
    expect(getDirectionModifier('FRONT')).toBe(1.0);
  });

  it('should return 1.25 for side attacks', () => {
    expect(getDirectionModifier('SIDE')).toBe(1.25);
  });

  it('should return 1.5 for rear attacks', () => {
    expect(getDirectionModifier('REAR')).toBe(1.5);
  });
});

describe('rotateDirection', () => {
  it('should rotate clockwise by one increment', () => {
    expect(rotateDirection(Direction.NORTH, 1)).toBe(Direction.NORTHEAST);
    expect(rotateDirection(Direction.NORTHEAST, 1)).toBe(Direction.EAST);
    expect(rotateDirection(Direction.EAST, 1)).toBe(Direction.SOUTHEAST);
  });

  it('should rotate counter-clockwise by one increment', () => {
    expect(rotateDirection(Direction.NORTH, -1)).toBe(Direction.NORTHWEST);
    expect(rotateDirection(Direction.NORTHWEST, -1)).toBe(Direction.WEST);
    expect(rotateDirection(Direction.WEST, -1)).toBe(Direction.SOUTHWEST);
  });

  it('should handle full rotation', () => {
    expect(rotateDirection(Direction.NORTH, 8)).toBe(Direction.NORTH);
    expect(rotateDirection(Direction.EAST, 8)).toBe(Direction.EAST);
  });

  it('should handle negative full rotation', () => {
    expect(rotateDirection(Direction.NORTH, -8)).toBe(Direction.NORTH);
    expect(rotateDirection(Direction.SOUTH, -8)).toBe(Direction.SOUTH);
  });

  it('should rotate 180 degrees', () => {
    expect(rotateDirection(Direction.NORTH, 4)).toBe(Direction.SOUTH);
    expect(rotateDirection(Direction.EAST, 4)).toBe(Direction.WEST);
  });
});

describe('rotateUnitToDirection', () => {
  it('should update unit direction', () => {
    const unit = createTestUnit('unit1', { x: 0, y: 0 }, Direction.NORTH);
    const rotated = rotateUnitToDirection(unit, Direction.EAST);
    
    expect(rotated.direction).toBe(Direction.EAST);
    expect(rotated.id).toBe(unit.id);
    expect(rotated.position).toEqual(unit.position);
  });

  it('should not mutate original unit', () => {
    const unit = createTestUnit('unit1', { x: 0, y: 0 }, Direction.NORTH);
    const rotated = rotateUnitToDirection(unit, Direction.SOUTH);
    
    expect(unit.direction).toBe(Direction.NORTH);
    expect(rotated.direction).toBe(Direction.SOUTH);
  });
});

describe('rotateUnitToFacePosition', () => {
  it('should rotate unit to face target position', () => {
    const unit = createTestUnit('unit1', { x: 0, y: 0 }, Direction.NORTH);
    const targetPos = { x: 10, y: 0 };
    const rotated = rotateUnitToFacePosition(unit, targetPos);
    
    expect(rotated.direction).toBe(Direction.EAST);
  });

  it('should handle different target positions', () => {
    const unit = createTestUnit('unit1', { x: 5, y: 5 }, Direction.NORTH);
    const targetPos = { x: 5, y: 10 };
    const rotated = rotateUnitToFacePosition(unit, targetPos);
    
    expect(rotated.direction).toBe(Direction.SOUTH);
  });
});

describe('rotateUnitToFaceTarget', () => {
  it('should rotate unit to face another unit', () => {
    const unit = createTestUnit('unit1', { x: 0, y: 0 }, Direction.NORTH);
    const target = createTestUnit('unit2', { x: 0, y: 10 }, Direction.NORTH);
    const rotated = rotateUnitToFaceTarget(unit, target);
    
    expect(rotated.direction).toBe(Direction.SOUTH);
  });
});

describe('getOppositeDirection', () => {
  it('should return opposite directions', () => {
    expect(getOppositeDirection(Direction.NORTH)).toBe(Direction.SOUTH);
    expect(getOppositeDirection(Direction.SOUTH)).toBe(Direction.NORTH);
    expect(getOppositeDirection(Direction.EAST)).toBe(Direction.WEST);
    expect(getOppositeDirection(Direction.WEST)).toBe(Direction.EAST);
    expect(getOppositeDirection(Direction.NORTHEAST)).toBe(Direction.SOUTHWEST);
    expect(getOppositeDirection(Direction.SOUTHWEST)).toBe(Direction.NORTHEAST);
    expect(getOppositeDirection(Direction.NORTHWEST)).toBe(Direction.SOUTHEAST);
    expect(getOppositeDirection(Direction.SOUTHEAST)).toBe(Direction.NORTHWEST);
  });
});

describe('areDirectionsOpposite', () => {
  it('should return true for opposite directions', () => {
    expect(areDirectionsOpposite(Direction.NORTH, Direction.SOUTH)).toBe(true);
    expect(areDirectionsOpposite(Direction.EAST, Direction.WEST)).toBe(true);
    expect(areDirectionsOpposite(Direction.NORTHEAST, Direction.SOUTHWEST)).toBe(true);
  });

  it('should return false for non-opposite directions', () => {
    expect(areDirectionsOpposite(Direction.NORTH, Direction.EAST)).toBe(false);
    expect(areDirectionsOpposite(Direction.NORTH, Direction.NORTH)).toBe(false);
    expect(areDirectionsOpposite(Direction.NORTHEAST, Direction.EAST)).toBe(false);
  });
});

describe('getAngleDifference', () => {
  it('should calculate angle difference correctly', () => {
    expect(getAngleDifference(Direction.NORTH, Direction.NORTH)).toBe(0);
    expect(getAngleDifference(Direction.NORTH, Direction.NORTHEAST)).toBe(45);
    expect(getAngleDifference(Direction.NORTH, Direction.EAST)).toBe(90);
    expect(getAngleDifference(Direction.NORTH, Direction.SOUTH)).toBe(180);
  });

  it('should normalize to 0-180 range', () => {
    expect(getAngleDifference(Direction.NORTH, Direction.WEST)).toBe(90);
    expect(getAngleDifference(Direction.EAST, Direction.WEST)).toBe(180);
  });
});

describe('getAdjacentDirections', () => {
  it('should return adjacent directions', () => {
    const [cw, ccw] = getAdjacentDirections(Direction.NORTH);
    expect(cw).toBe(Direction.NORTHEAST);
    expect(ccw).toBe(Direction.NORTHWEST);
  });

  it('should handle wrap-around', () => {
    const [cw, ccw] = getAdjacentDirections(Direction.NORTHWEST);
    expect(cw).toBe(Direction.NORTH);
    expect(ccw).toBe(Direction.WEST);
  });
});

describe('isCardinalDirection', () => {
  it('should return true for cardinal directions', () => {
    expect(isCardinalDirection(Direction.NORTH)).toBe(true);
    expect(isCardinalDirection(Direction.SOUTH)).toBe(true);
    expect(isCardinalDirection(Direction.EAST)).toBe(true);
    expect(isCardinalDirection(Direction.WEST)).toBe(true);
  });

  it('should return false for diagonal directions', () => {
    expect(isCardinalDirection(Direction.NORTHEAST)).toBe(false);
    expect(isCardinalDirection(Direction.SOUTHEAST)).toBe(false);
    expect(isCardinalDirection(Direction.SOUTHWEST)).toBe(false);
    expect(isCardinalDirection(Direction.NORTHWEST)).toBe(false);
  });
});

describe('isDiagonalDirection', () => {
  it('should return true for diagonal directions', () => {
    expect(isDiagonalDirection(Direction.NORTHEAST)).toBe(true);
    expect(isDiagonalDirection(Direction.SOUTHEAST)).toBe(true);
    expect(isDiagonalDirection(Direction.SOUTHWEST)).toBe(true);
    expect(isDiagonalDirection(Direction.NORTHWEST)).toBe(true);
  });

  it('should return false for cardinal directions', () => {
    expect(isDiagonalDirection(Direction.NORTH)).toBe(false);
    expect(isDiagonalDirection(Direction.SOUTH)).toBe(false);
    expect(isDiagonalDirection(Direction.EAST)).toBe(false);
    expect(isDiagonalDirection(Direction.WEST)).toBe(false);
  });
});

describe('getShortestRotation', () => {
  it('should find shortest clockwise rotation', () => {
    const result = getShortestRotation(Direction.NORTH, Direction.EAST);
    expect(result.direction).toBe('clockwise');
    expect(result.increments).toBe(2);
  });

  it('should find shortest counter-clockwise rotation', () => {
    const result = getShortestRotation(Direction.NORTH, Direction.WEST);
    expect(result.direction).toBe('counterclockwise');
    expect(result.increments).toBe(2);
  });

  it('should handle 180-degree rotation', () => {
    const result = getShortestRotation(Direction.NORTH, Direction.SOUTH);
    expect(result.increments).toBe(4);
  });

  it('should handle no rotation needed', () => {
    const result = getShortestRotation(Direction.EAST, Direction.EAST);
    expect(result.increments).toBe(0);
  });
});

describe('calculateCombatAdvantage', () => {
  it('should calculate front attack advantage', () => {
    const attackerPos = { x: 0, y: -10 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTH;
    
    const result = calculateCombatAdvantage(attackerPos, defenderPos, defenderFacing);
    expect(result.advantage).toBe('None');
    expect(result.multiplier).toBe(1.0);
    expect(result.description).toContain('front');
  });

  it('should calculate side attack advantage', () => {
    const attackerPos = { x: 10, y: 0 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTH;
    
    const result = calculateCombatAdvantage(attackerPos, defenderPos, defenderFacing);
    expect(result.advantage).toBe('Flanking');
    expect(result.multiplier).toBe(1.25);
    expect(result.description).toContain('25%');
  });

  it('should calculate rear attack advantage', () => {
    const attackerPos = { x: 0, y: 10 };
    const defenderPos = { x: 0, y: 0 };
    const defenderFacing = Direction.NORTH;
    
    const result = calculateCombatAdvantage(attackerPos, defenderPos, defenderFacing);
    expect(result.advantage).toBe('Backstab');
    expect(result.multiplier).toBe(1.5);
    expect(result.description).toContain('50%');
  });
});

describe('Integration: Combat Scenarios', () => {
  it('should handle complete combat positioning scenario', () => {
    // Attacker approaches from behind
    const attacker = createTestUnit('attacker', { x: 0, y: 10 }, Direction.NORTH);
    const defender = createTestUnit('defender', { x: 0, y: 0 }, Direction.NORTH);
    
    // Calculate attack direction
    const attackDir = calculateAttackDirection(attacker, defender);
    expect(attackDir).toBe(Direction.NORTH);
    
    // Calculate relative direction
    const relativeDir = getRelativeAttackDirection(
      attacker.position,
      defender.position,
      defender.direction
    );
    expect(relativeDir).toBe('REAR');
    
    // Get damage modifier
    const modifier = getDirectionModifier(relativeDir);
    expect(modifier).toBe(1.5);
  });

  it('should handle unit rotation before attack', () => {
    const attacker = createTestUnit('attacker', { x: 0, y: 0 }, Direction.SOUTH);
    const defender = createTestUnit('defender', { x: 10, y: 0 }, Direction.NORTH);
    
    // Rotate attacker to face defender
    const rotatedAttacker = rotateUnitToFaceTarget(attacker, defender);
    expect(rotatedAttacker.direction).toBe(Direction.EAST);
    
    // Now calculate combat advantage
    // Attacker is to the EAST, defender facing NORTH
    // This is a SIDE attack (90 degree angle)
    const advantage = calculateCombatAdvantage(
      rotatedAttacker.position,
      defender.position,
      defender.direction
    );
    expect(advantage.advantage).toBe('Flanking');
  });
});
