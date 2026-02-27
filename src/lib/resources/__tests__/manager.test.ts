/**
 * Resource Manager Tests
 * Tests for resource transaction functions, validation, and atomic operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateResources,
  addResources,
  subtractResources,
  executeAtomicTransaction,
  calculateCost,
  formatResources,
  getTransactionLog,
  clearTransactionLog,
} from '../manager';
import { Resources, ResourceCost } from '@/types/resource';

describe('Resource Manager', () => {
  const mockResources: Resources = {
    food: 100,
    gold: 50,
    army: 10,
  };

  const mockCaps: Resources = {
    food: 1000,
    gold: 1000,
    army: 100,
  };

  beforeEach(() => {
    clearTransactionLog();
  });

  describe('validateResources', () => {
    it('should validate sufficient resources', () => {
      const cost: ResourceCost = { food: 50, gold: 25 };
      const result = validateResources(mockResources, cost);
      
      expect(result.valid).toBe(true);
      expect(result.missing).toBeUndefined();
      expect(result.message).toBeUndefined();
    });

    it('should detect insufficient resources', () => {
      const cost: ResourceCost = { food: 150, gold: 100 };
      const result = validateResources(mockResources, cost);
      
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual({ food: 50, gold: 50 });
      expect(result.message).toContain('Insufficient resources');
    });

    it('should validate with partial cost', () => {
      const cost: ResourceCost = { food: 50 };
      const result = validateResources(mockResources, cost);
      
      expect(result.valid).toBe(true);
    });

    it('should handle zero cost', () => {
      const cost: ResourceCost = { food: 0, gold: 0 };
      const result = validateResources(mockResources, cost);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('addResources', () => {
    it('should add resources correctly', () => {
      const toAdd = { food: 50, gold: 25 };
      const result = addResources(mockResources, mockCaps, toAdd, 'Test addition');
      
      expect(result.resources.food).toBe(150);
      expect(result.resources.gold).toBe(75);
      expect(result.resources.army).toBe(10);
      expect(result.transactions).toHaveLength(2);
    });

    it('should enforce resource caps', () => {
      const toAdd = { food: 2000 };
      const result = addResources(mockResources, mockCaps, toAdd, 'Test cap');
      
      expect(result.resources.food).toBe(1000); // Capped at 1000
      expect(result.transactions[0].amount).toBe(900); // Only 900 was actually added
    });

    it('should ignore zero or negative amounts', () => {
      const toAdd = { food: 0, gold: -10 };
      const result = addResources(mockResources, mockCaps, toAdd, 'Test zero');
      
      expect(result.resources).toEqual(mockResources);
      expect(result.transactions).toHaveLength(0);
    });

    it('should log transactions', () => {
      const toAdd = { food: 50 };
      addResources(mockResources, mockCaps, toAdd, 'Test logging');
      
      const log = getTransactionLog();
      expect(log).toHaveLength(1);
      expect(log[0].reason).toBe('Test logging');
      expect(log[0].success).toBe(true);
    });
  });

  describe('subtractResources', () => {
    it('should subtract resources correctly', () => {
      const toSubtract: ResourceCost = { food: 30, gold: 20 };
      const result = subtractResources(mockResources, toSubtract, 'Test subtraction');
      
      expect(result.success).toBe(true);
      expect(result.resources.food).toBe(70);
      expect(result.resources.gold).toBe(30);
      expect(result.resources.army).toBe(10);
      expect(result.transactions).toHaveLength(2);
    });

    it('should fail when resources are insufficient', () => {
      const toSubtract: ResourceCost = { food: 200 };
      const result = subtractResources(mockResources, toSubtract, 'Test fail');
      
      expect(result.success).toBe(false);
      expect(result.resources).toEqual(mockResources); // Unchanged
      expect(result.transactions).toHaveLength(0);
    });

    it('should log failed transactions', () => {
      const toSubtract: ResourceCost = { food: 200 };
      subtractResources(mockResources, toSubtract, 'Test fail log');
      
      const log = getTransactionLog();
      expect(log).toHaveLength(1);
      expect(log[0].success).toBe(false);
      expect(log[0].reason).toContain('FAILED');
    });

    it('should handle partial subtraction', () => {
      const toSubtract: ResourceCost = { gold: 25 };
      const result = subtractResources(mockResources, toSubtract, 'Test partial');
      
      expect(result.success).toBe(true);
      expect(result.resources.gold).toBe(25);
      expect(result.resources.food).toBe(100); // Unchanged
    });
  });

  describe('executeAtomicTransaction', () => {
    it('should execute multiple operations atomically', () => {
      const operations = [
        { type: 'subtract' as const, resources: { food: 50 }, reason: 'Build cost' },
        { type: 'add' as const, resources: { army: 5 }, reason: 'Unit created' },
      ];
      
      const result = executeAtomicTransaction(mockResources, mockCaps, operations);
      
      expect(result.success).toBe(true);
      expect(result.resources.food).toBe(50);
      expect(result.resources.army).toBe(15);
      expect(result.transactions).toHaveLength(2);
    });

    it('should rollback if any operation fails', () => {
      const operations = [
        { type: 'subtract' as const, resources: { food: 50 }, reason: 'First cost' },
        { type: 'subtract' as const, resources: { gold: 100 }, reason: 'Second cost (fails)' },
      ];
      
      const result = executeAtomicTransaction(mockResources, mockCaps, operations);
      
      expect(result.success).toBe(false);
      expect(result.resources).toEqual(mockResources); // Unchanged
      expect(result.transactions).toHaveLength(0);
    });

    it('should handle complex multi-step transactions', () => {
      const operations = [
        { type: 'subtract' as const, resources: { food: 30, gold: 20 }, reason: 'Research cost' },
        { type: 'add' as const, resources: { army: 3 }, reason: 'Bonus units' },
        { type: 'subtract' as const, resources: { army: 2 }, reason: 'Deploy units' },
      ];
      
      const result = executeAtomicTransaction(mockResources, mockCaps, operations);
      
      expect(result.success).toBe(true);
      expect(result.resources.food).toBe(70);
      expect(result.resources.gold).toBe(30);
      expect(result.resources.army).toBe(11); // 10 + 3 - 2
    });

    it('should validate all subtractions before executing', () => {
      const operations = [
        { type: 'add' as const, resources: { food: 50 }, reason: 'Add first' },
        { type: 'subtract' as const, resources: { food: 200 }, reason: 'Subtract too much' },
      ];
      
      const result = executeAtomicTransaction(mockResources, mockCaps, operations);
      
      expect(result.success).toBe(false);
      expect(result.resources).toEqual(mockResources);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost with default modifier', () => {
      const baseCost: ResourceCost = { food: 100, gold: 50 };
      const result = calculateCost(baseCost);
      
      expect(result).toEqual({ food: 100, gold: 50 });
    });

    it('should apply modifier correctly', () => {
      const baseCost: ResourceCost = { food: 100, gold: 50 };
      const result = calculateCost(baseCost, 1.5);
      
      expect(result).toEqual({ food: 150, gold: 75 });
    });

    it('should round up fractional costs', () => {
      const baseCost: ResourceCost = { food: 100 };
      const result = calculateCost(baseCost, 0.75);
      
      expect(result.food).toBe(75);
    });

    it('should handle discount modifiers', () => {
      const baseCost: ResourceCost = { food: 100, gold: 50 };
      const result = calculateCost(baseCost, 0.8);
      
      expect(result).toEqual({ food: 80, gold: 40 });
    });
  });

  describe('formatResources', () => {
    it('should format all resources', () => {
      const resources = { food: 100, gold: 50, army: 10 };
      const result = formatResources(resources);
      
      expect(result).toBe('Food: 100, Gold: 50, Army: 10');
    });

    it('should format partial resources', () => {
      const resources = { food: 100 };
      const result = formatResources(resources);
      
      expect(result).toBe('Food: 100');
    });

    it('should handle empty resources', () => {
      const resources = {};
      const result = formatResources(resources);
      
      expect(result).toBe('');
    });
  });

  describe('transaction logging', () => {
    it('should maintain transaction log', () => {
      addResources(mockResources, mockCaps, { food: 50 }, 'Test 1');
      subtractResources(mockResources, { gold: 10 }, 'Test 2');
      
      const log = getTransactionLog();
      expect(log.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear transaction log', () => {
      addResources(mockResources, mockCaps, { food: 50 }, 'Test');
      clearTransactionLog();
      
      const log = getTransactionLog();
      expect(log).toHaveLength(0);
    });

    it('should include timestamps in transactions', () => {
      const before = Date.now();
      addResources(mockResources, mockCaps, { food: 50 }, 'Test');
      const after = Date.now();
      
      const log = getTransactionLog();
      expect(log[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(log[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle maximum resource values at cap', () => {
      const maxResources: Resources = {
        food: 1000,
        gold: 1000,
        army: 100,
      };
      
      const result = addResources(maxResources, mockCaps, { food: 100 }, 'Test max');
      
      expect(result.resources.food).toBe(1000);
      expect(result.transactions[0].amount).toBe(0); // Nothing added
    });

    it('should handle very large transaction amounts', () => {
      const toAdd = { food: 999999 };
      const result = addResources(mockResources, mockCaps, toAdd, 'Large add');
      
      expect(result.resources.food).toBe(1000); // Capped
    });

    it('should handle multiple resource types in single transaction', () => {
      const toSubtract: ResourceCost = { food: 50, gold: 25, army: 5 };
      const result = subtractResources(mockResources, toSubtract, 'Multi-resource');
      
      expect(result.success).toBe(true);
      expect(result.resources.food).toBe(50);
      expect(result.resources.gold).toBe(25);
      expect(result.resources.army).toBe(5);
      expect(result.transactions).toHaveLength(3);
    });

    it('should fail atomic transaction if any single resource is insufficient', () => {
      const operations = [
        { type: 'subtract' as const, resources: { food: 10 }, reason: 'Small cost' },
        { type: 'subtract' as const, resources: { army: 50 }, reason: 'Too much army' },
      ];
      
      const result = executeAtomicTransaction(mockResources, mockCaps, operations);
      
      expect(result.success).toBe(false);
      expect(result.resources.food).toBe(100); // Unchanged
      expect(result.resources.army).toBe(10); // Unchanged
    });

    it('should handle empty operations array in atomic transaction', () => {
      const operations: Array<{
        type: 'add' | 'subtract';
        resources: ResourceCost;
        reason: string;
      }> = [];
      
      const result = executeAtomicTransaction(mockResources, mockCaps, operations);
      
      expect(result.success).toBe(true);
      expect(result.resources).toEqual(mockResources);
      expect(result.transactions).toHaveLength(0);
    });

    it('should handle resource validation with all resources insufficient', () => {
      const cost: ResourceCost = { food: 200, gold: 100, army: 50 };
      const result = validateResources(mockResources, cost);
      
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual({ food: 100, gold: 50, army: 40 });
    });

    it('should handle adding resources when already at cap', () => {
      const cappedResources: Resources = {
        food: 1000,
        gold: 1000,
        army: 100,
      };
      
      const result = addResources(cappedResources, mockCaps, { food: 50, gold: 50 }, 'At cap');
      
      expect(result.resources).toEqual(cappedResources);
      expect(result.transactions.every(t => t.amount === 0)).toBe(true);
    });

    it('should handle subtracting exact resource amounts', () => {
      const toSubtract: ResourceCost = { food: 100, gold: 50, army: 10 };
      const result = subtractResources(mockResources, toSubtract, 'Exact subtraction');
      
      expect(result.success).toBe(true);
      expect(result.resources.food).toBe(0);
      expect(result.resources.gold).toBe(0);
      expect(result.resources.army).toBe(0);
    });

    it('should handle calculateCost with zero modifier', () => {
      const baseCost: ResourceCost = { food: 100, gold: 50 };
      const result = calculateCost(baseCost, 0);
      
      expect(result).toEqual({ food: 0, gold: 0 });
    });

    it('should handle calculateCost with very large modifier', () => {
      const baseCost: ResourceCost = { food: 100 };
      const result = calculateCost(baseCost, 10);
      
      expect(result.food).toBe(1000);
    });
  });
});
