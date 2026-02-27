/**
 * AI Strategy System
 * Implements AI decision-making for unit spawning, targeting, and resource management
 * 
 * Validates Requirements:
 * - 17.1: AI controls enemy units, fortress, and general
 * - 17.2: AI makes tactical decisions based on game state
 * - 17.4: AI spawns units according to strategy
 * - 17.6: AI manages resources and unit production
 */

import { Unit, UnitType, Direction, Vector2 } from '@/types/unit';
import { Resources } from '@/types/resource';
import { Difficulty } from '@/types/game';
import { canAffordUnit } from '@/constants/units';
import { getAIDifficultySettings, type AIDifficultySettings } from './difficulty';

/**
 * AI decision context
 */
export interface AIDecisionContext {
  aiUnits: Unit[];
  playerUnits: Unit[];
  aiResources: Resources;
  difficulty: Difficulty;
  elapsedTime: number;
  fortressPosition: Vector2;
}

/**
 * Unit spawn decision result
 */
export interface SpawnDecision {
  shouldSpawn: boolean;
  unitType?: UnitType;
  position?: Vector2;
  reason?: string;
}

/**
 * Target selection result
 */
export interface TargetDecision {
  targetId: string | null;
  priority: number;
  reason?: string;
}

/**
 * Resource management decision
 */
export interface ResourceDecision {
  shouldSave: boolean;
  targetUnit?: UnitType;
  reason?: string;
}

/**
 * Get AI difficulty settings
 * Re-exported from difficulty module for backward compatibility
 */
export function getAISettings(difficulty: Difficulty): AIDifficultySettings {
  return getAIDifficultySettings(difficulty);
}

// Re-export the type for external use
export type { AIDifficultySettings };

/**
 * Decide if AI should spawn a unit and which type
 * 
 * Implements Requirements 17.4, 17.6
 * 
 * Strategy:
 * - Early game: Focus on economy units (cheap infantry)
 * - Mid game: Balanced army composition
 * - Late game: Counter player's unit composition
 * - Always maintain resource buffer for defense
 * 
 * @param context - Current game state context
 * @returns Spawn decision with unit type and position
 */
export function decideUnitSpawn(context: AIDecisionContext): SpawnDecision {
  const settings = getAISettings(context.difficulty);
  
  // Check if AI has reached unit limit
  if (context.aiUnits.length >= settings.unitLimit) {
    return {
      shouldSpawn: false,
      reason: 'Unit limit reached',
    };
  }
  
  // Analyze player's army composition
  const playerComposition = analyzeArmyComposition(context.playerUnits);
  
  // Determine game phase based on elapsed time
  const gamePhase = getGamePhase(context.elapsedTime);
  
  // Select unit type based on strategy
  let selectedUnitType: UnitType | null = null;
  
  switch (gamePhase) {
    case 'early':
      // Early game: Build cheap infantry for economy
      selectedUnitType = selectEarlyGameUnit(context.aiResources);
      break;
      
    case 'mid':
      // Mid game: Balanced composition
      selectedUnitType = selectBalancedUnit(context.aiUnits, context.aiResources);
      break;
      
    case 'late':
      // Late game: Counter player's composition
      selectedUnitType = selectCounterUnit(playerComposition, context.aiResources);
      break;
  }
  
  if (!selectedUnitType) {
    return {
      shouldSpawn: false,
      reason: 'No suitable unit type found',
    };
  }
  
  // Check if AI can afford the unit
  if (!canAffordUnit(selectedUnitType, context.aiResources)) {
    return {
      shouldSpawn: false,
      reason: `Insufficient resources for ${selectedUnitType}`,
    };
  }
  
  // Determine spawn position (near fortress)
  const spawnPosition = calculateSpawnPosition(context.fortressPosition);
  
  return {
    shouldSpawn: true,
    unitType: selectedUnitType,
    position: spawnPosition,
    reason: `Spawning ${selectedUnitType} in ${gamePhase} game phase`,
  };
}

/**
 * Select the best target for an AI unit to attack
 * 
 * Implements Requirements 17.2, 17.5
 * 
 * Priority system:
 * 1. Nearby low-health enemies (finish them off)
 * 2. High-value targets (siege units, heroes)
 * 3. Units attacking AI fortress
 * 4. Closest enemy units
 * 
 * @param aiUnit - The AI unit looking for a target
 * @param context - Current game state context
 * @returns Target decision with selected target ID
 */
export function selectTarget(aiUnit: Unit, context: AIDecisionContext): TargetDecision {
  const settings = getAISettings(context.difficulty);
  
  if (context.playerUnits.length === 0) {
    return {
      targetId: null,
      priority: 0,
      reason: 'No enemy units available',
    };
  }
  
  let bestTarget: Unit | null = null;
  let bestPriority = -1;
  
  for (const playerUnit of context.playerUnits) {
    // Calculate distance to player unit
    const distance = calculateDistance(aiUnit.position, playerUnit.position);
    
    // Skip units out of range
    if (distance > settings.targetingRange) {
      continue;
    }
    
    // Calculate priority score
    let priority = 0;
    
    // Factor 1: Low health targets (finish them off)
    const healthPercent = playerUnit.health / playerUnit.maxHealth;
    if (healthPercent < 0.3) {
      priority += 50;
    } else if (healthPercent < 0.5) {
      priority += 25;
    }
    
    // Factor 2: High-value unit types
    if (playerUnit.type === UnitType.SIEGE) {
      priority += 40; // Siege units are dangerous to buildings
    } else if (playerUnit.type === UnitType.CAVALRY) {
      priority += 20; // Cavalry can flank quickly
    }
    
    // Factor 3: Distance (closer is better)
    const distancePenalty = distance / 10;
    priority -= distancePenalty;
    
    // Factor 4: Units near fortress (defend home)
    const distanceToFortress = calculateDistance(playerUnit.position, context.fortressPosition);
    if (distanceToFortress < 200) {
      priority += 30;
    }
    
    // Factor 5: Aggressiveness modifier
    priority *= settings.aggressiveness;
    
    // Update best target
    if (priority > bestPriority) {
      bestPriority = priority;
      bestTarget = playerUnit;
    }
  }
  
  if (!bestTarget) {
    return {
      targetId: null,
      priority: 0,
      reason: 'No suitable target in range',
    };
  }
  
  return {
    targetId: bestTarget.id,
    priority: bestPriority,
    reason: `Targeting ${bestTarget.type} at distance ${calculateDistance(aiUnit.position, bestTarget.position).toFixed(0)}`,
  };
}

/**
 * Manage AI resources and decide on spending strategy
 * 
 * Implements Requirement 17.6
 * 
 * Strategy:
 * - Maintain resource buffer for emergency defense
 * - Prioritize unit production when under attack
 * - Save for expensive units when ahead
 * 
 * @param context - Current game state context
 * @returns Resource management decision
 */
export function manageResources(context: AIDecisionContext): ResourceDecision {
  // Calculate resource buffer (minimum to keep)
  const foodBuffer = 100;
  const goldBuffer = 75;
  
  // Check if AI is under attack (player units near fortress)
  const isUnderAttack = context.playerUnits.some(
    (unit) => calculateDistance(unit.position, context.fortressPosition) < 250
  );
  
  // If under attack, spend resources on defense
  if (isUnderAttack) {
    return {
      shouldSave: false,
      targetUnit: UnitType.INFANTRY, // Quick defensive units
      reason: 'Under attack, prioritizing defense',
    };
  }
  
  // Check if AI has enough resources for expensive units
  const canAffordCavalry = canAffordUnit(UnitType.CAVALRY, context.aiResources);
  const canAffordSiege = canAffordUnit(UnitType.SIEGE, context.aiResources);
  
  // If AI has strong economy, save for powerful units
  if (context.aiResources.food > foodBuffer + 200 && context.aiResources.gold > goldBuffer + 150) {
    if (canAffordSiege) {
      return {
        shouldSave: false,
        targetUnit: UnitType.SIEGE,
        reason: 'Strong economy, building siege units',
      };
    }
    
    if (canAffordCavalry) {
      return {
        shouldSave: false,
        targetUnit: UnitType.CAVALRY,
        reason: 'Strong economy, building cavalry',
      };
    }
  }
  
  // Default: maintain buffer and build when possible
  const hasBuffer = 
    context.aiResources.food > foodBuffer && 
    context.aiResources.gold > goldBuffer;
  
  if (!hasBuffer) {
    return {
      shouldSave: true,
      reason: 'Building resource buffer',
    };
  }
  
  return {
    shouldSave: false,
    targetUnit: UnitType.INFANTRY,
    reason: 'Normal production',
  };
}

/**
 * Analyze army composition to determine unit type distribution
 */
function analyzeArmyComposition(units: Unit[]): Record<UnitType, number> {
  const composition: Record<UnitType, number> = {
    [UnitType.INFANTRY]: 0,
    [UnitType.CAVALRY]: 0,
    [UnitType.ARCHER]: 0,
    [UnitType.SIEGE]: 0,
  };
  
  for (const unit of units) {
    composition[unit.type]++;
  }
  
  return composition;
}

/**
 * Determine game phase based on elapsed time
 */
function getGamePhase(elapsedTime: number): 'early' | 'mid' | 'late' {
  if (elapsedTime < 180) { // 0-3 minutes
    return 'early';
  } else if (elapsedTime < 420) { // 3-7 minutes
    return 'mid';
  } else {
    return 'late';
  }
}

/**
 * Select unit type for early game (focus on economy)
 */
function selectEarlyGameUnit(resources: Resources): UnitType | null {
  // Early game: Build cheap infantry
  if (canAffordUnit(UnitType.INFANTRY, resources)) {
    return UnitType.INFANTRY;
  }
  
  return null;
}

/**
 * Select unit type for balanced army composition
 */
function selectBalancedUnit(currentUnits: Unit[], resources: Resources): UnitType | null {
  const composition = analyzeArmyComposition(currentUnits);
  const totalUnits = currentUnits.length;
  
  // Target composition: 40% infantry, 30% archers, 20% cavalry, 10% siege
  const targetRatios = {
    [UnitType.INFANTRY]: 0.4,
    [UnitType.ARCHER]: 0.3,
    [UnitType.CAVALRY]: 0.2,
    [UnitType.SIEGE]: 0.1,
  };
  
  // Find unit type most below target ratio
  let mostNeeded: UnitType | null = null;
  let largestDeficit = -1;
  
  for (const unitType of Object.values(UnitType)) {
    const currentRatio = totalUnits > 0 ? composition[unitType] / totalUnits : 0;
    const targetRatio = targetRatios[unitType];
    const deficit = targetRatio - currentRatio;
    
    if (deficit > largestDeficit && canAffordUnit(unitType, resources)) {
      largestDeficit = deficit;
      mostNeeded = unitType;
    }
  }
  
  return mostNeeded;
}

/**
 * Select unit type to counter player's composition
 */
function selectCounterUnit(
  playerComposition: Record<UnitType, number>,
  resources: Resources
): UnitType | null {
  // Find player's most common unit type
  let dominantType: UnitType = UnitType.INFANTRY;
  let maxCount = 0;
  
  for (const [type, count] of Object.entries(playerComposition)) {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type as UnitType;
    }
  }
  
  // Counter strategy:
  // Infantry > Archer, so counter infantry with cavalry
  // Archer > Cavalry, so counter archers with infantry
  // Cavalry > Infantry, so counter cavalry with archers
  // Siege is vulnerable to all, prioritize if player has siege
  
  const counterMap: Record<UnitType, UnitType> = {
    [UnitType.INFANTRY]: UnitType.CAVALRY,
    [UnitType.CAVALRY]: UnitType.ARCHER,
    [UnitType.ARCHER]: UnitType.INFANTRY,
    [UnitType.SIEGE]: UnitType.CAVALRY, // Fast units to reach siege
  };
  
  const counterType = counterMap[dominantType];
  
  if (canAffordUnit(counterType, resources)) {
    return counterType;
  }
  
  // Fallback: build any affordable unit
  for (const unitType of Object.values(UnitType)) {
    if (canAffordUnit(unitType, resources)) {
      return unitType;
    }
  }
  
  return null;
}

/**
 * Calculate spawn position near fortress with some randomness
 */
function calculateSpawnPosition(fortressPosition: Vector2): Vector2 {
  const angle = Math.random() * Math.PI * 2;
  const distance = 50 + Math.random() * 30; // 50-80 units from fortress
  
  return {
    x: fortressPosition.x + Math.cos(angle) * distance,
    y: fortressPosition.y + Math.sin(angle) * distance,
  };
}

/**
 * Calculate Euclidean distance between two positions
 */
function calculateDistance(pos1: Vector2, pos2: Vector2): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get direction from one position to another
 */
export function getDirectionToTarget(from: Vector2, to: Vector2): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Calculate angle in radians
  const angle = Math.atan2(dy, dx);
  
  // Convert to degrees (0-360)
  let degrees = (angle * 180) / Math.PI;
  if (degrees < 0) {
    degrees += 360;
  }
  
  // Map to 8 directions
  if (degrees >= 337.5 || degrees < 22.5) {
    return Direction.EAST;
  } else if (degrees >= 22.5 && degrees < 67.5) {
    return Direction.SOUTHEAST;
  } else if (degrees >= 67.5 && degrees < 112.5) {
    return Direction.SOUTH;
  } else if (degrees >= 112.5 && degrees < 157.5) {
    return Direction.SOUTHWEST;
  } else if (degrees >= 157.5 && degrees < 202.5) {
    return Direction.WEST;
  } else if (degrees >= 202.5 && degrees < 247.5) {
    return Direction.NORTHWEST;
  } else if (degrees >= 247.5 && degrees < 292.5) {
    return Direction.NORTH;
  } else {
    return Direction.NORTHEAST;
  }
}

/**
 * Calculate optimal attack position for flanking
 * 
 * @param _attacker - The attacking unit (reserved for future use)
 * @param target - The target unit
 * @returns Optimal position to attack from (for rear/side attacks)
 */
export function calculateFlankPosition(_attacker: Unit, target: Unit): Vector2 {
  // Try to position behind the target for rear attack bonus
  const targetDirection = target.direction;
  
  // Map direction to angle
  const directionAngles: Record<Direction, number> = {
    [Direction.NORTH]: 270,
    [Direction.NORTHEAST]: 315,
    [Direction.EAST]: 0,
    [Direction.SOUTHEAST]: 45,
    [Direction.SOUTH]: 90,
    [Direction.SOUTHWEST]: 135,
    [Direction.WEST]: 180,
    [Direction.NORTHWEST]: 225,
  };
  
  // Get angle target is facing
  const targetAngle = directionAngles[targetDirection];
  
  // Position behind target (opposite direction)
  const behindAngle = (targetAngle + 180) % 360;
  const radians = (behindAngle * Math.PI) / 180;
  
  // Calculate position 30 units behind target
  const distance = 30;
  
  return {
    x: target.position.x + Math.cos(radians) * distance,
    y: target.position.y + Math.sin(radians) * distance,
  };
}
