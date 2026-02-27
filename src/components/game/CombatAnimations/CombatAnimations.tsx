'use client';

/**
 * CombatAnimations Component
 * Handles visual animations for combat events including attacks, damage numbers, deaths, and abilities
 * 
 * Validates Requirements:
 * - 6.2: Combat interaction animations
 * - 6.3: Damage effect animations
 * - 6.7: 60 FPS performance
 * - 13.5: Combat animations and effects
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CombatEvent, CombatEventType } from '@/types/combat';
import { Vector2 } from '@/types/unit';
import { useAnimations } from '@/hooks/useAnimations';

/**
 * Animation event for rendering
 */
interface AnimationEvent {
  id: string;
  type: 'attack' | 'damage' | 'death' | 'ability' | 'heal';
  position: Vector2;
  value?: number;
  timestamp: number;
  data?: Record<string, any>;
}

export interface CombatAnimationsProps {
  /** Combat events to animate */
  events: CombatEvent[];
  /** Callback when animation completes */
  onAnimationComplete?: (eventId: string) => void;
  /** Enable/disable animations */
  enabled?: boolean;
  /** Scale factor for positioning (map zoom) */
  scale?: number;
  /** Offset for positioning (map pan) */
  offset?: Vector2;
}

/**
 * Convert combat event to animation event
 */
const convertToAnimationEvent = (event: CombatEvent): AnimationEvent | null => {
  if (!event.position) return null;

  const id = `${event.type}-${event.timestamp}-${Math.random()}`;

  switch (event.type) {
    case CombatEventType.ATTACK:
      return {
        id,
        type: 'attack',
        position: event.position,
        timestamp: event.timestamp,
        data: event.data,
      };

    case CombatEventType.DAMAGE:
      return {
        id,
        type: 'damage',
        position: event.position,
        value: event.value,
        timestamp: event.timestamp,
        data: event.data,
      };

    case CombatEventType.HEAL:
      return {
        id,
        type: 'heal',
        position: event.position,
        value: event.value,
        timestamp: event.timestamp,
      };

    case CombatEventType.DEATH:
      return {
        id,
        type: 'death',
        position: event.position,
        timestamp: event.timestamp,
      };

    case CombatEventType.ABILITY_USED:
      return {
        id,
        type: 'ability',
        position: event.position,
        timestamp: event.timestamp,
        data: event.data,
      };

    default:
      return null;
  }
};

/**
 * Attack flash animation component
 */
const AttackFlash: React.FC<{ position: Vector2; isCritical?: boolean; onComplete: () => void }> = ({
  position,
  isCritical,
  onComplete,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <div
        className={`w-16 h-16 rounded-full ${
          isCritical ? 'bg-red-500' : 'bg-orange-400'
        } blur-xl`}
      />
    </motion.div>
  );
};

/**
 * Damage number animation component
 */
const DamageNumber: React.FC<{
  position: Vector2;
  value: number;
  isCritical?: boolean;
  isHeal?: boolean;
  onComplete: () => void;
}> = ({ position, value, isCritical, isHeal, onComplete }) => {
  return (
    <motion.div
      className="absolute pointer-events-none font-bold z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
      initial={{ y: 0, opacity: 1, scale: isCritical ? 1.5 : 1 }}
      animate={{
        y: -50,
        opacity: 0,
        scale: isCritical ? 1.8 : 1.2,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
    >
      <div
        className={`
          ${isHeal ? 'text-green-400' : isCritical ? 'text-red-500' : 'text-orange-400'}
          ${isCritical ? 'text-3xl' : 'text-2xl'}
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
          font-extrabold
        `}
        style={{
          textShadow: isHeal
            ? '0 0 10px rgba(34, 197, 94, 0.8)'
            : isCritical
            ? '0 0 10px rgba(239, 68, 68, 0.8)'
            : '0 0 10px rgba(251, 146, 60, 0.8)',
        }}
      >
        {isHeal ? '+' : '-'}
        {value}
        {isCritical && '!'}
      </div>
    </motion.div>
  );
};

/**
 * Death animation component
 */
const DeathAnimation: React.FC<{ position: Vector2; onComplete: () => void }> = ({
  position,
  onComplete,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 1, opacity: 1, rotate: 0 }}
      animate={{
        scale: 0,
        opacity: 0,
        rotate: 180,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      onAnimationComplete={onComplete}
    >
      {/* Skull icon or death marker */}
      <div className="relative">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl">
          💀
        </div>
        {/* Expanding ring effect */}
        <motion.div
          className="absolute inset-0 border-4 border-red-500 rounded-full"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
};

/**
 * Ability effect animation component
 */
const AbilityEffect: React.FC<{
  position: Vector2;
  abilityName?: string;
  onComplete: () => void;
}> = ({ position, abilityName, onComplete }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1.5, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
    >
      {/* Ability visual effect */}
      <div className="relative">
        {/* Central burst */}
        <div className="w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-80" />
        
        {/* Expanding rings */}
        <motion.div
          className="absolute inset-0 border-4 border-purple-400 rounded-full"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-purple-300 rounded-full"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        {/* Ability name */}
        {abilityName && (
          <motion.div
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-purple-300 font-bold text-sm drop-shadow-lg">
              {abilityName}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Main combat animations component
 */
export const CombatAnimations: React.FC<CombatAnimationsProps> = ({
  events,
  onAnimationComplete,
  enabled = true,
  scale = 1,
  offset = { x: 0, y: 0 },
}) => {
  const [activeAnimations, setActiveAnimations] = useState<AnimationEvent[]>([]);
  const shouldAnimate = useAnimations();

  // Respect user's motion preferences and settings
  const animationsEnabled = enabled && shouldAnimate;

  // Convert combat events to animation events
  useEffect(() => {
    if (!animationsEnabled) return;

    const newAnimations = events
      .map(convertToAnimationEvent)
      .filter((anim): anim is AnimationEvent => anim !== null);

    if (newAnimations.length > 0) {
      setActiveAnimations((prev) => [...prev, ...newAnimations]);
    }
  }, [events, animationsEnabled]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(
    (animationId: string) => {
      setActiveAnimations((prev) => prev.filter((anim) => anim.id !== animationId));
      onAnimationComplete?.(animationId);
    },
    [onAnimationComplete]
  );

  // Transform position based on scale and offset
  const transformPosition = useCallback(
    (position: Vector2): Vector2 => {
      return {
        x: position.x * scale + offset.x,
        y: position.y * scale + offset.y,
      };
    },
    [scale, offset]
  );

  // Don't render if animations are disabled
  if (!animationsEnabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="sync">
        {activeAnimations.map((animation) => {
          const position = transformPosition(animation.position);

          switch (animation.type) {
            case 'attack':
              return (
                <AttackFlash
                  key={animation.id}
                  position={position}
                  isCritical={animation.data?.isCritical}
                  onComplete={() => handleAnimationComplete(animation.id)}
                />
              );

            case 'damage':
              return (
                <DamageNumber
                  key={animation.id}
                  position={position}
                  value={animation.value || 0}
                  isCritical={animation.data?.isCritical}
                  onComplete={() => handleAnimationComplete(animation.id)}
                />
              );

            case 'heal':
              return (
                <DamageNumber
                  key={animation.id}
                  position={position}
                  value={animation.value || 0}
                  isHeal={true}
                  onComplete={() => handleAnimationComplete(animation.id)}
                />
              );

            case 'death':
              return (
                <DeathAnimation
                  key={animation.id}
                  position={position}
                  onComplete={() => handleAnimationComplete(animation.id)}
                />
              );

            case 'ability':
              return (
                <AbilityEffect
                  key={animation.id}
                  position={position}
                  abilityName={animation.data?.abilityName}
                  onComplete={() => handleAnimationComplete(animation.id)}
                />
              );

            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
};

export default CombatAnimations;
