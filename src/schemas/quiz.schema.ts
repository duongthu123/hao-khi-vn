/**
 * Quiz system Zod validation schemas
 * Provides runtime validation for quiz data
 */

import { z } from 'zod';

/**
 * Quiz question difficulty schema
 */
export const QuizDifficultySchema = z.enum(['easy', 'medium', 'hard']);

/**
 * Quiz question category schema
 */
export const QuizCategorySchema = z.enum(['history', 'strategy', 'culture']);

/**
 * Quiz question schema
 * **Validates: Requirements 24.6**
 */
export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answers: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.number().int().nonnegative(),
  explanation: z.string(),
  difficulty: QuizDifficultySchema,
  category: QuizCategorySchema
}).refine(
  (data) => data.correctAnswer < data.answers.length,
  {
    message: 'correctAnswer must be a valid index in the answers array',
    path: ['correctAnswer']
  }
);

/**
 * Reward type schema
 */
export const RewardTypeSchema = z.enum(['hero', 'item', 'resource', 'achievement']);

/**
 * Reward schema
 */
export const RewardSchema = z.object({
  type: RewardTypeSchema,
  id: z.string().min(1),
  amount: z.number().int().positive().optional()
});

/**
 * Quiz progress schema
 * **Validates: Requirements 24.6**
 */
export const QuizProgressSchema = z.object({
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  completedCategories: z.array(z.string()),
  rewards: z.array(RewardSchema)
}).refine(
  (data) => data.correctAnswers <= data.questionsAnswered,
  {
    message: 'correctAnswers cannot exceed questionsAnswered',
    path: ['correctAnswers']
  }
);

/**
 * Quiz answer submission schema
 */
export const QuizAnswerSubmissionSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswer: z.number().int().nonnegative(),
  timeSpent: z.number().nonnegative()
});

/**
 * Quiz session schema
 */
export const QuizSessionSchema = z.object({
  id: z.string().min(1),
  startedAt: z.number().int().positive(),
  questions: z.array(QuizQuestionSchema),
  currentQuestionIndex: z.number().int().nonnegative(),
  answers: z.array(QuizAnswerSubmissionSchema),
  score: z.number().int().nonnegative(),
  completed: z.boolean()
});

// Type inference exports
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;
export type QuizCategory = z.infer<typeof QuizCategorySchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type RewardType = z.infer<typeof RewardTypeSchema>;
export type Reward = z.infer<typeof RewardSchema>;
export type QuizProgress = z.infer<typeof QuizProgressSchema>;
export type QuizAnswerSubmission = z.infer<typeof QuizAnswerSubmissionSchema>;
export type QuizSession = z.infer<typeof QuizSessionSchema>;
