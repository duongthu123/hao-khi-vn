/**
 * Tests for hero data constants
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_HEROES,
  VIETNAMESE_HEROES,
  MONGOL_HEROES,
  TRAN_HUNG_DAO,
  O_MA_NHI,
  getHeroById,
  getHeroesByFaction,
  getHeroesByRarity,
  getUnlockedHeroes,
} from '../heroes';
import { HeroFaction, HeroRarity } from '@/types/hero';

describe('Hero Constants', () => {
  describe('Hero Collections', () => {
    it('should have all heroes defined', () => {
      expect(ALL_HEROES.length).toBeGreaterThan(0);
      expect(VIETNAMESE_HEROES.length).toBeGreaterThan(0);
      expect(MONGOL_HEROES.length).toBeGreaterThan(0);
    });

    it('should have correct total count', () => {
      expect(ALL_HEROES.length).toBe(VIETNAMESE_HEROES.length + MONGOL_HEROES.length);
    });

    it('should have Vietnamese heroes with correct faction', () => {
      VIETNAMESE_HEROES.forEach(hero => {
        expect(hero.faction).toBe(HeroFaction.VIETNAMESE);
      });
    });

    it('should have Mongol heroes with correct faction', () => {
      MONGOL_HEROES.forEach(hero => {
        expect(hero.faction).toBe(HeroFaction.MONGOL);
      });
    });
  });

  describe('Individual Heroes', () => {
    it('should have Trần Hưng Đạo with correct properties', () => {
      expect(TRAN_HUNG_DAO.id).toBe('hero-tran-hung-dao');
      expect(TRAN_HUNG_DAO.nameVietnamese).toBe('Trần Hưng Đạo');
      expect(TRAN_HUNG_DAO.faction).toBe(HeroFaction.VIETNAMESE);
      expect(TRAN_HUNG_DAO.rarity).toBe(HeroRarity.LEGENDARY);
      expect(TRAN_HUNG_DAO.stats.leadership).toBe(100);
      expect(TRAN_HUNG_DAO.abilities.length).toBeGreaterThan(0);
    });

    it('should have Ô Mã Nhi with correct properties', () => {
      expect(O_MA_NHI.id).toBe('hero-o-ma-nhi');
      expect(O_MA_NHI.nameVietnamese).toBe('Ô Mã Nhi');
      expect(O_MA_NHI.faction).toBe(HeroFaction.MONGOL);
    });
  });

  describe('Hero Lookup Functions', () => {
    it('should get hero by ID', () => {
      const hero = getHeroById('hero-tran-hung-dao');
      expect(hero).toBeDefined();
      expect(hero?.nameVietnamese).toBe('Trần Hưng Đạo');
    });

    it('should return undefined for invalid ID', () => {
      const hero = getHeroById('invalid-id');
      expect(hero).toBeUndefined();
    });

    it('should get heroes by faction', () => {
      const vietnameseHeroes = getHeroesByFaction(HeroFaction.VIETNAMESE);
      expect(vietnameseHeroes.length).toBe(VIETNAMESE_HEROES.length);
      
      const mongolHeroes = getHeroesByFaction(HeroFaction.MONGOL);
      expect(mongolHeroes.length).toBe(MONGOL_HEROES.length);
    });

    it('should get heroes by rarity', () => {
      const legendaryHeroes = getHeroesByRarity(HeroRarity.LEGENDARY);
      expect(legendaryHeroes.length).toBeGreaterThan(0);
      legendaryHeroes.forEach(hero => {
        expect(hero.rarity).toBe(HeroRarity.LEGENDARY);
      });
    });
  });

  describe('Unlock System', () => {
    it('should unlock level-based heroes', () => {
      const unlockedHeroes = getUnlockedHeroes(5, [], []);
      expect(unlockedHeroes.length).toBeGreaterThan(0);
      
      // Should include heroes with level requirement <= 5
      const tranHungDao = unlockedHeroes.find(h => h.id === 'hero-tran-hung-dao');
      expect(tranHungDao).toBeDefined();
    });

    it('should not unlock high-level heroes', () => {
      const unlockedHeroes = getUnlockedHeroes(1, [], []);
      const highLevelHero = unlockedHeroes.find(h => 
        h.unlockCondition?.type === 'level' && 
        (h.unlockCondition.requirement as number) > 1
      );
      expect(highLevelHero).toBeUndefined();
    });

    it('should unlock achievement-based heroes', () => {
      const unlockedHeroes = getUnlockedHeroes(10, ['win-10-battles'], []);
      const achievementHero = unlockedHeroes.find(h => 
        h.unlockCondition?.type === 'achievement' && 
        h.unlockCondition.requirement === 'win-10-battles'
      );
      expect(achievementHero).toBeDefined();
    });
  });

  describe('Vietnamese Text Encoding', () => {
    it('should properly encode Vietnamese characters', () => {
      ALL_HEROES.forEach(hero => {
        expect(hero.nameVietnamese).toBeTruthy();
        expect(hero.descriptionVietnamese).toBeTruthy();
        expect(hero.historicalContextVietnamese).toBeTruthy();
        
        hero.abilities.forEach(ability => {
          expect(ability.nameVietnamese).toBeTruthy();
          expect(ability.descriptionVietnamese).toBeTruthy();
        });
      });
    });
  });
});
