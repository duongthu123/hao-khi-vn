/**
 * Quiz reward calculation utilities
 * Calculates rewards based on quiz performance
 */

import { QuizDifficulty, Reward } from '@/schemas/quiz.schema';

/**
 * Calculate gold reward based on question difficulty
 * @param difficulty - Question difficulty level
 * @returns Gold reward amount
 */
export function calculateGoldReward(difficulty: QuizDifficulty): number {
  switch (difficulty) {
    case 'hard':
      return 100;
    case 'medium':
      return 75;
    case 'easy':
      return 50;
    default:
      return 50;
  }
}

/**
 * Calculate experience reward based on question difficulty
 * @param difficulty - Question difficulty level
 * @returns Experience points reward
 */
export function calculateExperienceReward(difficulty: QuizDifficulty): number {
  switch (difficulty) {
    case 'hard':
      return 50;
    case 'medium':
      return 30;
    case 'easy':
      return 20;
    default:
      return 20;
  }
}

/**
 * Calculate total quiz completion reward
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @param difficulties - Array of question difficulties
 * @returns Total gold and experience rewards
 */
export function calculateQuizCompletionReward(
  correctAnswers: number,
  totalQuestions: number,
  difficulties: QuizDifficulty[]
): { gold: number; experience: number } {
  if (correctAnswers < 0 || totalQuestions < 0 || correctAnswers > totalQuestions) {
    throw new Error('Invalid quiz completion parameters');
  }

  if (difficulties.length !== totalQuestions) {
    throw new Error('Difficulties array length must match total questions');
  }

  let totalGold = 0;
  let totalExperience = 0;

  // Calculate rewards only for correct answers
  // Assuming we track which questions were answered correctly
  // For simplicity, we'll calculate based on average difficulty
  for (let i = 0; i < correctAnswers; i++) {
    if (difficulties[i]) {
      totalGold += calculateGoldReward(difficulties[i]);
      totalExperience += calculateExperienceReward(difficulties[i]);
    }
  }

  return { gold: totalGold, experience: totalExperience };
}

/**
 * Calculate accuracy percentage
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions answered
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  if (correctAnswers < 0 || totalQuestions < 0) {
    throw new Error('Answer counts cannot be negative');
  }
  if (correctAnswers > totalQuestions) {
    throw new Error('Correct answers cannot exceed total questions');
  }
  
  return Math.round((correctAnswers / totalQuestions) * 100);
}

/**
 * Determine if a category is completed based on correct answers
 * @param correctAnswersInCategory - Number of correct answers in the category
 * @param totalQuestionsInCategory - Total questions in the category
 * @param threshold - Completion threshold percentage (default 80%)
 * @returns Whether the category is completed
 */
export function isCategoryCompleted(
  correctAnswersInCategory: number,
  totalQuestionsInCategory: number,
  threshold: number = 80
): boolean {
  if (totalQuestionsInCategory === 0) return false;
  if (threshold < 0 || threshold > 100) {
    throw new Error('Threshold must be between 0 and 100');
  }
  
  const accuracy = calculateAccuracy(correctAnswersInCategory, totalQuestionsInCategory);
  return accuracy >= threshold;
}

/**
 * Create a reward object
 * @param type - Reward type
 * @param id - Reward identifier
 * @param amount - Optional reward amount
 * @returns Reward object
 */
export function createReward(
  type: 'hero' | 'item' | 'resource' | 'achievement',
  id: string,
  amount?: number
): Reward {
  if (!id || id.trim().length === 0) {
    throw new Error('Reward id cannot be empty');
  }
  
  if (amount !== undefined && amount <= 0) {
    throw new Error('Reward amount must be positive');
  }
  
  return {
    type,
    id,
    amount,
  };
}
