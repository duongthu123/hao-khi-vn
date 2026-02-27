/**
 * Profile state slice
 * Manages player profile, rank, achievements, and statistics
 */

import { StateCreator } from 'zustand';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface PlayerStatistics {
  totalPlayTime: number;
  unitsDefeated: number;
  resourcesGathered: number;
  quizzesCompleted: number;
}

export interface ProfileSlice {
  profile: {
    playerName: string;
    rank: string;
    level: number;
    experience: number;
    wins: number;
    losses: number;
    achievements: Achievement[];
    statistics: PlayerStatistics;
  };
  
  // Actions
  updateProfile: (updates: Partial<ProfileSlice['profile']>) => void;
  setPlayerName: (name: string) => void;
  addExperience: (amount: number, addNotification?: (notification: { type: string; message: string }) => void) => void;
  addWin: () => void;
  addLoss: () => void;
  addAchievement: (achievement: Achievement) => void;
  unlockAchievement: (achievementId: string) => void;
  incrementStats: (stat: keyof PlayerStatistics, amount: number) => void;
  
  // Rank calculation
  calculateRank: (addNotification?: (notification: { type: string; message: string }) => void) => void;
  getRankForLevel: (level: number) => string;
  getNextRankThreshold: () => { level: number; rank: string } | null;
  
  // Selectors
  getWinRate: () => number;
  getTotalGames: () => number;
  hasAchievement: (achievementId: string) => boolean;
  getUnlockedAchievements: () => Achievement[];
}

const RANK_THRESHOLDS = [
  { level: 1, rank: 'Tân Binh' }, // Recruit
  { level: 5, rank: 'Chiến Binh' }, // Warrior
  { level: 10, rank: 'Đội Trưởng' }, // Squad Leader
  { level: 15, rank: 'Tiểu Đội Trưởng' }, // Platoon Leader
  { level: 20, rank: 'Đại Đội Trưởng' }, // Company Commander
  { level: 25, rank: 'Tiểu Tướng' }, // Junior General
  { level: 30, rank: 'Trung Tướng' }, // Middle General
  { level: 35, rank: 'Đại Tướng' }, // Senior General
  { level: 40, rank: 'Nguyên Soái' }, // Marshal
];

const initialProfileState = {
  playerName: 'Người Chơi',
  rank: 'Tân Binh',
  level: 1,
  experience: 0,
  wins: 0,
  losses: 0,
  achievements: [],
  statistics: {
    totalPlayTime: 0,
    unitsDefeated: 0,
    resourcesGathered: 0,
    quizzesCompleted: 0,
  },
};

export const createProfileSlice: StateCreator<ProfileSlice> = (set, get) => ({
  profile: initialProfileState,
  
  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),
  
  setPlayerName: (name) =>
    set((state) => ({
      profile: { ...state.profile, playerName: name },
    })),
  
  addExperience: (amount, addNotification) => {
    const state = get();
    const oldLevel = state.profile.level;
    const oldRank = state.profile.rank;
    const newExperience = state.profile.experience + amount;
    const experiencePerLevel = 1000;
    const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;
    
    set((state) => ({
      profile: {
        ...state.profile,
        experience: newExperience,
        level: newLevel,
      },
    }));
    
    // Check for level up
    if (newLevel > oldLevel) {
      // Recalculate rank after level change
      get().calculateRank(addNotification);
      
      // Check if rank changed
      const newRank = get().profile.rank;
      if (newRank !== oldRank && addNotification) {
        // Rank promotion notification
        addNotification({
          type: 'success',
          message: `🎖️ Thăng cấp! Bạn đã đạt cấp bậc ${newRank}!`,
        });
      } else if (addNotification) {
        // Level up notification (no rank change)
        addNotification({
          type: 'info',
          message: `⬆️ Lên cấp ${newLevel}! (+${amount} kinh nghiệm)`,
        });
      }
    }
  },
  
  addWin: () =>
    set((state) => ({
      profile: { ...state.profile, wins: state.profile.wins + 1 },
    })),
  
  addLoss: () =>
    set((state) => ({
      profile: { ...state.profile, losses: state.profile.losses + 1 },
    })),
  
  addAchievement: (achievement) =>
    set((state) => {
      const exists = state.profile.achievements.some((a) => a.id === achievement.id);
      if (exists) return state;
      
      return {
        profile: {
          ...state.profile,
          achievements: [...state.profile.achievements, achievement],
        },
      };
    }),
  
  unlockAchievement: (achievementId) =>
    set((state) => ({
      profile: {
        ...state.profile,
        achievements: state.profile.achievements.map((a) =>
          a.id === achievementId
            ? { ...a, unlocked: true, unlockedAt: Date.now() }
            : a
        ),
      },
    })),
  
  incrementStats: (stat, amount) =>
    set((state) => ({
      profile: {
        ...state.profile,
        statistics: {
          ...state.profile.statistics,
          [stat]: state.profile.statistics[stat] + amount,
        },
      },
    })),
  
  calculateRank: (addNotification) => {
    const state = get();
    const level = state.profile.level;
    const oldRank = state.profile.rank;
    
    // Find the highest rank threshold that the player has reached
    let newRank = RANK_THRESHOLDS[0].rank;
    for (const threshold of RANK_THRESHOLDS) {
      if (level >= threshold.level) {
        newRank = threshold.rank;
      } else {
        break;
      }
    }
    
    // Only update if rank changed
    if (newRank !== oldRank) {
      set((state) => ({
        profile: { ...state.profile, rank: newRank },
      }));
      
      // Trigger rank-up animation if available
      const fullState = get() as any;
      if (fullState.showRankUpAnimation) {
        fullState.showRankUpAnimation(newRank);
      }
      
      // Trigger rank promotion notification if callback provided
      if (addNotification) {
        addNotification({
          type: 'success',
          message: `🏆 Chúc mừng! Bạn đã thăng cấp bậc ${newRank}!`,
        });
      }
    }
  },
  
  getRankForLevel: (level) => {
    let rank = RANK_THRESHOLDS[0].rank;
    for (const threshold of RANK_THRESHOLDS) {
      if (level >= threshold.level) {
        rank = threshold.rank;
      } else {
        break;
      }
    }
    return rank;
  },
  
  getNextRankThreshold: () => {
    const state = get();
    const currentLevel = state.profile.level;
    
    // Find the next rank threshold
    for (const threshold of RANK_THRESHOLDS) {
      if (currentLevel < threshold.level) {
        return threshold;
      }
    }
    
    // Already at max rank
    return null;
  },
  
  // Selectors
  getWinRate: () => {
    const state = get();
    const total = state.profile.wins + state.profile.losses;
    return total > 0 ? (state.profile.wins / total) * 100 : 0;
  },
  
  getTotalGames: () => {
    const state = get();
    return state.profile.wins + state.profile.losses;
  },
  
  hasAchievement: (achievementId) => {
    const state = get();
    return state.profile.achievements.some(
      (a) => a.id === achievementId && a.unlocked
    );
  },
  
  getUnlockedAchievements: () => {
    const state = get();
    return state.profile.achievements.filter((a) => a.unlocked);
  },
});
