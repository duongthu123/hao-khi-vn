'use client';

/**
 * RankUpAnimationContainer
 * Container component that listens to store state and displays rank-up animation
 * 
 * Validates Requirements 18.6 (award rank promotions based on performance)
 * Validates Requirements 18.8 (update displays immediately)
 */

import React from 'react';
import { useGameStore } from '@/store';
import { RankUpAnimation } from './RankUpAnimation';

export const RankUpAnimationContainer: React.FC = () => {
  const isVisible = useGameStore((state) => state.ui.rankUpAnimation.isVisible);
  const newRank = useGameStore((state) => state.ui.rankUpAnimation.newRank);
  const hideRankUpAnimation = useGameStore((state) => state.hideRankUpAnimation);

  if (!isVisible || !newRank) {
    return null;
  }

  return (
    <RankUpAnimation
      newRank={newRank}
      onComplete={hideRankUpAnimation}
    />
  );
};

export default RankUpAnimationContainer;
