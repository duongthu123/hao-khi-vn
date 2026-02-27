'use client';

/**
 * StatusEffectIndicator Component
 * Displays visual indicators for active status effects on units
 * 
 * Validates Requirement 13.5 (status effect visual indicators)
 */

import React from 'react';
import { StatusEffect, StatusEffectType } from '@/types/unit';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

interface StatusEffectIndicatorProps {
  effects: StatusEffect[];
  size?: 'sm' | 'md' | 'lg';
  showDuration?: boolean;
}

/**
 * Get icon and color for each status effect type
 */
const getEffectDisplay = (type: StatusEffectType): { icon: string; color: string; label: string } => {
  switch (type) {
    case StatusEffectType.STUN:
      return { icon: '⚡', color: 'text-yellow-400', label: 'Choáng' };
    case StatusEffectType.POISON:
      return { icon: '☠️', color: 'text-green-500', label: 'Độc' };
    case StatusEffectType.BUFF:
      return { icon: '↑', color: 'text-blue-400', label: 'Tăng cường' };
    case StatusEffectType.DEBUFF:
      return { icon: '↓', color: 'text-red-400', label: 'Suy yếu' };
    case StatusEffectType.SLOW:
      return { icon: '🐌', color: 'text-gray-400', label: 'Chậm' };
    case StatusEffectType.HASTE:
      return { icon: '⚡', color: 'text-cyan-400', label: 'Nhanh' };
    default:
      return { icon: '?', color: 'text-gray-400', label: 'Không rõ' };
  }
};

/**
 * Get size classes based on size prop
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): { container: string; icon: string; duration: string } => {
  switch (size) {
    case 'sm':
      return {
        container: 'w-6 h-6',
        icon: 'text-xs',
        duration: 'text-[8px]',
      };
    case 'lg':
      return {
        container: 'w-10 h-10',
        icon: 'text-lg',
        duration: 'text-xs',
      };
    case 'md':
    default:
      return {
        container: 'w-8 h-8',
        icon: 'text-sm',
        duration: 'text-[10px]',
      };
  }
};

export const StatusEffectIndicator: React.FC<StatusEffectIndicatorProps> = ({
  effects,
  size = 'md',
  showDuration = true,
}) => {
  const sizeClasses = getSizeClasses(size);
  const shouldAnimate = useAnimations();

  if (effects.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 items-center">
      {effects.map((effect, index) => {
        const display = getEffectDisplay(effect.type);
        const durationSeconds = Math.ceil(effect.duration);

        return (
          <motion.div
            key={`${effect.type}-${effect.source || 'unknown'}-${index}`}
            initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            exit={shouldAnimate ? { scale: 0, opacity: 0 } : { opacity: 0 }}
            transition={shouldAnimate ? { duration: 0.2 } : { duration: 0 }}
            className={`
              ${sizeClasses.container}
              relative
              flex items-center justify-center
              rounded-full
              bg-gray-900/80
              border border-gray-700
              backdrop-blur-sm
            `}
            title={`${display.label}${effect.stat ? ` (${effect.stat})` : ''}`}
          >
            {/* Effect Icon */}
            <span className={`${sizeClasses.icon} ${display.color}`}>
              {display.icon}
            </span>

            {/* Duration Badge */}
            {showDuration && durationSeconds > 0 && (
              <span
                className={`
                  ${sizeClasses.duration}
                  absolute -bottom-1 -right-1
                  px-1
                  rounded-full
                  bg-gray-800
                  border border-gray-600
                  text-white
                  font-bold
                  leading-none
                `}
              >
                {durationSeconds}s
              </span>
            )}

            {/* Pulsing animation for active effects */}
            <motion.div
              className={`
                absolute inset-0
                rounded-full
                ${display.color.replace('text-', 'bg-')}
                opacity-20
              `}
              animate={shouldAnimate ? {
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              } : {}}
              transition={shouldAnimate ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              } : { duration: 0 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatusEffectIndicator;
