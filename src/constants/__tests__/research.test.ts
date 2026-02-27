/**
 * Unit tests for research constants
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_RESEARCH,
  RESEARCH_BY_ID,
  RESEARCH_BY_TIER,
  getResearchById,
  getResearchByTier,
  arePrerequisitesMet,
  getAvailableResearch,
  canAffordResearch,
  getResearchDurationMs,
  calculateResearchPathCost,
  getUnlockedByResearch,
  IMPROVED_FARMING,
  ADVANCED_FARMING,
  MASTER_FARMING,
  BASIC_TRAINING,
  IRON_WEAPONS,
  LEGENDARY_WEAPONS,
} from '../research';

describe('Research Constants', () => {
  describe('Research Data', () => {
    it('should have valid research nodes', () => {
      expect(ALL_RESEARCH.length).toBeGreaterThan(0);
      
      ALL_RESEARCH.forEach((research) => {
        expect(research.id).toBeTruthy();
        expect(research.name).toBeTruthy();
        expect(research.nameVietnamese).toBeTruthy();
        expect(research.description).toBeTruthy();
        expect(research.descriptionVietnamese).toBeTruthy();
        expect(research.cost).toBeDefined();
        expect(research.duration).toBeGreaterThan(0);
        expect(research.effects.length).toBeGreaterThan(0);
        expect(research.tier).toBeGreaterThanOrEqual(1);
        expect(research.tier).toBeLessThanOrEqual(3);
      });
    });

    it('should have valid costs', () => {
      ALL_RESEARCH.forEach((research) => {
        expect(research.cost.food).toBeGreaterThanOrEqual(0);
        expect(research.cost.gold).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid effects', () => {
      ALL_RESEARCH.forEach((research) => {
        research.effects.forEach((effect) => {
          expect(effect.type).toBeTruthy();
          expect(effect.value).toBeGreaterThan(0);
          expect(effect.description).toBeTruthy();
          expect(effect.descriptionVietnamese).toBeTruthy();
        });
      });
    });

    it('should have unique IDs', () => {
      const ids = ALL_RESEARCH.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('RESEARCH_BY_ID', () => {
    it('should contain all research nodes', () => {
      expect(Object.keys(RESEARCH_BY_ID).length).toBe(ALL_RESEARCH.length);
    });

    it('should map IDs correctly', () => {
      ALL_RESEARCH.forEach((research) => {
        expect(RESEARCH_BY_ID[research.id]).toBe(research);
      });
    });
  });

  describe('RESEARCH_BY_TIER', () => {
    it('should have three tiers', () => {
      expect(RESEARCH_BY_TIER[1]).toBeDefined();
      expect(RESEARCH_BY_TIER[2]).toBeDefined();
      expect(RESEARCH_BY_TIER[3]).toBeDefined();
    });

    it('should categorize research correctly', () => {
      [1, 2, 3].forEach((tier) => {
        RESEARCH_BY_TIER[tier].forEach((research) => {
          expect(research.tier).toBe(tier);
        });
      });
    });

    it('should contain all research nodes', () => {
      const totalInTiers = 
        RESEARCH_BY_TIER[1].length +
        RESEARCH_BY_TIER[2].length +
        RESEARCH_BY_TIER[3].length;
      
      expect(totalInTiers).toBe(ALL_RESEARCH.length);
    });
  });

  describe('getResearchById', () => {
    it('should return correct research node', () => {
      const research = getResearchById('research-improved-farming');
      expect(research).toBe(IMPROVED_FARMING);
    });

    it('should return undefined for invalid ID', () => {
      const research = getResearchById('invalid-id');
      expect(research).toBeUndefined();
    });
  });

  describe('getResearchByTier', () => {
    it('should return tier 1 research', () => {
      const tier1 = getResearchByTier(1);
      expect(tier1.length).toBeGreaterThan(0);
      tier1.forEach((r) => expect(r.tier).toBe(1));
    });

    it('should return tier 2 research', () => {
      const tier2 = getResearchByTier(2);
      expect(tier2.length).toBeGreaterThan(0);
      tier2.forEach((r) => expect(r.tier).toBe(2));
    });

    it('should return tier 3 research', () => {
      const tier3 = getResearchByTier(3);
      expect(tier3.length).toBeGreaterThan(0);
      tier3.forEach((r) => expect(r.tier).toBe(3));
    });

    it('should return empty array for invalid tier', () => {
      const invalid = getResearchByTier(99);
      expect(invalid).toEqual([]);
    });
  });

  describe('arePrerequisitesMet', () => {
    it('should return true for research with no prerequisites', () => {
      const met = arePrerequisitesMet('research-improved-farming', []);
      expect(met).toBe(true);
    });

    it('should return true when all prerequisites are completed', () => {
      const completed = ['research-improved-farming'];
      const met = arePrerequisitesMet('research-advanced-farming', completed);
      expect(met).toBe(true);
    });

    it('should return false when prerequisites are not met', () => {
      const met = arePrerequisitesMet('research-advanced-farming', []);
      expect(met).toBe(false);
    });

    it('should return false for invalid research ID', () => {
      const met = arePrerequisitesMet('invalid-id', []);
      expect(met).toBe(false);
    });

    it('should handle multiple prerequisites', () => {
      const completed = ['research-fortification', 'research-siege-engineering'];
      const met = arePrerequisitesMet('research-bach-dang-tactics', completed);
      expect(met).toBe(true);
    });

    it('should return false when only some prerequisites are met', () => {
      const completed = ['research-fortification'];
      const met = arePrerequisitesMet('research-bach-dang-tactics', completed);
      expect(met).toBe(false);
    });
  });

  describe('getAvailableResearch', () => {
    it('should return tier 1 research when nothing is completed', () => {
      const available = getAvailableResearch([]);
      expect(available.length).toBeGreaterThan(0);
      
      available.forEach((research) => {
        expect(research.prerequisites.length).toBe(0);
      });
    });

    it('should not include completed research', () => {
      const completed = ['research-improved-farming'];
      const available = getAvailableResearch(completed);
      
      const ids = available.map((r) => r.id);
      expect(ids).not.toContain('research-improved-farming');
    });

    it('should include research with met prerequisites', () => {
      const completed = ['research-improved-farming'];
      const available = getAvailableResearch(completed);
      
      const ids = available.map((r) => r.id);
      expect(ids).toContain('research-advanced-farming');
    });

    it('should not include research with unmet prerequisites', () => {
      const completed = ['research-improved-farming'];
      const available = getAvailableResearch(completed);
      
      const ids = available.map((r) => r.id);
      expect(ids).not.toContain('research-master-farming');
    });
  });

  describe('canAffordResearch', () => {
    it('should return true when resources are sufficient', () => {
      const resources = { food: 1000, gold: 1000 };
      const canAfford = canAffordResearch('research-improved-farming', resources);
      expect(canAfford).toBe(true);
    });

    it('should return false when food is insufficient', () => {
      const resources = { food: 50, gold: 1000 };
      const canAfford = canAffordResearch('research-improved-farming', resources);
      expect(canAfford).toBe(false);
    });

    it('should return false when gold is insufficient', () => {
      const resources = { food: 1000, gold: 50 };
      const canAfford = canAffordResearch('research-improved-farming', resources);
      expect(canAfford).toBe(false);
    });

    it('should return true when resources exactly match cost', () => {
      const resources = {
        food: IMPROVED_FARMING.cost.food,
        gold: IMPROVED_FARMING.cost.gold,
      };
      const canAfford = canAffordResearch('research-improved-farming', resources);
      expect(canAfford).toBe(true);
    });

    it('should return false for invalid research ID', () => {
      const resources = { food: 1000, gold: 1000 };
      const canAfford = canAffordResearch('invalid-id', resources);
      expect(canAfford).toBe(false);
    });
  });

  describe('getResearchDurationMs', () => {
    it('should convert seconds to milliseconds', () => {
      const durationMs = getResearchDurationMs('research-improved-farming');
      expect(durationMs).toBe(IMPROVED_FARMING.duration * 1000);
    });

    it('should return 0 for invalid research ID', () => {
      const durationMs = getResearchDurationMs('invalid-id');
      expect(durationMs).toBe(0);
    });

    it('should return correct duration for all research', () => {
      ALL_RESEARCH.forEach((research) => {
        const durationMs = getResearchDurationMs(research.id);
        expect(durationMs).toBe(research.duration * 1000);
      });
    });
  });

  describe('calculateResearchPathCost', () => {
    it('should calculate cost for single research', () => {
      const cost = calculateResearchPathCost(['research-improved-farming']);
      expect(cost.food).toBe(IMPROVED_FARMING.cost.food);
      expect(cost.gold).toBe(IMPROVED_FARMING.cost.gold);
    });

    it('should calculate cost for research path', () => {
      const path = [
        'research-improved-farming',
        'research-advanced-farming',
        'research-master-farming',
      ];
      const cost = calculateResearchPathCost(path);
      
      const expectedFood =
        IMPROVED_FARMING.cost.food +
        ADVANCED_FARMING.cost.food +
        MASTER_FARMING.cost.food;
      
      const expectedGold =
        IMPROVED_FARMING.cost.gold +
        ADVANCED_FARMING.cost.gold +
        MASTER_FARMING.cost.gold;
      
      expect(cost.food).toBe(expectedFood);
      expect(cost.gold).toBe(expectedGold);
    });

    it('should return zero for empty path', () => {
      const cost = calculateResearchPathCost([]);
      expect(cost.food).toBe(0);
      expect(cost.gold).toBe(0);
    });

    it('should ignore invalid research IDs', () => {
      const path = ['research-improved-farming', 'invalid-id'];
      const cost = calculateResearchPathCost(path);
      
      expect(cost.food).toBe(IMPROVED_FARMING.cost.food);
      expect(cost.gold).toBe(IMPROVED_FARMING.cost.gold);
    });
  });

  describe('getUnlockedByResearch', () => {
    it('should return research unlocked by completing a prerequisite', () => {
      const unlocked = getUnlockedByResearch('research-improved-farming', []);
      const ids = unlocked.map((r) => r.id);
      
      expect(ids).toContain('research-advanced-farming');
    });

    it('should not return research with additional unmet prerequisites', () => {
      const unlocked = getUnlockedByResearch('research-fortification', []);
      const ids = unlocked.map((r) => r.id);
      
      // Bach Dang Tactics requires both fortification AND siege engineering
      expect(ids).not.toContain('research-bach-dang-tactics');
    });

    it('should return research when all prerequisites are met', () => {
      const unlocked = getUnlockedByResearch(
        'research-siege-engineering',
        ['research-fortification']
      );
      const ids = unlocked.map((r) => r.id);
      
      expect(ids).toContain('research-bach-dang-tactics');
    });

    it('should return empty array when nothing is unlocked', () => {
      const unlocked = getUnlockedByResearch('research-master-farming', [
        'research-improved-farming',
        'research-advanced-farming',
      ]);
      
      expect(unlocked.length).toBe(0);
    });
  });

  describe('Research Tree Structure', () => {
    it('should have valid prerequisite chains', () => {
      ALL_RESEARCH.forEach((research) => {
        research.prerequisites.forEach((prereqId) => {
          const prereq = getResearchById(prereqId);
          expect(prereq).toBeDefined();
        });
      });
    });

    it('should have tier 1 research with no prerequisites', () => {
      const tier1 = getResearchByTier(1);
      tier1.forEach((research) => {
        expect(research.prerequisites.length).toBe(0);
      });
    });

    it('should have higher tier research cost more', () => {
      const tier1Avg = RESEARCH_BY_TIER[1].reduce(
        (sum, r) => sum + r.cost.food + r.cost.gold,
        0
      ) / RESEARCH_BY_TIER[1].length;
      
      const tier2Avg = RESEARCH_BY_TIER[2].reduce(
        (sum, r) => sum + r.cost.food + r.cost.gold,
        0
      ) / RESEARCH_BY_TIER[2].length;
      
      const tier3Avg = RESEARCH_BY_TIER[3].reduce(
        (sum, r) => sum + r.cost.food + r.cost.gold,
        0
      ) / RESEARCH_BY_TIER[3].length;
      
      expect(tier2Avg).toBeGreaterThan(tier1Avg);
      expect(tier3Avg).toBeGreaterThan(tier2Avg);
    });

    it('should have higher tier research take longer', () => {
      const tier1Avg = RESEARCH_BY_TIER[1].reduce(
        (sum, r) => sum + r.duration,
        0
      ) / RESEARCH_BY_TIER[1].length;
      
      const tier2Avg = RESEARCH_BY_TIER[2].reduce(
        (sum, r) => sum + r.duration,
        0
      ) / RESEARCH_BY_TIER[2].length;
      
      const tier3Avg = RESEARCH_BY_TIER[3].reduce(
        (sum, r) => sum + r.duration,
        0
      ) / RESEARCH_BY_TIER[3].length;
      
      expect(tier2Avg).toBeGreaterThan(tier1Avg);
      expect(tier3Avg).toBeGreaterThan(tier2Avg);
    });
  });

  describe('Research Progression Paths', () => {
    it('should have farming progression path', () => {
      expect(IMPROVED_FARMING.prerequisites.length).toBe(0);
      expect(ADVANCED_FARMING.prerequisites).toContain('research-improved-farming');
      expect(MASTER_FARMING.prerequisites).toContain('research-advanced-farming');
    });

    it('should have military progression path', () => {
      expect(BASIC_TRAINING.prerequisites.length).toBe(0);
      expect(IRON_WEAPONS.prerequisites).toContain('research-basic-training');
      expect(LEGENDARY_WEAPONS.prerequisites).toContain('research-iron-weapons');
    });

    it('should allow parallel research paths', () => {
      const tier1 = getResearchByTier(1);
      expect(tier1.length).toBeGreaterThan(1);
      
      // All tier 1 research should be available at start
      tier1.forEach((research) => {
        expect(research.prerequisites.length).toBe(0);
      });
    });
  });
});
