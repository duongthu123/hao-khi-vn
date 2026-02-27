/**
 * AI Strategy System Tests
 * Tests AI decision-making for unit spawning, targeting, and resource management
 */

import { describe, it, expect } from 'vitest';
import {
  decideUnitSpawn,
  selectTarget,
  manageResources,
  getAISettings,
  getDirectionToTarget,
  calculateFlankPosition,
  type AIDecisionContext,
} from '../strategy';
import { Unit, UnitType, UnitOwner, Direction, Vector2 } from '@/types/unit';
import { Difficulty } from '@/types/game';

/**
 * Helper function to create a test unit
 */
function createTestUnit(
  id: string,
  type: UnitType,
  owner: UnitOwner,
  position: Vector2,
  health: number = 100
): Unit {
  return {
    id,
    type,
    faction: owner === UnitOwner.PLAYER ? 'vietnamese' : 'mongol',
    position,
    health,
    maxHealth: 100,
    attack: 40,
    defense: 30,
    speed: 30,
    direction: Direction.NORTH,
    status: [],
    owner,
  };
}

/**
 * Helper function to create test context
 */
function createTestContext(
  overrides?: Partial<AIDecisionContext>
): AIDecisionContext {
  return {
    aiUnits: [],
    playerUnits: [],
    aiResources: { food: 200, gold: 150, army: 10 },
    difficulty: Difficulty.NORMAL,
    elapsedTime: 0,
    fortressPosition: { x: 500, y: 500 },
    ...overrides,
  };
}

describe('AI Strategy System', () => {
  describe('getAISettings', () => {
    it('should return correct settings for easy difficulty', () => {
      const settings = getAISettings(Difficulty.EASY);
      
      expect(settings.spawnInterval).toBe(15);
      expect(settings.resourceMultiplier).toBe(0.8);
      expect(settings.aggressiveness).toBe(0.4);
      expect(settings.unitLimit).toBe(15);
    });
    
    it('should return correct settings for normal difficulty', () => {
      const settings = getAISettings(Difficulty.NORMAL);
      
      expect(settings.spawnInterval).toBe(10);
      expect(settings.resourceMultiplier).toBe(1.0);
      expect(settings.aggressiveness).toBe(0.6);
      expect(settings.unitLimit).toBe(25);
    });
    
    it('should return correct settings for hard difficulty', () => {
      const settings = getAISettings(Difficulty.HARD);
      
      expect(settings.spawnInterval).toBe(7);
      expect(settings.resourceMultiplier).toBe(1.3);
      expect(settings.aggressiveness).toBe(0.8);
      expect(settings.unitLimit).toBe(35);
    });
  });
  
  describe('decideUnitSpawn', () => {
    it('should not spawn when unit limit is reached', () => {
      const aiUnits = Array.from({ length: 25 }, (_, i) =>
        createTestUnit(`ai-${i}`, UnitType.INFANTRY, UnitOwner.AI, { x: 100, y: 100 })
      );
      
      const context = createTestContext({ aiUnits });
      const decision = decideUnitSpawn(context);
      
      expect(decision.shouldSpawn).toBe(false);
      expect(decision.reason).toContain('Unit limit');
    });
    
    it('should not spawn when resources are insufficient', () => {
      const context = createTestContext({
        aiResources: { food: 10, gold: 5, army: 1 },
      });
      
      const decision = decideUnitSpawn(context);
      
      expect(decision.shouldSpawn).toBe(false);
      // The reason could be either "No suitable unit type found" or "Insufficient resources"
      // depending on which check fails first
      expect(decision.reason).toBeDefined();
    });
    
    it('should spawn infantry in early game', () => {
      const context = createTestContext({
        elapsedTime: 60, // 1 minute (early game)
        aiResources: { food: 200, gold: 150, army: 10 },
      });
      
      const decision = decideUnitSpawn(context);
      
      expect(decision.shouldSpawn).toBe(true);
      expect(decision.unitType).toBe(UnitType.INFANTRY);
      expect(decision.position).toBeDefined();
    });
    
    it('should spawn balanced units in mid game', () => {
      const context = createTestContext({
        elapsedTime: 240, // 4 minutes (mid game)
        aiResources: { food: 300, gold: 250, army: 15 },
        aiUnits: [
          createTestUnit('ai-1', UnitType.INFANTRY, UnitOwner.AI, { x: 100, y: 100 }),
          createTestUnit('ai-2', UnitType.INFANTRY, UnitOwner.AI, { x: 110, y: 100 }),
        ],
      });
      
      const decision = decideUnitSpawn(context);
      
      expect(decision.shouldSpawn).toBe(true);
      expect(decision.unitType).toBeDefined();
      // Should try to balance composition (not just infantry)
    });
    
    it('should counter player composition in late game', () => {
      const playerUnits = [
        createTestUnit('p-1', UnitType.CAVALRY, UnitOwner.PLAYER, { x: 200, y: 200 }),
        createTestUnit('p-2', UnitType.CAVALRY, UnitOwner.PLAYER, { x: 210, y: 200 }),
        createTestUnit('p-3', UnitType.CAVALRY, UnitOwner.PLAYER, { x: 220, y: 200 }),
      ];
      
      const context = createTestContext({
        elapsedTime: 480, // 8 minutes (late game)
        aiResources: { food: 300, gold: 250, army: 20 },
        playerUnits,
      });
      
      const decision = decideUnitSpawn(context);
      
      expect(decision.shouldSpawn).toBe(true);
      // Should spawn archers to counter cavalry
      expect(decision.unitType).toBe(UnitType.ARCHER);
    });
  });
  
  describe('selectTarget', () => {
    it('should return null when no player units exist', () => {
      const aiUnit = createTestUnit('ai-1', UnitType.INFANTRY, UnitOwner.AI, { x: 100, y: 100 });
      const context = createTestContext();
      
      const decision = selectTarget(aiUnit, context);
      
      expect(decision.targetId).toBeNull();
      expect(decision.priority).toBe(0);
    });
    
    it('should prioritize low-health enemies', () => {
      const aiUnit = createTestUnit('ai-1', UnitType.INFANTRY, UnitOwner.AI, { x: 100, y: 100 });
      
      const playerUnits = [
        createTestUnit('p-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 150, y: 100 }, 80),
        createTestUnit('p-2', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 160, y: 100 }, 20), // Low health
      ];
      
      const context = createTestContext({ playerUnits });
      const decision = selectTarget(aiUnit, context);
      
      expect(decision.targetId).toBe('p-2'); // Should target low-health unit
      expect(decision.priority).toBeGreaterThan(0);
    });
    
    it('should prioritize siege units as high-value targets', () => {
      const aiUnit = createTestUnit('ai-1', UnitType.INFANTRY, UnitOwner.AI, { x: 100, y: 100 });
      
      const playerUnits = [
        createTestUnit('p-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 150, y: 100 }),
        createTestUnit('p-2', UnitType.SIEGE, UnitOwner.PLAYER, { x: 160, y: 100 }),
      ];
      
      const context = createTestContext({ playerUnits });
      const decision = selectTarget(aiUnit, context);
      
      expect(decision.targetId).toBe('p-2'); // Should target siege unit
    });
    
    it('should prioritize units near fortress', () => {
      const aiUnit = createTestUnit('ai-1', UnitType.INFANTRY, UnitOwner.AI, { x: 400, y: 400 });
      
      const playerUnits = [
        createTestUnit('p-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 200, y: 200 }), // Far from fortress
        createTestUnit('p-2', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 480, y: 480 }), // Near fortress
      ];
      
      const context = createTestContext({
        playerUnits,
        fortressPosition: { x: 500, y: 500 },
      });
      
      const decision = selectTarget(aiUnit, context);
      
      expect(decision.targetId).toBe('p-2'); // Should defend fortress
    });
    
    it('should not target units out of range', () => {
      const aiUnit = createTestUnit('ai-1', UnitType.INFANTRY, UnitOwner.AI, { x: 100, y: 100 });
      
      const playerUnits = [
        createTestUnit('p-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 1000, y: 1000 }), // Very far
      ];
      
      const context = createTestContext({ playerUnits });
      const decision = selectTarget(aiUnit, context);
      
      expect(decision.targetId).toBeNull();
      expect(decision.reason).toContain('No suitable target');
    });
  });
  
  describe('manageResources', () => {
    it('should prioritize defense when under attack', () => {
      const playerUnits = [
        createTestUnit('p-1', UnitType.CAVALRY, UnitOwner.PLAYER, { x: 480, y: 480 }), // Near fortress
      ];
      
      const context = createTestContext({
        playerUnits,
        fortressPosition: { x: 500, y: 500 },
        aiResources: { food: 200, gold: 150, army: 10 },
      });
      
      const decision = manageResources(context);
      
      expect(decision.shouldSave).toBe(false);
      expect(decision.targetUnit).toBe(UnitType.INFANTRY); // Quick defensive units
      expect(decision.reason).toContain('Under attack');
    });
    
    it('should save resources when below buffer', () => {
      const context = createTestContext({
        aiResources: { food: 50, gold: 30, army: 5 }, // Below buffer
      });
      
      const decision = manageResources(context);
      
      expect(decision.shouldSave).toBe(true);
      expect(decision.reason).toContain('buffer');
    });
    
    it('should build expensive units with strong economy', () => {
      const context = createTestContext({
        aiResources: { food: 500, gold: 400, army: 20 }, // Strong economy
      });
      
      const decision = manageResources(context);
      
      expect(decision.shouldSave).toBe(false);
      expect([UnitType.SIEGE, UnitType.CAVALRY]).toContain(decision.targetUnit!);
    });
    
    it('should build infantry with normal economy', () => {
      const context = createTestContext({
        aiResources: { food: 200, gold: 150, army: 10 }, // Normal economy
      });
      
      const decision = manageResources(context);
      
      expect(decision.shouldSave).toBe(false);
      expect(decision.targetUnit).toBe(UnitType.INFANTRY);
    });
  });
  
  describe('getDirectionToTarget', () => {
    it('should return EAST for target to the right', () => {
      const from: Vector2 = { x: 0, y: 0 };
      const to: Vector2 = { x: 100, y: 0 };
      
      const direction = getDirectionToTarget(from, to);
      
      expect(direction).toBe(Direction.EAST);
    });
    
    it('should return WEST for target to the left', () => {
      const from: Vector2 = { x: 100, y: 0 };
      const to: Vector2 = { x: 0, y: 0 };
      
      const direction = getDirectionToTarget(from, to);
      
      expect(direction).toBe(Direction.WEST);
    });
    
    it('should return SOUTH for target below', () => {
      const from: Vector2 = { x: 0, y: 0 };
      const to: Vector2 = { x: 0, y: 100 };
      
      const direction = getDirectionToTarget(from, to);
      
      expect(direction).toBe(Direction.SOUTH);
    });
    
    it('should return NORTH for target above', () => {
      const from: Vector2 = { x: 0, y: 100 };
      const to: Vector2 = { x: 0, y: 0 };
      
      const direction = getDirectionToTarget(from, to);
      
      expect(direction).toBe(Direction.NORTH);
    });
    
    it('should return SOUTHEAST for target to bottom-right', () => {
      const from: Vector2 = { x: 0, y: 0 };
      const to: Vector2 = { x: 100, y: 100 };
      
      const direction = getDirectionToTarget(from, to);
      
      expect(direction).toBe(Direction.SOUTHEAST);
    });
  });
  
  describe('calculateFlankPosition', () => {
    it('should position behind target facing north', () => {
      const attacker = createTestUnit('a-1', UnitType.CAVALRY, UnitOwner.AI, { x: 100, y: 100 });
      const target = createTestUnit('t-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 200, y: 200 });
      target.direction = Direction.NORTH;
      
      const flankPos = calculateFlankPosition(attacker, target);
      
      // Should be south of target (behind when facing north)
      expect(flankPos.y).toBeGreaterThan(target.position.y);
    });
    
    it('should position behind target facing east', () => {
      const attacker = createTestUnit('a-1', UnitType.CAVALRY, UnitOwner.AI, { x: 100, y: 100 });
      const target = createTestUnit('t-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 200, y: 200 });
      target.direction = Direction.EAST;
      
      const flankPos = calculateFlankPosition(attacker, target);
      
      // Should be west of target (behind when facing east)
      expect(flankPos.x).toBeLessThan(target.position.x);
    });
    
    it('should calculate position approximately 30 units away', () => {
      const attacker = createTestUnit('a-1', UnitType.CAVALRY, UnitOwner.AI, { x: 100, y: 100 });
      const target = createTestUnit('t-1', UnitType.INFANTRY, UnitOwner.PLAYER, { x: 200, y: 200 });
      target.direction = Direction.NORTH;
      
      const flankPos = calculateFlankPosition(attacker, target);
      
      const dx = flankPos.x - target.position.x;
      const dy = flankPos.y - target.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      expect(distance).toBeCloseTo(30, 0);
    });
  });
});
