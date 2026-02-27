/**
 * Research system hook
 * Manages research progress tracking, validation, and completion
 * Validates Requirements: 19.2, 19.4, 19.5, 19.8
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store';
import { getResearchById, getResearchDurationMs } from '@/constants/research';
import { ResourceType } from '@/types/resource';

/**
 * Hook for managing research system logic
 */
export function useResearchSystem() {
  const research = useGameStore((state) => state.research);
  const resources = useGameStore((state) => state.resources);
  const startResearch = useGameStore((state) => state.startResearch);
  const updateResearchProgress = useGameStore((state) => state.updateResearchProgress);
  const completeResearch = useGameStore((state) => state.completeResearch);
  const cancelResearch = useGameStore((state) => state.cancelResearch);
  const subtractResource = useGameStore((state) => state.subtractResource);
  const addNotification = useGameStore((state) => state.addNotification);
  const setGeneration = useGameStore((state) => state.setGeneration);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start research with resource validation
   */
  const startResearchWithValidation = useCallback(
    (researchId: string): boolean => {
      const node = getResearchById(researchId);
      if (!node) {
        addNotification({
          type: 'error',
          message: 'Nghiên cứu không tồn tại',
        });
        return false;
      }

      // Check if already researching
      if (research.inProgress) {
        addNotification({
          type: 'warning',
          message: 'Đang có nghiên cứu khác đang tiến hành',
        });
        return false;
      }

      // Check if already completed
      if (research.completed.includes(researchId)) {
        addNotification({
          type: 'info',
          message: 'Nghiên cứu này đã hoàn thành',
        });
        return false;
      }

      // Validate resources
      const hasFood = resources.food >= node.cost.food;
      const hasGold = resources.gold >= node.cost.gold;

      if (!hasFood || !hasGold) {
        const missing: string[] = [];
        if (!hasFood) missing.push(`${node.cost.food - resources.food} lương thực`);
        if (!hasGold) missing.push(`${node.cost.gold - resources.gold} vàng`);

        addNotification({
          type: 'error',
          message: `Không đủ tài nguyên! Thiếu: ${missing.join(', ')}`,
        });
        return false;
      }

      // Deduct resources
      const foodSuccess = subtractResource(ResourceType.FOOD, node.cost.food);
      const goldSuccess = subtractResource(ResourceType.GOLD, node.cost.gold);

      if (!foodSuccess || !goldSuccess) {
        addNotification({
          type: 'error',
          message: 'Không thể trừ tài nguyên',
        });
        return false;
      }

      // Start research
      startResearch(researchId);

      addNotification({
        type: 'success',
        message: `Bắt đầu nghiên cứu: ${node.nameVietnamese}`,
      });

      return true;
    },
    [
      research.inProgress,
      research.completed,
      resources.food,
      resources.gold,
      startResearch,
      subtractResource,
      addNotification,
    ]
  );

  /**
   * Cancel research (no refund)
   */
  const cancelResearchWithNotification = useCallback(() => {
    if (!research.inProgress) return;

    const node = getResearchById(research.inProgress);
    cancelResearch();

    addNotification({
      type: 'info',
      message: node
        ? `Đã hủy nghiên cứu: ${node.nameVietnamese}`
        : 'Đã hủy nghiên cứu',
    });
  }, [research.inProgress, cancelResearch, addNotification]);

  /**
   * Apply research effects when completed
   */
  const applyResearchEffects = useCallback(
    (researchId: string) => {
      const node = getResearchById(researchId);
      if (!node) return;

      // Apply effects based on type
      node.effects.forEach((effect) => {
        switch (effect.type) {
          case 'resource-generation': {
            // Increase resource generation rate
            const currentRate = resources.generation[`${effect.target}PerSecond` as keyof typeof resources.generation];
            const increase = (currentRate * effect.value) / 100;
            setGeneration({
              [`${effect.target}PerSecond`]: currentRate + increase,
            });
            break;
          }
          case 'unit-stat':
          case 'building-stat':
          case 'unlock-unit':
          case 'unlock-ability':
          case 'cost-reduction':
            // These effects are applied passively by checking completed research
            // No immediate action needed here
            break;
        }
      });

      // Show completion notification
      addNotification({
        type: 'success',
        message: `✨ Hoàn thành nghiên cứu: ${node.nameVietnamese}`,
        duration: 5000,
      });

      // Show effects
      node.effects.forEach((effect) => {
        addNotification({
          type: 'info',
          message: `🔬 ${effect.descriptionVietnamese}`,
          duration: 4000,
        });
      });
    },
    [resources.generation, setGeneration, addNotification]
  );

  /**
   * Track research progress over time
   */
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // If no research in progress, nothing to track
    if (!research.inProgress || !research.progressStartTime) {
      return;
    }

    const researchId = research.inProgress;
    const startTime = research.progressStartTime;
    const duration = getResearchDurationMs(researchId);

    if (duration === 0) return;

    // Update progress every 100ms
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      updateResearchProgress(progress);

      // Check if completed
      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        // Complete research
        completeResearch();

        // Apply effects
        applyResearchEffects(researchId);
      }
    }, 100);

    // Cleanup on unmount or when research changes
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [
    research.inProgress,
    research.progressStartTime,
    updateResearchProgress,
    completeResearch,
    applyResearchEffects,
  ]);

  return {
    startResearch: startResearchWithValidation,
    cancelResearch: cancelResearchWithNotification,
    currentResearch: research.inProgress
      ? getResearchById(research.inProgress)
      : null,
    progress: research.progress,
  };
}
