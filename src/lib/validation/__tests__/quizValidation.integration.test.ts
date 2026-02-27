/**
 * Integration tests for quiz validation system
 * Tests the complete flow: schema validation → progress tracking → reward calculation
 */

import { describe, it, expect } from 'vitest';
import { QuizQuestionSchema, QuizProgressSchema, RewardSchema } from '@/schemas/quiz.schema';
import { validateQuizQuestions } from '../validateQuizData';
import {
  calculateQuizCompletionReward,
  calculateAccuracy,
  isCategoryCompleted,
  createReward,
} from '../quizRewards';

describe('Quiz Validation Integration', () => {
  describe('Complete quiz flow validation', () => {
    it('should validate and process a complete quiz session', () => {
      // Step 1: Validate quiz questions
      const rawQuestions = [
        {
          id: 'q1',
          question: 'Ai là người lãnh đạo quân Việt trong trận Bạch Đằng?',
          answers: ['Trần Hưng Đạo', 'Lý Thường Kiệt', 'Ngô Quyền'],
          correctAnswer: 0,
          explanation: 'Trần Hưng Đạo là vị tướng tài ba...',
          difficulty: 'easy',
          category: 'history',
        },
        {
          id: 'q2',
          question: 'Chiến thuật nào được sử dụng trong trận Bạch Đằng?',
          answers: ['Cọc ngầm', 'Phục kích', 'Bao vây'],
          correctAnswer: 0,
          explanation: 'Cọc ngầm dưới sông là chiến thuật chính...',
          difficulty: 'medium',
          category: 'strategy',
        },
        {
          id: 'q3',
          question: 'Triều đại nào đánh bại quân Mông Cổ?',
          answers: ['Lý', 'Trần', 'Lê'],
          correctAnswer: 1,
          explanation: 'Nhà Trần đã ba lần đánh bại quân Mông Cổ...',
          difficulty: 'hard',
          category: 'history',
        },
      ];

      const validatedQuestions = validateQuizQuestions(rawQuestions);
      expect(validatedQuestions).toHaveLength(3);

      // Step 2: Simulate answering questions
      const userAnswers = [0, 0, 1]; // All correct
      const correctCount = userAnswers.filter((answer, idx) => 
        answer === validatedQuestions[idx].correctAnswer
      ).length;

      expect(correctCount).toBe(3);

      // Step 3: Calculate accuracy
      const accuracy = calculateAccuracy(correctCount, validatedQuestions.length);
      expect(accuracy).toBe(100);

      // Step 4: Calculate rewards
      const difficulties = validatedQuestions.map(q => q.difficulty);
      const rewards = calculateQuizCompletionReward(correctCount, validatedQuestions.length, difficulties);
      
      expect(rewards.gold).toBe(225); // 50 + 75 + 100
      expect(rewards.experience).toBe(100); // 20 + 30 + 50
    });

    it('should handle partial correct answers', () => {
      const rawQuestions = [
        {
          id: 'q1',
          question: 'Test 1',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Explanation',
          difficulty: 'easy',
          category: 'history',
        },
        {
          id: 'q2',
          question: 'Test 2',
          answers: ['A', 'B'],
          correctAnswer: 1,
          explanation: 'Explanation',
          difficulty: 'medium',
          category: 'strategy',
        },
        {
          id: 'q3',
          question: 'Test 3',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Explanation',
          difficulty: 'hard',
          category: 'culture',
        },
      ];

      const validatedQuestions = validateQuizQuestions(rawQuestions);
      
      // User gets first and third correct, second wrong
      const userAnswers = [0, 0, 0]; // 2 correct out of 3
      const correctCount = userAnswers.filter((answer, idx) => 
        answer === validatedQuestions[idx].correctAnswer
      ).length;

      expect(correctCount).toBe(2);

      const accuracy = calculateAccuracy(correctCount, validatedQuestions.length);
      expect(accuracy).toBe(67); // 66.666... rounded

      const difficulties = validatedQuestions.map(q => q.difficulty);
      const rewards = calculateQuizCompletionReward(correctCount, validatedQuestions.length, difficulties);
      
      // Rewards are calculated for first 2 questions (easy + medium)
      expect(rewards.gold).toBe(125); // 50 (easy) + 75 (medium)
      expect(rewards.experience).toBe(50); // 20 (easy) + 30 (medium)
    });
  });

  describe('Quiz progress validation', () => {
    it('should validate correct quiz progress', () => {
      const progress = {
        questionsAnswered: 10,
        correctAnswers: 7,
        completedCategories: ['history', 'strategy'],
        rewards: [
          { type: 'resource', id: 'gold', amount: 500 },
          { type: 'hero', id: 'hero-1' },
        ],
      };

      const result = QuizProgressSchema.parse(progress);
      expect(result.questionsAnswered).toBe(10);
      expect(result.correctAnswers).toBe(7);
    });

    it('should reject progress with more correct than answered', () => {
      const progress = {
        questionsAnswered: 5,
        correctAnswers: 10, // Invalid: more correct than answered
        completedCategories: [],
        rewards: [],
      };

      expect(() => QuizProgressSchema.parse(progress)).toThrow();
    });

    it('should reject negative question counts', () => {
      const progress = {
        questionsAnswered: -1,
        correctAnswers: 0,
        completedCategories: [],
        rewards: [],
      };

      expect(() => QuizProgressSchema.parse(progress)).toThrow();
    });

    it('should validate rewards array', () => {
      const progress = {
        questionsAnswered: 5,
        correctAnswers: 3,
        completedCategories: ['history'],
        rewards: [
          { type: 'resource', id: 'gold', amount: 150 },
          { type: 'resource', id: 'food', amount: 100 },
          { type: 'hero', id: 'hero-tran-hung-dao' },
        ],
      };

      const result = QuizProgressSchema.parse(progress);
      expect(result.rewards).toHaveLength(3);
    });
  });

  describe('Reward schema validation', () => {
    it('should validate resource reward', () => {
      const reward = { type: 'resource', id: 'gold', amount: 100 };
      const result = RewardSchema.parse(reward);
      
      expect(result.type).toBe('resource');
      expect(result.id).toBe('gold');
      expect(result.amount).toBe(100);
    });

    it('should validate hero reward without amount', () => {
      const reward = { type: 'hero', id: 'hero-1' };
      const result = RewardSchema.parse(reward);
      
      expect(result.type).toBe('hero');
      expect(result.id).toBe('hero-1');
      expect(result.amount).toBeUndefined();
    });

    it('should reject reward with empty id', () => {
      const reward = { type: 'resource', id: '', amount: 100 };
      expect(() => RewardSchema.parse(reward)).toThrow();
    });

    it('should reject reward with zero amount', () => {
      const reward = { type: 'resource', id: 'gold', amount: 0 };
      expect(() => RewardSchema.parse(reward)).toThrow();
    });

    it('should reject reward with negative amount', () => {
      const reward = { type: 'resource', id: 'gold', amount: -50 };
      expect(() => RewardSchema.parse(reward)).toThrow();
    });

    it('should reject invalid reward type', () => {
      const reward = { type: 'invalid', id: 'test', amount: 100 };
      expect(() => RewardSchema.parse(reward)).toThrow();
    });
  });

  describe('Category completion tracking', () => {
    it('should track category completion with 80% threshold', () => {
      // History category: 8 out of 10 correct
      expect(isCategoryCompleted(8, 10, 80)).toBe(true);
      
      // Strategy category: 6 out of 10 correct
      expect(isCategoryCompleted(6, 10, 80)).toBe(false);
      
      // Culture category: 10 out of 10 correct
      expect(isCategoryCompleted(10, 10, 80)).toBe(true);
    });

    it('should handle multiple categories with different thresholds', () => {
      // Easy category: 60% threshold
      expect(isCategoryCompleted(6, 10, 60)).toBe(true);
      
      // Hard category: 90% threshold
      expect(isCategoryCompleted(9, 10, 90)).toBe(true);
      expect(isCategoryCompleted(8, 10, 90)).toBe(false);
    });
  });

  describe('Reward creation and validation', () => {
    it('should create and validate multiple reward types', () => {
      const goldReward = createReward('resource', 'gold', 100);
      expect(() => RewardSchema.parse(goldReward)).not.toThrow();

      const heroReward = createReward('hero', 'hero-id');
      expect(() => RewardSchema.parse(heroReward)).not.toThrow();

      const itemReward = createReward('item', 'item-id', 1);
      expect(() => RewardSchema.parse(itemReward)).not.toThrow();

      const achievementReward = createReward('achievement', 'achievement-id');
      expect(() => RewardSchema.parse(achievementReward)).not.toThrow();
    });

    it('should validate reward amounts are positive', () => {
      expect(() => createReward('resource', 'gold', -100)).toThrow();
      expect(() => createReward('resource', 'gold', 0)).toThrow();
      expect(() => createReward('resource', 'gold', 1)).not.toThrow();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle quiz with single question', () => {
      const questions = [
        {
          id: 'q1',
          question: 'Test?',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Explanation',
          difficulty: 'easy',
          category: 'history',
        },
      ];

      const validated = validateQuizQuestions(questions);
      expect(validated).toHaveLength(1);

      const accuracy = calculateAccuracy(1, 1);
      expect(accuracy).toBe(100);

      const rewards = calculateQuizCompletionReward(1, 1, ['easy']);
      expect(rewards.gold).toBe(50);
      expect(rewards.experience).toBe(20);
    });

    it('should handle quiz with all same difficulty', () => {
      const difficulties = ['medium', 'medium', 'medium', 'medium'];
      const rewards = calculateQuizCompletionReward(4, 4, difficulties as any);
      
      expect(rewards.gold).toBe(300); // 75 * 4
      expect(rewards.experience).toBe(120); // 30 * 4
    });

    it('should handle mixed difficulty distribution', () => {
      const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard'];
      const rewards = calculateQuizCompletionReward(5, 5, difficulties as any);
      
      expect(rewards.gold).toBe(350); // 50*2 + 75*2 + 100
      expect(rewards.experience).toBe(150); // 20*2 + 30*2 + 50
    });

    it('should validate question with maximum answers', () => {
      const question = {
        id: 'q1',
        question: 'Test?',
        answers: ['A', 'B', 'C', 'D', 'E', 'F'], // 6 answers (max)
        correctAnswer: 2,
        explanation: 'Explanation',
        difficulty: 'hard',
        category: 'strategy',
      };

      expect(() => QuizQuestionSchema.parse(question)).not.toThrow();
    });

    it('should reject question with too many answers', () => {
      const question = {
        id: 'q1',
        question: 'Test?',
        answers: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // 7 answers (too many)
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'history',
      };

      expect(() => QuizQuestionSchema.parse(question)).toThrow();
    });

    it('should validate progress with empty rewards', () => {
      const progress = {
        questionsAnswered: 5,
        correctAnswers: 3,
        completedCategories: ['history'],
        rewards: [],
      };

      expect(() => QuizProgressSchema.parse(progress)).not.toThrow();
    });

    it('should validate progress with multiple rewards', () => {
      const progress = {
        questionsAnswered: 10,
        correctAnswers: 8,
        completedCategories: ['history', 'strategy'],
        rewards: [
          { type: 'resource', id: 'gold', amount: 600 },
          { type: 'resource', id: 'food', amount: 200 },
          { type: 'hero', id: 'hero-1' },
          { type: 'achievement', id: 'quiz-master' },
        ],
      };

      const result = QuizProgressSchema.parse(progress);
      expect(result.rewards).toHaveLength(4);
    });
  });

  describe('Real-world quiz scenarios', () => {
    it('should handle perfect score scenario', () => {
      // Player answers all questions correctly
      const questions = [
        { difficulty: 'easy', category: 'history' },
        { difficulty: 'medium', category: 'strategy' },
        { difficulty: 'hard', category: 'culture' },
        { difficulty: 'easy', category: 'history' },
        { difficulty: 'medium', category: 'strategy' },
      ];

      const correctAnswers = 5;
      const totalQuestions = 5;
      const accuracy = calculateAccuracy(correctAnswers, totalQuestions);
      
      expect(accuracy).toBe(100);

      const difficulties = questions.map(q => q.difficulty) as any;
      const rewards = calculateQuizCompletionReward(correctAnswers, totalQuestions, difficulties);
      
      expect(rewards.gold).toBe(350); // 50 + 75 + 100 + 50 + 75
      expect(rewards.experience).toBe(150); // 20 + 30 + 50 + 20 + 30
    });

    it('should handle failing score scenario', () => {
      // Player answers only 2 out of 10 correctly
      const difficulties = Array(10).fill('medium') as any;
      const correctAnswers = 2;
      const totalQuestions = 10;
      
      const accuracy = calculateAccuracy(correctAnswers, totalQuestions);
      expect(accuracy).toBe(20);

      const rewards = calculateQuizCompletionReward(correctAnswers, totalQuestions, difficulties);
      expect(rewards.gold).toBe(150); // 75 * 2
      expect(rewards.experience).toBe(60); // 30 * 2
    });

    it('should handle category-specific progress', () => {
      // History category: 9 out of 10 correct (90%)
      expect(isCategoryCompleted(9, 10, 80)).toBe(true);
      
      // Strategy category: 7 out of 10 correct (70%)
      expect(isCategoryCompleted(7, 10, 80)).toBe(false);
      
      // Culture category: 8 out of 10 correct (80%)
      expect(isCategoryCompleted(8, 10, 80)).toBe(true);
    });

    it('should calculate rewards for difficulty-weighted quiz', () => {
      // Quiz with more hard questions
      const difficulties = ['hard', 'hard', 'hard', 'medium', 'easy'] as any;
      const rewards = calculateQuizCompletionReward(5, 5, difficulties);
      
      expect(rewards.gold).toBe(425); // 100*3 + 75 + 50
      expect(rewards.experience).toBe(200); // 50*3 + 30 + 20
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle empty quiz gracefully', () => {
      const accuracy = calculateAccuracy(0, 0);
      expect(accuracy).toBe(0);

      const rewards = calculateQuizCompletionReward(0, 0, []);
      expect(rewards.gold).toBe(0);
      expect(rewards.experience).toBe(0);
    });

    it('should validate question correctAnswer bounds', () => {
      const validQuestion = {
        id: 'q1',
        question: 'Test?',
        answers: ['A', 'B', 'C'],
        correctAnswer: 2, // Valid: last index
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'history',
      };

      expect(() => QuizQuestionSchema.parse(validQuestion)).not.toThrow();

      const invalidQuestion = {
        ...validQuestion,
        correctAnswer: 3, // Invalid: out of bounds
      };

      expect(() => QuizQuestionSchema.parse(invalidQuestion)).toThrow();
    });

    it('should reject malformed quiz data early', () => {
      const malformedQuestions = [
        {
          id: 'q1',
          question: 'Test?',
          answers: ['A'], // Too few answers
          correctAnswer: 0,
          explanation: 'Explanation',
          difficulty: 'easy',
          category: 'history',
        },
      ];

      expect(() => validateQuizQuestions(malformedQuestions)).toThrow();
    });

    it('should handle reward creation with validation', () => {
      const reward = createReward('resource', 'gold', 100);
      expect(() => RewardSchema.parse(reward)).not.toThrow();

      expect(() => createReward('resource', '', 100)).toThrow();
      expect(() => createReward('resource', 'gold', -1)).toThrow();
    });
  });

  describe('Performance and scalability', () => {
    it('should handle large quiz with many questions', () => {
      const largeQuiz = Array.from({ length: 100 }, (_, index) => ({
        id: `q${index}`,
        question: `Question ${index}?`,
        answers: ['A', 'B', 'C', 'D'],
        correctAnswer: index % 4,
        explanation: `Explanation ${index}`,
        difficulty: ['easy', 'medium', 'hard'][index % 3] as any,
        category: ['history', 'strategy', 'culture'][index % 3] as any,
      }));

      const validated = validateQuizQuestions(largeQuiz);
      expect(validated).toHaveLength(100);

      const difficulties = validated.map(q => q.difficulty);
      const rewards = calculateQuizCompletionReward(100, 100, difficulties);
      
      // Should calculate without errors
      expect(rewards.gold).toBeGreaterThan(0);
      expect(rewards.experience).toBeGreaterThan(0);
    });

    it('should handle progress with many completed categories', () => {
      const progress = {
        questionsAnswered: 50,
        correctAnswers: 40,
        completedCategories: ['history', 'strategy', 'culture', 'advanced-history', 'advanced-strategy'],
        rewards: Array.from({ length: 40 }, () => ({
          type: 'resource' as const,
          id: 'gold',
          amount: 75,
        })),
      };

      expect(() => QuizProgressSchema.parse(progress)).not.toThrow();
    });
  });

  describe('Boundary value testing', () => {
    it('should handle minimum valid quiz', () => {
      const minQuiz = [
        {
          id: 'q',
          question: 'Q?',
          answers: ['A', 'B'], // Minimum 2 answers
          correctAnswer: 0,
          explanation: '',
          difficulty: 'easy',
          category: 'history',
        },
      ];

      expect(() => validateQuizQuestions(minQuiz)).not.toThrow();
    });

    it('should handle accuracy at exact threshold', () => {
      // Exactly 80% correct
      expect(isCategoryCompleted(8, 10, 80)).toBe(true);
      expect(isCategoryCompleted(80, 100, 80)).toBe(true);
      
      // Just below 80%
      expect(isCategoryCompleted(79, 100, 80)).toBe(false);
    });

    it('should handle single correct answer', () => {
      const accuracy = calculateAccuracy(1, 1);
      expect(accuracy).toBe(100);

      const rewards = calculateQuizCompletionReward(1, 1, ['easy']);
      expect(rewards.gold).toBe(50);
      expect(rewards.experience).toBe(20);
    });

    it('should handle maximum difficulty quiz', () => {
      const difficulties = Array(10).fill('hard') as any;
      const rewards = calculateQuizCompletionReward(10, 10, difficulties);
      
      expect(rewards.gold).toBe(1000); // 100 * 10
      expect(rewards.experience).toBe(500); // 50 * 10
    });
  });
});
