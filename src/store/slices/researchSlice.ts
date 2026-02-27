/**
 * Research state slice
 * Manages research tree state including completed research, in-progress research, and available options
 */

import { StateCreator } from 'zustand';
import { 
  getAvailableResearch, 
  arePrerequisitesMet,
  canAffordResearch,
  getResearchById,
  getUnlockedByResearch
} from '@/constants/research';

export interface ResearchSlice {
  research: {
    completed: string[];
    inProgress: string | null;
    progress: number; // 0-100
    progressStartTime: number | null;
  };
  
  // Actions
  startResearch: (researchId: string) => void;
  updateResearchProgress: (progress: number) => void;
  completeResearch: () => void;
  cancelResearch: () => void;
  resetResearch: () => void;
  
  // Selectors
  getCompletedResearch: () => string[];
  getAvailableResearchNodes: () => ReturnType<typeof getAvailableResearch>;
  isResearchAvailable: (researchId: string) => boolean;
  canAffordResearchNode: (researchId: string, resources: { food: number; gold: number }) => boolean;
}

const initialResearchState = {
  completed: [],
  inProgress: null,
  progress: 0,
  progressStartTime: null,
};

export const createResearchSlice: StateCreator<ResearchSlice> = (set, get) => ({
  research: initialResearchState,
  
  startResearch: (researchId) =>
    set((state) => ({
      research: {
        ...state.research,
        inProgress: researchId,
        progress: 0,
        progressStartTime: Date.now(),
      },
    })),
  
  updateResearchProgress: (progress) =>
    set((state) => ({
      research: {
        ...state.research,
        progress: Math.min(100, Math.max(0, progress)),
      },
    })),
  
  completeResearch: () =>
    set((state) => {
      if (!state.research.inProgress) return state;
      
      return {
        research: {
          ...state.research,
          completed: [...state.research.completed, state.research.inProgress],
          inProgress: null,
          progress: 0,
          progressStartTime: null,
        },
      };
    }),
  
  cancelResearch: () =>
    set((state) => ({
      research: {
        ...state.research,
        inProgress: null,
        progress: 0,
        progressStartTime: null,
      },
    })),
  
  resetResearch: () =>
    set(() => ({
      research: initialResearchState,
    })),
  
  // Selectors
  getCompletedResearch: () => get().research.completed,
  
  getAvailableResearchNodes: () => {
    const completed = get().research.completed;
    return getAvailableResearch(completed);
  },
  
  isResearchAvailable: (researchId) => {
    const completed = get().research.completed;
    return !completed.includes(researchId) && arePrerequisitesMet(researchId, completed);
  },
  
  canAffordResearchNode: (researchId, resources) => {
    return canAffordResearch(researchId, resources);
  },
});
