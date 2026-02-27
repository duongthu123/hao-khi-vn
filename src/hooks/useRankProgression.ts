/**
 * useRankProgression Hook
 * Provides rank progression functionality with automatic notifications
 * 
 * Validates Requirements 18.2 (implement ranking system based on victories and progress)
 * Validates Requirements 18.6 (award rank promotions based on performance)
 * Validates Requirements 18.8 (update displays immediately)
 */

import { useGameStore } from '@/store';
import { useCallback } from 'react';

export interface RankProgressionHook {
  addExperience: (amount: number) => void;
  addWin: () => void;
  addLoss: () => void;
  currentRank: string;
  currentLevel: number;
  experience: number;
  nextRankThreshold: { level: number; rank: string } | null;
  getRankForLevel: (level: number) => string;
}

/**
 * Hook for managing rank progression with automatic notifications
 */
export function useRankProgression(): RankProgressionHook {
  const profile = useGameStore((state) => state.profile);
  const addExperienceAction = useGameStore((state) => state.addExperience);
  const addWinAction = useGameStore((state) => state.addWin);
  const addLossAction = useGameStore((state) => state.addLoss);
  const addNotification = useGameStore((state) => state.addNotification);
  const getNextRankThreshold = useGameStore((state) => state.getNextRankThreshold);
  const getRankForLevelAction = useGameStore((state) => state.getRankForLevel);

  /**
   * Add experience with automatic rank progression and notifications
   */
  const addExperience = useCallback(
    (amount: number) => {
      addExperienceAction(amount, (notification) => {
        addNotification({
          type: notification.type as 'success' | 'info' | 'error' | 'warning',
          message: notification.message,
        });
      });
    },
    [addExperienceAction, addNotification]
  );

  /**
   * Add a win and award experience
   */
  const addWin = useCallback(() => {
    addWinAction();
    // Award experience for winning
    addExperience(500);
    addNotification({
      type: 'success',
      message: '🎉 Chiến thắng! +500 kinh nghiệm',
    });
  }, [addWinAction, addExperience, addNotification]);

  /**
   * Add a loss with smaller experience reward
   */
  const addLoss = useCallback(() => {
    addLossAction();
    // Award smaller experience for participation
    addExperience(100);
    addNotification({
      type: 'info',
      message: '💪 Tiếp tục cố gắng! +100 kinh nghiệm',
    });
  }, [addLossAction, addExperience, addNotification]);

  return {
    addExperience,
    addWin,
    addLoss,
    currentRank: profile.rank,
    currentLevel: profile.level,
    experience: profile.experience,
    nextRankThreshold: getNextRankThreshold(),
    getRankForLevel: getRankForLevelAction,
  };
}
