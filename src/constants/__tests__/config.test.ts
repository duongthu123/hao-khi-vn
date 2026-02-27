import { describe, it, expect } from 'vitest';
import {
  APP_CONFIG,
  GAME_CONFIG,
  MAP_CONFIG,
  RESOURCE_CONFIG,
  COMBAT_CONFIG,
  DIFFICULTY_CONFIG,
  RESEARCH_CONFIG,
  UNIT_CONFIG,
  ANIMATION_CONFIG,
  validateConfig,
  getAssetUrl,
  isDevelopment,
  isProduction,
  isFeatureEnabled,
} from '../config';

describe('Configuration Constants', () => {
  describe('APP_CONFIG', () => {
    it('should have application info', () => {
      expect(APP_CONFIG.name).toBeDefined();
      expect(APP_CONFIG.version).toBeDefined();
      expect(APP_CONFIG.environment).toBeDefined();
    });
  });

  describe('GAME_CONFIG', () => {
    it('should have valid auto-save interval', () => {
      expect(GAME_CONFIG.autoSaveInterval).toBeGreaterThan(0);
      expect(GAME_CONFIG.autoSaveInterval).toBeGreaterThanOrEqual(30000);
    });

    it('should have valid save slots', () => {
      expect(GAME_CONFIG.maxSaveSlots).toBeGreaterThan(0);
      expect(GAME_CONFIG.maxSaveSlots).toBeLessThanOrEqual(10);
    });

    it('should have valid FPS settings', () => {
      expect(GAME_CONFIG.targetFPS).toBe(60);
      expect(GAME_CONFIG.gameLoopInterval).toBeCloseTo(1000 / 60);
    });
  });

  describe('MAP_CONFIG', () => {
    it('should have correct map dimensions from original game', () => {
      expect(MAP_CONFIG.width).toBe(3000);
      expect(MAP_CONFIG.height).toBe(2000);
    });

    it('should have valid zoom settings', () => {
      expect(MAP_CONFIG.minZoom).toBeLessThan(MAP_CONFIG.maxZoom);
      expect(MAP_CONFIG.initialZoom).toBeGreaterThanOrEqual(MAP_CONFIG.minZoom);
      expect(MAP_CONFIG.initialZoom).toBeLessThanOrEqual(MAP_CONFIG.maxZoom);
    });
  });

  describe('RESOURCE_CONFIG', () => {
    it('should have initial resources matching original game', () => {
      expect(RESOURCE_CONFIG.initial.food).toBe(0);
      expect(RESOURCE_CONFIG.initial.gold).toBe(500);
      expect(RESOURCE_CONFIG.initial.army).toBe(0);
    });

    it('should have valid generation rates', () => {
      expect(RESOURCE_CONFIG.baseGeneration.foodPerSecond).toBeGreaterThan(0);
      expect(RESOURCE_CONFIG.baseGeneration.goldPerSecond).toBeGreaterThan(0);
      expect(RESOURCE_CONFIG.baseGeneration.armyPerSecond).toBeGreaterThanOrEqual(0);
    });

    it('should have valid trade rates', () => {
      expect(RESOURCE_CONFIG.trade.riceToGoldRate).toBeGreaterThan(0);
      expect(RESOURCE_CONFIG.trade.riceToGoldAmount).toBeGreaterThan(0);
    });
  });

  describe('COMBAT_CONFIG', () => {
    it('should have valid damage variance', () => {
      expect(COMBAT_CONFIG.formulas.randomFactorMin).toBeLessThan(
        COMBAT_CONFIG.formulas.randomFactorMax
      );
      expect(COMBAT_CONFIG.formulas.randomFactorMin).toBeCloseTo(0.9);
      expect(COMBAT_CONFIG.formulas.randomFactorMax).toBeCloseTo(1.1);
    });

    it('should have direction modifiers', () => {
      expect(COMBAT_CONFIG.directionModifiers.front).toBe(1.0);
      expect(COMBAT_CONFIG.directionModifiers.side).toBeGreaterThan(1.0);
      expect(COMBAT_CONFIG.directionModifiers.rear).toBeGreaterThan(
        COMBAT_CONFIG.directionModifiers.side
      );
    });

    it('should have type advantages', () => {
      expect(COMBAT_CONFIG.typeAdvantages.cavalry_vs_archer).toBeGreaterThan(1.0);
      expect(COMBAT_CONFIG.typeAdvantages.infantry_vs_cavalry).toBeGreaterThan(1.0);
      expect(COMBAT_CONFIG.typeAdvantages.archer_vs_infantry).toBeGreaterThan(1.0);
      expect(COMBAT_CONFIG.typeAdvantages.default).toBe(1.0);
    });

    it('should have valid HP values', () => {
      expect(COMBAT_CONFIG.playerHP.initial).toBe(1000);
      expect(COMBAT_CONFIG.enemyHP.initial).toBe(2000);
    });

    it('should have fortress configuration', () => {
      expect(COMBAT_CONFIG.fortress.maxHP).toBe(1200);
      expect(COMBAT_CONFIG.fortress.regenRange).toBeGreaterThan(0);
    });
  });

  describe('DIFFICULTY_CONFIG', () => {
    it('should have all difficulty levels', () => {
      expect(DIFFICULTY_CONFIG.easy).toBeDefined();
      expect(DIFFICULTY_CONFIG.normal).toBeDefined();
      expect(DIFFICULTY_CONFIG.hard).toBeDefined();
    });

    it('should have increasing difficulty from easy to hard', () => {
      // AI reaction time should decrease (faster)
      expect(DIFFICULTY_CONFIG.easy.aiReactionTime).toBeGreaterThan(
        DIFFICULTY_CONFIG.normal.aiReactionTime
      );
      expect(DIFFICULTY_CONFIG.normal.aiReactionTime).toBeGreaterThan(
        DIFFICULTY_CONFIG.hard.aiReactionTime
      );

      // Enemy health should increase
      expect(DIFFICULTY_CONFIG.easy.enemyHealthMultiplier).toBeLessThan(
        DIFFICULTY_CONFIG.normal.enemyHealthMultiplier
      );
      expect(DIFFICULTY_CONFIG.normal.enemyHealthMultiplier).toBeLessThan(
        DIFFICULTY_CONFIG.hard.enemyHealthMultiplier
      );

      // AI accuracy should increase
      expect(DIFFICULTY_CONFIG.easy.aiAccuracy).toBeLessThan(
        DIFFICULTY_CONFIG.normal.aiAccuracy
      );
      expect(DIFFICULTY_CONFIG.normal.aiAccuracy).toBeLessThan(
        DIFFICULTY_CONFIG.hard.aiAccuracy
      );
    });

    it('should have Vietnamese names', () => {
      expect(DIFFICULTY_CONFIG.easy.name).toBe('Dễ');
      expect(DIFFICULTY_CONFIG.normal.name).toBe('Bình Thường');
      expect(DIFFICULTY_CONFIG.hard.name).toBe('Khó');
    });
  });

  describe('RESEARCH_CONFIG', () => {
    it('should have base costs matching original game', () => {
      expect(RESEARCH_CONFIG.baseCosts.military).toBe(500);
      expect(RESEARCH_CONFIG.baseCosts.weapon).toBe(500);
      expect(RESEARCH_CONFIG.baseCosts.farming).toBe(500);
    });

    it('should have valid bonuses', () => {
      expect(RESEARCH_CONFIG.bonuses.military).toBe(0.2);
      expect(RESEARCH_CONFIG.bonuses.weapon).toBe(0.1);
      expect(RESEARCH_CONFIG.bonuses.farming).toBe(0.5);
    });
  });

  describe('UNIT_CONFIG', () => {
    it('should have unit costs matching original game', () => {
      expect(UNIT_CONFIG.costs.infantry).toBe(150);
      expect(UNIT_CONFIG.costs.archer).toBe(300);
      expect(UNIT_CONFIG.costs.cavalry).toBe(500);
      expect(UNIT_CONFIG.costs.peasant).toBe(0);
    });

    it('should have unit stats', () => {
      expect(UNIT_CONFIG.stats.infantry).toBeDefined();
      expect(UNIT_CONFIG.stats.archer).toBeDefined();
      expect(UNIT_CONFIG.stats.cavalry).toBeDefined();
      expect(UNIT_CONFIG.stats.peasant).toBeDefined();
    });

    it('should have cavalry as strongest unit', () => {
      expect(UNIT_CONFIG.stats.cavalry.attack).toBeGreaterThan(
        UNIT_CONFIG.stats.infantry.attack
      );
      expect(UNIT_CONFIG.stats.cavalry.speed).toBeGreaterThan(
        UNIT_CONFIG.stats.infantry.speed
      );
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('should have duration settings', () => {
      expect(ANIMATION_CONFIG.durations.fast).toBeLessThan(
        ANIMATION_CONFIG.durations.normal
      );
      expect(ANIMATION_CONFIG.durations.normal).toBeLessThan(
        ANIMATION_CONFIG.durations.slow
      );
    });

    it('should have notification settings', () => {
      expect(ANIMATION_CONFIG.notification.duration).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.notification.maxVisible).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    describe('validateConfig', () => {
      it('should not throw with valid configuration', () => {
        expect(() => validateConfig()).not.toThrow();
      });
    });

    describe('getAssetUrl', () => {
      it('should return path when no CDN configured', () => {
        const path = '/test/image.png';
        expect(getAssetUrl(path)).toBe(path);
      });
    });

    describe('isDevelopment', () => {
      it('should return boolean', () => {
        expect(typeof isDevelopment()).toBe('boolean');
      });
    });

    describe('isProduction', () => {
      it('should return boolean', () => {
        expect(typeof isProduction()).toBe('boolean');
      });
    });

    describe('isFeatureEnabled', () => {
      it('should return boolean for valid features', () => {
        expect(typeof isFeatureEnabled('webSpeech')).toBe('boolean');
        expect(typeof isFeatureEnabled('cloudSaves')).toBe('boolean');
      });
    });
  });
});
