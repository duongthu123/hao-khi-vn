'use client';

/**
 * GachaSystem component
 * Implements probability-based hero acquisition with animations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceType } from '@/types/resource';
import {
  performGachaPull,
  performMultiPull,
  GachaPullResult,
  calculateDuplicateCompensation,
  getRarityColor,
  getRarityNameVietnamese,
} from '@/lib/gacha/gacha';
import { useGameStore } from '@/store';

interface GachaSystemProps {
  onClose?: () => void;
}

type PullState = 'idle' | 'pulling' | 'revealing' | 'complete';

export function GachaSystem({ onClose }: GachaSystemProps) {
  const [pullState, setPullState] = useState<PullState>('idle');
  const [results, setResults] = useState<GachaPullResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const { collection, resources, addHeroToCollection, addResource } = useGameStore();
  const ownedHeroIds = collection.heroes.map((h) => h.id);

  const handleSinglePull = async () => {
    setPullState('pulling');
    
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = performGachaPull({ ownedHeroIds });
    setResults([result]);
    setCurrentResultIndex(0);
    setPullState('revealing');

    // Process result
    processGachaResult(result);
  };

  const handleMultiPull = async () => {
    setPullState('pulling');
    
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const pullResults = performMultiPull(10, { ownedHeroIds });
    setResults(pullResults);
    setCurrentResultIndex(0);
    setPullState('revealing');

    // Process all results
    pullResults.forEach(result => processGachaResult(result));
  };

  const processGachaResult = (result: GachaPullResult) => {
    if (result.isDuplicate) {
      // Convert duplicate to compensation
      const compensation = calculateDuplicateCompensation(result.rarity);
      addResource(ResourceType.GOLD, compensation.gold);
      // Note: Experience would need to be added to profile slice
    } else {
      // Add new hero to collection
      addHeroToCollection(result.hero.id);
    }
  };

  const handleNextResult = () => {
    if (currentResultIndex < results.length - 1) {
      setCurrentResultIndex(prev => prev + 1);
    } else {
      setPullState('complete');
    }
  };

  const handleReset = () => {
    setPullState('idle');
    setResults([]);
    setCurrentResultIndex(0);
  };

  const currentResult = results[currentResultIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl mx-4 bg-gradient-to-b from-blue-900 to-blue-950 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <h2 className="text-3xl font-bold text-center text-yellow-400">
            Triệu Hồi Tướng Lĩnh
          </h2>
          <p className="text-center text-blue-200 mt-2">
            Hero Summoning System
          </p>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[500px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {pullState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-yellow-300">
                    Chọn Phương Thức Triệu Hồi
                  </h3>
                  <p className="text-blue-200">
                    Tỷ lệ rơi: Huyền Thoại 1% | Sử Thi 5% | Hiếm 20% | Thường 74%
                  </p>
                </div>

                <div className="flex gap-6 justify-center">
                  <button
                    onClick={handleSinglePull}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all"
                  >
                    <div className="text-xl">Triệu Hồi x1</div>
                    <div className="text-sm opacity-80">100 Vàng</div>
                  </button>

                  <button
                    onClick={handleMultiPull}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all"
                  >
                    <div className="text-xl">Triệu Hồi x10</div>
                    <div className="text-sm opacity-80">900 Vàng</div>
                  </button>
                </div>

                <div className="text-sm text-blue-300">
                  Vàng hiện có: {resources.gold}
                </div>
              </motion.div>
            )}

            {pullState === 'pulling' && (
              <motion.div
                key="pulling"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: [0.5, 1.2, 1],
                  rotate: [0, 360, 720]
                }}
                transition={{ duration: 1.5 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="text-6xl">🎁</div>
                </div>
                <p className="text-2xl font-bold text-yellow-300 animate-pulse">
                  Đang Triệu Hồi...
                </p>
              </motion.div>
            )}

            {pullState === 'revealing' && currentResult && (
              <motion.div
                key={`result-${currentResultIndex}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center space-y-6 w-full"
              >
                <HeroReveal result={currentResult} />

                <div className="flex gap-4 justify-center">
                  {currentResultIndex < results.length - 1 ? (
                    <button
                      onClick={handleNextResult}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                    >
                      Tiếp Theo ({currentResultIndex + 1}/{results.length})
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
                    >
                      Hoàn Thành
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {pullState === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <h3 className="text-2xl font-bold text-yellow-300">
                  Triệu Hồi Hoàn Tất!
                </h3>
                <p className="text-blue-200">
                  Đã nhận {results.length} tướng lĩnh
                </p>
                <button
                  onClick={handleReset}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                >
                  Triệu Hồi Lại
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-full font-bold"
          >
            ✕
          </button>
        )}
      </motion.div>
    </div>
  );
}

interface HeroRevealProps {
  result: GachaPullResult;
}

function HeroReveal({ result }: HeroRevealProps) {
  const { hero, isDuplicate, rarity } = result;
  const rarityColor = getRarityColor(rarity);
  const rarityName = getRarityNameVietnamese(rarity);

  // Rarity-based animation configurations
  const getRarityAnimation = () => {
    switch (rarity) {
      case 'legendary':
        return {
          initial: { scale: 0, rotate: -360, opacity: 0 },
          animate: { 
            scale: [0, 1.3, 1], 
            rotate: [0, 360, 0],
            opacity: 1
          },
          transition: { 
            type: 'spring' as const, 
            duration: 1.5,
            bounce: 0.5
          }
        };
      case 'epic':
        return {
          initial: { scale: 0, rotate: -180, opacity: 0 },
          animate: { 
            scale: [0, 1.2, 1], 
            rotate: 0,
            opacity: 1
          },
          transition: { 
            type: 'spring' as const, 
            duration: 1.2,
            bounce: 0.4
          }
        };
      case 'rare':
        return {
          initial: { scale: 0, y: -100, opacity: 0 },
          animate: { 
            scale: 1, 
            y: 0,
            opacity: 1
          },
          transition: { 
            type: 'spring' as const, 
            duration: 0.9,
            bounce: 0.3
          }
        };
      default: // common
        return {
          initial: { scale: 0.5, opacity: 0 },
          animate: { 
            scale: 1,
            opacity: 1
          },
          transition: { 
            duration: 0.6
          }
        };
    }
  };

  const rarityAnim = getRarityAnimation();

  return (
    <motion.div
      initial={rarityAnim.initial}
      animate={rarityAnim.animate}
      transition={rarityAnim.transition}
      className="relative"
    >
      {/* Legendary Particle Effects */}
      {rarity === 'legendary' && <LegendaryParticles />}

      {/* Epic Burst Effect */}
      {rarity === 'epic' && <EpicBurstEffect color={rarityColor} />}

      {/* Rare Shimmer Effect */}
      {rarity === 'rare' && <RareShimmerEffect color={rarityColor} />}

      {/* Rarity Glow Effect */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px ${rarityColor}`,
            `0 0 ${rarity === 'legendary' ? '100px' : rarity === 'epic' ? '80px' : '60px'} ${rarityColor}`,
            `0 0 20px ${rarityColor}`,
          ],
        }}
        transition={{ 
          duration: rarity === 'legendary' ? 1.5 : 2, 
          repeat: Infinity 
        }}
        className="absolute inset-0 rounded-lg"
        style={{ backgroundColor: `${rarityColor}20` }}
      />

      {/* Hero Card */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-8 border-4"
        style={{ borderColor: rarityColor }}
      >
        {/* Rarity Badge */}
        <motion.div
          className="absolute top-4 right-4 px-4 py-2 rounded-full font-bold text-white text-sm"
          style={{ backgroundColor: rarityColor }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
        >
          {rarityName}
        </motion.div>

        {/* New Hero Badge */}
        {!isDuplicate && (
          <motion.div 
            className="absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-lg"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: 0
            }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.7 }}
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 5px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 5px rgba(255,255,255,0.5)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              MỚI!
            </motion.span>
          </motion.div>
        )}

        {/* Duplicate Badge */}
        {isDuplicate && (
          <motion.div 
            className="absolute top-4 left-4 px-4 py-2 rounded-full bg-red-600 text-white font-bold text-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            Trùng Lặp
          </motion.div>
        )}

        {/* Hero Portrait */}
        <motion.div 
          className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 relative"
          style={{ borderColor: rarityColor }}
          animate={
            rarity === 'legendary' 
              ? { 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }
              : rarity === 'epic'
              ? {
                  scale: [1, 1.03, 1]
                }
              : {}
          }
          transition={{
            duration: rarity === 'legendary' ? 2 : 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Inner glow for legendary */}
          {rarity === 'legendary' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-orange-500/30"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl relative z-10">
            👤
          </div>
        </motion.div>

        {/* Hero Info */}
        <motion.h3 
          className="text-3xl font-bold text-yellow-300 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {hero.nameVietnamese}
        </motion.h3>
        <motion.p 
          className="text-xl text-blue-200 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {hero.name}
        </motion.p>
        <motion.p 
          className="text-gray-300 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {hero.descriptionVietnamese}
        </motion.p>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-5 gap-4 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <StatDisplay label="Tấn Công" value={hero.stats.attack} />
          <StatDisplay label="Phòng Thủ" value={hero.stats.defense} />
          <StatDisplay label="Tốc Độ" value={hero.stats.speed} />
          <StatDisplay label="Lãnh Đạo" value={hero.stats.leadership} />
          <StatDisplay label="Trí Tuệ" value={hero.stats.intelligence} />
        </motion.div>

        {/* Duplicate Compensation */}
        {isDuplicate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-yellow-900/50 rounded-lg border border-yellow-600"
          >
            <p className="text-yellow-300 font-bold mb-2">Bồi Thường Trùng Lặp:</p>
            <div className="flex gap-4 justify-center text-white">
              <span>+{calculateDuplicateCompensation(rarity).gold} Vàng</span>
              <span>+{calculateDuplicateCompensation(rarity).experience} Kinh Nghiệm</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Legendary Particle Effects
 * Creates floating golden particles for legendary heroes
 */
function LegendaryParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Epic Burst Effect
 * Creates radiating burst lines for epic heroes
 */
function EpicBurstEffect({ color }: { color: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    rotation: (i * 360) / 12,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            width: '50%',
            height: '4px',
            background: `linear-gradient(to right, ${color}, transparent)`,
            transform: `rotate(${ray.rotation}deg)`,
          }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: ray.id * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Rare Shimmer Effect
 * Creates shimmering light waves for rare heroes
 */
function RareShimmerEffect({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, transparent 30%, ${color}40 50%, transparent 70%)`,
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(-45deg, transparent 30%, ${color}30 50%, transparent 70%)`,
        }}
        animate={{
          x: ['200%', '-100%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

interface StatDisplayProps {
  label: string;
  value: number;
}

function StatDisplay({ label, value }: StatDisplayProps) {
  return (
    <div>
      <div className="text-2xl font-bold text-yellow-400">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
