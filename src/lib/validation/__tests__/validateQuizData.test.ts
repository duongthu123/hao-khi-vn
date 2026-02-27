/**
 * Tests for quiz data validation
 */

import { describe, it, expect } from 'vitest';
import { validateQuizQuestions, loadQuizQuestions } from '../validateQuizData';
import quizData from '../../../../public/data/quiz-questions.json';

describe('validateQuizData', () => {
  describe('validateQuizQuestions', () => {
    it('should validate correct quiz questions', () => {
      const validQuestions = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2', 'Answer 3'],
          correctAnswer: 0,
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'history'
        }
      ];

      const result = validateQuizQuestions(validQuestions);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-001');
    });

    it('should reject questions with invalid correctAnswer index', () => {
      const invalidQuestions = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2'],
          correctAnswer: 5, // Invalid: out of bounds
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'history'
        }
      ];

      expect(() => validateQuizQuestions(invalidQuestions)).toThrow();
    });

    it('should reject questions with invalid difficulty', () => {
      const invalidQuestions = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2'],
          correctAnswer: 0,
          explanation: 'Test explanation',
          difficulty: 'invalid', // Invalid difficulty
          category: 'history'
        }
      ];

      expect(() => validateQuizQuestions(invalidQuestions)).toThrow();
    });

    it('should reject questions with invalid category', () => {
      const invalidQuestions = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2'],
          correctAnswer: 0,
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'invalid' // Invalid category
        }
      ];

      expect(() => validateQuizQuestions(invalidQuestions)).toThrow();
    });

    it('should reject questions with too few answers', () => {
      const invalidQuestions = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Only one answer'], // Too few
          correctAnswer: 0,
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'history'
        }
      ];

      expect(() => validateQuizQuestions(invalidQuestions)).toThrow();
    });

    it('should reject empty array', () => {
      expect(() => validateQuizQuestions([])).toThrow('Mảng câu hỏi không được rỗng');
    });

    it('should reject non-array input', () => {
      expect(() => validateQuizQuestions({} as any)).toThrow('Dữ liệu câu hỏi phải là một mảng');
    });

    it('should provide Vietnamese error messages', () => {
      const invalidQuestions = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2'],
          correctAnswer: 5,
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'history'
        }
      ];

      try {
        validateQuizQuestions(invalidQuestions);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain('Câu hỏi 1');
        expect((error as Error).message).toContain('Xác thực câu hỏi thất bại');
      }
    });
  });

  describe('loadQuizQuestions', () => {
    it('should load valid quiz data', () => {
      const validData = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2'],
          correctAnswer: 0,
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'history'
        }
      ];

      const result = loadQuizQuestions(validData);
      expect(result).toHaveLength(1);
    });

    it('should reject non-array data', () => {
      expect(() => loadQuizQuestions({ invalid: 'data' })).toThrow('Dữ liệu câu hỏi phải là một mảng JSON');
    });

    it('should reject empty array', () => {
      expect(() => loadQuizQuestions([])).toThrow('Không có câu hỏi nào trong dữ liệu');
    });

    it('should provide detailed error messages for malformed data', () => {
      const malformedData = [
        {
          id: 'test-001',
          question: 'Test question?',
          answers: ['Answer 1', 'Answer 2'],
          correctAnswer: 5, // Invalid index
          explanation: 'Test explanation',
          difficulty: 'easy',
          category: 'history'
        }
      ];

      expect(() => loadQuizQuestions(malformedData)).toThrow('Xác thực câu hỏi thất bại');
      expect(() => loadQuizQuestions(malformedData)).toThrow('Câu hỏi 1');
    });
  });

  describe('quiz-questions.json validation', () => {
    it('should validate all questions in quiz-questions.json', () => {
      expect(() => loadQuizQuestions(quizData)).not.toThrow();
    });

    it('should have questions in all categories', () => {
      const questions = loadQuizQuestions(quizData);
      const categories = new Set(questions.map(q => q.category));
      
      expect(categories.has('history')).toBe(true);
      expect(categories.has('strategy')).toBe(true);
      expect(categories.has('culture')).toBe(true);
    });

    it('should have questions in all difficulty levels', () => {
      const questions = loadQuizQuestions(quizData);
      const difficulties = new Set(questions.map(q => q.difficulty));
      
      expect(difficulties.has('easy')).toBe(true);
      expect(difficulties.has('medium')).toBe(true);
    });

    it('should have unique question IDs', () => {
      const questions = loadQuizQuestions(quizData);
      const ids = questions.map(q => q.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid Vietnamese text', () => {
      const questions = loadQuizQuestions(quizData);
      
      questions.forEach(question => {
        expect(question.question.length).toBeGreaterThan(0);
        expect(question.explanation.length).toBeGreaterThan(0);
        question.answers.forEach(answer => {
          expect(answer.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have correct answer indices within bounds', () => {
      const questions = loadQuizQuestions(quizData);
      
      questions.forEach(question => {
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThan(question.answers.length);
      });
    });
  });
});
