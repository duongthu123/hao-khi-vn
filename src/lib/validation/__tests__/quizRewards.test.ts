/**
 * Unit tests for quiz reward calculation
 * Tests reward calculation, accuracy tracking, and category completion
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGoldReward,
  calculateExperienceReward,
  calculateQuizCompletionReward,
  calculateAccuracy,
  isCategoryCompleted,
  createReward,
} from '../quizRewards';
import { QuizDifficulty } from '@/schemas/quiz.schema';

describe('Quiz Reward Calculation', () => {
  describe('calculateGoldReward', () => {
    it('should return 50 gold for easy questions', () => {
      expect(calculateGoldReward('easy')).toBe(50);
    });

    it('should return 75 gold for medium questions', () => {
      expect(calculateGoldReward('medium')).toBe(75);
    });

    it('should return 100 gold for hard questions', () => {
      expect(calculateGoldReward('hard')).toBe(100);
    });
  });

  describe('calculateExperienceReward', () => {
    it('should return 20 experience for easy questions', () => {
      expect(calculateExperienceReward('easy')).toBe(20);
    });

    it('should return 30 experience for medium questions', () => {
      expect(calculateExperienceReward('medium')).toBe(30);
    });

    it('should return 50 experience for hard questions', () => {
      expect(calculateExperienceReward('hard')).toBe(50);
    });
  });

  describe('calculateQuizCompletionReward', () => {
    it('should calculate rewards for all correct answers', () => {
      const difficulties: QuizDifficulty[] = ['easy', 'medium', 'hard'];
      const result = calculateQuizCompletionReward(3, 3, difficulties);
      
      expect(result.gold).toBe(225); // 50 + 75 + 100
      expect(result.experience).toBe(100); // 20 + 30 + 50
    });

    it('should calculate rewards for partial correct answers', () => {
      const difficulties: QuizDifficulty[] = ['easy', 'medium', 'hard', 'easy'];
      const result = calculateQuizCompletionReward(2, 4, difficulties);
      
      expect(result.gold).toBe(125); // 50 + 75 (first 2)
      expect(result.experience).toBe(50); // 20 + 30 (first 2)
    });

    it('should return zero rewards for no correct answers', () => {
      const difficulties: QuizDifficulty[] = ['easy', 'medium'];
      const result = calculateQuizCompletionReward(0, 2, difficulties);
      
      expect(result.gold).toBe(0);
      expect(result.experience).toBe(0);
    });

    it('should handle all easy questions', () => {
      const difficulties: QuizDifficulty[] = ['easy', 'easy', 'easy'];
      const result = calculateQuizCompletionReward(3, 3, difficulties);
      
      expect(result.gold).toBe(150); // 50 * 3
      expect(result.experience).toBe(60); // 20 * 3
    });

    it('should handle all hard questions', () => {
      const difficulties: QuizDifficulty[] = ['hard', 'hard'];
      const result = calculateQuizCompletionReward(2, 2, difficulties);
      
      expect(result.gold).toBe(200); // 100 * 2
      expect(result.experience).toBe(100); // 50 * 2
    });

    it('should throw error for negative correct answers', () => {
      const difficulties: QuizDifficulty[] = ['easy'];
      expect(() => calculateQuizCompletionReward(-1, 1, difficulties))
        .toThrow('Invalid quiz completion parameters');
    });

    it('should throw error for negative total questions', () => {
      const difficulties: QuizDifficulty[] = [];
      expect(() => calculateQuizCompletionReward(0, -1, difficulties))
        .toThrow('Invalid quiz completion parameters');
    });

    it('should throw error when correct answers exceed total', () => {
      const difficulties: QuizDifficulty[] = ['easy', 'medium'];
      expect(() => calculateQuizCompletionReward(5, 2, difficulties))
        .toThrow('Invalid quiz completion parameters');
    });

    it('should throw error when difficulties array length mismatch', () => {
      const difficulties: QuizDifficulty[] = ['easy'];
      expect(() => calculateQuizCompletionReward(2, 3, difficulties))
        .toThrow('Difficulties array length must match total questions');
    });

    it('should handle empty quiz', () => {
      const difficulties: QuizDifficulty[] = [];
      const result = calculateQuizCompletionReward(0, 0, difficulties);
      
      expect(result.gold).toBe(0);
      expect(result.experience).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('should return 0 for no questions answered', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it('should return 100 for all correct answers', () => {
      expect(calculateAccuracy(5, 5)).toBe(100);
    });

    it('should return 0 for all incorrect answers', () => {
      expect(calculateAccuracy(0, 5)).toBe(0);
    });

    it('should calculate 50% accuracy correctly', () => {
      expect(calculateAccuracy(5, 10)).toBe(50);
    });

    it('should calculate 75% accuracy correctly', () => {
      expect(calculateAccuracy(3, 4)).toBe(75);
    });

    it('should calculate 33% accuracy correctly', () => {
      expect(calculateAccuracy(1, 3)).toBe(33);
    });

    it('should round accuracy to nearest integer', () => {
      expect(calculateAccuracy(2, 3)).toBe(67); // 66.666... rounds to 67
    });

    it('should throw error for negative correct answers', () => {
      expect(() => calculateAccuracy(-1, 5))
        .toThrow('Answer counts cannot be negative');
    });

    it('should throw error for negative total questions', () => {
      expect(() => calculateAccuracy(0, -1))
        .toThrow('Answer counts cannot be negative');
    });

    it('should throw error when correct exceeds total', () => {
      expect(() => calculateAccuracy(10, 5))
        .toThrow('Correct answers cannot exceed total questions');
    });
  });

  describe('isCategoryCompleted', () => {
    it('should return true when accuracy meets threshold', () => {
      expect(isCategoryCompleted(8, 10, 80)).toBe(true);
    });

    it('should return true when accuracy exceeds threshold', () => {
      expect(isCategoryCompleted(9, 10, 80)).toBe(true);
    });

    it('should return false when accuracy below threshold', () => {
      expect(isCategoryCompleted(7, 10, 80)).toBe(false);
    });

    it('should use default 80% threshold', () => {
      expect(isCategoryCompleted(8, 10)).toBe(true);
      expect(isCategoryCompleted(7, 10)).toBe(false);
    });

    it('should return false for empty category', () => {
      expect(isCategoryCompleted(0, 0, 80)).toBe(false);
    });

    it('should handle 100% threshold', () => {
      expect(isCategoryCompleted(10, 10, 100)).toBe(true);
      expect(isCategoryCompleted(9, 10, 100)).toBe(false);
    });

    it('should handle 0% threshold', () => {
      expect(isCategoryCompleted(0, 10, 0)).toBe(true);
      expect(isCategoryCompleted(1, 10, 0)).toBe(true);
    });

    it('should throw error for negative threshold', () => {
      expect(() => isCategoryCompleted(5, 10, -10))
        .toThrow('Threshold must be between 0 and 100');
    });

    it('should throw error for threshold above 100', () => {
      expect(() => isCategoryCompleted(5, 10, 150))
        .toThrow('Threshold must be between 0 and 100');
    });

    it('should handle edge case of 50% threshold', () => {
      expect(isCategoryCompleted(5, 10, 50)).toBe(true);
      expect(isCategoryCompleted(4, 10, 50)).toBe(false);
    });
  });

  describe('createReward', () => {
    it('should create resource reward with amount', () => {
      const reward = createReward('resource', 'gold', 100);
      
      expect(reward.type).toBe('resource');
      expect(reward.id).toBe('gold');
      expect(reward.amount).toBe(100);
    });

    it('should create hero reward without amount', () => {
      const reward = createReward('hero', 'hero-tran-hung-dao');
      
      expect(reward.type).toBe('hero');
      expect(reward.id).toBe('hero-tran-hung-dao');
      expect(reward.amount).toBeUndefined();
    });

    it('should create item reward', () => {
      const reward = createReward('item', 'legendary-sword', 1);
      
      expect(reward.type).toBe('item');
      expect(reward.id).toBe('legendary-sword');
      expect(reward.amount).toBe(1);
    });

    it('should create achievement reward', () => {
      const reward = createReward('achievement', 'quiz-master');
      
      expect(reward.type).toBe('achievement');
      expect(reward.id).toBe('quiz-master');
    });

    it('should throw error for empty id', () => {
      expect(() => createReward('resource', '', 100))
        .toThrow('Reward id cannot be empty');
    });

    it('should throw error for whitespace-only id', () => {
      expect(() => createReward('resource', '   ', 100))
        .toThrow('Reward id cannot be empty');
    });

    it('should throw error for zero amount', () => {
      expect(() => createReward('resource', 'gold', 0))
        .toThrow('Reward amount must be positive');
    });

    it('should throw error for negative amount', () => {
      expect(() => createReward('resource', 'gold', -50))
        .toThrow('Reward amount must be positive');
    });

    it('should allow undefined amount', () => {
      const reward = createReward('hero', 'hero-id');
      expect(reward.amount).toBeUndefined();
    });
  });
});
