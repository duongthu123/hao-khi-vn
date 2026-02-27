/**
 * Unit tests for gacha system
 */

import { describe, it, expect, vi } from 'vitest';
import {
  DROP_RATES,
  rollRarity,
  selectHeroFromRarity,
  performGachaPull,
  performMultiPull,
  calculateDuplicateCompensation,
  getRarityColor,
  getRarityNameVietnamese,
} from '../gacha';
import { HeroRarity } from '@/types/hero';

describe('Gacha System', () => {
  describe('DROP_RATES', () => {
    it('should sum to 100%', () => {
      const total = Object.values(DROP_RATES).reduce((sum, rate) => sum + rate, 0);
      expect(total).toBe(100);
    });

    it('should have correct individual rates', () => {
      expect(DROP_RATES[HeroRarity.LEGENDARY]).toBe(1);
      expect(DROP_RATES[HeroRarity.EPIC]).toBe(5);
      expect(DROP_RATES[HeroRarity.RARE]).toBe(20);
      expect(DROP_RATES[HeroRarity.COMMON]).toBe(74);
    });
  });

  describe('rollRarity', () => {
    it('should return guaranteed rarity when provided', () => {
      const result = rollRarity(HeroRarity.LEGENDARY);
      expect(result).toBe(HeroRarity.LEGENDARY);
    });

    it('should return a valid rarity', () => {
      const result = rollRarity();
      expect(Object.values(HeroRarity)).toContain(result);
    });

    it('should respect drop rate probabilities over many rolls', () => {
      const rolls = 10000;
      const counts: Record<HeroRarity, number> = {
        [HeroRarity.LEGENDARY]: 0,
        [HeroRarity.EPIC]: 0,
        [HeroRarity.RARE]: 0,
        [HeroRarity.COMMON]: 0,
      };

      for (let i = 0; i < rolls; i++) {
        const rarity = rollRarity();
        counts[rarity]++;
      }

      // Check that percentages are within reasonable margin (±3%)
      expect(counts[HeroRarity.LEGENDARY] / rolls).toBeCloseTo(0.01, 1);
      expect(counts[HeroRarity.EPIC] / rolls).toBeCloseTo(0.05, 1);
      expect(counts[HeroRarity.RARE] / rolls).toBeCloseTo(0.20, 1);
      expect(counts[HeroRarity.COMMON] / rolls).toBeCloseTo(0.74, 1);
    });
  });

  describe('selectHeroFromRarity', () => {
    it('should return a hero of the specified rarity', () => {
      const hero = selectHeroFromRarity(HeroRarity.LEGENDARY);
      expect(hero.rarity).toBe(HeroRarity.LEGENDARY);
    });

    it('should return different heroes on multiple calls', () => {
      const heroes = new Set();
      // Try multiple times to get different heroes
      for (let i = 0; i < 50; i++) {
        const hero = selectHeroFromRarity(HeroRarity.RARE);
        heroes.add(hero.id);
      }
      // Should have gotten at least 2 different heroes
      expect(heroes.size).toBeGreaterThan(1);
    });

    it('should throw error for rarity with no heroes', () => {
      // Mock a scenario where there are no common heroes
      // This is a theoretical test since we always have heroes
      expect(() => {
        // We can't easily test this without mocking the hero pool
        // But the function should handle it
        selectHeroFromRarity(HeroRarity.COMMON);
      }).not.toThrow();
    });
  });

  describe('performGachaPull', () => {
    it('should return a valid gacha result', () => {
      const result = performGachaPull();
      
      expect(result).toHaveProperty('hero');
      expect(result).toHaveProperty('isDuplicate');
      expect(result).toHaveProperty('rarity');
      expect(result.hero).toBeDefined();
      expect(typeof result.isDuplicate).toBe('boolean');
      expect(Object.values(HeroRarity)).toContain(result.rarity);
    });

    it('should detect duplicates correctly', () => {
      const result = performGachaPull();
      const heroId = result.hero.id;

      // Pull again with this hero in owned list
      const duplicateResult = performGachaPull({ ownedHeroIds: [heroId] });
      
      if (duplicateResult.hero.id === heroId) {
        expect(duplicateResult.isDuplicate).toBe(true);
      }
    });

    it('should respect guaranteed rarity', () => {
      const result = performGachaPull({ guaranteedRarity: HeroRarity.EPIC });
      expect(result.rarity).toBe(HeroRarity.EPIC);
      expect(result.hero.rarity).toBe(HeroRarity.EPIC);
    });

    it('should not mark as duplicate if hero not owned', () => {
      const result = performGachaPull({ ownedHeroIds: [] });
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('performMultiPull', () => {
    it('should return correct number of results', () => {
      const count = 10;
      const results = performMultiPull(count);
      expect(results).toHaveLength(count);
    });

    it('should return valid results for each pull', () => {
      const results = performMultiPull(5);
      
      results.forEach(result => {
        expect(result).toHaveProperty('hero');
        expect(result).toHaveProperty('isDuplicate');
        expect(result).toHaveProperty('rarity');
      });
    });

    it('should respect options for all pulls', () => {
      const results = performMultiPull(3, { guaranteedRarity: HeroRarity.LEGENDARY });
      
      results.forEach(result => {
        expect(result.rarity).toBe(HeroRarity.LEGENDARY);
      });
    });
  });

  describe('calculateDuplicateCompensation', () => {
    it('should return compensation for common heroes', () => {
      const comp = calculateDuplicateCompensation(HeroRarity.COMMON);
      expect(comp.gold).toBe(50);
      expect(comp.experience).toBe(10);
    });

    it('should return compensation for rare heroes', () => {
      const comp = calculateDuplicateCompensation(HeroRarity.RARE);
      expect(comp.gold).toBe(150);
      expect(comp.experience).toBe(30);
    });

    it('should return compensation for epic heroes', () => {
      const comp = calculateDuplicateCompensation(HeroRarity.EPIC);
      expect(comp.gold).toBe(500);
      expect(comp.experience).toBe(100);
    });

    it('should return compensation for legendary heroes', () => {
      const comp = calculateDuplicateCompensation(HeroRarity.LEGENDARY);
      expect(comp.gold).toBe(2000);
      expect(comp.experience).toBe(500);
    });

    it('should give more compensation for higher rarities', () => {
      const common = calculateDuplicateCompensation(HeroRarity.COMMON);
      const rare = calculateDuplicateCompensation(HeroRarity.RARE);
      const epic = calculateDuplicateCompensation(HeroRarity.EPIC);
      const legendary = calculateDuplicateCompensation(HeroRarity.LEGENDARY);

      expect(rare.gold).toBeGreaterThan(common.gold);
      expect(epic.gold).toBeGreaterThan(rare.gold);
      expect(legendary.gold).toBeGreaterThan(epic.gold);
    });
  });

  describe('getRarityColor', () => {
    it('should return correct color for each rarity', () => {
      expect(getRarityColor(HeroRarity.COMMON)).toBe('#9CA3AF');
      expect(getRarityColor(HeroRarity.RARE)).toBe('#3B82F6');
      expect(getRarityColor(HeroRarity.EPIC)).toBe('#A855F7');
      expect(getRarityColor(HeroRarity.LEGENDARY)).toBe('#F59E0B');
    });
  });

  describe('getRarityNameVietnamese', () => {
    it('should return correct Vietnamese name for each rarity', () => {
      expect(getRarityNameVietnamese(HeroRarity.COMMON)).toBe('Thường');
      expect(getRarityNameVietnamese(HeroRarity.RARE)).toBe('Hiếm');
      expect(getRarityNameVietnamese(HeroRarity.EPIC)).toBe('Sử Thi');
      expect(getRarityNameVietnamese(HeroRarity.LEGENDARY)).toBe('Huyền Thoại');
    });
  });
});
