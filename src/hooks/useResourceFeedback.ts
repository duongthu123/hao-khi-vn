'use client';

/**
 * useResourceFeedback Hook
 * Provides resource transaction feedback with notifications and floating text
 * 
 * Validates Requirements 14.4 (resource display), 14.7 (error messages), 23.3 (error handling)
 */

import { useCallback } from 'react';
import { ResourceType } from '@/types/resource';
import { useStore } from '@/store';

/**
 * Resource labels in Vietnamese
 */
const RESOURCE_LABELS: Record<ResourceType, string> = {
  [ResourceType.FOOD]: 'Lương thực',
  [ResourceType.GOLD]: 'Vàng',
  [ResourceType.ARMY]: 'Quân đội',
};

/**
 * Hook for resource transaction feedback
 */
export const useResourceFeedback = () => {
  const addNotification = useStore((state) => state.addNotification);

  /**
   * Show success notification for resource gain
   */
  const notifyResourceGain = useCallback(
    (resource: ResourceType, amount: number) => {
      const label = RESOURCE_LABELS[resource];
      addNotification({
        type: 'success',
        message: `+${amount} ${label}`,
        duration: 3000,
      });
    },
    [addNotification]
  );

  /**
   * Show notification for resource loss
   */
  const notifyResourceLoss = useCallback(
    (resource: ResourceType, amount: number, reason?: string) => {
      const label = RESOURCE_LABELS[resource];
      const message = reason
        ? `${reason}: -${amount} ${label}`
        : `-${amount} ${label}`;
      
      addNotification({
        type: 'info',
        message,
        duration: 3000,
      });
    },
    [addNotification]
  );

  /**
   * Show error notification for insufficient resources
   */
  const notifyInsufficientResources = useCallback(
    (missing: Partial<Record<ResourceType, number>>) => {
      const missingList = Object.entries(missing)
        .map(([resource, amount]) => {
          const label = RESOURCE_LABELS[resource as ResourceType];
          return `${label}: ${amount}`;
        })
        .join(', ');

      addNotification({
        type: 'error',
        message: `Không đủ tài nguyên! Thiếu: ${missingList}`,
        duration: 5000,
      });
    },
    [addNotification]
  );

  /**
   * Show warning for low resources
   */
  const notifyLowResources = useCallback(
    (resource: ResourceType) => {
      const label = RESOURCE_LABELS[resource];
      addNotification({
        type: 'warning',
        message: `${label} sắp hết!`,
        duration: 4000,
      });
    },
    [addNotification]
  );

  /**
   * Show notification for resource cap reached
   */
  const notifyResourceCapReached = useCallback(
    (resource: ResourceType) => {
      const label = RESOURCE_LABELS[resource];
      addNotification({
        type: 'warning',
        message: `${label} đã đạt giới hạn tối đa`,
        duration: 3000,
      });
    },
    [addNotification]
  );

  return {
    notifyResourceGain,
    notifyResourceLoss,
    notifyInsufficientResources,
    notifyLowResources,
    notifyResourceCapReached,
  };
};

export default useResourceFeedback;
