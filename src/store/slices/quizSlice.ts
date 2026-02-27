/**
 * Quiz state slice
 * Manages quiz progress, rewards, and completion tracking
 */

import { StateCreator } from 'zustand';

export interface Reward {
  type: 'hero' | 'item' | 'resource' | 'achievement';
  id: string;
  amount?: number;
}

export interface QuizProgress {
  questionsAnswered: number;
  correctAnswers: number;
  completedCategories: string[];
  rewards: Reward[];
}

export interface QuizSlice {
  quiz: QuizProgress;
  
  // Actions
  recordAnswer: (isCorrect: boolean, category: string) => void;
  addReward: (reward: Reward) => void;
  completeCategory: (category: string) => void;
  resetQuiz: () => void;
  
  // Selectors
  getAccuracy: () => number;
  getTotalRewards: () => number;
  isCategoryCompleted: (category: string) => boolean;
}

const initialQuizState: QuizProgress = {
  questionsAnswered: 0,
  correctAnswers: 0,
  completedCategories: [],
  rewards: [],
};

export const createQuizSlice: StateCreator<QuizSlice> = (set, get) => ({
  quiz: initialQuizState,
  
  recordAnswer: (isCorrect, category) =>
    set((state) => {
      const newState = {
        quiz: {
          ...state.quiz,
          questionsAnswered: state.quiz.questionsAnswered + 1,
          correctAnswers: isCorrect
            ? state.quiz.correctAnswers + 1
            : state.quiz.correctAnswers,
        },
      };
      
      // Note: category tracking could be added here for future analytics
      // For now, we just record the answer
      
      return newState;
    }),
  
  addReward: (reward) =>
    set((state) => ({
      quiz: {
        ...state.quiz,
        rewards: [...state.quiz.rewards, reward],
      },
    })),
  
  completeCategory: (category) =>
    set((state) => {
      if (state.quiz.completedCategories.includes(category)) {
        return state;
      }
      
      return {
        quiz: {
          ...state.quiz,
          completedCategories: [...state.quiz.completedCategories, category],
        },
      };
    }),
  
  resetQuiz: () =>
    set({
      quiz: initialQuizState,
    }),
  
  // Selectors
  getAccuracy: () => {
    const state = get();
    if (state.quiz.questionsAnswered === 0) return 0;
    return (state.quiz.correctAnswers / state.quiz.questionsAnswered) * 100;
  },
  
  getTotalRewards: () => {
    const state = get();
    return state.quiz.rewards.length;
  },
  
  isCategoryCompleted: (category) => {
    const state = get();
    return state.quiz.completedCategories.includes(category);
  },
});
