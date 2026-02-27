/**
 * Quiz slice tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createQuizSlice, QuizSlice, Reward } from '../quizSlice';

describe('QuizSlice', () => {
  let store: ReturnType<typeof create<QuizSlice>>;

  beforeEach(() => {
    store = create<QuizSlice>()((...args) => ({
      ...createQuizSlice(...args),
    }));
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState();
      expect(state.quiz.questionsAnswered).toBe(0);
      expect(state.quiz.correctAnswers).toBe(0);
      expect(state.quiz.completedCategories).toEqual([]);
      expect(state.quiz.rewards).toEqual([]);
    });
  });

  describe('recordAnswer', () => {
    it('should increment questionsAnswered when recording an answer', () => {
      const { recordAnswer } = store.getState();
      
      recordAnswer(true, 'history');
      
      const state = store.getState();
      expect(state.quiz.questionsAnswered).toBe(1);
    });

    it('should increment correctAnswers when answer is correct', () => {
      const { recordAnswer } = store.getState();
      
      recordAnswer(true, 'history');
      
      const state = store.getState();
      expect(state.quiz.correctAnswers).toBe(1);
    });

    it('should not increment correctAnswers when answer is incorrect', () => {
      const { recordAnswer } = store.getState();
      
      recordAnswer(false, 'history');
      
      const state = store.getState();
      expect(state.quiz.correctAnswers).toBe(0);
      expect(state.quiz.questionsAnswered).toBe(1);
    });

    it('should track multiple answers correctly', () => {
      const { recordAnswer } = store.getState();
      
      recordAnswer(true, 'history');
      recordAnswer(false, 'strategy');
      recordAnswer(true, 'culture');
      
      const state = store.getState();
      expect(state.quiz.questionsAnswered).toBe(3);
      expect(state.quiz.correctAnswers).toBe(2);
    });
  });

  describe('addReward', () => {
    it('should add a reward to the rewards array', () => {
      const { addReward } = store.getState();
      
      const reward: Reward = {
        type: 'resource',
        id: 'gold',
        amount: 50,
      };
      
      addReward(reward);
      
      const state = store.getState();
      expect(state.quiz.rewards).toHaveLength(1);
      expect(state.quiz.rewards[0]).toEqual(reward);
    });

    it('should add multiple rewards', () => {
      const { addReward } = store.getState();
      
      addReward({ type: 'resource', id: 'gold', amount: 50 });
      addReward({ type: 'resource', id: 'gold', amount: 75 });
      addReward({ type: 'hero', id: 'hero-1' });
      
      const state = store.getState();
      expect(state.quiz.rewards).toHaveLength(3);
    });
  });

  describe('completeCategory', () => {
    it('should add a category to completedCategories', () => {
      const { completeCategory } = store.getState();
      
      completeCategory('history');
      
      const state = store.getState();
      expect(state.quiz.completedCategories).toContain('history');
    });

    it('should not add duplicate categories', () => {
      const { completeCategory } = store.getState();
      
      completeCategory('history');
      completeCategory('history');
      
      const state = store.getState();
      expect(state.quiz.completedCategories).toHaveLength(1);
    });

    it('should track multiple completed categories', () => {
      const { completeCategory } = store.getState();
      
      completeCategory('history');
      completeCategory('strategy');
      completeCategory('culture');
      
      const state = store.getState();
      expect(state.quiz.completedCategories).toHaveLength(3);
      expect(state.quiz.completedCategories).toContain('history');
      expect(state.quiz.completedCategories).toContain('strategy');
      expect(state.quiz.completedCategories).toContain('culture');
    });
  });

  describe('resetQuiz', () => {
    it('should reset quiz state to initial values', () => {
      const { recordAnswer, addReward, completeCategory, resetQuiz } = store.getState();
      
      // Add some data
      recordAnswer(true, 'history');
      recordAnswer(true, 'strategy');
      addReward({ type: 'resource', id: 'gold', amount: 50 });
      completeCategory('history');
      
      // Reset
      resetQuiz();
      
      const state = store.getState();
      expect(state.quiz.questionsAnswered).toBe(0);
      expect(state.quiz.correctAnswers).toBe(0);
      expect(state.quiz.completedCategories).toEqual([]);
      expect(state.quiz.rewards).toEqual([]);
    });
  });

  describe('Selectors', () => {
    describe('getAccuracy', () => {
      it('should return 0 when no questions answered', () => {
        const { getAccuracy } = store.getState();
        expect(getAccuracy()).toBe(0);
      });

      it('should calculate accuracy correctly', () => {
        const { recordAnswer, getAccuracy } = store.getState();
        
        recordAnswer(true, 'history');
        recordAnswer(false, 'strategy');
        recordAnswer(true, 'culture');
        recordAnswer(true, 'history');
        
        expect(getAccuracy()).toBe(75); // 3 out of 4 correct
      });

      it('should return 100 when all answers are correct', () => {
        const { recordAnswer, getAccuracy } = store.getState();
        
        recordAnswer(true, 'history');
        recordAnswer(true, 'strategy');
        
        expect(getAccuracy()).toBe(100);
      });

      it('should return 0 when all answers are incorrect', () => {
        const { recordAnswer, getAccuracy } = store.getState();
        
        recordAnswer(false, 'history');
        recordAnswer(false, 'strategy');
        
        expect(getAccuracy()).toBe(0);
      });
    });

    describe('getTotalRewards', () => {
      it('should return 0 when no rewards', () => {
        const { getTotalRewards } = store.getState();
        expect(getTotalRewards()).toBe(0);
      });

      it('should return correct count of rewards', () => {
        const { addReward, getTotalRewards } = store.getState();
        
        addReward({ type: 'resource', id: 'gold', amount: 50 });
        addReward({ type: 'resource', id: 'gold', amount: 75 });
        addReward({ type: 'hero', id: 'hero-1' });
        
        expect(getTotalRewards()).toBe(3);
      });
    });

    describe('isCategoryCompleted', () => {
      it('should return false for uncompleted category', () => {
        const { isCategoryCompleted } = store.getState();
        expect(isCategoryCompleted('history')).toBe(false);
      });

      it('should return true for completed category', () => {
        const { completeCategory, isCategoryCompleted } = store.getState();
        
        completeCategory('history');
        
        expect(isCategoryCompleted('history')).toBe(true);
      });

      it('should return false for different category', () => {
        const { completeCategory, isCategoryCompleted } = store.getState();
        
        completeCategory('history');
        
        expect(isCategoryCompleted('strategy')).toBe(false);
      });
    });
  });
});
