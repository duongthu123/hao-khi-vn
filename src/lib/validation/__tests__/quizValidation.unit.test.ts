/**
 * Unit tests for quiz validation
 * Tests quiz question schema validation, progress tracking, and reward calculation
 * **Validates: Requirements 27.5**
 */

import { describe, it, expect } from 'vitest';
import { validateQuizQuestions, loadQuizQuestions } from '../validateQuizData';
import {
  calculateGoldReward,
  calculateExperienceReward,
  calculateQuizCompletionReward,
  calculateAccuracy,
  isCategoryCompleted,
  createReward,
} from '../quizRewards';
import {
  QuizQuestionSchema,
  QuizProgressSchema,
  RewardSchema,
  type QuizQuestion,
  type QuizProgress,
  type Reward,
} from '@/schemas/quiz.schema';

describe('Quiz Validation Unit Tests', () => {
  describe('Quiz Question Schema Validation', () => {
    describe('Valid quiz questions', () => {
      it('should validate a well-formed quiz question', () => {
        const validQuestion = {
          id: 'q-001',
          question: 'Ai là người lãnh đạo quân Việt trong trận Bạch Đằng?',
          answers: ['Trần Hưng Đạo', 'Lý Thường Kiệt', 'Ngô Quyền'],
          correctAnswer: 0,
          explanation: 'Trần Hưng Đạo là vị tướng tài ba đã lãnh đạo quân Việt.',
          difficulty: 'easy',
          category: 'history',
        };

        const result = QuizQuestionSchema.parse(validQuestion);
        expect(result).toEqual(validQuestion);
      });

      it('should validate question with minimum 2 answers', () => {
        const question = {
          id: 'q-002',
          question: 'Test question?',
          answers: ['Answer A', 'Answer B'],
          correctAnswer: 0,
          explanation: 'Test explanation',
          difficulty: 'medium',
          category: 'strategy',
        };

        expect(() => QuizQuestionSchema.parse(question)).not.toThrow();
      });

      it('should validate question with maximum 6 answers', () => {
        const question = {
          id: 'q-003',
          question: 'Test question?',
          answers: ['A', 'B', 'C', 'D', 'E', 'F'],
          correctAnswer: 3,
          explanation: 'Test explanation',
          difficulty: 'hard',
          category: 'culture',
        };

        expect(() => QuizQuestionSchema.parse(question)).not.toThrow();
      });

      it('should validate all difficulty levels', () => {
        const difficulties = ['easy', 'medium', 'hard'];
        
        difficulties.forEach(difficulty => {
          const question = {
            id: `q-${difficulty}`,
            question: 'Test?',
            answers: ['A', 'B'],
            correctAnswer: 0,
            explanation: 'Test',
            difficulty,
            category: 'history',
          };

          expect(() => QuizQuestionSchema.parse(question)).not.toThrow();
        });
      });

      it('should validate all category types', () => {
        const categories = ['history', 'strategy', 'culture'];
        
        categories.forEach(category => {
          const question = {
            id: `q-${category}`,
            question: 'Test?',
            answers: ['A', 'B'],
            correctAnswer: 0,
            explanation: 'Test',
            difficulty: 'easy',
            category,
          };

          expect(() => QuizQuestionSchema.parse(question)).not.toThrow();
        });
      });
    });

    describe('Invalid quiz questions', () => {
      it('should reject question with empty id', () => {
        const question = {
          id: '',
          question: 'Test?',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with empty question text', () => {
        const question = {
          id: 'q-001',
          question: '',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with too few answers', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['Only one'],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with too many answers', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with empty answer', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', ''],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with negative correctAnswer', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', 'B'],
          correctAnswer: -1,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with correctAnswer out of bounds', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', 'B', 'C'],
          correctAnswer: 5,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with invalid difficulty', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'invalid',
          category: 'history',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });

      it('should reject question with invalid category', () => {
        const question = {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Test',
          difficulty: 'easy',
          category: 'invalid',
        };

        expect(() => QuizQuestionSchema.parse(question)).toThrow();
      });
    });

    describe('validateQuizQuestions function', () => {
      it('should validate array of valid questions', () => {
        const questions = [
          {
            id: 'q-001',
            question: 'Question 1?',
            answers: ['A', 'B'],
            correctAnswer: 0,
            explanation: 'Explanation 1',
            difficulty: 'easy',
            category: 'history',
          },
          {
            id: 'q-002',
            question: 'Question 2?',
            answers: ['A', 'B', 'C'],
            correctAnswer: 1,
            explanation: 'Explanation 2',
            difficulty: 'medium',
            category: 'strategy',
          },
        ];

        const result = validateQuizQuestions(questions);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('q-001');
        expect(result[1].id).toBe('q-002');
      });

      it('should reject non-array input', () => {
        expect(() => validateQuizQuestions({} as any)).toThrow('Dữ liệu câu hỏi phải là một mảng');
      });

      it('should reject empty array', () => {
        expect(() => validateQuizQuestions([])).toThrow('Mảng câu hỏi không được rỗng');
      });

      it('should provide Vietnamese error messages for invalid questions', () => {
        const questions = [
          {
            id: 'q-001',
            question: 'Test?',
            answers: ['A', 'B'],
            correctAnswer: 5,
            explanation: 'Test',
            difficulty: 'easy',
            category: 'history',
          },
        ];

        try {
          validateQuizQuestions(questions);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error instanceof Error).toBe(true);
          expect((error as Error).message).toContain('Câu hỏi 1');
          expect((error as Error).message).toContain('Xác thực câu hỏi thất bại');
        }
      });

      it('should collect multiple validation errors', () => {
        const questions = [
          {
            id: 'q-001',
            question: 'Test?',
            answers: ['A'],
            correctAnswer: 0,
            explanation: 'Test',
            difficulty: 'easy',
            category: 'history',
          },
          {
            id: 'q-002',
            question: 'Test?',
            answers: ['A', 'B'],
            correctAnswer: 5,
            explanation: 'Test',
            difficulty: 'invalid',
            category: 'history',
          },
        ];

        try {
          validateQuizQuestions(questions);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error instanceof Error).toBe(true);
          const message = (error as Error).message;
          expect(message).toContain('Câu hỏi 1');
          expect(message).toContain('Câu hỏi 2');
        }
      });
    });

    describe('loadQuizQuestions function', () => {
      it('should load and validate quiz data', () => {
        const data = [
          {
            id: 'q-001',
            question: 'Test?',
            answers: ['A', 'B'],
            correctAnswer: 0,
            explanation: 'Test',
            difficulty: 'easy',
            category: 'history',
          },
        ];

        const result = loadQuizQuestions(data);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('q-001');
      });

      it('should reject non-array data', () => {
        expect(() => loadQuizQuestions({ invalid: 'data' })).toThrow(
          'Dữ liệu câu hỏi phải là một mảng JSON'
        );
      });

      it('should reject empty data', () => {
        expect(() => loadQuizQuestions([])).toThrow('Không có câu hỏi nào trong dữ liệu');
      });
    });
  });

  describe('Quiz Progress Tracking Validation', () => {
    describe('Valid quiz progress', () => {
      it('should validate correct quiz progress', () => {
        const progress: QuizProgress = {
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
        expect(result.completedCategories).toHaveLength(2);
        expect(result.rewards).toHaveLength(2);
      });

      it('should validate progress with zero questions', () => {
        const progress: QuizProgress = {
          questionsAnswered: 0,
          correctAnswers: 0,
          completedCategories: [],
          rewards: [],
        };

        expect(() => QuizProgressSchema.parse(progress)).not.toThrow();
      });

      it('should validate progress with all correct answers', () => {
        const progress: QuizProgress = {
          questionsAnswered: 5,
          correctAnswers: 5,
          completedCategories: ['history'],
          rewards: [{ type: 'resource', id: 'gold', amount: 250 }],
        };

        expect(() => QuizProgressSchema.parse(progress)).not.toThrow();
      });

      it('should validate progress with no correct answers', () => {
        const progress: QuizProgress = {
          questionsAnswered: 5,
          correctAnswers: 0,
          completedCategories: [],
          rewards: [],
        };

        expect(() => QuizProgressSchema.parse(progress)).not.toThrow();
      });
    });

    describe('Invalid quiz progress', () => {
      it('should reject progress with more correct than answered', () => {
        const progress = {
          questionsAnswered: 5,
          correctAnswers: 10,
          completedCategories: [],
          rewards: [],
        };

        expect(() => QuizProgressSchema.parse(progress)).toThrow();
      });

      it('should reject progress with negative questionsAnswered', () => {
        const progress = {
          questionsAnswered: -1,
          correctAnswers: 0,
          completedCategories: [],
          rewards: [],
        };

        expect(() => QuizProgressSchema.parse(progress)).toThrow();
      });

      it('should reject progress with negative correctAnswers', () => {
        const progress = {
          questionsAnswered: 5,
          correctAnswers: -1,
          completedCategories: [],
          rewards: [],
        };

        expect(() => QuizProgressSchema.parse(progress)).toThrow();
      });
    });
  });

  describe('Reward Calculation Validation', () => {
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
        const difficulties = ['easy', 'medium', 'hard'] as const;
        const result = calculateQuizCompletionReward(3, 3, difficulties);

        expect(result.gold).toBe(225); // 50 + 75 + 100
        expect(result.experience).toBe(100); // 20 + 30 + 50
      });

      it('should calculate rewards for partial correct answers', () => {
        const difficulties = ['easy', 'medium', 'hard', 'easy'] as const;
        const result = calculateQuizCompletionReward(2, 4, difficulties);

        expect(result.gold).toBe(125); // 50 + 75
        expect(result.experience).toBe(50); // 20 + 30
      });

      it('should return zero rewards for no correct answers', () => {
        const difficulties = ['easy', 'medium'] as const;
        const result = calculateQuizCompletionReward(0, 2, difficulties);

        expect(result.gold).toBe(0);
        expect(result.experience).toBe(0);
      });

      it('should handle empty quiz', () => {
        const result = calculateQuizCompletionReward(0, 0, []);

        expect(result.gold).toBe(0);
        expect(result.experience).toBe(0);
      });

      it('should throw error for negative correct answers', () => {
        const difficulties = ['easy'] as const;
        expect(() => calculateQuizCompletionReward(-1, 1, difficulties)).toThrow(
          'Invalid quiz completion parameters'
        );
      });

      it('should throw error for negative total questions', () => {
        expect(() => calculateQuizCompletionReward(0, -1, [])).toThrow(
          'Invalid quiz completion parameters'
        );
      });

      it('should throw error when correct exceeds total', () => {
        const difficulties = ['easy', 'medium'] as const;
        expect(() => calculateQuizCompletionReward(5, 2, difficulties)).toThrow(
          'Invalid quiz completion parameters'
        );
      });

      it('should throw error when difficulties array length mismatch', () => {
        const difficulties = ['easy'] as const;
        expect(() => calculateQuizCompletionReward(2, 3, difficulties)).toThrow(
          'Difficulties array length must match total questions'
        );
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

      it('should calculate 50% accuracy', () => {
        expect(calculateAccuracy(5, 10)).toBe(50);
      });

      it('should calculate 75% accuracy', () => {
        expect(calculateAccuracy(3, 4)).toBe(75);
      });

      it('should round accuracy to nearest integer', () => {
        expect(calculateAccuracy(2, 3)).toBe(67); // 66.666... rounds to 67
      });

      it('should throw error for negative correct answers', () => {
        expect(() => calculateAccuracy(-1, 5)).toThrow('Answer counts cannot be negative');
      });

      it('should throw error for negative total questions', () => {
        expect(() => calculateAccuracy(0, -1)).toThrow('Answer counts cannot be negative');
      });

      it('should throw error when correct exceeds total', () => {
        expect(() => calculateAccuracy(10, 5)).toThrow(
          'Correct answers cannot exceed total questions'
        );
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
        expect(() => isCategoryCompleted(5, 10, -10)).toThrow(
          'Threshold must be between 0 and 100'
        );
      });

      it('should throw error for threshold above 100', () => {
        expect(() => isCategoryCompleted(5, 10, 150)).toThrow(
          'Threshold must be between 0 and 100'
        );
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
        expect(reward.amount).toBeUndefined();
      });

      it('should throw error for empty id', () => {
        expect(() => createReward('resource', '', 100)).toThrow('Reward id cannot be empty');
      });

      it('should throw error for whitespace-only id', () => {
        expect(() => createReward('resource', '   ', 100)).toThrow('Reward id cannot be empty');
      });

      it('should throw error for zero amount', () => {
        expect(() => createReward('resource', 'gold', 0)).toThrow(
          'Reward amount must be positive'
        );
      });

      it('should throw error for negative amount', () => {
        expect(() => createReward('resource', 'gold', -50)).toThrow(
          'Reward amount must be positive'
        );
      });
    });

    describe('Reward schema validation', () => {
      it('should validate resource reward', () => {
        const reward: Reward = { type: 'resource', id: 'gold', amount: 100 };
        const result = RewardSchema.parse(reward);

        expect(result.type).toBe('resource');
        expect(result.id).toBe('gold');
        expect(result.amount).toBe(100);
      });

      it('should validate hero reward without amount', () => {
        const reward: Reward = { type: 'hero', id: 'hero-1' };
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
  });

  describe('Edge Cases and Boundary Values', () => {
    it('should handle single question quiz', () => {
      const questions = [
        {
          id: 'q-001',
          question: 'Test?',
          answers: ['A', 'B'],
          correctAnswer: 0,
          explanation: 'Test',
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
      const difficulties = ['medium', 'medium', 'medium', 'medium'] as const;
      const rewards = calculateQuizCompletionReward(4, 4, difficulties);

      expect(rewards.gold).toBe(300); // 75 * 4
      expect(rewards.experience).toBe(120); // 30 * 4
    });

    it('should handle mixed difficulty distribution', () => {
      const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard'] as const;
      const rewards = calculateQuizCompletionReward(5, 5, difficulties);

      expect(rewards.gold).toBe(350); // 50*2 + 75*2 + 100
      expect(rewards.experience).toBe(150); // 20*2 + 30*2 + 50
    });

    it('should validate question with maximum answers', () => {
      const question = {
        id: 'q-001',
        question: 'Test?',
        answers: ['A', 'B', 'C', 'D', 'E', 'F'],
        correctAnswer: 2,
        explanation: 'Test',
        difficulty: 'hard',
        category: 'strategy',
      };

      expect(() => QuizQuestionSchema.parse(question)).not.toThrow();
    });

    it('should handle accuracy at exact threshold', () => {
      expect(isCategoryCompleted(8, 10, 80)).toBe(true);
      expect(isCategoryCompleted(80, 100, 80)).toBe(true);
      expect(isCategoryCompleted(79, 100, 80)).toBe(false);
    });

    it('should handle progress with empty rewards', () => {
      const progress: QuizProgress = {
        questionsAnswered: 5,
        correctAnswers: 3,
        completedCategories: ['history'],
        rewards: [],
      };

      expect(() => QuizProgressSchema.parse(progress)).not.toThrow();
    });

    it('should handle progress with multiple rewards', () => {
      const progress: QuizProgress = {
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

  describe('Real-world Quiz Scenarios', () => {
    it('should handle perfect score scenario', () => {
      const difficulties = ['easy', 'medium', 'hard', 'easy', 'medium'] as const;
      const correctAnswers = 5;
      const totalQuestions = 5;

      const accuracy = calculateAccuracy(correctAnswers, totalQuestions);
      expect(accuracy).toBe(100);

      const rewards = calculateQuizCompletionReward(correctAnswers, totalQuestions, difficulties);
      expect(rewards.gold).toBe(350); // 50 + 75 + 100 + 50 + 75
      expect(rewards.experience).toBe(150); // 20 + 30 + 50 + 20 + 30
    });

    it('should handle failing score scenario', () => {
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
      expect(isCategoryCompleted(9, 10, 80)).toBe(true); // History: 90%
      expect(isCategoryCompleted(7, 10, 80)).toBe(false); // Strategy: 70%
      expect(isCategoryCompleted(8, 10, 80)).toBe(true); // Culture: 80%
    });

    it('should calculate rewards for difficulty-weighted quiz', () => {
      const difficulties = ['hard', 'hard', 'hard', 'medium', 'easy'] as const;
      const rewards = calculateQuizCompletionReward(5, 5, difficulties);

      expect(rewards.gold).toBe(425); // 100*3 + 75 + 50
      expect(rewards.experience).toBe(200); // 50*3 + 30 + 20
    });
  });
});
