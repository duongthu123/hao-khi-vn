/**
 * AI Difficulty System Tests
 * Tests difficulty modifiers and behavior adjustments
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAIDifficultySettings,
  applyReactionDelay,
  shouldMakeOptimalDecision,
  applyDecisionQuality,
  calculateResourceGeneration,
  applyUnitStatModifier,
  canSpawnUnit,
  getDifficultyInfo,
  isValidDifficulty,
  type AIDifficultySettings,
} from '../difficulty';
import { Difficulty } from '@/types/game';

describe('AI Difficulty System', () => {
  describe('getAIDifficultySettings', () => {
    it('should return correct settings for easy difficulty', () => {
      const settings = getAIDifficultySettings(Difficulty.EASY);
      
      expect(settings.spawnInterval).toBe(15);
      expect(settings.resourceMultiplier).toBe(0.8);
      expect(settings.aggressiveness).toBe(0.4);
      expect(settings.unitLimit).toBe(15);
      expect(settings.targetingRange).toBe(300);
      expect(settings.reactionTime).toBe(1500);
      expect(settings.decisionQuality).toBe(0.6);
      expect(settings.strategicAccuracy).toBe(0.7);
      expect(settings.unitStatMultiplier).toBe(0.9);
    });
    
    it('should return correct settings for normal difficulty', () => {
      const settings = getAIDifficultySettings(Difficulty.NORMAL);
      
      expect(settings.spawnInterval).toBe(10);
      expect(settings.resourceMultiplier).toBe(1.0);
      expect(settings.aggressiveness).toBe(0.6);
      expect(settings.unitLimit).toBe(25);
      expect(settings.targetingRange).toBe(400);
      expect(settings.reactionTime).toBe(800);
      expect(settings.decisionQuality).toBe(0.8);
      expect(settings.strategicAccuracy).toBe(0.85);
      expect(settings.unitStatMultiplier).toBe(1.0);
    });
    
    it('should return correct settings for hard difficulty', () => {
      const settings = getAIDifficultySettings(Difficulty.HARD);
      
      expect(settings.spawnInterval).toBe(7);
      expect(settings.resourceMultiplier).toBe(1.3);
      expect(settings.aggressiveness).toBe(0.8);
      expect(settings.unitLimit).toBe(35);
      expect(settings.targetingRange).toBe(500);
      expect(settings.reactionTime).toBe(400);
      expect(settings.decisionQuality).toBe(0.95);
      expect(settings.strategicAccuracy).toBe(0.95);
      expect(settings.unitStatMultiplier).toBe(1.1);
    });
    
    it('should have increasing difficulty progression', () => {
      const easy = getAIDifficultySettings(Difficulty.EASY);
      const normal = getAIDifficultySettings(Difficulty.NORMAL);
      const hard = getAIDifficultySettings(Difficulty.HARD);
      
      // Spawn interval should decrease (faster spawning)
      expect(easy.spawnInterval).toBeGreaterThan(normal.spawnInterval);
      expect(normal.spawnInterval).toBeGreaterThan(hard.spawnInterval);
      
      // Resource multiplier should increase
      expect(easy.resourceMultiplier).toBeLessThan(normal.resourceMultiplier);
      expect(normal.resourceMultiplier).toBeLessThan(hard.resourceMultiplier);
      
      // Aggressiveness should increase
      expect(easy.aggressiveness).toBeLessThan(normal.aggressiveness);
      expect(normal.aggressiveness).toBeLessThan(hard.aggressiveness);
      
      // Unit limit should increase
      expect(easy.unitLimit).toBeLessThan(normal.unitLimit);
      expect(normal.unitLimit).toBeLessThan(hard.unitLimit);
      
      // Reaction time should decrease (faster reactions)
      expect(easy.reactionTime).toBeGreaterThan(normal.reactionTime);
      expect(normal.reactionTime).toBeGreaterThan(hard.reactionTime);
      
      // Decision quality should increase
      expect(easy.decisionQuality).toBeLessThan(normal.decisionQuality);
      expect(normal.decisionQuality).toBeLessThan(hard.decisionQuality);
    });
  });
  
  describe('applyReactionDelay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.restoreAllMocks();
    });
    
    it('should delay for 1500ms on easy difficulty', async () => {
      const delayPromise = applyReactionDelay(Difficulty.EASY);
      
      // Fast-forward time
      vi.advanceTimersByTime(1500);
      
      await expect(delayPromise).resolves.toBeUndefined();
    });
    
    it('should delay for 800ms on normal difficulty', async () => {
      const delayPromise = applyReactionDelay(Difficulty.NORMAL);
      
      vi.advanceTimersByTime(800);
      
      await expect(delayPromise).resolves.toBeUndefined();
    });
    
    it('should delay for 400ms on hard difficulty', async () => {
      const delayPromise = applyReactionDelay(Difficulty.HARD);
      
      vi.advanceTimersByTime(400);
      
      await expect(delayPromise).resolves.toBeUndefined();
    });
    
    it('should not resolve before delay time', async () => {
      const delayPromise = applyReactionDelay(Difficulty.EASY);
      let resolved = false;
      
      delayPromise.then(() => {
        resolved = true;
      });
      
      // Advance less than required time
      vi.advanceTimersByTime(1000);
      
      // Give microtasks a chance to run
      await Promise.resolve();
      
      expect(resolved).toBe(false);
    });
  });
  
  describe('shouldMakeOptimalDecision', () => {
    it('should sometimes return false on easy difficulty', () => {
      // Run multiple times to test probability
      const results = Array.from({ length: 100 }, () =>
        shouldMakeOptimalDecision(Difficulty.EASY)
      );
      
      const optimalCount = results.filter(Boolean).length;
      
      // With 70% accuracy, expect around 70 optimal decisions out of 100
      // Allow some variance (50-90 range)
      expect(optimalCount).toBeGreaterThan(50);
      expect(optimalCount).toBeLessThan(90);
    });
    
    it('should mostly return true on normal difficulty', () => {
      const results = Array.from({ length: 100 }, () =>
        shouldMakeOptimalDecision(Difficulty.NORMAL)
      );
      
      const optimalCount = results.filter(Boolean).length;
      
      // With 85% accuracy, expect around 85 optimal decisions
      // Allow variance (70-95 range)
      expect(optimalCount).toBeGreaterThan(70);
      expect(optimalCount).toBeLessThan(95);
    });
    
    it('should almost always return true on hard difficulty', () => {
      const results = Array.from({ length: 100 }, () =>
        shouldMakeOptimalDecision(Difficulty.HARD)
      );
      
      const optimalCount = results.filter(Boolean).length;
      
      // With 95% accuracy, expect around 95 optimal decisions
      // Allow variance (85-100 range)
      expect(optimalCount).toBeGreaterThan(85);
    });
  });
  
  describe('applyDecisionQuality', () => {
    it('should reduce priority by 40% on easy difficulty', () => {
      const basePriority = 100;
      const adjusted = applyDecisionQuality(basePriority, Difficulty.EASY);
      
      expect(adjusted).toBe(60); // 100 * 0.6
    });
    
    it('should reduce priority by 20% on normal difficulty', () => {
      const basePriority = 100;
      const adjusted = applyDecisionQuality(basePriority, Difficulty.NORMAL);
      
      expect(adjusted).toBe(80); // 100 * 0.8
    });
    
    it('should barely reduce priority on hard difficulty', () => {
      const basePriority = 100;
      const adjusted = applyDecisionQuality(basePriority, Difficulty.HARD);
      
      expect(adjusted).toBe(95); // 100 * 0.95
    });
    
    it('should handle decimal priorities', () => {
      const basePriority = 75.5;
      const adjusted = applyDecisionQuality(basePriority, Difficulty.NORMAL);
      
      expect(adjusted).toBeCloseTo(60.4, 1); // 75.5 * 0.8
    });
  });
  
  describe('calculateResourceGeneration', () => {
    it('should reduce generation by 20% on easy difficulty', () => {
      const baseRate = 10;
      const adjusted = calculateResourceGeneration(baseRate, Difficulty.EASY);
      
      expect(adjusted).toBe(8); // 10 * 0.8
    });
    
    it('should keep generation same on normal difficulty', () => {
      const baseRate = 10;
      const adjusted = calculateResourceGeneration(baseRate, Difficulty.NORMAL);
      
      expect(adjusted).toBe(10); // 10 * 1.0
    });
    
    it('should increase generation by 30% on hard difficulty', () => {
      const baseRate = 10;
      const adjusted = calculateResourceGeneration(baseRate, Difficulty.HARD);
      
      expect(adjusted).toBe(13); // 10 * 1.3
    });
    
    it('should handle decimal rates', () => {
      const baseRate = 7.5;
      const adjusted = calculateResourceGeneration(baseRate, Difficulty.HARD);
      
      expect(adjusted).toBeCloseTo(9.75, 2); // 7.5 * 1.3
    });
  });
  
  describe('applyUnitStatModifier', () => {
    it('should reduce stats by 10% on easy difficulty', () => {
      const baseStat = 50;
      const adjusted = applyUnitStatModifier(baseStat, Difficulty.EASY);
      
      expect(adjusted).toBe(45); // 50 * 0.9, rounded
    });
    
    it('should keep stats same on normal difficulty', () => {
      const baseStat = 50;
      const adjusted = applyUnitStatModifier(baseStat, Difficulty.NORMAL);
      
      expect(adjusted).toBe(50); // 50 * 1.0
    });
    
    it('should increase stats by 10% on hard difficulty', () => {
      const baseStat = 50;
      const adjusted = applyUnitStatModifier(baseStat, Difficulty.HARD);
      
      expect(adjusted).toBe(55); // 50 * 1.1, rounded
    });
    
    it('should round to nearest integer', () => {
      const baseStat = 47; // 47 * 0.9 = 42.3
      const adjusted = applyUnitStatModifier(baseStat, Difficulty.EASY);
      
      expect(adjusted).toBe(42); // Rounded down
    });
  });
  
  describe('canSpawnUnit', () => {
    it('should allow spawn after 15 seconds on easy difficulty', () => {
      const lastSpawn = 10;
      const currentTime = 25; // 15 seconds later
      
      const canSpawn = canSpawnUnit(lastSpawn, currentTime, Difficulty.EASY);
      
      expect(canSpawn).toBe(true);
    });
    
    it('should not allow spawn before 15 seconds on easy difficulty', () => {
      const lastSpawn = 10;
      const currentTime = 20; // Only 10 seconds later
      
      const canSpawn = canSpawnUnit(lastSpawn, currentTime, Difficulty.EASY);
      
      expect(canSpawn).toBe(false);
    });
    
    it('should allow spawn after 10 seconds on normal difficulty', () => {
      const lastSpawn = 5;
      const currentTime = 15;
      
      const canSpawn = canSpawnUnit(lastSpawn, currentTime, Difficulty.NORMAL);
      
      expect(canSpawn).toBe(true);
    });
    
    it('should allow spawn after 7 seconds on hard difficulty', () => {
      const lastSpawn = 0;
      const currentTime = 7;
      
      const canSpawn = canSpawnUnit(lastSpawn, currentTime, Difficulty.HARD);
      
      expect(canSpawn).toBe(true);
    });
    
    it('should handle exact interval timing', () => {
      const lastSpawn = 100;
      const currentTime = 110; // Exactly 10 seconds
      
      const canSpawn = canSpawnUnit(lastSpawn, currentTime, Difficulty.NORMAL);
      
      expect(canSpawn).toBe(true);
    });
  });
  
  describe('getDifficultyInfo', () => {
    it('should return correct info for easy difficulty', () => {
      const info = getDifficultyInfo(Difficulty.EASY);
      
      expect(info.name).toBe('Easy');
      expect(info.nameVietnamese).toBe('Dễ');
      expect(info.description).toContain('Relaxed');
      expect(info.descriptionVietnamese).toContain('thoải mái');
    });
    
    it('should return correct info for normal difficulty', () => {
      const info = getDifficultyInfo(Difficulty.NORMAL);
      
      expect(info.name).toBe('Normal');
      expect(info.nameVietnamese).toBe('Bình thường');
      expect(info.description).toContain('Balanced');
      expect(info.descriptionVietnamese).toContain('cân bằng');
    });
    
    it('should return correct info for hard difficulty', () => {
      const info = getDifficultyInfo(Difficulty.HARD);
      
      expect(info.name).toBe('Hard');
      expect(info.nameVietnamese).toBe('Khó');
      expect(info.description).toContain('Intense');
      expect(info.descriptionVietnamese).toContain('khốc liệt');
    });
    
    it('should include both English and Vietnamese text', () => {
      const difficulties = [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD];
      
      difficulties.forEach((difficulty) => {
        const info = getDifficultyInfo(difficulty);
        
        expect(info.name).toBeTruthy();
        expect(info.nameVietnamese).toBeTruthy();
        expect(info.description).toBeTruthy();
        expect(info.descriptionVietnamese).toBeTruthy();
      });
    });
  });
  
  describe('isValidDifficulty', () => {
    it('should return true for valid difficulty values', () => {
      expect(isValidDifficulty('easy')).toBe(true);
      expect(isValidDifficulty('normal')).toBe(true);
      expect(isValidDifficulty('hard')).toBe(true);
    });
    
    it('should return false for invalid difficulty values', () => {
      expect(isValidDifficulty('medium')).toBe(false);
      expect(isValidDifficulty('extreme')).toBe(false);
      expect(isValidDifficulty('')).toBe(false);
      expect(isValidDifficulty('EASY')).toBe(false); // Case sensitive
    });
    
    it('should work as type guard', () => {
      const value: string = 'normal';
      
      if (isValidDifficulty(value)) {
        // TypeScript should recognize value as Difficulty type here
        const settings = getAIDifficultySettings(value);
        expect(settings).toBeDefined();
      }
    });
  });
  
  describe('Difficulty progression consistency', () => {
    it('should have consistent difficulty scaling across all metrics', () => {
      const easy = getAIDifficultySettings(Difficulty.EASY);
      const normal = getAIDifficultySettings(Difficulty.NORMAL);
      const hard = getAIDifficultySettings(Difficulty.HARD);
      
      // All "power" metrics should increase with difficulty
      expect(easy.resourceMultiplier).toBeLessThan(hard.resourceMultiplier);
      expect(easy.aggressiveness).toBeLessThan(hard.aggressiveness);
      expect(easy.unitLimit).toBeLessThan(hard.unitLimit);
      expect(easy.targetingRange).toBeLessThan(hard.targetingRange);
      expect(easy.decisionQuality).toBeLessThan(hard.decisionQuality);
      expect(easy.strategicAccuracy).toBeLessThan(hard.strategicAccuracy);
      expect(easy.unitStatMultiplier).toBeLessThan(hard.unitStatMultiplier);
      
      // All "speed" metrics should decrease with difficulty (faster = harder)
      expect(easy.spawnInterval).toBeGreaterThan(hard.spawnInterval);
      expect(easy.reactionTime).toBeGreaterThan(hard.reactionTime);
    });
    
    it('should have normal difficulty as baseline (1.0 multipliers)', () => {
      const normal = getAIDifficultySettings(Difficulty.NORMAL);
      
      expect(normal.resourceMultiplier).toBe(1.0);
      expect(normal.unitStatMultiplier).toBe(1.0);
    });
  });
});
