'use client';

/**
 * RankUpAnimation Component
 * Displays a celebration animation when player achieves a new rank
 * 
 * Validates Requirements 18.6 (award rank promotions based on performance)
 * Validates Requirements 18.8 (update displays immediately)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager, SoundEffect } from '@/lib/audio/soundManager';
import { useAnimations } from '@/hooks/useAnimations';

interface RankUpAnimationProps {
  newRank: string;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Get rank color gradient based on rank name
 */
const getRankGradient = (rank: string): string => {
  if (rank.includes('Nguyên Soái')) return 'from-yellow-400 via-orange-400 to-red-500';
  if (rank.includes('Đại Tướng')) return 'from-purple-400 via-pink-400 to-purple-600';
  if (rank.includes('Tướng')) return 'from-blue-400 via-cyan-400 to-blue-600';
  if (rank.includes('Đội Trưởng')) return 'from-green-400 via-emerald-400 to-green-600';
  return 'from-gray-400 via-gray-500 to-gray-600';
};

/**
 * Get rank icon based on rank name
 */
const getRankIcon = (rank: string): string => {
  if (rank.includes('Nguyên Soái')) return '👑';
  if (rank.includes('Đại Tướng')) return '⭐';
  if (rank.includes('Tướng')) return '🎖️';
  if (rank.includes('Đội Trưởng')) return '🛡️';
  return '🎯';
};

export const RankUpAnimation: React.FC<RankUpAnimationProps> = ({
  newRank,
  onComplete,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const shouldAnimate = useAnimations();

  useEffect(() => {
    // Play rank-up sound effect
    soundManager.play(SoundEffect.RANK_UP);

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 500); // Wait for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const gradient = getRankGradient(newRank);
  const icon = getRankIcon(newRank);

  // Simple static display when animations are disabled
  if (!shouldAnimate) {
    return (
      <>
        {isVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
              <div className={`text-6xl mb-4 bg-gradient-to-br ${gradient} rounded-full w-32 h-32 flex items-center justify-center mx-auto`}>
                <span className="text-5xl">{icon}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                THĂNG CẤP BẬC!
              </h2>
              <div className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
                {newRank}
              </div>
              <p className="text-xl text-gray-700">
                Chúc mừng chiến binh!
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Main content */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          >
            {/* Celebration particles - Enhanced with more particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(40)].map((_, i) => {
                const angle = (i / 40) * Math.PI * 2;
                const distance = 150 + Math.random() * 100;
                const xOffset = Math.cos(angle) * distance;
                const yOffset = Math.sin(angle) * distance;
                const colors = ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400', 'bg-purple-400'];
                const color = colors[i % colors.length];
                
                return (
                  <motion.div
                    key={i}
                    className={`absolute w-3 h-3 ${color} rounded-full`}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 1,
                    }}
                    animate={{
                      x: xOffset,
                      y: yOffset,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.02,
                      ease: 'easeOut',
                    }}
                  />
                );
              })}
            </div>

            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => {
                const xStart = Math.random() * 100;
                const rotation = Math.random() * 720 - 360;
                const colors = ['bg-yellow-300', 'bg-blue-300', 'bg-red-300', 'bg-green-300', 'bg-purple-300'];
                const color = colors[i % colors.length];
                
                return (
                  <motion.div
                    key={`confetti-${i}`}
                    className={`absolute w-2 h-4 ${color}`}
                    style={{
                      left: `${xStart}%`,
                      top: '-10%',
                    }}
                    initial={{
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                    }}
                    animate={{
                      y: window.innerHeight + 50,
                      rotate: rotation,
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: i * 0.05,
                      ease: 'linear',
                    }}
                  />
                );
              })}
            </div>

            {/* Rank badge with enhanced glow */}
            <motion.div
              className={`
                relative
                bg-gradient-to-br ${gradient}
                rounded-full
                w-40 h-40
                flex items-center justify-center
                shadow-2xl
                mb-6
              `}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 15,
                delay: 0.2,
              }}
            >
              {/* Multiple glow layers for enhanced effect */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} blur-2xl`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} blur-xl`}
                animate={{
                  scale: [1.1, 1.4, 1.1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />

              {/* Rotating ring effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              />

              {/* Icon with pulse */}
              <motion.span
                className="relative text-7xl z-10"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {icon}
              </motion.span>
            </motion.div>

            {/* Text content with enhanced animations */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h2
                className="text-5xl font-bold text-yellow-400 mb-3 drop-shadow-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 1] }}
                transition={{
                  delay: 0.5,
                  duration: 0.6,
                  times: [0, 0.6, 1],
                }}
              >
                THĂNG CẤP BẬC!
              </motion.h2>

              <motion.div
                className={`
                  text-6xl font-bold
                  bg-gradient-to-r ${gradient}
                  bg-clip-text text-transparent
                  mb-4
                  drop-shadow-2xl
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.1, 1],
                  opacity: 1,
                }}
                transition={{ 
                  delay: 0.7,
                  duration: 0.5,
                }}
              >
                {newRank}
              </motion.div>

              <motion.p
                className="text-2xl text-gray-200 font-semibold drop-shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Chúc mừng chiến binh!
              </motion.p>
            </motion.div>

            {/* Enhanced decorative stars with varied animations */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 200;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={`star-${i}`}
                  className="absolute text-5xl"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ 
                    x: 0,
                    y: 0,
                    scale: 0, 
                    rotate: 0, 
                    opacity: 0 
                  }}
                  animate={{
                    x,
                    y,
                    scale: [0, 1.3, 1],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 1],
                  }}
                  transition={{
                    delay: 0.3 + i * 0.08,
                    duration: 0.8,
                  }}
                >
                  ⭐
                </motion.div>
              );
            })}

            {/* Light rays emanating from center */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * 360;
              
              return (
                <motion.div
                  key={`ray-${i}`}
                  className={`absolute w-1 h-32 bg-gradient-to-t ${gradient} opacity-40`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: 'bottom center',
                    rotate: `${angle}deg`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ 
                    scaleY: [0, 1, 0],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.2 + (i * 0.05),
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankUpAnimation;
