'use client';

/**
 * ResourceDisplay Component
 * Displays current resources with animated counters, caps, generation rates, warnings, and floating text
 * 
 * Validates Requirements 14.4 (resource display), 14.7 (error messages), 23.3 (error handling),
 * 2.2 (component modularization), 2.3 (single responsibility)
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resources, ResourceCaps, ResourceGeneration, ResourceType } from '@/types/resource';
import { formatGenerationRate } from '@/lib/resources/generation';
import { FloatingText, useFloatingText } from '@/components/ui/FloatingText';
import { useAnimations } from '@/hooks/useAnimations';

interface ResourceDisplayProps {
  resources: Resources;
  caps: ResourceCaps;
  generation: ResourceGeneration;
  showDetails?: boolean;
  lowResourceThreshold?: number;
  enableFloatingText?: boolean;
}

/**
 * Get resource icon and color
 */
const getResourceDisplay = (type: ResourceType): { icon: string; color: string; label: string } => {
  switch (type) {
    case ResourceType.FOOD:
      return { icon: '🌾', color: 'text-amber-500', label: 'Lương thực' };
    case ResourceType.GOLD:
      return { icon: '💰', color: 'text-yellow-400', label: 'Vàng' };
    case ResourceType.ARMY:
      return { icon: '⚔️', color: 'text-red-500', label: 'Quân đội' };
    default:
      return { icon: '?', color: 'text-gray-400', label: 'Không rõ' };
  }
};

/**
 * Animated counter component with floating text support
 */
const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  resourceType?: ResourceType;
  onValueChange?: (oldValue: number, newValue: number) => void;
}> = ({ value, duration = 0.5, resourceType, onValueChange }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const diff = end - start;

    if (diff === 0) return;

    // Notify parent of value change for floating text
    if (onValueChange) {
      onValueChange(start, end);
    }

    const startTime = Date.now();
    const animationDuration = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;

      setDisplayValue(Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
        previousValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, onValueChange]);

  return <span>{Math.floor(displayValue)}</span>;
};

/**
 * Single resource display item
 */
const ResourceItem: React.FC<{
  type: ResourceType;
  current: number;
  cap: number;
  generationRate: number;
  showDetails: boolean;
  isLow: boolean;
  onValueChange?: (oldValue: number, newValue: number) => void;
}> = ({ type, current, cap, generationRate, showDetails, isLow, onValueChange }) => {
  const display = getResourceDisplay(type);
  const percentage = (current / cap) * 100;
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAnimate = useAnimations();

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="group"
      aria-label={`${display.label}: ${Math.floor(current)} trên ${cap}`}
    >
      <motion.div
        className={`
          flex items-center gap-2 px-3 py-2 mobile:px-4 mobile:py-2
          bg-black/85
          border border-[#f1c40f] rounded-lg
          ${isLow ? 'border-red-500 shadow-red-500/20 shadow-lg' : ''}
          transition-all duration-300
        `}
        whileHover={shouldAnimate ? { scale: 1.02 } : undefined}
        animate={shouldAnimate && isLow ? {
          borderColor: ['rgb(239, 68, 68)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)'],
        } : {}}
        transition={shouldAnimate && isLow ? { duration: 1.5, repeat: Infinity } : { duration: 0 }}
      >
        {/* Resource Icon */}
        <span className={`text-xl mobile:text-2xl ${display.color}`} aria-hidden="true">{display.icon}</span>

        {/* Resource Info */}
        <div className="flex flex-col min-w-[100px] mobile:min-w-[120px]">
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-base mobile:text-lg">
              <AnimatedCounter
                value={current}
                resourceType={type}
                onValueChange={onValueChange}
              />
            </span>
            <span className="text-gray-400 text-xs mobile:text-sm">/ {cap}</span>
          </div>

          {showDetails && (
            <div className="flex items-center gap-1 text-xs">
              <span className={`${display.color} font-medium`} aria-label={`Tốc độ tạo: ${formatGenerationRate(generationRate)}`}>
                {formatGenerationRate(generationRate)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 min-w-[60px] mobile:min-w-[80px]" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={cap} aria-label={`${display.label} progress`}>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${display.color.replace('text-', 'bg-')} ${isLow ? 'opacity-60' : ''}`}
              initial={shouldAnimate ? { width: 0 } : false}
              animate={{ width: `${percentage}%` }}
              transition={shouldAnimate ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
            />
          </div>
        </div>

        {/* Warning Indicator */}
        <AnimatePresence>
          {isLow && (
            <motion.div
              initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldAnimate ? { scale: 0, opacity: 0 } : { opacity: 0 }}
              transition={shouldAnimate ? undefined : { duration: 0 }}
              className="text-red-500 text-lg mobile:text-xl"
              role="img"
              aria-label="Cảnh báo tài nguyên thấp"
            >
              ⚠️
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detailed Tooltip */}
      <AnimatePresence>
        {showTooltip && showDetails && (
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: -10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, y: -10 } : { opacity: 0 }}
            transition={shouldAnimate ? undefined : { duration: 0 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
            role="tooltip"
          >
            <div className="text-sm space-y-1">
              <div className="font-bold text-white border-b border-gray-700 pb-1 mb-2">
                {display.label}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hiện tại:</span>
                <span className="text-white font-medium">{Math.floor(current)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tối đa:</span>
                <span className="text-white font-medium">{cap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tỷ lệ:</span>
                <span className="text-white font-medium">{percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-1 mt-1">
                <span className="text-gray-400">Tốc độ:</span>
                <span className={`${display.color} font-medium`}>
                  {formatGenerationRate(generationRate)}
                </span>
              </div>
              {generationRate > 0 && current < cap && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Đầy sau:</span>
                  <span className="text-white font-medium">
                    {Math.ceil((cap - current) / generationRate)}s
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Main ResourceDisplay component
 */
export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  resources,
  caps,
  generation,
  showDetails = true,
  lowResourceThreshold = 0.2, // 20% threshold for low resource warning
  enableFloatingText = true,
}) => {
  const { items, addFloatingText, removeFloatingText } = useFloatingText();
  const containerRef = useRef<HTMLDivElement>(null);

  const isResourceLow = (current: number, cap: number): boolean => {
    return current / cap < lowResourceThreshold;
  };

  const handleValueChange = (
    resourceType: ResourceType,
    oldValue: number,
    newValue: number
  ) => {
    if (!enableFloatingText || !containerRef.current) return;

    const diff = newValue - oldValue;
    if (diff === 0) return;

    // Get container position for floating text
    const rect = containerRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    addFloatingText(
      Math.abs(diff).toString(),
      diff > 0 ? 'gain' : 'loss',
      resourceType,
      x,
      y
    );
  };

  return (
    <>
      <section
        ref={containerRef}
        className="flex flex-col gap-2 mobile:gap-3 p-3 mobile:p-4 bg-gray-950/50 rounded-xl border border-gray-800"
        aria-labelledby="resources-heading"
      >
        <div className="flex items-center justify-between mb-1 mobile:mb-2">
          <h3 id="resources-heading" className="text-white font-bold text-base mobile:text-lg">Tài nguyên</h3>
          {showDetails && (
            <span className="text-gray-400 text-xs hidden tablet:inline">Di chuột để xem chi tiết</span>
          )}
        </div>

        <div className="space-y-2" role="list" aria-label="Danh sách tài nguyên">
          <div role="listitem">
            <ResourceItem
              type={ResourceType.FOOD}
              current={resources.food}
              cap={caps.food}
              generationRate={generation.foodPerSecond}
              showDetails={showDetails}
              isLow={isResourceLow(resources.food, caps.food)}
              onValueChange={(oldVal, newVal) =>
                handleValueChange(ResourceType.FOOD, oldVal, newVal)
              }
            />
          </div>

          <div role="listitem">
            <ResourceItem
              type={ResourceType.GOLD}
              current={resources.gold}
              cap={caps.gold}
              generationRate={generation.goldPerSecond}
              showDetails={showDetails}
              isLow={isResourceLow(resources.gold, caps.gold)}
              onValueChange={(oldVal, newVal) =>
                handleValueChange(ResourceType.GOLD, oldVal, newVal)
              }
            />
          </div>

          <div role="listitem">
            <ResourceItem
              type={ResourceType.ARMY}
              current={resources.army}
              cap={caps.army}
              generationRate={generation.armyPerSecond}
              showDetails={showDetails}
              isLow={isResourceLow(resources.army, caps.army)}
              onValueChange={(oldVal, newVal) =>
                handleValueChange(ResourceType.ARMY, oldVal, newVal)
              }
            />
          </div>
        </div>
      </section>

      {/* Floating text overlay */}
      {enableFloatingText && (
        <FloatingText items={items} onComplete={removeFloatingText} />
      )}
    </>
  );
};

export default ResourceDisplay;
